
-- 1) chatrooms_password_public_exposure ---------------------------------
-- Prevent PostgREST from ever returning the password column to regular
-- clients. Owners/admins keep access through get_chatroom_password() and
-- verify_chatroom_password(), both SECURITY DEFINER.
REVOKE SELECT (password) ON public.chatrooms FROM anon, authenticated;
-- service_role and DB owner keep full access via role membership.

-- 2) posts_author_id_spoofing -------------------------------------------
-- Tighten the INSERT policy so a user can never set author_id to another
-- account. Anonymity is preserved (author_id = NULL) and the
-- enforce_post_anonymity trigger still normalises author_id from owner_id.
DROP POLICY IF EXISTS "Insert own posts" ON public.posts;

CREATE POLICY "Insert own posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (author_id IS NULL OR author_id = auth.uid())
  );
