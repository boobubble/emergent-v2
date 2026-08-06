import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDmChannel,
  dmChannelFor,
  fixLegacyDmChannel,
  isLocalBotDmChannel,
  isRemoteDmChannel,
  isUuid,
  parseDmChannel,
  sanitizeActiveChannel,
  sanitizeChatState,
  sanitizeDmOrder,
} from "./dm-utils";
import { markDmConversationRead } from "./dm-read";

const testDir = dirname(fileURLToPath(import.meta.url));

const ME = "550e8400-e29b-41d4-a716-446655440000";
const PEER = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const SORTED = [ME, PEER].sort();
const VALID_CHANNEL = `dm:${SORTED[0]}:${SORTED[1]}`;

describe("isUuid", () => {
  it("accepts valid v4 UUIDs", () => {
    expect(isUuid(ME)).toBe(true);
  });
  it("rejects UI ids", () => {
    expect(isUuid("me")).toBe(false);
    expect(isUuid("bot-gamebot")).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
});

describe("buildDmChannel", () => {
  it("builds sorted two-uuid channel", () => {
    expect(buildDmChannel(ME, PEER)).toBe(VALID_CHANNEL);
    expect(buildDmChannel(PEER, ME)).toBe(VALID_CHANNEL);
  });
  it("rejects invalid participants", () => {
    expect(buildDmChannel("me", PEER)).toBeNull();
    expect(buildDmChannel(ME, "bot-nova")).toBeNull();
    expect(buildDmChannel(ME, ME)).toBeNull();
  });
});

describe("dmChannelFor", () => {
  it("returns local bot channel for bots", () => {
    expect(dmChannelFor(ME, "bot-gamebot")).toBe("dm:bot-gamebot");
  });
  it("returns uuid channel for real users", () => {
    expect(dmChannelFor(ME, PEER)).toBe(VALID_CHANNEL);
  });
  it("returns null when auth or peer is invalid", () => {
    expect(dmChannelFor(null, PEER)).toBeNull();
    expect(dmChannelFor("me", PEER)).toBeNull();
    expect(dmChannelFor(ME, "me")).toBeNull();
  });
});

describe("isRemoteDmChannel", () => {
  it("accepts valid remote channels", () => {
    expect(isRemoteDmChannel(VALID_CHANNEL, ME)).toBe(true);
  });
  it("rejects bot and malformed channels", () => {
    expect(isRemoteDmChannel("dm:bot-gamebot", ME)).toBe(false);
    expect(isRemoteDmChannel(`dm:me:${PEER}`, ME)).toBe(false);
    expect(isRemoteDmChannel(`dm:${PEER}`, ME)).toBe(false);
  });
});

describe("parseDmChannel", () => {
  it("extracts peer from valid channel", () => {
    expect(parseDmChannel(VALID_CHANNEL, ME)).toEqual({ peerId: PEER, valid: true });
  });
  it("handles bot channels", () => {
    expect(parseDmChannel("dm:bot-nova", ME)).toEqual({ peerId: "bot-nova", valid: true });
  });
});

describe("fixLegacyDmChannel", () => {
  it("rewrites dm:me:uuid", () => {
    expect(fixLegacyDmChannel(`dm:me:${PEER}`, ME)).toBe(VALID_CHANNEL);
  });
  it("rewrites single-peer dm:uuid", () => {
    expect(fixLegacyDmChannel(`dm:${PEER}`, ME)).toBe(VALID_CHANNEL);
  });
});

describe("sanitizeDmOrder", () => {
  it("keeps uuid peers and local bots, drops me", () => {
    const order = sanitizeDmOrder(["bot-gamebot", "me", PEER, PEER, "bot-nova"], ME);
    expect(order).toEqual(["bot-gamebot", PEER, "bot-nova"]);
  });
  it("drops non-uuid garbage", () => {
    expect(sanitizeDmOrder(["undefined", "username-slug"], ME)).toEqual([]);
  });
});

describe("sanitizeActiveChannel", () => {
  const rooms = { lobby: {}, games: {} };
  const roomOrder = ["lobby", "games"];

  it("preserves lobby and valid dm", () => {
    expect(sanitizeActiveChannel("lobby", ME, roomOrder, rooms)).toBe("lobby");
    expect(sanitizeActiveChannel(VALID_CHANNEL, ME, roomOrder, rooms)).toBe(VALID_CHANNEL);
  });
  it("preserves local bot dm", () => {
    expect(sanitizeActiveChannel("dm:bot-gamebot", ME, roomOrder, rooms)).toBe("dm:bot-gamebot");
  });
  it("resets corrupted activeChannel", () => {
    expect(sanitizeActiveChannel(`dm:me:${PEER}`, ME, roomOrder, rooms)).toBe(VALID_CHANNEL);
    expect(sanitizeActiveChannel("dm:bot-gamebot:garbage", ME, roomOrder, rooms)).toBe("lobby");
  });
});

describe("sanitizeChatState", () => {
  it("self-heals malformed persisted state", () => {
    const raw = {
      activeChannel: `dm:me:${PEER}`,
      dmOrder: ["bot-gamebot", "me", PEER],
      roomOrder: ["lobby"],
      rooms: { lobby: {} },
    };
    const next = sanitizeChatState(raw, ME);
    expect(next.activeChannel).toBe(VALID_CHANNEL);
    expect(next.dmOrder).toEqual(["bot-gamebot", PEER]);
  });
});

describe("refresh after DM scenarios", () => {
  it("malformed dmOrder does not produce remote channels", () => {
    for (const peer of ["me", "bot-gamebot", "", "not-a-uuid"]) {
      expect(isRemoteDmChannel(dmChannelFor(ME, peer) ?? "", ME)).toBe(false);
    }
  });
});

describe("markDmConversationRead validation", () => {
  it("returns null for invalid user or channel before any DB write", async () => {
    expect(await markDmConversationRead("me", VALID_CHANNEL)).toBeNull();
    expect(await markDmConversationRead(ME, "dm:bot-gamebot")).toBeNull();
  });
});

describe("post-signup profile popup wiring", () => {
  it("does not mount CompleteProfileModal in authenticated root layout", () => {
    const root = readFileSync(resolve(testDir, "../routes/__root.tsx"), "utf8");
    expect(root).not.toMatch(/<CompleteProfileModal\s*\/>/);
    expect(root).not.toMatch(/import\s+\{\s*CompleteProfileModal\s*\}/);
  });
});

describe("profile edit access preserved", () => {
  it("keeps CompleteProfileModal component with bio/interests fields", () => {
    const modal = readFileSync(resolve(testDir, "../components/auth/CompleteProfileModal.tsx"), "utf8");
    expect(modal).toContain("profile_completed");
    expect(modal).toContain("aboutMe");
    expect(modal).toContain("interestsText");
  });
});
