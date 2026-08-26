import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

describe("guest homepage initial graph", () => {
  it("root does not statically import app-only stores", () => {
    const root = read("routes/__root.tsx");
    expect(root).not.toContain('from "@/lib/chat-store"');
    expect(root).not.toContain('from "@/lib/use-social-graph"');
    expect(root).not.toContain('from "@/lib/use-notifications"');
    expect(root).not.toContain('from "@/lib/feed-prefs"');
    expect(root).not.toContain('from "@/lib/ignore-store"');
    expect(root).not.toContain("LicenseGuard");
    expect(root).not.toContain("SubscriptionGate");
    expect(root).not.toContain("BroadcasterAnnouncements");
    expect(root).not.toContain("TrioInvitesListener");
    expect(root).not.toContain("usePresenceHeartbeat");
    expect(root).toContain("lazy(() =>");
    expect(root).toContain("AuthenticatedAppShell");
    expect(root).toContain("PublicReadOnlyAppShell");
    expect(root).not.toContain("fonts.googleapis.com/css2");
  });

  it("AuthDialogs is lazy from the light dialogs module", () => {
    const gate = read("lib/auth-gate.tsx");
    const shell = read("components/home/HomeGuestShell.tsx");
    expect(gate).toContain('import("@/components/auth/AuthDialogs")');
    expect(shell).toContain('import("@/components/auth/AuthDialogs")');
    expect(gate).not.toContain('import("@/components/auth/AuthScreen")');
    const screen = read("components/auth/AuthScreen.tsx");
    expect(screen).toContain("LiveCommunityBackground");
    const dialogs = read("components/auth/AuthDialogs.tsx");
    expect(dialogs).not.toContain('from "@/components/auth/LiveCommunityBackground"');
    expect(dialogs).not.toContain('from "@/components/feedback/FeedbackShowcase"');
  });

  it("homepage icons use direct Lucide leaves", () => {
    expect(read("components/home/HomeSeoContent.tsx")).not.toContain('from "lucide-react"');
    expect(read("components/home/HomeFooter.tsx")).not.toContain('from "lucide-react"');
    expect(read("components/home/home-icons.ts")).toContain("lucide-react/dist/esm/icons/");
  });

  it("GuestNicknameDialog is lazy until opened", () => {
    const gate = read("lib/auth-gate.tsx");
    expect(gate).toMatch(/lazy\(\(\) =>/);
    expect(gate).toContain("GuestNicknameDialog");
    expect(gate).toContain("GuestNicknameHost");
    expect(gate).toContain("nicknameDialogOpen");
  });

  it("guest home skips getSession when no stored token", () => {
    const auth = read("lib/auth-store.tsx");
    expect(auth).toContain("hasStoredAuthToken");
    expect(auth).toContain("guestHome");
    expect(auth).toContain('import("@/lib/device-fingerprint")');
  });
});
