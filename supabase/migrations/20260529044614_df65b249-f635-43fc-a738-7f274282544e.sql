DROP POLICY IF EXISTS "User can update own ready/seat" ON public.game_players;

CREATE POLICY "User can update own ready/seat"
ON public.game_players
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND score = (SELECT gp.score FROM public.game_players gp WHERE gp.id = game_players.id)
  AND color = (SELECT gp.color FROM public.game_players gp WHERE gp.id = game_players.id)
);