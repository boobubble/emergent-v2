-- Full removal of Path Escape (Path Flow) module.
-- Drops all tables, functions, triggers, and policies. CASCADE handles policies/triggers/indexes/FKs.

DROP TABLE IF EXISTS public.pathescape_hint_log CASCADE;
DROP TABLE IF EXISTS public.pathescape_scores CASCADE;
DROP TABLE IF EXISTS public.pathescape_progress CASCADE;
DROP TABLE IF EXISTS public.pathescape_lives CASCADE;
DROP TABLE IF EXISTS public.pathescape_daily CASCADE;
DROP TABLE IF EXISTS public.pathescape_weekly CASCADE;
DROP TABLE IF EXISTS public.pathescape_levels CASCADE;

DROP FUNCTION IF EXISTS public.pathescape_buy_hint CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_consume_life CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_current_daily CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_current_weekly CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_endless_level CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_get_lives CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_get_replay CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_leaderboard CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_refill_lives CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_regen_minutes CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_submit_score CASCADE;
DROP FUNCTION IF EXISTS public.pathescape_touch_updated_at CASCADE;

-- Verification helper: returns counts of any lingering pathescape-named objects.
CREATE OR REPLACE FUNCTION public.pathescape_removal_report()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'tables', COALESCE((SELECT jsonb_agg(tablename) FROM pg_tables
                        WHERE schemaname='public' AND tablename LIKE 'pathescape%'), '[]'::jsonb),
    'views', COALESCE((SELECT jsonb_agg(viewname) FROM pg_views
                        WHERE schemaname='public' AND viewname LIKE 'pathescape%'), '[]'::jsonb),
    'functions', COALESCE((SELECT jsonb_agg(routine_name) FROM information_schema.routines
                        WHERE routine_schema='public' AND routine_name LIKE 'pathescape%'
                          AND routine_name <> 'pathescape_removal_report'), '[]'::jsonb),
    'policies', COALESCE((SELECT jsonb_agg(policyname) FROM pg_policies
                        WHERE schemaname='public' AND tablename LIKE 'pathescape%'), '[]'::jsonb),
    'triggers', COALESCE((SELECT jsonb_agg(trigger_name) FROM information_schema.triggers
                        WHERE trigger_schema='public' AND event_object_table LIKE 'pathescape%'), '[]'::jsonb),
    'storage_buckets', COALESCE((SELECT jsonb_agg(id) FROM storage.buckets
                        WHERE id ILIKE '%pathescape%' OR id ILIKE '%path-escape%' OR id ILIKE '%path_escape%'), '[]'::jsonb),
    'storage_objects', COALESCE((SELECT jsonb_agg(DISTINCT bucket_id || '/' || split_part(name,'/',1)) FROM storage.objects
                        WHERE name ILIKE '%pathescape%' OR name ILIKE '%path-escape%'), '[]'::jsonb)
  );
$$;

GRANT EXECUTE ON FUNCTION public.pathescape_removal_report() TO authenticated, service_role;