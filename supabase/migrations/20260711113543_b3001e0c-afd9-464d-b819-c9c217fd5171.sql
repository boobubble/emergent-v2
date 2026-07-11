
-- license_activations: restrict SELECT to super_admin (was admin OR super_admin via owner_read path)
DROP POLICY IF EXISTS license_activations_owner_read ON public.license_activations;
CREATE POLICY license_activations_owner_read
  ON public.license_activations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.id = license_activations.license_id
        AND (
          l.owner_user_id = auth.uid()
          OR public.has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
  );

-- Narrow the ALL policy so only super_admin can SELECT via it too; keep INSERT/UPDATE/DELETE
-- for both admin and super_admin by splitting into per-command policies.
DROP POLICY IF EXISTS license_activations_admin_write ON public.license_activations;
CREATE POLICY license_activations_admin_insert
  ON public.license_activations
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );
CREATE POLICY license_activations_admin_update
  ON public.license_activations
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );
CREATE POLICY license_activations_admin_delete
  ON public.license_activations
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- license_logs: restrict SELECT (which exposes ip_address / user_agent) to super_admin only.
-- Keep write access for admin + super_admin (logs are append-only from server code anyway).
DROP POLICY IF EXISTS license_logs_admin_read ON public.license_logs;
CREATE POLICY license_logs_super_admin_read
  ON public.license_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS license_logs_admin_write ON public.license_logs;
CREATE POLICY license_logs_admin_insert
  ON public.license_logs
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );
CREATE POLICY license_logs_admin_update
  ON public.license_logs
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );
CREATE POLICY license_logs_admin_delete
  ON public.license_logs
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- user_bans: split the single "Admins manage bans" ALL policy so ip_address (SELECT)
-- is visible only to super_admin, while regular admins can still INSERT/UPDATE/DELETE.
DROP POLICY IF EXISTS "Admins manage bans" ON public.user_bans;
CREATE POLICY user_bans_super_admin_read
  ON public.user_bans
  FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY user_bans_admin_insert
  ON public.user_bans
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY user_bans_admin_update
  ON public.user_bans
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY user_bans_admin_delete
  ON public.user_bans
  FOR DELETE
  USING (public.is_admin(auth.uid()));
