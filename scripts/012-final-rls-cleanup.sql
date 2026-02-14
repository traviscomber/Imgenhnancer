-- Final comprehensive RLS cleanup to resolve all Supabase warnings
-- Disables then re-enables RLS cleanly on all tables
-- Removes duplicate indexes

-- Temporarily disable RLS on tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS users_delete_own ON public.users CASCADE;
DROP POLICY IF EXISTS users_insert_new ON public.users CASCADE;
DROP POLICY IF EXISTS users_select_own ON public.users CASCADE;
DROP POLICY IF EXISTS users_update_own_consolidated ON public.users CASCADE;

DROP POLICY IF EXISTS tx_delete_own ON public.credit_transactions CASCADE;
DROP POLICY IF EXISTS tx_insert_own ON public.credit_transactions CASCADE;
DROP POLICY IF EXISTS tx_select_own ON public.credit_transactions CASCADE;
DROP POLICY IF EXISTS tx_update_own ON public.credit_transactions CASCADE;

DROP POLICY IF EXISTS credits_delete_own ON public.user_credits CASCADE;
DROP POLICY IF EXISTS credits_insert_own ON public.user_credits CASCADE;
DROP POLICY IF EXISTS credits_select_own ON public.user_credits CASCADE;
DROP POLICY IF EXISTS credits_update_own ON public.user_credits CASCADE;

DROP POLICY IF EXISTS packages_delete_admin ON public.credit_packages CASCADE;
DROP POLICY IF EXISTS packages_insert_admin ON public.credit_packages CASCADE;
DROP POLICY IF EXISTS packages_select_public ON public.credit_packages CASCADE;
DROP POLICY IF EXISTS packages_update_admin ON public.credit_packages CASCADE;

-- Drop redundant index on users table
DROP INDEX IF EXISTS idx_users_id;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Recreate USERS policies - clean, efficient
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Recreate CREDIT_TRANSACTIONS policies
CREATE POLICY tx_select_own ON public.credit_transactions
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY tx_insert_own ON public.credit_transactions
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY tx_update_own ON public.credit_transactions
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY tx_delete_own ON public.credit_transactions
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Recreate USER_CREDITS policies
CREATE POLICY credits_select_own ON public.user_credits
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY credits_insert_own ON public.user_credits
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY credits_update_own ON public.user_credits
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY credits_delete_own ON public.user_credits
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Recreate CREDIT_PACKAGES policies - public read-only
CREATE POLICY packages_select_public ON public.credit_packages
  FOR SELECT
  USING (true);
