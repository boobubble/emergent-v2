
-- 1) banned devices ---------------------------------------------------------
CREATE TABLE public.banned_devices (
  fingerprint    text PRIMARY KEY,
  source_user_id uuid,
  reason         text,
  created_by     uuid NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_banned_devices_source_user ON public.banned_devices(source_user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.banned_devices TO authenticated;
GRANT ALL ON public.banned_devices TO service_role;

ALTER TABLE public.banned_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage banned devices"
  ON public.banned_devices
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2) user_devices -----------------------------------------------------------
CREATE TABLE public.user_devices (
  user_id     uuid NOT NULL,
  fingerprint text NOT NULL,
  user_agent  text,
  ip_address  inet,
  first_seen  timestamptz NOT NULL DEFAULT now(),
  last_seen   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, fingerprint)
);
CREATE INDEX idx_user_devices_fp ON public.user_devices(fingerprint);
CREATE INDEX idx_user_devices_user ON public.user_devices(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_devices TO authenticated;
GRANT ALL ON public.user_devices TO service_role;

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own devices"
  ON public.user_devices
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all devices"
  ON public.user_devices FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3) public-callable check --------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_device_banned(_fp text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.banned_devices WHERE fingerprint = _fp)
$$;

GRANT EXECUTE ON FUNCTION public.is_device_banned(text) TO anon, authenticated;
