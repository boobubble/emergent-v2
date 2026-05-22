CREATE OR REPLACE FUNCTION public.notify_friends_on_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, kind, target_type, target_id, payload)
  SELECT
    CASE WHEN f.sender_id = NEW.author_id THEN f.receiver_id ELSE f.sender_id END,
    NEW.author_id,
    'friend_post',
    'post',
    NEW.id,
    jsonb_build_object('text', LEFT(COALESCE(NEW.text, ''), 140))
  FROM public.friendships f
  WHERE f.status = 'accepted'
    AND (f.sender_id = NEW.author_id OR f.receiver_id = NEW.author_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_friends_on_post ON public.posts;
CREATE TRIGGER trg_notify_friends_on_post
AFTER INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.notify_friends_on_post();

CREATE OR REPLACE FUNCTION public.notify_friends_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, kind, target_type, target_id, payload)
  SELECT
    CASE WHEN f.sender_id = NEW.author_id THEN f.receiver_id ELSE f.sender_id END,
    NEW.author_id,
    'friend_comment',
    'post',
    NEW.post_id,
    jsonb_build_object('text', LEFT(COALESCE(NEW.text, ''), 140))
  FROM public.friendships f
  WHERE f.status = 'accepted'
    AND (f.sender_id = NEW.author_id OR f.receiver_id = NEW.author_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_friends_on_comment ON public.comments;
CREATE TRIGGER trg_notify_friends_on_comment
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_friends_on_comment();