
-- Batch 1 profile additions: birthday, country, badges, sound preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birthday date,
  ADD COLUMN IF NOT EXISTS hide_birth_year boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS show_country_flag boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_guest_badge boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sound_prefs jsonb NOT NULL DEFAULT jsonb_build_object(
    'public_chat', true,
    'private_chat', true,
    'notifications', true,
    'username_mention', true,
    'calls', true
  );

-- Country code format: ISO 3166-1 alpha-2 (e.g. "US", "GB", "IN"). 2 letters, uppercase.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_country_code_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_country_code_check
  CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$');

-- Recreate handle_new_user to pass birthday / country / hide_birth_year through from signup metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INTEGER := 0;
  g TEXT;
  bday DATE;
  hide_year BOOLEAN;
  cc TEXT;
BEGIN
  base_username := COALESCE(
    NULLIF(LOWER(REGEXP_REPLACE(NEW.raw_user_meta_data->>'username', '[^a-zA-Z0-9_]', '', 'g')), ''),
    NULLIF(LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')), ''),
    'user' || SUBSTR(NEW.id::text, 1, 6)
  );
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(final_username)) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  g := NEW.raw_user_meta_data->>'gender';
  IF g NOT IN ('male','female','other') THEN g := NULL; END IF;

  BEGIN
    bday := NULLIF(NEW.raw_user_meta_data->>'birthday','')::date;
  EXCEPTION WHEN OTHERS THEN bday := NULL;
  END;
  hide_year := COALESCE(NULLIF(NEW.raw_user_meta_data->>'hide_birth_year','')::boolean, false);
  cc := UPPER(COALESCE(NEW.raw_user_meta_data->>'country_code',''));
  IF cc !~ '^[A-Z]{2}$' THEN cc := NULL; END IF;

  INSERT INTO public.profiles (id, username, avatar_color, gender, birthday, hide_birth_year, country_code)
  VALUES (
    NEW.id,
    final_username,
    'oklch(0.7 0.15 ' || ((ABS(HASHTEXT(NEW.id::text)) % 360))::text || ')',
    g,
    bday,
    hide_year,
    cc
  );
  RETURN NEW;
END;
$function$;
