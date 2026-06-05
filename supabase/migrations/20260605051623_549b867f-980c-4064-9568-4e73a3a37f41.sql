CREATE TABLE public.dj_broadcast_credentials (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  provider TEXT NOT NULL DEFAULT 'azuracast',
  host TEXT,
  port INTEGER,
  mount TEXT,
  station_shortcode TEXT,
  source_username TEXT,
  source_password TEXT,
  listen_url TEXT,
  dj_name TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dj_broadcast_credentials TO authenticated;
GRANT ALL ON public.dj_broadcast_credentials TO service_role;

ALTER TABLE public.dj_broadcast_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage broadcast credentials"
ON public.dj_broadcast_credentials
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));