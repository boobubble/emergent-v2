import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { runCommand, GAMES_ONLY_CMDS } from "./commands";
import {
  BOT_EVENTS_TARGET_CHANNEL,
  GAME_BOT_IDS,
  GAMES_CHANNEL_ID,
  GAMES_ONLY_CMD_REJECTION,
  LOBBY_AUTO_REPLY_BOT_IDS,
  LOBBY_BOT_IDS,
  LOBBY_CHANNEL_ID,
  canGameBotAutoReply,
  canInsertGameBotMessage,
  commandReplyAuthor,
  isGameBotId,
  sanitizeRoomMembers,
  shouldHideGameBotMessage,
} from "./chat-bot-channels";
import { GUEST_LOBBY_CHANNEL_ID } from "./guest-chat-config";
import { isBotCommandOrAction } from "./guest-nickname";

const root = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

const minimalState = { games: {} };
const OTHER_CHANNELS = ["lobby", "pakistan-chat", "new-room-abc", "adm-test"] as const;

describe("central guard helpers", () => {
  it("identifies all game bot ids", () => {
    for (const id of GAME_BOT_IDS) {
      expect(isGameBotId(id)).toBe(true);
    }
    expect(isGameBotId("bot-spam")).toBe(false);
    expect(isGameBotId("bot-echo")).toBe(false);
  });

  describe("message insertion", () => {
    it("allows game bot messages in games", () => {
      for (const id of GAME_BOT_IDS) {
        expect(canInsertGameBotMessage(GAMES_CHANNEL_ID, id)).toBe(true);
      }
    });

    it("blocks game bot messages in lobby and other channels", () => {
      for (const ch of OTHER_CHANNELS) {
        for (const id of GAME_BOT_IDS) {
          expect(canInsertGameBotMessage(ch, id)).toBe(false);
        }
      }
    });

    it("allows game bot DMs", () => {
      expect(canInsertGameBotMessage("dm:bot-gamebot", "bot-gamebot")).toBe(true);
    });

    it("allows human messages everywhere", () => {
      expect(canInsertGameBotMessage("lobby", "me")).toBe(true);
    });
  });

  describe("historical message filter", () => {
    it("hides game bot messages outside games", () => {
      for (const ch of OTHER_CHANNELS) {
        expect(shouldHideGameBotMessage(ch, "bot-gamebot")).toBe(true);
        expect(shouldHideGameBotMessage(ch, "bot-fish")).toBe(true);
      }
    });

    it("shows game bot messages in games", () => {
      expect(shouldHideGameBotMessage(GAMES_CHANNEL_ID, "bot-gamebot")).toBe(false);
    });

    it("shows human and lobby bot messages in lobby", () => {
      expect(shouldHideGameBotMessage("lobby", "me")).toBe(false);
      expect(shouldHideGameBotMessage("lobby", "bot-echo")).toBe(false);
      expect(shouldHideGameBotMessage("lobby", "bot-spam")).toBe(false);
    });

    it("does not hide game bot DMs", () => {
      expect(shouldHideGameBotMessage("dm:bot-gamebot", "bot-gamebot")).toBe(false);
    });
  });

  describe("room membership", () => {
    it("strips game bots from non-games rooms", () => {
      const members = ["me", "bot-gamebot", "bot-fish", "bot-echo"];
      expect(sanitizeRoomMembers("lobby", members)).toEqual(["me", "bot-echo"]);
      expect(sanitizeRoomMembers("new-room", members)).toEqual(["me", "bot-echo"]);
    });

    it("preserves game bots in games", () => {
      const members = ["me", ...GAME_BOT_IDS];
      expect(sanitizeRoomMembers(GAMES_CHANNEL_ID, members)).toEqual(members);
    });
  });

  describe("auto-reply", () => {
    it("allows game bot auto-reply only in games", () => {
      expect(canGameBotAutoReply(GAMES_CHANNEL_ID, "bot-ryze")).toBe(true);
      expect(canGameBotAutoReply("lobby", "bot-ryze")).toBe(false);
      expect(canGameBotAutoReply("new-room", "bot-gamebot")).toBe(false);
    });
  });

  describe("command reply author", () => {
    it("redirects game bot author outside games", () => {
      expect(commandReplyAuthor(undefined, "lobby")).toBe("bot-echo");
      expect(commandReplyAuthor("bot-gamebot", "lobby")).toBe("bot-echo");
    });

    it("keeps game bot author in games", () => {
      expect(commandReplyAuthor(undefined, GAMES_CHANNEL_ID)).toBe("bot-gamebot");
    });
  });
});

