-- Add missing columns and constraints

-- Add additional columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_images_processed INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_processing_time INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": false}';

-- Add additional columns to ai_models table
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS pricing_tier VARCHAR(20) DEFAULT 'standard';
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS supported_formats TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'webp'];
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS max_file_size INTEGER DEFAULT 10485760; -- 10MB in bytes
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS min_dimensions INTEGER DEFAULT 64;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS max_dimensions INTEGER DEFAULT 4096;

-- Add additional columns to processing_jobs table
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS queue_position INTEGER;
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP WITH TIME ZONE;
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS webhook_secret VARCHAR(255);
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add user roles additional columns
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT 'bg-gray-600';
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS max_credits_per_month INTEGER;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS max_concurrent_jobs INTEGER DEFAULT 1;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS priority_boost INTEGER DEFAULT 0;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_models_updated_at ON ai_models;
CREATE TRIGGER update_ai_models_updated_at 
    BEFORE UPDATE ON ai_models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_processing_jobs_updated_at ON processing_jobs;
CREATE TRIGGER update_processing_jobs_updated_at 
    BEFORE UPDATE ON processing_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_analytics_updated_at ON usage_analytics;
CREATE TRIGGER update_usage_analytics_updated_at 
    BEFORE UPDATE ON usage_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_file_storage_updated_at ON file_storage;
CREATE TRIGGER update_file_storage_updated_at 
    BEFORE UPDATE ON file_storage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints and checks
ALTER TABLE processing_jobs ADD CONSTRAINT IF NOT EXISTS check_upscale_factor 
    CHECK (upscale_factor >= 1 AND upscale_factor <= 8);

ALTER TABLE processing_jobs ADD CONSTRAINT IF NOT EXISTS check_retry_count 
    CHECK (retry_count >= 0 AND retry_count <= max_retries);

ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_credits_remaining 
    CHECK (credits_remaining >= 0);

ALTER TABLE ai_models ADD CONSTRAINT IF NOT EXISTS check_success_rate 
    CHECK (success_rate >= 0 AND success_rate <= 100);

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_processing_jobs_priority ON processing_jobs(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_provider_job_id ON processing_jobs(provider_job_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_models_category ON ai_models(category);
CREATE INDEX IF NOT EXISTS idx_ai_models_recommended ON ai_models(is_recommended) WHERE is_recommended = true;
