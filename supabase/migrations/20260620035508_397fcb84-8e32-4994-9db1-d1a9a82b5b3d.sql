
-- Profile privacy columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_views_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS profile_views_anonymous boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_views_friends_only boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_views_unlocked_full boolean NOT NULL DEFAULT false;

-- profile_views table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  anonymous boolean NOT NULL DEFAULT false,
  CONSTRAINT no_self_view CHECK (viewer_id <> profile_owner_id),
  UNIQUE (viewer_id, profile_owner_id)
);

CREATE INDEX IF NOT EXISTS profile_views_owner_idx ON public.profile_views(profile_owner_id, viewed_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_views TO authenticated;
GRANT ALL ON public.profile_views TO service_role;

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Owners can read their own visitor rows; viewers can read their own outgoing rows.
CREATE POLICY "Owner reads own visitors" ON public.profile_views
  FOR SELECT TO authenticated
  USING (profile_owner_id = auth.uid() OR viewer_id = auth.uid());

-- All write paths go through SECURITY DEFINER RPCs; no direct INSERT/UPDATE/DELETE policies.

-- Record a profile view with 30-minute dedupe.
CREATE OR REPLACE FUNCTION public.record_profile_view(_owner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  viewer_anon boolean;
  owner_enabled boolean;
  owner_friends_only boolean;
BEGIN
  IF uid IS NULL OR _owner_id IS NULL OR uid = _owner_id THEN RETURN; END IF;

  SELECT profile_views_enabled, profile_views_friends_only
    INTO owner_enabled, owner_friends_only
    FROM public.profiles WHERE id = _owner_id;
  IF NOT COALESCE(owner_enabled, true) THEN RETURN; END IF;

  IF COALESCE(owner_friends_only, false) AND NOT public.has_friendship(uid, _owner_id) THEN
    RETURN;
  END IF;

  SELECT COALESCE(profile_views_anonymous, false) INTO viewer_anon
    FROM public.profiles WHERE id = uid;

  INSERT INTO public.profile_views (viewer_id, profile_owner_id, anonymous)
  VALUES (uid, _owner_id, viewer_anon)
  ON CONFLICT (viewer_id, profile_owner_id) DO UPDATE
    SET viewed_at = CASE
          WHEN public.profile_views.viewed_at < now() - interval '30 minutes' THEN now()
          ELSE public.profile_views.viewed_at
        END,
        anonymous = EXCLUDED.anonymous;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_profile_view(uuid) TO authenticated;

-- Get visitors of the current user with anonymity + free-tier limits handled server-side.
CREATE OR REPLACE FUNCTION public.get_my_profile_visitors(_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  viewer_id uuid,
  viewed_at timestamptz,
  anonymous boolean,
  username text,
  avatar_url text,
  avatar_color text,
  locked boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  unlocked boolean;
  cap int;
  total int;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  SELECT COALESCE(profile_views_unlocked_full, false) INTO unlocked
    FROM public.profiles WHERE id = uid;
  cap := LEAST(GREATEST(COALESCE(_limit, 20), 1), 50);
  IF NOT unlocked THEN cap := LEAST(cap, 5); END IF;

  SELECT count(*) INTO total FROM public.profile_views WHERE profile_owner_id = uid;

  RETURN QUERY
  SELECT pv.id,
         CASE WHEN pv.anonymous THEN NULL ELSE pv.viewer_id END,
         pv.viewed_at,
         pv.anonymous,
         CASE WHEN pv.anonymous THEN NULL ELSE p.username END,
         CASE WHEN pv.anonymous THEN NULL ELSE p.avatar_url END,
         CASE WHEN pv.anonymous THEN NULL ELSE p.avatar_color END,
         (NOT unlocked AND total > 5) AS locked
  FROM public.profile_views pv
  LEFT JOIN public.profiles p ON p.id = pv.viewer_id
  WHERE pv.profile_owner_id = uid
  ORDER BY pv.viewed_at DESC
  LIMIT cap;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_profile_visitors(int) TO authenticated;

-- Coin unlock for full visitor history.
CREATE OR REPLACE FUNCTION public.unlock_profile_visitor_history()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cost int := 300;
  bal int;
  already boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT profile_views_unlocked_full, coins INTO already, bal
    FROM public.profiles WHERE id = uid FOR UPDATE;
  IF already THEN RETURN true; END IF;
  IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF bal < cost THEN RAISE EXCEPTION 'Not enough coins (need %, have %)', cost, bal; END IF;

  UPDATE public.profiles
    SET coins = coins - cost,
        profile_views_unlocked_full = true
    WHERE id = uid;

  INSERT INTO public.coin_transactions (user_id, kind, amount, reason, ref_type, ref_id)
  VALUES (uid, 'coins', -cost, 'profile_visitor_history_unlock', 'profile_views', NULL);

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_profile_visitor_history() TO authenticated;
