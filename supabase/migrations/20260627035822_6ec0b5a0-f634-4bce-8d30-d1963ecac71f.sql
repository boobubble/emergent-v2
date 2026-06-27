-- Fix: trio_rooms password exposed
REVOKE SELECT ON public.trio_rooms FROM authenticated;
REVOKE SELECT ON public.trio_rooms FROM anon;
GRANT SELECT (id, name, owner_id, hidden, closed_at, closed_reason, created_at) ON public.trio_rooms TO authenticated;

-- Fix: confession_replies author_id exposed for anonymous replies
-- Trigger enforce_reply_anonymity_trg already nulls author_id on insert/update.
-- Backfill any legacy rows that still have an author_id set on anonymous replies.
UPDATE public.confession_replies SET author_id = NULL WHERE is_anonymous = true AND author_id IS NOT NULL;