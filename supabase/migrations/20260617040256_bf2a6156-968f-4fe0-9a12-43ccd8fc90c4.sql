
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- radio_widgets
-- ============================================================
CREATE TABLE public.radio_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_url text,
  accent_color text DEFAULT '#a855f7',
  enabled boolean NOT NULL DEFAULT true,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.radio_widgets TO authenticated;
GRANT SELECT ON public.radio_widgets TO anon;
GRANT ALL ON public.radio_widgets TO service_role;

ALTER TABLE public.radio_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "radio_widgets_select_all"
  ON public.radio_widgets FOR SELECT USING (true);

CREATE POLICY "radio_widgets_insert_staff"
  ON public.radio_widgets FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'dj')
    OR public.has_role(auth.uid(), 'rj')
  );

CREATE POLICY "radio_widgets_update_owner_or_admin"
  ON public.radio_widgets FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "radio_widgets_delete_admin"
  ON public.radio_widgets FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE TRIGGER trg_radio_widgets_updated_at
  BEFORE UPDATE ON public.radio_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- radio_widget_state (1:1 with radio_widgets)
-- ============================================================
CREATE TABLE public.radio_widget_state (
  widget_id uuid PRIMARY KEY REFERENCES public.radio_widgets(id) ON DELETE CASCADE,
  is_live boolean NOT NULL DEFAULT false,
  current_host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  current_show_title text,
  current_track_title text,
  current_track_artist text,
  current_track_artwork text,
  listener_count integer NOT NULL DEFAULT 0,
  queue_size integer NOT NULL DEFAULT 0,
  mic_active boolean NOT NULL DEFAULT false,
  peak_listeners_24h integer NOT NULL DEFAULT 0,
  samples_24h jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.radio_widget_state TO authenticated;
GRANT SELECT ON public.radio_widget_state TO anon;
GRANT ALL ON public.radio_widget_state TO service_role;

ALTER TABLE public.radio_widget_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "radio_widget_state_select_all"
  ON public.radio_widget_state FOR SELECT USING (true);

CREATE POLICY "radio_widget_state_insert_host_or_admin"
  ON public.radio_widget_state FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.radio_widgets w
      WHERE w.id = widget_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "radio_widget_state_update_host_or_admin"
  ON public.radio_widget_state FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.radio_widgets w
      WHERE w.id = widget_id AND w.owner_id = auth.uid()
    )
    OR current_host_id = auth.uid()
  )
  WITH CHECK (true);

CREATE POLICY "radio_widget_state_delete_admin"
  ON public.radio_widget_state FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE TRIGGER trg_radio_widget_state_updated_at
  BEFORE UPDATE ON public.radio_widget_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create state row when a widget is created
CREATE OR REPLACE FUNCTION public.create_radio_widget_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.radio_widget_state(widget_id) VALUES (NEW.id)
  ON CONFLICT (widget_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_radio_widgets_create_state
  AFTER INSERT ON public.radio_widgets
  FOR EACH ROW EXECUTE FUNCTION public.create_radio_widget_state();

-- ============================================================
-- radio_schedules
-- ============================================================
CREATE TYPE public.radio_schedule_status AS ENUM ('scheduled','live','completed','cancelled');

CREATE TABLE public.radio_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES public.radio_widgets(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status public.radio_schedule_status NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ends_after_starts CHECK (ends_at > starts_at)
);

ALTER TABLE public.radio_schedules
  ADD CONSTRAINT radio_schedules_no_overlap
  EXCLUDE USING gist (
    widget_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status <> 'cancelled');

CREATE INDEX idx_radio_schedules_widget_time
  ON public.radio_schedules(widget_id, starts_at);
CREATE INDEX idx_radio_schedules_host
  ON public.radio_schedules(host_id, starts_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.radio_schedules TO authenticated;
GRANT SELECT ON public.radio_schedules TO anon;
GRANT ALL ON public.radio_schedules TO service_role;

ALTER TABLE public.radio_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "radio_schedules_select_all"
  ON public.radio_schedules FOR SELECT USING (true);

CREATE POLICY "radio_schedules_insert_staff"
  ON public.radio_schedules FOR INSERT TO authenticated
  WITH CHECK (
    host_id = auth.uid()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'dj')
      OR public.has_role(auth.uid(), 'rj')
    )
  );

