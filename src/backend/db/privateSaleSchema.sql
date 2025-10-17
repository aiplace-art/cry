-- Private Sale Database Schema

-- Main purchases table
CREATE TABLE IF NOT EXISTS private_sale_purchases (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL,
    payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('ETH', 'USDT', 'USDC', 'BTC', 'CARD')),
    amount_usd DECIMAL(12,2) NOT NULL,
    tokens_purchased BIGINT NOT NULL,
    bonus_tokens BIGINT NOT NULL DEFAULT 0,
    total_tokens BIGINT NOT NULL,
    tx_hash VARCHAR(66),
    payment_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    referral_code VARCHAR(10),
    vesting_start_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Claims table for tracking token claims
CREATE TABLE IF NOT EXISTS private_sale_claims (
    id SERIAL PRIMARY KEY,
    purchase_id INT NOT NULL REFERENCES private_sale_purchases(id) ON DELETE CASCADE,
    tokens_claimed BIGINT NOT NULL,
    tx_hash VARCHAR(66),
    claimed_at TIMESTAMP DEFAULT NOW()
);

-- Referrals table for tracking referral bonuses
CREATE TABLE IF NOT EXISTS private_sale_referrals (
    id SERIAL PRIMARY KEY,
    referral_code VARCHAR(10) UNIQUE NOT NULL,
    referrer_wallet VARCHAR(42) NOT NULL,
    referred_wallet VARCHAR(42) NOT NULL,
    bonus_tokens BIGINT NOT NULL,
    bonus_percentage INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sale configuration table
CREATE TABLE IF NOT EXISTS private_sale_config (
    id SERIAL PRIMARY KEY,
    total_tokens BIGINT NOT NULL,
    tokens_sold BIGINT DEFAULT 0,
    token_price_usd DECIMAL(10,6) NOT NULL,
    min_purchase_usd DECIMAL(10,2) DEFAULT 100,
    max_purchase_usd DECIMAL(12,2) DEFAULT 100000,
    max_purchase_per_wallet_usd DECIMAL(10,2) DEFAULT 500,
    sale_start_date TIMESTAMP NOT NULL,
    sale_end_date TIMESTAMP NOT NULL,
    vesting_months INT DEFAULT 12,
    initial_unlock_percentage INT DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet purchase limits tracking (anti-whale protection)
CREATE TABLE IF NOT EXISTS private_sale_wallet_limits (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    total_purchased_usd DECIMAL(12,2) DEFAULT 0,
    purchase_count INT DEFAULT 0,
    first_purchase_at TIMESTAMP,
    last_purchase_at TIMESTAMP,
    is_whitelisted BOOLEAN DEFAULT false,
    is_blacklisted BOOLEAN DEFAULT false,
    custom_limit_usd DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment transactions log
CREATE TABLE IF NOT EXISTS private_sale_payments (
    id SERIAL PRIMARY KEY,
    purchase_id INT REFERENCES private_sale_purchases(id) ON DELETE SET NULL,
    payment_gateway VARCHAR(20) NOT NULL,
    payment_id VARCHAR(100) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    amount_crypto DECIMAL(20,8),
    amount_usd DECIMAL(12,2),
    crypto_currency VARCHAR(10),
    payment_address VARCHAR(100),
    confirmation_count INT DEFAULT 0,
    webhook_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_purchases_wallet ON private_sale_purchases(wallet_address);
CREATE INDEX idx_purchases_status ON private_sale_purchases(status);
CREATE INDEX idx_purchases_referral ON private_sale_purchases(referral_code);
CREATE INDEX idx_claims_purchase ON private_sale_claims(purchase_id);
CREATE INDEX idx_referrals_code ON private_sale_referrals(referral_code);
CREATE INDEX idx_referrals_referrer ON private_sale_referrals(referrer_wallet);
CREATE INDEX idx_payments_purchase ON private_sale_payments(purchase_id);
CREATE INDEX idx_payments_gateway ON private_sale_payments(payment_gateway);
CREATE INDEX idx_wallet_limits_address ON private_sale_wallet_limits(wallet_address);
CREATE INDEX idx_wallet_limits_blacklist ON private_sale_wallet_limits(is_blacklisted);

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_private_sale_purchases_updated_at BEFORE UPDATE
    ON private_sale_purchases FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_sale_config_updated_at BEFORE UPDATE
    ON private_sale_config FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_sale_payments_updated_at BEFORE UPDATE
    ON private_sale_payments FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_sale_wallet_limits_updated_at BEFORE UPDATE
    ON private_sale_wallet_limits FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default configuration
INSERT INTO private_sale_config (
    total_tokens,
    token_price_usd,
    min_purchase_usd,
    max_purchase_usd,
    max_purchase_per_wallet_usd,
    sale_start_date,
    sale_end_date,
    vesting_months,
    initial_unlock_percentage
) VALUES (
    1000000000000, -- 1 trillion tokens
    0.0001, -- $0.0001 per token
    100, -- min $100
    100000, -- max $100,000
    500, -- max $500 per wallet (anti-whale)
    NOW(),
    NOW() + INTERVAL '30 days',
    12, -- 12 months vesting
    10 -- 10% initial unlock
) ON CONFLICT DO NOTHING;

-- Function to get total purchases for a wallet (completed purchases only)
CREATE OR REPLACE FUNCTION get_wallet_total_purchases(wallet_addr VARCHAR(42))
RETURNS DECIMAL(12,2) AS $$
DECLARE
    total DECIMAL(12,2);
BEGIN
    SELECT COALESCE(SUM(amount_usd), 0)
    INTO total
    FROM private_sale_purchases
    WHERE wallet_address = LOWER(wallet_addr)
    AND status IN ('completed', 'processing');

    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to check if wallet can purchase amount
CREATE OR REPLACE FUNCTION can_wallet_purchase(
    wallet_addr VARCHAR(42),
    purchase_amount DECIMAL(12,2)
)
RETURNS BOOLEAN AS $$
DECLARE
    total_purchased DECIMAL(12,2);
    wallet_limit DECIMAL(12,2);
    is_blacklisted BOOLEAN;
    custom_limit DECIMAL(12,2);
BEGIN
    -- Check blacklist
    SELECT wl.is_blacklisted, wl.custom_limit_usd
    INTO is_blacklisted, custom_limit
    FROM private_sale_wallet_limits wl
    WHERE wl.wallet_address = LOWER(wallet_addr);

    IF is_blacklisted = true THEN
        RETURN false;
    END IF;

    -- Get total purchases
    total_purchased := get_wallet_total_purchases(wallet_addr);

    -- Determine limit (custom or default)
    IF custom_limit IS NOT NULL AND custom_limit > 0 THEN
        wallet_limit := custom_limit;
    ELSE
        SELECT max_purchase_per_wallet_usd INTO wallet_limit
        FROM private_sale_config
        WHERE is_active = true
        LIMIT 1;
    END IF;

    -- Check if new purchase would exceed limit
    RETURN (total_purchased + purchase_amount) <= wallet_limit;
END;
$$ LANGUAGE plpgsql;
