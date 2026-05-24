-- 1. Tighten friendships delete policy
DROP POLICY IF EXISTS "Delete own friendship" ON public.friendships;

CREATE POLICY "Delete own pending friendship"
ON public.friendships
FOR DELETE
TO authenticated
USING (
  status = 'pending'
  AND (auth.uid() = sender_id OR auth.uid() = receiver_id)
);

-- 2. Block client mutation of gamification fields via trigger
CREATE OR REPLACE FUNCTION public.prevent_gamification_field_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow service_role (server-side trusted code) to bypass
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF auth.role() = 'service_role' THEN
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

DROP TRIGGER IF EXISTS profiles_prevent_gamification_changes ON public.profiles;
CREATE TRIGGER profiles_prevent_gamification_changes
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_gamification_field_changes();