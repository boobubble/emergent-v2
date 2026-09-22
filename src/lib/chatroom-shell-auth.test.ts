import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("chatroom shell authenticated surface", () => {
  it("reuses AuthenticatedSurfaceProviders for signed-in overlay panels", () => {
    const src = read("src/components/codychat/chatroom-shell-auth.tsx");
    expect(src).toContain("AuthenticatedSurfaceProviders");
    expect(src).toContain("loadBrowserSupabase");
    expect(src).toContain("useSocialGraphOptional");
  });

  it("wraps CodyChat shell panels with ChatroomShellAuthenticatedSurface", () => {
    const overlay = read("src/components/codychat/CodyChatShellPanelOverlay.tsx");
    expect(overlay).toContain("ChatroomShellAuthenticatedSurface");
    expect(overlay).toContain("ChatroomFeedMode");
    expect(overlay).toContain("PoetryComposeView");
    expect(overlay).toContain("preferSignedInIdentity");
    expect(overlay).toContain("FindFriendsView embedded");
  });
});
