-- =============================================================================
-- Phase 4A — Pages CMS search scalability (pg_trgm + GIN)
-- =============================================================================
-- SAFETY REVIEW (read before apply)
-- -----------------------------------------------------------------------------
-- Goal:
--   Speed up All Pages admin search which uses ILIKE OR across
--   custom_pages.title, custom_pages.slug, custom_pages.primary_keyword.
--
-- Changes:
--   1) CREATE EXTENSION IF NOT EXISTS pg_trgm;
--   2) CREATE INDEX CONCURRENTLY is NOT used here (Supabase SQL migrations run
--      inside a transaction; CONCURRENTLY cannot run in a transaction).
--      We use regular CREATE INDEX IF NOT EXISTS instead.
--   3) No UPDATE/DELETE on custom_pages. No data rewrite. No content_status
--      backfill. Lahore and all page rows remain byte-identical.
--
-- Risks:
--   - Extension create requires privileges (usually available on Supabase).
--   - Index build takes a brief lock / CPU on custom_pages; table is still
--     small today (<1k expected) so lock time should be short.
--   - If pg_trgm already exists, IF NOT EXISTS is a no-op.
--
-- Rollback:
--   DROP INDEX IF EXISTS public.idx_custom_pages_title_trgm;
--   DROP INDEX IF EXISTS public.idx_custom_pages_slug_trgm;
--   DROP INDEX IF EXISTS public.idx_custom_pages_primary_keyword_trgm;
--   (Extension may remain — shared; do not drop pg_trgm if other objects use it.)
--
-- Apply gate:
--   Do not apply until Phase 4A search-index safety review is approved.
--   This file is committed for review; applying is a separate explicit step.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_custom_pages_title_trgm
  ON public.custom_pages
  USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_custom_pages_slug_trgm
  ON public.custom_pages
  USING gin (slug gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_custom_pages_primary_keyword_trgm
  ON public.custom_pages
  USING gin (primary_keyword gin_trgm_ops);
