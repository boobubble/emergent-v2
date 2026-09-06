-- Unified SEO Content Engine: extend automation_settings + supporting tables.
-- Service-role only (admin API, cron, server functions). No anon/authenticated policies.
-- Does not replace blog_topic_ideas / static_page_ideas / page_history.

-- ---------------------------------------------------------------------------
-- 1) Extend existing automation_settings singleton
-- ---------------------------------------------------------------------------
ALTER TABLE public.automation_settings
  ADD COLUMN IF NOT EXISTS daily_total_limit integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS auto_seo_optimization boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_internal_linking boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS two_way_linking boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cannibalization_check boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS broken_link_check boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS new_page_discovery boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS content_refresh_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS refresh_interval_days integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS refresh_type text NOT NULL DEFAULT 'intelligent',
  ADD COLUMN IF NOT EXISTS auto_update_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS only_update_when_meaningful boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS minimum_content_change_percent integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS keep_previous_versions boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_versions integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS pexels_images_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS images_per_content integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS prefer_landscape_images boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS image_optimization boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS image_duplicate_prevention boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS dry_run_optimization boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS migration_paused boolean NOT NULL DEFAULT false;

ALTER TABLE public.automation_settings
  ALTER COLUMN static_pages_per_day SET DEFAULT 3;

UPDATE public.automation_settings
SET
  static_pages_per_day = 3,
  daily_total_limit = 5,
  updated_at = now()
WHERE id = 1
  AND static_pages_per_day = 5;

COMMENT ON TABLE public.automation_settings IS
  'Singleton (id=1) daily publish quotas, SEO/refresh/image switches for the unified content engine.';

-- ---------------------------------------------------------------------------
-- Shared grant helper pattern
-- ---------------------------------------------------------------------------
-- 2) Manual Ubersuggest keyword targets (no external API)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_keyword_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  keyword_type text NOT NULL DEFAULT 'primary'
    CHECK (keyword_type IN ('primary', 'secondary', 'long-tail', 'question')),
  search_volume integer,
  seo_difficulty numeric,
  competition numeric,
  cpc numeric,
  search_intent text
    CHECK (search_intent IS NULL OR search_intent IN (
      'informational', 'navigational', 'commercial', 'transactional', 'local', 'mixed'
    )),
  parent_keyword text,
  related_keywords text[] NOT NULL DEFAULT '{}',
  questions text[] NOT NULL DEFAULT '{}',
  notes text,
  target_content_type text
    CHECK (target_content_type IS NULL OR target_content_type IN ('blog', 'page', 'any')),
  target_url text,
  target_content_id text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'assigned', 'published', 'paused', 'conflict')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS seo_keyword_targets_keyword_type_uidx
  ON public.seo_keyword_targets (lower(keyword), keyword_type);
CREATE INDEX IF NOT EXISTS seo_keyword_targets_status_idx
  ON public.seo_keyword_targets (status, created_at);

COMMENT ON TABLE public.seo_keyword_targets IS
  'Manually imported Ubersuggest/keyword research. No third-party keyword API.';

ALTER TABLE public.seo_keyword_targets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seo_keyword_targets FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.seo_keyword_targets TO service_role;

-- ---------------------------------------------------------------------------
-- 3) Unified inventory cache (source of truth remains blog_posts / custom_pages)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_content_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('blog', 'page')),
  source_id text NOT NULL,
  slug text NOT NULL,
  canonical_url text NOT NULL,
  title text,
  h1 text,
  primary_keyword text,
  secondary_keywords text[] NOT NULL DEFAULT '{}',
  long_tail_keywords text[] NOT NULL DEFAULT '{}',
  search_intent text,
  category text,
  country text,
  state text,
  city text,
  language text,
  status text NOT NULL DEFAULT 'published',
  word_count integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  last_optimized_at timestamptz,
  last_refreshed_at timestamptz,
  next_refresh_at timestamptz,
  content_hash text,
  seo_score integer,
  image_status text NOT NULL DEFAULT 'pending'
    CHECK (image_status IN ('pending', 'ready', 'failed', 'skipped', 'missing')),
  migration_status text NOT NULL DEFAULT 'pending'
    CHECK (migration_status IN ('pending', 'audited', 'optimized', 'skipped', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_type, source_id)
);

CREATE INDEX IF NOT EXISTS seo_content_inventory_slug_idx
  ON public.seo_content_inventory (content_type, slug);
CREATE INDEX IF NOT EXISTS seo_content_inventory_refresh_idx
  ON public.seo_content_inventory (next_refresh_at, status);
CREATE INDEX IF NOT EXISTS seo_content_inventory_keyword_idx
  ON public.seo_content_inventory (lower(primary_keyword));

COMMENT ON TABLE public.seo_content_inventory IS
  'SEO cache synced from blog_posts and custom_pages. Do not treat as a second CMS.';

ALTER TABLE public.seo_content_inventory ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seo_content_inventory FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.seo_content_inventory TO service_role;

