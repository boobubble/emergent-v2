-- Remove feed content that belongs to profiles that no longer exist.
DELETE FROM public.reactions r
WHERE r.target_type = 'post'
  AND EXISTS (
    SELECT 1
    FROM public.posts p
    LEFT JOIN public.profiles owner_profile ON owner_profile.id = p.owner_id
    LEFT JOIN public.profiles author_profile ON author_profile.id = p.author_id
    WHERE p.id = r.target_id
      AND (owner_profile.id IS NULL OR (p.author_id IS NOT NULL AND author_profile.id IS NULL))
  );

DELETE FROM public.reactions r
WHERE r.target_type = 'comment'
  AND EXISTS (
    SELECT 1
    FROM public.comments c
    JOIN public.posts p ON p.id = c.post_id
    LEFT JOIN public.profiles owner_profile ON owner_profile.id = p.owner_id
    LEFT JOIN public.profiles author_profile ON author_profile.id = p.author_id
    WHERE c.id = r.target_id
      AND (owner_profile.id IS NULL OR (p.author_id IS NOT NULL AND author_profile.id IS NULL))
  );

DELETE FROM public.post_boosts pb
WHERE NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.id = pb.post_id)
   OR EXISTS (
    SELECT 1
    FROM public.posts p
    LEFT JOIN public.profiles owner_profile ON owner_profile.id = p.owner_id
    LEFT JOIN public.profiles author_profile ON author_profile.id = p.author_id
    WHERE p.id = pb.post_id
      AND (owner_profile.id IS NULL OR (p.author_id IS NOT NULL AND author_profile.id IS NULL))
  );

DELETE FROM public.posts p
WHERE NOT EXISTS (SELECT 1 FROM public.profiles owner_profile WHERE owner_profile.id = p.owner_id)
   OR (p.author_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles author_profile WHERE author_profile.id = p.author_id));

DELETE FROM public.reactions r
WHERE (r.target_type = 'post' AND NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.id = r.target_id))
   OR (r.target_type = 'comment' AND NOT EXISTS (SELECT 1 FROM public.comments c WHERE c.id = r.target_id));

DELETE FROM public.post_boosts pb
WHERE NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.id = pb.post_id);

-- Database-level guard: if a profile is deleted by any cleanup path, its posts go too.
ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_owner_id_profiles_fkey,
  ADD CONSTRAINT posts_owner_id_profiles_fkey
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_author_id_profiles_fkey,
  ADD CONSTRAINT posts_author_id_profiles_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.post_boosts
  DROP CONSTRAINT IF EXISTS post_boosts_post_id_fkey,
  ADD CONSTRAINT post_boosts_post_id_fkey
    FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- Strengthen the account cascade so related post data is removed before posts disappear.
