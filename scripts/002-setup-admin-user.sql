-- Create admin user in auth.users and users table
-- This script sets up the default admin account

-- Updated admin email to admin@clarity.art
-- Insert admin user into users table if not exists
INSERT INTO public.users (id, email, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@clarity.art',
  'admin',
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;

-- Give admin unlimited credits
INSERT INTO public.user_credits (user_id, credits, created_at, updated_at)
SELECT id, 999999, now(), now()
FROM public.users
WHERE email = 'admin@clarity.art'
ON CONFLICT (user_id) DO UPDATE SET credits = 999999;

-- Note: The password hash needs to be created through Supabase Auth
-- You'll need to sign up with admin@clarity.art and password N3uralia.2025
-- through the login form to create the auth.users entry
