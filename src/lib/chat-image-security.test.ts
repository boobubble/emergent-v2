import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  authorizeChatImageAssetAccess,
  canAnonymousResolveChatImage,
  classifyChatImageChannel,
  isDmChannelParticipant,
  isEphemeralAttachmentExpired,
  isRegistryAssetExpired,
  mirrorsMessagesSelectForImageAccess,
} from "./chat-image-access";
import {
  CHAT_IMAGE_ORPHAN_GRACE_MS,
  CHAT_IMAGE_RETENTION_MS,
  buildChatImageStoragePath,
  isChatImageExpired,
  isEphemeralChatImage,
  isLegacyInlineImage,
  publicChatImageExpiresAt,
  validateChatImageStoragePath,
} from "./chat-image-retention";
import type { Attachment } from "./chat-types";

const ME = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const STRANGER = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const COMMUNITY_ROOM = "11111111-1111-4111-8111-111111111111";
const ASSET = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const MSG = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

function mockMessagesSupabase(readable: boolean) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(
            readable ? { data: { id: MSG }, error: null } : { data: null, error: null },
          ),
        }),
      }),
    }),
  };
}

function assetFor(channelId: string, messageId: string | null = MSG) {
  return {
    id: ASSET,
    storage_path: buildChatImageStoragePath(channelId, ASSET, "x.png"),
    uploader_id: OTHER,
    channel_id: channelId,
    message_id: messageId,
    image_seen_at: null,
    image_expires_at: null,
    image_expired: false,
  };
}

describe("resolve authorization via messages RLS", () => {
  it("uses user-scoped supabase messages SELECT (not admin bypass)", () => {
    const fnSrc = readFileSync(resolve(process.cwd(), "src/lib/chat-image.functions.ts"), "utf8");
    const accessSrc = readFileSync(resolve(process.cwd(), "src/lib/chat-image-access.ts"), "utf8");
    expect(accessSrc).toMatch(/from\("messages"\)/);
    expect(accessSrc).toMatch(/authorizeChatImageAssetAccess/);
    expect(fnSrc).toMatch(/authorizeChatImageAssetAccess\(context\.supabase/);
    expect(fnSrc).not.toMatch(/canAuthenticatedUserAccessChatImageChannel/);
  });

  it("DM participant allowed when message is readable", async () => {
    const channelId = `dm:${ME}:${OTHER}`;
    const allowed = await authorizeChatImageAssetAccess(
      mockMessagesSupabase(true),
      ME,
      assetFor(channelId),
    );
    expect(allowed).toBe(true);
  });

  it("DM non-participant denied when message is not readable", async () => {
    const channelId = `dm:${ME}:${OTHER}`;
    const denied = await authorizeChatImageAssetAccess(
      mockMessagesSupabase(false),
      STRANGER,
      assetFor(channelId),
    );
    expect(denied).toBe(false);
    expect(isDmChannelParticipant(channelId, STRANGER)).toBe(false);
  });

  it("lobby authenticated user allowed when message is readable", async () => {
    const allowed = await authorizeChatImageAssetAccess(
      mockMessagesSupabase(true),
      ME,
      assetFor("lobby"),
    );
    expect(allowed).toBe(true);
    expect(mirrorsMessagesSelectForImageAccess({
      userId: ME,
      banned: false,
      channelId: "lobby",
    })).toBe(true);
  });

  it("anonymous user denied", () => {
    expect(canAnonymousResolveChatImage()).toBe(false);
    expect(mirrorsMessagesSelectForImageAccess({
      userId: null,
      banned: false,
      channelId: "lobby",
    })).toBe(false);
  });

  it("authorized community member allowed when message is readable", async () => {
    const allowed = await authorizeChatImageAssetAccess(
      mockMessagesSupabase(true),
      ME,
      assetFor(COMMUNITY_ROOM),
    );
    expect(allowed).toBe(true);
    expect(mirrorsMessagesSelectForImageAccess({
      userId: ME,
      banned: false,
      channelId: COMMUNITY_ROOM,
      communityReadAllowed: true,
    })).toBe(true);
  });

  it("unauthorized community user denied when message is not readable", async () => {
    const denied = await authorizeChatImageAssetAccess(
      mockMessagesSupabase(false),
      STRANGER,
      assetFor(COMMUNITY_ROOM),
    );
    expect(denied).toBe(false);
    expect(mirrorsMessagesSelectForImageAccess({
      userId: STRANGER,
      banned: false,
      channelId: COMMUNITY_ROOM,
      communityReadAllowed: false,
    })).toBe(false);
  });

  it("allows uploader to resolve orphan asset before message link", async () => {
    const orphan = assetFor("lobby", null);
    const uploaderOk = await authorizeChatImageAssetAccess(
      mockMessagesSupabase(false),
      OTHER,
      { ...orphan, uploader_id: OTHER },
    );
    expect(uploaderOk).toBe(true);

    const strangerDenied = await authorizeChatImageAssetAccess(
      mockMessagesSupabase(false),
      STRANGER,
      orphan,
    );
    expect(strangerDenied).toBe(false);
  });

  it("storagePath alone cannot authorize access", () => {
    const fnSrc = readFileSync(resolve(process.cwd(), "src/lib/chat-image.functions.ts"), "utf8");
    expect(fnSrc).toMatch(/assetId: z\.string\(\)\.uuid\(\)/);
    expect(fnSrc).not.toMatch(/storagePath: z\.string/);
    expect(fnSrc).not.toMatch(/imageExpiresAt: z\.string/);
    expect(fnSrc).not.toMatch(/imageExpired: z\.boolean/);
  });

  it("community authorization reuses is_community_chatroom_channel_allowed via messages RLS", () => {
    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/20260731143000_community_chatroom_messages_rls.sql"),
      "utf8",
    );
    expect(migration).toMatch(/is_community_chatroom_channel_allowed\(channel_id, auth\.uid\(\), false\)/);
    expect(classifyChatImageChannel(COMMUNITY_ROOM)).toBe("community");
  });
});

