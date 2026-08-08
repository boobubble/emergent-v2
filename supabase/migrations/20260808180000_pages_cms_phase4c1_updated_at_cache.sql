-- Phase 4C.1: Preserve custom_pages.updated_at for derived/cache-only refreshes.
--
-- Problem: trg_custom_pages_updated used update_updated_at_column(), which always
-- set NEW.updated_at = now(). Refreshing internal_links_json / internal_link_count
-- (or bump_page_view) therefore falsified editorial/sitemap lastmod.
--
-- Solution: Replace the custom_pages trigger function so updated_at only advances
-- when non-derived columns change. Derived/cache columns:
--   - internal_links_json
--   - internal_link_count
--   - views
--
-- Genuine content / SEO / taxonomy / admin edits still bump updated_at.
-- No content_updated_at schema split required.

CREATE OR REPLACE FUNCTION public.custom_pages_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  old_editorial jsonb;
  new_editorial jsonb;
BEGIN
  -- Compare row payloads excluding updated_at and derived/cache counters.
  old_editorial := to_jsonb(OLD)
    - 'updated_at'
    - 'internal_links_json'
    - 'internal_link_count'
    - 'views';
  new_editorial := to_jsonb(NEW)
    - 'updated_at'
    - 'internal_links_json'
    - 'internal_link_count'
    - 'views';

  IF old_editorial = new_editorial THEN
    NEW.updated_at := OLD.updated_at;
  ELSE
    NEW.updated_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_custom_pages_updated ON public.custom_pages;

CREATE TRIGGER trg_custom_pages_updated
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.custom_pages_set_updated_at();

COMMENT ON FUNCTION public.custom_pages_set_updated_at() IS
  'Phase 4C.1: bump custom_pages.updated_at only for editorial/content/SEO/taxonomy changes; preserve it for internal-link cache and views refreshes.';
