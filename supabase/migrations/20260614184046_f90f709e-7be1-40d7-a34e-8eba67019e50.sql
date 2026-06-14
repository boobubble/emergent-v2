CREATE OR REPLACE FUNCTION public.validate_profile_username()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v TEXT;
  letter_count INT;
  is_anon BOOLEAN;
BEGIN
  v := TRIM(NEW.username);
  IF v IS NULL OR LENGTH(v) = 0 THEN
    RAISE EXCEPTION 'Username cannot be empty';
  END IF;
  IF LENGTH(v) > 64 THEN
    RAISE EXCEPTION 'Username must be 64 characters or fewer';
  END IF;

  -- Official bot accounts: allow admin-chosen names with relaxed rules
  -- (letters, numbers, spaces, underscore, hyphen, dot; 2-64 chars).
  IF COALESCE(NEW.is_bot, false) THEN
    IF v !~ '^[A-Za-z0-9_.\- ]+$' THEN
      RAISE EXCEPTION 'Only letters, numbers, spaces, underscore, hyphen and dot are allowed';
    END IF;
    NEW.username := v;
    RETURN NEW;
  END IF;

  IF LENGTH(v) > 32 THEN
    RAISE EXCEPTION 'Username must be 32 characters or fewer';
  END IF;

  -- Allow the system-generated 'guest-...' usernames only for anonymous users
  IF v ILIKE 'guest-%' THEN
    SELECT COALESCE(u.is_anonymous, false) INTO is_anon
    FROM auth.users u WHERE u.id = NEW.id;
    IF NOT COALESCE(is_anon, false) THEN
      RAISE EXCEPTION 'Reserved username prefix';
    END IF;
    NEW.username := v;
    RETURN NEW;
  END IF;

  IF v !~ '^[A-Za-z0-9_ ]+$' THEN
    RAISE EXCEPTION 'Only letters, numbers, spaces and underscore are allowed';
  END IF;

  letter_count := LENGTH(REGEXP_REPLACE(v, '[^A-Za-z]', '', 'g'));
  IF letter_count < 2 OR letter_count > 10 THEN
    RAISE EXCEPTION 'Username must contain between 2 and 10 letters';
  END IF;

  NEW.username := v;
  RETURN NEW;
END;
$function$;