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

  it("/communities does not depend on ChatProvider", () => {
    const rootRoute = read("routes/__root.tsx");
    expect(rootRoute).toContain("function isCommunityNonChatPath");
    expect(rootRoute).toContain("const requireChatProvider = readOnlyApp && !isCommunityNonChatPath(pathname)");
    expect(rootRoute).toContain("const requireChatProvider = !isCommunityNonChatPath(path)");
  });

  it("/chatroom still remains chat-provider-backed", () => {
    const rootRoute = read("routes/__root.tsx");
    expect(rootRoute).toContain("if (pathname === \"/communities\") return true;");
    expect(rootRoute).toContain("if (!pathname.startsWith(\"/community/\")) return false;");
    expect(rootRoute).toContain("return !pathname.includes(\"/chatrooms\");");
  });

  it("authenticated and public community routes remain routable", () => {
    const rootRoute = read("routes/__root.tsx");
    const communityRoute = read("routes/community.$slug.tsx");
    expect(rootRoute).toContain("return <PublicOutlet pathname={path} readOnlyApp={isReadOnlyPublicAppPath(path)} />;");
    expect(communityRoute).toContain("component: CommunityLayout");
    expect(communityRoute).toContain("createFileRoute(\"/community/$slug\")");
  });
});
