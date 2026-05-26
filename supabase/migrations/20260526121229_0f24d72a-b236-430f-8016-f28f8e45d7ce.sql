
-- =========================================================
-- Enums
-- =========================================================
CREATE TYPE public.game_type AS ENUM ('ludo_1v1', 'ludo_4p');
CREATE TYPE public.game_status AS ENUM ('waiting', 'active', 'finished', 'cancelled');
CREATE TYPE public.game_visibility AS ENUM ('public', 'private');
CREATE TYPE public.game_invite_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'expired');
CREATE TYPE public.game_reward_type AS ENUM ('win', 'participation', 'daily_first', 'streak_bonus');

-- =========================================================
-- games
-- =========================================================
CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type public.game_type NOT NULL,
  status public.game_status NOT NULL DEFAULT 'waiting',
  visibility public.game_visibility NOT NULL DEFAULT 'public',
  created_by uuid NOT NULL,
  winner_id uuid,
  current_turn_seat smallint NOT NULL DEFAULT 0,
  turn_started_at timestamptz,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  turn_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_games_created_by ON public.games(created_by);
CREATE INDEX idx_games_quick_match
  ON public.games(game_type, status, visibility, created_at)
  WHERE status = 'waiting' AND visibility = 'public';

CREATE TRIGGER games_set_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read games"
  ON public.games FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owner can create game"
  ON public.games FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- No direct client UPDATE/DELETE: game state changes only via SECURITY DEFINER server fns.

-- =========================================================
-- game_players
-- =========================================================
CREATE TABLE public.game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  seat smallint NOT NULL,
  color text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  is_ready boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (game_id, seat),
  UNIQUE (game_id, user_id),
  CHECK (seat >= 0 AND seat <= 3)
);
CREATE INDEX idx_game_players_user ON public.game_players(user_id);
CREATE INDEX idx_game_players_game ON public.game_players(game_id);

ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read game_players"
  ON public.game_players FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "User can join as self"
  ON public.game_players FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own ready/seat"
  ON public.game_players FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can leave own row"
  ON public.game_players FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================
-- game_invites
-- =========================================================
CREATE TABLE public.game_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  status public.game_invite_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CHECK (sender_id <> receiver_id)
);
CREATE INDEX idx_game_invites_receiver_pending
  ON public.game_invites(receiver_id, status, created_at DESC);
CREATE INDEX idx_game_invites_game ON public.game_invites(game_id);

ALTER TABLE public.game_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender or receiver can read invite"
  ON public.game_invites FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Sender can create invite"
  ON public.game_invites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receiver can respond"
  ON public.game_invites FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id)
  WITH CHECK (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- =========================================================
-- game_rewards (writes only via server fns with service_role)
-- =========================================================
CREATE TABLE public.game_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  reward_type public.game_reward_type NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  coins integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_game_rewards_user_day
  ON public.game_rewards(user_id, created_at DESC);
CREATE UNIQUE INDEX uniq_game_reward_win_per_game
  ON public.game_rewards(game_id, reward_type)
  WHERE reward_type = 'win';

ALTER TABLE public.game_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can read own rewards"
  ON public.game_rewards FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read rewards for leaderboards"
  ON public.game_rewards FOR SELECT TO authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policies — only service_role (server fns) can write.

-- =========================================================
-- Realtime
-- =========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_invites;

ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER TABLE public.game_players REPLICA IDENTITY FULL;
ALTER TABLE public.game_invites REPLICA IDENTITY FULL;
