-- Hide author_id from authenticated users on confessions/replies to prevent de-anonymization.
-- Server code uses service_role (supabaseAdmin) which is not affected; admins still read via has_role.
REVOKE SELECT (author_id) ON public.confessions FROM authenticated, anon;
REVOKE SELECT (author_id) ON public.confession_replies FROM authenticated, anon;

-- Hide ip_address from banned users on user_bans (mirror user_devices pattern).
REVOKE SELECT (ip_address) ON public.user_bans FROM authenticated, anon;

-- Hide device_info from non-author viewers on showcased feedback reports.
REVOKE SELECT (device_info) ON public.feedback_reports FROM authenticated, anon;