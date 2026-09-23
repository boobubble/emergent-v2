import { describe, expect, it } from "vitest";
import { YAARZO_GLOBAL_ROOM_ID } from "@/lib/auth-entry";
import { GAMES_CHANNEL_ID } from "@/lib/chat-bot-channels";
import {
  DM_MESSAGES_INSERT_FILTER,
  buildFilteredMessageInsertBindings,
  channelIdEqFilter,
  shouldActivateFilteredMessagesFallback,
} from "./chat-realtime-subscriptions";

const ME = "550e8400-e29b-41d4-a716-446655440000";
const COMMUNITY = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const DM_CH = `dm:${[ME, COMMUNITY].sort().join(":")}`;

function isRemote(channelId: string, meId: string | null): boolean {
  if (!meId) return channelId === YAARZO_GLOBAL_ROOM_ID;
  if (channelId === GAMES_CHANNEL_ID || channelId === YAARZO_GLOBAL_ROOM_ID) return true;
  if (channelId.startsWith("dm:")) return channelId.includes(meId);
  return /^[0-9a-f-]{36}$/i.test(channelId);
}

describe("buildFilteredMessageInsertBindings", () => {
  it("guest receives only yaarzo-global", () => {
    const bindings = buildFilteredMessageInsertBindings({
      authUserId: null,
      activeChannel: YAARZO_GLOBAL_ROOM_ID,
      isRemoteChannel: isRemote,
    });
    expect(bindings).toHaveLength(1);
    expect(bindings[0].filter).toBe(channelIdEqFilter(YAARZO_GLOBAL_ROOM_ID));
  });

  it("authenticated user always includes registry slugs and dm prefix", () => {
    const bindings = buildFilteredMessageInsertBindings({
      authUserId: ME,
      activeChannel: DM_CH,
      isRemoteChannel: isRemote,
    });
    expect(bindings.map((b) => b.id)).toEqual([
      `public-${YAARZO_GLOBAL_ROOM_ID}`,
      `public-${GAMES_CHANNEL_ID}`,
      "dm-prefix",
    ]);
    expect(bindings[2].filter).toBe(DM_MESSAGES_INSERT_FILTER);
    expect(bindings).toHaveLength(3);
  });

  it("uses explicit platformChannelSlugs for admin-created channels", () => {
    const bindings = buildFilteredMessageInsertBindings({
      authUserId: ME,
      activeChannel: "music",
      isRemoteChannel: isRemote,
      platformChannelSlugs: [YAARZO_GLOBAL_ROOM_ID, GAMES_CHANNEL_ID, "music"],
    });
    expect(bindings.map((b) => b.id)).toContain("public-music");
    expect(bindings.find((b) => b.id === "public-active:music")).toBeUndefined();
  });

  it("adds active public/community channel when not global/games/dm", () => {
    const bindings = buildFilteredMessageInsertBindings({
      authUserId: ME,
      activeChannel: COMMUNITY,
      isRemoteChannel: isRemote,
    });
    expect(bindings.map((b) => b.id)).toContain(`public-active:${COMMUNITY}`);
    expect(bindings).toHaveLength(4);
  });

  it("does not grow with dmOrder size", () => {
    const bindings = buildFilteredMessageInsertBindings({
      authUserId: ME,
      activeChannel: YAARZO_GLOBAL_ROOM_ID,
      isRemoteChannel: isRemote,
    });
    expect(bindings.filter((b) => b.id.startsWith("dm")).length).toBe(1);
    expect(bindings).toHaveLength(3);
  });
});

describe("shouldActivateFilteredMessagesFallback", () => {
  const active = { cancelled: false, fallbackActivated: false };

  it("activates on CHANNEL_ERROR, TIMED_OUT, and CLOSED", () => {
    expect(shouldActivateFilteredMessagesFallback("CHANNEL_ERROR", active)).toBe(true);
    expect(shouldActivateFilteredMessagesFallback("TIMED_OUT", active)).toBe(true);
    expect(shouldActivateFilteredMessagesFallback("CLOSED", active)).toBe(true);
  });

  it("does not activate on SUBSCRIBED or benign statuses", () => {
    expect(shouldActivateFilteredMessagesFallback("SUBSCRIBED", active)).toBe(false);
    expect(shouldActivateFilteredMessagesFallback("JOINING", active)).toBe(false);
  });

  it("activates at most once per lifecycle", () => {
    expect(shouldActivateFilteredMessagesFallback("CHANNEL_ERROR", { ...active, fallbackActivated: true })).toBe(false);
    expect(shouldActivateFilteredMessagesFallback("CLOSED", { ...active, fallbackActivated: true })).toBe(false);
  });

  it("does not activate after effect cleanup", () => {
    expect(shouldActivateFilteredMessagesFallback("CHANNEL_ERROR", { ...active, cancelled: true })).toBe(false);
    expect(shouldActivateFilteredMessagesFallback("CLOSED", { ...active, cancelled: true })).toBe(false);
  });
});
