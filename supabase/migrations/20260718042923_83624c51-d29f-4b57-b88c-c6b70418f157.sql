
CREATE TABLE IF NOT EXISTS public.game_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  slot TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_game_saves_user_game ON public.game_saves(user_id, game_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_saves TO authenticated;
GRANT ALL ON public.game_saves TO service_role;

ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own game saves"
  ON public.game_saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_game_saves_updated_at
  BEFORE UPDATE ON public.game_saves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
