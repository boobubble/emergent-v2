
DROP FUNCTION IF EXISTS public.pathescape_leaderboard(uuid, int);
CREATE OR REPLACE FUNCTION public.pathescape_leaderboard(_level_id uuid, _limit int DEFAULT 25)
RETURNS TABLE (rank int, score_id uuid, user_id uuid, username text, avatar_url text, stars int, moves int, time_ms int, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH best AS (
    SELECT DISTINCT ON (s.user_id) s.id AS score_id, s.user_id, s.stars, s.moves, s.time_ms, s.created_at
      FROM public.pathescape_scores s
     WHERE s.level_id = _level_id
     ORDER BY s.user_id, s.stars DESC, s.moves ASC, s.time_ms ASC
  )
  SELECT (row_number() OVER (ORDER BY b.stars DESC, b.moves ASC, b.time_ms ASC))::int AS rank,
         b.score_id, b.user_id, p.username, p.avatar_url, b.stars, b.moves, b.time_ms, b.created_at
    FROM best b LEFT JOIN public.profiles p ON p.id = b.user_id
   ORDER BY rank LIMIT _limit;
$$;
GRANT EXECUTE ON FUNCTION public.pathescape_leaderboard(uuid, int) TO anon, authenticated;
