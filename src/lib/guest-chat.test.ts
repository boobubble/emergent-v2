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
  assertGuestLobbyPlainText,
  assertGuestLobbyUrlsAllowed,
  extractGuestMessageUrls,
  GUEST_LINK_BLOCKED,
  isBotCommandOrAction,
  looksLikeHtmlOrScript,
  validateGuestNickname,
} from "./guest-nickname";
import { newVisitorId } from "./visitor-session";
import {
  GUEST_LOBBY_ROW_EVENT,
  fallbackGuestAuthor,
  mergeGuestLobbyRows,
  type GuestLobbyRow,
} from "./guest-lobby-feed";
import {
  groupChatMessages,
  isGuestMessageId,
  isNearScrollBottom,
  sanitizeRemoteReplyToId,
} from "./message-list-model";
import type { Message } from "./chat-types";

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

const YT_WATCH = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const YT_SHORT = "https://youtu.be/dQw4w9WgXcQ";
const YT_SHORTS = "https://www.youtube.com/shorts/dQw4w9WgXcQ";

describe("guest lobby URL policy", () => {
  it("allows plain text without URLs", () => {
    expect(assertGuestLobbyUrlsAllowed("hello lobby").ok).toBe(true);
    expect(extractGuestMessageUrls("hello lobby")).toEqual([]);
  });

  it("allows valid YouTube watch, youtu.be, and Shorts URLs", () => {
    expect(assertGuestLobbyUrlsAllowed(YT_WATCH).ok).toBe(true);
    expect(assertGuestLobbyUrlsAllowed(YT_SHORT).ok).toBe(true);
    expect(assertGuestLobbyUrlsAllowed(YT_SHORTS).ok).toBe(true);
  });

  it("allows text plus a valid YouTube URL", () => {
    const text = `Check this out ${YT_WATCH}`;
    expect(assertGuestLobbyUrlsAllowed(text).ok).toBe(true);
    expect(extractGuestMessageUrls(text)).toEqual([YT_WATCH]);
  });

  it("blocks generic http(s) and www URLs", () => {
    for (const text of [
      "see https://example.com/page",
      "http://example.com",
      "visit www.example.com today",
    ]) {
      const r = assertGuestLobbyUrlsAllowed(text);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.code).toBe("LINK");
        expect(r.message).toBe(GUEST_LINK_BLOCKED);
      }
    }
  });

  it("blocks YouTube URL mixed with an external URL", () => {
    const r = assertGuestLobbyUrlsAllowed(`Cool ${YT_SHORT} and https://evil.com/x`);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toBe(GUEST_LINK_BLOCKED);
  });

  it("blocks malformed YouTube URLs", () => {
    const r = assertGuestLobbyUrlsAllowed("https://youtu.be/not-valid-id");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toBe(GUEST_LINK_BLOCKED);
  });

  it("sendGuestLobbyMessage uses assertGuestLobbyUrlsAllowed", () => {
    const src = readFileSync(resolve(srcRoot, "lib/guest-chat.functions.ts"), "utf8");
    expect(src).toMatch(/assertGuestLobbyUrlsAllowed/);
    expect(src).toMatch(/throw new Error\(urlGuard\.message\)/);
    expect(src).not.toMatch(/Links are not allowed for guests\. Sign up to share links\./);
  });
});

