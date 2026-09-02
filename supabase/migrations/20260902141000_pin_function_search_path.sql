-- Fix Supabase security advisor: function_search_path_mutable
-- Pin a fixed search_path on flagged SECURITY DEFINER functions so their name
-- resolution can't be hijacked via a mutable/role search_path.
--
-- is_admin_or_moderator() and enforce_post_status() reference unqualified public
-- objects (user_roles / is_admin_or_moderator); the pgmq wrappers only call
-- schema-qualified pgmq.* . Pinning to `public` is safe for all six and satisfies
-- the linter. Re-runnable (ALTER ... SET is idempotent).
ALTER FUNCTION public.is_admin_or_moderator() SET search_path = public;
ALTER FUNCTION public.enforce_post_status() SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
