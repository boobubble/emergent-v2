import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  botMentionAck,
  canMentionedBotReply,
  echoMentionReply,
  findMentionedRoomBot,
  SYSTEM_PRESENCE_AUTHOR,
  textMentionsName,
} from "./chat-bot-triggers";
import {
  formatPresenceLineText,
  isPresenceSystemMessage,
  isRealPresenceUserId,
  PRESENCE_UI_CHAT_STREAM_ONLY,
  shouldShowPresencePopup,
} from "./presence-ui";
import { GAMES_CHANNEL_ID, LOBBY_CHANNEL_ID, isGameBotId } from "./chat-bot-channels";

const root = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

const users = {
  me: { id: "me", name: "Tester", isBot: false, avatarColor: "", status: "online" as const, xp: 0, level: 1 },
  "bot-echo": { id: "bot-echo", name: "Echo", isBot: true, avatarColor: "", status: "online" as const, xp: 0, level: 1 },
  "bot-spam": { id: "bot-spam", name: "SpamBot", isBot: true, avatarColor: "", status: "online" as const, xp: 0, level: 1 },
  "bot-gamebot": { id: "bot-gamebot", name: "GameBot", isBot: true, avatarColor: "", status: "online" as const, xp: 0, level: 1 },
};

describe("chat-bot-triggers", () => {
  it("detects @Echo mention", () => {
    expect(textMentionsName("@Echo hello", "Echo")).toBe(true);
    expect(textMentionsName("hello everyone", "Echo")).toBe(false);
  });

  it("findMentionedRoomBot returns at most one bot", () => {
    const members = ["me", "bot-echo", "bot-spam"];
    expect(findMentionedRoomBot("@Echo hi", users, members)).toBe("bot-echo");
    expect(findMentionedRoomBot("hello", users, members)).toBeNull();
  });

  it("blocks game bot mention replies outside games", () => {
    expect(canMentionedBotReply("bot-gamebot", LOBBY_CHANNEL_ID)).toBe(false);
    expect(canMentionedBotReply("bot-gamebot", GAMES_CHANNEL_ID)).toBe(true);
    expect(canMentionedBotReply("bot-echo", LOBBY_CHANNEL_ID)).toBe(true);
  });

  it("echoMentionReply responds to @Echo only when triggered", () => {
    expect(echoMentionReply("@Echo hello", "Echo")).toContain("Hey");
    expect(botMentionAck("GameBot")).toContain("GameBot");
  });
});

describe("no unsolicited auto-reply — source guards", () => {
  const chatStore = read("lib/chat-store.tsx");

  it("removed random Math.random bot auto-reply", () => {
    expect(chatStore).not.toMatch(/Math\.random\(\)\s*>\s*0\.4/);
    expect(chatStore).not.toContain("LOBBY_AUTO_REPLY_BOT_IDS.has");
  });

  it("uses explicit mention trigger via findMentionedRoomBot", () => {
    expect(chatStore).toContain("findMentionedRoomBot");
    expect(chatStore).toContain("canMentionedBotReply");
  });

  it("ai chatbot only called when text contains @mention", () => {
    expect(chatStore).toMatch(/\/@\\w\/\.test\(out\.text\)/);
  });
});

describe("production regression — quiet lobby", () => {
  it("normal messages do not match any bot trigger", () => {
    const members = ["me", "bot-echo", "bot-spam"];
    for (const text of ["hello", "how are you", "ok", "good morning", "lol"]) {
      expect(findMentionedRoomBot(text, users, members)).toBeNull();
    }
  });

  it("@Echo hello triggers Echo only", () => {
    const members = ["me", "bot-echo", "bot-spam"];
    expect(findMentionedRoomBot("@Echo hello", users, members)).toBe("bot-echo");
  });

  it("second normal message still has no trigger", () => {
    const members = ["me", "bot-echo"];
    expect(findMentionedRoomBot("ok", users, members)).toBeNull();
  });
});

describe("presence popup suppression — 8 regression cases", () => {
  const pf = () => read("components/chat/PresenceFeed.tsx");
  const store = () => read("lib/chat-store.tsx");

  it("1. user joins room → system line exists", () => {
    expect(formatPresenceLineText("join", "Arman")).toBe("Arman joined the room");
    expect(store()).toContain("authorId: SYSTEM_PRESENCE_AUTHOR");
    expect(store()).toContain('kind: "system"');
    expect(isPresenceSystemMessage(SYSTEM_PRESENCE_AUTHOR, "system")).toBe(true);
  });

  it("2. user joins room → no toast/popup", () => {
    expect(shouldShowPresencePopup()).toBe(false);
    expect(PRESENCE_UI_CHAT_STREAM_ONLY).toBe(true);
    expect(pf()).not.toContain("toast(");
    expect(pf()).not.toContain("sonner");
    expect(pf()).not.toContain("presence-msg");
    expect(pf()).not.toContain("has joined the room");
    expect(pf()).toContain("return null");
  });

  it("3. user leaves room → system line exists", () => {
    expect(formatPresenceLineText("leave", "Arman")).toBe("Arman left the room");
    expect(store()).toContain("formatPresenceLineText");
    expect(isPresenceSystemMessage(SYSTEM_PRESENCE_AUTHOR, "system")).toBe(true);
  });

  it("4. user leaves room → no toast/popup", () => {
    expect(shouldShowPresencePopup()).toBe(false);
    expect(pf()).not.toContain("has left the room");
    expect(pf()).not.toContain("setEvents");
    expect(store()).not.toMatch(/pushPresenceEvent[\s\S]*toast\(/);
  });

  it("5. Lobby presence does not appear in Games", () => {
    expect(pf()).toContain("room-presence:${channelId}");
    expect(pf()).toContain("pushRef.current(channelId");
    expect(store()).toContain("appendChannelMessage(s.messages, channelId");
  });

  it("6. Games presence does not appear in Lobby", () => {
    // Same room-scoped channelId guard — each PresenceFeed instance only writes to its channel.
    expect(pf()).not.toContain("lobby");
    expect(pf()).not.toContain("games");
    expect(pf()).toMatch(/pushRef\.current\(channelId/);
  });

  it("7. bot join/leave does not create presence system line", () => {
    expect(isRealPresenceUserId("bot-echo")).toBe(false);
    expect(isRealPresenceUserId("bot-gamebot")).toBe(false);
    expect(pf()).toContain("isRealPresenceUserId(uid)");
    expect(pf()).toContain("if (!isRealPresenceUserId(uid)) return");
  });

  it("8. bot join/leave does not create toast/popup", () => {
    expect(shouldShowPresencePopup()).toBe(false);
    expect(pf()).not.toContain("presence-msg");
    expect(pf()).not.toContain("absolute inset-x-0 bottom-1");
  });

  it("MessageList uses compact presence line renderer", () => {
    expect(read("components/chat/MessageList.tsx")).toContain("PresenceSystemLine");
  });
});

describe("game isolation unchanged", () => {
  it("game bots still blocked outside games", () => {
    for (const id of ["bot-gamebot", "bot-fish", "bot-dig"]) {
      expect(isGameBotId(id)).toBe(true);
    }
  });
});

describe("ai chatbot mention-only server guard", () => {
  it("requires @mention before replying", () => {
    const src = read("lib/ai-chatbots.functions.ts");
    expect(src).toContain("no-mention");
    expect(src).not.toMatch(/Math\.random\(\)\s*>\s*Number\(bot\.reply_chance\)/);
  });
});