CREATE POLICY "radio_schedules_update_host_or_admin"
  ON public.radio_schedules FOR UPDATE TO authenticated
  USING (
    host_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    host_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "radio_schedules_delete_host_or_admin"
  ON public.radio_schedules FOR DELETE TO authenticated
  USING (
    host_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE TRIGGER trg_radio_schedules_updated_at
  BEFORE UPDATE ON public.radio_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- radio_queue_items
-- ============================================================
CREATE TABLE public.radio_queue_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES public.radio_widgets(id) ON DELETE CASCADE,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  position integer NOT NULL DEFAULT 0,
  youtube_url text NOT NULL,
  youtube_id text,
  title text,
  channel text,
  thumbnail text,
  duration_seconds integer,
  played boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_radio_queue_widget_pos
  ON public.radio_queue_items(widget_id, played, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.radio_queue_items TO authenticated;
GRANT SELECT ON public.radio_queue_items TO anon;
GRANT ALL ON public.radio_queue_items TO service_role;

ALTER TABLE public.radio_queue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "radio_queue_select_all"
  ON public.radio_queue_items FOR SELECT USING (true);

CREATE POLICY "radio_queue_insert_host_or_admin"
  ON public.radio_queue_items FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.radio_widgets w
      WHERE w.id = widget_id AND w.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.radio_widget_state s
      WHERE s.widget_id = widget_id AND s.current_host_id = auth.uid()
    )
  );

CREATE POLICY "radio_queue_update_host_or_admin"
  ON public.radio_queue_items FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.radio_widgets w
      WHERE w.id = widget_id AND w.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.radio_widget_state s
      WHERE s.widget_id = widget_id AND s.current_host_id = auth.uid()
    )
  )
  WITH CHECK (true);

CREATE POLICY "radio_queue_delete_host_or_admin"
  ON public.radio_queue_items FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.radio_widgets w
      WHERE w.id = widget_id AND w.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.radio_widget_state s
      WHERE s.widget_id = widget_id AND s.current_host_id = auth.uid()
    )
  );

-- ============================================================
-- broadcaster_settings (single row)
-- ============================================================
CREATE TABLE public.broadcaster_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  disclaimer_text text NOT NULL DEFAULT 'Radio hosts are responsible for the media they play. The platform does not host copyrighted content and only plays media selected by hosts.',
  disclaimer_enabled boolean NOT NULL DEFAULT true,
  ticker_template text NOT NULL DEFAULT '🎙 LIVE NOW: {live} | NEXT: {next} | UPCOMING: {upcoming}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.broadcaster_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

GRANT SELECT ON public.broadcaster_settings TO anon, authenticated;
GRANT UPDATE ON public.broadcaster_settings TO authenticated;
GRANT ALL ON public.broadcaster_settings TO service_role;

ALTER TABLE public.broadcaster_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "broadcaster_settings_select_all"
  ON public.broadcaster_settings FOR SELECT USING (true);

CREATE POLICY "broadcaster_settings_update_admin"
  ON public.broadcaster_settings FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE TRIGGER trg_broadcaster_settings_updated_at
  BEFORE UPDATE ON public.broadcaster_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_widgets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_widget_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_queue_items;

ALTER TABLE public.radio_widgets REPLICA IDENTITY FULL;
ALTER TABLE public.radio_widget_state REPLICA IDENTITY FULL;
ALTER TABLE public.radio_schedules REPLICA IDENTITY FULL;
ALTER TABLE public.radio_queue_items REPLICA IDENTITY FULL;
