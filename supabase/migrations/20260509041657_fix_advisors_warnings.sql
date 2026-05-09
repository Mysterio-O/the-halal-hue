-- ============================================================
-- FIX 1: Revoke public EXECUTE on all helper functions
-- (stops authenticated users from calling them via /rpc/)
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.is_super_admin()      FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin()            FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_manager()          FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_anon()             FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_manager_or_above() FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_above()   FROM PUBLIC, authenticated;

-- Grant EXECUTE back only to postgres (so RLS policies can still use them internally)
GRANT EXECUTE ON FUNCTION public.is_super_admin()      TO postgres;
GRANT EXECUTE ON FUNCTION public.is_admin()            TO postgres;
GRANT EXECUTE ON FUNCTION public.is_manager()          TO postgres;
GRANT EXECUTE ON FUNCTION public.is_anon()             TO postgres;
GRANT EXECUTE ON FUNCTION public.is_manager_or_above() TO postgres;
GRANT EXECUTE ON FUNCTION public.is_admin_or_above()   TO postgres;


-- ============================================================
-- FIX 2: Add SET search_path on all functions
-- (prevents search_path hijacking attacks)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_role = 'SUPER_ADMIN'
    AND user_status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_role = 'ADMIN'
    AND user_status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_role = 'MANAGER'
    AND user_status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.is_anon()
RETURNS BOOLEAN AS $$
  SELECT auth.role() = 'anon';
$$ LANGUAGE sql STABLE
   SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS BOOLEAN AS $$
  SELECT public.is_manager() OR public.is_admin() OR public.is_super_admin();
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.is_admin_or_above()
RETURNS BOOLEAN AS $$
  SELECT public.is_admin() OR public.is_super_admin();
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth;


-- ============================================================
-- FIX 3: Drop the broad SELECT policy on product-photos bucket
-- (public buckets don't need a SELECT policy for URL access —
--  the policy was allowing directory listing which is a risk)
-- ============================================================

DROP POLICY IF EXISTS "product-photos: public read" ON storage.objects;