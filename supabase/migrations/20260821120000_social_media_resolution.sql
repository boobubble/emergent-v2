-- Social media logging + avatar settle delay for signup queue.
-- Does NOT enable social_signup_enabled.

ALTER TABLE public.social_post_logs
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Give avatar upload/flush time before first queue drain attempt.
CREATE OR REPLACE FUNCTION public.social_enqueue_signup(_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  INSERT INTO public.social_post_queue (
    event_type,
    user_id,
    status,
    next_attempt_at
  )
  VALUES (
    'new_signup',
    _user_id,
    'pending',
    now() + interval '2 minutes'
  )
  ON CONFLICT (user_id, event_type) DO NOTHING
  RETURNING id INTO _id;
  RETURN _id;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'social_enqueue_signup failed for %: %', _user_id, SQLERRM;
  RETURN NULL;
END;
$$;
