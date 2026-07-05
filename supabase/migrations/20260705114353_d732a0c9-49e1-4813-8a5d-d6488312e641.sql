
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS bot_payload jsonb;

CREATE TABLE IF NOT EXISTS public.feedbot_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  enabled boolean NOT NULL DEFAULT true,
  bot_user_id uuid,
  event_flags jsonb NOT NULL DEFAULT jsonb_build_object(
    'feed_post', true, 'profile_avatar', true, 'profile_cover', true, 'profile_bio', true,
    'new_member', true, 'competition_started', true, 'competition_vote', false,
    'competition_leader', true, 'competition_ending', true, 'competition_winner', true,
    'radio_live', true, 'chatroom_created', true, 'level_up', true, 'daily_summary', true
  ),
  target_chatrooms uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  min_interval_seconds int NOT NULL DEFAULT 300,
  digest_mode boolean NOT NULL DEFAULT false,
  daily_summary_enabled boolean NOT NULL DEFAULT true,
  daily_summary_time text NOT NULL DEFAULT '21:00',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.feedbot_settings TO authenticated;
GRANT ALL ON public.feedbot_settings TO service_role;
ALTER TABLE public.feedbot_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedbot_settings_read" ON public.feedbot_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "feedbot_settings_admin" ON public.feedbot_settings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
INSERT INTO public.feedbot_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.feedbot_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  category text NOT NULL,
  actor_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  target_url text,
  image_url text,
  dedupe_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  dispatched_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_feedbot_events_pending ON public.feedbot_events (created_at) WHERE dispatched_at IS NULL;
