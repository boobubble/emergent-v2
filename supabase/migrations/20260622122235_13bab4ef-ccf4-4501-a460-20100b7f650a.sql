
-- ============ user_bans: stop leaking ip_address / created_by ============
DROP POLICY IF EXISTS "User can read own ban" ON public.user_bans;

CREATE OR REPLACE VIEW public.user_bans_self
WITH (security_invoker = on) AS
SELECT id, user_id, reason, expires_at, active, created_at, ban_type
FROM public.user_bans
WHERE auth.uid() = user_id;

GRANT SELECT ON public.user_bans_self TO authenticated;

-- ============ confessions: safe public-feed view ============
CREATE OR REPLACE VIEW public.confessions_public
WITH (security_invoker = on) AS
SELECT
  id,
  NULL::uuid AS author_id,
  display_mode,
  alias,
  avatar_emoji,
  category,
  kind,
  text,
  image_url,
  poll,
  status,
  is_pinned,
  is_featured,
  like_count,
  reply_count,
  expires_at,
  created_at,
  updated_at
FROM public.confessions
WHERE status = 'approved'
  AND (expires_at IS NULL OR expires_at > now());

-- Allow authenticated users to read approved confessions through the
-- view (the view filters columns; rows still flow through the table's
-- RLS, so we add a narrow SELECT policy scoped to the view's filter).
DROP POLICY IF EXISTS "Read approved confessions via view" ON public.confessions;
CREATE POLICY "Read approved confessions via view" ON public.confessions
FOR SELECT TO authenticated
USING (status = 'approved' AND (expires_at IS NULL OR expires_at > now()));

GRANT SELECT ON public.confessions_public TO authenticated;
