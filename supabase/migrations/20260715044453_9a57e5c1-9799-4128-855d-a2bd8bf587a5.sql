
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS is_partner boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_trusted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'not_verified';

CREATE TABLE IF NOT EXISTS public.community_verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  community_name text NOT NULL,
  website text,
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  business_email text,
  reason text,
  doc_urls text[] NOT NULL DEFAULT '{}'::text[],
  admin_notes text,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cvr_community_idx ON public.community_verification_requests(community_id);
CREATE INDEX IF NOT EXISTS cvr_status_idx ON public.community_verification_requests(status);
CREATE INDEX IF NOT EXISTS cvr_submitted_by_idx ON public.community_verification_requests(submitted_by);

GRANT SELECT, INSERT, UPDATE ON public.community_verification_requests TO authenticated;
GRANT ALL ON public.community_verification_requests TO service_role;

ALTER TABLE public.community_verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cvr owner or admin read"
  ON public.community_verification_requests FOR SELECT
  TO authenticated
  USING (
    submitted_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "cvr owner insert"
  ON public.community_verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    submitted_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "cvr owner or admin update"
  ON public.community_verification_requests FOR UPDATE
  TO authenticated
  USING (
    (submitted_by = auth.uid() AND status IN ('pending','needs_changes'))
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (true);

DROP TRIGGER IF EXISTS cvr_updated_at ON public.community_verification_requests;
CREATE TRIGGER cvr_updated_at
  BEFORE UPDATE ON public.community_verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
