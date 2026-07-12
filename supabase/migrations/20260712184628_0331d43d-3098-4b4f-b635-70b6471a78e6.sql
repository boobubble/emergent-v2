DROP POLICY IF EXISTS "Public can read stickers bucket" ON storage.objects;
CREATE POLICY "Authenticated can read stickers bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'stickers');