import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

const GUEST_GRAPH = [
  "routes/__root.tsx",
  "lib/auth-store.tsx",
  "lib/auth-listener.ts",
  "lib/app-settings.tsx",
  "lib/use-home-page-mode.ts",
  "components/HeadFootScripts.tsx",
  "components/AdSlot.tsx",
  "components/SessionConflictBanner.tsx",
  "i18n/LanguageProvider.tsx",
] as const;

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
    expect(root).not.toContain("fonts.googleapis.com");
  });

  it("guest graph does not statically import the browser Supabase client", () => {
    for (const file of GUEST_GRAPH) {
      const text = read(file);
      expect(text, file).not.toContain('from "@/integrations/supabase/client"');
      expect(text, file).not.toMatch(/import\s+(?:type\s+)?\{[^}]*createClient[^}]*\}\s+from\s+["']@supabase\/supabase-js["']/);
      expect(text, file).not.toContain('from "@supabase/supabase-js/dist');
    }
    expect(read("integrations/supabase/load-browser.ts")).toContain("loadBrowserSupabase");
    expect(read("integrations/supabase/client.ts")).toContain('import("./client-eager")');
    expect(read("integrations/supabase/client.ts")).not.toMatch(/from ["']@supabase\/supabase-js["']/);
    expect(read("integrations/supabase/public-anon-client.ts")).toContain('import("@supabase/supabase-js")');
    expect(read("integrations/supabase/auth-middleware.ts")).not.toMatch(/import \{ createClient \} from ['"]@supabase\/supabase-js['"]/);
    expect(read("lib/auth-store.tsx")).toContain("isGuestHomePath");
    expect(read("lib/auth-store.tsx")).toContain("loadBrowserSupabase");
    expect(read("lib/auth-store.tsx")).toContain('import("@/lib/device-fingerprint")');
  });

  it("LanguageProvider does not initialize i18next on the guest homepage module", () => {
    const provider = read("i18n/LanguageProvider.tsx");
    expect(provider).not.toContain('import i18n from "./index"');
    expect(provider).toContain('import("./index")');
    expect(provider).toContain("isGuestHomePath");
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

  it("homepage icons are inline SVGs without Lucide modules", () => {
    expect(read("components/home/HomeSeoContent.tsx")).not.toContain('from "lucide-react"');
    expect(read("components/home/HomeFooter.tsx")).not.toContain('from "lucide-react"');
    expect(read("components/home/welcome-primitives.tsx")).not.toContain('from "lucide-react"');
    const icons = read("components/home/home-icons.tsx");
    expect(icons).not.toContain("lucide-react");
    expect(icons).toContain("<svg");
  });

  it("GuestNicknameDialog is lazy until opened", () => {
    const gate = read("lib/auth-gate.tsx");
    expect(gate).toMatch(/lazy\(\(\) =>/);
    expect(gate).toContain("GuestNicknameDialog");
    expect(gate).toContain("GuestNicknameHost");
    expect(gate).toContain("nicknameDialogOpen");
  });

  it("guest Inter is self-hosted and deferred", () => {
    const font = read("components/DeferredInterFont.tsx");
    expect(font).not.toContain("fonts.googleapis.com");
    expect(font).toContain("inter-latin.css");
    expect(font).toContain("scheduleIdle");
  });
});
