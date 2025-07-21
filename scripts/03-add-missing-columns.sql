-- Add additional columns to existing tables

-- Add batch processing support to processing_jobs
ALTER TABLE processing_jobs 
ADD COLUMN IF NOT EXISTS batch_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS batch_total_jobs INTEGER,
ADD COLUMN IF NOT EXISTS batch_completed_jobs INTEGER DEFAULT 0;

-- Add user preferences and billing info
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
ADD COLUMN IF NOT EXISTS api_access_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_concurrent_jobs INTEGER DEFAULT 3;

-- Add model performance tracking
ALTER TABLE ai_models 
ADD COLUMN IF NOT EXISTS min_processing_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_processing_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS supported_formats TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'webp'],
ADD COLUMN IF NOT EXISTS max_file_size BIGINT DEFAULT 10485760, -- 10MB
ADD COLUMN IF NOT EXISTS pricing_tier VARCHAR(20) DEFAULT 'standard';

-- Add job queue management
ALTER TABLE processing_jobs 
ADD COLUMN IF NOT EXISTS queue_position INTEGER,
ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS callback_data JSONB DEFAULT '{}';

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE processing_jobs 
ADD CONSTRAINT check_upscale_factor CHECK (upscale_factor >= 1 AND upscale_factor <= 8),
ADD CONSTRAINT check_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
ADD CONSTRAINT check_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries);

ALTER TABLE users 
ADD CONSTRAINT check_credits_remaining CHECK (credits_remaining >= 0),
ADD CONSTRAINT check_max_concurrent_jobs CHECK (max_concurrent_jobs >= 1 AND max_concurrent_jobs <= 10);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_processing_jobs_batch_name ON processing_jobs(batch_name);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_queue_position ON processing_jobs(queue_position);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_estimated_completion ON processing_jobs(estimated_completion);
CREATE INDEX IF NOT EXISTS idx_users_api_access ON users(api_access_enabled);
CREATE INDEX IF NOT EXISTS idx_ai_models_pricing_tier ON ai_models(pricing_tier);
