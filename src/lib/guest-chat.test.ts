import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GUEST_CHAT_DEFAULTS,
  GUEST_LOBBY_CHANNEL_ID,
  formatGuestDisplayName,
  mergeGuestChatConfig,
} from "./guest-chat-config";
import {
  isBotCommandOrAction,
  looksLikeHtmlOrScript,
  validateGuestNickname,
} from "./guest-nickname";
import { assertGuestLobbyPlainText } from "./guest-nickname";
import { newVisitorId } from "./visitor-session";

const testDir = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(testDir, "..");

function collectSrcFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === ".output") continue;
      collectSrcFiles(full, out);
      continue;
    }
    const ext = extname(name);
    if (ext !== ".ts" && ext !== ".tsx") continue;
    if (name.endsWith(".test.ts") || name.endsWith(".test.tsx") || name.endsWith(".spec.ts")) continue;
    out.push(full);
  }
  return out;
}

describe("guest nickname validation", () => {
  const opts = { minLength: 2, maxLength: 16 };

  it("accepts JD / Arman / Riya", () => {
    for (const n of ["JD", "Arman", "Riya"]) {
      const r = validateGuestNickname(n, opts);
      expect(r.ok).toBe(true);
      if (r.ok) expect(formatGuestDisplayName("Guest-", r.nickname)).toBe(`Guest-${n}`);
    }
  });

  it("rejects short, long, HTML, reserved, and profanity", () => {
    expect(validateGuestNickname("A", opts).ok).toBe(false);
    expect(validateGuestNickname("x".repeat(20), opts).ok).toBe(false);
    expect(validateGuestNickname("<script>", opts).ok).toBe(false);
    expect(validateGuestNickname("admin", opts).ok).toBe(false);
    expect(validateGuestNickname("fuckyou", opts).ok).toBe(false);
  });
});

