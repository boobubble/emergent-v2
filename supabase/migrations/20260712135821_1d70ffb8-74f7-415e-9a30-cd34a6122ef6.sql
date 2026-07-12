ALTER TABLE public.competitions
ADD COLUMN IF NOT EXISTS layout_style TEXT NOT NULL DEFAULT 'auto'
CHECK (layout_style IN ('auto','vs_battle','podium','tournament','leaderboard'));