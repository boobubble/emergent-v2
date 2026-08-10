-- Related Chat Rooms presentation config for Custom Pages (Settings tab).
-- Does NOT replace page_internal_links (canonical relationship source).
-- Stores only: auto_fill, manual items (target, label, enabled, order).
-- NULL = never manually configured → public page keeps automatic resolution.

ALTER TABLE public.custom_pages
  ADD COLUMN IF NOT EXISTS related_chat_rooms jsonb;

COMMENT ON COLUMN public.custom_pages.related_chat_rooms IS
  'Related Chat Rooms section config: { auto_fill: boolean, items: [{ id, target_page_id, label, enabled, sort_order }] }. Null = automatic (page_internal_links + same-country fill).';

-- Editorial edits to related_chat_rooms should bump updated_at (already true:
-- custom_pages_set_updated_at excludes only derived cache columns).
