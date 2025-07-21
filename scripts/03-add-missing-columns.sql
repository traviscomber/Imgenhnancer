-- Add any missing columns to existing tables

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add timezone preference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'timezone') THEN
        ALTER TABLE users ADD COLUMN timezone VARCHAR(100) DEFAULT 'UTC';
    END IF;
    
    -- Add language preference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'language') THEN
        ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en';
    END IF;
    
    -- Add notification preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notification_preferences') THEN
        ALTER TABLE users ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "browser": true, "processing_complete": true, "marketing": false}';
    END IF;
    
    -- Add two-factor authentication
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_enabled') THEN
        ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_secret') THEN
        ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
    END IF;
    
    -- Add referral system
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_code') THEN
        ALTER TABLE users ADD COLUMN referral_code VARCHAR(20) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referred_by') THEN
        ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id);
    END IF;
    
    -- Add billing information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'billing_address') THEN
        ALTER TABLE users ADD COLUMN billing_address JSONB;
    END IF;
END $$;

-- Add missing columns to processing_jobs table
DO $$ 
BEGIN
    -- Add quality metrics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processing_jobs' AND column_name = 'quality_score') THEN
        ALTER TABLE processing_jobs ADD COLUMN quality_score DECIMAL(3,2);
    END IF;
    
    -- Add retry information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processing_jobs' AND column_name = 'retry_count') THEN
        ALTER TABLE processing_jobs ADD COLUMN retry_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processing_jobs' AND column_name = 'max_retries') THEN
        ALTER TABLE processing_jobs ADD COLUMN max_retries INTEGER DEFAULT 3;
    END IF;
    
    -- Add priority system
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processing_jobs' AND column_name = 'priority') THEN
        ALTER TABLE processing_jobs ADD COLUMN priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10);
    END IF;
    
    -- Add batch processing support
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processing_jobs' AND column_name = 'batch_id') THEN
        ALTER TABLE processing_jobs ADD COLUMN batch_id UUID;
    END IF;
    
    -- Add webhook support
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processing_jobs' AND column_name = 'webhook_url') THEN
        ALTER TABLE processing_jobs ADD COLUMN webhook_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processing_jobs' AND column_name = 'webhook_sent') THEN
        ALTER TABLE processing_jobs ADD COLUMN webhook_sent BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add missing columns to ai_models table
DO $$ 
BEGIN
    -- Add cost information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'cost_per_image') THEN
        ALTER TABLE ai_models ADD COLUMN cost_per_image DECIMAL(10,4) DEFAULT 0.0000;
    END IF;
    
    -- Add performance metrics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'average_processing_time') THEN
        ALTER TABLE ai_models ADD COLUMN average_processing_time INTEGER; -- in seconds
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'success_rate') THEN
        ALTER TABLE ai_models ADD COLUMN success_rate DECIMAL(5,2) DEFAULT 95.00;
    END IF;
    
    -- Add usage statistics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'total_uses') THEN
        ALTER TABLE ai_models ADD COLUMN total_uses INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'last_used_at') THEN
        ALTER TABLE ai_models ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_processing_jobs_batch_id ON processing_jobs(batch_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_priority ON processing_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_retry_count ON processing_jobs(retry_count);

CREATE INDEX IF NOT EXISTS idx_ai_models_cost ON ai_models(cost_per_image);
CREATE INDEX IF NOT EXISTS idx_ai_models_success_rate ON ai_models(success_rate);
CREATE INDEX IF NOT EXISTS idx_ai_models_total_uses ON ai_models(total_uses);

COMMIT;
