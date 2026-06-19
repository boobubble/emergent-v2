-- Remove sensitive user-scoped tables from the supabase_realtime publication
-- to prevent cross-user row broadcasts. Features can fall back to refetch/polling.
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'notifications',
    'dm_reads',
    'feedback_reports',
    'feedback_comments',
    'feedback_votes',
    'trio_rooms',
    'trio_room_members'
  ]) LOOP
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;