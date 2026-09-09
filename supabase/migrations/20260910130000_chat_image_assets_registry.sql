-- Authoritative registry for ephemeral chat images.
-- Cleanup and URL resolution MUST use this table, never client-controlled message JSON paths.

CREATE TABLE IF NOT EXISTS public.chat_image_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text UNIQUE NOT NULL,
  uploader_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id text NOT NULL,
  message_id uuid NULL UNIQUE REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  image_seen_at timestamptz NULL,
  image_expires_at timestamptz NULL,
  image_expired boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_chat_image_assets_expiry
  ON public.chat_image_assets (image_expires_at)
  WHERE image_expired = false AND image_expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_image_assets_orphan
  ON public.chat_image_assets (created_at)
  WHERE message_id IS NULL AND image_expired = false;

CREATE INDEX IF NOT EXISTS idx_chat_image_assets_uploader
  ON public.chat_image_assets (uploader_id, created_at DESC);

ALTER TABLE public.chat_image_assets ENABLE ROW LEVEL SECURITY;
-- No client policies: service role + SECURITY DEFINER triggers only.

-- Replace legacy attachment-json DM expiry trigger.
DROP TRIGGER IF EXISTS trg_dm_read_schedule_chat_image_expiry ON public.dm_reads;
DROP FUNCTION IF EXISTS public.schedule_dm_chat_image_expiry();

CREATE OR REPLACE FUNCTION public.schedule_dm_chat_image_asset_expiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  peer_id uuid;
BEGIN
  IF NEW.channel_id NOT LIKE 'dm:%' THEN
    RETURN NEW;
  END IF;

  -- Reader is one DM participant; peer is the other. Only schedule images the peer sent to the reader.
  IF split_part(NEW.channel_id, ':', 2)::uuid = NEW.user_id THEN
    peer_id := split_part(NEW.channel_id, ':', 3)::uuid;
  ELSE
    peer_id := split_part(NEW.channel_id, ':', 2)::uuid;
  END IF;

  UPDATE public.chat_image_assets a
  SET
    image_seen_at = NEW.last_read_at,
    image_expires_at = NEW.last_read_at + interval '24 hours'
  FROM public.messages m
  WHERE a.message_id = m.id
    AND m.channel_id = NEW.channel_id
    AND m.author_id = peer_id
    AND m.created_at <= NEW.last_read_at
    AND a.image_seen_at IS NULL
    AND a.image_expired = false;

  UPDATE public.messages m
  SET attachment = COALESCE(m.attachment, '{}'::jsonb)
    || jsonb_build_object(
      'imageSeenAt', NEW.last_read_at,
      'imageExpiresAt', (NEW.last_read_at + interval '24 hours')
    )
  FROM public.chat_image_assets a
  WHERE a.message_id = m.id
    AND m.channel_id = NEW.channel_id
    AND m.author_id = peer_id
    AND m.created_at <= NEW.last_read_at
    AND a.image_seen_at = NEW.last_read_at
    AND a.image_expires_at = NEW.last_read_at + interval '24 hours';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dm_read_schedule_chat_image_asset_expiry ON public.dm_reads;
CREATE TRIGGER trg_dm_read_schedule_chat_image_asset_expiry
  AFTER INSERT OR UPDATE OF last_read_at ON public.dm_reads
  FOR EACH ROW
  EXECUTE FUNCTION public.schedule_dm_chat_image_asset_expiry();

CREATE OR REPLACE FUNCTION public.link_chat_image_asset_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  asset_uuid uuid;
  asset_rec public.chat_image_assets%ROWTYPE;
  is_dm boolean;
  expires_at timestamptz;
BEGIN
  IF NEW.attachment IS NULL THEN
    RETURN NEW;
  END IF;

  -- Reject client-forged ephemeral metadata without registry asset id.
  IF NULLIF(NEW.attachment->>'storagePath', '') IS NOT NULL
     AND NULLIF(NEW.attachment->>'assetId', '') IS NULL
     AND (
       COALESCE(NEW.attachment->>'kind', '') = 'image'
       OR COALESCE(NEW.attachment->>'mime', '') LIKE 'image/%'
     ) THEN
    RAISE EXCEPTION 'invalid_chat_image_attachment';
  END IF;

  IF NULLIF(NEW.attachment->>'imageExpiresAt', '') IS NOT NULL
     OR NULLIF(NEW.attachment->>'imageSeenAt', '') IS NOT NULL
     OR COALESCE(NEW.attachment->>'imageExpired', 'false') = 'true' THEN
    IF NULLIF(NEW.attachment->>'assetId', '') IS NOT NULL THEN
      RAISE EXCEPTION 'invalid_chat_image_attachment';
    END IF;
  END IF;

  asset_uuid := NULLIF(NEW.attachment->>'assetId', '')::uuid;
  IF asset_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO asset_rec
  FROM public.chat_image_assets
  WHERE id = asset_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_chat_image_asset';
  END IF;

  IF asset_rec.uploader_id <> NEW.author_id
     OR asset_rec.channel_id <> NEW.channel_id
     OR asset_rec.message_id IS NOT NULL
     OR asset_rec.image_expired THEN
    RAISE EXCEPTION 'invalid_chat_image_asset';
  END IF;

  is_dm := NEW.channel_id ~ '^dm:[0-9a-f-]{36}:[0-9a-f-]{36}$';
  expires_at := CASE
    WHEN is_dm THEN NULL
    ELSE NEW.created_at + interval '24 hours'
  END;

  UPDATE public.chat_image_assets
  SET
    message_id = NEW.id,
    image_expires_at = expires_at
  WHERE id = asset_uuid;

  NEW.attachment := jsonb_build_object(
    'kind', COALESCE(NEW.attachment->>'kind', 'image'),
    'name', COALESCE(NEW.attachment->>'name', 'image'),
    'mime', COALESCE(NEW.attachment->>'mime', 'image/*'),
    'size', COALESCE(NULLIF(NEW.attachment->>'size', '')::int, 0),
    'assetId', asset_uuid::text,
    'dataUrl', ''
  );

  IF expires_at IS NOT NULL THEN
    NEW.attachment := NEW.attachment || jsonb_build_object(
      'imageExpiresAt', to_jsonb(expires_at::text)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_chat_image_asset ON public.messages;
CREATE TRIGGER trg_link_chat_image_asset
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.link_chat_image_asset_on_message();
