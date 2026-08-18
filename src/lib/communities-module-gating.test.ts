import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("communities module gating wiring", () => {
  it("guards community routes when module is disabled", () => {
    const communitiesRoute = read("routes/communities.tsx");
    const communityRoute = read("routes/community.$slug.tsx");

    expect(communitiesRoute).toContain("isCommunitiesModuleEnabled");
    expect(communitiesRoute).toContain("Communities are currently unavailable");
    expect(communityRoute).toContain("isCommunitiesModuleEnabled");
    expect(communityRoute).toContain("if (!enabled) throw notFound()");
  });

  it("shows communities navigation only when enabled", () => {
    const feedRoute = read("routes/feed.index.tsx");
    expect(feedRoute).toContain("appSettings.modules.communities");
    expect(feedRoute).toContain("SideNavLink to=\"/communities\"");
  });

  it("keeps privacy checks in join flow", () => {
    const communityFns = read("lib/community.functions.ts");
    expect(communityFns).toContain("privacy === \"invite_only\" || privacy === \"invite_password\"");
    expect(communityFns).toContain("privacy === \"password\" || privacy === \"invite_password\"");
    expect(communityFns).toContain("privacy === \"private\"");
  });
});
