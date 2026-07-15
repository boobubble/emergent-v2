
-- 1) Extend communities with slug tier
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS slug_tier text NOT NULL DEFAULT 'standard'
    CHECK (slug_tier IN ('standard','premium','reserved'));

-- 2) Slug history for redirects
CREATE TABLE IF NOT EXISTS public.community_slug_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  old_slug text NOT NULL,
  released_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(old_slug)
);
CREATE INDEX IF NOT EXISTS idx_community_slug_history_community ON public.community_slug_history(community_id);

GRANT SELECT ON public.community_slug_history TO anon, authenticated;
GRANT ALL ON public.community_slug_history TO service_role;
ALTER TABLE public.community_slug_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slug history is public"
  ON public.community_slug_history FOR SELECT
  USING (true);

CREATE POLICY "Admins manage slug history"
  ON public.community_slug_history FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 3) Premium slug claim requests
CREATE TABLE IF NOT EXISTS public.community_premium_slug_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_slug text NOT NULL,
  requested_slug text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  review_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_premium_slug_req_community ON public.community_premium_slug_requests(community_id);
CREATE INDEX IF NOT EXISTS idx_premium_slug_req_status ON public.community_premium_slug_requests(status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_premium_slug_req_pending
  ON public.community_premium_slug_requests(requested_slug)
  WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE ON public.community_premium_slug_requests TO authenticated;
GRANT ALL ON public.community_premium_slug_requests TO service_role;
ALTER TABLE public.community_premium_slug_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own slug requests"
  ON public.community_premium_slug_requests FOR SELECT
  TO authenticated
  USING (
    requested_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Owners create slug requests"
  ON public.community_premium_slug_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "Owners cancel, admins review"
  ON public.community_premium_slug_requests FOR UPDATE
  TO authenticated
  USING (
    (requested_by = auth.uid() AND status = 'pending')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    (requested_by = auth.uid() AND status IN ('pending','cancelled'))
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE TRIGGER update_premium_slug_requests_updated_at
  BEFORE UPDATE ON public.community_premium_slug_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
