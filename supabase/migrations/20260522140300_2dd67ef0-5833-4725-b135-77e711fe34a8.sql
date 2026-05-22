
-- ============ PROFILES EXTENSION ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_day DATE,
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;

-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.post_kind AS ENUM ('text','image','gif','poll');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.post_privacy AS ENUM ('public','friends','private');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.reaction_type AS ENUM ('like','love','haha','angry','fire');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.friendship_status AS ENUM ('pending','accepted','blocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ POSTS ============
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  kind public.post_kind NOT NULL DEFAULT 'text',
  text TEXT NOT NULL DEFAULT '',
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  poll JSONB,
  privacy public.post_privacy NOT NULL DEFAULT 'public',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  reaction_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  trending_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_author_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_created_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_trending_idx ON public.posts(trending_score DESC);
CREATE INDEX IF NOT EXISTS posts_hashtags_idx ON public.posts USING GIN(hashtags);

-- ============ COMMENTS ============
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_post_idx ON public.comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_comment_id);

-- ============ REACTIONS ============
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post','comment')),
  target_id UUID NOT NULL,
  type public.reaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);
CREATE INDEX IF NOT EXISTS reactions_target_idx ON public.reactions(target_type, target_id);

-- ============ FRIENDSHIPS ============
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status public.friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (sender_id <> receiver_id),
  UNIQUE(sender_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS friendships_receiver_idx ON public.friendships(receiver_id, status);
CREATE INDEX IF NOT EXISTS friendships_sender_idx ON public.friendships(sender_id, status);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  actor_id UUID,
  kind TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  payload JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(user_id) WHERE read = false;

-- ============ HASHTAGS ============
CREATE TABLE IF NOT EXISTS public.hashtags (
  tag TEXT PRIMARY KEY,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hashtags_count_idx ON public.hashtags(usage_count DESC);

-- ============ HELPER: has_friendship ============
CREATE OR REPLACE FUNCTION public.has_friendship(_a UUID, _b UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((sender_id = _a AND receiver_id = _b)
        OR (sender_id = _b AND receiver_id = _a))
  );
$$;

-- ============ ENABLE RLS ============
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;

-- ============ POSTS POLICIES ============
CREATE POLICY "Read visible posts" ON public.posts FOR SELECT TO authenticated USING (
  privacy = 'public'
  OR author_id = auth.uid()
  OR (privacy = 'friends' AND public.has_friendship(auth.uid(), author_id))
);
CREATE POLICY "Insert own posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Delete own posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- ============ COMMENTS POLICIES ============
CREATE POLICY "Read comments on visible posts" ON public.comments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id)
);
CREATE POLICY "Insert own comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- ============ REACTIONS POLICIES ============
CREATE POLICY "Read reactions" ON public.reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own reactions" ON public.reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own reactions" ON public.reactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Delete own reactions" ON public.reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ FRIENDSHIPS POLICIES ============
CREATE POLICY "Read own friendships" ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Send friend request" ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Update own friendship" ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Delete own friendship" ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ============ NOTIFICATIONS POLICIES ============
CREATE POLICY "Read own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Delete own notifications" ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============ HASHTAGS POLICIES ============
CREATE POLICY "Read hashtags" ON public.hashtags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert hashtags" ON public.hashtags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update hashtags" ON public.hashtags FOR UPDATE TO authenticated USING (true);

-- ============ COUNTERS TRIGGERS ============
CREATE OR REPLACE FUNCTION public.bump_post_reaction_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_type = 'post' THEN
    UPDATE public.posts SET reaction_count = reaction_count + 1 WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'post' THEN
    UPDATE public.posts SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.target_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
DROP TRIGGER IF EXISTS reactions_bump ON public.reactions;
CREATE TRIGGER reactions_bump
AFTER INSERT OR DELETE ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.bump_post_reaction_count();

CREATE OR REPLACE FUNCTION public.bump_post_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
DROP TRIGGER IF EXISTS comments_bump ON public.comments;
CREATE TRIGGER comments_bump
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.bump_post_comment_count();

-- ============ HASHTAG TRIGGER ============
CREATE OR REPLACE FUNCTION public.register_hashtags()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t TEXT;
BEGIN
  IF NEW.hashtags IS NOT NULL THEN
    FOREACH t IN ARRAY NEW.hashtags LOOP
      INSERT INTO public.hashtags(tag, usage_count, last_used_at)
      VALUES (LOWER(t), 1, now())
      ON CONFLICT (tag) DO UPDATE
        SET usage_count = public.hashtags.usage_count + 1, last_used_at = now();
    END LOOP;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS posts_register_hashtags ON public.posts;
CREATE TRIGGER posts_register_hashtags
AFTER INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.register_hashtags();

-- ============ updated_at TRIGGERS ============
DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS friendships_updated_at ON public.friendships;
CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('feed-media', 'feed-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read feed-media" ON storage.objects FOR SELECT
  USING (bucket_id = 'feed-media');
CREATE POLICY "Users upload to own folder" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'feed-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own feed-media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'feed-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own feed-media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'feed-media' AND auth.uid()::text = (storage.foldername(name))[1]);
