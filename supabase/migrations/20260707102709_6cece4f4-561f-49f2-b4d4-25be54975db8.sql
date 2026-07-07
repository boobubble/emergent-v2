
-- =========================================================
-- DM Wallpapers & Conversation Themes
-- =========================================================

-- ---------- catalog ----------
CREATE TABLE public.dm_wallpapers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallpaper_key text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('solid','gradient','image','animated')),
  preview_url text,
  asset_url text,
  css_value text,          -- for solid/gradient wallpapers (e.g. hex or CSS gradient)
  price_coins integer NOT NULL DEFAULT 0 CHECK (price_coins >= 0),
  is_premium boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_limited boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dm_wallpapers_category_idx ON public.dm_wallpapers(category);
CREATE INDEX dm_wallpapers_enabled_idx  ON public.dm_wallpapers(enabled, sort_order);

GRANT SELECT ON public.dm_wallpapers TO anon, authenticated;
GRANT ALL    ON public.dm_wallpapers TO service_role;

ALTER TABLE public.dm_wallpapers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled wallpapers"
  ON public.dm_wallpapers FOR SELECT
  USING (enabled = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage wallpapers"
  ON public.dm_wallpapers FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER dm_wallpapers_touch
  BEFORE UPDATE ON public.dm_wallpapers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ---------- ownership ----------
CREATE TABLE public.user_dm_wallpapers (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper_key text NOT NULL REFERENCES public.dm_wallpapers(wallpaper_key) ON DELETE CASCADE,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'purchase',
  PRIMARY KEY (user_id, wallpaper_key)
);
CREATE INDEX user_dm_wallpapers_user_idx ON public.user_dm_wallpapers(user_id);

GRANT SELECT, INSERT, DELETE ON public.user_dm_wallpapers TO authenticated;
GRANT ALL ON public.user_dm_wallpapers TO service_role;

ALTER TABLE public.user_dm_wallpapers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallpaper unlocks"
  ON public.user_dm_wallpapers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users cannot self-insert (use purchase fn)"
  ON public.user_dm_wallpapers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins delete unlocks"
  ON public.user_dm_wallpapers FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));


-- ---------- purchase history ----------
CREATE TABLE public.dm_wallpaper_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper_key text NOT NULL REFERENCES public.dm_wallpapers(wallpaper_key) ON DELETE CASCADE,
  coins_spent integer NOT NULL DEFAULT 0,
  purchase_type text NOT NULL CHECK (purchase_type IN ('self','shared')),
  dm_channel_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dm_wallpaper_purchases_user_idx ON public.dm_wallpaper_purchases(user_id, created_at DESC);

GRANT SELECT ON public.dm_wallpaper_purchases TO authenticated;
GRANT ALL ON public.dm_wallpaper_purchases TO service_role;

ALTER TABLE public.dm_wallpaper_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallpaper purchases"
  ON public.dm_wallpaper_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));


-- ---------- personal per-DM theme ----------
CREATE TABLE public.dm_chat_themes (
  channel_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper_key text REFERENCES public.dm_wallpapers(wallpaper_key) ON DELETE SET NULL,
  opacity numeric NOT NULL DEFAULT 1 CHECK (opacity BETWEEN 0 AND 1),
  blur integer NOT NULL DEFAULT 0 CHECK (blur BETWEEN 0 AND 40),
  brightness numeric NOT NULL DEFAULT 1 CHECK (brightness BETWEEN 0.3 AND 1.5),
  overlay numeric NOT NULL DEFAULT 0 CHECK (overlay BETWEEN 0 AND 1),
  bubble_accent text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);
CREATE INDEX dm_chat_themes_user_idx ON public.dm_chat_themes(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dm_chat_themes TO authenticated;
GRANT ALL ON public.dm_chat_themes TO service_role;

ALTER TABLE public.dm_chat_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own DM themes"
  ON public.dm_chat_themes FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND channel_id LIKE 'dm:%'
    AND position(auth.uid()::text in channel_id) > 0
  );

