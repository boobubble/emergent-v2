
-- 1) profile_views: explicit deny of client inserts (RPC record_profile_view is SECURITY DEFINER and bypasses RLS)
DROP POLICY IF EXISTS "Clients cannot insert profile views" ON public.profile_views;
CREATE POLICY "Clients cannot insert profile views"
  ON public.profile_views
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- 2) user_dm_wallpapers: block all direct inserts, force purchase_dm_wallpaper RPC
DROP POLICY IF EXISTS "Users cannot self-insert (use purchase fn)" ON public.user_dm_wallpapers;
CREATE POLICY "Direct inserts blocked (use purchase_dm_wallpaper)"
  ON public.user_dm_wallpapers
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- 3) user_inventory: restrict cross-user reads to publicly displayable cosmetic categories only
DROP POLICY IF EXISTS "Read others equipped items" ON public.user_inventory;
CREATE POLICY "Read others equipped public cosmetics"
  ON public.user_inventory
  FOR SELECT
  TO authenticated
  USING (
    equipped = true
    AND category IN ('frame','avatar_frame','username_effect','name_effect','profile_effect','badge','nameplate')
  );
