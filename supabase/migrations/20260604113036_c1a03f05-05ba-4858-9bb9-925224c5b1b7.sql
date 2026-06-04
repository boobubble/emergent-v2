
-- Public read for brand assets (private bucket; we'll still grant SELECT for signed/public access paths)
CREATE POLICY "Brand assets are readable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-assets');

-- Admins can upload/update/delete brand assets
CREATE POLICY "Admins can insert brand assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update brand assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-assets' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete brand assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand-assets' AND public.is_admin(auth.uid()));
