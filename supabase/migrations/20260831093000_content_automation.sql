-- Content automation: topic idea queues + single-row daily publish settings.
-- Used by /api/run-blog-publish, /api/run-static-publish, and /admin/content-automation.
-- Service-role only (admin API + cron). No anon/authenticated policies.

-- ---------------------------------------------------------------------------
-- 1) Blog topic ideas (migrated from automation-scripts/blog-topics.json)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_topic_ideas (
  id serial PRIMARY KEY,
  title text UNIQUE NOT NULL,
  category_slug text NOT NULL,
  meta_description text,
  created_at timestamp DEFAULT now()
);

COMMENT ON TABLE public.blog_topic_ideas IS
  'Queued blog post ideas for auto-publish. Status is derived by matching title against blog_posts.';

CREATE INDEX IF NOT EXISTS blog_topic_ideas_created_at_idx
  ON public.blog_topic_ideas (created_at);

ALTER TABLE public.blog_topic_ideas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.blog_topic_ideas FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.blog_topic_ideas TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.blog_topic_ideas_id_seq TO service_role;

-- ---------------------------------------------------------------------------
-- 2) Static page ideas (migrated from automation-scripts/static-pages-master.json)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.static_page_ideas (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  section text NOT NULL,
  base_name text NOT NULL,
  lookup_city text,
  lookup_country_hint text,
  created_at timestamp DEFAULT now()
);

COMMENT ON TABLE public.static_page_ideas IS
  'Queued custom-page ideas for auto-publish. Status is derived by matching slug against custom_pages.';

CREATE INDEX IF NOT EXISTS static_page_ideas_created_at_idx
  ON public.static_page_ideas (created_at);

ALTER TABLE public.static_page_ideas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.static_page_ideas FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.static_page_ideas TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.static_page_ideas_id_seq TO service_role;

-- ---------------------------------------------------------------------------
-- 3) Single-row automation settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.automation_settings (
  id integer PRIMARY KEY DEFAULT 1,
  blog_posts_per_day integer NOT NULL DEFAULT 2,
  static_pages_per_day integer NOT NULL DEFAULT 5,
  automation_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamp DEFAULT now(),
  CONSTRAINT automation_settings_singleton CHECK (id = 1)
);

COMMENT ON TABLE public.automation_settings IS
  'Singleton (id=1) daily publish quotas and pause switch for content automation.';

ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.automation_settings FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.automation_settings TO service_role;

INSERT INTO public.automation_settings (id, blog_posts_per_day, static_pages_per_day, automation_enabled)
VALUES (1, 2, 5, true)
ON CONFLICT (id) DO NOTHING;
