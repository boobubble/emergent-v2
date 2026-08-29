import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { flattenAdminNav } from "@/components/admin/AdminNav";

describe("admin Blogs navigation", () => {
  it("adds Blogs to the existing Admin Panel nav pointing at Blog Management", () => {
    const blogs = flattenAdminNav().find((i) => i.label === "Blogs");
    expect(blogs).toBeTruthy();
    expect(blogs?.to).toBe("/admin/blog/moderate");
    expect(blogs?.icon).toBeTruthy();
    expect(blogs?.superOnly).toBeFalsy();
    expect(blogs?.advanced).toBeFalsy();
  });

  it("reuses the existing moderate route and does not add a new blog admin route", () => {
    expect(existsSync(resolve(process.cwd(), "src/routes/admin.blog.moderate.tsx"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "src/routes/admin.blog.tsx"))).toBe(false);
    expect(existsSync(resolve(process.cwd(), "src/routes/admin.blogs.tsx"))).toBe(false);
    const layout = readFileSync(resolve(process.cwd(), "src/routes/admin.tsx"), "utf8");
    expect(layout).toContain("ADMIN_NAV");
    expect(layout).toContain("Admin access required");
    const moderate = readFileSync(resolve(process.cwd(), "src/routes/admin.blog.moderate.tsx"), "utf8");
    expect(moderate).toContain("BlogModerateView");
    expect(moderate).toContain('createFileRoute("/admin/blog/moderate")');
  });
});