describe("production regression — lobby game-bot messages", () => {
  it("lobby renders zero game-bot messages when historical events exist", () => {
    const lobbyMessages = [
      { id: "1", channelId: "lobby", authorId: "bot-gamebot", text: "Fish Event LIVE!", ts: 1 },
      { id: "2", channelId: "lobby", authorId: "bot-fish", text: "You caught a trout", ts: 2 },
      { id: "3", channelId: "lobby", authorId: "bot-echo", text: "hey welcome", ts: 3 },
      { id: "4", channelId: "lobby", authorId: "me", text: "hello", ts: 4 },
    ];
    const visible = lobbyMessages.filter((m) => !shouldHideGameBotMessage("lobby", m.authorId));
    expect(visible).toHaveLength(2);
    expect(visible.map((m) => m.authorId)).toEqual(["bot-echo", "me"]);
  });

  it("new fish event goes to games only, not lobby", () => {
    const eventText = "🐟 Fish Event is now LIVE!";
    expect(canInsertGameBotMessage(GAMES_CHANNEL_ID, "bot-gamebot")).toBe(true);
    expect(canInsertGameBotMessage(LOBBY_CHANNEL_ID, "bot-gamebot")).toBe(false);
    expect(BOT_EVENTS_TARGET_CHANNEL).toBe(GAMES_CHANNEL_ID);
    const notifier = read("lib/use-bot-events-notifier.ts");
    expect(notifier).toContain("chat.pushSystem(BOT_EVENTS_TARGET_CHANNEL, text)");
    expect(notifier).toContain(`chat.state.rooms[GAMES_CHANNEL_ID]`);
    expect(notifier).not.toMatch(/pushSystem\s*\(\s*channelId/);
    expect(eventText).toBeTruthy();
  });
});

describe("command gating — complete registry", () => {
  const allGameCmds = [...GAMES_ONLY_CMDS];

  it("includes every game command in GAMES_ONLY_CMDS", () => {
    const expected = [
      "roll", "flip", "slots", "fish", "dig", "wine",
      "trivia", "a", "hangman", "g",
      "ludo", "join", "lr", "stopludo", "endludo",
    ];
    for (const cmd of expected) {
      expect(GAMES_ONLY_CMDS.has(cmd)).toBe(true);
    }
    expect(allGameCmds.length).toBe(expected.length);
  });

  for (const cmd of allGameCmds) {
    it(`rejects !${cmd} in lobby`, () => {
      const result = runCommand(`!${cmd}`, { state: minimalState, channelId: LOBBY_CHANNEL_ID });
      expect(result.replies[0]?.text).toContain(GAMES_ONLY_CMD_REJECTION);
    });

    it(`rejects !${cmd} in arbitrary channel`, () => {
      const result = runCommand(`!${cmd}`, { state: minimalState, channelId: "pakistan-chat" });
      expect(result.replies[0]?.text).toContain(GAMES_ONLY_CMD_REJECTION);
    });
  }

  it("runs ludo in games", () => {
    const result = runCommand("!ludo", { state: minimalState, channelId: GAMES_CHANNEL_ID, actor: "Tester" });
    expect(result.replies[0]?.text).not.toContain(GAMES_ONLY_CMD_REJECTION);
  });
});

describe("chat-store room membership", () => {
  const chatStore = read("lib/chat-store.tsx");

  it("lobby has only social/moderation bots", () => {
    expect(chatStore).toContain('members: ["me", ...LOBBY_BOT_IDS]');
  });

  it("games has all game bots", () => {
    expect(chatStore).toContain('members: ["me", ...GAME_BOT_IDS]');
  });

  it("createRoom does not add game bots", () => {
    const block = chatStore.match(/const createRoom = useCallback\([\s\S]*?\n  \}, \[\]\);/);
    expect(block?.[0]).toBeTruthy();
    expect(block![0]).toContain('members: ["me"]');
    expect(block![0]).not.toContain("bot-gamebot");
  });

  it("ensureBots strips game bots from non-games rooms", () => {
    expect(chatStore).toContain("sanitizeRoomMembers");
  });

  it("syncAdminChannels does not seed all bots into new channels", () => {
    expect(chatStore).not.toMatch(/syncAdminChannels[\s\S]*SEED_BOTS\.map/);
  });

  it("lobby seed messages have no game bot authors", () => {
    const lobbySeed = chatStore.match(/messages\.lobby = \[([\s\S]*?)\];/);
    expect(lobbySeed?.[1]).toBeTruthy();
    const lobbyBlock = lobbySeed![1].split("rooms.games")[0];
    for (const id of GAME_BOT_IDS) {
      expect(lobbyBlock).not.toContain(`authorId: "${id}"`);
    }
  });
});

describe("chat-store guards", () => {
  const chatStore = read("lib/chat-store.tsx");

  it("uses central append guard for game bot messages", () => {
    expect(chatStore).toContain("canInsertGameBotMessage");
    expect(chatStore).toContain("appendChannelMessage");
  });

  it("filters visible messages via shouldHideGameBotMessage", () => {
    expect(chatStore).toContain("shouldHideGameBotMessage");
    expect(chatStore).toContain("filterVisibleMessages");
  });

  it("game bot auto-reply only in games", () => {
    expect(chatStore).toContain("room.id === GAMES_CHANNEL_ID");
    expect(chatStore).toContain("isGameBotId(id)");
  });

  it("event gate for fish/dig/wine only runs in games", () => {
    expect(chatStore).toContain("cdMatch && channelId === GAMES_CHANNEL_ID");
  });
});

describe("bot event notifications", () => {
  it("targets games channel constant", () => {
    expect(BOT_EVENTS_TARGET_CHANNEL).toBe("games");
  });

  it("notifier posts to games, not active channel", () => {
    const notifier = read("lib/use-bot-events-notifier.ts");
    expect(notifier).toContain("chat.pushSystem(BOT_EVENTS_TARGET_CHANNEL, text)");
    expect(notifier).not.toContain("chat.pushSystem(channelId, text)");
  });
});

describe("members panel", () => {
  it("hides game bots outside games even if in stale members", () => {
    const panel = read("components/chat/MembersPanel.tsx");
    expect(panel).toContain("isGameBotId(id) && roomId !== GAMES_CHANNEL_ID");
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

describe("lobby auto-reply bots unchanged", () => {
  it("lobby auto-replies limited to LOBBY_AUTO_REPLY_BOT_IDS", () => {
    expect(LOBBY_AUTO_REPLY_BOT_IDS.has("bot-echo")).toBe(true);
    for (const id of GAME_BOT_IDS) {
      expect(LOBBY_AUTO_REPLY_BOT_IDS.has(id)).toBe(false);
    }
  });
});
