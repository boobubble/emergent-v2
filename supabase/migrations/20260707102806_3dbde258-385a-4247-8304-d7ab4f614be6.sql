
CREATE POLICY "dm-wallpapers read for authed"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'dm-wallpapers');

CREATE POLICY "dm-wallpapers admin write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dm-wallpapers' AND public.is_admin(auth.uid()));

CREATE POLICY "dm-wallpapers admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'dm-wallpapers' AND public.is_admin(auth.uid()));

CREATE POLICY "dm-wallpapers user upload own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dm-wallpapers'
    AND (storage.foldername(name))[1] = 'custom'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "dm-wallpapers user delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dm-wallpapers'
    AND (storage.foldername(name))[1] = 'custom'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
