-- Lock down dj_broadcast_credentials: remove all client-facing SELECT access.
-- Sensitive streaming credentials (passwords, hosts) must only be read by
-- trusted server-side code via the service role.

DROP POLICY IF EXISTS "Admins can select dj credentials" ON public.dj_broadcast_credentials;
DROP POLICY IF EXISTS "Deny non-admin select on dj credentials" ON public.dj_broadcast_credentials;
DROP POLICY IF EXISTS "Admins manage dj credentials" ON public.dj_broadcast_credentials;
DROP POLICY IF EXISTS "Admin select dj credentials" ON public.dj_broadcast_credentials;

-- Revoke all data API privileges from client roles
REVOKE ALL ON public.dj_broadcast_credentials FROM anon;
REVOKE ALL ON public.dj_broadcast_credentials FROM authenticated;

-- Ensure RLS stays enabled (default deny for any remaining role)
ALTER TABLE public.dj_broadcast_credentials ENABLE ROW LEVEL SECURITY;

-- Service role retains full access for server-side functions
GRANT ALL ON public.dj_broadcast_credentials TO service_role;