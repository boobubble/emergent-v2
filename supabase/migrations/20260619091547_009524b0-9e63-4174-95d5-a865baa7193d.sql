
CREATE OR REPLACE FUNCTION public.prevent_gamification_field_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role (server-side trusted code) to bypass
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Allow SECURITY DEFINER functions owned by 'postgres' (our trusted RPCs
  -- such as unlock_chat_theme, unlock_feed_theme, create_trio_room,
  -- accept_trio_invite) to mutate gamification fields. Inside a definer
  -- function created by postgres, current_user evaluates to 'postgres'.
  IF current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.xp IS DISTINCT FROM OLD.xp
     OR NEW.coins IS DISTINCT FROM OLD.coins
     OR NEW.level IS DISTINCT FROM OLD.level
     OR NEW.streak IS DISTINCT FROM OLD.streak
     OR NEW.longest_streak IS DISTINCT FROM OLD.longest_streak THEN
    RAISE EXCEPTION 'Gamification fields can only be modified by trusted server code';
  END IF;

  RETURN NEW;
END;
$$;
