-- Keyword research paste workflow: extend seo_keyword_targets + import batch history.
-- Reuses seo_keyword_targets as the unified keyword dataset. Service-role only.

ALTER TABLE public.seo_keyword_targets
  ADD COLUMN IF NOT EXISTS cluster text,
  ADD COLUMN IF NOT EXISTS sources text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS paid_difficulty numeric,
  ADD COLUMN IF NOT EXISTS last_import_batch_id uuid;

CREATE INDEX IF NOT EXISTS seo_keyword_targets_cluster_idx
  ON public.seo_keyword_targets (cluster);

CREATE TABLE IF NOT EXISTS public.seo_keyword_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  sources text[] NOT NULL DEFAULT '{}',
  keywords_found integer NOT NULL DEFAULT 0,
  clusters_found integer NOT NULL DEFAULT 0,
  duplicates_removed integer NOT NULL DEFAULT 0,
  new_count integer NOT NULL DEFAULT 0,
  merged_count integer NOT NULL DEFAULT 0,
  opportunities_created integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seo_keyword_import_batches_created_idx
  ON public.seo_keyword_import_batches (created_at DESC);

COMMENT ON TABLE public.seo_keyword_import_batches IS
  'Paste/import history for RyRob, Neil Patel, Ubersuggest, and manual keyword research.';

ALTER TABLE public.seo_keyword_import_batches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seo_keyword_import_batches FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.seo_keyword_import_batches TO service_role;