CREATE OR REPLACE FUNCTION public.delete_user_cascade(_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user IS NULL THEN RETURN; END IF;

  DELETE FROM public.reactions r
  WHERE r.target_type = 'comment'
    AND EXISTS (
      SELECT 1
      FROM public.comments c
      JOIN public.posts p ON p.id = c.post_id
      WHERE c.id = r.target_id
        AND (p.owner_id = _user OR p.author_id = _user)
    );

  DELETE FROM public.reactions r
  WHERE r.target_type = 'post'
    AND EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = r.target_id
        AND (p.owner_id = _user OR p.author_id = _user)
    );

  DELETE FROM public.post_boosts pb
  WHERE pb.booster_id = _user
     OR EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = pb.post_id
        AND (p.owner_id = _user OR p.author_id = _user)
    );

  DELETE FROM public.comments c
  WHERE c.author_id = _user
     OR EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = c.post_id
        AND (p.owner_id = _user OR p.author_id = _user)
    );

  DELETE FROM public.messages WHERE author_id = _user;
  DELETE FROM public.message_highlights WHERE buyer_id = _user;
  DELETE FROM public.dm_reads WHERE user_id = _user;
  DELETE FROM public.friendships WHERE sender_id = _user OR receiver_id = _user;
  DELETE FROM public.notifications WHERE user_id = _user OR actor_id = _user;
  DELETE FROM public.reactions WHERE user_id = _user;
  DELETE FROM public.posts WHERE owner_id = _user OR author_id = _user;
  DELETE FROM public.confession_reactions WHERE user_id = _user;
  DELETE FROM public.confession_replies WHERE author_id = _user;
  DELETE FROM public.confessions WHERE author_id = _user;
  DELETE FROM public.feedback_votes WHERE user_id = _user;
  DELETE FROM public.feedback_comments WHERE author_id = _user;
  DELETE FROM public.feedback_reports WHERE author_id = _user;
  DELETE FROM public.game_invites WHERE sender_id = _user OR receiver_id = _user;
  DELETE FROM public.game_players WHERE user_id = _user;
  DELETE FROM public.game_rewards WHERE user_id = _user;
  DELETE FROM public.games WHERE created_by = _user;
  DELETE FROM public.trio_room_members WHERE user_id = _user OR invited_by = _user;
  DELETE FROM public.trio_rooms WHERE owner_id = _user;
  DELETE FROM public.mod_notes WHERE user_id = _user OR author_id = _user;
  DELETE FROM public.mod_logs WHERE target_user_id = _user OR actor_id = _user;
  DELETE FROM public.reports WHERE reporter_id = _user
    OR (target_type = 'user' AND target_id = _user::text);
  DELETE FROM public.user_bans WHERE user_id = _user;
  DELETE FROM public.user_mutes WHERE user_id = _user;
  DELETE FROM public.room_moderators WHERE user_id = _user;
  DELETE FROM public.coin_transactions WHERE user_id = _user;
  DELETE FROM public.user_inventory WHERE user_id = _user;
  DELETE FROM public.daily_missions WHERE user_id = _user;
  DELETE FROM public.room_loyalty WHERE user_id = _user;
  DELETE FROM public.user_feed_themes WHERE user_id = _user;
  DELETE FROM public.user_chat_themes WHERE user_id = _user;
  DELETE FROM public.user_devices WHERE user_id = _user;
  DELETE FROM public.internal_link_clicks WHERE user_id = _user;
  DELETE FROM public.assistant_user_prefs WHERE user_id = _user;
  DELETE FROM public.ai_chatbots WHERE user_id = _user;
  DELETE FROM public.radio_announcements WHERE author_id = _user;
  DELETE FROM public.radio_schedules WHERE host_id = _user;
  UPDATE public.radio_queue_items SET added_by = NULL WHERE added_by = _user;
  UPDATE public.radio_widget_state SET current_host_id = NULL WHERE current_host_id = _user;
  UPDATE public.radio_widgets SET owner_id = NULL, created_by = NULL
    WHERE owner_id = _user OR created_by = _user;
  UPDATE public.custom_pages SET created_by = NULL WHERE created_by = _user;
  UPDATE public.url_rules SET created_by = NULL WHERE created_by = _user;
  UPDATE public.word_filters SET created_by = NULL WHERE created_by = _user;
  UPDATE public.banned_devices SET created_by = NULL WHERE created_by = _user;
  DELETE FROM public.user_roles WHERE user_id = _user;
  DELETE FROM public.profiles WHERE id = _user;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_cascade(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_cascade(uuid) TO service_role;

-- Hide any future impossible/orphan rows from the feed even before cleanup runs.
DROP VIEW IF EXISTS public.posts_safe;

CREATE VIEW public.posts_safe
WITH (security_invoker = true)
AS
SELECT
  p.id,
  CASE
    WHEN p.is_anonymous
      AND (auth.uid() IS NULL OR auth.uid() <> p.owner_id)
      AND NOT public.is_admin(auth.uid())
    THEN NULL
    ELSE p.owner_id
  END AS owner_id,
  p.author_id,
  p.kind,
  p.text,
  p.media_urls,
  p.poll,
  p.privacy,
  p.is_anonymous,
  p.hashtags,
  p.reaction_count,
  p.comment_count,
  p.trending_score,
  p.created_at,
  p.updated_at,
  p.slug
FROM public.posts p
WHERE
  EXISTS (SELECT 1 FROM public.profiles owner_profile WHERE owner_profile.id = p.owner_id)
  AND (p.author_id IS NULL OR EXISTS (SELECT 1 FROM public.profiles author_profile WHERE author_profile.id = p.author_id))
  AND (
    p.privacy = 'public'::post_privacy
    OR p.owner_id = auth.uid()
    OR (p.privacy = 'friends'::post_privacy AND public.has_friendship(auth.uid(), p.owner_id))
  );

GRANT SELECT ON public.posts_safe TO authenticated, anon;
GRANT SELECT (
  id, author_id, kind, text, media_urls, poll, privacy, is_anonymous,
  hashtags, reaction_count, comment_count, trending_score, created_at,
  updated_at, slug
) ON public.posts TO anon, authenticated;