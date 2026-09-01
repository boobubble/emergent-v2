import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { runCommand, GAMES_ONLY_CMDS } from "./commands";
import {
  BOT_EVENTS_TARGET_CHANNEL,
  GAME_BOT_IDS,
  GAMES_CHANNEL_ID,
  LOBBY_AUTO_REPLY_BOT_IDS,
  LOBBY_BOT_IDS,
  LOBBY_CHANNEL_ID,
} from "./chat-bot-channels";
import { GUEST_LOBBY_CHANNEL_ID } from "./guest-chat-config";
import { isBotCommandOrAction } from "./guest-nickname";

const root = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

const minimalState = { games: {} };

describe("command gating — fish/dig/wine", () => {
  for (const cmd of ["fish", "dig", "wine"] as const) {
    it(`blocks !${cmd} in lobby with redirect`, () => {
      const result = runCommand(`!${cmd}`, { state: minimalState, channelId: LOBBY_CHANNEL_ID });
      expect(result.replies[0]?.text).toContain("#games");
      expect(result.replies[0]?.text).toContain(`!${cmd}`);
    });

    it(`allows !${cmd} in games`, () => {
      const result = runCommand(`!${cmd}`, { state: minimalState, channelId: GAMES_CHANNEL_ID });
      expect(result.replies[0]?.text).not.toContain("can only be played");
      expect(result.replies.length).toBeGreaterThan(0);
    });
  }

  it("includes fish, dig, wine in GAMES_ONLY_CMDS", () => {
    expect(GAMES_ONLY_CMDS.has("fish")).toBe(true);
    expect(GAMES_ONLY_CMDS.has("dig")).toBe(true);
    expect(GAMES_ONLY_CMDS.has("wine")).toBe(true);
  });

  it("keeps existing games-only commands gated", () => {
    for (const cmd of ["ludo", "trivia", "hangman", "roll"]) {
      const result = runCommand(`!${cmd}`, { state: minimalState, channelId: LOBBY_CHANNEL_ID });
      expect(result.replies[0]?.text).toContain("#games");
    }
  });

  it("runs ludo in games", () => {
    const result = runCommand("!ludo", { state: minimalState, channelId: GAMES_CHANNEL_ID, actor: "Tester" });
    expect(result.replies[0]?.text).not.toContain("can only be played");
  });
});

describe("chat-store room membership", () => {
  const chatStore = read("lib/chat-store.tsx");

  it("lobby has only social/moderation bots", () => {
    expect(chatStore).toContain('members: ["me", ...LOBBY_BOT_IDS]');
    for (const id of LOBBY_BOT_IDS) {
      expect(chatStore).toContain(`"${id}"`);
    }
  });

  it("games has all game bots", () => {
    expect(chatStore).toContain('members: ["me", ...GAME_BOT_IDS]');
    for (const id of GAME_BOT_IDS) {
      expect(chatStore).toContain(`"${id}"`);
    }
  });

  it("lobby topic does not mention game commands", () => {
    expect(chatStore).toContain('topic: "Main hangout — chat, meet people, and hang out."');
  });

  it("lobby seed messages have no game bot authors", () => {
    const lobbySeed = chatStore.match(/messages\.lobby = \[([\s\S]*?)\];/);
    expect(lobbySeed?.[1]).toBeTruthy();
    const lobbyBlock = lobbySeed![1].split("rooms.games")[0];
    for (const id of GAME_BOT_IDS) {
      expect(lobbyBlock).not.toContain(`authorId: "${id}"`);
    }
    expect(lobbyBlock).toContain('authorId: "bot-echo"');
  });

  it("games retains game introduction seed messages", () => {
    expect(chatStore).toContain('channelId: "games", authorId: "bot-gamebot"');
    expect(chatStore).toContain('channelId: "games", authorId: "bot-ryze"');
  });
});

describe("chat-store auto-replies", () => {
  const chatStore = read("lib/chat-store.tsx");

  it("lobby auto-replies limited to LOBBY_AUTO_REPLY_BOT_IDS", () => {
    expect(chatStore).toContain("LOBBY_AUTO_REPLY_BOT_IDS.has(id)");
  });

  it("does not auto-reply with game bots in lobby", () => {
    expect(chatStore).toContain('if (room.id === GAMES_CHANNEL_ID)');
    expect(chatStore).toContain('else if (room.id === "lobby")');
    expect(LOBBY_AUTO_REPLY_BOT_IDS.has("bot-echo")).toBe(true);
    for (const id of GAME_BOT_IDS) {
      expect(LOBBY_AUTO_REPLY_BOT_IDS.has(id)).toBe(false);
    }
  });

  it("event gate for fish/dig/wine only runs in games", () => {
    expect(chatStore).toContain("cdMatch && channelId === GAMES_CHANNEL_ID");
  });
});

describe("bot event notifications", () => {
  it("targets games channel constant", () => {
    expect(BOT_EVENTS_TARGET_CHANNEL).toBe("games");
  });

  it("notifier posts to BOT_EVENTS_TARGET_CHANNEL not activeChannel", () => {
    const notifier = read("lib/use-bot-events-notifier.ts");
    expect(notifier).toContain("chat.pushSystem(BOT_EVENTS_TARGET_CHANNEL, text)");
    expect(notifier).not.toContain("chat.pushSystem(channelId, text)");
  });

  it("notifier still ignores DMs", () => {
    const notifier = read("lib/use-bot-events-notifier.ts");
    expect(notifier).toContain('activeChannel.startsWith("dm:")');
  });
});

describe("guest chat unchanged", () => {
  it("guest lobby channel remains lobby", () => {
    expect(GUEST_LOBBY_CHANNEL_ID).toBe("lobby");
  });

  it("guest commands remain blocked", () => {
    expect(isBotCommandOrAction("!fish")).toBe(true);
    expect(isBotCommandOrAction("!dig")).toBe(true);
    expect(isBotCommandOrAction("!wine")).toBe(true);
  });
});

describe("members panel room-scoped bots", () => {
  it("filters bots to room members", () => {
    const panel = read("components/chat/MembersPanel.tsx");
    expect(panel).toContain("isRoomBot");
    expect(panel).toContain("roomMemberSet.has(id)");
  });
});

describe("admin alignment", () => {
  it("game bots default to games room in admin.bots", () => {
    const admin = read("routes/admin.bots.tsx");
    expect(admin).toContain('rooms: id === "ai" ? "lobby" : "games"');
  });

  it("bot-events admin mentions games channel", () => {
    const admin = read("routes/admin.bot-events.tsx");
    expect(admin).toContain("#games channel");
  });
});
