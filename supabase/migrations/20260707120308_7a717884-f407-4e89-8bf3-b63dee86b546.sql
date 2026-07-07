REVOKE ALL ON FUNCTION public.verify_chatroom_password(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_trio_room_password(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_trio_room(text, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.accept_trio_invite(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.verify_chatroom_password(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_trio_room_password(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_trio_room(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_trio_invite(uuid, text) TO authenticated;