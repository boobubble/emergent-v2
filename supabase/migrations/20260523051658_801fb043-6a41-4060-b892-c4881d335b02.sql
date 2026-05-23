UPDATE public.profiles p
SET gender = u.raw_user_meta_data->>'gender'
FROM auth.users u
WHERE u.id = p.id
  AND p.gender IS NULL
  AND u.raw_user_meta_data->>'gender' IN ('male','female','other')
  AND p.username NOT ILIKE 'guest-%';