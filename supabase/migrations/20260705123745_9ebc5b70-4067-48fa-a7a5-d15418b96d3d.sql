-- 1) FeedBot hook secret in app_settings (admin-only readable)
-- Add the secret key to sensitive exclusion lists so anon/authenticated cannot read it.
DROP POLICY IF EXISTS "Anon read non-sensitive settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated read non-sensitive settings" ON public.app_settings;

CREATE POLICY "Anon read non-sensitive settings" ON public.app_settings
FOR SELECT TO anon
USING (key <> ALL (ARRAY[
  'bots','automation','fake_activity','moderation','security','word_filters',
  'ai_chatbots','admin_modules','staff_permissions','admin_roles','filters',
  'boobubble_openai_key','boobubble_gemini_key','ai_chat','feedbot_hook_secret'
]));

CREATE POLICY "Authenticated read non-sensitive settings" ON public.app_settings
FOR SELECT TO authenticated
USING (
  (key <> ALL (ARRAY[
    'bots','automation','fake_activity','moderation','security','word_filters',
    'ai_chatbots','admin_modules','staff_permissions','admin_roles','filters',
    'boobubble_openai_key','boobubble_gemini_key','ai_chat','feedbot_hook_secret'
  ])) OR public.is_admin(auth.uid())
);

-- Seed a strong random secret if none exists
INSERT INTO public.app_settings (key, value)
SELECT 'feedbot_hook_secret', to_jsonb(encode(gen_random_bytes(32), 'hex'))
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'feedbot_hook_secret');

-- SECURITY DEFINER helper the cron jobs use to build the Authorization header
CREATE OR REPLACE FUNCTION public.feedbot_dispatch_run()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE sec text;
BEGIN
  SELECT value #>> '{}' INTO sec FROM public.app_settings WHERE key = 'feedbot_hook_secret';
  IF sec IS NULL OR sec = '' THEN RAISE EXCEPTION 'feedbot_hook_secret not configured'; END IF;
  PERFORM net.http_post(
    url := 'https://project--18cb7521-83eb-440b-8f96-fe1f394ccca4.lovable.app/api/public/hooks/feedbot-dispatch',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || sec
    ),
    body := '{}'::jsonb
  );
END $$;

CREATE OR REPLACE FUNCTION public.feedbot_summary_run()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE sec text;
BEGIN
  SELECT value #>> '{}' INTO sec FROM public.app_settings WHERE key = 'feedbot_hook_secret';
  IF sec IS NULL OR sec = '' THEN RAISE EXCEPTION 'feedbot_hook_secret not configured'; END IF;
  PERFORM net.http_post(
    url := 'https://project--18cb7521-83eb-440b-8f96-fe1f394ccca4.lovable.app/api/public/hooks/feedbot-summary',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || sec
    ),
    body := '{}'::jsonb
  );
END $$;

-- Reschedule cron jobs to use the authenticated helper
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'feedbot-dispatch') THEN
    PERFORM cron.unschedule('feedbot-dispatch');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'feedbot-summary') THEN
    PERFORM cron.unschedule('feedbot-summary');
  END IF;
END $$;

SELECT cron.schedule('feedbot-dispatch','* * * * *', $$SELECT public.feedbot_dispatch_run();$$);
SELECT cron.schedule('feedbot-summary','30 15 * * *', $$SELECT public.feedbot_summary_run();$$);

-- 2) competition_votes: hide individual voter identities from other users
DROP POLICY IF EXISTS "votes readable" ON public.competition_votes;
CREATE POLICY "voter or admin can read votes" ON public.competition_votes
FOR SELECT TO authenticated
USING (voter_id = auth.uid() OR public.is_admin(auth.uid()));

-- 3) competition_votes: fix ambiguous column bug in INSERT policy
DROP POLICY IF EXISTS "authed can vote in live comp" ON public.competition_votes;
CREATE POLICY "authed can vote in live comp" ON public.competition_votes
FOR INSERT TO authenticated
WITH CHECK (
  voter_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.competitions c
    WHERE c.id = competition_votes.competition_id
      AND c.status = 'live'
      AND c.end_at > now()
  )
  AND EXISTS (
    SELECT 1 FROM public.competition_participants p
    WHERE p.id = competition_votes.participant_id
      AND p.competition_id = competition_votes.competition_id
      AND p.status = 'approved'
  )
);

-- 4) game_players: only members/creator of a game (or any player in a public game) can read
DROP POLICY IF EXISTS "Authenticated can read game_players" ON public.game_players;
CREATE POLICY "Members can read game_players" ON public.game_players
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.games g
    WHERE g.id = game_players.game_id
      AND (
        g.visibility = 'public'
        OR g.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.game_players gp2
          WHERE gp2.game_id = g.id AND gp2.user_id = auth.uid()
        )
      )
  )
);

-- 5) Fix mutable search_path on feedbot_settings_touch
CREATE OR REPLACE FUNCTION public.feedbot_settings_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END $$;