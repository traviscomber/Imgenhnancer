-- Create users table for credit tracking
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credits table to track user credits
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create credit transactions table to log all credit activities
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'purchase', 'usage', 'refund', 'bonus'
  description TEXT,
  image_id TEXT,
  operation TEXT, -- 'enhance', 'upscale', 'face-swap', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit packages table for purchase options
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default credit packages (20% less than Topaz)
-- Topaz: $9.99 for 80 credits, $78 for 400 credits
-- Our system: Better value - more credits for same price
INSERT INTO credit_packages (name, credits, price_usd, description) VALUES
  ('Starter', 100, 9.99, 'Perfect for trying out the service'),
  ('Pro', 500, 39.99, 'Best value for regular users'),
  ('Business', 1500, 99.99, 'For professional use');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for user_credits table
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert admin user with password N3uralia.2025 (hashed)
-- Note: In production, use proper password hashing
INSERT INTO users (email, password_hash, role) VALUES
  ('admin@clarity.ai', 'N3uralia.2025', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Give admin user unlimited credits (999999)
INSERT INTO user_credits (user_id, credits)
SELECT id, 999999 FROM users WHERE email = 'admin@clarity.ai'
ON CONFLICT (user_id) DO UPDATE SET credits = 999999;
