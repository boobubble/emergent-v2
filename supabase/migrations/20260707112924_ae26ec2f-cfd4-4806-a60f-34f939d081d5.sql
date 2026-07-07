
-- GAMIFICATION ENGINE ---------------------------------------------------

CREATE TABLE IF NOT EXISTS public.gam_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  event_type text NOT NULL,
  target integer NOT NULL DEFAULT 1,
  reward_coins integer NOT NULL DEFAULT 0,
  reward_xp integer NOT NULL DEFAULT 0,
  reward_badge text,
  reward_frame_id uuid,
  reward_wallpaper_id uuid,
  category text NOT NULL DEFAULT 'general',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_achievements TO anon, authenticated;
GRANT ALL   ON public.gam_achievements TO service_role;
ALTER TABLE public.gam_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_ach read"  ON public.gam_achievements FOR SELECT USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "gam_ach admin" ON public.gam_achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.gam_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  cadence text NOT NULL CHECK (cadence IN ('daily','weekly','monthly')),
  event_type text NOT NULL,
  target integer NOT NULL DEFAULT 1,
  reward_coins integer NOT NULL DEFAULT 0,
  reward_xp integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_quests TO anon, authenticated;
GRANT ALL   ON public.gam_quests TO service_role;
ALTER TABLE public.gam_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_q read"  ON public.gam_quests FOR SELECT USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "gam_q admin" ON public.gam_quests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.gam_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  event_type text NOT NULL,
  target integer NOT NULL,
  reward_coins integer NOT NULL DEFAULT 0,
  reward_xp integer NOT NULL DEFAULT 0,
  reward_badge text,
  reward_frame_id uuid,
  reward_wallpaper_id uuid,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_milestones TO anon, authenticated;
GRANT ALL   ON public.gam_milestones TO service_role;
ALTER TABLE public.gam_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_m read"  ON public.gam_milestones FOR SELECT USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "gam_m admin" ON public.gam_milestones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.gam_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_seasons TO anon, authenticated;
GRANT ALL   ON public.gam_seasons TO service_role;
ALTER TABLE public.gam_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_s read"  ON public.gam_seasons FOR SELECT USING (true);
CREATE POLICY "gam_s admin" ON public.gam_seasons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.gam_season_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.gam_seasons(id) ON DELETE CASCADE,
  tier integer NOT NULL,
  xp_required integer NOT NULL,
  reward_coins integer NOT NULL DEFAULT 0,
  reward_xp integer NOT NULL DEFAULT 0,
  reward_badge text,
  reward_frame_id uuid,
  reward_wallpaper_id uuid,
  premium_only boolean NOT NULL DEFAULT false,
  UNIQUE (season_id, tier)
);
GRANT SELECT ON public.gam_season_tiers TO anon, authenticated;
GRANT ALL   ON public.gam_season_tiers TO service_role;
ALTER TABLE public.gam_season_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_st read"  ON public.gam_season_tiers FOR SELECT USING (true);
CREATE POLICY "gam_st admin" ON public.gam_season_tiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.gam_user_achievements (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.gam_achievements(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  claimed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);
GRANT SELECT ON public.gam_user_achievements TO authenticated;
GRANT ALL   ON public.gam_user_achievements TO service_role;
ALTER TABLE public.gam_user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_ua self" ON public.gam_user_achievements FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.gam_user_quests (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES public.gam_quests(id) ON DELETE CASCADE,
  period_key text NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  claimed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quest_id, period_key)
);
GRANT SELECT ON public.gam_user_quests TO authenticated;
GRANT ALL   ON public.gam_user_quests TO service_role;
ALTER TABLE public.gam_user_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_uq self" ON public.gam_user_quests FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.gam_user_milestones (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id uuid NOT NULL REFERENCES public.gam_milestones(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, milestone_id)
);
GRANT SELECT ON public.gam_user_milestones TO authenticated;
GRANT ALL   ON public.gam_user_milestones TO service_role;
ALTER TABLE public.gam_user_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_um self" ON public.gam_user_milestones FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.gam_user_season (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES public.gam_seasons(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 0,
  tier integer NOT NULL DEFAULT 0,
  claimed_tiers integer[] NOT NULL DEFAULT '{}',
  premium boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, season_id)
);
GRANT SELECT ON public.gam_user_season TO authenticated;
GRANT ALL   ON public.gam_user_season TO service_role;
ALTER TABLE public.gam_user_season ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_us self" ON public.gam_user_season FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.gam_event_log (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  amount integer NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gam_event_log_user_time_idx ON public.gam_event_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS gam_event_log_type_time_idx ON public.gam_event_log (event_type, created_at DESC);
GRANT SELECT ON public.gam_event_log TO authenticated;
GRANT ALL   ON public.gam_event_log TO service_role;
ALTER TABLE public.gam_event_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_ev self"  ON public.gam_event_log FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));


