
-- 1. Friendships: only receiver can update status
DROP POLICY IF EXISTS "Update own friendship" ON public.friendships;
CREATE POLICY "Receiver can update friendship"
ON public.friendships
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- 2. Messages: strict dm channel format check
DROP POLICY IF EXISTS "Read lobby or own DMs" ON public.messages;
DROP POLICY IF EXISTS "Send as self to lobby or own DMs" ON public.messages;

CREATE POLICY "Read lobby or own DMs"
ON public.messages
FOR SELECT
TO authenticated
USING (
  channel_id = 'lobby'
  OR channel_id ~ ('^dm:' || (auth.uid())::text || ':[0-9a-f-]{36}$')
  OR channel_id ~ ('^dm:[0-9a-f-]{36}:' || (auth.uid())::text || '$')
);

CREATE POLICY "Send as self to lobby or own DMs"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND (
    channel_id = 'lobby'
    OR channel_id ~ ('^dm:' || (auth.uid())::text || ':[0-9a-f-]{36}$')
    OR channel_id ~ ('^dm:[0-9a-f-]{36}:' || (auth.uid())::text || '$')
  )
);

-- 3. Hashtags: remove unrestricted insert/update (the trigger is SECURITY DEFINER so it still works)
DROP POLICY IF EXISTS "Insert hashtags" ON public.hashtags;
DROP POLICY IF EXISTS "Update hashtags" ON public.hashtags;

-- 4. Notifications: remove unrestricted insert (the notify_friends_on_* triggers are SECURITY DEFINER)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- 5. Revoke EXECUTE on trigger-only functions from clients
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_post_reaction_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_post_comment_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.register_hashtags() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_friends_on_comment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_friends_on_post() FROM PUBLIC, anon, authenticated;
-- has_friendship is referenced from posts RLS so authenticated must still execute it
