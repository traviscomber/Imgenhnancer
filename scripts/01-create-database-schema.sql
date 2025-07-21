-- AI Image Enhancer Database Schema
-- Core tables for user management, AI models, and processing jobs

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with comprehensive user management
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    email_verified BOOLEAN DEFAULT false,
    credits_remaining INTEGER DEFAULT 100,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    profile_image_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- User roles and permissions
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Models configuration
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'real-esrgan-4x'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('replicate', 'fal', 'openai', 'custom')),
    provider_model_name VARCHAR(255) NOT NULL, -- e.g., 'nightmareai/real-esrgan'
    provider_version VARCHAR(255),
    input_field VARCHAR(50) DEFAULT 'image',
    max_upscale INTEGER DEFAULT 4,
    processing_time_estimate VARCHAR(50),
    best_for TEXT,
    is_recommended BOOLEAN DEFAULT false,
    icon_name VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing')),
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing jobs for image enhancement
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    original_file_size BIGINT NOT NULL,
    original_file_type VARCHAR(50) NOT NULL,
    original_file_url TEXT,
    model_id UUID NOT NULL REFERENCES ai_models(id),
    settings JSONB DEFAULT '{}',
    upscale_factor INTEGER DEFAULT 2,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0,
    progress_message TEXT,
    provider_job_id VARCHAR(255),
    output_file_url TEXT,
    enhanced_file_size BIGINT,
    processing_time_seconds INTEGER,
    credits_used INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- User sessions for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_created_at ON processing_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_models_status ON ai_models(status);
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Insert default user roles
INSERT INTO user_roles (name, description, permissions) VALUES
('admin', 'Full system access', '["manage_users", "manage_models", "view_analytics", "system_config"]'),
('moderator', 'Content moderation', '["view_users", "moderate_content", "view_jobs"]'),
('user', 'Standard user access', '["upload_images", "view_own_jobs", "download_results"]')
ON CONFLICT (name) DO NOTHING;

-- Insert AI models
INSERT INTO ai_models (model_id, name, description, category, provider, provider_model_name, provider_version, input_field, max_upscale, processing_time_estimate, best_for, is_recommended, icon_name, status) VALUES
('real-esrgan-4x', 'Real-ESRGAN 4x', 'Professional upscaling for photos and artwork', 'General Purpose', 'replicate', 'nightmareai/real-esrgan', '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b', 'image', 4, '30-60s', 'Photos, artwork, general images', true, 'ImageIcon', 'active'),
('gfpgan-face', 'GFPGAN', 'Specialized face restoration and enhancement', 'Face Enhancement', 'replicate', 'tencentarc/gfpgan', '9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3', 'img', 4, '45-90s', 'Portrait photos, face restoration', false, 'Camera', 'active'),
('codeformer-face', 'CodeFormer', 'Advanced face restoration with fidelity control', 'Portrait Enhancement', 'replicate', 'sczhou/codeformer', '7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56', 'image', 4, '60-120s', 'Professional portraits, headshots', false, 'Palette', 'active'),
('clarity-upscaler', 'Clarity Upscaler', 'High-quality upscaling with clarity enhancement', 'Professional', 'replicate', 'philz1337x/clarity-upscaler', 'dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e', 'image', 4, '45-75s', 'Professional photography, print', false, 'Wand2', 'active')
ON CONFLICT (model_id) DO NOTHING;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
