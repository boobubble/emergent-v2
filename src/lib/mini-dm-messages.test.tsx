import { describe, it, expect, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { extraRemoteDmChannelsToFetch, miniDmChannelForPeer, resolveMiniDmPeer } from "./mini-dm";
import { maxDurationForChannel, VOICE_NOTES_DEFAULTS } from "./voice-notes-config";
import {
  filterChatMessages,
  resolveMessageAuthor,
  safeMessageText,
} from "./message-list-model";
import { dmChannelFor } from "./dm-utils";
import type { Message, User } from "./chat-types";

const ME = "550e8400-e29b-41d4-a716-446655440000";
const PEER = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const remotePeer: User = {
  id: PEER,
  name: "Ada",
  avatarColor: "oklch(0.7 0.15 255)",
  status: "offline",
  xp: 120,
  level: 3,
};

function dmMessage(overrides: Partial<Message> = {}): Message {
  const channelId = dmChannelFor(ME, PEER)!;
  return {
    id: "msg-1",
    channelId,
    authorId: PEER,
    text: "hello from history",
    ts: 1_700_000_000_000,
    kind: "text",
    ...overrides,
  };
}

describe("mini-DM peer resolution (remote profiles)", () => {
  it("resolves the peer from remote profiles when chat-store.users is empty", () => {
    const channelId = miniDmChannelForPeer(ME, PEER);
    expect(channelId).toBe(dmChannelFor(ME, PEER));
    const u = resolveMiniDmPeer(PEER, {}, { [PEER]: remotePeer }, channelId);
    expect(u?.id).toBe(PEER);
    expect(u?.name).toBe("Ada");
  });

  it("does not pass a malformed channel into history fetch", () => {
    expect(miniDmChannelForPeer(ME, "not-a-uuid")).toBeNull();
    expect(miniDmChannelForPeer(null, PEER)).toBeNull();
    expect(extraRemoteDmChannelsToFetch(ME, ["lobby", "dm:nope"])).toEqual([]);
  });
});

describe("mini-DM message-fetch path", () => {
  it("includes a watched remote-profile DM channel in history fetch", () => {
    const channelId = dmChannelFor(ME, PEER)!;
    expect(extraRemoteDmChannelsToFetch(ME, [channelId])).toEqual([channelId]);
    expect(extraRemoteDmChannelsToFetch(ME, [])).toEqual([]);
    // Opening a mini-DM must not require activeChannel to be that DM.
    expect(extraRemoteDmChannelsToFetch(ME, [channelId])).not.toContain("lobby");
  });

  it("voice notes are enabled for DM channel ids with the DM duration cap", () => {
    const channelId = dmChannelFor(ME, PEER)!;
    expect(VOICE_NOTES_DEFAULTS.enabled).toBe(true);
    expect(maxDurationForChannel(channelId, VOICE_NOTES_DEFAULTS)).toBe(VOICE_NOTES_DEFAULTS.max_dm);
    expect(maxDurationForChannel("lobby", VOICE_NOTES_DEFAULTS)).toBe(VOICE_NOTES_DEFAULTS.max_lobby);
  });
});

describe("message list with remote-profile authors", () => {
  it("does not throw when filtering rows with missing authorId", () => {
    const broken = dmMessage({ authorId: null as unknown as string, text: null as unknown as string });
    expect(() => filterChatMessages([broken], {}, () => false)).not.toThrow();
    expect(filterChatMessages([broken], {}, () => false)).toHaveLength(1);
  });

  it("renders a DM author that exists only on the remote-profile map", () => {
    const usersById: Record<string, User | undefined> = { [PEER]: remotePeer };
    const author = resolveMessageAuthor(usersById, PEER);
    expect(author.name).toBe("Ada");
    expect(author.id.startsWith("visitor_")).toBe(false);
    const msgs = filterChatMessages([dmMessage()], usersById, () => false);
    expect(msgs).toHaveLength(1);
    expect(safeMessageText(null)).toBe("");
  });

  it("falls back when the store user is missing an id (would throw on startsWith)", () => {
    const incomplete = { name: "Ghost", avatarColor: "", status: "offline" as const, xp: 0, level: 1 };
    const author = resolveMessageAuthor(
      { [PEER]: incomplete as unknown as User },
      PEER,
    );
    expect(author.id).toBe(PEER);
    expect(() => author.id.startsWith("visitor_")).not.toThrow();
  });
});

const mockProfiles: Record<string, User> = { [PEER]: remotePeer };
const mockChannelId = dmChannelFor(ME, PEER)!;
const mockMessages: Message[] = [
  dmMessage({ id: "hist-1", text: "loaded from fetch" }),
  dmMessage({ id: "hist-2", authorId: "me", text: "my reply" }),
];

vi.mock("@/lib/chat-store", () => ({
  useChat: () => ({
    channelMessages: (id: string) => (id === mockChannelId ? mockMessages : []),
    state: {
      users: { me: { id: "me", name: "Me", avatarColor: "", status: "online", xp: 0, level: 1 } },
      activeChannel: "lobby",
    },
    setReplyingTo: () => {},
    findMessage: () => undefined,
    isDM: (id: string) => typeof id === "string" && id.startsWith("dm:"),
    dmPeerReadAt: () => 0,
    replyingTo: null,
  }),
}));

vi.mock("@/lib/use-guest-lobby-feed", () => ({
  useGuestLobbyFeed: () => ({ messages: [], users: {} }),
}));

vi.mock("@/lib/dm-url-mask", () => ({
  useDmUrlMask: () => (text: string) => text,
}));

vi.mock("@/lib/use-remote-profiles", () => ({
  useRemoteProfiles: () => ({ profiles: mockProfiles, loading: false }),
}));

vi.mock("@/components/chat/UserMenu", () => ({
  UserMenu: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/chat/StaffActionsMenu", () => ({
  StaffActionsMenu: () => null,
}));

vi.mock("@/components/chat/HighlightButton", () => ({
  HighlightButton: () => null,
}));

vi.mock("@/components/chat/MediaEmbed", () => ({
  MediaEmbed: () => null,
}));

vi.mock("@/components/chat/EmojiEffectLayer", () => ({
  EmojiEffectLayer: () => null,
}));

vi.mock("@/components/cosmetics/CosmeticBits", () => ({
  FrameAvatar: () => createElement("span", { "data-testid": "avatar" }),
  CosmeticName: ({ name }: { name: string }) => createElement("span", null, name),
  RankChip: () => null,
}));

describe("MessageList render with remote-profile peer + fetched DM history", () => {
  it("shows loaded messages instead of the ChatErrorBoundary fallback", async () => {
    const { MessageList } = await import("@/components/chat/MessageList");
    const html = renderToStaticMarkup(createElement(MessageList, { channelId: mockChannelId }));
    expect(html).toContain("loaded from fetch");
    expect(html).toContain("my reply");
    expect(html).toContain("Ada");
    expect(html).not.toContain("Chat unavailable");
    expect(html).not.toContain("Something went wrong loading messages");
  });
});
