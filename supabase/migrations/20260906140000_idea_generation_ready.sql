-- Per-idea generation gate for Keyword Research → Content Generation workflow.
-- Existing pending rows stay publishable (generation_ready defaults false; publish prefers ready then FIFO).

ALTER TABLE public.blog_topic_ideas
  ADD COLUMN IF NOT EXISTS generation_ready boolean NOT NULL DEFAULT false;

ALTER TABLE public.static_page_ideas
  ADD COLUMN IF NOT EXISTS generation_ready boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.blog_topic_ideas.generation_ready IS
  'True after admin explicitly sends the idea to Content Generation. Does not publish by itself.';

COMMENT ON COLUMN public.static_page_ideas.generation_ready IS
  'True after admin explicitly sends the idea to Content Generation. Does not publish by itself.';

CREATE INDEX IF NOT EXISTS blog_topic_ideas_generation_ready_created_at_idx
  ON public.blog_topic_ideas (generation_ready DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS static_page_ideas_generation_ready_created_at_idx
  ON public.static_page_ideas (generation_ready DESC, created_at ASC);
