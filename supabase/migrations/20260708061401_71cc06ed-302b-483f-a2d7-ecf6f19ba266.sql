DROP FUNCTION IF EXISTS public.pathflow_submit_score CASCADE;
DROP FUNCTION IF EXISTS public.pathflow_buy_hint CASCADE;
DROP FUNCTION IF EXISTS public.pathflow_current_daily CASCADE;
DROP FUNCTION IF EXISTS public.pathflow_touch_updated_at CASCADE;
DROP TABLE IF EXISTS public.pathflow_scores CASCADE;
DROP TABLE IF EXISTS public.pathflow_daily CASCADE;
DROP TABLE IF EXISTS public.pathflow_progress CASCADE;
DROP TABLE IF EXISTS public.pathflow_levels CASCADE;
DELETE FROM public.gam_event_log WHERE event_type LIKE 'pathflow.%' OR event_type LIKE 'game.pathflow.%';