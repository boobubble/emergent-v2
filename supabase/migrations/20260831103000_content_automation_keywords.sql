-- Optional comma-separated keyword cluster per queued idea.
-- Empty/null means publish flows fall back to existing AI / pattern keywords.

ALTER TABLE public.blog_topic_ideas ADD COLUMN IF NOT EXISTS keywords TEXT;
ALTER TABLE public.static_page_ideas ADD COLUMN IF NOT EXISTS keywords TEXT;

COMMENT ON COLUMN public.blog_topic_ideas.keywords IS
  'Optional comma-separated keyword cluster. When set, used as the published blog_posts.keywords instead of the AI META keywords.';

COMMENT ON COLUMN public.static_page_ideas.keywords IS
  'Optional comma-separated keyword cluster. Merged into custom_pages.meta_keywords alongside keyword-group patterns.';
