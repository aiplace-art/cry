-- HypeAI Unified Database Schema
-- PostgreSQL 14+
-- This is the single source of truth for all AI agents

-- ============================================================
-- PRIVATE SALE TABLES
-- ============================================================

-- Sale Configuration (single active record)
CREATE TABLE IF NOT EXISTS private_sale_config (
  id SERIAL PRIMARY KEY,
  total_tokens BIGINT NOT NULL DEFAULT 300000000, -- 300M tokens for presale
  tokens_sold BIGINT NOT NULL DEFAULT 0,
  token_price_usd DECIMAL(10, 8) NOT NULL DEFAULT 0.0015,
  min_purchase_usd DECIMAL(10, 2) NOT NULL DEFAULT 10,
  max_purchase_usd DECIMAL(10, 2) NOT NULL DEFAULT 500,
  max_purchase_per_wallet_usd DECIMAL(10, 2) NOT NULL DEFAULT 500,
  initial_unlock_percentage INTEGER NOT NULL DEFAULT 40, -- 40% immediate
  vesting_months INTEGER NOT NULL DEFAULT 6, -- 6 months vesting
  sale_start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  sale_end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Records
CREATE TABLE IF NOT EXISTS private_sale_purchases (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  email VARCHAR(255),
  payment_method VARCHAR(20) NOT NULL, -- 'BNB', 'USDT', 'USDC', 'ETH'
  payment_id VARCHAR(255),
  amount_usd DECIMAL(10, 2) NOT NULL,
  tokens_purchased BIGINT NOT NULL,
  bonus_tokens BIGINT NOT NULL DEFAULT 0,
  total_tokens BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, refunded
  tx_hash VARCHAR(66),
  referral_code VARCHAR(50),
  vesting_start_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_wallet ON private_sale_purchases(wallet_address);
CREATE INDEX idx_purchases_status ON private_sale_purchases(status);
CREATE INDEX idx_purchases_referral ON private_sale_purchases(referral_code);

-- Wallet Limits (Anti-Whale Protection)
CREATE TABLE IF NOT EXISTS private_sale_wallet_limits (
  wallet_address VARCHAR(42) PRIMARY KEY,
  total_purchased_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  custom_limit_usd DECIMAL(10, 2), -- Custom limit if different from default
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  is_whitelisted BOOLEAN NOT NULL DEFAULT false,
  first_purchase_at TIMESTAMP,
  last_purchase_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral System
CREATE TABLE IF NOT EXISTS private_sale_referrals (
  id SERIAL PRIMARY KEY,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  referrer_wallet VARCHAR(42) NOT NULL,
  referred_wallet VARCHAR(42) NOT NULL,
  bonus_percentage INTEGER NOT NULL DEFAULT 10,
  bonus_tokens BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referrals_code ON private_sale_referrals(referral_code);
CREATE INDEX idx_referrals_referrer ON private_sale_referrals(referrer_wallet);

-- Token Claims (Vesting)
CREATE TABLE IF NOT EXISTS private_sale_claims (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER NOT NULL REFERENCES private_sale_purchases(id),
  tokens_claimed BIGINT NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_claims_purchase ON private_sale_claims(purchase_id);

-- ============================================================
-- PROJECT COORDINATION TABLES
-- ============================================================

-- Project Master State
CREATE TABLE IF NOT EXISTS project_state (
  id SERIAL PRIMARY KEY,
  launch_date TIMESTAMP NOT NULL DEFAULT '2025-11-15T00:00:00.000Z',
  telegram_members INTEGER NOT NULL DEFAULT 0,
  twitter_followers INTEGER NOT NULL DEFAULT 0,
  website_visits INTEGER NOT NULL DEFAULT 0,
  token_holders INTEGER NOT NULL DEFAULT 0,
  total_value_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id SERIAL PRIMARY KEY,
  milestone_key VARCHAR(50) UNIQUE NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  is_reached BOOLEAN NOT NULL DEFAULT false,
  reached_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Alerts
CREATE TABLE IF NOT EXISTS project_alerts (
  id BIGSERIAL PRIMARY KEY,
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'critical'
  message TEXT NOT NULL,
  data JSONB,
  source VARCHAR(100), -- Which agent created this alert
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_severity ON project_alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON project_alerts(is_acknowledged);

-- ============================================================
-- AGENT COORDINATION TABLES
-- ============================================================

-- Active Agents Registry
CREATE TABLE IF NOT EXISTS active_agents (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(100) UNIQUE NOT NULL,
  agent_type VARCHAR(50) NOT NULL, -- 'tokenomics', 'marketing', 'social', etc.
  pid INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'running', -- running, stopped, error
  last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  config JSONB
);

-- Agent Activity Log
CREATE TABLE IF NOT EXISTS agent_activity (
  id BIGSERIAL PRIMARY KEY,
  agent_name VARCHAR(100) NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- 'task_completed', 'error', 'sync', etc.
  description TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_agent ON agent_activity(agent_name);
CREATE INDEX idx_activity_type ON agent_activity(activity_type);

-- Inter-Agent Messages
CREATE TABLE IF NOT EXISTS agent_messages (
  id BIGSERIAL PRIMARY KEY,
  from_agent VARCHAR(100) NOT NULL,
  to_agent VARCHAR(100), -- NULL means broadcast to all
  message_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_to ON agent_messages(to_agent, is_read);

-- ============================================================
-- TOKENOMICS TABLES
-- ============================================================

-- Token Distribution State
CREATE TABLE IF NOT EXISTS tokenomics_distribution (
  id SERIAL PRIMARY KEY,
  allocation_name VARCHAR(50) UNIQUE NOT NULL, -- 'presale', 'liquidity', 'staking', etc.
  total_allocated BIGINT NOT NULL,
  distributed BIGINT NOT NULL DEFAULT 0,
  locked BIGINT NOT NULL DEFAULT 0,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Distribution Flows (History)
CREATE TABLE IF NOT EXISTS distribution_flows (
  id BIGSERIAL PRIMARY KEY,
  allocation_name VARCHAR(50) NOT NULL,
  flow_type VARCHAR(20) NOT NULL, -- 'lock', 'unlock', 'distribute', 'burn'
  amount BIGINT NOT NULL,
  recipient VARCHAR(42), -- Wallet address if applicable
  tx_hash VARCHAR(66),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_flows_allocation ON distribution_flows(allocation_name);

-- Validation Alerts (for tokenomics validator)
CREATE TABLE IF NOT EXISTS validation_alerts (
  id BIGSERIAL PRIMARY KEY,
  severity VARCHAR(20) NOT NULL,
  rule_name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SOCIAL MEDIA TABLES
-- ============================================================

-- Twitter Data
CREATE TABLE IF NOT EXISTS twitter_metrics (
  id BIGSERIAL PRIMARY KEY,
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  tweets_count INTEGER NOT NULL DEFAULT 0,
  engagement_rate DECIMAL(5, 2),
  impressions INTEGER,
  profile_visits INTEGER,
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Twitter Posting History
CREATE TABLE IF NOT EXISTS twitter_posts (
  id BIGSERIAL PRIMARY KEY,
  tweet_id VARCHAR(50) UNIQUE,
  content TEXT NOT NULL,
  category VARCHAR(50), -- 'education', 'announcement', 'engagement', etc.
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Telegram Metrics
CREATE TABLE IF NOT EXISTS telegram_metrics (
  id BIGSERIAL PRIMARY KEY,
  members_count INTEGER NOT NULL DEFAULT 0,
  active_members INTEGER,
  messages_count INTEGER,
  engagement_rate DECIMAL(5, 2),
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- FINANCIAL REPORTING TABLES
-- ============================================================

-- Financial Reports
CREATE TABLE IF NOT EXISTS financial_reports (
  id BIGSERIAL PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  total_supply BIGINT NOT NULL,
  circulating_supply BIGINT NOT NULL,
  locked_tokens BIGINT NOT NULL,
  burned_tokens BIGINT NOT NULL,
  market_cap_usd DECIMAL(20, 2),
  total_revenue_usd DECIMAL(20, 2),
  total_expenses_usd DECIMAL(20, 2),
  report_data JSONB,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ANALYTICS TABLES
-- ============================================================

-- Growth Metrics
CREATE TABLE IF NOT EXISTS growth_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(20, 2) NOT NULL,
  metric_type VARCHAR(50), -- 'count', 'percentage', 'usd', etc.
  source VARCHAR(100), -- Which agent or system provided this
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metrics_name ON growth_metrics(metric_name);
CREATE INDEX idx_metrics_recorded ON growth_metrics(recorded_at DESC);

-- Marketing Insights
CREATE TABLE IF NOT EXISTS marketing_insights (
  id BIGSERIAL PRIMARY KEY,
  insight_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  impact_score INTEGER, -- 1-10
  data JSONB,
  is_actioned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INITIAL DATA
-- ============================================================

-- Insert default sale config
INSERT INTO private_sale_config (
  total_tokens,
  token_price_usd,
  min_purchase_usd,
  max_purchase_usd,
  max_purchase_per_wallet_usd,
  initial_unlock_percentage,
  vesting_months,
  sale_end_date
) VALUES (
  300000000,
  0.0015,
  10,
  500,
  500,
  40,
  6,
  '2025-11-15T00:00:00.000Z'
) ON CONFLICT DO NOTHING;

-- Insert project state
INSERT INTO project_state (
  launch_date,
  telegram_members,
  twitter_followers,
  website_visits,
  token_holders,
  total_value_usd
) VALUES (
  '2025-11-15T00:00:00.000Z',
  0,
  0,
  0,
  0,
  0
) ON CONFLICT DO NOTHING;

-- Insert milestones
INSERT INTO project_milestones (milestone_key, target_value) VALUES
  ('100_members', 100),
  ('500_members', 500),
  ('1000_members', 1000),
  ('launch_ready', 1)
ON CONFLICT (milestone_key) DO NOTHING;

-- Insert tokenomics allocations
INSERT INTO tokenomics_distribution (allocation_name, total_allocated, locked) VALUES
  ('presale', 300000000, 300000000),
  ('liquidity', 200000000, 200000000),
  ('staking', 250000000, 250000000),
  ('team', 100000000, 100000000),
  ('marketing', 100000000, 100000000),
  ('treasury', 50000000, 50000000)
ON CONFLICT (allocation_name) DO NOTHING;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_private_sale_config_updated_at BEFORE UPDATE ON private_sale_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_sale_purchases_updated_at BEFORE UPDATE ON private_sale_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_limits_updated_at BEFORE UPDATE ON private_sale_wallet_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
