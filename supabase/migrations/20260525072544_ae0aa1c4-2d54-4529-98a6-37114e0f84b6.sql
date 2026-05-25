CREATE TABLE public.dm_reads (
  user_id uuid NOT NULL,
  channel_id text NOT NULL,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, channel_id)
);

ALTER TABLE public.dm_reads ENABLE ROW LEVEL SECURITY;

-- Sender + receiver can both read receipts for their shared DM channel
CREATE POLICY "Read dm_reads in own channels"
ON public.dm_reads FOR SELECT TO authenticated
USING (
  channel_id ~ ('^dm:' || auth.uid()::text || ':[0-9a-f-]{36}$')
  OR channel_id ~ ('^dm:[0-9a-f-]{36}:' || auth.uid()::text || '$')
);

CREATE POLICY "Upsert own dm_reads"
ON public.dm_reads FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND (
    channel_id ~ ('^dm:' || auth.uid()::text || ':[0-9a-f-]{36}$')
    OR channel_id ~ ('^dm:[0-9a-f-]{36}:' || auth.uid()::text || '$')
  )
);

CREATE POLICY "Update own dm_reads"
ON public.dm_reads FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_reads;
ALTER TABLE public.dm_reads REPLICA IDENTITY FULL;