
-- 1) Confessions: prevent direct client reads of author_id; server uses service role
REVOKE SELECT ON public.confessions FROM authenticated, anon;
GRANT SELECT (id, display_mode, alias, avatar_emoji, category, kind, text, image_url, poll, status, is_pinned, is_featured, like_count, reply_count, expires_at, created_at, updated_at) ON public.confessions TO authenticated;

-- Keep RLS-side ownership working (RLS evaluates server-side and is unaffected by column grants).
-- Owners still need to query their own rows by author_id via server functions (which use service role).

-- 2) radio_queue_items: fix tautology in host check + tighten WITH CHECK
DROP POLICY IF EXISTS "radio_queue_insert_host_or_admin" ON public.radio_queue_items;
DROP POLICY IF EXISTS "radio_queue_update_host_or_admin" ON public.radio_queue_items;
DROP POLICY IF EXISTS "radio_queue_delete_host_or_admin" ON public.radio_queue_items;

CREATE POLICY "radio_queue_insert_host_or_admin" ON public.radio_queue_items
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.radio_widgets w WHERE w.id = radio_queue_items.widget_id AND w.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.radio_widget_state s WHERE s.widget_id = radio_queue_items.widget_id AND s.current_host_id = auth.uid())
  );

CREATE POLICY "radio_queue_update_host_or_admin" ON public.radio_queue_items
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.radio_widgets w WHERE w.id = radio_queue_items.widget_id AND w.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.radio_widget_state s WHERE s.widget_id = radio_queue_items.widget_id AND s.current_host_id = auth.uid())
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.radio_widgets w WHERE w.id = radio_queue_items.widget_id AND w.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.radio_widget_state s WHERE s.widget_id = radio_queue_items.widget_id AND s.current_host_id = auth.uid())
  );

CREATE POLICY "radio_queue_delete_host_or_admin" ON public.radio_queue_items
  FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.radio_widgets w WHERE w.id = radio_queue_items.widget_id AND w.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.radio_widget_state s WHERE s.widget_id = radio_queue_items.widget_id AND s.current_host_id = auth.uid())
  );

-- 3) user_bans: hide ip_address from the banned user; admins read via service role
REVOKE SELECT ON public.user_bans FROM authenticated, anon;
GRANT SELECT (id, user_id, ban_type, reason, created_by, created_at, expires_at, active) ON public.user_bans TO authenticated;

-- 4) radio_widget_state: tighten UPDATE WITH CHECK so non-admin hosts can only set
-- current_host_id to NULL or themselves, and can't transfer to other widgets.
DROP POLICY IF EXISTS "radio_widget_state_update_host_or_admin" ON public.radio_widget_state;

CREATE POLICY "radio_widget_state_update_host_or_admin" ON public.radio_widget_state
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.radio_widgets w WHERE w.id = radio_widget_state.widget_id AND w.owner_id = auth.uid())
    OR current_host_id = auth.uid()
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      EXISTS (SELECT 1 FROM public.radio_widgets w WHERE w.id = radio_widget_state.widget_id AND w.owner_id = auth.uid())
      AND (current_host_id IS NULL OR current_host_id = auth.uid())
    )
    OR (
      current_host_id = auth.uid()
    )
  );

-- 5) Move btree_gist extension out of public schema
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO authenticated, anon, service_role;
ALTER EXTENSION btree_gist SET SCHEMA extensions;
