REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM anon, public;
-- has_role still needs authenticated EXECUTE for RLS policy use
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;