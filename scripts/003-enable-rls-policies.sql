-- CRITICAL: Enable Row Level Security (RLS) on all tables
-- Run this script in Supabase SQL Editor before going to production

-- ============================================
-- 1. USERS TABLE - RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- 2. USER_CREDITS TABLE - RLS
-- ============================================
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Users can view their own credits
CREATE POLICY "Users can view own credits"
ON user_credits FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own credits (restricted to system via RLS)
CREATE POLICY "System can update credits"
ON user_credits FOR UPDATE
USING (auth.jwt() ->> 'role' = 'authenticated');

-- ============================================
-- 3. CREDIT_TRANSACTIONS TABLE - RLS
-- ============================================
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON credit_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
ON credit_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. CREDIT_PACKAGES TABLE - RLS
-- ============================================
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- Everyone can view available packages (no RLS needed, but enable it for consistency)
CREATE POLICY "Everyone can view packages"
ON credit_packages FOR SELECT
USING (is_active = true);

-- ============================================
-- Verify RLS is enabled
-- ============================================
-- Run this query to verify all tables have RLS enabled:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
