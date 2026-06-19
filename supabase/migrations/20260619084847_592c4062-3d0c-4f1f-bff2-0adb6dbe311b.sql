
-- 1. Catalog table
CREATE TABLE public.feed_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_coins integer NOT NULL DEFAULT 0,
  unlock_mode text NOT NULL DEFAULT 'lifetime' CHECK (unlock_mode IN ('lifetime','days_30','days_7')),
  duration_days integer,
  enabled boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  preview_url text,
  accent_hex text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feed_themes TO authenticated;
GRANT SELECT ON public.feed_themes TO anon;
GRANT ALL ON public.feed_themes TO service_role;

ALTER TABLE public.feed_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled feed themes"
  ON public.feed_themes FOR SELECT
  USING (enabled OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage feed themes"
  ON public.feed_themes FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER feed_themes_updated_at
  BEFORE UPDATE ON public.feed_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Per-user unlocks
CREATE TABLE public.user_feed_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_key text NOT NULL REFERENCES public.feed_themes(theme_key) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  source text NOT NULL DEFAULT 'purchase',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, theme_key)
);

GRANT SELECT ON public.user_feed_themes TO authenticated;
GRANT ALL ON public.user_feed_themes TO service_role;

ALTER TABLE public.user_feed_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own unlocks"
  ON public.user_feed_themes FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage unlocks"
  ON public.user_feed_themes FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX user_feed_themes_user_idx ON public.user_feed_themes(user_id);

-- 3. Active theme on profile
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_feed_theme text DEFAULT 'boobubble_default';

-- 4. Seed catalog
INSERT INTO public.feed_themes (theme_key, name, description, price_coins, unlock_mode, is_default, sort_order, accent_hex)
VALUES
  ('boobubble_default', 'BooBubble Default Feed', 'The classic BooBubble feed experience', 0, 'lifetime', true, 0, '#7c3aed'),
  ('facebook_classic', 'Facebook Classic', 'Blue accents, clean cards, familiar social layout', 500, 'lifetime', false, 10, '#1877f2'),
  ('instagram', 'Instagram Theme', 'Gradient accents, glossy UI, image-heavy cards', 700, 'lifetime', false, 20, '#e1306c'),
  ('twitter_x', 'Twitter / X Theme', 'Compact posts, minimal layout, fast scrolling', 700, 'lifetime', false, 30, '#0f1419'),
  ('reddit', 'Reddit Theme', 'Discussion-first layout, threaded comments, community styling', 900, 'lifetime', false, 40, '#ff4500'),
  ('orkut_retro', 'Orkut Retro Theme', 'Purple accents, nostalgic design, scrapbook style', 1500, 'lifetime', false, 50, '#a855f7'),
  ('neon_glass', 'Neon Glass Theme', 'Glassmorphism, neon glow, premium animations', 2500, 'lifetime', false, 60, '#22d3ee')
ON CONFLICT (theme_key) DO NOTHING;

