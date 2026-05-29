
-- Custom Pages CMS
CREATE TABLE public.custom_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  nofollow BOOLEAN NOT NULL DEFAULT false,
  schema_jsonld JSONB,
  -- analytics
  views BIGINT NOT NULL DEFAULT 0,
  -- meta
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_custom_pages_status ON public.custom_pages(status);
CREATE INDEX idx_custom_pages_category ON public.custom_pages(category);
CREATE INDEX idx_custom_pages_featured ON public.custom_pages(featured) WHERE featured = true;

GRANT SELECT ON public.custom_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_pages TO authenticated;
GRANT ALL ON public.custom_pages TO service_role;

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published pages"
  ON public.custom_pages FOR SELECT
  USING (status = 'published' OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage pages"
  ON public.custom_pages FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_custom_pages_updated
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Redirects
CREATE TABLE public.page_redirects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_slug TEXT NOT NULL UNIQUE,
  to_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.page_redirects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_redirects TO authenticated;
GRANT ALL ON public.page_redirects TO service_role;

ALTER TABLE public.page_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads redirects"
  ON public.page_redirects FOR SELECT USING (true);

CREATE POLICY "Admins manage redirects"
  ON public.page_redirects FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- View counter RPC (bypasses gamification trigger; pages table not gated)
CREATE OR REPLACE FUNCTION public.bump_page_view(_slug TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.custom_pages SET views = views + 1 WHERE slug = _slug AND status = 'published';
$$;

GRANT EXECUTE ON FUNCTION public.bump_page_view(TEXT) TO anon, authenticated;
