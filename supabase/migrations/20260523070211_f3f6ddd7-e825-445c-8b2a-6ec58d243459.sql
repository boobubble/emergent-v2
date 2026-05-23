
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
  ELSE
    base_slug := public.slugify(NEW.slug);
    IF base_slug = '' THEN base_slug := 'post'; END IF;
  END IF;
  candidate := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = candidate AND id <> NEW.id) LOOP
    tries := tries + 1;
    candidate := base_slug || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 4 + tries);
    IF tries > 8 THEN EXIT; END IF;
  END LOOP;
  NEW.slug := candidate;
  RETURN NEW;
END;
$$;
