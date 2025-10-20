-- HypeAI Enterprise Services Database Schema
-- Version: 1.0.0
-- Purpose: Store and manage B2B enterprise service offerings, clients, and engagements

-- ============================================================================
-- SERVICE CATALOG TABLES
-- ============================================================================

-- Service Categories (Business Audit, Market Research, Strategic Consulting, Ongoing Support)
CREATE TABLE service_categories (
    category_id VARCHAR(10) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    target_clients JSONB, -- Array of target client types
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual Services
CREATE TABLE services (
    service_id VARCHAR(20) PRIMARY KEY,
    category_id VARCHAR(10) REFERENCES service_categories(category_id),
    service_name VARCHAR(200) NOT NULL,
    tagline VARCHAR(300),
    description TEXT,

    -- Scope and deliverables
    scope_of_work JSONB, -- Structured scope phases and activities
    deliverables JSONB, -- Array of deliverable objects

    -- Timeline
    typical_duration_weeks INTEGER,
    timeline_phases JSONB, -- Breakdown by phase

    -- Pricing
    base_price_usd DECIMAL(12,2),
    price_range_min DECIMAL(12,2),
    price_range_typical DECIMAL(12,2),
    price_range_max DECIMAL(12,2),
    pricing_model VARCHAR(50), -- 'project_based', 'retainer', 'time_materials'
    pricing_factors JSONB, -- Array of factors affecting price

    -- Team composition
    team_composition JSONB, -- AI agents and human roles

    -- Success metrics
    success_metrics JSONB,

    -- Service attributes
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    specialty_regions JSONB, -- Geographic specializations
    industries_served JSONB, -- Target industries

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Tiers (for ongoing/subscription services)
CREATE TABLE service_tiers (
    tier_id SERIAL PRIMARY KEY,
    service_id VARCHAR(20) REFERENCES services(service_id),
    tier_name VARCHAR(50), -- 'essential', 'professional', 'premier'
    tier_level INTEGER, -- 1, 2, 3 for ordering

    -- Pricing
    monthly_fee DECIMAL(10,2),
    quarterly_fee DECIMAL(10,2),
    annual_fee DECIMAL(10,2),
    included_hours INTEGER,
    additional_hour_rate DECIMAL(10,2),

    -- Features
    features JSONB, -- Array of included features
    team_composition JSONB,

    best_for TEXT, -- Description of ideal use case

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add-on Services and Options
CREATE TABLE service_addons (
    addon_id SERIAL PRIMARY KEY,
    service_id VARCHAR(20) REFERENCES services(service_id),
    addon_name VARCHAR(200),
    description TEXT,
    pricing_type VARCHAR(50), -- 'fixed', 'per_unit', 'percentage'
    price DECIMAL(10,2),
    unit VARCHAR(50), -- 'per_market', 'per_hour', 'per_language', etc.

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CLIENT MANAGEMENT
-- ============================================================================

-- Enterprise Clients
CREATE TABLE enterprise_clients (
    client_id SERIAL PRIMARY KEY,

    -- Company information
    company_name VARCHAR(200) NOT NULL,
    company_type VARCHAR(50), -- 'corporation', 'medium_business', 'large_enterprise', 'international'
    industry VARCHAR(100),
    sub_industry VARCHAR(100),
    employee_count_range VARCHAR(50), -- '100-500', '500-1000', '1000-5000', '5000+'
    annual_revenue_range VARCHAR(50), -- '<$50M', '$50M-$250M', '$250M-$1B', '>$1B'

    -- Contact details
    headquarters_country VARCHAR(100),
    headquarters_city VARCHAR(100),
    operating_regions JSONB, -- Array of regions/countries
    website VARCHAR(500),

    -- Primary contact
    primary_contact_name VARCHAR(200),
    primary_contact_title VARCHAR(200),
    primary_contact_email VARCHAR(200),
    primary_contact_phone VARCHAR(50),

    -- Additional contacts
    contacts JSONB, -- Array of contact objects

    -- Client classification
    client_tier VARCHAR(50), -- 'strategic', 'enterprise', 'growth', 'standard'
    acquisition_source VARCHAR(100),
    acquisition_date DATE,

    -- Client health
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    satisfaction_score DECIMAL(3,2), -- Out of 5.00

    -- Financial
    lifetime_value DECIMAL(12,2),
    total_revenue DECIMAL(12,2),

    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ENGAGEMENTS AND PROJECTS
-- ============================================================================

-- Service Engagements
CREATE TABLE engagements (
    engagement_id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES enterprise_clients(client_id),
    service_id VARCHAR(20) REFERENCES services(service_id),

    -- Engagement details
    engagement_name VARCHAR(300),
    engagement_type VARCHAR(50), -- 'project', 'retainer', 'ongoing'

    -- Scope
    scope_description TEXT,
    custom_scope JSONB, -- Client-specific scope adjustments

    -- Timeline
    start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    duration_weeks INTEGER,

    -- Pricing and commercials
    contract_value DECIMAL(12,2),
    pricing_model VARCHAR(50),
    payment_terms JSONB,
    discount_percentage DECIMAL(5,2),
    discount_reason VARCHAR(200),

    -- For retainer services
    tier_id INTEGER REFERENCES service_tiers(tier_id),
    billing_frequency VARCHAR(20), -- 'monthly', 'quarterly', 'annual'

    -- Team assignment
    lead_consultant VARCHAR(200),
    team_members JSONB, -- Array of team member assignments
    ai_agents_assigned JSONB, -- Array of AI agent allocations

    -- Status and progress
    status VARCHAR(50), -- 'proposal', 'contracted', 'in_progress', 'completed', 'on_hold', 'cancelled'
    progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_phase VARCHAR(100),

    -- Success tracking
    success_metrics JSONB,
    actual_metrics JSONB,

    -- Documents and deliverables
    contract_url VARCHAR(500),
    deliverables_completed JSONB,

    -- Satisfaction and feedback
    client_satisfaction DECIMAL(3,2), -- Out of 5.00
    testimonial TEXT,
    case_study_eligible BOOLEAN DEFAULT false,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Engagement Milestones
CREATE TABLE engagement_milestones (
    milestone_id SERIAL PRIMARY KEY,
    engagement_id INTEGER REFERENCES engagements(engagement_id),

    milestone_name VARCHAR(200),
    description TEXT,
    planned_date DATE,
    actual_date DATE,

    deliverables JSONB, -- Associated deliverables
    payment_amount DECIMAL(10,2), -- If payment tied to milestone

    status VARCHAR(50), -- 'pending', 'in_progress', 'completed', 'delayed'
    completion_percentage INTEGER,

    dependencies JSONB, -- Array of dependent milestone IDs

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FINANCIAL TRACKING
-- ============================================================================

-- Invoices
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    engagement_id INTEGER REFERENCES engagements(engagement_id),
    client_id INTEGER REFERENCES enterprise_clients(client_id),

    invoice_number VARCHAR(50) UNIQUE,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,

    -- Line items
    line_items JSONB, -- Array of line item objects

    -- Amounts
    subtotal DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),

    currency VARCHAR(3) DEFAULT 'USD',

    -- Payment
    status VARCHAR(50), -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    payment_date DATE,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(200),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue Recognition
CREATE TABLE revenue_recognition (
    recognition_id SERIAL PRIMARY KEY,
    engagement_id INTEGER REFERENCES engagements(engagement_id),
    invoice_id INTEGER REFERENCES invoices(invoice_id),

    recognition_period VARCHAR(7), -- 'YYYY-MM' format
    recognized_amount DECIMAL(10,2),
    recognition_percentage DECIMAL(5,2),

    recognition_basis VARCHAR(50), -- 'milestone', 'time_based', 'deliverable'

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROPOSALS AND SALES PIPELINE
-- ============================================================================

-- Proposals
CREATE TABLE proposals (
    proposal_id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES enterprise_clients(client_id),

    proposal_number VARCHAR(50) UNIQUE,
    proposal_title VARCHAR(300),

    -- Services proposed
    proposed_services JSONB, -- Array of service configurations

    -- Pricing
    total_value DECIMAL(12,2),
    discount_offered DECIMAL(5,2),
    final_value DECIMAL(12,2),

    -- Timeline
    proposed_start_date DATE,
    proposed_duration_weeks INTEGER,

    -- Proposal content
    executive_summary TEXT,
    scope_of_work TEXT,
    deliverables JSONB,
    team_overview TEXT,
    pricing_breakdown JSONB,
    terms_and_conditions TEXT,

    -- Status
    status VARCHAR(50), -- 'draft', 'sent', 'under_review', 'negotiating', 'accepted', 'rejected'
    sent_date DATE,
    valid_until DATE,
    decision_date DATE,

    -- Follow-up
    follow_up_notes TEXT,
    rejection_reason TEXT,

    -- Documents
    proposal_document_url VARCHAR(500),

    created_by VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Pipeline
CREATE TABLE sales_pipeline (
    opportunity_id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES enterprise_clients(client_id),
    proposal_id INTEGER REFERENCES proposals(proposal_id),

    opportunity_name VARCHAR(300),

    -- Classification
    service_category VARCHAR(50),
    estimated_value DECIMAL(12,2),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),

    -- Stage
    stage VARCHAR(50), -- 'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
    stage_changed_date DATE,

    -- Timeline
    expected_close_date DATE,
    actual_close_date DATE,

    -- Source and context
    lead_source VARCHAR(100),
    competition VARCHAR(500),
    key_decision_makers JSONB,

    -- Activities and notes
    next_action VARCHAR(500),
    next_action_date DATE,
    notes TEXT,

    -- Assignment
    owner VARCHAR(200),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DELIVERY AND QUALITY
-- ============================================================================

-- Deliverables Tracking
CREATE TABLE deliverables_tracking (
    deliverable_id SERIAL PRIMARY KEY,
    engagement_id INTEGER REFERENCES engagements(engagement_id),

    deliverable_name VARCHAR(300),
    deliverable_type VARCHAR(100), -- 'report', 'presentation', 'dashboard', 'workshop', etc.

    -- Schedule
    planned_delivery_date DATE,
    actual_delivery_date DATE,

    -- Status
    status VARCHAR(50), -- 'not_started', 'in_progress', 'review', 'delivered', 'accepted'
    completion_percentage INTEGER,

    -- Quality
    internal_review_completed BOOLEAN DEFAULT false,
    client_feedback TEXT,
    client_acceptance_date DATE,

    -- Files
    file_urls JSONB, -- Array of document URLs

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client Feedback and Satisfaction
CREATE TABLE client_feedback (
    feedback_id SERIAL PRIMARY KEY,
    engagement_id INTEGER REFERENCES engagements(engagement_id),
    client_id INTEGER REFERENCES enterprise_clients(client_id),

    feedback_type VARCHAR(50), -- 'survey', 'review', 'testimonial', 'complaint'
    feedback_date DATE,

    -- Ratings
    overall_satisfaction DECIMAL(3,2), -- Out of 5.00
    quality_rating DECIMAL(3,2),
    timeliness_rating DECIMAL(3,2),
    value_rating DECIMAL(3,2),
    team_rating DECIMAL(3,2),

    -- Net Promoter Score
    nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),

    -- Qualitative
    positive_comments TEXT,
    improvement_suggestions TEXT,
    testimonial TEXT,

    -- Follow-up
    action_required BOOLEAN DEFAULT false,
    action_taken TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- RESOURCE MANAGEMENT
-- ============================================================================

-- Team Members (Human Consultants)
CREATE TABLE team_members (
    member_id SERIAL PRIMARY KEY,

    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE,

    -- Role
    role VARCHAR(100), -- 'Partner', 'Senior Consultant', 'Consultant', 'Analyst', etc.
    seniority_level INTEGER, -- 1-5, for capacity planning
    specializations JSONB, -- Array of specialization areas

    -- Availability
    employment_type VARCHAR(50), -- 'full_time', 'part_time', 'contractor'
    available_hours_per_week INTEGER,

    -- Rates
    internal_hourly_cost DECIMAL(10,2),
    standard_billing_rate DECIMAL(10,2),

    -- Skills and certifications
    skills JSONB,
    certifications JSONB,
    languages JSONB,

    -- Performance
    utilization_rate DECIMAL(5,2), -- Percentage
    client_satisfaction_avg DECIMAL(3,2),

    is_active BOOLEAN DEFAULT true,
    hired_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resource Allocation
CREATE TABLE resource_allocation (
    allocation_id SERIAL PRIMARY KEY,
    engagement_id INTEGER REFERENCES engagements(engagement_id),
    member_id INTEGER REFERENCES team_members(member_id),

    -- Allocation
    role_in_engagement VARCHAR(100),
    allocated_hours DECIMAL(10,2),
    start_date DATE,
    end_date DATE,

    -- Tracking
    hours_worked DECIMAL(10,2) DEFAULT 0,
    utilization_percentage DECIMAL(5,2),

    -- Billing
    billing_rate DECIMAL(10,2),

    status VARCHAR(50), -- 'planned', 'active', 'completed'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Agent Utilization
CREATE TABLE ai_agent_utilization (
    utilization_id SERIAL PRIMARY KEY,
    engagement_id INTEGER REFERENCES engagements(engagement_id),

    agent_type VARCHAR(100), -- 'researcher', 'code-analyzer', 'system-architect', etc.

    -- Tracking
    allocation_percentage DECIMAL(5,2),
    tasks_completed INTEGER,
    tokens_used BIGINT,
    processing_hours DECIMAL(10,2),

    -- Value metrics
    cost_savings_vs_human DECIMAL(10,2),
    efficiency_gain_percentage DECIMAL(5,2),

    period_start DATE,
    period_end DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- KNOWLEDGE BASE AND ASSETS
-- ============================================================================

-- Reusable Templates and Assets
CREATE TABLE knowledge_assets (
    asset_id SERIAL PRIMARY KEY,

    asset_name VARCHAR(300),
    asset_type VARCHAR(100), -- 'template', 'methodology', 'framework', 'tool', 'case_study'

    -- Classification
    service_categories JSONB, -- Which services this applies to
    industries JSONB,
    regions JSONB,

    -- Content
    description TEXT,
    file_url VARCHAR(500),

    -- Usage tracking
    times_used INTEGER DEFAULT 0,
    last_used_date DATE,
    avg_client_rating DECIMAL(3,2),

    -- Maintenance
    version VARCHAR(20),
    last_updated DATE,
    owner VARCHAR(200),

    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE METRICS AND REPORTING
-- ============================================================================

-- Service Performance Metrics (Aggregated)
CREATE TABLE service_performance (
    metric_id SERIAL PRIMARY KEY,
    service_id VARCHAR(20) REFERENCES services(service_id),

    -- Period
    period_type VARCHAR(20), -- 'monthly', 'quarterly', 'annual'
    period_start DATE,
    period_end DATE,

    -- Volume metrics
    engagements_count INTEGER,
    new_clients INTEGER,
    repeat_clients INTEGER,

    -- Financial metrics
    total_revenue DECIMAL(12,2),
    avg_deal_size DECIMAL(12,2),

    -- Quality metrics
    avg_client_satisfaction DECIMAL(3,2),
    avg_nps_score DECIMAL(4,2),
    on_time_delivery_rate DECIMAL(5,2),

    -- Success metrics
    success_rate DECIMAL(5,2), -- % achieving success criteria
    avg_roi_for_client DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_engagements_client ON engagements(client_id);
CREATE INDEX idx_engagements_status ON engagements(status);
CREATE INDEX idx_engagements_dates ON engagements(start_date, planned_end_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_dates ON invoices(invoice_date, due_date);
CREATE INDEX idx_proposals_client ON proposals(client_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_pipeline_stage ON sales_pipeline(stage);
CREATE INDEX idx_clients_tier ON enterprise_clients(client_tier);
CREATE INDEX idx_clients_active ON enterprise_clients(is_active);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active Engagements with Client Details
CREATE VIEW v_active_engagements AS
SELECT
    e.*,
    c.company_name,
    c.client_tier,
    c.industry,
    s.service_name,
    s.category_id
FROM engagements e
JOIN enterprise_clients c ON e.client_id = c.client_id
JOIN services s ON e.service_id = s.service_id
WHERE e.status IN ('contracted', 'in_progress');

-- Sales Pipeline Summary
CREATE VIEW v_pipeline_summary AS
SELECT
    sp.*,
    ec.company_name,
    ec.client_tier,
    ec.industry,
    p.proposal_title,
    p.status as proposal_status
FROM sales_pipeline sp
JOIN enterprise_clients ec ON sp.client_id = ec.client_id
LEFT JOIN proposals p ON sp.proposal_id = p.proposal_id
WHERE sp.stage NOT IN ('closed_won', 'closed_lost');

-- Revenue by Service Category
CREATE VIEW v_revenue_by_category AS
SELECT
    sc.category_name,
    COUNT(e.engagement_id) as engagement_count,
    SUM(e.contract_value) as total_revenue,
    AVG(e.contract_value) as avg_deal_size,
    AVG(e.client_satisfaction) as avg_satisfaction
FROM service_categories sc
JOIN services s ON sc.category_id = s.category_id
JOIN engagements e ON s.service_id = e.service_id
WHERE e.status != 'cancelled'
GROUP BY sc.category_id, sc.category_name;

-- Client Health Dashboard
CREATE VIEW v_client_health AS
SELECT
    c.*,
    COUNT(e.engagement_id) as total_engagements,
    SUM(CASE WHEN e.status = 'in_progress' THEN 1 ELSE 0 END) as active_engagements,
    MAX(e.start_date) as last_engagement_date,
    AVG(e.client_satisfaction) as avg_satisfaction,
    SUM(i.total_amount) as total_invoiced,
    SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) as total_paid
FROM enterprise_clients c
LEFT JOIN engagements e ON c.client_id = e.client_id
LEFT JOIN invoices i ON c.client_id = i.client_id
WHERE c.is_active = true
GROUP BY c.client_id;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Calculate Client Lifetime Value
CREATE OR REPLACE FUNCTION calculate_client_ltv(p_client_id INTEGER)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    ltv DECIMAL(12,2);
BEGIN
    SELECT COALESCE(SUM(contract_value), 0)
    INTO ltv
    FROM engagements
    WHERE client_id = p_client_id
    AND status IN ('completed', 'in_progress', 'contracted');

    RETURN ltv;
END;
$$ LANGUAGE plpgsql;

-- Update Engagement Progress
CREATE OR REPLACE FUNCTION update_engagement_progress(p_engagement_id INTEGER)
RETURNS VOID AS $$
DECLARE
    total_milestones INTEGER;
    completed_milestones INTEGER;
    progress INTEGER;
BEGIN
    SELECT COUNT(*), COUNT(CASE WHEN status = 'completed' THEN 1 END)
    INTO total_milestones, completed_milestones
    FROM engagement_milestones
    WHERE engagement_id = p_engagement_id;

    IF total_milestones > 0 THEN
        progress := (completed_milestones * 100) / total_milestones;

        UPDATE engagements
        SET progress_percentage = progress,
            updated_at = CURRENT_TIMESTAMP
        WHERE engagement_id = p_engagement_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_services_timestamp
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_clients_timestamp
BEFORE UPDATE ON enterprise_clients
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_engagements_timestamp
BEFORE UPDATE ON engagements
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Auto-calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_amount = NEW.subtotal - COALESCE(NEW.discount_amount, 0) + COALESCE(NEW.tax_amount, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invoice_total
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION calculate_invoice_total();
