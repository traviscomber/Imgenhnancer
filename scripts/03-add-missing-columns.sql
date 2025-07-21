-- Add missing columns and constraints to existing tables

-- Add additional columns to processing_jobs table
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10);
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3;
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add additional columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": false}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_access_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);

-- Add additional columns to ai_models table
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS cost_per_credit DECIMAL(10,4) DEFAULT 1.0;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS average_processing_time INTEGER; -- in seconds
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 99.0;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS supported_formats TEXT[] DEFAULT ARRAY['jpeg', 'png', 'webp'];
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS max_file_size BIGINT DEFAULT 50000000; -- 50MB
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS min_resolution INTEGER DEFAULT 64;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS max_resolution INTEGER DEFAULT 8192;

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_processing_jobs_priority ON processing_jobs(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_batch_id ON processing_jobs(batch_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_retry ON processing_jobs(retry_count, max_retries);

CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_plan, subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_api_access ON users(api_access_enabled);

-- Add check constraints
ALTER TABLE processing_jobs ADD CONSTRAINT IF NOT EXISTS chk_retry_count CHECK (retry_count <= max_retries);
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_credits CHECK (credits_remaining >= 0);
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_subscription_expires CHECK (
    (subscription_plan = 'free' AND subscription_expires_at IS NULL) OR 
    (subscription_plan != 'free' AND subscription_expires_at IS NOT NULL)
);

COMMIT;
