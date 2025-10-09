-- PostgreSQL initialization script

-- Create tables for analytics
CREATE TABLE IF NOT EXISTS user_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    total_staked DECIMAL(30, 18) DEFAULT 0,
    total_earned DECIMAL(30, 18) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staking_analytics (
    id SERIAL PRIMARY KEY,
    tier INTEGER NOT NULL,
    total_staked DECIMAL(30, 18) DEFAULT 0,
    total_stakers INTEGER DEFAULT 0,
    avg_stake_amount DECIMAL(30, 18) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    price DECIMAL(30, 18) NOT NULL,
    volume_24h DECIMAL(30, 18),
    market_cap DECIMAL(30, 18),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_user_analytics_wallet ON user_analytics(wallet_address);
CREATE INDEX idx_staking_analytics_tier ON staking_analytics(tier);
CREATE INDEX idx_price_history_symbol ON price_history(symbol);
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_user_analytics_updated_at
    BEFORE UPDATE ON user_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staking_analytics_updated_at
    BEFORE UPDATE ON staking_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
