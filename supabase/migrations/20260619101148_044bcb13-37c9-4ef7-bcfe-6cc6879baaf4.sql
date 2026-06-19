-- Hide author_id of confessions and confession_replies from direct table reads.
-- Server-side RPCs (SECURITY DEFINER) and admin clients keep full access.
-- The frontend already goes through server functions for these reads.

-- confessions: revoke table SELECT, grant per-column except author_id
REVOKE SELECT ON public.confessions FROM anon, authenticated;
GRANT SELECT (
  id, display_mode, alias, avatar_emoji, category, kind, text, image_url,
  poll, status, is_pinned, is_featured, like_count, reply_count,
  expires_at, created_at, updated_at
) ON public.confessions TO anon, authenticated;

-- confession_replies: same treatment
REVOKE SELECT ON public.confession_replies FROM anon, authenticated;
GRANT SELECT (
  id, confession_id, alias, avatar_emoji, is_anonymous, text, created_at
) ON public.confession_replies TO anon, authenticated;