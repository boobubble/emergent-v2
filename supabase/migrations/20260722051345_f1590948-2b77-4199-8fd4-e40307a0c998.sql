
-- Extend competition_awards to support Fun Zone winners (meme/fan-art/poster).
ALTER TABLE public.competition_awards
  ADD COLUMN IF NOT EXISTS award_type text,
  ADD COLUMN IF NOT EXISTS post_id uuid;

-- New award_type values are additive text: 'podium' (default for existing rows),
-- 'meme_of_battle', 'fan_art_winner', 'best_campaign_poster'.
UPDATE public.competition_awards SET award_type = 'podium' WHERE award_type IS NULL;

-- Ensure only one Fun Zone winner per type per competition.
CREATE UNIQUE INDEX IF NOT EXISTS competition_awards_type_unique
  ON public.competition_awards (competition_id, award_type)
  WHERE award_type IN ('meme_of_battle','fan_art_winner','best_campaign_poster');

CREATE INDEX IF NOT EXISTS competition_awards_award_type_idx
  ON public.competition_awards (award_type);
