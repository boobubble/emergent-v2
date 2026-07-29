-- Centralized SEO Manager: global defaults + expanded per-page settings

CREATE TABLE IF NOT EXISTS public.seo_global (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name text,
  site_tagline text,
  default_title text,
  default_description text,
  default_keywords text,
  canonical_domain text,
  robots text DEFAULT 'index,follow',
  theme_color text DEFAULT '#3B82F6',
  author text,
  language text DEFAULT 'en',
  default_og_image text,
  twitter_card text DEFAULT 'summary_large_image',
  twitter_site text,
  twitter_creator text,
  facebook_app_id text,
  google_verification text,
  bing_verification text,
  yandex_verification text,
  baidu_verification text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

INSERT INTO public.seo_global (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS route_path text;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS label text;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS twitter_title text;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS twitter_description text;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS twitter_image text;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS robots text;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS json_ld jsonb;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS sitemap_priority numeric(2,1) DEFAULT 0.5;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS sitemap_changefreq text DEFAULT 'weekly';
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS sitemap_exclude boolean NOT NULL DEFAULT false;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS nofollow boolean NOT NULL DEFAULT false;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS is_dynamic boolean NOT NULL DEFAULT false;
ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS auto_discovered boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS seo_settings_route_path_uidx
  ON public.seo_settings (route_path)
  WHERE route_path IS NOT NULL;

-- Backfill known route paths from legacy page_key values
UPDATE public.seo_settings SET route_path = '/' WHERE page_key = 'home' AND route_path IS NULL;
UPDATE public.seo_settings SET route_path = '/feed' WHERE page_key = 'feed' AND route_path IS NULL;
UPDATE public.seo_settings SET route_path = '/games' WHERE page_key = 'games' AND route_path IS NULL;
UPDATE public.seo_settings SET route_path = '/find-friends' WHERE page_key = 'find-friends' AND route_path IS NULL;
UPDATE public.seo_settings SET route_path = '/leaderboard' WHERE page_key = 'leaderboard' AND route_path IS NULL;

ALTER TABLE public.seo_global ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo_global_public_read" ON public.seo_global FOR SELECT USING (true);
CREATE POLICY "seo_global_admin_write" ON public.seo_global FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
