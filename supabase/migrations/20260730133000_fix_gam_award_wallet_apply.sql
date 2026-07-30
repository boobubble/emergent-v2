-- Fix gam_award: route coins through wallet_apply correctly, sync level with XP,
-- and remove the broken manual coin_transactions / profiles.coins fallback.

CREATE OR REPLACE FUNCTION public.gam_award(
  _user_id uuid, _coins integer, _xp integer,
  _badge text, _reason text, _reference text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _coins IS NOT NULL AND _coins > 0 THEN
    PERFORM public.wallet_apply(
      _user      := _user_id,
      _amount    := _coins,
      _direction := 'credit',
      _kind      := COALESCE(_reason, 'gamification'),
      _status    := 'completed',
      _provider  := 'system',
      _reference := _reference,
      _metadata  := jsonb_build_object('badge', _badge)
    );
  END IF;

  IF _xp IS NOT NULL AND _xp > 0 THEN
    UPDATE public.profiles
       SET xp = COALESCE(xp, 0) + _xp,
           level = GREATEST(1, (COALESCE(xp, 0) + _xp) / 50 + 1)
     WHERE id = _user_id;
  END IF;

  IF _badge IS NOT NULL AND _badge <> '' THEN
    UPDATE public.profiles
       SET badges = ARRAY(SELECT DISTINCT unnest(COALESCE(badges, '{}'::text[]) || ARRAY[_badge]))
     WHERE id = _user_id
       AND NOT (COALESCE(badges, '{}'::text[]) @> ARRAY[_badge]);
  END IF;

  BEGIN
    INSERT INTO public.notifications (user_id, kind, payload)
    VALUES (_user_id, 'gamification_reward', jsonb_build_object(
      'coins', _coins, 'xp', _xp, 'badge', _badge, 'reason', _reason, 'ref', _reference));
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.gam_award(uuid, integer, integer, text, text, text) FROM PUBLIC;
