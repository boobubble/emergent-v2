-- 1. Restrict profile self-update to display fields only; lock economy fields
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update own profile display fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND xp = (SELECT xp FROM public.profiles WHERE id = auth.uid())
  AND coins = (SELECT coins FROM public.profiles WHERE id = auth.uid())
  AND level = (SELECT level FROM public.profiles WHERE id = auth.uid())
  AND streak = (SELECT streak FROM public.profiles WHERE id = auth.uid())
  AND longest_streak = (SELECT longest_streak FROM public.profiles WHERE id = auth.uid())
);

-- 2. Tighten friendship deletion: senders may only delete pending requests
DROP POLICY IF EXISTS "Delete own friendship" ON public.friendships;

CREATE POLICY "Delete own friendship"
ON public.friendships
FOR DELETE
TO authenticated
USING (
  (auth.uid() = sender_id AND status = 'pending')
  OR auth.uid() = receiver_id
);

-- 3. Set search_path on remaining functions
CREATE OR REPLACE FUNCTION public.slugify(input text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  s text;
BEGIN
  IF input IS NULL THEN RETURN ''; END IF;
  s := lower(input);
  s := regexp_replace(s, 'https?://\S+', ' ', 'g');
  s := regexp_replace(s, '[^a-z0-9\s-]', ' ', 'g');
  s := regexp_replace(s, '[\s-]+', '-', 'g');
  s := trim(both '-' from s);
  IF length(s) > 60 THEN s := substr(s, 1, 60); s := trim(both '-' from s); END IF;
  IF s = '' THEN s := 'post'; END IF;
  RETURN s;
END;
$function$;

CREATE OR REPLACE FUNCTION public.posts_assign_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;