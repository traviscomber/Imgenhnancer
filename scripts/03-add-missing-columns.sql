-- Add any missing columns and constraints

-- Add batch processing support
ALTER TABLE processing_jobs 
ADD COLUMN IF NOT EXISTS batch_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS batch_total_jobs INTEGER,
ADD COLUMN IF NOT EXISTS batch_completed_jobs INTEGER DEFAULT 0;

-- Add user preferences and settings
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
ADD COLUMN IF NOT EXISTS api_usage_limit INTEGER DEFAULT 1000;

-- Add model performance tracking
ALTER TABLE ai_models 
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS average_file_size_mb DECIMAL(10,2) DEFAULT 0.00;

-- Add job queue management
ALTER TABLE processing_jobs 
ADD COLUMN IF NOT EXISTS queue_position INTEGER,
ADD COLUMN IF NOT EXISTS estimated_completion_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_secret VARCHAR(255);

-- Add file metadata
ALTER TABLE file_storage 
ADD COLUMN IF NOT EXISTS image_width INTEGER,
ADD COLUMN IF NOT EXISTS image_height INTEGER,
ADD COLUMN IF NOT EXISTS image_format VARCHAR(20),
ADD COLUMN IF NOT EXISTS compression_quality INTEGER;

-- Update constraints
ALTER TABLE processing_jobs 
ADD CONSTRAINT IF NOT EXISTS chk_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries);

ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS chk_credits_remaining CHECK (credits_remaining >= 0);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_processing_jobs_updated_at ON processing_jobs;
CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_models_updated_at ON ai_models;
CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_analytics_updated_at ON usage_analytics;
CREATE TRIGGER update_usage_analytics_updated_at BEFORE UPDATE ON usage_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_file_storage_updated_at ON file_storage;
CREATE TRIGGER update_file_storage_updated_at BEFORE UPDATE ON file_storage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
