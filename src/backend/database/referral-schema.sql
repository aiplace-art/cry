-- HypeAI Referral System Database Schema
-- Complete structure for referral rewards, tracking, and analytics

-- Users table (extended for referral system)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255), -- for Web2 auth (Russia)
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referrer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    kyc_status VARCHAR(20) DEFAULT 'not_started',
    total_earnings DECIMAL(20, 8) DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    CONSTRAINT valid_wallet CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Referral relationships (denormalized for performance)
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_purchase_at TIMESTAMP WITH TIME ZONE,
    total_purchases_count INTEGER DEFAULT 0,
    total_purchases_amount DECIMAL(20, 8) DEFAULT 0,
    total_rewards_earned DECIMAL(20, 8) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(referrer_id, referred_id)
);

-- Purchases (token sales tracking)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    amount_usd DECIMAL(20, 8) NOT NULL,
    amount_tokens DECIMAL(20, 8) NOT NULL,
    token_price DECIMAL(20, 8) NOT NULL,
    referrer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_bonus_percent DECIMAL(5, 2),
    status VARCHAR(20) DEFAULT 'pending',
    blockchain VARCHAR(20) DEFAULT 'ethereum',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    block_number BIGINT,
    CONSTRAINT valid_tx_hash CHECK (tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
    CONSTRAINT positive_amounts CHECK (
        amount_usd > 0 AND
        amount_tokens > 0 AND
        token_price > 0
    )
);

-- Referral rewards (detailed tracking)
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    reward_type VARCHAR(20) NOT NULL, -- 'tokens', 'usdt', 'bonus'
    amount DECIMAL(20, 8) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, claimed, expired
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    claimed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    tx_hash VARCHAR(66), -- claim transaction
    CONSTRAINT positive_reward CHECK (amount > 0 AND percentage > 0)
);

-- Reward claims history
CREATE TABLE IF NOT EXISTS reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(20) NOT NULL,
    total_amount DECIMAL(20, 8) NOT NULL,
    reward_ids UUID[] NOT NULL,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT positive_claim_amount CHECK (total_amount > 0)
);

-- User sessions (JWT tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Web3 authentication nonces
CREATE TABLE IF NOT EXISTS auth_nonces (
    wallet_address VARCHAR(42) PRIMARY KEY,
    nonce VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT valid_wallet CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Analytics and leaderboard (materialized view for performance)
CREATE MATERIALIZED VIEW referral_leaderboard AS
SELECT
    u.id,
    u.wallet_address,
    u.email,
    u.referral_code,
    u.total_referrals,
    u.total_earnings,
    COUNT(DISTINCT r.referred_id) as active_referrals,
    COALESCE(SUM(p.amount_usd), 0) as total_sales_volume,
    COALESCE(SUM(rr.amount), 0) as total_rewards,
    RANK() OVER (ORDER BY u.total_earnings DESC) as ranking
FROM users u
LEFT JOIN referrals r ON u.id = r.referrer_id
LEFT JOIN purchases p ON r.referred_id = p.user_id
LEFT JOIN referral_rewards rr ON u.id = rr.referrer_id
WHERE u.is_active = true
GROUP BY u.id, u.wallet_address, u.email, u.referral_code, u.total_referrals, u.total_earnings;

-- Indexes for performance
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referrer ON users(referrer_id);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_referrer ON purchases(referrer_id);
CREATE INDEX idx_purchases_tx_hash ON purchases(tx_hash);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_created ON purchases(created_at DESC);

CREATE INDEX idx_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX idx_rewards_referred ON referral_rewards(referred_id);
CREATE INDEX idx_rewards_purchase ON referral_rewards(purchase_id);
CREATE INDEX idx_rewards_status ON referral_rewards(status);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Trigger to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update referrer's total referrals
        UPDATE users
        SET total_referrals = total_referrals + 1
        WHERE id = NEW.referrer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referral_stats
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

-- Trigger to update earnings
CREATE OR REPLACE FUNCTION update_referral_earnings()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status = 'claimed' AND OLD.status = 'pending' THEN
        UPDATE users
        SET total_earnings = total_earnings + NEW.amount
        WHERE id = NEW.referrer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_earnings
AFTER UPDATE ON referral_rewards
FOR EACH ROW
EXECUTE FUNCTION update_referral_earnings();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    code VARCHAR(20);
    exists BOOLEAN := true;
BEGIN
    WHILE exists LOOP
        code := 'HYPE' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate referral rewards
CREATE OR REPLACE FUNCTION calculate_referral_reward(
    purchase_amount DECIMAL,
    referral_tier INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
    reward_percent DECIMAL(5, 2);
BEGIN
    -- Tier-based reward system
    CASE referral_tier
        WHEN 1 THEN reward_percent := 10.00; -- Direct referrals: 10%
        WHEN 2 THEN reward_percent := 5.00;  -- Second level: 5%
        WHEN 3 THEN reward_percent := 2.50;  -- Third level: 2.5%
        ELSE reward_percent := 0.00;
    END CASE;

    RETURN (purchase_amount * reward_percent / 100);
END;
$$ LANGUAGE plpgsql;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW referral_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with referral tracking';
COMMENT ON TABLE referrals IS 'Referral relationships and performance metrics';
COMMENT ON TABLE purchases IS 'Token purchases with referral attribution';
COMMENT ON TABLE referral_rewards IS 'Detailed reward tracking per purchase';
COMMENT ON TABLE reward_claims IS 'Batch reward claims history';
COMMENT ON TABLE user_sessions IS 'JWT session management';
COMMENT ON TABLE auth_nonces IS 'Web3 authentication nonces';

COMMENT ON COLUMN users.referral_code IS 'Unique referral code for user';
COMMENT ON COLUMN users.total_earnings IS 'Total rewards earned from referrals';
COMMENT ON COLUMN purchases.referrer_id IS 'User who referred this purchase';
COMMENT ON COLUMN referral_rewards.reward_type IS 'Type of reward: tokens, usdt, bonus';
