-- Ephemeral chat image storage (private bucket) + DM read-triggered retention.

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', false)
ON CONFLICT (id) DO NOTHING;

-- Service role handles upload/delete; clients receive short-lived signed URLs from server fns.

CREATE INDEX IF NOT EXISTS idx_messages_chat_image_expiry
  ON public.messages ((attachment->>'imageExpiresAt'))
  WHERE attachment->>'storagePath' IS NOT NULL;

CREATE OR REPLACE FUNCTION public.schedule_dm_chat_image_expiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.messages m
  SET attachment = COALESCE(m.attachment, '{}'::jsonb)
    || jsonb_build_object(
      'imageSeenAt', NEW.last_read_at,
      'imageExpiresAt', (NEW.last_read_at + interval '24 hours')
    )
  WHERE m.channel_id = NEW.channel_id
    AND m.attachment IS NOT NULL
    AND m.attachment->>'storagePath' IS NOT NULL
    AND (
      m.attachment->>'kind' = 'image'
      OR COALESCE(m.attachment->>'mime', '') LIKE 'image/%'
    )
    AND COALESCE(m.attachment->>'imageExpired', 'false') <> 'true'
    AND (
      m.attachment->>'imageSeenAt' IS NULL
      OR m.attachment->>'imageSeenAt' = ''
    )
    AND m.created_at <= NEW.last_read_at
    AND m.author_id <> NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dm_read_schedule_chat_image_expiry ON public.dm_reads;
CREATE TRIGGER trg_dm_read_schedule_chat_image_expiry
  AFTER INSERT OR UPDATE OF last_read_at ON public.dm_reads
  FOR EACH ROW
  EXECUTE FUNCTION public.schedule_dm_chat_image_expiry();
