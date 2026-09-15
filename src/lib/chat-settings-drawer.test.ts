import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = resolve(process.cwd(), "src");
function read(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

describe("chat settings drawer wiring", () => {
  const drawer = read("components/chat/ChatSettingsDrawer.tsx");
  const members = read("components/chat/MembersPanel.tsx");
  const sidebar = read("components/chat/Sidebar.tsx");
  const app = read("components/chat/ChatApp.tsx");

  it("opens from the members-panel control and does not send users to Feed", () => {
    expect(members).toContain("ChatSettingsTrigger");
    expect(members).not.toContain("/feed?tab=account");
    expect(drawer).toContain("palrgo:open-chat-settings");
    expect(drawer).toContain("palrgo:open-chat-theme-store");
    expect(drawer).toContain("getDmPrivacy");
    expect(drawer).toContain("setDmPrivacy");
    expect(drawer).toContain('setSoundPref("private_chat"');
    expect(drawer).toContain('setSoundPref("username_mention"');
    expect(drawer).toContain('setSoundPref("public_chat"');
    expect(drawer).toContain("endGuestChat");
    expect(drawer).toContain("logout()");
    expect(drawer).toContain('to="/u/$username"');
    expect(drawer).not.toContain("watch-together");
  });

  it("reuses guest vs registered sections in one drawer", () => {
    expect(drawer).toContain("isGuestChatting");
    expect(drawer).toContain("Leave Guest Chat");
    expect(drawer).toContain("Direct Messages");
    expect(drawer).toContain("Friends only");
    expect(drawer).toContain("Ignore Bots");
  });

  it("removes left-sidebar profile and logout entry points", () => {
    expect(sidebar).not.toContain("Quick edit profile");
    expect(sidebar).not.toContain("Open account settings");
    expect(sidebar).not.toContain('href="/account"');
    expect(sidebar).not.toMatch(/Sign out/);
    expect(sidebar).not.toContain("End guest chat");
    expect(sidebar).not.toContain("onOpenProfile");
    expect(sidebar).not.toContain('from "./Avatar"');
    expect(sidebar).not.toContain("levelProgress");
    expect(sidebar).toContain("Reset chat data");
    expect(app).toContain("ChatSettingsDrawer");
    expect(app).not.toContain("onOpenProfile");
  });
});
