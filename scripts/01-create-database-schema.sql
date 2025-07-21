-- AI Image Enhancer Database Schema
-- This script creates all necessary tables and indexes

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS processing_jobs CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS ai_models CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    credits_remaining INTEGER DEFAULT 1000,
    credits_used INTEGER DEFAULT 0,
    images_processed INTEGER DEFAULT 0,
    total_processing_time INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    preferences JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'business')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create user_roles table for role-based permissions
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    color VARCHAR(50) DEFAULT 'bg-gray-600',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_models table
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('replicate', 'fal', 'openai', 'custom')),
    provider_model_name VARCHAR(255),
    provider_version VARCHAR(255),
    input_field VARCHAR(100) DEFAULT 'image',
    max_upscale INTEGER DEFAULT 4,
    processing_time_estimate VARCHAR(50),
    best_for TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing', 'deprecated')),
    is_recommended BOOLEAN DEFAULT FALSE,
    icon_name VARCHAR(100) DEFAULT 'ImageIcon',
    configuration JSONB DEFAULT '{}',
    pricing JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create processing_jobs table
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    original_file_size BIGINT NOT NULL,
    original_file_type VARCHAR(100) NOT NULL,
    model_id UUID NOT NULL REFERENCES ai_models(id),
    settings JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress_message TEXT,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    provider_job_id VARCHAR(255), -- Replicate prediction ID, Fal job ID, etc.
    input_file_url TEXT,
    output_file_url TEXT,
    enhanced_file_size BIGINT,
    upscale_factor INTEGER DEFAULT 2,
    processing_time_seconds INTEGER,
    credits_used INTEGER DEFAULT 0,
    error_message TEXT,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX idx_ai_models_model_id ON ai_models(model_id);
CREATE INDEX idx_ai_models_provider ON ai_models(provider);
CREATE INDEX idx_ai_models_status ON ai_models(status);
CREATE INDEX idx_ai_models_category ON ai_models(category);

CREATE INDEX idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_processing_jobs_model_id ON processing_jobs(model_id);
CREATE INDEX idx_processing_jobs_created_at ON processing_jobs(created_at);
CREATE INDEX idx_processing_jobs_provider_job_id ON processing_jobs(provider_job_id);

-- Create updated_at trigger function
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

-- Insert default roles
INSERT INTO user_roles (name, description, permissions, color, is_system) VALUES
('user', 'Basic user with image enhancement access', 
 '["images.upload", "images.enhance", "images.download", "models.view"]', 
 'bg-blue-600', true),
('moderator', 'Can moderate content and assist users', 
 '["images.upload", "images.enhance", "images.download", "images.view_all", "models.view", "models.test", "users.view", "analytics.view"]', 
 'bg-purple-600', true),
('admin', 'Full system access and user management', 
 '["system.admin", "system.config", "system.logs", "users.view", "users.create", "users.edit", "users.delete", "users.roles", "images.upload", "images.enhance", "images.download", "images.view_all", "images.delete_any", "models.view", "models.configure", "models.test", "models.discover", "analytics.view", "analytics.export", "analytics.users"]', 
 'bg-red-600', true);

-- Insert AI models
INSERT INTO ai_models (model_id, name, description, category, provider, provider_model_name, provider_version, input_field, max_upscale, processing_time_estimate, best_for, is_recommended, icon_name, configuration) VALUES
('real-esrgan-4x', 'Real-ESRGAN 4x', 'Professional upscaling for photos and artwork', 'General Purpose', 'replicate', 'nightmareai/real-esrgan', '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b', 'image', 4, '30-60s', 'Photos, artwork, general images', true, 'ImageIcon', '{"supports_face_enhance": false, "supports_denoise": true}'),
('gfpgan-face', 'GFPGAN', 'Specialized face restoration and enhancement', 'Face Enhancement', 'replicate', 'tencentarc/gfpgan', '9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3', 'img', 4, '45-90s', 'Portrait photos, face restoration', false, 'Camera', '{"supports_face_enhance": true, "supports_denoise": false}'),
('codeformer-face', 'CodeFormer', 'Advanced face restoration with fidelity control', 'Portrait Enhancement', 'replicate', 'sczhou/codeformer', '7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56', 'image', 4, '60-120s', 'Professional portraits, headshots', false, 'Palette', '{"supports_face_enhance": true, "supports_fidelity_control": true}'),
('clarity-upscaler', 'Clarity Upscaler', 'High-quality upscaling with clarity enhancement', 'Professional', 'replicate', 'philz1337x/clarity-upscaler', 'dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e', 'image', 4, '45-75s', 'Professional photography, print', false, 'Wand2', '{"supports_clarity_boost": true, "supports_print_optimization": true}');

-- Insert demo users
INSERT INTO users (email, name, password_hash, role, status, credits_remaining, credits_used, images_processed, email_verified) VALUES
('admin@example.com', 'Admin User', '$2b$10$dummy.hash.for.demo.purposes.only', 'admin', 'active', 10000, 0, 0, true),
('demo@example.com', 'Demo User', '$2b$10$dummy.hash.for.demo.purposes.only', 'admin', 'active', 5000, 500, 50, true),
('user@example.com', 'Regular User', '$2b$10$dummy.hash.for.demo.purposes.only', 'user', 'active', 800, 200, 20, true),
('moderator@example.com', 'Moderator User', '$2b$10$dummy.hash.for.demo.purposes.only', 'moderator', 'active', 2000, 300, 30, true);

COMMIT;
