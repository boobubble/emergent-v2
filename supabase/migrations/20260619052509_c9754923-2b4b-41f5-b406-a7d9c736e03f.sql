
-- 1. user_devices: revoke ip_address SELECT from authenticated
REVOKE SELECT (ip_address) ON public.user_devices FROM authenticated;

-- 2. message_highlights: revoke buyer_id SELECT from authenticated
REVOKE SELECT (buyer_id) ON public.message_highlights FROM authenticated;

-- 3. url_rules: restrict reads to moderators/admins (clients use admin RPC paths)
DROP POLICY IF EXISTS "Anyone read url rules" ON public.url_rules;
CREATE POLICY "Mods read url rules" ON public.url_rules
  FOR SELECT TO authenticated
  USING (public.is_moderator(auth.uid()));

-- 4. room_moderators: restrict reads to moderators/admins
DROP POLICY IF EXISTS "Anyone read room mods" ON public.room_moderators;
CREATE POLICY "Mods read room mods" ON public.room_moderators
  FOR SELECT TO authenticated
  USING (public.is_moderator(auth.uid()));

-- 5. Remove profiles from realtime publication to stop broadcasting coins/xp/etc
ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
