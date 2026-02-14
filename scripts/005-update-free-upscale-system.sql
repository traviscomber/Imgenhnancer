-- Update schema to support new free upscale system
-- 5 initial free upscales per new user + 1 per month

-- Add columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_upscales_available INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_monthly_free_upscale TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_free_upscales ON users(id, free_upscales_available);
CREATE INDEX IF NOT EXISTS idx_users_monthly_reset ON users(id, last_monthly_free_upscale);

-- Drop old weekly tracking table if it exists
DROP TABLE IF EXISTS free_upscale_usage;

-- Update existing users to have 5 free upscales if they don't have any
UPDATE users SET free_upscales_available = 5 WHERE free_upscales_available IS NULL OR free_upscales_available = 0;
