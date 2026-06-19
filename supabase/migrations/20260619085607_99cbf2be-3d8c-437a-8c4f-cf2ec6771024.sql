
CREATE TABLE public.chat_themes (
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

GRANT SELECT ON public.chat_themes TO authenticated;
GRANT SELECT ON public.chat_themes TO anon;
GRANT ALL ON public.chat_themes TO service_role;

ALTER TABLE public.chat_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled chat themes"
  ON public.chat_themes FOR SELECT
  USING (enabled OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage chat themes"
  ON public.chat_themes FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER chat_themes_updated_at
  BEFORE UPDATE ON public.chat_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_chat_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_key text NOT NULL REFERENCES public.chat_themes(theme_key) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  source text NOT NULL DEFAULT 'purchase',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, theme_key)
);

GRANT SELECT ON public.user_chat_themes TO authenticated;
GRANT ALL ON public.user_chat_themes TO service_role;

ALTER TABLE public.user_chat_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own chat unlocks"
  ON public.user_chat_themes FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage chat unlocks"
  ON public.user_chat_themes FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX user_chat_themes_user_idx ON public.user_chat_themes(user_id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_chat_theme text DEFAULT 'boobubble_default_chat';

INSERT INTO public.chat_themes (theme_key, name, description, price_coins, unlock_mode, is_default, sort_order, accent_hex)
VALUES
  ('boobubble_default_chat', 'BooBubble Default Chat', 'The classic BooBubble chatroom experience', 0, 'lifetime', true, 0, '#7ed321'),
  ('discord', 'Discord Theme', 'Dark layout, gaming vibe, clean sidebars', 800, 'lifetime', false, 10, '#5865f2'),
  ('yahoo_messenger', 'Yahoo Messenger Theme', 'Retro gradients, nostalgic messenger UI', 1200, 'lifetime', false, 20, '#7b0099'),
  ('whatsapp', 'WhatsApp Theme', 'Green accents, message bubbles, mobile-friendly', 1000, 'lifetime', false, 30, '#25d366'),
  ('cyber_neon', 'Cyber Neon Theme', 'Black background, neon glow, DJ/radio vibe', 1800, 'lifetime', false, 40, '#22d3ee'),
  ('minimal_modern', 'Minimal Modern Theme', 'Clean UI, premium spacing, subtle shadows', 1400, 'lifetime', false, 50, '#0f172a'),
  ('vip_gold', 'VIP Gold Theme', 'Luxury gold accents, animated glow, premium visual effects', 3500, 'lifetime', false, 60, '#d4af37')
ON CONFLICT (theme_key) DO NOTHING;

-- Resolve effective chat theme: global override > user pick (if unlocked & not expired) > default
CREATE OR REPLACE FUNCTION public.get_active_chat_theme(_user uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  override_key text;
  chosen text;
  ok boolean;
BEGIN
  SELECT value::text INTO override_key FROM public.app_settings WHERE key = 'chat_theme_override';
  override_key := NULLIF(REPLACE(COALESCE(override_key,''), '"', ''), '');
  IF override_key IS NOT NULL AND override_key <> 'null' THEN
    IF EXISTS (SELECT 1 FROM public.chat_themes WHERE theme_key = override_key AND enabled) THEN
      RETURN override_key;
    END IF;
  END IF;

  SELECT active_chat_theme INTO chosen FROM public.profiles WHERE id = _user;
  IF chosen IS NULL OR chosen = 'boobubble_default_chat' THEN
    RETURN 'boobubble_default_chat';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.user_chat_themes uct
    JOIN public.chat_themes ct ON ct.theme_key = uct.theme_key
    WHERE uct.user_id = _user
      AND uct.theme_key = chosen
      AND ct.enabled
      AND (uct.expires_at IS NULL OR uct.expires_at > now())
  ) INTO ok;

  IF ok THEN RETURN chosen; END IF;
  RETURN 'boobubble_default_chat';
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_chat_theme(_theme_key text)
RETURNS public.user_chat_themes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  t public.chat_themes;
  bal int;
  exp timestamptz;
  result public.user_chat_themes;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT * INTO t FROM public.chat_themes WHERE theme_key = _theme_key AND enabled;
  IF NOT FOUND THEN RAISE EXCEPTION 'Theme not available'; END IF;

  IF t.is_default OR t.price_coins = 0 THEN
    INSERT INTO public.user_chat_themes (user_id, theme_key, source)
    VALUES (uid, t.theme_key, 'free')
    ON CONFLICT (user_id, theme_key) DO UPDATE SET expires_at = NULL
    RETURNING * INTO result;
    RETURN result;
  END IF;

  SELECT * INTO result FROM public.user_chat_themes
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
  VALUES (uid, 'coins', -t.price_coins, 'chat_theme_unlock:' || t.theme_key, 'chat_theme', NULL);

  exp := CASE t.unlock_mode
    WHEN 'days_30' THEN now() + interval '30 days'
    WHEN 'days_7'  THEN now() +  interval '7 days'
    ELSE NULL
  END;

  INSERT INTO public.user_chat_themes (user_id, theme_key, expires_at, source)
  VALUES (uid, t.theme_key, exp, 'purchase')
  ON CONFLICT (user_id, theme_key) DO UPDATE
    SET expires_at = EXCLUDED.expires_at, unlocked_at = now(), source = 'purchase'
  RETURNING * INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_chat_theme(_theme_key text)
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

  IF _theme_key = 'boobubble_default_chat' THEN
    UPDATE public.profiles SET active_chat_theme = 'boobubble_default_chat' WHERE id = uid;
    RETURN 'boobubble_default_chat';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.user_chat_themes uct
    JOIN public.chat_themes ct ON ct.theme_key = uct.theme_key
    WHERE uct.user_id = uid
      AND uct.theme_key = _theme_key
      AND ct.enabled
      AND (uct.expires_at IS NULL OR uct.expires_at > now())
  ) INTO ok;

  IF NOT ok THEN RAISE EXCEPTION 'Theme not unlocked'; END IF;

  UPDATE public.profiles SET active_chat_theme = _theme_key WHERE id = uid;
  RETURN _theme_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_grant_chat_theme(_user uuid, _theme_key text, _days integer DEFAULT NULL)
RETURNS public.user_chat_themes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  exp timestamptz;
  result public.user_chat_themes;
BEGIN
  IF NOT public.is_admin(caller) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _days IS NOT NULL AND _days > 0 THEN exp := now() + make_interval(days => _days); END IF;

  INSERT INTO public.user_chat_themes (user_id, theme_key, expires_at, source)
  VALUES (_user, _theme_key, exp, 'admin_grant')
  ON CONFLICT (user_id, theme_key) DO UPDATE
    SET expires_at = EXCLUDED.expires_at, unlocked_at = now(), source = 'admin_grant'
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_chat_theme(_user uuid, _theme_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  DELETE FROM public.user_chat_themes WHERE user_id = _user AND theme_key = _theme_key;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_chat_theme(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.unlock_chat_theme(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_chat_theme(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_chat_theme(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_chat_theme(uuid, text) TO authenticated;

-- Extend cascade deletion
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
  DELETE FROM public.user_chat_themes WHERE user_id = _user;
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
