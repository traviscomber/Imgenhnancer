-- Optimize RLS policies to use subqueries instead of direct auth calls
-- This prevents re-evaluation of auth.uid() for each row

-- Drop existing problematic policies
DROP POLICY IF EXISTS user_s_read_own ON public.users;
DROP POLICY IF EXISTS user_s_update_own ON public.users;
DROP POLICY IF EXISTS credits_update_own ON public.user_credits;
DROP POLICY IF EXISTS credits_insert_own ON public.user_credits;
DROP POLICY IF EXISTS credits_select_own ON public.user_credits;

-- Recreate with optimized subquery syntax
-- Users table - SELECT policy
CREATE POLICY user_s_read_own ON public.users
  FOR SELECT
  USING (id = (SELECT auth.uid()));

-- Users table - UPDATE policy
CREATE POLICY user_s_update_own ON public.users
  FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- User credits table - SELECT policy
CREATE POLICY credits_select_own ON public.user_credits
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- User credits table - INSERT policy
CREATE POLICY credits_insert_own ON public.user_credits
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- User credits table - UPDATE policy
CREATE POLICY credits_update_own ON public.user_credits
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- User credits table - DELETE policy
CREATE POLICY credits_delete_own ON public.user_credits
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));
