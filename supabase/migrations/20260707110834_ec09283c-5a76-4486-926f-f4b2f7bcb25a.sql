
-- Column-level protection: only service_role may read the plaintext password.
-- RLS row-visibility still applies for the other columns.
REVOKE SELECT (password) ON public.chatrooms  FROM anon, authenticated;
REVOKE SELECT (password) ON public.trio_rooms FROM anon, authenticated;

-- Restrict realtime broadcast payloads for trio_rooms so the password never
-- travels over the WAL replication stream to subscribed members.
-- 1) Shrink replica identity to the primary key only (no full-row pre-images).
ALTER TABLE public.trio_rooms REPLICA IDENTITY DEFAULT;

-- 2) Re-publish with an explicit column list that excludes `password`.
--    Wrapped in DO block so it works whether or not the table was previously
--    part of the publication.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'trio_rooms'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.trio_rooms';
    END IF;
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.trio_rooms (id, name, owner_id, hidden, closed_at, closed_reason, created_at)';
  END IF;
END $$;
