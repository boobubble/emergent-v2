
DROP FUNCTION IF EXISTS public.exec_sql(text);

CREATE OR REPLACE FUNCTION public.hash_room_password()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.password IS NULL OR NEW.password = '' THEN
    NEW.password := NULL;
    RETURN NEW;
  END IF;
  IF NEW.password ~ '^\$2[aby]\$' THEN
    RETURN NEW;
  END IF;
  NEW.password := extensions.crypt(NEW.password, extensions.gen_salt('bf', 10));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chatrooms_hash_password ON public.chatrooms;
CREATE TRIGGER chatrooms_hash_password
BEFORE INSERT OR UPDATE OF password ON public.chatrooms
FOR EACH ROW EXECUTE FUNCTION public.hash_room_password();

DROP TRIGGER IF EXISTS trio_rooms_hash_password ON public.trio_rooms;
CREATE TRIGGER trio_rooms_hash_password
BEFORE INSERT OR UPDATE OF password ON public.trio_rooms
FOR EACH ROW EXECUTE FUNCTION public.hash_room_password();

UPDATE public.chatrooms
   SET password = extensions.crypt(password, extensions.gen_salt('bf', 10))
 WHERE password IS NOT NULL AND password <> '' AND password !~ '^\$2[aby]\$';

UPDATE public.trio_rooms
   SET password = extensions.crypt(password, extensions.gen_salt('bf', 10))
 WHERE password IS NOT NULL AND password <> '' AND password !~ '^\$2[aby]\$';

CREATE OR REPLACE FUNCTION public.verify_chatroom_password(_room uuid, _password text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chatrooms
    WHERE id = _room
      AND (
        password IS NULL
        OR password = ''
        OR password = extensions.crypt(COALESCE(_password, ''), password)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.verify_trio_room_password(_room uuid, _password text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trio_rooms
    WHERE id = _room
      AND (
        password IS NULL
        OR password = ''
        OR password = extensions.crypt(COALESCE(_password, ''), password)
      )
  );
$$;

DROP FUNCTION IF EXISTS public.get_chatroom_password(uuid);
DROP FUNCTION IF EXISTS public.get_trio_room_password(uuid);

REVOKE SELECT (password) ON public.chatrooms  FROM anon, authenticated;
REVOKE SELECT (password) ON public.trio_rooms FROM anon, authenticated;
