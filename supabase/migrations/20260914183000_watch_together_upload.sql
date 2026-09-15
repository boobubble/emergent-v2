-- Watch Together: uploaded video source + invite metadata on sessions

ALTER TABLE public.watch_sessions
  DROP CONSTRAINT IF EXISTS watch_sessions_media_kind_check;

ALTER TABLE public.watch_sessions
  ADD CONSTRAINT watch_sessions_media_kind_check
  CHECK (media_kind IN ('youtube', 'upload'));

ALTER TABLE public.watch_sessions
  DROP CONSTRAINT IF EXISTS watch_sessions_provider_check;

ALTER TABLE public.watch_sessions
  ADD CONSTRAINT watch_sessions_provider_check
  CHECK (provider IN ('youtube', 'upload'));

ALTER TABLE public.watch_sessions
  ALTER COLUMN provider_video_id DROP NOT NULL;

ALTER TABLE public.watch_sessions
  ADD COLUMN IF NOT EXISTS upload_storage_path text,
  ADD COLUMN IF NOT EXISTS upload_filename text,
  ADD COLUMN IF NOT EXISTS upload_mime text,
  ADD COLUMN IF NOT EXISTS source_title text;

ALTER TABLE public.watch_sessions
  DROP CONSTRAINT IF EXISTS watch_sessions_youtube_id_check;

ALTER TABLE public.watch_sessions
  ADD CONSTRAINT watch_sessions_source_check
  CHECK (
    (
      media_kind = 'youtube'
      AND provider = 'youtube'
      AND provider_video_id ~ '^[A-Za-z0-9_-]{11}$'
      AND upload_storage_path IS NULL
    )
    OR (
      media_kind = 'upload'
      AND provider = 'upload'
      AND provider_video_id IS NULL
      AND upload_storage_path IS NOT NULL
      AND char_length(upload_storage_path) BETWEEN 1 AND 512
    )
  );

COMMENT ON COLUMN public.watch_sessions.upload_storage_path IS
  'Private storage path for uploaded Watch Together videos (signed URL at playback time).';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'watch-together-media',
  'watch-together-media',
  false,
  104857600,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
