ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_official BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.assistant_user_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  muted BOOLEAN NOT NULL DEFAULT false,
  disable_promo BOOLEAN NOT NULL DEFAULT false,
  welcomed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_user_prefs TO authenticated;
GRANT ALL ON public.assistant_user_prefs TO service_role;

ALTER TABLE public.assistant_user_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own assistant prefs"
  ON public.assistant_user_prefs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own assistant prefs"
  ON public.assistant_user_prefs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own assistant prefs"
  ON public.assistant_user_prefs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER assistant_user_prefs_updated_at
  BEFORE UPDATE ON public.assistant_user_prefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();