describe("guest lobby server guards", () => {
  it("allows plain Lobby text when enabled", () => {
    const r = assertGuestLobbyPlainText({
      enabled: true,
      channelId: GUEST_LOBBY_CHANNEL_ID,
      text: "hello lobby",
      maxLen: 280,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects when admin OFF", () => {
    const r = assertGuestLobbyPlainText({
      enabled: false,
      channelId: "lobby",
      text: "hi",
      maxLen: 280,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("DISABLED");
  });

  it("rejects forged non-Lobby room", () => {
    const r = assertGuestLobbyPlainText({
      enabled: true,
      channelId: "games",
      text: "hi",
      maxLen: 280,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("ROOM");
  });

  it("rejects bot commands/actions server-side", () => {
    expect(isBotCommandOrAction("!fish")).toBe(true);
    expect(isBotCommandOrAction("!dig")).toBe(true);
    expect(isBotCommandOrAction("/mute bob")).toBe(true);
    expect(isBotCommandOrAction("hello")).toBe(false);
    const r = assertGuestLobbyPlainText({
      enabled: true,
      channelId: "lobby",
      text: "!fish",
      maxLen: 280,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("BOT");
  });

  it("rejects HTML/script payloads", () => {
    expect(looksLikeHtmlOrScript('<script>alert(1)</script>')).toBe(true);
    const r = assertGuestLobbyPlainText({
      enabled: true,
      channelId: "lobby",
      text: '<script>x</script>',
      maxLen: 280,
    });
    expect(r.ok).toBe(false);
  });
});

describe("guest chat config defaults", () => {
  it("defaults to OFF", () => {
    expect(GUEST_CHAT_DEFAULTS.enabled).toBe(false);
    expect(mergeGuestChatConfig({}).enabled).toBe(false);
    expect(mergeGuestChatConfig({ enabled: true }).enabled).toBe(true);
  });

  it("uses Guest- prefix and lobby channel", () => {
    expect(GUEST_CHAT_DEFAULTS.namePrefix).toBe("Guest-");
    expect(GUEST_LOBBY_CHANNEL_ID).toBe("lobby");
  });
});

describe("ephemeral visitor ids", () => {
  it("generates visitor_ ids (not guest- auth ids)", () => {
    const id = newVisitorId();
    expect(id.startsWith("visitor_")).toBe(true);
    expect(id.startsWith("guest-")).toBe(false);
  });
});

describe("no auth-guest regression", () => {
  it("does not reintroduce signInAnonymously / loginAsGuest / GuestAutoSignIn", () => {
    const files = collectSrcFiles(srcRoot);
    const joined = files.map((f) => readFileSync(f, "utf8")).join("\n");
    expect(joined).not.toMatch(/\bsignInAnonymously\b/);
    expect(joined).not.toMatch(/\bloginAsGuest\b/);
    expect(joined).not.toMatch(/\bGuestAutoSignIn\b/);
  });

  it("guest chat functions never call anonymous auth or profiles insert", () => {
    const src = readFileSync(resolve(srcRoot, "lib/guest-chat.functions.ts"), "utf8");
    expect(src).not.toMatch(/signInAnonymously|loginAsGuest|auth\.admin\.createUser/);
    expect(src).not.toMatch(/\.from\(["']profiles["']\)\s*\.(insert|upsert)/);
    expect(src).toMatch(/guest_chat_messages/);
    expect(src).toMatch(/guest_chat_sessions/);
  });

  it("MessageInput gates media and uses guest lobby send path", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/MessageInput.tsx"), "utf8");
    expect(src).toMatch(/sendGuestLobbyMessage/);
    expect(src).toMatch(/isBotCommandOrAction/);
    expect(src).toMatch(/requireAuth/);
    expect(src).not.toMatch(/signInAnonymously/);
  });

  it("Sidebar exposes Chat as Guest when enabled", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/Sidebar.tsx"), "utf8");
    expect(src).toMatch(/Chat as Guest/);
    expect(src).toMatch(/GUEST_LOBBY_CHANNEL_ID/);
  });

  it("Auth popup offers Login as Guest; landing heroes do not", () => {
    const auth = readFileSync(resolve(srcRoot, "components/auth/AuthScreen.tsx"), "utf8");
    const btn = readFileSync(resolve(srcRoot, "components/auth/ContinueAsGuestButton.tsx"), "utf8");
    const hero = readFileSync(resolve(srcRoot, "components/landing/sections/HeroSection.tsx"), "utf8");
    const welcome = readFileSync(resolve(srcRoot, "routes/welcome.tsx"), "utf8");
    const heropage = readFileSync(resolve(srcRoot, "routes/heropage.tsx"), "utf8");
    const ctx = readFileSync(resolve(srcRoot, "lib/guest-chat-context.tsx"), "utf8");
    const root = readFileSync(resolve(srcRoot, "routes/__root.tsx"), "utf8");

    expect(auth).toMatch(/LoginAsGuestButton/);
    expect(auth).toMatch(/Login with Username/);
    expect(auth).toMatch(/GuestNicknameDialog/);
    expect(btn).toMatch(/Login as Guest/);
    expect(btn).toMatch(/navigateToLobby:\s*true/);
    expect(btn).not.toMatch(/signInAnonymously|loginAsGuest/);

    expect(hero).not.toMatch(/ContinueAsGuest|LoginAsGuest|Continue as Guest/);
    expect(welcome).not.toMatch(/ContinueAsGuest|LoginAsGuest|Continue as Guest/);
    expect(heropage).not.toMatch(/ContinueAsGuest|LoginAsGuest|GuestNicknameDialog/);

    expect(ctx).toMatch(/navigateToLobby/);
    expect(ctx).toMatch(/clearGuestChatSession/);
    expect(root).toMatch(/if\s*\(!readOnlyApp\)\s*\{[\s\S]*GuestChatProvider/);
  });

  it("Admin Guest Chat toggle persists enabled immediately", () => {
    const src = readFileSync(resolve(srcRoot, "routes/admin.chatrooms.tsx"), "utf8");
    const hook = readFileSync(resolve(srcRoot, "lib/use-admin-setting.ts"), "utf8");
    expect(src).toMatch(/persistEnabled/);
    expect(src).toMatch(/saveAsync/);
    expect(hook).toMatch(/valuesRef/);
    expect(hook).toMatch(/saveAsync/);
    expect(hook).toMatch(/guest-chat-public-config/);
  });

  it("MessageList shows GUEST badge for ephemeral visitors", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/MessageList.tsx"), "utf8");
    expect(src).toMatch(/>\s*Guest\s*</);
    expect(src).toMatch(/isEphemeralGuest|visitor_/);
  });

  it("Admin chatrooms includes Guest Chat settings", () => {
    const src = readFileSync(resolve(srcRoot, "routes/admin.chatrooms.tsx"), "utf8");
    expect(src).toMatch(/Guest Chat/);
    expect(src).toMatch(/GUEST_CHAT_SETTING_KEY|guest_chat/);
  });
});