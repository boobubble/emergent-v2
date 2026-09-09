import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const moderationSrc = readFileSync(resolve(process.cwd(), "src/lib/moderation.functions.ts"), "utf8");
const staffMenuSrc = readFileSync(resolve(process.cwd(), "src/components/chat/StaffActionsMenu.tsx"), "utf8");
const messageInputSrc = readFileSync(resolve(process.cwd(), "src/components/chat/MessageInput.tsx"), "utf8");
const guestFeedSrc = readFileSync(resolve(process.cwd(), "src/lib/use-guest-lobby-feed.ts"), "utf8");
const messageListSrc = readFileSync(resolve(process.cwd(), "src/components/chat/MessageList.tsx"), "utf8");

describe("moderator single-message delete", () => {
  it("server delete uses channel-scoped assertCanDeleteMessage", () => {
    expect(moderationSrc).toMatch(/assertCanDeleteMessage/);
    expect(moderationSrc).toMatch(/await assertCanDeleteMessage\(context\.userId, channelId\)/);
  });

  it("supports guest message delete via deleteGuestMessageMod", () => {
    expect(moderationSrc).toMatch(/deleteGuestMessageMod/);
    expect(moderationSrc).toMatch(/guest_chat_messages/);
  });

  it("StaffActionsMenu exposes Delete and handles guestmsg ids", () => {
    expect(staffMenuSrc).toMatch(/Delete this message/);
    expect(staffMenuSrc).toMatch(/deleteGuestMessageMod/);
    expect(staffMenuSrc).toMatch(/isGuestMessageId/);
    expect(staffMenuSrc).toMatch(/canDelete = isAdmin \|\| isModerator \|\| roomPerms\.can_delete/);
  });

  it("guest messages in MessageList include StaffActionsMenu", () => {
    expect(messageListSrc).toMatch(/isEphemeralGuest[\s\S]*StaffActionsMenu/);
  });

  it("chat-store removes deleted messages locally and listens for DELETE realtime", () => {
    const chatStore = readFileSync(resolve(process.cwd(), "src/lib/chat-store.tsx"), "utf8");
    expect(chatStore).toMatch(/removeMessage/);
    expect(chatStore).toMatch(/event: "DELETE", schema: "public", table: "messages"/);
  });
});

describe("/clear guest message handling", () => {
  it("clearChannelMessages deletes guest_chat_messages for lobby", () => {
    expect(moderationSrc).toMatch(/GUEST_LOBBY_CHANNEL_ID/);
    expect(moderationSrc).toMatch(/guest_chat_messages[\s\S]*delete/);
  });

  it("MessageInput clears guest lobby shared rows after /clear", () => {
    expect(messageInputSrc).toMatch(/clearGuestLobbyRows/);
    expect(messageInputSrc).toMatch(/guestDeleted/);
  });

  it("guest feed subscribes to DELETE realtime and can clear rows", () => {
    expect(guestFeedSrc).toMatch(/event: "DELETE", schema: "public", table: "guest_chat_messages"/);
    expect(guestFeedSrc).toMatch(/clearGuestLobbyRows/);
    expect(guestFeedSrc).toMatch(/removeGuestLobbyRow/);
  });
});

describe("room moderator permissions", () => {
  it("useChannelModeration reads room_moderators can_delete", () => {
    const hook = readFileSync(resolve(process.cwd(), "src/lib/use-channel-moderation.ts"), "utf8");
    expect(hook).toMatch(/room_moderators/);
    expect(hook).toMatch(/can_delete/);
  });
});
