-- Add unique constraint only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'credit_packages_name_key'
  ) THEN
    ALTER TABLE credit_packages 
    ADD CONSTRAINT credit_packages_name_key UNIQUE (name);
  END IF;
END $$;

-- Seed credit packages table with the defined packages
INSERT INTO credit_packages (id, name, description, credits, price_usd, is_active)
VALUES 
  (gen_random_uuid(), 'Starter', 'Perfect for trying out the service', 100, 9.99, true),
  (gen_random_uuid(), 'Pro', 'Best value for regular users', 500, 39.99, true),
  (gen_random_uuid(), 'Business', 'For professional use', 1500, 99.99, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  credits = EXCLUDED.credits,
  price_usd = EXCLUDED.price_usd,
  is_active = EXCLUDED.is_active;
