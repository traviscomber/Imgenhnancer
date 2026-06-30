-- Fix users_read_own policy to use subquery for optimal performance
-- Prevents re-evaluation of auth.uid() for each row

DROP POLICY IF EXISTS users_read_own ON public.users CASCADE;

CREATE POLICY users_read_own ON public.users
  FOR SELECT
  USING (id = (SELECT auth.uid()));
