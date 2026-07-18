
-- 1. Move join password hashes into a secrets table with no client-role grants.
CREATE TABLE public.community_password_secrets (
  community_id UUID PRIMARY KEY REFERENCES public.communities(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.community_password_secrets TO service_role;
ALTER TABLE public.community_password_secrets ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: only service_role (admin client) may access.

-- Migrate existing hashes off the public-readable column.
INSERT INTO public.community_password_secrets (community_id, password_hash)
SELECT id, join_password_hash
FROM public.communities
WHERE join_password_hash IS NOT NULL
ON CONFLICT (community_id) DO NOTHING;

ALTER TABLE public.communities DROP COLUMN join_password_hash;

-- 2. Restrict SELECT on communities so private communities are member-only.
DROP POLICY IF EXISTS "communities read" ON public.communities;
CREATE POLICY "communities read"
ON public.communities
FOR SELECT
USING (
  status = 'active'
  AND (
    privacy_mode::text = 'public'
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.community_members m
      WHERE m.community_id = communities.id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);
