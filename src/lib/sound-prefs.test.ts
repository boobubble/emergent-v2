import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const lsStore: Record<string, string> = {};

describe("sound preferences", () => {
  beforeEach(() => {
    vi.resetModules();
    for (const k of Object.keys(lsStore)) delete lsStore[k];
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => { lsStore[k] = v; },
      removeItem: (k: string) => { delete lsStore[k]; },
      clear: () => { for (const k of Object.keys(lsStore)) delete lsStore[k]; },
    });
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("defaults every category to enabled", async () => {
    const { SOUND_PREFS_DEFAULTS, getSoundPrefs } = await import("./sound-prefs");
    expect(SOUND_PREFS_DEFAULTS).toEqual({
      public_chat: true,
      private_chat: true,
      notifications: true,
      username_mention: true,
      calls: true,
      radio_announcements: true,
    });
    expect(getSoundPrefs().public_chat).toBe(true);
  });

  it("each category toggles independently via canPlaySound", async () => {
    const { setSoundPref, canPlaySound } = await import("./sound-prefs");
    await setSoundPref("public_chat", false);
    expect(canPlaySound("public_chat")).toBe(false);
    expect(canPlaySound("private_chat")).toBe(true);
    expect(canPlaySound("notifications")).toBe(true);
    expect(canPlaySound("username_mention")).toBe(true);
    expect(canPlaySound("calls")).toBe(true);

    await setSoundPref("notifications", false);
    expect(canPlaySound("public_chat")).toBe(false);
    expect(canPlaySound("notifications")).toBe(false);
    expect(canPlaySound("private_chat")).toBe(true);
  });

  it("persists toggles to localStorage", async () => {
    const { setSoundPref } = await import("./sound-prefs");
    await setSoundPref("calls", false);
    const raw = lsStore["palrgo:sound-prefs"];
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as Record<string, boolean>;
    expect(parsed.calls).toBe(false);
    expect(parsed.private_chat).toBe(true);
  });

  it("merges partial localStorage without enabling disabled legacy users", async () => {
    lsStore["palrgo:sound-prefs"] = JSON.stringify({ public_chat: false, private_chat: false });
    vi.resetModules();
    const { getSoundPrefs } = await import("./sound-prefs");
    const prefs = getSoundPrefs();
    expect(prefs.public_chat).toBe(false);
    expect(prefs.private_chat).toBe(false);
    expect(prefs.notifications).toBe(true);
  });
});

describe("sound trigger wiring", () => {
  it("maps chat-store sounds to public_chat, private_chat, username_mention", () => {
    const src = readFileSync(resolve(process.cwd(), "src/lib/chat-store.tsx"), "utf8");
    expect(src).toMatch(/playDmPing\(\)/);
    expect(src).toMatch(/playPublicChatTick\(\)/);
    expect(src).toMatch(/playMentionPing\(\)/);
  });

  it("maps notifications provider to playNotificationPing on INSERT", () => {
    const src = readFileSync(resolve(process.cwd(), "src/lib/use-notifications.tsx"), "utf8");
    expect(src).toMatch(/playNotificationPing\(\)/);
    expect(src).toMatch(/eventType === "INSERT"/);
  });

  it("maps trio invites to playCallRing", () => {
    const src = readFileSync(resolve(process.cwd(), "src/components/chat/TrioInvitesListener.tsx"), "utf8");
    expect(src).toMatch(/playCallRing\(\)/);
  });

  it("gates each sound helper on its SoundKind", () => {
    const src = readFileSync(resolve(process.cwd(), "src/lib/sounds.ts"), "utf8");
    expect(src).toMatch(/gated\("private_chat"/);
    expect(src).toMatch(/gated\("public_chat"/);
    expect(src).toMatch(/gated\("username_mention"/);
    expect(src).toMatch(/gated\("notifications"/);
    expect(src).toMatch(/canPlaySound\("calls"\)/);
  });
});
