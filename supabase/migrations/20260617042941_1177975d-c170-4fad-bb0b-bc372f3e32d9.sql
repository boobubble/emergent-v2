
CREATE TABLE public.radio_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NULL REFERENCES public.radio_widgets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('upcoming_show','ticker','community')),
  title text NOT NULL,
  body text,
  link text,
  starts_at timestamptz,
  ends_at timestamptz,
  pinned boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  target jsonb NOT NULL DEFAULT '{"widget":true,"chatbar":true,"notifications":true,"feed":true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.radio_announcements TO authenticated;
GRANT ALL ON public.radio_announcements TO service_role;

ALTER TABLE public.radio_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read announcements"
  ON public.radio_announcements FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "broadcaster insert announcements"
  ON public.radio_announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'dj'::app_role)
    OR public.has_role(auth.uid(), 'rj'::app_role)
  );

CREATE POLICY "broadcaster update announcements"
  ON public.radio_announcements FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'dj'::app_role)
    OR public.has_role(auth.uid(), 'rj'::app_role)
  );

CREATE POLICY "broadcaster delete announcements"
  ON public.radio_announcements FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'dj'::app_role)
    OR public.has_role(auth.uid(), 'rj'::app_role)
  );

CREATE INDEX radio_announcements_kind_active_idx
  ON public.radio_announcements (kind, active, pinned DESC, created_at DESC);
CREATE INDEX radio_announcements_widget_idx
  ON public.radio_announcements (widget_id);

CREATE TRIGGER update_radio_announcements_updated_at
  BEFORE UPDATE ON public.radio_announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_announcements;
