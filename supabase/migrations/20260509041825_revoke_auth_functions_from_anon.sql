REVOKE EXECUTE ON FUNCTION public.is_super_admin()      FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin()            FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_manager()          FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_anon()             FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_manager_or_above() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_above()   FROM anon;