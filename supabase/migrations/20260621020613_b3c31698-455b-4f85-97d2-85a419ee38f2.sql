CREATE OR REPLACE FUNCTION public.delete_user_cascade(_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF _user IS NULL THEN RETURN; END IF;
  DELETE FROM public.messages WHERE author_id = _user;
  DELETE FROM public.message_highlights WHERE buyer_id = _user;
  DELETE FROM public.dm_reads WHERE user_id = _user;
  DELETE FROM public.friendships WHERE sender_id = _user OR receiver_id = _user;
  DELETE FROM public.notifications WHERE user_id = _user OR actor_id = _user;
  DELETE FROM public.reactions WHERE user_id = _user;
  DELETE FROM public.comments WHERE author_id = _user;
  DELETE FROM public.posts WHERE owner_id = _user OR author_id = _user;
  DELETE FROM public.post_boosts WHERE booster_id = _user;
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
    OR (target_type = 'user' AND target_id = _user);
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
$function$;