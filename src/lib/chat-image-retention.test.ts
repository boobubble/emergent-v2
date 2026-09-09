import { describe, it, expect } from "vitest";
import {
  CHAT_IMAGE_RETENTION_MS,
  buildChatImageStoragePath,
  dmChatImageExpiresAt,
  dmChannelPeerId,
  isChatImageExpired,
  isEphemeralChatImage,
  isLegacyInlineImage,
  isRegisteredDmChannel,
  publicChatImageExpiresAt,
  shouldScheduleDmImageExpiry,
  validateChatImageStoragePath,
} from "./chat-image-retention";
import type { Attachment } from "./chat-types";
import { cleanupExpiredChatImages, cleanupOrphanChatImages } from "./chat-image.functions";

const ASSET = "11111111-1111-4111-8111-111111111111";

function ephemeralAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    kind: "image",
    name: "photo.png",
    mime: "image/png",
    size: 1024,
    dataUrl: "",
    assetId: ASSET,
    ...overrides,
  };
}

describe("public chatroom image retention", () => {
  it("expires 24 hours after message creation", () => {
    const created = new Date("2026-01-01T12:00:00.000Z");
    const expires = publicChatImageExpiresAt(created);
    expect(new Date(expires).getTime() - created.getTime()).toBe(CHAT_IMAGE_RETENTION_MS);
  });

  it("marks expired images as unavailable", () => {
    const att = ephemeralAttachment({
      imageExpiresAt: new Date(Date.now() - 60_000).toISOString(),
    });
    expect(isChatImageExpired(att)).toBe(true);
  });

  it("detects ephemeral images by assetId", () => {
    expect(isEphemeralChatImage(ephemeralAttachment())).toBe(true);
  });
});

describe("registered DM image retention", () => {
  it("detects registered DM channels", () => {
    const a = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const b = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    expect(isRegisteredDmChannel(`dm:${a}:${b}`)).toBe(true);
    expect(isRegisteredDmChannel("lobby")).toBe(false);
  });

  it("does not expire before seen_at is recorded", () => {
    expect(isChatImageExpired(ephemeralAttachment())).toBe(false);
  });

  it("expires at seen_at + 24 hours", () => {
    const seenAt = "2026-01-01T12:00:00.000Z";
    const expires = dmChatImageExpiresAt(seenAt);
    expect(new Date(expires).getTime() - new Date(seenAt).getTime()).toBe(CHAT_IMAGE_RETENTION_MS);
  });

  const ALICE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const BOB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const CHANNEL = `dm:${ALICE}:${BOB}`;
  const SENT_AT = "2026-06-01T10:00:00.000Z";
  const READ_AT = "2026-06-01T11:00:00.000Z";

  it("TEST 1: sender reading own DM does not schedule sender image", () => {
    expect(dmChannelPeerId(CHANNEL, ALICE)).toBe(BOB);
    expect(shouldScheduleDmImageExpiry({
      channelId: CHANNEL,
      readerId: ALICE,
      messageAuthorId: ALICE,
      messageCreatedAt: SENT_AT,
      readAt: READ_AT,
    })).toBe(false);
  });

  it("TEST 2: recipient read schedules sender image at seenAt + 24h", () => {
    expect(shouldScheduleDmImageExpiry({
      channelId: CHANNEL,
      readerId: BOB,
      messageAuthorId: ALICE,
      messageCreatedAt: SENT_AT,
      readAt: READ_AT,
    })).toBe(true);
    expect(dmChatImageExpiresAt(READ_AT)).toBe(
      new Date(new Date(READ_AT).getTime() + CHAT_IMAGE_RETENTION_MS).toISOString(),
    );
  });

  it("TEST 3: later recipient read does not reschedule", () => {
    expect(shouldScheduleDmImageExpiry({
      channelId: CHANNEL,
      readerId: BOB,
      messageAuthorId: ALICE,
      messageCreatedAt: SENT_AT,
      readAt: "2026-06-02T12:00:00.000Z",
      imageSeenAt: READ_AT,
    })).toBe(false);
  });

  it("TEST 4: recipient reading peer-sent image schedules peer image", () => {
    expect(shouldScheduleDmImageExpiry({
      channelId: CHANNEL,
      readerId: ALICE,
      messageAuthorId: BOB,
      messageCreatedAt: SENT_AT,
      readAt: READ_AT,
    })).toBe(true);
  });

  it("TEST 5: reader never schedules their own sent image on self-read", () => {
    expect(shouldScheduleDmImageExpiry({
      channelId: CHANNEL,
      readerId: BOB,
      messageAuthorId: BOB,
      messageCreatedAt: SENT_AT,
      readAt: READ_AT,
    })).toBe(false);
  });

  it("unread DM image keeps image_expires_at unset until recipient read", () => {
    expect(isChatImageExpired(ephemeralAttachment())).toBe(false);
    expect(shouldScheduleDmImageExpiry({
      channelId: CHANNEL,
      readerId: BOB,
      messageAuthorId: ALICE,
      messageCreatedAt: SENT_AT,
      readAt: READ_AT,
      imageSeenAt: null,
    })).toBe(true);
  });
});

describe("storage path validation", () => {
  it("accepts scoped chat image paths", () => {
    const path = buildChatImageStoragePath("lobby", ASSET, "cat.png");
    expect(validateChatImageStoragePath(path)).toBe(true);
  });

  it("rejects arbitrary paths during cleanup", () => {
    expect(validateChatImageStoragePath("../secrets/file.png")).toBe(false);
  });
});

describe("legacy images", () => {
  it("legacy dataUrl images are not ephemeral", () => {
    const att: Attachment = {
      kind: "image",
      name: "old.png",
      mime: "image/png",
      size: 1,
      dataUrl: "data:image/png;base64,abc",
    };
    expect(isLegacyInlineImage(att)).toBe(true);
    expect(isEphemeralChatImage(att)).toBe(false);
  });
});

describe("cleanup helpers", () => {
  it("exports registry cleanup helpers", () => {
    expect(typeof cleanupExpiredChatImages).toBe("function");
    expect(typeof cleanupOrphanChatImages).toBe("function");
  });
});
