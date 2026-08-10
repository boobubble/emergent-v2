-- Ownership marker for page_internal_links rows created by Related Chat Rooms Settings sync.
-- NULL / other values = unrelated graph rows (content, Internal Linking UI, rules, Phase scripts).
-- Only rows with source = 'related_chat_rooms' are inserted/removed by Related Chat Rooms reconcile.

ALTER TABLE public.page_internal_links
  ADD COLUMN IF NOT EXISTS source TEXT;

COMMENT ON COLUMN public.page_internal_links.source IS
  'Link ownership/source. related_chat_rooms = managed by Related Chat Rooms Settings sync. NULL/other = leave untouched by that sync.';

CREATE INDEX IF NOT EXISTS idx_page_internal_links_page_source
  ON public.page_internal_links (page_id, source)
  WHERE source IS NOT NULL;