describe("MessageInput guest link UX", () => {
  it("handles GUEST_LINK_BLOCKED without opening sign-in modal", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/MessageInput.tsx"), "utf8");
    expect(src).toMatch(/msg === GUEST_LINK_BLOCKED/);
    expect(src).toMatch(/toast\.error\(GUEST_LINK_BLOCKED_MESSAGE\)/);
    expect(src).not.toMatch(/GUEST_BOT_BLOCKED.*sign up\|sign in\|login/);
    const guestLobbyCatch = src.slice(src.indexOf("async function submitGuestLobby"));
    const catchBlock = guestLobbyCatch.slice(guestLobbyCatch.indexOf("} catch"), guestLobbyCatch.indexOf("function submit()"));
    expect(catchBlock).not.toMatch(/sign up\|sign in\|login/i);
  });

  it("still gates attach file behind requireAuth for guests", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/MessageInput.tsx"), "utf8");
    expect(src).toMatch(/function onAttachFile\(\)[\s\S]*requireAuth\(\(\) => fileRef/);
    expect(src).toMatch(/GUEST_BOT_BLOCKED[\s\S]*requireAuth\(\)/);
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
    expect(src).toMatch(/openNicknameDialog/);
    expect(src).toMatch(/appendGuestOptimistic/);
    expect(src).not.toMatch(/signInAnonymously/);
  });

  it("Sidebar exposes Chat as Guest when enabled", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/Sidebar.tsx"), "utf8");
    expect(src).toMatch(/Chat as Guest/);
    expect(src).toMatch(/GUEST_LOBBY_CHANNEL_ID/);
  });

  it("Auth popup offers Login as Guest; landing heroes do not", () => {
    const auth = readFileSync(resolve(srcRoot, "components/auth/AuthDialogs.tsx"), "utf8");
    const btn = readFileSync(resolve(srcRoot, "components/auth/ContinueAsGuestButton.tsx"), "utf8");
    const hero = readFileSync(resolve(srcRoot, "components/landing/sections/HeroSection.tsx"), "utf8");
    const welcome = readFileSync(resolve(srcRoot, "components/home/HomeSeoContent.tsx"), "utf8");
    const heropage = readFileSync(resolve(srcRoot, "routes/heropage.tsx"), "utf8");
    const ctx = readFileSync(resolve(srcRoot, "lib/guest-chat-context.tsx"), "utf8");
    const root = readFileSync(resolve(srcRoot, "routes/__root.tsx"), "utf8");

    expect(auth).toMatch(/LoginAsGuestButton/);
    expect(auth).toMatch(/Login with Username/);
    const signUpBlock = auth.slice(auth.indexOf("function SignUpDialog"), auth.indexOf("function ForgotDialog"));
    expect(signUpBlock.match(/Already have one/g)?.length).toBe(1);
    expect(signUpBlock.match(/LoginAsGuestButton/g)?.length).toBe(1);
    expect(signUpBlock).toMatch(/data-signup-dialog-top/);
    expect(signUpBlock.indexOf("Already have one")).toBeLessThan(signUpBlock.indexOf("Profile picture (optional)"));
    expect(signUpBlock).toMatch(/shrink-0[\s\S]*overflow-y-auto/);
    expect(btn).toMatch(/Login as Guest/);
    expect(btn).toMatch(/navigateToLobby:\s*true/);
    expect(btn).not.toMatch(/signInAnonymously|loginAsGuest/);

    expect(hero).not.toMatch(/ContinueAsGuest|LoginAsGuest|Continue as Guest/);
    expect(welcome).not.toMatch(/ContinueAsGuest|LoginAsGuest|Continue as Guest/);
    expect(heropage).not.toMatch(/ContinueAsGuest|LoginAsGuest|GuestNicknameDialog/);

    expect(ctx).toMatch(/navigateToLobby/);
    expect(ctx).toMatch(/clearGuestChatSession/);

    const gate = readFileSync(resolve(srcRoot, "lib/auth-gate.tsx"), "utf8");
    expect(gate).toMatch(/GuestChatProvider/);
    expect(gate).toMatch(/GuestNicknameDialog/);
    const providerIdx = gate.indexOf("<GuestChatProvider>");
    const dialogsIdx = gate.indexOf("<AuthDialogs");
    const nickIdx = gate.indexOf("<GuestNicknameHost");
    expect(providerIdx).toBeGreaterThan(-1);
    expect(dialogsIdx).toBeGreaterThan(providerIdx);
    expect(nickIdx).toBeGreaterThan(providerIdx);
    expect(root).not.toMatch(/<GuestChatProvider>/);
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

  it("ephemeral guest messages include Reply action in MSG_ACTION_ROW", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/MessageList.tsx"), "utf8");
    const guestBranch = src.slice(src.indexOf("if (isEphemeralGuest)"), src.indexOf("if (isMe)"));
    expect(guestBranch).toMatch(/MSG_ACTION_ROW/);
    expect(guestBranch).toMatch(/<ReplyButton/);
    expect(guestBranch).toMatch(/BUBBLE_SHELL/);
  });

  it("own guest bubbles keep opaque primary contrast in light and dark", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/MessageList.tsx"), "utf8");
    const own = src.match(/isOwnGuest\s*\?\s*(?:`([^`]*msg-mine[^`]*)`|"(msg-mine[^"]+)")/);
    const cls = own?.[1] ?? own?.[2];
    expect(cls).toBeTruthy();
    expect(cls).toMatch(/\bbg-primary\b/);
    expect(cls).not.toMatch(/bg-primary\//);
    expect(cls).toMatch(/\btext-primary-foreground\b/);
    expect(cls).not.toMatch(/text-transparent|opacity-0|text-background|text-muted/);
    expect(src).toMatch(/data-message-role="me"/);
    expect(src).toMatch(/backgroundColor:\s*"var\(--primary\)"/);
    expect(src).toMatch(/color:\s*"var\(--primary-foreground\)"/);
    expect(src).toMatch(/\[color:inherit\]/);
    const other = src.match(/isOwnGuest\s*\?\s*(?:`[^`]*msg-mine[^`]*`|"msg-mine[^"]+")\s*:\s*(?:`([^`]+)`|"([^"]+)")/);
    const otherCls = other?.[1] ?? other?.[2];
    expect(otherCls).toMatch(/text-foreground\/90/);
    expect(otherCls).not.toMatch(/text-primary-foreground/);
    expect(src).toMatch(/rounded-tr-md bg-primary px-3 py-2 \$\{msgBodyClass\} font-medium text-primary-foreground/);
    expect(src).toMatch(/md:text-\[13\.5px\]/);
    expect(src).not.toMatch(/bg-primary\/90 px-3 py-2 text-xs font-medium text-primary-foreground/);
  });

  it("Admin chatrooms includes Guest Chat settings", () => {
    const src = readFileSync(resolve(srcRoot, "routes/admin.chatrooms.tsx"), "utf8");
    expect(src).toMatch(/Guest Chat/);
    expect(src).toMatch(/GUEST_CHAT_SETTING_KEY|guest_chat/);
  });

  it("guest lobby history merges by id instead of replacing client state", () => {
    const src = readFileSync(resolve(srcRoot, "lib/use-guest-lobby-feed.ts"), "utf8");
    expect(src).toMatch(/mergeGuestLobbyRows\(/);
    expect(src).not.toMatch(/if \(!cancelled\) setRows\(data\)/);
    expect(src).not.toMatch(/if \(!cancelled\) setRows\(\[\]\)/);
    expect(src).toMatch(/Keep whatever realtime/);
    expect(src).toMatch(/GUEST_LOBBY_ROW_EVENT/);
    expect(src).toContain("loadBrowserSupabase");
    expect(src).not.toMatch(/from "@\/integrations\/supabase\/client"/);
    expect(src).toMatch(/GUEST_LOBBY_MESSAGES_CHANNEL/);
    expect(src).toMatch(/realtimeSubscriberCount/);
    expect(src).toMatch(/retainGuestMessagesRealtime/);
    expect(src).toMatch(/openGuestMessagesChannel/);
    expect(src).toMatch(/messagesChannelOpening/);
    const onIdx = src.indexOf('.on(\n        "postgres_changes"');
    const subIdx = src.indexOf("ch.subscribe(", onIdx);
    expect(onIdx).toBeGreaterThan(-1);
    expect(subIdx).toBeGreaterThan(onIdx);
    expect(src).not.toMatch(/useEffect\(\(\) => \{[\s\S]*?\.channel\("guest-lobby-messages"\)[\s\S]*?\.subscribe\(\)/);
    const helpers = readFileSync(resolve(srcRoot, "lib/guest-lobby-feed.ts"), "utf8");
    expect(helpers).toMatch(/export function mergeGuestLobbyRows/);
    expect(helpers).toMatch(/yaarzo:guest-lobby-row/);
    const input = readFileSync(resolve(srcRoot, "components/chat/MessageInput.tsx"), "utf8");
    expect(input).toMatch(/publishGuestLobbyRow\(row\)/);
    expect(input).toMatch(/appendGuestOptimistic/);
    const list = readFileSync(resolve(srcRoot, "components/chat/MessageList.tsx"), "utf8");
    expect(list).toMatch(/resolveMessageAuthor/);
    expect(list).not.toMatch(/if \(!author\) return null/);
    const model = readFileSync(resolve(srcRoot, "lib/message-list-model.ts"), "utf8");
    expect(model).toMatch(/fallbackGuestAuthor/);
    const app = readFileSync(resolve(srcRoot, "components/chat/ChatApp.tsx"), "utf8");
    expect(app).toMatch(/channelId !== GUEST_LOBBY_CHANNEL_ID/);
    expect(app).toMatch(/useGuestLobbyFeed/);
  });
});

describe("guest lobby optimistic UI", () => {
  it("MessageInput appends locally before awaiting the server send", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/MessageInput.tsx"), "utf8");
    expect(src).toMatch(/appendGuestOptimistic/);
    expect(src).toMatch(/confirmGuestOptimistic/);
    expect(src).toMatch(/failGuestOptimistic/);
    const appendAt = src.indexOf("appendGuestOptimistic");
    const awaitAt = src.indexOf("await sendGuest");
    expect(appendAt).toBeGreaterThan(-1);
    expect(awaitAt).toBeGreaterThan(appendAt);
  });

  it("MessageList shows sending / retry for own pending messages", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/MessageList.tsx"), "utf8");
    expect(src).toMatch(/SendStatusBits/);
    expect(src).toMatch(/Couldn't send/);
    expect(src).toMatch(/retrySend/);
  });
});

function guestRow(partial: Partial<GuestLobbyRow> & Pick<GuestLobbyRow, "id" | "text">): GuestLobbyRow {
  return {
    channelId: "lobby",
    visitorId: "visitor_abc",
    displayName: "Guest-Test",
    createdAt: "2026-09-03T04:00:00.000Z",
    expiresAt: "2026-09-03T06:00:00.000Z",
    ...partial,
  };
}

describe("guest lobby feed merge", () => {
  const now = Date.parse("2026-09-03T04:30:00.000Z");

  it("keeps a realtime/post-send row that a stale history snapshot omitted", () => {
    const live = guestRow({
      id: "live-1",
      text: "guest-test-001",
      createdAt: "2026-09-03T04:20:00.000Z",
    });
    const staleHistory = [
      guestRow({
        id: "old-1",
        text: "hello",
        createdAt: "2026-09-03T04:00:00.000Z",
      }),
    ];
    const merged = mergeGuestLobbyRows([live], staleHistory, now);
    expect(merged.map((r) => r.id)).toEqual(["old-1", "live-1"]);
    expect(merged.find((r) => r.id === "live-1")?.text).toBe("guest-test-001");
  });

  it("does not duplicate the same id from history and realtime", () => {
    const row = guestRow({ id: "same-1", text: "hi" });
    const merged = mergeGuestLobbyRows([row], [row], now);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("same-1");
  });

  it("does not clear existing rows when incoming history is empty", () => {
    const live = guestRow({ id: "keep-me", text: "still here" });
    expect(mergeGuestLobbyRows([live], [], now).map((r) => r.id)).toEqual(["keep-me"]);
  });

  it("drops expired rows from both sides", () => {
    const expired = guestRow({
      id: "expired-1",
      text: "gone",
      expiresAt: "2026-09-03T04:10:00.000Z",
    });
    const live = guestRow({ id: "live-2", text: "ok" });
    const merged = mergeGuestLobbyRows([expired, live], [expired], now);
    expect(merged.map((r) => r.id)).toEqual(["live-2"]);
  });

  it("replaces a temp optimistic row when the confirmed server row arrives", () => {
    const opt = guestRow({
      id: "opt-abc",
      text: "hello now",
      sendStatus: "sending",
    });
    const real = guestRow({
      id: "real-abc",
      text: "hello now",
      createdAt: "2026-09-03T04:21:00.000Z",
    });
    const merged = mergeGuestLobbyRows([opt], [real], now);
    expect(merged.map((r) => r.id)).toEqual(["real-abc"]);
    expect(merged[0].sendStatus).toBeUndefined();
  });

  it("publish event name is stable for MessageInput → MessageList", () => {
    expect(GUEST_LOBBY_ROW_EVENT).toBe("yaarzo:guest-lobby-row");
  });

  it("fallback author still renders visitor messages without a user map entry", () => {
    const u = fallbackGuestAuthor("visitor_missing");
    expect(u.isGuest).toBe(true);
    expect(u.showGuestBadge).toBe(true);
    expect(u.name).toBe("Guest");
  });

  it("guest message ids are omitted from remote reply_to_id inserts", () => {
    expect(isGuestMessageId("guestmsg:abc-123")).toBe(true);
    expect(sanitizeRemoteReplyToId("guestmsg:abc-123")).toBeNull();
    expect(sanitizeRemoteReplyToId("550e8400-e29b-41d4-a716-446655440000")).toBe(
      "550e8400-e29b-41d4-a716-446655440000",
    );
  });

  it("groups consecutive messages from the same author", () => {
    const mk = (id: string, authorId: string, ts: number): Message => ({
      id,
      channelId: "lobby",
      authorId,
      text: id,
      ts,
      kind: "text",
    });
    const groups = groupChatMessages(
      [mk("a", "u1", 1), mk("b", "u1", 2), mk("c", "u2", 3)],
      () => false,
    );
    expect(groups.map((g) => g.map((m) => m.id))).toEqual([["a", "b"], ["c"]]);
  });

  it("MessageList uses instant scroll and lighter chat-msg-in animation", () => {
    const src = readFileSync(resolve(srcRoot, "components/chat/MessageList.tsx"), "utf8");
    expect(src).toMatch(/stickToBottomRef/);
    expect(src).toMatch(/isNearScrollBottom/);
    expect(src).toMatch(/scrollMessageListToBottom/);
    expect(src).not.toMatch(/behavior:\s*"smooth"/);
    expect(src).toMatch(/chat-msg-in/);
    const css = readFileSync(resolve(srcRoot, "components/chat/message-list.css"), "utf8");
    expect(css).toMatch(/chat-msg-in/);
    expect(css).not.toMatch(/blur/);
  });
});

describe("scroll bottom detection", () => {
  it("isNearScrollBottom returns true when within threshold", () => {
    const el = {
      scrollHeight: 1000,
      scrollTop: 880,
      clientHeight: 100,
    } as HTMLElement;
    expect(isNearScrollBottom(el, 120)).toBe(true);
    expect(isNearScrollBottom(el, 10)).toBe(false);
  });
});
