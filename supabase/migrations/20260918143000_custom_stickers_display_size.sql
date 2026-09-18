-- Independent presentation class for admin animated emojis (kind = emoji).
-- Does not replace kind; stickers keep default and ignore this in product UI.

ALTER TABLE public.custom_stickers
  ADD COLUMN IF NOT EXISTS display_size TEXT NOT NULL DEFAULT 'small';

UPDATE public.custom_stickers
SET display_size = 'small'
WHERE kind = 'emoji'
  AND (display_size IS NULL OR display_size NOT IN ('small', 'large'));

ALTER TABLE public.custom_stickers
  DROP CONSTRAINT IF EXISTS custom_stickers_display_size_check;

ALTER TABLE public.custom_stickers
  ADD CONSTRAINT custom_stickers_display_size_check
  CHECK (display_size IN ('small', 'large'));
