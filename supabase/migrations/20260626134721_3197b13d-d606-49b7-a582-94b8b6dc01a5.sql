
CREATE OR REPLACE FUNCTION public.validate_voice_note_attachment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mime text;
  sz bigint;
  dur numeric;
  cfg jsonb;
  max_lobby int;
  max_dm int;
  max_trio int;
  max_dur int;
  recent_count int;
  burst_count int;
  hard_max_bytes constant int := 4 * 1024 * 1024; -- 4 MB
  allowed text[] := ARRAY['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/wav','audio/x-m4a'];
BEGIN
  IF NEW.attachment IS NULL THEN RETURN NEW; END IF;
  mime := lower(COALESCE(NEW.attachment->>'mime',''));
  IF mime IS NULL OR position('audio/' in mime) <> 1 THEN
    RETURN NEW;
  END IF;

  -- File type
  IF NOT (split_part(mime,';',1) = ANY(allowed)) THEN
    RAISE EXCEPTION 'Voice note format % is not allowed', mime
      USING ERRCODE = 'check_violation';
  END IF;

  -- Size
  sz := COALESCE((NEW.attachment->>'size')::bigint, 0);
  IF sz <= 0 OR sz > hard_max_bytes THEN
    RAISE EXCEPTION 'Voice note size out of bounds (% bytes, max %)', sz, hard_max_bytes
      USING ERRCODE = 'check_violation';
  END IF;

  -- Per-channel max duration from admin config
  SELECT value INTO cfg FROM public.app_settings WHERE key = 'voice_notes';
  max_lobby := COALESCE((cfg->>'max_lobby')::int, 60);
  max_dm    := COALESCE((cfg->>'max_dm')::int, 120);
  max_trio  := COALESCE((cfg->>'max_trio')::int, 90);

  IF NEW.channel_id LIKE 'dm:%' THEN max_dur := max_dm;
  ELSIF NEW.channel_id LIKE 'trio:%' THEN max_dur := max_trio;
  ELSE max_dur := max_lobby;
  END IF;

  dur := COALESCE((NEW.attachment->>'duration')::numeric, 0);
  -- Allow up to +2s slack for client/server rounding
  IF dur > (max_dur + 2) THEN
    RAISE EXCEPTION 'Voice note duration %s exceeds limit %ss for this channel', dur, max_dur
      USING ERRCODE = 'check_violation';
  END IF;

  -- Rate limit: 1 voice note / 2s and 20 / minute per user
  SELECT count(*) INTO burst_count
    FROM public.messages
   WHERE author_id = NEW.author_id
     AND attachment->>'mime' LIKE 'audio/%'
     AND created_at > now() - interval '2 seconds';
  IF burst_count > 0 THEN
    RAISE EXCEPTION 'Please wait a moment between voice notes'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT count(*) INTO recent_count
    FROM public.messages
   WHERE author_id = NEW.author_id
     AND attachment->>'mime' LIKE 'audio/%'
     AND created_at > now() - interval '1 minute';
  IF recent_count >= 20 THEN
    RAISE EXCEPTION 'Voice note rate limit reached (20/minute)'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_voice_note ON public.messages;
CREATE TRIGGER trg_validate_voice_note
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_voice_note_attachment();
