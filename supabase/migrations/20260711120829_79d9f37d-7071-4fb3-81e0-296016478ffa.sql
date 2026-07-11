CREATE OR REPLACE FUNCTION public.feedbot_on_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
  first_media text;
BEGIN
  IF NEW.is_anonymous THEN RETURN NEW; END IF;
  SELECT username INTO uname FROM public.profiles WHERE id = NEW.owner_id;
  first_media := CASE
    WHEN NEW.media_urls IS NOT NULL AND array_length(NEW.media_urls, 1) > 0
      THEN NEW.media_urls[1]
    ELSE NULL
  END;
  PERFORM public.feedbot_enqueue(
    'feed_post', 'feed_post', NEW.owner_id,
    jsonb_build_object(
      'username', uname,
      'text', LEFT(COALESCE(NEW.text,''), 200),
      'has_image', (first_media IS NOT NULL),
      'post_id', NEW.id,
      'slug', NEW.slug
    ),
    '/feed?post=' || NEW.id::text,
    first_media,
    'post:' || NEW.id::text
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let feedbot break post inserts
  RETURN NEW;
END;
$$;