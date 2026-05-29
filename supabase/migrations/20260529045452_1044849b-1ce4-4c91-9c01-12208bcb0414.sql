
-- ENUMS
CREATE TYPE public.ban_type AS ENUM ('ban','temp_ban','shadow_ban','ip_ban');
CREATE TYPE public.mute_scope AS ENUM ('global','room');
CREATE TYPE public.report_target AS ENUM ('message','post','user','room');
CREATE TYPE public.report_status AS ENUM ('open','reviewing','resolved','dismissed');
CREATE TYPE public.mod_action AS ENUM (
  'ban','unban','temp_ban','shadow_ban','ip_ban',
  'mute','unmute','kick','warn',
  'delete_message','delete_post','pin_message','unpin_message',
  'resolve_report','dismiss_report','note',
  'add_word_filter','remove_word_filter','add_url_rule','remove_url_rule'
);
CREATE TYPE public.word_filter_action AS ENUM ('delete','warn','mute','ban');
CREATE TYPE public.url_rule_kind AS ENUM ('whitelist','block');

-- USER BANS
CREATE TABLE public.user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address inet,
  ban_type public.ban_type NOT NULL DEFAULT 'ban',
  reason text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  CHECK (user_id IS NOT NULL OR ip_address IS NOT NULL)
);
CREATE INDEX idx_user_bans_user ON public.user_bans(user_id) WHERE active;
CREATE INDEX idx_user_bans_ip ON public.user_bans(ip_address) WHERE active;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_bans TO authenticated;
GRANT ALL ON public.user_bans TO service_role;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage bans" ON public.user_bans FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "User can read own ban" ON public.user_bans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- USER MUTES
CREATE TABLE public.user_mutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scope public.mute_scope NOT NULL DEFAULT 'global',
  channel_id text,
  reason text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true
);
CREATE INDEX idx_user_mutes_user ON public.user_mutes(user_id) WHERE active;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_mutes TO authenticated;
GRANT ALL ON public.user_mutes TO service_role;
ALTER TABLE public.user_mutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage mutes" ON public.user_mutes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "User can read own mute" ON public.user_mutes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- REPORTS
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type public.report_target NOT NULL,
  target_id text NOT NULL,
  reason text NOT NULL,
  details text,
  status public.report_status NOT NULL DEFAULT 'open',
  resolved_by uuid,
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_status ON public.reports(status, created_at DESC);
CREATE INDEX idx_reports_target ON public.reports(target_type, target_id);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can submit reports" ON public.reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id AND length(reason) BETWEEN 1 AND 200);
CREATE POLICY "Reporter can read own" ON public.reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);
CREATE POLICY "Admins read all reports" ON public.reports FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- MOD LOGS (append-only audit)
CREATE TABLE public.mod_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action public.mod_action NOT NULL,
  target_user_id uuid,
  target_type text,
  target_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_mod_logs_recent ON public.mod_logs(created_at DESC);
CREATE INDEX idx_mod_logs_target_user ON public.mod_logs(target_user_id);
GRANT SELECT ON public.mod_logs TO authenticated;
GRANT ALL ON public.mod_logs TO service_role;
ALTER TABLE public.mod_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read mod logs" ON public.mod_logs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- MOD NOTES
CREATE TABLE public.mod_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_id uuid NOT NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_mod_notes_user ON public.mod_notes(user_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.mod_notes TO authenticated;
GRANT ALL ON public.mod_notes TO service_role;
ALTER TABLE public.mod_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage notes" ON public.mod_notes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- WORD FILTERS
CREATE TABLE public.word_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text NOT NULL UNIQUE,
  match_mode text NOT NULL DEFAULT 'word' CHECK (match_mode IN ('word','substring','regex')),
  action public.word_filter_action NOT NULL DEFAULT 'delete',
  severity smallint NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.word_filters TO authenticated;
GRANT ALL ON public.word_filters TO service_role;
ALTER TABLE public.word_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage word filters" ON public.word_filters FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- URL RULES
CREATE TABLE public.url_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  kind public.url_rule_kind NOT NULL,
  reason text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.url_rules TO authenticated;
GRANT ALL ON public.url_rules TO service_role;
ALTER TABLE public.url_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read url rules" ON public.url_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage url rules" ON public.url_rules FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins update url rules" ON public.url_rules FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete url rules" ON public.url_rules FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- ROOM MODERATORS
CREATE TABLE public.room_moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL,
  user_id uuid NOT NULL,
  can_mute boolean NOT NULL DEFAULT true,
  can_kick boolean NOT NULL DEFAULT true,
  can_pin boolean NOT NULL DEFAULT true,
  can_delete boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel_id, user_id)
);
GRANT SELECT ON public.room_moderators TO authenticated;
GRANT ALL ON public.room_moderators TO service_role;
ALTER TABLE public.room_moderators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read room mods" ON public.room_moderators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage room mods" ON public.room_moderators FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- HELPER: is_moderator (admin OR mod role OR per-room mod)
CREATE OR REPLACE FUNCTION public.is_moderator(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin','moderator')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_bans
    WHERE user_id = _user_id AND active
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_muted(_user_id uuid, _channel text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_mutes
    WHERE user_id = _user_id AND active
      AND (expires_at IS NULL OR expires_at > now())
      AND (scope = 'global' OR (scope = 'room' AND channel_id = _channel))
  );
$$;

-- Auto word filter: delete-action filters drop the message
CREATE OR REPLACE FUNCTION public.apply_word_filters()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE f record;
BEGIN
  IF NEW.text IS NULL OR NEW.text = '' THEN RETURN NEW; END IF;
  FOR f IN SELECT pattern, match_mode, action FROM public.word_filters WHERE active AND action = 'delete' LOOP
    IF (f.match_mode = 'word'      AND NEW.text ~* ('\m' || f.pattern || '\M')) OR
       (f.match_mode = 'substring' AND POSITION(LOWER(f.pattern) IN LOWER(NEW.text)) > 0) OR
       (f.match_mode = 'regex'     AND NEW.text ~* f.pattern)
    THEN
      RAISE EXCEPTION 'Message blocked by word filter';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

CREATE TRIGGER messages_word_filter
BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.apply_word_filters();

-- Tighten send policy: block bans & mutes
DROP POLICY IF EXISTS "Send as self to lobby games or friend DMs" ON public.messages;
CREATE POLICY "Send as self to lobby games or friend DMs" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT public.is_user_banned(auth.uid())
    AND NOT public.is_user_muted(auth.uid(), channel_id)
    AND (
      channel_id = 'lobby'
      OR channel_id = 'games'
      OR (channel_id LIKE 'dm:%' AND public.is_dm_channel_allowed(channel_id, auth.uid()))
    )
  );