GRANT ALL ON public.feedbot_events TO service_role;
ALTER TABLE public.feedbot_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedbot_events_admin_read" ON public.feedbot_events FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.feedbot_dispatch_log (
  chatroom_id uuid NOT NULL,
  category text NOT NULL,
  last_dispatched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chatroom_id, category)
);
GRANT ALL ON public.feedbot_dispatch_log TO service_role;
ALTER TABLE public.feedbot_dispatch_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.feedbot_enqueue(
  _kind text, _category text, _actor uuid, _payload jsonb, _target_url text, _image_url text, _dedupe text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  INSERT INTO public.feedbot_events (kind, category, actor_id, payload, target_url, image_url, dedupe_key)
  VALUES (_kind, _category, _actor, COALESCE(_payload, '{}'::jsonb), _target_url, _image_url, _dedupe)
  ON CONFLICT (dedupe_key) DO NOTHING;
END $fn$;

CREATE OR REPLACE FUNCTION public.feedbot_on_post() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE uname text;
BEGIN
  IF NEW.is_anonymous THEN RETURN NEW; END IF;
  SELECT username INTO uname FROM public.profiles WHERE id = NEW.owner_id;
  PERFORM public.feedbot_enqueue(
    'feed_post', 'feed_post', NEW.owner_id,
    jsonb_build_object('username', uname, 'text', LEFT(COALESCE(NEW.text,''), 200),
      'has_image', (NEW.attachment IS NOT NULL), 'post_id', NEW.id, 'slug', NEW.slug),
    '/feed?post=' || NEW.id::text,
    CASE WHEN NEW.attachment ? 'url' THEN NEW.attachment->>'url' ELSE NULL END,
    'post:' || NEW.id::text
  );
  RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_feedbot_on_post ON public.posts;
CREATE TRIGGER trg_feedbot_on_post AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.feedbot_on_post();

CREATE OR REPLACE FUNCTION public.feedbot_on_profile_update() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NEW.is_bot THEN RETURN NEW; END IF;
  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url AND NEW.avatar_url IS NOT NULL THEN
    PERFORM public.feedbot_enqueue('profile_avatar','profile_avatar',NEW.id,
      jsonb_build_object('username', NEW.username),
      '/profile/' || NEW.username, NEW.avatar_url,
      'avatar:' || NEW.id::text || ':' || substr(md5(NEW.avatar_url),1,8));
  END IF;
  IF NEW.cover_url IS DISTINCT FROM OLD.cover_url AND NEW.cover_url IS NOT NULL THEN
    PERFORM public.feedbot_enqueue('profile_cover','profile_cover',NEW.id,
      jsonb_build_object('username', NEW.username),
      '/profile/' || NEW.username, NEW.cover_url,
      'cover:' || NEW.id::text || ':' || substr(md5(NEW.cover_url),1,8));
  END IF;
  IF NEW.bio IS DISTINCT FROM OLD.bio AND COALESCE(NEW.bio,'') <> '' THEN
    PERFORM public.feedbot_enqueue('profile_bio','profile_bio',NEW.id,
      jsonb_build_object('username', NEW.username, 'bio', LEFT(NEW.bio, 140)),
      '/profile/' || NEW.username, NULL,
      'bio:' || NEW.id::text || ':' || substr(md5(NEW.bio),1,8));
  END IF;
  RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_feedbot_on_profile_update ON public.profiles;
CREATE TRIGGER trg_feedbot_on_profile_update AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.feedbot_on_profile_update();

CREATE OR REPLACE FUNCTION public.feedbot_on_new_member() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NEW.is_bot THEN RETURN NEW; END IF;
  PERFORM public.feedbot_enqueue('new_member','new_member',NEW.id,
    jsonb_build_object('username', NEW.username),
    '/profile/' || NEW.username, NEW.avatar_url,
    'newmember:' || NEW.id::text);
  RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_feedbot_on_new_member ON public.profiles;
CREATE TRIGGER trg_feedbot_on_new_member AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.feedbot_on_new_member();

CREATE OR REPLACE FUNCTION public.feedbot_on_competition() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'live' THEN
      PERFORM public.feedbot_enqueue('competition_started','competition_started',NULL,
        jsonb_build_object('name', NEW.name, 'end_at', NEW.end_at),
        '/competitions/' || NEW.id::text, NEW.banner_url,
        'compstart:' || NEW.id::text);
    ELSIF NEW.status = 'completed' THEN
      PERFORM public.feedbot_enqueue('competition_winner','competition_winner',NULL,
        jsonb_build_object('name', NEW.name),
        '/competitions/' || NEW.id::text, NEW.banner_url,
        'compend:' || NEW.id::text);
    END IF;
  END IF;
  RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_feedbot_on_competition ON public.competitions;
CREATE TRIGGER trg_feedbot_on_competition AFTER INSERT OR UPDATE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION public.feedbot_on_competition();

CREATE OR REPLACE FUNCTION public.feedbot_on_vote() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE cname text; bucket text;
BEGIN
  SELECT name INTO cname FROM public.competitions WHERE id = NEW.competition_id;
  bucket := to_char(date_trunc('minute', now()) - (extract(minute from now())::int % 5) * interval '1 minute', 'YYYYMMDDHH24MI');
  PERFORM public.feedbot_enqueue('competition_vote','competition_vote',NEW.voter_id,
    jsonb_build_object('competition_id', NEW.competition_id, 'name', cname),
    '/competitions/' || NEW.competition_id::text, NULL,
    'vote:' || NEW.competition_id::text || ':' || bucket);
  RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_feedbot_on_vote ON public.competition_votes;
CREATE TRIGGER trg_feedbot_on_vote AFTER INSERT ON public.competition_votes
  FOR EACH ROW EXECUTE FUNCTION public.feedbot_on_vote();

CREATE OR REPLACE FUNCTION public.feedbot_on_radio() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE host_name text;
BEGIN
  IF COALESCE(NEW.is_live, false) AND NOT COALESCE(OLD.is_live, false) THEN
    IF NEW.current_host_id IS NOT NULL THEN
      SELECT username INTO host_name FROM public.profiles WHERE id = NEW.current_host_id;
    END IF;
    PERFORM public.feedbot_enqueue('radio_live','radio_live',NEW.current_host_id,
      jsonb_build_object('host', host_name),
      '/radio', NULL,
      'radio:' || NEW.widget_id::text || ':' || extract(epoch from now())::bigint::text);
  END IF;
  RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_feedbot_on_radio ON public.radio_widget_state;
CREATE TRIGGER trg_feedbot_on_radio AFTER UPDATE ON public.radio_widget_state
  FOR EACH ROW EXECUTE FUNCTION public.feedbot_on_radio();

CREATE OR REPLACE FUNCTION public.feedbot_on_chatroom() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  PERFORM public.feedbot_enqueue('chatroom_created','chatroom_created',NEW.owner_id,
    jsonb_build_object('name', NEW.name, 'id', NEW.id),
    '/chatroom?room=' || NEW.id::text, NULL,
    'chatroom:' || NEW.id::text);
  RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_feedbot_on_chatroom ON public.chatrooms;
CREATE TRIGGER trg_feedbot_on_chatroom AFTER INSERT ON public.chatrooms
  FOR EACH ROW EXECUTE FUNCTION public.feedbot_on_chatroom();

CREATE OR REPLACE FUNCTION public.feedbot_settings_touch() RETURNS trigger
LANGUAGE plpgsql AS $fn$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_feedbot_settings_touch ON public.feedbot_settings;
CREATE TRIGGER trg_feedbot_settings_touch BEFORE UPDATE ON public.feedbot_settings
  FOR EACH ROW EXECUTE FUNCTION public.feedbot_settings_touch();

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'feedbot-dispatch') THEN
    PERFORM cron.unschedule('feedbot-dispatch');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'feedbot-summary') THEN
    PERFORM cron.unschedule('feedbot-summary');
  END IF;
END $$;

SELECT cron.schedule('feedbot-dispatch','* * * * *',
  $$SELECT net.http_post(
    url:='https://project--18cb7521-83eb-440b-8f96-fe1f394ccca4.lovable.app/api/public/hooks/feedbot-dispatch',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbWtudGNvYm5wcHBoeGlwdGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Mzc3MDUsImV4cCI6MjA5NTAxMzcwNX0.GutiTK-vhcj_jQfr3zKfmSxKfDNW3pvtMv7uNgyqmz8"}'::jsonb,
    body:='{}'::jsonb);$$);

SELECT cron.schedule('feedbot-summary','30 15 * * *',
  $$SELECT net.http_post(
    url:='https://project--18cb7521-83eb-440b-8f96-fe1f394ccca4.lovable.app/api/public/hooks/feedbot-summary',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbWtudGNvYm5wcHBoeGlwdGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Mzc3MDUsImV4cCI6MjA5NTAxMzcwNX0.GutiTK-vhcj_jQfr3zKfmSxKfDNW3pvtMv7uNgyqmz8"}'::jsonb,
    body:='{}'::jsonb);$$);