describe("registry expiry authority", () => {
  it("treats expired registry rows as expired regardless of client attachment", () => {
    expect(isRegistryAssetExpired({
      id: ASSET,
      storage_path: "public/lobby/x/y.png",
      uploader_id: ME,
      channel_id: "lobby",
      message_id: MSG,
      image_seen_at: null,
      image_expires_at: new Date(Date.now() - 1000).toISOString(),
      image_expired: false,
    })).toBe(true);
  });

  it("client mirror expiry uses attachment fields only for display", () => {
    const att: Attachment = {
      kind: "image",
      name: "a.png",
      mime: "image/png",
      size: 1,
      dataUrl: "",
      assetId: ASSET,
      imageExpiresAt: new Date(Date.now() - 1000).toISOString(),
    };
    expect(isChatImageExpired(att)).toBe(true);
    expect(isEphemeralAttachmentExpired(att)).toBe(true);
  });

  it("unread DM ephemeral attachment is not expired before seen_at", () => {
    const att: Attachment = {
      kind: "image",
      name: "a.png",
      mime: "image/png",
      size: 1,
      dataUrl: "",
      assetId: ASSET,
    };
    expect(isChatImageExpired(att)).toBe(false);
  });
});

describe("public retention uses message creation time", () => {
  it("expires at created_at + 24h not upload time", () => {
    const created = new Date("2026-06-01T10:00:00.000Z");
    const upload = new Date("2026-06-01T09:50:00.000Z");
    const fromMessage = publicChatImageExpiresAt(created);
    const fromUpload = publicChatImageExpiresAt(upload);
    expect(new Date(fromMessage).getTime() - created.getTime()).toBe(CHAT_IMAGE_RETENTION_MS);
    expect(fromMessage).not.toBe(fromUpload);
  });
});

