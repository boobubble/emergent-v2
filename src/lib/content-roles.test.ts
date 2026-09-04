import { describe, expect, it } from "vitest";
import {
  isAdminRole,
  isContentEditorRole,
  isWriterAllowedAdminPath,
  isWriterRole,
  summarizeRoles,
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

  it("keeps existing admin/SA flags unchanged", () => {
    expect(summarizeRoles(["admin"])).toMatchObject({
      isAdmin: true,
      isSuperAdmin: false,
      isWriter: false,
      canManageContent: true,
    });
    expect(summarizeRoles(["super_admin"])).toMatchObject({
      isAdmin: true,
      isSuperAdmin: true,
      canManageContent: true,
    });
    expect(summarizeRoles(["writer"])).toMatchObject({
      isAdmin: false,
      isSuperAdmin: false,
      isWriter: true,
      canManageContent: true,
    });
    expect(summarizeRoles(["moderator"])).toMatchObject({
      isAdmin: false,
      canManageContent: false,
    });
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
