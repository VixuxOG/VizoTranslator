-- VizoTranslator Database Schema
-- Run this migration to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER & AUTHENTICATION
-- ============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    auth_provider VARCHAR(50) DEFAULT 'email',
    auth_provider_id VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations (Teams)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    domain VARCHAR(255),
    custom_config JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '[]',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- ============================================
-- TRANSLATION MEMORY & GLOSSARIES
-- ============================================

-- Translation memory entries
CREATE TABLE translation_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_text TEXT NOT NULL,
    target_text TEXT NOT NULL,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    context VARCHAR(255),
    industry VARCHAR(100),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Glossary entries
CREATE TABLE glossaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE glossary_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    glossary_id UUID NOT NULL REFERENCES glossaries(id) ON DELETE CASCADE,
    source_term VARCHAR(500) NOT NULL,
    target_term VARCHAR(500) NOT NULL,
    part_of_speech VARCHAR(50),
    notes TEXT,
    usage_examples TEXT[],
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRANSLATION PROJECTS
-- ============================================

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    industry VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    priority VARCHAR(20) DEFAULT 'normal',
    deadline TIMESTAMP WITH TIME ZONE,
    budget DECIMAL(10,2),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Project files
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    storage_path TEXT,
    source_lang VARCHAR(10),
    target_lang VARCHAR(10),
    status VARCHAR(50) DEFAULT 'pending',
    word_count INTEGER DEFAULT 0,
    translated_word_count INTEGER DEFAULT 0,
    quality_score DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Translation segments (for project files)
CREATE TABLE translation_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
    segment_index INTEGER NOT NULL,
    source_text TEXT NOT NULL,
    target_text TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    quality_score DECIMAL(3,2),
    comments TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_file_id, segment_index)
);

-- ============================================
-- TRANSLATION HISTORY & FAVORITES
-- ============================================

-- Translation history
CREATE TABLE translation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    source_text TEXT NOT NULL,
    target_text TEXT NOT NULL,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    confidence_score DECIMAL(3,2),
    ai_provider VARCHAR(50),
    ai_model VARCHAR(100),
    context VARCHAR(255),
    is_favorite BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved translations
CREATE TABLE saved_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    source_text TEXT NOT NULL,
    target_text TEXT NOT NULL,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    tags TEXT[],
    notes TEXT,
    folder VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- API & BILLING
-- ============================================

-- API keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 100,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    api_key_id UUID REFERENCES api_keys(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_body JSONB,
    response_code INTEGER,
    tokens_used INTEGER,
    characters_translated INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    subscription_id UUID REFERENCES subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    stripe_invoice_id VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUDIT & LOGGING
-- ============================================

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INTEGRATIONS
-- ============================================

-- Webhooks
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    headers JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook deliveries
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_code INTEGER,
    response_body TEXT,
    error TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_tm_langs ON translation_memory(source_lang, target_lang);
CREATE INDEX idx_tm_org ON translation_memory(organization_id);
CREATE INDEX idx_tm_user ON translation_memory(user_id);
CREATE INDEX idx_history_user ON translation_history(user_id);
CREATE INDEX idx_history_langs ON translation_history(source_lang, target_lang);
CREATE INDEX idx_history_created ON translation_history(created_at DESC);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_segments_file ON translation_segments(project_file_id);
CREATE INDEX idx_segments_status ON translation_segments(status);
CREATE INDEX idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at DESC);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: users can see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Organizations: members can view their orgs
CREATE POLICY "Members can view their organizations" ON organizations FOR SELECT 
    USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Translation memory: org members share TM
CREATE POLICY "Org members can view TM" ON translation_memory FOR SELECT 
    USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Users can insert own TM" ON translation_memory FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Similar policies for other tables...

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tm_updated_at BEFORE UPDATE ON translation_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_glossary_updated_at BEFORE UPDATE ON glossaries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA: Supported Languages
-- ============================================

CREATE TABLE languages (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    rtl BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO languages (code, name, native_name, rtl) VALUES
('en', 'English', 'English', false),
('es', 'Spanish', 'Español', false),
('fr', 'French', 'Français', false),
('de', 'German', 'Deutsch', false),
('it', 'Italian', 'Italiano', false),
('pt', 'Portuguese', 'Português', false),
('ru', 'Russian', 'Русский', false),
('zh', 'Chinese', '中文', false),
('ja', 'Japanese', '日本語', false),
('ko', 'Korean', '한국어', false),
('ar', 'Arabic', 'العربية', true),
('hi', 'Hindi', 'हिन्दी', false),
('nl', 'Dutch', 'Nederlands', false),
('pl', 'Polish', 'Polski', false),
('tr', 'Turkish', 'Türkçe', false),
('vi', 'Vietnamese', 'Tiếng Việt', false),
('th', 'Thai', 'ไทย', false),
('id', 'Indonesian', 'Bahasa Indonesia', false),
('ms', 'Malay', 'Bahasa Melayu', false),
('fil', 'Filipino', 'Filipino', false),
('sv', 'Swedish', 'Svenska', false),
('no', 'Norwegian', 'Norsk', false),
('da', 'Danish', 'Dansk', false),
('fi', 'Finnish', 'Suomi', false),
('el', 'Greek', 'Ελληνικά', false),
('he', 'Hebrew', 'עברית', true),
('cs', 'Czech', 'Čeština', false),
('uk', 'Ukrainian', 'Українська', false),
('ro', 'Romanian', 'Română', false),
('hu', 'Hungarian', 'Magyar', false),
('bg', 'Bulgarian', 'Български', false),
('hr', 'Croatian', 'Hrvatski', false),
('sk', 'Slovak', 'Slovenčina', false),
('sl', 'Slovenian', 'Slovenščina', false),
('et', 'Estonian', 'Eesti', false),
('lv', 'Latvian', 'Latviešu', false),
('lt', 'Lithuanian', 'Lietuvių', false),
('sr', 'Serbian', 'Српски', false),
('bn', 'Bengali', 'বাংলা', false),
('ta', 'Tamil', 'தமிழ்', false),
('te', 'Telugu', 'తెలుగు', false),
('mr', 'Marathi', 'मराठी', false),
('ur', 'Urdu', 'اردو', true),
('fa', 'Persian', 'فارسی', true),
('sw', 'Swahili', 'Kiswahili', false),
('af', 'Afrikaans', 'Afrikaans', false),
('az', 'Azerbaijani', 'Azərbaycan', false),
('kk', 'Kazakh', 'Қазақ', false),
('uz', 'Uzbek', 'Oʻzbek', false),
('ml', 'Malayalam', 'മലയാളം', false),
('kn', 'Kannada', 'ಕನ್ನಡ', false),
('gu', 'Gujarati', 'ગુજરાતી', false),
('pa', 'Punjabi', 'ਪੰਜਾਬੀ', false),
('ne', 'Nepali', 'नेपाली', false),
('si', 'Sinhala', 'සිංහල', false);
