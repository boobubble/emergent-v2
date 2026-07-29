-- Client-side error monitoring (production logs from browser)
CREATE TABLE IF NOT EXISTS public.client_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  route text,
  url text,
  message text NOT NULL,
  stack text,
  component_stack text,
  browser text,
  os text,
  device text,
  screen text,
  app_version text,
  build_version text,
  severity text NOT NULL DEFAULT 'error' CHECK (severity IN ('info', 'warn', 'error', 'fatal')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_client_error_logs_created_at ON public.client_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_severity ON public.client_error_logs (severity);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_route ON public.client_error_logs (route);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_user_id ON public.client_error_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_resolved ON public.client_error_logs (resolved_at) WHERE resolved_at IS NULL;

ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own error reports
CREATE POLICY "Users insert own client errors"
  ON public.client_error_logs FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Admins read all client error logs
CREATE POLICY "Admins read client error logs"
  ON public.client_error_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins update client error logs"
  ON public.client_error_logs FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins delete client error logs"
  ON public.client_error_logs FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'super_admin')
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.client_error_logs;
