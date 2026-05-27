
-- 1) game_rewards: remove public-read policy; keep own-only
DROP POLICY IF EXISTS "Anyone can read rewards for leaderboards" ON public.game_rewards;

-- 2) user_inventory: restrict full read to owner; expose only equipped rows to others
DROP POLICY IF EXISTS "Read all inventory" ON public.user_inventory;
CREATE POLICY "Read own inventory" ON public.user_inventory
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Read others equipped items" ON public.user_inventory
  FOR SELECT TO authenticated USING (equipped = true);

-- 3) messages: require accepted friendship for DM channels
CREATE OR REPLACE FUNCTION public.is_dm_channel_allowed(_channel text, _user uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE a uuid; b uuid; other uuid;
BEGIN
  IF _channel !~ '^dm:[0-9a-f-]{36}:[0-9a-f-]{36}$' THEN RETURN false; END IF;
  a := substring(_channel from 4 for 36)::uuid;
  b := substring(_channel from 41 for 36)::uuid;
  IF a = _user THEN other := b;
  ELSIF b = _user THEN other := a;
  ELSE RETURN false;
  END IF;
  IF other = _user THEN RETURN false; END IF;
  RETURN public.has_friendship(_user, other);
END $$;

DROP POLICY IF EXISTS "Send as self to lobby games or own DMs" ON public.messages;
CREATE POLICY "Send as self to lobby games or friend DMs" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND (
      channel_id = 'lobby'
      OR channel_id = 'games'
      OR (channel_id LIKE 'dm:%' AND public.is_dm_channel_allowed(channel_id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Read lobby games or own DMs" ON public.messages;
CREATE POLICY "Read lobby games or friend DMs" ON public.messages
  FOR SELECT TO authenticated
  USING (
    channel_id = 'lobby'
    OR channel_id = 'games'
    OR (channel_id LIKE 'dm:%' AND public.is_dm_channel_allowed(channel_id, auth.uid()))
  );

-- 4) posts: protect anonymous author identity
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS owner_id uuid;
UPDATE public.posts SET owner_id = author_id WHERE owner_id IS NULL;
ALTER TABLE public.posts ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.posts ALTER COLUMN author_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_owner_id ON public.posts(owner_id);

CREATE OR REPLACE FUNCTION public.enforce_post_anonymity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Always pin owner_id from incoming author_id on insert
  IF TG_OP = 'INSERT' THEN
    IF NEW.owner_id IS NULL THEN NEW.owner_id := NEW.author_id; END IF;
  ELSE
    -- Prevent ownership transfer on update
    NEW.owner_id := OLD.owner_id;
  END IF;
  -- Mask author_id for anonymous posts so it never leaves the DB
  IF NEW.is_anonymous THEN
    NEW.author_id := NULL;
  ELSE
    NEW.author_id := NEW.owner_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS enforce_post_anonymity_trg ON public.posts;
CREATE TRIGGER enforce_post_anonymity_trg
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_post_anonymity();

-- Switch RLS to owner_id (author_id may be NULL for anonymous posts)
DROP POLICY IF EXISTS "Read visible posts" ON public.posts;
DROP POLICY IF EXISTS "Insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Update own posts" ON public.posts;
DROP POLICY IF EXISTS "Delete own posts" ON public.posts;

CREATE POLICY "Read visible posts" ON public.posts FOR SELECT TO authenticated
  USING (
    privacy = 'public'
    OR owner_id = auth.uid()
    OR (privacy = 'friends' AND public.has_friendship(auth.uid(), owner_id))
  );
CREATE POLICY "Insert own posts" ON public.posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = author_id);
CREATE POLICY "Update own posts" ON public.posts FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);
CREATE POLICY "Delete own posts" ON public.posts FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Comments visibility must use owner_id (so owner of anonymous post can still read)
DROP POLICY IF EXISTS "Read comments on visible posts" ON public.comments;
CREATE POLICY "Read comments on visible posts" ON public.comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = comments.post_id
        AND (p.privacy = 'public'
          OR p.owner_id = auth.uid()
          OR (p.privacy = 'friends' AND public.has_friendship(auth.uid(), p.owner_id)))
    )
  );

-- Friend notifications: use owner_id, but skip for anonymous posts to avoid leaking identity
CREATE OR REPLACE FUNCTION public.notify_friends_on_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_anonymous THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, actor_id, kind, target_type, target_id, payload)
  SELECT
    CASE WHEN f.sender_id = NEW.owner_id THEN f.receiver_id ELSE f.sender_id END,
    NEW.owner_id,
    'friend_post',
    'post',
    NEW.id,
    jsonb_build_object('text', LEFT(COALESCE(NEW.text, ''), 140))
  FROM public.friendships f
  WHERE f.status = 'accepted'
    AND (f.sender_id = NEW.owner_id OR f.receiver_id = NEW.owner_id);
  RETURN NEW;
END;
$$;
