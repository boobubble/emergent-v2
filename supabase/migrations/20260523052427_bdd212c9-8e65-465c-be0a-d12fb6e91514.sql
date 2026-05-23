-- Enforce username rules at the database layer to prevent client bypass.
-- Rules (mirrors client + checkUsernameAvailable server fn):
--   - Total length 1..32 chars
--   - Only letters, numbers, spaces, underscores allowed
--   - Letter count must be between 2 and 10
--   - Reserved 'guest-' prefix only allowed for anonymous auth users
CREATE OR REPLACE FUNCTION public.validate_profile_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v TEXT;
  letter_count INT;
  is_anon BOOLEAN;
BEGIN
  v := TRIM(NEW.username);
  IF v IS NULL OR LENGTH(v) = 0 THEN
    RAISE EXCEPTION 'Username cannot be empty';
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
$$;

DROP TRIGGER IF EXISTS validate_profile_username_trg ON public.profiles;
CREATE TRIGGER validate_profile_username_trg
BEFORE INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_username();