describe("legacy compatibility", () => {
  it("dataUrl-only attachments remain legacy", () => {
    const att: Attachment = {
      kind: "image",
      name: "old.png",
      mime: "image/png",
      size: 1,
      dataUrl: "data:image/png;base64,abc",
    };
    expect(isLegacyInlineImage(att)).toBe(true);
    expect(isEphemeralChatImage(att)).toBe(false);
    expect(isChatImageExpired(att)).toBe(false);
  });
});

describe("cleanup safety", () => {
  it("cleanup reads only from chat_image_assets registry", () => {
    const src = readFileSync(resolve(process.cwd(), "src/lib/chat-image.functions.ts"), "utf8");
    expect(src).toMatch(/from\("chat_image_assets"\)/);
    expect(src).not.toMatch(/from\("messages"\)[\s\S]*storagePath/);
  });

  it("validates storage paths before deletion", () => {
    expect(validateChatImageStoragePath("../avatars/x.png")).toBe(false);
    expect(validateChatImageStoragePath("evil/uuid/file.png")).toBe(false);
    expect(validateChatImageStoragePath(
      buildChatImageStoragePath("lobby", ASSET, "ok.png"),
    )).toBe(true);
  });

  it("orphan cleanup uses registry grace period", () => {
    expect(CHAT_IMAGE_ORPHAN_GRACE_MS).toBeGreaterThanOrEqual(15 * 60 * 1000);
    const src = readFileSync(resolve(process.cwd(), "src/lib/chat-image.functions.ts"), "utf8");
    expect(src).toMatch(/cleanupOrphanChatImages/);
    expect(src).toMatch(/message_id", null/);
  });
});

describe("message insert hardening", () => {
  const migration = readFileSync(
    resolve(process.cwd(), "supabase/migrations/20260910130000_chat_image_assets_registry.sql"),
    "utf8",
  );

  it("rejects forged storagePath without assetId", () => {
    expect(migration).toMatch(/invalid_chat_image_attachment/);
    expect(migration).toMatch(/storagePath/);
    expect(migration).toMatch(/assetId/);
  });

  it("links asset with ownership and channel checks", () => {
    expect(migration).toMatch(/uploader_id <> NEW\.author_id/);
    expect(migration).toMatch(/channel_id <> NEW\.channel_id/);
    expect(migration).toMatch(/message_id IS NOT NULL/);
    expect(migration).toMatch(/FOR UPDATE/);
  });

  it("sets public expiry from message created_at", () => {
    expect(migration).toMatch(/NEW\.created_at \+ interval '24 hours'/);
  });

  it("DM read trigger schedules only peer-sent images on recipient read", () => {
    expect(migration).toMatch(/image_seen_at IS NULL/);
    expect(migration).toMatch(/peer_id/);
    expect(migration).toMatch(/m\.author_id = peer_id/);
    expect(migration).not.toMatch(/m\.author_id <> NEW\.user_id/);
  });
});

describe("lobby anon exposure", () => {
  it("upload does not persist signed URLs in attachment", () => {
    const src = readFileSync(resolve(process.cwd(), "src/lib/chat-image.functions.ts"), "utf8");
    const uploadBlock = src.slice(src.indexOf("export const uploadChatImage"), src.indexOf("export const resolveChatImageUrl"));
    expect(uploadBlock).toMatch(/dataUrl: ""/);
    expect(uploadBlock).not.toMatch(/signedUrlForPath/);
    expect(uploadBlock).not.toMatch(/createSignedUrl/);
  });
});

describe("UI wiring", () => {
  const inline = readFileSync(
    resolve(process.cwd(), "src/components/chat/InlineImageAttachment.tsx"),
    "utf8",
  );

  it("uses assetId resolver for ephemeral images", () => {
    expect(inline).toMatch(/assetId: a\.assetId/);
    expect(inline).not.toMatch(/storagePath/);
  });

  it("keeps native img, lightbox, and no contextmenu handler", () => {
    expect(inline).toMatch(/<img/);
    expect(inline).toMatch(/Escape/);
    expect(inline).toMatch(/Image expired/);
    expect(inline).not.toMatch(/onContextMenu/);
    expect(inline).not.toMatch(/preventDefault/);
  });
});
