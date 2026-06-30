-- Fix RLS Policies - Remove duplicates and establish clean security

-- ============================================
-- 1. USERS TABLE - Fix policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "users_update_self_update" ON users;
DROP POLICY IF EXISTS "users_insert_self" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;

-- Create clean users policies
CREATE POLICY "users_read_own" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_new" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own" ON users
FOR DELETE USING (auth.uid() = id);

-- ============================================
-- 2. CREDIT_TRANSACTIONS TABLE - Fix policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "credit_tx_delete_own" ON credit_transactions;
DROP POLICY IF EXISTS "credit_tx_insert_own" ON credit_transactions;
DROP POLICY IF EXISTS "credit_tx_read_own" ON credit_transactions;
DROP POLICY IF EXISTS "credit_tx_update_own" ON credit_transactions;

-- Create clean credit_transactions policies
CREATE POLICY "tx_select_own" ON credit_transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tx_insert_own" ON credit_transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tx_update_own" ON credit_transactions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tx_delete_own" ON credit_transactions
FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. CREDIT_PACKAGES TABLE - Fix policies
-- ============================================
DROP POLICY IF EXISTS "Everyone can view packages" ON credit_packages;
DROP POLICY IF EXISTS "credit_packages_admin_delete" ON credit_packages;
DROP POLICY IF EXISTS "credit_packages_read_authenticated_v2" ON credit_packages;
DROP POLICY IF EXISTS "credit_packages_read_authenticated" ON credit_packages;
DROP POLICY IF EXISTS "credit_packages_admin_update" ON credit_packages;
DROP POLICY IF EXISTS "credit_packages_admin_insert" ON credit_packages;

-- Create clean credit_packages policies
-- Public read - anyone can view active packages
CREATE POLICY "packages_select_public" ON credit_packages
FOR SELECT USING (is_active = true);

-- Admin insert (service role only)
CREATE POLICY "packages_insert_admin" ON credit_packages
FOR INSERT WITH CHECK (false);

-- Admin update (service role only)
CREATE POLICY "packages_update_admin" ON credit_packages
FOR UPDATE USING (false);

-- Admin delete (service role only)
CREATE POLICY "packages_delete_admin" ON credit_packages
FOR DELETE USING (false);

-- ============================================
-- 4. USER_CREDITS TABLE - Fix policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "System can update credits" ON user_credits;
DROP POLICY IF EXISTS "user_credits_update_own" ON user_credits;
DROP POLICY IF EXISTS "user_credits_delete_own" ON user_credits;
DROP POLICY IF EXISTS "user_credits_insert_own" ON user_credits;
DROP POLICY IF EXISTS "user_credits_read_own" ON user_credits;

-- Create clean user_credits policies
CREATE POLICY "credits_select_own" ON user_credits
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "credits_update_own" ON user_credits
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "credits_insert_own" ON user_credits
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "credits_delete_own" ON user_credits
FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. Verify RLS is properly enabled
-- ============================================
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
