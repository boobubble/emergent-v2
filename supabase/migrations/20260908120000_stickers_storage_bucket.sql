-- GIF / animated-emoji uploads use storage bucket "stickers".
-- RLS policies already shipped in 20260706065810 + 20260712184628, but the
-- bucket row was never inserted (unlike avatars / feed-media). Upload then
-- fails with "Bucket not found".
INSERT INTO storage.buckets (id, name, public)
VALUES ('stickers', 'stickers', true)
ON CONFLICT (id) DO NOTHING;

-- Recreate policies idempotently so fresh/partial environments match Yaarzo
-- admin auth (has_role admin / super_admin). Does not use service_role.
DROP POLICY IF EXISTS "Public can read stickers bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read stickers bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to stickers bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update stickers bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from stickers bucket" ON storage.objects;

-- Public SELECT: chat guests load sticker URLs without a session.
-- Matches original stickers design; objects are meant to be used by everyone.
CREATE POLICY "Public can read stickers bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stickers');

CREATE POLICY "Admins can upload to stickers bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'stickers'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Admins can update stickers bucket"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'stickers'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    bucket_id = 'stickers'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Admins can delete from stickers bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'stickers'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  );