-- 5. Helpers + RPCs
-- Resolve effective theme (respects expiry; falls back to default)
CREATE OR REPLACE FUNCTION public.get_active_feed_theme(_user uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH chosen AS (
    SELECT active_feed_theme FROM public.profiles WHERE id = _user
  ),
  valid AS (
    SELECT uft.theme_key
    FROM public.user_feed_themes uft
    JOIN chosen c ON c.active_feed_theme = uft.theme_key
    WHERE uft.user_id = _user
      AND (uft.expires_at IS NULL OR uft.expires_at > now())
    UNION ALL
    SELECT 'boobubble_default'
    FROM chosen c
    WHERE c.active_feed_theme = 'boobubble_default'
  )
  SELECT COALESCE((SELECT theme_key FROM valid LIMIT 1), 'boobubble_default');
$$;

-- Unlock + charge coins
CREATE OR REPLACE FUNCTION public.unlock_feed_theme(_theme_key text)
RETURNS public.user_feed_themes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  t public.feed_themes;
  bal int;
  exp timestamptz;
  result public.user_feed_themes;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT * INTO t FROM public.feed_themes WHERE theme_key = _theme_key AND enabled;
  IF NOT FOUND THEN RAISE EXCEPTION 'Theme not available'; END IF;

  IF t.is_default OR t.price_coins = 0 THEN
    INSERT INTO public.user_feed_themes (user_id, theme_key, source)
    VALUES (uid, t.theme_key, 'free')
    ON CONFLICT (user_id, theme_key) DO UPDATE SET expires_at = NULL
    RETURNING * INTO result;
    RETURN result;
  END IF;

  -- Check existing non-expired unlock
  SELECT * INTO result FROM public.user_feed_themes
   WHERE user_id = uid AND theme_key = t.theme_key
     AND (expires_at IS NULL OR expires_at > now());
  IF FOUND THEN RETURN result; END IF;

  SELECT coins INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF bal < t.price_coins THEN
    RAISE EXCEPTION 'Not enough coins (need %, have %)', t.price_coins, bal;
  END IF;

  UPDATE public.profiles SET coins = coins - t.price_coins WHERE id = uid;

  INSERT INTO public.coin_transactions (user_id, kind, amount, reason, target_type, target_id)
  VALUES (uid, 'coins', -t.price_coins, 'feed_theme_unlock:' || t.theme_key, 'feed_theme', NULL);

  exp := CASE t.unlock_mode
    WHEN 'days_30' THEN now() + interval '30 days'
    WHEN 'days_7'  THEN now() +  interval '7 days'
    ELSE NULL
  END;

  INSERT INTO public.user_feed_themes (user_id, theme_key, expires_at, source)
  VALUES (uid, t.theme_key, exp, 'purchase')
  ON CONFLICT (user_id, theme_key) DO UPDATE
    SET expires_at = EXCLUDED.expires_at, unlocked_at = now(), source = 'purchase'
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- Activate theme (must be unlocked & not expired, or be default)
CREATE OR REPLACE FUNCTION public.activate_feed_theme(_theme_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  ok boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  IF _theme_key = 'boobubble_default' THEN
    UPDATE public.profiles SET active_feed_theme = 'boobubble_default' WHERE id = uid;
    RETURN 'boobubble_default';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.user_feed_themes uft
    JOIN public.feed_themes ft ON ft.theme_key = uft.theme_key
    WHERE uft.user_id = uid
      AND uft.theme_key = _theme_key
      AND ft.enabled
      AND (uft.expires_at IS NULL OR uft.expires_at > now())
  ) INTO ok;

  IF NOT ok THEN RAISE EXCEPTION 'Theme not unlocked'; END IF;

  UPDATE public.profiles SET active_feed_theme = _theme_key WHERE id = uid;
  RETURN _theme_key;
END;
$$;

-- Admin grant
CREATE OR REPLACE FUNCTION public.admin_grant_feed_theme(_user uuid, _theme_key text, _days integer DEFAULT NULL)
RETURNS public.user_feed_themes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  exp timestamptz;
  result public.user_feed_themes;
BEGIN
  IF NOT public.is_admin(caller) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _days IS NOT NULL AND _days > 0 THEN exp := now() + make_interval(days => _days); END IF;

  INSERT INTO public.user_feed_themes (user_id, theme_key, expires_at, source)
  VALUES (_user, _theme_key, exp, 'admin_grant')
  ON CONFLICT (user_id, theme_key) DO UPDATE
    SET expires_at = EXCLUDED.expires_at, unlocked_at = now(), source = 'admin_grant'
  RETURNING * INTO result;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_feed_theme(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.unlock_feed_theme(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_feed_theme(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_feed_theme(uuid, text, integer) TO authenticated;

-- Also update the user deletion cascade to clean up
CREATE OR REPLACE FUNCTION public.delete_user_cascade(_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF _user IS NULL THEN RETURN; END IF;

  DELETE FROM public.messages WHERE author_id = _user;
  DELETE FROM public.message_highlights WHERE user_id = _user;
  DELETE FROM public.dm_reads WHERE user_id = _user;
  DELETE FROM public.friendships WHERE sender_id = _user OR receiver_id = _user;
  DELETE FROM public.notifications WHERE user_id = _user OR actor_id = _user;
  DELETE FROM public.reactions WHERE user_id = _user;
  DELETE FROM public.comments WHERE author_id = _user;
  DELETE FROM public.posts WHERE owner_id = _user OR author_id = _user;
  DELETE FROM public.post_boosts WHERE user_id = _user;
  DELETE FROM public.confession_reactions WHERE user_id = _user;
  DELETE FROM public.confession_replies WHERE author_id = _user;
  DELETE FROM public.confessions WHERE author_id = _user;
  DELETE FROM public.feedback_votes WHERE user_id = _user;
  DELETE FROM public.feedback_comments WHERE author_id = _user;
  DELETE FROM public.feedback_reports WHERE author_id = _user;
  DELETE FROM public.game_invites WHERE sender_id = _user OR receiver_id = _user;
  DELETE FROM public.game_players WHERE user_id = _user;
  DELETE FROM public.game_rewards WHERE user_id = _user;
  DELETE FROM public.games WHERE created_by = _user;
  DELETE FROM public.trio_room_members WHERE user_id = _user OR invited_by = _user;
  DELETE FROM public.trio_rooms WHERE owner_id = _user;
  DELETE FROM public.mod_notes WHERE user_id = _user OR author_id = _user;
  DELETE FROM public.mod_logs WHERE target_user_id = _user OR actor_id = _user;
  DELETE FROM public.reports WHERE reporter_id = _user
    OR (target_type = 'user' AND target_id = _user);
  DELETE FROM public.user_bans WHERE user_id = _user;
  DELETE FROM public.user_mutes WHERE user_id = _user;
  DELETE FROM public.room_moderators WHERE user_id = _user;
  DELETE FROM public.coin_transactions WHERE user_id = _user;
  DELETE FROM public.user_inventory WHERE user_id = _user;
  DELETE FROM public.daily_missions WHERE user_id = _user;
  DELETE FROM public.room_loyalty WHERE user_id = _user;
  DELETE FROM public.user_feed_themes WHERE user_id = _user;
  DELETE FROM public.user_devices WHERE user_id = _user;
  DELETE FROM public.internal_link_clicks WHERE user_id = _user;
  DELETE FROM public.assistant_user_prefs WHERE user_id = _user;
  DELETE FROM public.ai_chatbots WHERE user_id = _user;
  DELETE FROM public.radio_announcements WHERE author_id = _user;
  DELETE FROM public.radio_schedules WHERE host_id = _user;
  UPDATE public.radio_queue_items SET added_by = NULL WHERE added_by = _user;
  UPDATE public.radio_widget_state SET current_host_id = NULL WHERE current_host_id = _user;
  UPDATE public.radio_widgets SET owner_id = NULL, created_by = NULL
    WHERE owner_id = _user OR created_by = _user;
  UPDATE public.custom_pages SET created_by = NULL WHERE created_by = _user;
  UPDATE public.url_rules SET created_by = NULL WHERE created_by = _user;
  UPDATE public.word_filters SET created_by = NULL WHERE created_by = _user;
  UPDATE public.banned_devices SET created_by = NULL WHERE created_by = _user;
  DELETE FROM public.user_roles WHERE user_id = _user;
  DELETE FROM public.profiles WHERE id = _user;
END;
$function$;
