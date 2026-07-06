
-- Table
CREATE TABLE public.custom_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pack TEXT NOT NULL DEFAULT 'Custom',
  kind TEXT NOT NULL DEFAULT 'sticker' CHECK (kind IN ('sticker','emoji')),
  url TEXT NOT NULL,
  storage_path TEXT,
  mime TEXT,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_stickers TO authenticated;
GRANT SELECT ON public.custom_stickers TO anon;
GRANT ALL ON public.custom_stickers TO service_role;

ALTER TABLE public.custom_stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active custom stickers"
  ON public.custom_stickers FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert custom stickers"
  ON public.custom_stickers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update custom stickers"
  ON public.custom_stickers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete custom stickers"
  ON public.custom_stickers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX custom_stickers_kind_active_idx ON public.custom_stickers (kind, is_active, sort_order);

CREATE TRIGGER custom_stickers_updated_at
  BEFORE UPDATE ON public.custom_stickers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for "stickers" bucket
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
  );

CREATE POLICY "Admins can delete from stickers bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'stickers'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  );
