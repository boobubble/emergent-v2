
-- 1) Tighten posts SELECT policy: hide anonymous posts from non-owners on the base table.
--    Anonymous posts remain visible through the public.posts_safe view (which masks owner_id).
DROP POLICY IF EXISTS "Read visible posts" ON public.posts;
CREATE POLICY "Read visible posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_admin(auth.uid())
    OR (
      is_anonymous = false
      AND (
        privacy = 'public'::post_privacy
        OR (privacy = 'friends'::post_privacy AND public.has_friendship(auth.uid(), owner_id))
      )
    )
  );

-- 2) Strip device_info from showcased feedback reports so non-author authenticated readers
--    cannot access client fingerprinting / IP metadata.
CREATE OR REPLACE FUNCTION public.scrub_feedback_device_info_on_showcase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_showcased IS TRUE THEN
    NEW.device_info := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feedback_reports_scrub_device_info ON public.feedback_reports;
CREATE TRIGGER feedback_reports_scrub_device_info
  BEFORE INSERT OR UPDATE ON public.feedback_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.scrub_feedback_device_info_on_showcase();

-- Backfill: clear device_info on any already-showcased reports.
UPDATE public.feedback_reports
   SET device_info = NULL
 WHERE is_showcased = true
   AND device_info IS NOT NULL;
