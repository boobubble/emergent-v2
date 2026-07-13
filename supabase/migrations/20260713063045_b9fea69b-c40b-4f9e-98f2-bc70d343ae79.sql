
-- Persona column on events + settings slot for CompetitionsBot
ALTER TABLE public.feedbot_events
  ADD COLUMN IF NOT EXISTS persona_bot_id uuid;

ALTER TABLE public.feedbot_settings
  ADD COLUMN IF NOT EXISTS competitions_bot_user_id uuid;

-- Default flags for new categories (merge only, don't clobber admin choices)
UPDATE public.feedbot_settings SET event_flags = COALESCE(event_flags, '{}'::jsonb) || jsonb_build_object(
  'competition_published', true,
  'competition_registration_open', true,
  'competition_registration_close', true,
  'competition_ending', true,
  'competition_ended', true,
  'competition_featured', true,
  'competition_trending', true,
  'competition_vote_milestone', true,
  'competition_leader_change', true,
  'competition_nominee_joined', false
) WHERE id = true;

-- Enqueue helper with persona
CREATE OR REPLACE FUNCTION public.feedbot_enqueue_persona(
  _kind text, _category text, _actor uuid, _payload jsonb,
  _target_url text, _image_url text, _dedupe text, _persona uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  INSERT INTO public.feedbot_events (kind, category, actor_id, payload, target_url, image_url, dedupe_key, persona_bot_id)
  VALUES (_kind, _category, _actor, COALESCE(_payload, '{}'::jsonb), _target_url, _image_url, _dedupe, _persona)
  ON CONFLICT (dedupe_key) DO NOTHING;
END $fn$;

-- Extended competition lifecycle trigger
CREATE OR REPLACE FUNCTION public.feedbot_on_competition() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE persona uuid;
BEGIN
  SELECT competitions_bot_user_id INTO persona FROM public.feedbot_settings WHERE id = true;

  -- Published (INSERT with is_published=true, or flip from unpublished→published)
  IF (TG_OP = 'INSERT' AND COALESCE(NEW.is_published, false) AND NEW.status <> 'draft')
     OR (TG_OP = 'UPDATE' AND NEW.is_published IS DISTINCT FROM OLD.is_published AND NEW.is_published) THEN
    PERFORM public.feedbot_enqueue_persona('competition_published','competition_published',NULL,
      jsonb_build_object('name', NEW.name, 'slug', NEW.slug, 'end_at', NEW.end_at),
      '/competitions/' || COALESCE(NEW.slug, NEW.id::text), NEW.banner_url,
      'comppub:' || NEW.id::text, persona);
  END IF;

  -- Status transitions
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'upcoming' THEN
      PERFORM public.feedbot_enqueue_persona('competition_registration_open','competition_registration_open',NULL,
        jsonb_build_object('name', NEW.name, 'slug', NEW.slug, 'start_at', NEW.start_at),
        '/competitions/' || COALESCE(NEW.slug, NEW.id::text), NEW.banner_url,
        'compreg:' || NEW.id::text, persona);
    ELSIF NEW.status = 'live' THEN
      PERFORM public.feedbot_enqueue_persona('competition_registration_close','competition_registration_close',NULL,
        jsonb_build_object('name', NEW.name, 'slug', NEW.slug),
        '/competitions/' || COALESCE(NEW.slug, NEW.id::text), NEW.banner_url,
        'compregclose:' || NEW.id::text, persona);
      PERFORM public.feedbot_enqueue_persona('competition_started','competition_started',NULL,
        jsonb_build_object('name', NEW.name, 'slug', NEW.slug, 'end_at', NEW.end_at),
        '/competitions/' || COALESCE(NEW.slug, NEW.id::text), NEW.banner_url,
        'compstart:' || NEW.id::text, persona);
    ELSIF NEW.status = 'completed' THEN
      PERFORM public.feedbot_enqueue_persona('competition_ended','competition_ended',NULL,
        jsonb_build_object('name', NEW.name, 'slug', NEW.slug),
        '/competitions/' || COALESCE(NEW.slug, NEW.id::text), NEW.banner_url,
        'compended:' || NEW.id::text, persona);
      PERFORM public.feedbot_enqueue_persona('competition_winner','competition_winner',NULL,
        jsonb_build_object('name', NEW.name, 'slug', NEW.slug),
        '/competitions/' || COALESCE(NEW.slug, NEW.id::text), NEW.banner_url,
        'compend:' || NEW.id::text, persona);
    END IF;
  END IF;

  -- Featured flip
  IF TG_OP = 'UPDATE' AND NEW.is_featured IS DISTINCT FROM OLD.is_featured AND NEW.is_featured THEN
    PERFORM public.feedbot_enqueue_persona('competition_featured','competition_featured',NULL,
      jsonb_build_object('name', NEW.name, 'slug', NEW.slug),
      '/competitions/' || COALESCE(NEW.slug, NEW.id::text), NEW.banner_url,
      'compfeat:' || NEW.id::text, persona);
  END IF;

  RETURN NEW;
END $fn$;

-- Vote trigger with milestones + rate-limited leader change
CREATE OR REPLACE FUNCTION public.feedbot_on_vote() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  cname text; cslug text; cbanner text;
  bucket text; total int;
  milestone int;
  leader_user uuid; leader_name text; leader_votes int;
  persona uuid;
  five_min_bucket text;
BEGIN
  SELECT competitions_bot_user_id INTO persona FROM public.feedbot_settings WHERE id = true;
  SELECT name, slug, banner_url, total_votes INTO cname, cslug, cbanner, total
    FROM public.competitions WHERE id = NEW.competition_id;

  -- Rolling activity bucket (existing behaviour)
  bucket := to_char(date_trunc('minute', now()) - (extract(minute from now())::int % 5) * interval '1 minute', 'YYYYMMDDHH24MI');
  PERFORM public.feedbot_enqueue_persona('competition_vote','competition_vote',NEW.voter_id,
    jsonb_build_object('competition_id', NEW.competition_id, 'name', cname, 'slug', cslug),
    '/competitions/' || COALESCE(cslug, NEW.competition_id::text), NULL,
    'vote:' || NEW.competition_id::text || ':' || bucket, persona);

  -- Milestone (100/500/1000/5000/10000)
  milestone := NULL;
  IF total IN (100, 500, 1000, 5000, 10000) THEN milestone := total; END IF;
  IF milestone IS NOT NULL THEN
    PERFORM public.feedbot_enqueue_persona('competition_vote_milestone','competition_vote_milestone',NULL,
      jsonb_build_object('name', cname, 'slug', cslug, 'milestone', milestone, 'total_votes', total),
      '/competitions/' || COALESCE(cslug, NEW.competition_id::text), cbanner,
      'compmile:' || NEW.competition_id::text || ':' || milestone::text, persona);
  END IF;

  -- Leader change (rate-limited to 5-minute buckets)
  five_min_bucket := to_char(date_trunc('minute', now()) - (extract(minute from now())::int % 5) * interval '1 minute', 'YYYYMMDDHH24MI');
  SELECT cp.user_id, cp.vote_count, pr.username
    INTO leader_user, leader_votes, leader_name
    FROM public.competition_participants cp
    LEFT JOIN public.profiles pr ON pr.id = cp.user_id
    WHERE cp.competition_id = NEW.competition_id
      AND cp.status = 'approved'
    ORDER BY cp.vote_count DESC, cp.joined_at ASC
    LIMIT 1;
  IF leader_user IS NOT NULL AND leader_user = NEW.voter_id IS DISTINCT FROM TRUE THEN
    PERFORM public.feedbot_enqueue_persona('competition_leader_change','competition_leader_change',NULL,
      jsonb_build_object('name', cname, 'slug', cslug, 'leader', leader_name, 'votes', leader_votes),
      '/competitions/' || COALESCE(cslug, NEW.competition_id::text), cbanner,
      'compleader:' || NEW.competition_id::text || ':' || leader_user::text || ':' || five_min_bucket, persona);
  END IF;

  RETURN NEW;
END $fn$;

-- Nominee joined trigger (off by default via event_flags)
CREATE OR REPLACE FUNCTION public.feedbot_on_nominee_joined() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE cname text; cslug text; cbanner text; uname text; persona uuid;
BEGIN
  IF NEW.status NOT IN ('approved','pending') THEN RETURN NEW; END IF;
  SELECT competitions_bot_user_id INTO persona FROM public.feedbot_settings WHERE id = true;
  SELECT name, slug, banner_url INTO cname, cslug, cbanner FROM public.competitions WHERE id = NEW.competition_id;
  SELECT username INTO uname FROM public.profiles WHERE id = NEW.user_id;
  PERFORM public.feedbot_enqueue_persona('competition_nominee_joined','competition_nominee_joined',NEW.user_id,
    jsonb_build_object('name', cname, 'slug', cslug, 'username', uname),
    '/competitions/' || COALESCE(cslug, NEW.competition_id::text), cbanner,
    'compnjoin:' || NEW.id::text, persona);
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_feedbot_on_nominee_joined ON public.competition_participants;
CREATE TRIGGER trg_feedbot_on_nominee_joined AFTER INSERT ON public.competition_participants
  FOR EACH ROW EXECUTE FUNCTION public.feedbot_on_nominee_joined();