-- Reward orchestrator ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.gam_award(
  _user_id uuid, _coins integer, _xp integer,
  _badge text, _reason text, _reference text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _coins IS NOT NULL AND _coins > 0 THEN
    BEGIN
      PERFORM public.wallet_apply(_user_id, _coins, 'credit', COALESCE(_reason,'gamification'), 'gamification', _reference, '{}'::jsonb);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.coin_transactions (user_id, amount, direction, reason, provider, reference_id, status)
      VALUES (_user_id, _coins, 'credit', COALESCE(_reason,'gamification'), 'gamification', _reference, 'completed');
      UPDATE public.profiles
         SET coins = COALESCE(coins,0) + _coins,
             coins_lifetime_earned = COALESCE(coins_lifetime_earned,0) + _coins
       WHERE id = _user_id;
    END;
  END IF;

  IF _xp IS NOT NULL AND _xp > 0 THEN
    UPDATE public.profiles SET xp = COALESCE(xp,0) + _xp WHERE id = _user_id;
  END IF;

  IF _badge IS NOT NULL AND _badge <> '' THEN
    UPDATE public.profiles
       SET badges = ARRAY(SELECT DISTINCT unnest(COALESCE(badges,'{}'::text[]) || ARRAY[_badge]))
     WHERE id = _user_id AND NOT (COALESCE(badges,'{}'::text[]) @> ARRAY[_badge]);
  END IF;

  BEGIN
    INSERT INTO public.notifications (user_id, kind, payload)
    VALUES (_user_id, 'gamification_reward', jsonb_build_object(
      'coins', _coins, 'xp', _xp, 'badge', _badge, 'reason', _reason, 'ref', _reference));
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END;
$$;
REVOKE ALL ON FUNCTION public.gam_award(uuid,integer,integer,text,text,text) FROM PUBLIC;


-- Period key helper ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.gam_period_key(_cadence text, _now timestamptz DEFAULT now())
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _cadence
    WHEN 'daily'   THEN to_char(_now AT TIME ZONE 'UTC','YYYY-MM-DD')
    WHEN 'weekly'  THEN to_char(_now AT TIME ZONE 'UTC','IYYY-"W"IW')
    WHEN 'monthly' THEN to_char(_now AT TIME ZONE 'UTC','YYYY-MM')
    ELSE 'lifetime' END;
$$;


-- Central event emitter --------------------------------------------------
CREATE OR REPLACE FUNCTION public.gam_emit(
  _user_id uuid, _event_type text,
  _amount integer DEFAULT 1, _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r record;
  new_progress integer;
  season_id_v uuid;
  new_tier integer;
BEGIN
  IF _user_id IS NULL OR _event_type IS NULL THEN RETURN; END IF;

  INSERT INTO public.gam_event_log (user_id, event_type, amount, metadata)
  VALUES (_user_id, _event_type, _amount, COALESCE(_metadata,'{}'::jsonb));

  -- Achievements
  FOR r IN SELECT * FROM public.gam_achievements WHERE active AND event_type = _event_type LOOP
    INSERT INTO public.gam_user_achievements (user_id, achievement_id, progress)
    VALUES (_user_id, r.id, 0) ON CONFLICT (user_id, achievement_id) DO NOTHING;

    new_progress := NULL;
    UPDATE public.gam_user_achievements
       SET progress = LEAST(progress + _amount, r.target),
           updated_at = now(),
           completed_at = CASE WHEN completed_at IS NULL AND progress + _amount >= r.target THEN now() ELSE completed_at END
     WHERE user_id = _user_id AND achievement_id = r.id AND completed_at IS NULL
     RETURNING progress INTO new_progress;

    IF new_progress IS NOT NULL AND new_progress >= r.target THEN
      PERFORM public.gam_award(_user_id, r.reward_coins, r.reward_xp, r.reward_badge,
                               'achievement:'||r.key, r.id::text);
      UPDATE public.gam_user_achievements SET claimed_at = now()
       WHERE user_id = _user_id AND achievement_id = r.id AND claimed_at IS NULL;
    END IF;
  END LOOP;

  -- Quests
  FOR r IN SELECT * FROM public.gam_quests WHERE active AND event_type = _event_type LOOP
    INSERT INTO public.gam_user_quests (user_id, quest_id, period_key, progress)
    VALUES (_user_id, r.id, public.gam_period_key(r.cadence), 0)
    ON CONFLICT (user_id, quest_id, period_key) DO NOTHING;

    new_progress := NULL;
    UPDATE public.gam_user_quests
       SET progress = LEAST(progress + _amount, r.target),
           updated_at = now(),
           completed_at = CASE WHEN completed_at IS NULL AND progress + _amount >= r.target THEN now() ELSE completed_at END
     WHERE user_id = _user_id AND quest_id = r.id
       AND period_key = public.gam_period_key(r.cadence)
       AND completed_at IS NULL
     RETURNING progress INTO new_progress;

    IF new_progress IS NOT NULL AND new_progress >= r.target THEN
      PERFORM public.gam_award(_user_id, r.reward_coins, r.reward_xp, NULL,
                               'quest:'||r.key, r.id::text||':'||public.gam_period_key(r.cadence));
      UPDATE public.gam_user_quests SET claimed_at = now()
       WHERE user_id = _user_id AND quest_id = r.id
         AND period_key = public.gam_period_key(r.cadence)
         AND claimed_at IS NULL;
    END IF;
  END LOOP;

  -- Milestones
  FOR r IN SELECT * FROM public.gam_milestones WHERE active AND event_type = _event_type LOOP
    INSERT INTO public.gam_user_milestones (user_id, milestone_id, progress)
    VALUES (_user_id, r.id, 0) ON CONFLICT (user_id, milestone_id) DO NOTHING;

    new_progress := NULL;
    UPDATE public.gam_user_milestones
       SET progress = progress + _amount,
           updated_at = now(),
           completed_at = CASE WHEN completed_at IS NULL AND progress + _amount >= r.target THEN now() ELSE completed_at END
     WHERE user_id = _user_id AND milestone_id = r.id
     RETURNING progress INTO new_progress;

    IF new_progress IS NOT NULL AND new_progress >= r.target THEN
      PERFORM public.gam_award(_user_id, r.reward_coins, r.reward_xp, r.reward_badge,
                               'milestone:'||r.key, r.id::text);
    END IF;
  END LOOP;

  -- Active season XP
  SELECT id INTO season_id_v FROM public.gam_seasons
   WHERE active AND now() BETWEEN starts_at AND ends_at
   ORDER BY starts_at DESC LIMIT 1;
  IF season_id_v IS NOT NULL THEN
    INSERT INTO public.gam_user_season (user_id, season_id, xp, tier)
    VALUES (_user_id, season_id_v, 0, 0)
    ON CONFLICT (user_id, season_id) DO NOTHING;

    UPDATE public.gam_user_season
       SET xp = xp + GREATEST(_amount, 1), updated_at = now()
     WHERE user_id = _user_id AND season_id = season_id_v;

    SELECT COALESCE(MAX(t.tier), 0) INTO new_tier
      FROM public.gam_season_tiers t
      JOIN public.gam_user_season us
        ON us.season_id = t.season_id AND us.user_id = _user_id
     WHERE t.season_id = season_id_v AND t.xp_required <= us.xp;

    UPDATE public.gam_user_season SET tier = new_tier
     WHERE user_id = _user_id AND season_id = season_id_v AND tier < new_tier;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.gam_emit(uuid,text,integer,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gam_emit(uuid,text,integer,jsonb) TO authenticated, service_role;


-- Season tier claim ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.gam_claim_season_tier(_season_id uuid, _tier integer)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  us record; t record;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO us FROM public.gam_user_season WHERE user_id = uid AND season_id = _season_id;
  IF us IS NULL THEN RAISE EXCEPTION 'no season progress'; END IF;
  IF us.tier < _tier THEN RAISE EXCEPTION 'tier not yet reached'; END IF;
  IF _tier = ANY(us.claimed_tiers) THEN RAISE EXCEPTION 'already claimed'; END IF;
  SELECT * INTO t FROM public.gam_season_tiers WHERE season_id = _season_id AND tier = _tier;
  IF t IS NULL THEN RAISE EXCEPTION 'tier not defined'; END IF;
  IF t.premium_only AND NOT us.premium THEN
    RAISE EXCEPTION 'premium tier — season pass required';
  END IF;
  PERFORM public.gam_award(uid, t.reward_coins, t.reward_xp, t.reward_badge,
                           'season:'||_season_id::text||':tier:'||_tier::text,
                           _season_id::text||':'||_tier::text);
  UPDATE public.gam_user_season
     SET claimed_tiers = array_append(claimed_tiers, _tier), updated_at = now()
   WHERE user_id = uid AND season_id = _season_id;
END;
$$;
REVOKE ALL ON FUNCTION public.gam_claim_season_tier(uuid,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gam_claim_season_tier(uuid,integer) TO authenticated;


-- Seed defaults ----------------------------------------------------------
INSERT INTO public.gam_achievements (key, name, description, event_type, target, reward_coins, reward_xp, category) VALUES
  ('first_post','First Post','Create your first feed post','feed.post.created',1,50,20,'feed'),
  ('first_gift','Generous Soul','Send your first gift','gift.sent',1,25,10,'social'),
  ('first_win','Winner','Win your first competition','competition.won',1,200,100,'competitions'),
  ('daily_login_7','Weekly Regular','Log in 7 days','daily.login',7,100,50,'retention')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.gam_quests (key, name, cadence, event_type, target, reward_coins, reward_xp) VALUES
  ('daily_msgs','Send 10 messages','daily','message.sent',10,20,10),
  ('daily_posts','Create 1 feed post','daily','feed.post.created',1,30,15),
  ('daily_react','React 5 times','daily','feed.reaction.added',5,15,5),
  ('weekly_games','Play 5 games','weekly','game.played',5,150,50),
  ('weekly_votes','Cast 10 competition votes','weekly','competition.voted',10,120,40)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.gam_milestones (key, name, event_type, target, reward_coins, reward_xp, reward_badge) VALUES
  ('msgs_100','100 Messages','message.sent',100,200,100,'chatterbox'),
  ('posts_100','100 Feed Posts','feed.post.created',100,500,200,NULL),
  ('gifts_100','100 Gifts Sent','gift.sent',100,300,150,NULL),
  ('votes_100','100 Competition Votes','competition.voted',100,300,150,NULL),
  ('fish_100','100 Fish Wins','game.fish.won',100,500,200,NULL)
ON CONFLICT (key) DO NOTHING;