CREATE TRIGGER dm_chat_themes_touch
  BEFORE UPDATE ON public.dm_chat_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ---------- shared per-DM theme ----------
CREATE TABLE public.dm_shared_themes (
  channel_id text PRIMARY KEY,
  wallpaper_key text REFERENCES public.dm_wallpapers(wallpaper_key) ON DELETE SET NULL,
  applied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  opacity numeric NOT NULL DEFAULT 1 CHECK (opacity BETWEEN 0 AND 1),
  blur integer NOT NULL DEFAULT 0 CHECK (blur BETWEEN 0 AND 40),
  brightness numeric NOT NULL DEFAULT 1 CHECK (brightness BETWEEN 0.3 AND 1.5),
  overlay numeric NOT NULL DEFAULT 0 CHECK (overlay BETWEEN 0 AND 1),
  bubble_accent text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.dm_shared_themes TO authenticated;
GRANT ALL ON public.dm_shared_themes TO service_role;

ALTER TABLE public.dm_shared_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DM participants view shared theme"
  ON public.dm_shared_themes FOR SELECT
  TO authenticated
  USING (
    channel_id LIKE 'dm:%'
    AND position(auth.uid()::text in channel_id) > 0
  );

CREATE TRIGGER dm_shared_themes_touch
  BEFORE UPDATE ON public.dm_shared_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_shared_themes;


-- =========================================================
-- Purchase function
-- =========================================================
CREATE OR REPLACE FUNCTION public.purchase_dm_wallpaper(
  _wallpaper_key text,
  _purchase_type text,
  _channel_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  wp public.dm_wallpapers;
  bal int;
  already_owned boolean;
  spent int := 0;
  notice text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  IF _purchase_type NOT IN ('self','shared') THEN
    RAISE EXCEPTION 'Invalid purchase type';
  END IF;

  IF _purchase_type = 'shared' THEN
    IF _channel_id IS NULL OR _channel_id NOT LIKE 'dm:%' OR position(uid::text in _channel_id) = 0 THEN
      RAISE EXCEPTION 'Shared theme requires a DM channel you belong to';
    END IF;
  END IF;

  SELECT * INTO wp FROM public.dm_wallpapers WHERE wallpaper_key = _wallpaper_key AND enabled;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallpaper not available'; END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.user_dm_wallpapers WHERE user_id = uid AND wallpaper_key = _wallpaper_key
  ) INTO already_owned;

  -- Charge coins only if the purchaser doesn't own the wallpaper yet
  -- OR they're applying a paid theme to the shared conversation (shared always
  -- requires a live purchase record, even if the buyer already owned it — but
  -- we do NOT re-deduct if they already own it).
  IF wp.price_coins > 0 AND NOT already_owned THEN
    SELECT coins INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
    IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
    IF bal < wp.price_coins THEN
      RAISE EXCEPTION 'Not enough coins (need %, have %)', wp.price_coins, bal;
    END IF;
    UPDATE public.profiles SET coins = coins - wp.price_coins WHERE id = uid;
    spent := wp.price_coins;

    INSERT INTO public.coin_transactions (user_id, kind, amount, reason, ref_type, ref_id)
    VALUES (uid, 'coins', -wp.price_coins,
            'dm_wallpaper_unlock:' || wp.wallpaper_key, 'dm_wallpaper', NULL);
  END IF;

  IF NOT already_owned THEN
    INSERT INTO public.user_dm_wallpapers (user_id, wallpaper_key, source)
    VALUES (uid, _wallpaper_key, CASE WHEN wp.price_coins = 0 THEN 'free' ELSE 'purchase' END)
    ON CONFLICT (user_id, wallpaper_key) DO NOTHING;
  END IF;

  INSERT INTO public.dm_wallpaper_purchases (user_id, wallpaper_key, coins_spent, purchase_type, dm_channel_id)
  VALUES (uid, _wallpaper_key, spent, _purchase_type, _channel_id);

  IF _purchase_type = 'shared' THEN
    INSERT INTO public.dm_shared_themes (channel_id, wallpaper_key, applied_by, updated_at)
    VALUES (_channel_id, _wallpaper_key, uid, now())
    ON CONFLICT (channel_id) DO UPDATE
      SET wallpaper_key = EXCLUDED.wallpaper_key,
          applied_by    = EXCLUDED.applied_by,
          updated_at    = now();

    notice := '🎨 ' ||
      COALESCE((SELECT username FROM public.profiles WHERE id = uid), 'Someone') ||
      ' applied the "' || wp.name || '" conversation theme.';

    INSERT INTO public.messages (channel_id, author_id, text, created_at)
    VALUES (_channel_id, uid, notice, now());
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'already_owned', already_owned,
    'coins_spent', spent,
    'wallpaper_key', _wallpaper_key
  );
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_dm_wallpaper(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_dm_wallpaper(text,text,text) TO authenticated;


-- =========================================================
-- Seed catalog
-- =========================================================
INSERT INTO public.dm_wallpapers (wallpaper_key, name, category, kind, css_value, price_coins, is_premium, is_featured, sort_order) VALUES
  ('solid-midnight',   'Midnight',         'Dark',              'solid',    '#0b1220',                                                       0,   false, false, 10),
  ('solid-cream',      'Warm Cream',       'Minimal',           'solid',    '#f7efe4',                                                       0,   false, false, 11),
  ('solid-forest',     'Forest',           'Nature',            'solid',    '#0f2c1e',                                                       0,   false, false, 12),
  ('grad-sunset',      'Sunset Bloom',     'Romantic',          'gradient', 'linear-gradient(135deg,#ff8ab3 0%,#ffb27a 50%,#ffd28a 100%)',   50,  false, true,  20),
  ('grad-galaxy',      'Galaxy Dreams',    'Space',             'gradient', 'linear-gradient(140deg,#0f0032 0%,#3d1b6b 45%,#8046d9 100%)',   80,  false, true,  21),
  ('grad-ocean',       'Ocean Breeze',     'Nature',            'gradient', 'linear-gradient(160deg,#0b3a52 0%,#177591 50%,#78d3e5 100%)',   60,  false, false, 22),
  ('grad-neon',        'Neon Pulse',       'Neon',              'gradient', 'linear-gradient(135deg,#0b0033 0%,#ff00c8 50%,#00e5ff 100%)',   120, true,  true,  23),
  ('grad-mint',        'Mint Fresh',       'Minimal',           'gradient', 'linear-gradient(160deg,#e8fff2 0%,#c8f2dd 100%)',               40,  false, false, 24),
  ('grad-rose',        'Rose Petals',      'Romantic',          'gradient', 'linear-gradient(160deg,#ffe8ef 0%,#ff9fbf 100%)',               60,  false, false, 25),
  ('grad-arcade',      'Arcade',           'Gaming',            'gradient', 'linear-gradient(135deg,#160041 0%,#7a00ff 50%,#00ffd1 100%)',   150, true,  false, 26),
  ('grad-cotton',      'Cotton Candy',     'Cute',              'gradient', 'linear-gradient(160deg,#fbc2eb 0%,#a6c1ee 100%)',               50,  false, false, 27),
  ('grad-aurora',      'Aurora',           'Space',             'gradient', 'linear-gradient(160deg,#001a2e 0%,#0b6e6b 45%,#8fe0a9 100%)',   180, true,  true,  28),
  ('grad-crimson',     'Crimson Night',    'Dark',              'gradient', 'linear-gradient(160deg,#160003 0%,#5a0018 60%,#a10030 100%)',   90,  false, false, 29),
  ('grad-holiday',     'Holiday Lights',   'Seasonal',          'gradient', 'linear-gradient(160deg,#0b2b13 0%,#c40c1c 100%)',               120, false, false, 30),
  ('grad-monarch',     'Monarch',          'Premium Exclusive', 'gradient', 'linear-gradient(160deg,#1a0033 0%,#c9a227 60%,#fff2c1 100%)',   300, true,  true,  31)
ON CONFLICT (wallpaper_key) DO NOTHING;
