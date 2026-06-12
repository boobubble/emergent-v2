
-- 1. internal_link_targets
CREATE TABLE public.internal_link_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT,
  url TEXT NOT NULL UNIQUE,
  description TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  type TEXT NOT NULL CHECK (type IN ('blog','tool','game','feed_page','poll','hashtag','community_page','help_page','announcement','seo_page')),
  priority INTEGER NOT NULL DEFAULT 5,
  is_cornerstone BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  source_table TEXT,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ilt_type ON public.internal_link_targets(type);
CREATE INDEX idx_ilt_active ON public.internal_link_targets(is_active) WHERE is_active = true;
CREATE INDEX idx_ilt_cornerstone ON public.internal_link_targets(is_cornerstone) WHERE is_cornerstone = true;
CREATE INDEX idx_ilt_keywords ON public.internal_link_targets USING GIN(keywords);

GRANT SELECT ON public.internal_link_targets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internal_link_targets TO authenticated;
GRANT ALL ON public.internal_link_targets TO service_role;

ALTER TABLE public.internal_link_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active targets" ON public.internal_link_targets
  FOR SELECT USING (is_active OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage targets" ON public.internal_link_targets
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_ilt_updated
  BEFORE UPDATE ON public.internal_link_targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. internal_link_clicks
CREATE TABLE public.internal_link_clicks (
  id BIGSERIAL PRIMARY KEY,
  target_id UUID REFERENCES public.internal_link_targets(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  source_url TEXT,
  anchor_text TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ilc_target ON public.internal_link_clicks(target_id);
CREATE INDEX idx_ilc_created ON public.internal_link_clicks(created_at DESC);

GRANT INSERT ON public.internal_link_clicks TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.internal_link_clicks_id_seq TO anon, authenticated;
GRANT SELECT ON public.internal_link_clicks TO authenticated;
GRANT ALL ON public.internal_link_clicks TO service_role;
GRANT ALL ON SEQUENCE public.internal_link_clicks_id_seq TO service_role;

ALTER TABLE public.internal_link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log clicks" ON public.internal_link_clicks
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read clicks" ON public.internal_link_clicks
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3. custom_pages additions
ALTER TABLE public.custom_pages
  ADD COLUMN IF NOT EXISTS is_cornerstone BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS link_priority INTEGER NOT NULL DEFAULT 5;
