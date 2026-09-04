/** Shared role helpers for the Writer content-editor capability.
 *
 * `isAdmin` stays admin/super_admin only. Writer is additive for creating
 * blog posts and custom pages. Editing already-existing content also requires
 * `can_edit_existing_content` on that user's writer `user_roles` row.
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

export function writerFlagFromRows(
  rows: readonly { role?: string | null; can_edit_existing_content?: boolean | null }[],
): boolean {
  return rows.some((r) => r.role === "writer" && !!r.can_edit_existing_content);
}

export function summarizeRoles(
  roles: readonly string[],
  opts?: { writerCanEditExisting?: boolean },
) {
  const isSuperAdmin = isSuperAdminRole(roles);
  const isAdmin = isAdminRole(roles);
  const isWriter = isWriterRole(roles);
  const writerCanEditExisting = isWriter && !!opts?.writerCanEditExisting;
  return {
    roles: [...roles],
    isSuperAdmin,
    isAdmin,
    isWriter,
    /** Create new blog posts / pages. Admins and every Writer. */
    canManageContent: isAdmin || isWriter,
    canCreateContent: isAdmin || isWriter,
    /**
     * Open and save already-existing posts/pages.
     * Admins always; Writers only with can_edit_existing_content.
     * Non-writer roles ignore the flag.
     */
    canEditExistingContent: isAdmin || writerCanEditExisting,
  };
}
