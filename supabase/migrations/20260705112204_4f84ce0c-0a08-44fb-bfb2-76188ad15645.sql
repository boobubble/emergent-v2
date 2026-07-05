-- ============================================================
-- Community Competitions System
-- ============================================================

-- 1) Categories
CREATE TABLE public.competition_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon_url text,
  banner_url text,
  color text DEFAULT '#8b5cf6',
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.competition_categories TO anon, authenticated;
GRANT ALL ON public.competition_categories TO service_role;
ALTER TABLE public.competition_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories readable to all" ON public.competition_categories
  FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.competition_categories
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2) Competitions
CREATE TABLE public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.competition_categories(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  banner_url text,
  rules text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  max_participants int,
  winner_count int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','upcoming','live','completed')),
  allow_vote_change boolean NOT NULL DEFAULT false,
  show_live_counts boolean NOT NULL DEFAULT true,
  require_approval boolean NOT NULL DEFAULT false,
  rewards jsonb NOT NULL DEFAULT '{}'::jsonb,
  announce_channels text[] NOT NULL DEFAULT ARRAY[]::text[],
  total_votes int NOT NULL DEFAULT 0,
  total_participants int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX competitions_status_idx ON public.competitions(status);
CREATE INDEX competitions_end_at_idx ON public.competitions(end_at);
CREATE INDEX competitions_category_idx ON public.competitions(category_id);
GRANT SELECT ON public.competitions TO anon, authenticated;
GRANT ALL ON public.competitions TO service_role;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "competitions readable when not draft" ON public.competitions
  FOR SELECT USING (status <> 'draft' OR public.is_admin(auth.uid()));
CREATE POLICY "admins manage competitions" ON public.competitions
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3) Participants
CREATE TABLE public.competition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'approved'
    CHECK (status IN ('pending','approved','removed','disqualified')),
  vote_count int NOT NULL DEFAULT 0,
  rank int,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, user_id)
);
CREATE INDEX competition_participants_comp_idx ON public.competition_participants(competition_id);
CREATE INDEX competition_participants_user_idx ON public.competition_participants(user_id);
GRANT SELECT ON public.competition_participants TO anon, authenticated;
GRANT INSERT, DELETE ON public.competition_participants TO authenticated;
GRANT ALL ON public.competition_participants TO service_role;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants readable" ON public.competition_participants
  FOR SELECT USING (true);
CREATE POLICY "user can self-join" ON public.competition_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.competitions c
      WHERE c.id = competition_id
        AND c.status IN ('upcoming','live')
        AND (c.max_participants IS NULL
             OR c.total_participants < c.max_participants)
    )
  );
CREATE POLICY "user can self-leave" ON public.competition_participants
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "admins manage participants" ON public.competition_participants
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4) Votes
CREATE TABLE public.competition_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.competition_participants(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, voter_id)
);
CREATE INDEX competition_votes_participant_idx ON public.competition_votes(participant_id);
CREATE INDEX competition_votes_competition_idx ON public.competition_votes(competition_id);
GRANT SELECT ON public.competition_votes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.competition_votes TO authenticated;
GRANT ALL ON public.competition_votes TO service_role;
ALTER TABLE public.competition_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes readable" ON public.competition_votes
  FOR SELECT USING (true);
CREATE POLICY "authed can vote in live comp" ON public.competition_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    voter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.competitions c
      WHERE c.id = competition_id
        AND c.status = 'live'
        AND c.end_at > now()
    )
    AND EXISTS (
      SELECT 1 FROM public.competition_participants p
      WHERE p.id = participant_id
        AND p.competition_id = competition_id
        AND p.status = 'approved'
    )
  );
CREATE POLICY "authed can change own vote if allowed" ON public.competition_votes
  FOR UPDATE TO authenticated
  USING (
    voter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.competitions c
      WHERE c.id = competition_id
        AND c.status = 'live'
        AND c.end_at > now()
        AND c.allow_vote_change
    )
  )
  WITH CHECK (voter_id = auth.uid());
CREATE POLICY "admins manage votes" ON public.competition_votes
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5) Awards
CREATE TABLE public.competition_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.competition_participants(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  place int NOT NULL,
  badge_label text,
  rewards jsonb NOT NULL DEFAULT '{}'::jsonb,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, place)
);
CREATE INDEX competition_awards_user_idx ON public.competition_awards(user_id);
GRANT SELECT ON public.competition_awards TO anon, authenticated;
GRANT ALL ON public.competition_awards TO service_role;
ALTER TABLE public.competition_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "awards readable" ON public.competition_awards FOR SELECT USING (true);
CREATE POLICY "admins manage awards" ON public.competition_awards
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- Triggers
-- ============================================================