-- ---------------------------------------------------------------------------
-- 4) Version snapshots for automatic SEO/refresh edits
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('blog', 'page')),
  source_id text NOT NULL,
  version_number integer NOT NULL,
  title text,
  slug text,
  canonical_url text,
  content text,
  metadata jsonb NOT NULL DEFAULT '{}',
  keyword_info jsonb NOT NULL DEFAULT '{}',
  seo_info jsonb NOT NULL DEFAULT '{}',
  change_reason text,
  change_summary text,
  job_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_type, source_id, version_number)
);

CREATE INDEX IF NOT EXISTS seo_content_versions_source_idx
  ON public.seo_content_versions (content_type, source_id, version_number DESC);

COMMENT ON TABLE public.seo_content_versions IS
  'Automatic SEO/refresh snapshots. Distinct from page_history (editor saves).';

ALTER TABLE public.seo_content_versions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seo_content_versions FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.seo_content_versions TO service_role;

-- ---------------------------------------------------------------------------
-- 5) Idempotent jobs (publish slots, refresh, migration, image retry)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_content_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_key text NOT NULL UNIQUE,
  job_type text NOT NULL
    CHECK (job_type IN (
      'blog_publish', 'page_publish', 'refresh', 'migration', 'image_retry', 'optimize'
    )),
  content_type text CHECK (content_type IN ('blog', 'page')),
  source_id text,
  slug text,
  title text,
  target_date date,
  slot integer,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  dry_run boolean NOT NULL DEFAULT false,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 2,
  last_error text,
  next_retry_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}',
  result jsonb NOT NULL DEFAULT '{}',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seo_content_jobs_date_type_idx
  ON public.seo_content_jobs (job_type, target_date, status);
CREATE INDEX IF NOT EXISTS seo_content_jobs_status_idx
  ON public.seo_content_jobs (status, next_retry_at);

COMMENT ON TABLE public.seo_content_jobs IS
  'Deterministic job keys prevent duplicate cron/manual publish and refresh work.';

ALTER TABLE public.seo_content_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seo_content_jobs FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.seo_content_jobs TO service_role;

-- ---------------------------------------------------------------------------
-- 6) Refresh reports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_refresh_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.seo_content_jobs(id) ON DELETE SET NULL,
  content_type text NOT NULL CHECK (content_type IN ('blog', 'page')),
  source_id text NOT NULL,
  slug text,
  status text NOT NULL
    CHECK (status IN ('updated', 'no_update', 'failed', 'dry_run')),
  report_text text NOT NULL,
  word_count_before integer,
  word_count_after integer,
  sections_added integer NOT NULL DEFAULT 0,
  sections_improved integer NOT NULL DEFAULT 0,
  links_added integer NOT NULL DEFAULT 0,
  links_repaired integer NOT NULL DEFAULT 0,
  faq_changes integer NOT NULL DEFAULT 0,
  metadata_updated boolean NOT NULL DEFAULT false,
  image_action text NOT NULL DEFAULT 'retained',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seo_refresh_reports_source_idx
  ON public.seo_refresh_reports (content_type, source_id, created_at DESC);

ALTER TABLE public.seo_refresh_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seo_refresh_reports FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.seo_refresh_reports TO service_role;

-- ---------------------------------------------------------------------------
-- 7) Pexels image metadata (server-side selection only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_pexels_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text CHECK (content_type IN ('blog', 'page')),
  source_id text,
  pexels_photo_id bigint NOT NULL,
  pexels_page_url text,
  photographer_name text,
  photographer_url text,
  source_url text,
  selected_image_url text,
  storage_url text,
  width integer,
  height integer,
  search_query text,
  alt_text text,
  caption text,
  status text NOT NULL DEFAULT 'selected'
    CHECK (status IN ('selected', 'attached', 'failed', 'pending', 'replaced')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seo_pexels_images_photo_idx
  ON public.seo_pexels_images (pexels_photo_id);
CREATE INDEX IF NOT EXISTS seo_pexels_images_content_idx
  ON public.seo_pexels_images (content_type, source_id);

COMMENT ON TABLE public.seo_pexels_images IS
  'Pexels selections for automated content. API key is never stored.';

ALTER TABLE public.seo_pexels_images ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seo_pexels_images FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.seo_pexels_images TO service_role;

-- ---------------------------------------------------------------------------
-- 8) Cannibalization warnings (never auto-delete)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_cannibalization_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_a_type text NOT NULL,
  content_a_id text NOT NULL,
  content_a_url text,
  content_b_type text NOT NULL,
  content_b_id text NOT NULL,
  content_b_url text,
  overlapping_keywords text[] NOT NULL DEFAULT '{}',
  intent_a text,
  intent_b text,
  similarity numeric,
  recommended_action text NOT NULL DEFAULT 'review'
    CHECK (recommended_action IN (
      'keep_separate', 'improve_differentiation', 'change_secondary_targeting',
      'consolidate_manually', 'review'
    )),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seo_cannibalization_open_idx
  ON public.seo_cannibalization_warnings (status, created_at DESC);

ALTER TABLE public.seo_cannibalization_warnings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seo_cannibalization_warnings FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.seo_cannibalization_warnings TO service_role;
