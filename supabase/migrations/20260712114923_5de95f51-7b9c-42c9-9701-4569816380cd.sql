DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='competition_competitors'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_competitors';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='competition_competitor_votes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_competitor_votes';
  END IF;
END $$;

ALTER TABLE public.competition_competitors REPLICA IDENTITY FULL;
ALTER TABLE public.competition_competitor_votes REPLICA IDENTITY FULL;