-- updated_at
CREATE TRIGGER trg_competition_categories_updated
  BEFORE UPDATE ON public.competition_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_competitions_updated
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Vote counts + total_votes maintenance
CREATE OR REPLACE FUNCTION public.competition_bump_vote_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.competition_participants
       SET vote_count = vote_count + 1
     WHERE id = NEW.participant_id;
    UPDATE public.competitions
       SET total_votes = total_votes + 1
     WHERE id = NEW.competition_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.competition_participants
       SET vote_count = GREATEST(vote_count - 1, 0)
     WHERE id = OLD.participant_id;
    UPDATE public.competitions
       SET total_votes = GREATEST(total_votes - 1, 0)
     WHERE id = OLD.competition_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.participant_id IS DISTINCT FROM OLD.participant_id THEN
    UPDATE public.competition_participants
       SET vote_count = GREATEST(vote_count - 1, 0)
     WHERE id = OLD.participant_id;
    UPDATE public.competition_participants
       SET vote_count = vote_count + 1
     WHERE id = NEW.participant_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_competition_votes_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.competition_votes
  FOR EACH ROW EXECUTE FUNCTION public.competition_bump_vote_counts();

-- Participant counts on competitions
CREATE OR REPLACE FUNCTION public.competition_bump_participant_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.competitions
       SET total_participants = total_participants + 1
     WHERE id = NEW.competition_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.competitions
       SET total_participants = GREATEST(total_participants - 1, 0)
     WHERE id = OLD.competition_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_competition_participants_count
  AFTER INSERT OR DELETE ON public.competition_participants
  FOR EACH ROW EXECUTE FUNCTION public.competition_bump_participant_count();

-- ============================================================
-- Helper RPCs
-- ============================================================

-- My vote in a competition
CREATE OR REPLACE FUNCTION public.my_competition_vote(_competition uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT participant_id FROM public.competition_votes
   WHERE competition_id = _competition AND voter_id = auth.uid()
   LIMIT 1;
$$;

-- Cast or change a vote (atomic)
CREATE OR REPLACE FUNCTION public.cast_competition_vote(_competition uuid, _participant uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  c public.competitions;
  existing uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;

  SELECT * INTO c FROM public.competitions WHERE id = _competition;
  IF NOT FOUND THEN RAISE EXCEPTION 'Competition not found'; END IF;
  IF c.status <> 'live' OR c.end_at <= now() THEN
    RAISE EXCEPTION 'Voting is closed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.competition_participants
    WHERE id = _participant AND competition_id = _competition AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Invalid participant';
  END IF;

  SELECT id INTO existing FROM public.competition_votes
    WHERE competition_id = _competition AND voter_id = uid;

  IF existing IS NULL THEN
    INSERT INTO public.competition_votes (competition_id, participant_id, voter_id)
      VALUES (_competition, _participant, uid);
  ELSE
    IF NOT c.allow_vote_change THEN
      RAISE EXCEPTION 'You have already voted';
    END IF;
    UPDATE public.competition_votes
       SET participant_id = _participant, created_at = now()
     WHERE id = existing;
  END IF;
END $$;

-- User achievements summary
CREATE OR REPLACE FUNCTION public.user_competition_achievements(_user uuid)
RETURNS TABLE(
  total_wins int,
  total_joined int,
  live_count int
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (SELECT count(*)::int FROM public.competition_awards WHERE user_id = _user),
    (SELECT count(*)::int FROM public.competition_participants WHERE user_id = _user),
    (SELECT count(*)::int FROM public.competition_participants p
        JOIN public.competitions c ON c.id = p.competition_id
       WHERE p.user_id = _user AND c.status = 'live');
$$;

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.competitions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_awards;

-- ============================================================
-- Seed default categories
-- ============================================================
INSERT INTO public.competition_categories (slug, name, description, color, sort_order, is_default) VALUES
  ('best-profile-picture','Best Profile Picture','Show off your best avatar','#f472b6',10,true),
  ('best-male-rj','Best Male RJ','Top male radio jockey','#60a5fa',20,true),
  ('best-female-rj','Best Female RJ','Top female radio jockey','#f472b6',30,true),
  ('best-rj-duo','Best RJ Duo','Best co-hosting duo','#a78bfa',40,true),
  ('best-admin','Best Admin','Standout community admin','#f59e0b',50,true),
  ('best-moderator','Best Moderator','Best mod of the season','#10b981',60,true),
  ('most-helpful-member','Most Helpful Member','Always lending a hand','#22d3ee',70,true),
  ('funniest-member','Funniest Member','Made us laugh the most','#facc15',80,true),
  ('rising-star','Rising Star','Newcomer of the season','#fb7185',90,true),
  ('community-legend','Community Legend','Long-standing legend','#c084fc',100,true),
  ('best-radio-show','Best Radio Show','Top-rated radio show','#38bdf8',110,true),
  ('best-premium-chatroom','Best Premium Chatroom','Best paid chatroom','#f97316',120,true),
  ('best-feed-creator','Best Feed Creator','Top feed content creator','#34d399',130,true),
  ('top-gamer','Top Gamer','Champion of the games','#ef4444',140,true)
ON CONFLICT (slug) DO NOTHING;
