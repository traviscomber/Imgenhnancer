-- Add any missing columns and constraints

-- Add billing information to users if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'billing_address') THEN
        ALTER TABLE users ADD COLUMN billing_address JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'payment_method_id') THEN
        ALTER TABLE users ADD COLUMN payment_method_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_credits_purchased') THEN
        ALTER TABLE users ADD COLUMN total_credits_purchased INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_images_processed') THEN
        ALTER TABLE users ADD COLUMN total_images_processed INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add batch processing support to jobs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processing_jobs' AND column_name = 'batch_id') THEN
        ALTER TABLE processing_jobs ADD COLUMN batch_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processing_jobs' AND column_name = 'is_batch_job') THEN
        ALTER TABLE processing_jobs ADD COLUMN is_batch_job BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add model performance tracking
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'success_rate') THEN
        ALTER TABLE ai_models ADD COLUMN success_rate DECIMAL(5,2) DEFAULT 0.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'average_processing_time') THEN
        ALTER TABLE ai_models ADD COLUMN average_processing_time INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'total_jobs_processed') THEN
        ALTER TABLE ai_models ADD COLUMN total_jobs_processed INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create batch jobs table if not exists
CREATE TABLE IF NOT EXISTS batch_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    total_images INTEGER NOT NULL,
    completed_images INTEGER DEFAULT 0,
    failed_images INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_processing_jobs_batch_id ON processing_jobs(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_id ON batch_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);

-- Add foreign key constraint for batch_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_processing_jobs_batch_id') THEN
        ALTER TABLE processing_jobs ADD CONSTRAINT fk_processing_jobs_batch_id FOREIGN KEY (batch_id) REFERENCES batch_jobs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add trigger for batch_jobs updated_at
DROP TRIGGER IF EXISTS update_batch_jobs_updated_at ON batch_jobs;
CREATE TRIGGER update_batch_jobs_updated_at BEFORE UPDATE ON batch_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
