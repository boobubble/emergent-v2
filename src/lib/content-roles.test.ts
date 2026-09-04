import { describe, expect, it } from "vitest";
import {
  isAdminRole,
  isContentEditorRole,
  isWriterAllowedAdminPath,
  isWriterRole,
  summarizeRoles,
  writerFlagFromRows,
} from "@/lib/content-roles";

describe("content-roles", () => {
  it("does not treat writer as admin", () => {
    expect(isAdminRole(["writer"])).toBe(false);
    expect(isWriterRole(["writer"])).toBe(true);
    expect(isContentEditorRole(["writer"])).toBe(true);
    expect(isContentEditorRole(["admin"])).toBe(true);
    expect(isContentEditorRole(["super_admin"])).toBe(true);
    expect(isContentEditorRole(["moderator"])).toBe(false);
    expect(isContentEditorRole(["rj"])).toBe(false);
  });

  it("keeps existing admin/SA flags unchanged and ignores the writer flag", () => {
    expect(summarizeRoles(["admin"], { writerCanEditExisting: true })).toMatchObject({
      isAdmin: true,
      isSuperAdmin: false,
      isWriter: false,
      canManageContent: true,
      canEditExistingContent: true,
    });
    expect(summarizeRoles(["super_admin"])).toMatchObject({
      isAdmin: true,
      isSuperAdmin: true,
      canManageContent: true,
      canEditExistingContent: true,
    });
    expect(summarizeRoles(["moderator"], { writerCanEditExisting: true })).toMatchObject({
      isAdmin: false,
      canManageContent: false,
      canEditExistingContent: false,
    });
    expect(summarizeRoles(["rj"], { writerCanEditExisting: true })).toMatchObject({
      canEditExistingContent: false,
    });
  });

  it("lets every Writer create, but edits existing content only with the flag", () => {
    expect(summarizeRoles(["writer"])).toMatchObject({
      isAdmin: false,
      isWriter: true,
      canManageContent: true,
      canCreateContent: true,
      canEditExistingContent: false,
    });
    expect(summarizeRoles(["writer"], { writerCanEditExisting: true })).toMatchObject({
      canManageContent: true,
      canEditExistingContent: true,
    });
    expect(writerFlagFromRows([{ role: "writer", can_edit_existing_content: true }])).toBe(true);
    expect(writerFlagFromRows([{ role: "writer", can_edit_existing_content: false }])).toBe(false);
    expect(writerFlagFromRows([{ role: "admin", can_edit_existing_content: true }])).toBe(false);
  });

  it("allows writers only the blog and pages list admin paths", () => {
    expect(isWriterAllowedAdminPath("/admin/blog/moderate")).toBe(true);
    expect(isWriterAllowedAdminPath("/admin/pages/all")).toBe(true);
    expect(isWriterAllowedAdminPath("/admin/pages")).toBe(true);
    expect(isWriterAllowedAdminPath("/admin/users")).toBe(false);
    expect(isWriterAllowedAdminPath("/admin/moderation")).toBe(false);
    expect(isWriterAllowedAdminPath("/admin/content-automation")).toBe(false);
    expect(isWriterAllowedAdminPath("/admin/pages/categories")).toBe(false);
    expect(isWriterAllowedAdminPath("/admin/pages/bulk")).toBe(false);
    expect(isWriterAllowedAdminPath("/admin")).toBe(false);
  });
});
