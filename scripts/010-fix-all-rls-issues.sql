-- Fix all RLS performance issues and duplicate policies

-- ============================================================================
-- 1. FIX CREDIT TRANSACTIONS TABLE - Optimize auth.uid() calls
-- ============================================================================

-- Drop existing suboptimal policies
DROP POLICY IF EXISTS tx_insert_own ON public.credit_transactions CASCADE;
DROP POLICY IF EXISTS tx_select_own ON public.credit_transactions CASCADE;
DROP POLICY IF EXISTS tx_update_own ON public.credit_transactions CASCADE;
DROP POLICY IF EXISTS tx_delete_own ON public.credit_transactions CASCADE;

-- Recreate with optimized subquery syntax
CREATE POLICY tx_insert_own ON public.credit_transactions
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY tx_select_own ON public.credit_transactions
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY tx_update_own ON public.credit_transactions
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY tx_delete_own ON public.credit_transactions
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 2. FIX USER CREDITS TABLE - Remove duplicate/multiple permissive policies
-- ============================================================================

-- Drop all duplicate policies on user_credits
DROP POLICY IF EXISTS credits_insert_own ON public.user_credits CASCADE;
DROP POLICY IF EXISTS credits_self_access ON public.user_credits CASCADE;
DROP POLICY IF EXISTS credits_select_own ON public.user_credits CASCADE;
DROP POLICY IF EXISTS credits_update_own ON public.user_credits CASCADE;
DROP POLICY IF EXISTS credits_delete_own ON public.user_credits CASCADE;

-- Create single, optimized policies for each action
CREATE POLICY credits_insert_own ON public.user_credits
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY credits_select_own ON public.user_credits
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY credits_update_own ON public.user_credits
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY credits_delete_own ON public.user_credits
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 3. FIX DUPLICATE INDEXES ON USERS TABLE
-- ============================================================================

-- Drop duplicate index (keep idx_users_id, drop idx_users_id_rls if it exists)
DROP INDEX IF EXISTS public.idx_users_id_rls;
