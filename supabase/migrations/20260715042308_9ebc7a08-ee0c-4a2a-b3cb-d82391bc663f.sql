
-- Community visibility (discovery control) — separate from privacy (access control)
DO $$ BEGIN
  CREATE TYPE public.community_visibility AS ENUM ('public','hidden','unlisted','featured_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS visibility public.community_visibility NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_official boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS country text;

CREATE INDEX IF NOT EXISTS communities_visibility_idx ON public.communities(visibility) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS communities_category_idx ON public.communities(category) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS communities_featured_idx ON public.communities(is_featured) WHERE is_featured = true;
