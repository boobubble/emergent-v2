
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
  ph TEXT;
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

  ph := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone','')), '');
  IF ph IS NOT NULL AND ph !~ '^\+?[0-9 .\-()]{6,20}$' THEN ph := NULL; END IF;

  INSERT INTO public.profiles (id, username, avatar_color, gender, birthday, hide_birth_year, country_code, phone)
  VALUES (
    NEW.id,
    final_username,
    'oklch(0.7 0.15 ' || ((ABS(HASHTEXT(NEW.id::text)) % 360))::text || ')',
    g,
    bday,
    hide_year,
    cc,
    ph
  );
  RETURN NEW;
END;
$function$;
