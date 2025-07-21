-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'premium', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business', 'enterprise');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE job_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE model_category AS ENUM ('upscaling', 'restoration', 'enhancement', 'colorization', 'denoising');
CREATE TYPE provider_type AS ENUM ('replicate', 'fal', 'openai', 'stability', 'custom');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    subscription_tier subscription_tier DEFAULT 'free',
    credits_remaining INTEGER DEFAULT 10,
    credits_used INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    profile_image_url TEXT,
    preferences JSONB DEFAULT '{}',
    billing_info JSONB DEFAULT '{}',
    total_images_processed INTEGER DEFAULT 0,
    total_processing_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table for role-based permissions
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Models table
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category model_category NOT NULL,
    provider provider_type NOT NULL,
    provider_model_name VARCHAR(255) NOT NULL,
    provider_version VARCHAR(50) DEFAULT 'latest',
    max_upscale INTEGER DEFAULT 4,
    processing_time_estimate INTEGER, -- in seconds
    credits_per_use INTEGER DEFAULT 1,
    best_for TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_recommended BOOLEAN DEFAULT false,
    icon_name VARCHAR(50),
    configuration JSONB DEFAULT '{}',
    total_jobs_processed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    average_processing_time INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing jobs table
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES ai_models(id),
    batch_id UUID, -- for batch processing
    status job_status DEFAULT 'pending',
    priority job_priority DEFAULT 'normal',
    
    -- Original file info
    original_filename VARCHAR(255) NOT NULL,
    original_file_size BIGINT,
    original_file_type VARCHAR(100),
    original_file_url TEXT,
    original_file_hash VARCHAR(64),
    
    -- Processing settings
    upscale_factor INTEGER DEFAULT 2,
    settings JSONB DEFAULT '{}',
    
    -- Processing info
    provider_job_id VARCHAR(255),
    progress_percentage INTEGER DEFAULT 0,
    progress_message TEXT,
    processing_time_seconds INTEGER,
    
    -- Results
    result_file_url TEXT,
    result_file_size BIGINT,
    result_file_type VARCHAR(100),
    
    -- Billing
    credits_used INTEGER DEFAULT 0,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_ai_models_category ON ai_models(category);
CREATE INDEX idx_ai_models_provider ON ai_models(provider);
CREATE INDEX idx_ai_models_active ON ai_models(is_active);
CREATE INDEX idx_ai_models_recommended ON ai_models(is_recommended);

CREATE INDEX idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX idx_processing_jobs_model_id ON processing_jobs(model_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_processing_jobs_batch_id ON processing_jobs(batch_id);
CREATE INDEX idx_processing_jobs_created_at ON processing_jobs(created_at);
CREATE INDEX idx_processing_jobs_priority ON processing_jobs(priority);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Insert default user roles
INSERT INTO user_roles (name, description, permissions, is_system_role) VALUES
('user', 'Standard user with basic permissions', '{"upload_images": true, "view_own_jobs": true, "download_results": true}', true),
('premium', 'Premium user with enhanced features', '{"upload_images": true, "view_own_jobs": true, "download_results": true, "batch_processing": true, "priority_queue": true}', true),
('admin', 'Administrator with full system access', '{"upload_images": true, "view_own_jobs": true, "download_results": true, "batch_processing": true, "priority_queue": true, "manage_users": true, "manage_models": true, "view_analytics": true, "system_config": true}', true);
