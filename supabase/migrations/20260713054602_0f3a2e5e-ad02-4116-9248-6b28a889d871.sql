
-- 1. Trim existing slugs
UPDATE public.competitions
SET slug = regexp_replace(trim(slug), '\s+', '-', 'g')
WHERE slug IS NOT NULL AND slug != regexp_replace(trim(slug), '\s+', '-', 'g');

-- 2. Enforce normalized slugs going forward via trigger
CREATE OR REPLACE FUNCTION public.normalize_competition_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    NEW.slug := regexp_replace(trim(NEW.slug), '\s+', '-', 'g');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_competition_slug ON public.competitions;
CREATE TRIGGER trg_normalize_competition_slug
BEFORE INSERT OR UPDATE OF slug ON public.competitions
FOR EACH ROW EXECUTE FUNCTION public.normalize_competition_slug();
