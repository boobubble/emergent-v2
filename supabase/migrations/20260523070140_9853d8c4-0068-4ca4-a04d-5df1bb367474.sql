
-- 1) Add slug column (nullable initially for backfill)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS slug text;

-- 2) Slugify helper: lowercase, strip non-alphanumerics, collapse to hyphens, trim, cap at 60 chars
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  s text;
BEGIN
  IF input IS NULL THEN RETURN ''; END IF;
  s := lower(input);
  -- strip urls
  s := regexp_replace(s, 'https?://\S+', ' ', 'g');
  -- keep only a-z 0-9 and spaces/hyphens
  s := regexp_replace(s, '[^a-z0-9\s-]', ' ', 'g');
  -- collapse whitespace/hyphens to single hyphen
  s := regexp_replace(s, '[\s-]+', '-', 'g');
  s := trim(both '-' from s);
  IF length(s) > 60 THEN s := substr(s, 1, 60); s := trim(both '-' from s); END IF;
  IF s = '' THEN s := 'post'; END IF;
  RETURN s;
END;
$$;

-- 3) Backfill existing posts with unique slugs
DO $$
DECLARE
  r RECORD;
  base_slug text;
  candidate text;
  suffix text;
BEGIN
  FOR r IN SELECT id, text, kind FROM public.posts WHERE slug IS NULL ORDER BY created_at ASC LOOP
    base_slug := public.slugify(COALESCE(NULLIF(r.text, ''), r.kind::text));
    candidate := base_slug;
    IF EXISTS (SELECT 1 FROM public.posts WHERE slug = candidate) THEN
      suffix := substr(replace(r.id::text, '-', ''), 1, 5);
      candidate := base_slug || '-' || suffix;
      -- extremely unlikely, but ensure uniqueness
      WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = candidate) LOOP
        candidate := base_slug || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 5);
      END LOOP;
    END IF;
    UPDATE public.posts SET slug = candidate WHERE id = r.id;
  END LOOP;
END $$;

-- 4) Enforce NOT NULL + uniqueness going forward
ALTER TABLE public.posts ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON public.posts (slug);

-- 5) Auto-fill slug on insert if client doesn't supply one, with collision-resilient suffix
CREATE OR REPLACE FUNCTION public.posts_assign_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  candidate text;
  tries int := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := public.slugify(COALESCE(NULLIF(NEW.text, ''), NEW.kind::text));
    candidate := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = candidate AND id <> NEW.id) LOOP
      tries := tries + 1;
      candidate := base_slug || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 4 + tries);
      IF tries > 8 THEN EXIT; END IF;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_assign_slug_trigger ON public.posts;
CREATE TRIGGER posts_assign_slug_trigger
BEFORE INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.posts_assign_slug();
