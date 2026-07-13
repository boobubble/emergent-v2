
CREATE OR REPLACE FUNCTION public.list_recent_competition_voters(_competition_id uuid, _limit int DEFAULT 30)
RETURNS TABLE(
  voter_id uuid,
  competitor_id uuid,
  voted_at timestamptz,
  username text,
  avatar_url text,
  avatar_color text,
  is_verified boolean,
  competitor_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.voter_id,
         v.competitor_id,
         v.created_at AS voted_at,
         p.username,
         p.avatar_url,
         p.avatar_color,
         COALESCE(p.is_verified, false) AS is_verified,
         cc.name AS competitor_name
  FROM public.competition_competitor_votes v
  LEFT JOIN public.profiles p ON p.id = v.voter_id
  LEFT JOIN public.competition_competitors cc ON cc.id = v.competitor_id
  WHERE v.competition_id = _competition_id
  ORDER BY v.created_at DESC
  LIMIT LEAST(GREATEST(_limit, 1), 60);
$$;

GRANT EXECUTE ON FUNCTION public.list_recent_competition_voters(uuid, int) TO anon, authenticated;
