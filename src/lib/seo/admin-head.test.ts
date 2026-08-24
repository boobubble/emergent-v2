import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ADMIN_ROBOTS, adminRouteHead } from "./admin-head";

describe("admin robots", () => {
  it("emits noindex, nofollow for admin routes", () => {
    const head = adminRouteHead();
    expect(head.meta.some((m) => m.name === "robots" && m.content === ADMIN_ROBOTS)).toBe(true);
    expect(ADMIN_ROBOTS).toBe("noindex, nofollow");
  });

  it("is wired onto the /admin layout route", () => {
    const src = readFileSync(resolve(process.cwd(), "src/routes/admin.tsx"), "utf8");
    expect(src).toContain("head: adminRouteHead");
  });
});
