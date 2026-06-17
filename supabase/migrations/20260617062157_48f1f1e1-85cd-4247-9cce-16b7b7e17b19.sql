ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
ALTER TABLE public.app_settings REPLICA IDENTITY FULL;