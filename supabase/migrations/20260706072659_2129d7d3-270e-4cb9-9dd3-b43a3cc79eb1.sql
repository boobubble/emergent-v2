
-- 1) Keyword dictionary
CREATE TABLE public.safety_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text NOT NULL,
  match_mode text NOT NULL DEFAULT 'substring' CHECK (match_mode IN ('word','substring','regex')),
  category text NOT NULL CHECK (category IN (
    'violent_crime','terrorism','illegal_coordination','threats','dangerous_instructions','self_harm'
  )),
  severity smallint NOT NULL CHECK (severity BETWEEN 1 AND 3),
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX safety_keywords_active_sev ON public.safety_keywords(active, severity DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.safety_keywords TO authenticated;
GRANT ALL ON public.safety_keywords TO service_role;
ALTER TABLE public.safety_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage safety keywords"
  ON public.safety_keywords FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER safety_keywords_updated
  BEFORE UPDATE ON public.safety_keywords
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Event log
CREATE TABLE public.safety_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  channel_id text,
  message_id uuid,
  message_text text NOT NULL,
  matched_pattern text,
  category text NOT NULL,
  severity smallint NOT NULL CHECK (severity BETWEEN 1 AND 3),
  action text NOT NULL CHECK (action IN ('logged','blocked','blocked_muted','blocked_suspended')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','kept_blocked','false_positive','escalated')),
  reviewer_id uuid,
  reviewer_note text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX safety_events_status_created ON public.safety_events(status, created_at DESC);
CREATE INDEX safety_events_user ON public.safety_events(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.safety_events TO authenticated;
GRANT ALL ON public.safety_events TO service_role;
ALTER TABLE public.safety_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Moderators view safety events"
  ON public.safety_events FOR SELECT
  USING (public.is_moderator(auth.uid()));
CREATE POLICY "Moderators update safety events"
  ON public.safety_events FOR UPDATE
  USING (public.is_moderator(auth.uid()))
  WITH CHECK (public.is_moderator(auth.uid()));

CREATE TRIGGER safety_events_updated
  BEFORE UPDATE ON public.safety_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Message scanner trigger
CREATE OR REPLACE FUNCTION public.enforce_safety_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  txt text;
  hit record;
  action_taken text;
  notice text;
BEGIN
  txt := COALESCE(NEW.text, '');
  IF length(txt) = 0 THEN RETURN NEW; END IF;

  SELECT pattern, category, severity, match_mode INTO hit
  FROM public.safety_keywords
  WHERE active
    AND (
      (match_mode = 'substring' AND position(lower(pattern) IN lower(txt)) > 0) OR
      (match_mode = 'word'      AND txt ~* ('\m' || pattern || '\M')) OR
      (match_mode = 'regex'     AND txt ~* pattern)
    )
  ORDER BY severity DESC
  LIMIT 1;

  IF hit IS NULL THEN RETURN NEW; END IF;

  IF hit.severity = 1 THEN
    action_taken := 'logged';
  ELSIF hit.severity = 2 THEN
    action_taken := 'blocked_muted';
  ELSE
    action_taken := 'blocked_suspended';
  END IF;

  INSERT INTO public.safety_events (
    user_id, channel_id, message_id, message_text,
    matched_pattern, category, severity, action
  ) VALUES (
    NEW.author_id, NEW.channel_id, NEW.id, txt,
    hit.pattern, hit.category, hit.severity, action_taken
  );

  IF hit.severity = 1 THEN
    RETURN NEW;
  END IF;

  -- Auto-enforcement
  IF hit.severity = 2 AND NEW.author_id IS NOT NULL THEN
    INSERT INTO public.user_mutes (user_id, scope, reason, expires_at, created_by)
    VALUES (NEW.author_id, 'global',
            'Auto: safety filter (' || hit.category || ')',
            now() + interval '1 hour',
            NEW.author_id);
  ELSIF hit.severity = 3 AND NEW.author_id IS NOT NULL THEN
    INSERT INTO public.user_bans (user_id, ban_type, reason, expires_at, created_by)
    VALUES (NEW.author_id, 'temp_ban',
            'Auto: imminent-threat safety filter (' || hit.category || ')',
            now() + interval '24 hours',
            NEW.author_id);
  END IF;

  INSERT INTO public.mod_logs (actor_id, action, target_user_id, target_type, target_id, payload)
  VALUES (NEW.author_id, 'delete_message', NEW.author_id, 'safety', NEW.id::text,
          jsonb_build_object('category', hit.category, 'severity', hit.severity, 'auto', true));

  notice := CASE hit.severity
    WHEN 2 THEN 'This message was blocked because it may contain harmful or illegal content.'
    ELSE 'Your account has been temporarily restricted due to a serious safety concern.'
  END;

  RAISE EXCEPTION '%', notice USING ERRCODE = 'check_violation';
END;
$$;

DROP TRIGGER IF EXISTS enforce_safety_moderation ON public.messages;
CREATE TRIGGER enforce_safety_moderation
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_safety_moderation();

-- 4) Starter keywords
INSERT INTO public.safety_keywords (pattern, match_mode, category, severity, notes) VALUES
  -- Level 3 (imminent)
  ('i will kill you',            'substring', 'threats',                3, 'direct threat'),
  ('i am going to kill',         'substring', 'threats',                3, 'direct threat'),
  ('kill yourself',              'substring', 'threats',                3, 'targeted harm'),
  ('shoot up the',               'substring', 'terrorism',              3, 'attack planning'),
  ('bomb the',                   'substring', 'terrorism',              3, 'attack planning'),
  ('plant a bomb',               'substring', 'terrorism',              3, 'attack planning'),
  ('school shooting',            'substring', 'terrorism',              3, 'attack planning'),
  ('assassinate',                'substring', 'violent_crime',          3, 'assassination'),
  -- Level 2 (high risk / explicit)
  ('rob the bank',               'substring', 'violent_crime',          2, 'bank robbery'),
  ('bank robbery plan',          'substring', 'violent_crime',          2, 'bank robbery'),
  ('kidnap',                     'substring', 'violent_crime',          2, 'kidnapping'),
  ('how to make a bomb',         'substring', 'dangerous_instructions', 2, 'weapon instructions'),
  ('how to build a bomb',        'substring', 'dangerous_instructions', 2, 'weapon instructions'),
  ('pipe bomb',                  'substring', 'dangerous_instructions', 2, 'weapon'),
  ('how to make a gun',          'substring', 'dangerous_instructions', 2, 'weapon instructions'),
  ('buy a gun illegally',        'substring', 'illegal_coordination',   2, 'weapon procurement'),
  ('human trafficking',          'substring', 'illegal_coordination',   2, 'trafficking'),
  ('drug trafficking',           'substring', 'illegal_coordination',   2, 'trafficking'),
  ('sell drugs',                 'substring', 'illegal_coordination',   2, 'drug sales'),
  ('extort',                     'substring', 'illegal_coordination',   2, 'extortion'),
  ('blackmail',                  'substring', 'illegal_coordination',   2, 'blackmail'),
  ('identity theft',             'substring', 'illegal_coordination',   2, 'identity theft'),
  ('terrorist attack',           'substring', 'terrorism',              2, 'attack'),
  ('join isis',                  'substring', 'terrorism',              2, 'recruitment'),
  ('jihad against',              'substring', 'terrorism',              2, 'violent ideology'),
  -- Level 1 (suspicious / review)
  ('how to evade police',        'substring', 'dangerous_instructions', 1, 'evasion'),
  ('how to hide evidence',       'substring', 'dangerous_instructions', 1, 'evidence hiding'),
  ('bypass security',            'substring', 'dangerous_instructions', 1, 'security bypass'),
  ('i want to hurt',             'substring', 'threats',                1, 'ambiguous harm'),
  ('i hate them all',            'substring', 'threats',                1, 'hate signal');
