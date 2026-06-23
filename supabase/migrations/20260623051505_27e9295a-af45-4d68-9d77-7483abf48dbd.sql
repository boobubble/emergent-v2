INSERT INTO public.testimonials (author_id, target_user_id, body, approved)
VALUES (
  '1cdf811b-79f4-45f2-a475-a50f6f386c6c',
  'ba8965f8-944b-4fbb-815d-7e76d954558f',
  'JD is the heart of the feed — always brings the vibes ✨ (verification scrap)',
  true
)
ON CONFLICT (author_id, target_user_id) DO UPDATE SET body = EXCLUDED.body;