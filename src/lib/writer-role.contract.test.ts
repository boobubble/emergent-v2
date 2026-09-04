import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("writer role contracts", () => {
  it("adds writer to the live app_role assignment path without expanding isAdmin", () => {
    const adminFn = read("src/lib/admin.functions.ts");
    const roles = read("src/lib/use-my-role.ts");
    const users = read("src/routes/admin.users.tsx");
    expect(adminFn).toContain("loadUserRoleState");
    expect(adminFn).toContain('"writer"');
    expect(roles).toContain("summarizeRoles");
    expect(users).toContain('writer: { label: "Writer"');
    expect(users).toContain(">Writer</th>");
    expect(users).toContain("Can edit existing content");
    expect(users).toContain("setWriterEditExisting");
    expect(read("src/lib/content-roles.ts")).toContain("canEditExistingContent");
    expect(adminFn).toContain("setWriterEditExisting");
    expect(adminFn).toContain("can_edit_existing_content");
  });

  it("lets writers edit existing blog posts only with the flag and keeps new-post review", () => {
    const write = read("src/routes/blog.write.tsx");
    expect(write).toContain("userCanEditExistingContent");
    expect(write).toContain("can_edit_existing_content");
    expect(write).toContain("You don't have permission to edit existing posts.");
    expect(write).not.toMatch(/\.update\(\{[^}]*\bstatus:/);
    expect(write).toContain("Submit ho gaya!");
    expect(write).toContain("Admin approve karega");
  });

  it("lets flagged writers open any existing custom page editor and save", () => {
    const editor = read("src/routes/pages-editor.$id.tsx");
    const pages = read("src/lib/pages.functions.ts");
    expect(editor).toContain("canManageContent");
    expect(editor).toContain("canEditExistingContent");
    expect(editor).toContain("Admin access required");
    expect(pages).toContain("assertExistingContentEditor");
    expect(pages).toContain("assertContentEditor");
    expect(pages).toContain("await assertAdmin(context.userId)");
    expect(pages).toMatch(/export const deletePage[\s\S]*assertAdmin/);
    expect(pages).toMatch(/export const savePage[\s\S]*assertExistingContentEditor/);
    expect(pages).toMatch(/export const getPage[\s\S]*assertExistingContentEditor/);
    expect(pages).toMatch(/export const listPages[\s\S]*assertExistingContentEditor/);
  });

  it("scopes writer admin lists and keeps other admin routes locked", () => {
    const layout = read("src/routes/admin.tsx");
    const helpers = read("src/lib/content-roles.ts");
    const blogs = read("src/routes/admin.blog.moderate.tsx");
    const moderate = read("src/components/blog/BlogModerateView.tsx");
    const allPages = read("src/routes/admin.pages.all.tsx");
    expect(layout).toContain("isWriterAllowedAdminPath");
    expect(layout).toContain("canEditExistingContent");
    expect(layout).toContain("Admin access required");
    expect(existsSync(resolve(process.cwd(), "supabase/migrations/20260904020000_writer_edit_existing_flag.sql"))).toBe(true);
    expect(helpers).toContain("/admin/blog/moderate");
    expect(helpers).toContain("/admin/pages/all");
    expect(helpers).not.toContain("/admin/content-automation");
    expect(blogs).toContain("canModerate={isAdmin}");
    expect(blogs).toContain("can_edit_existing_content");
    expect(blogs).toContain('"writer"');
    expect(moderate).toContain("canModerate");
    expect(allPages).toContain("canDelete");
    expect(existsSync(resolve(process.cwd(), "supabase/migrations/20260904000000_writer_role.sql"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "supabase/migrations/20260904010000_writer_role_blog_rls.sql"))).toBe(true);
  });
});
