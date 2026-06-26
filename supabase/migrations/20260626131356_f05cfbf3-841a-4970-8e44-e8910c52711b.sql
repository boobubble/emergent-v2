
-- Extend dm_reads to also cover trio room channels so we can render
-- delivery/read receipts in 3some rooms.

DROP POLICY IF EXISTS "Read dm_reads in own channels" ON public.dm_reads;
DROP POLICY IF EXISTS "Upsert own dm_reads" ON public.dm_reads;
DROP POLICY IF EXISTS "Update own dm_reads" ON public.dm_reads;

CREATE POLICY "Read reads in own channels"
ON public.dm_reads FOR SELECT
USING (
  (channel_id ~ ('^dm:' || (auth.uid())::text || ':[0-9a-f-]{36}$'))
  OR (channel_id ~ ('^dm:[0-9a-f-]{36}:' || (auth.uid())::text || '$'))
  OR (channel_id ~ '^trio:[0-9a-f-]{36}$'
      AND public.is_trio_member(public.trio_channel_room(channel_id), auth.uid()))
);

CREATE POLICY "Upsert own reads"
ON public.dm_reads FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    (channel_id ~ ('^dm:' || (auth.uid())::text || ':[0-9a-f-]{36}$'))
    OR (channel_id ~ ('^dm:[0-9a-f-]{36}:' || (auth.uid())::text || '$'))
    OR (channel_id ~ '^trio:[0-9a-f-]{36}$'
        AND public.is_trio_member(public.trio_channel_room(channel_id), auth.uid()))
  )
);

CREATE POLICY "Update own reads"
ON public.dm_reads FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure realtime is on for receipts
ALTER TABLE public.dm_reads REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_reads';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
