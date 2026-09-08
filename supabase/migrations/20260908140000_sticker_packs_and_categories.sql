-- Sticker categories + packs. Existing custom_stickers.pack is a pack *name*
-- (not a category). kind remains sticker|emoji. Storage paths are untouched.

CREATE TABLE IF NOT EXISTS public.sticker_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO public.sticker_categories (id, name, emoji, sort_order) VALUES
  ('custom',    'Custom',    '⭐', 10),
  ('love',      'Love',      '❤️', 20),
  ('funny',     'Funny',     '😂', 30),
  ('reactions', 'Reactions', '😍', 40)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.sticker_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.sticker_categories(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS sticker_packs_category_name_uidx
  ON public.sticker_packs (category_id, lower(btrim(name)));

CREATE INDEX IF NOT EXISTS sticker_packs_category_active_idx
  ON public.sticker_packs (category_id, is_active, sort_order);

DROP TRIGGER IF EXISTS sticker_packs_updated_at ON public.sticker_packs;
CREATE TRIGGER sticker_packs_updated_at
  BEFORE UPDATE ON public.sticker_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.custom_stickers
  ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES public.sticker_packs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS custom_stickers_pack_id_idx
  ON public.custom_stickers (pack_id);

-- One pack per distinct existing pack name, under Custom.
INSERT INTO public.sticker_packs (name, category_id, sort_order)
SELECT s.name, 'custom', 0
FROM (
  SELECT DISTINCT ON (lower(btrim(COALESCE(NULLIF(btrim(pack), ''), 'Custom'))))
    COALESCE(NULLIF(btrim(pack), ''), 'Custom') AS name
  FROM public.custom_stickers
  ORDER BY lower(btrim(COALESCE(NULLIF(btrim(pack), ''), 'Custom'))), pack
) s
WHERE NOT EXISTS (
  SELECT 1 FROM public.sticker_packs sp
  WHERE sp.category_id = 'custom'
    AND lower(btrim(sp.name)) = lower(btrim(s.name))
);

INSERT INTO public.sticker_packs (name, category_id, sort_order)
SELECT 'Custom', 'custom', 0
WHERE NOT EXISTS (SELECT 1 FROM public.sticker_packs);

UPDATE public.custom_stickers cs
SET pack_id = sp.id
FROM public.sticker_packs sp
WHERE cs.pack_id IS NULL
  AND sp.category_id = 'custom'
  AND lower(btrim(sp.name)) = lower(btrim(COALESCE(NULLIF(btrim(cs.pack), ''), 'Custom')));

-- Keep denormalized pack name in sync (old queries / chat messages use url, not pack).
CREATE OR REPLACE FUNCTION public.sync_custom_sticker_pack_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.pack_id IS NOT NULL THEN
    SELECT name INTO NEW.pack FROM public.sticker_packs WHERE id = NEW.pack_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS custom_stickers_sync_pack_name ON public.custom_stickers;
CREATE TRIGGER custom_stickers_sync_pack_name
  BEFORE INSERT OR UPDATE OF pack_id ON public.custom_stickers
  FOR EACH ROW EXECUTE FUNCTION public.sync_custom_sticker_pack_name();

CREATE OR REPLACE FUNCTION public.propagate_sticker_pack_rename()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.custom_stickers SET pack = NEW.name WHERE pack_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sticker_packs_propagate_rename ON public.sticker_packs;
CREATE TRIGGER sticker_packs_propagate_rename
  AFTER UPDATE OF name ON public.sticker_packs
  FOR EACH ROW EXECUTE FUNCTION public.propagate_sticker_pack_rename();

REVOKE EXECUTE ON FUNCTION public.sync_custom_sticker_pack_name() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.propagate_sticker_pack_rename() FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.sticker_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sticker_categories TO authenticated;
GRANT ALL ON public.sticker_categories TO service_role;

GRANT SELECT ON public.sticker_packs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sticker_packs TO authenticated;
GRANT ALL ON public.sticker_packs TO service_role;

ALTER TABLE public.sticker_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticker_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view sticker categories" ON public.sticker_categories;
CREATE POLICY "Anyone can view sticker categories"
  ON public.sticker_categories FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins manage sticker categories" ON public.sticker_categories;
CREATE POLICY "Admins manage sticker categories"
  ON public.sticker_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Anyone can view active sticker packs" ON public.sticker_packs;
CREATE POLICY "Anyone can view active sticker packs"
  ON public.sticker_packs FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins insert sticker packs" ON public.sticker_packs;
CREATE POLICY "Admins insert sticker packs"
  ON public.sticker_packs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins update sticker packs" ON public.sticker_packs;
CREATE POLICY "Admins update sticker packs"
  ON public.sticker_packs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins delete sticker packs" ON public.sticker_packs;
CREATE POLICY "Admins delete sticker packs"
  ON public.sticker_packs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
