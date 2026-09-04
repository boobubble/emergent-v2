/** Shared role helpers for the Writer content-editor capability.
 *
 * `isAdmin` stays admin/super_admin only. Writer is additive for blog +
 * custom-page editing and must not open the rest of the admin panel.
 */

export const ADMIN_ROLES = ["super_admin", "admin"] as const;
export const CONTENT_EDITOR_ROLES = ["super_admin", "admin", "writer"] as const;
export const MANAGED_STAFF_ROLES = [
  "super_admin",
  "admin",
  "moderator",
  "dj",
  "rj",
  "writer",
] as const;

export type ManagedStaffRole = (typeof MANAGED_STAFF_ROLES)[number];

/** Admin list views Writers may open to find content to edit. */
export const WRITER_ALLOWED_ADMIN_PATHS = [
  "/admin/blog/moderate",
  "/admin/pages/all",
] as const;

export function isAdminRole(roles: readonly string[]): boolean {
  return roles.includes("super_admin") || roles.includes("admin");
}

export function isSuperAdminRole(roles: readonly string[]): boolean {
  return roles.includes("super_admin");
}

export function isWriterRole(roles: readonly string[]): boolean {
  return roles.includes("writer");
}

export function isContentEditorRole(roles: readonly string[]): boolean {
  return isAdminRole(roles) || isWriterRole(roles);
}

/** Writer-only (no admin) access to the scoped content list routes. */
export function isWriterAllowedAdminPath(pathname: string): boolean {
  if (pathname === "/admin/pages") return true;
  return (WRITER_ALLOWED_ADMIN_PATHS as readonly string[]).includes(pathname);
}

export function summarizeRoles(roles: readonly string[]) {
  const isSuperAdmin = isSuperAdminRole(roles);
  const isAdmin = isAdminRole(roles);
  const isWriter = isWriterRole(roles);
  return {
    roles: [...roles],
    isSuperAdmin,
    isAdmin,
    isWriter,
    canManageContent: isAdmin || isWriter,
  };
}
