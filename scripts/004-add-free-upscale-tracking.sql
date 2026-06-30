-- Add table to track free 2x upscales per user per week
CREATE TABLE IF NOT EXISTS free_upscale_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  upscales_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_free_upscale_usage_user_week ON free_upscale_usage(user_id, week_start);

-- Create trigger to update updated_at
CREATE TRIGGER update_free_upscale_usage_updated_at
  BEFORE UPDATE ON free_upscale_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
