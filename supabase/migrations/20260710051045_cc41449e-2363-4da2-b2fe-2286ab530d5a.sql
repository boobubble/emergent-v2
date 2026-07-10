-- Replace insecure self-referencing UPDATE RLS policy on game_players with trigger-based protection

DROP POLICY IF EXISTS "User can update own ready/seat" ON public.game_players;

CREATE POLICY "User can update own ready/seat"
ON public.game_players
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_game_player_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_privileged boolean := false;
  jwt_role text;
BEGIN
  -- Allow service_role and postgres to bypass
  BEGIN
    jwt_role := current_setting('request.jwt.claims', true)::json->>'role';
  EXCEPTION WHEN OTHERS THEN
    jwt_role := NULL;
  END;

  IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
    is_privileged := true;
  ELSIF jwt_role = 'service_role' THEN
    is_privileged := true;
  ELSIF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') THEN
    is_privileged := true;
  END IF;

  IF is_privileged THEN
    RETURN NEW;
  END IF;

  -- Immutable identity fields
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.game_id IS DISTINCT FROM OLD.game_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.joined_at IS DISTINCT FROM OLD.joined_at THEN
    RAISE EXCEPTION 'Cannot modify identity fields on game_players';
  END IF;

  -- Protected gameplay fields
  IF NEW.score IS DISTINCT FROM OLD.score THEN
    RAISE EXCEPTION 'score can only be updated by game server logic';
  END IF;

  IF NEW.seat IS DISTINCT FROM OLD.seat THEN
    RAISE EXCEPTION 'seat can only be updated by game server logic';
  END IF;

  IF NEW.color IS DISTINCT FROM OLD.color THEN
    RAISE EXCEPTION 'color is system-controlled and cannot be modified by players';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_game_player_fields_trg ON public.game_players;
CREATE TRIGGER protect_game_player_fields_trg
BEFORE UPDATE ON public.game_players
FOR EACH ROW
EXECUTE FUNCTION public.protect_game_player_fields();