import { describe, expect, it } from "vitest";
import { authorizeIrcChatAttachmentAccess } from "./irc-attachment-access";
import {
  createAttachmentToken,
  isAttachmentOnlyMessageText,
  parseAttachmentToken,
  resolveAttachmentIdForMessage,
  sanitizeClientFileName,
  validateClientAttachmentFile,
} from "./irc-attachment";
import { buildIrcMessageReplyPreview } from "./reply";
import { buildPublicSendFrame, parseOptionalMessageContentMeta } from "./protocol";
import type { ChatImageAssetRecord } from "@/lib/chat-image-access";

const ASSET = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function ircAsset(channel = "irc:yaarzo-global"): ChatImageAssetRecord {
  return {
    id: ASSET,
    storage_path: `irc/yaarzo-global/${ASSET}/photo.png`,
    uploader_id: USER,
    channel_id: channel,
    message_id: null,
    image_seen_at: null,
    image_expires_at: null,
    image_expired: false,
  };
}

describe("irc attachment client validation", () => {
  it("accepts valid jpeg image", () => {
    const file = new File([new Uint8Array(8)], "a.jpg", { type: "image/jpeg" });
    const result = validateClientAttachmentFile(file);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.contentType).toBe("image");
  });

  it("rejects unsupported executable type", () => {
    const file = new File([new Uint8Array(8)], "bad.exe", {
      type: "application/x-msdownload",
    });
    const result = validateClientAttachmentFile(file);
    expect(result.ok).toBe(false);
  });

  it("rejects oversized files", () => {
    const file = new File([new Uint8Array(3 * 1024 * 1024)], "big.png", {
      type: "image/png",
    });
    const result = validateClientAttachmentFile(file);
    expect(result.ok).toBe(false);
  });

  it("sanitizes displayed filename", () => {
    expect(sanitizeClientFileName("  inv<>oice.pdf  ")).toBe("invoice.pdf");
  });
});

describe("irc attachment tokens and protocol", () => {
  it("builds and parses attachment token", () => {
    const token = createAttachmentToken(ASSET);
    expect(isAttachmentOnlyMessageText(token)).toBe(true);
    expect(parseAttachmentToken(token)).toBe(ASSET);
  });

  it("builds gateway send frame with attachment metadata", () => {
    const frame = buildPublicSendFrame("yaarzo-global", ASSET, "Look", {
      contentType: "image",
      attachmentId: ASSET,
    });
    expect(frame.contentType).toBe("image");
    expect(frame.attachmentId).toBe(ASSET);
  });

  it("parses incoming attachment frame without extra DB calls", () => {
    const meta = parseOptionalMessageContentMeta({
      type: "message",
      text: "caption",
      contentType: "image",
      attachment: {
        id: ASSET,
        mimeType: "image/png",
        fileName: "x.png",
        size: 120,
        url: "https://cdn.example/x.png",
      },
    });
    expect(meta.contentType).toBe("image");
    expect(meta.attachment?.url).toContain("https://");
    expect(resolveAttachmentIdForMessage("caption", meta.attachment?.id, meta.contentType)).toBe(
      ASSET,
    );
  });
});

describe("irc attachment reply previews", () => {
  it("uses Photo for image attachment", () => {
    expect(
      buildIrcMessageReplyPreview({
        text: createAttachmentToken(ASSET),
        contentType: "image",
        attachment: { id: ASSET, mimeType: "image/png", fileName: "x.png", size: 1 },
      }),
    ).toBe("Photo");
  });

  it("uses file name for file attachment", () => {
    expect(
      buildIrcMessageReplyPreview({
        text: createAttachmentToken(ASSET),
        contentType: "file",
        attachment: {
          id: ASSET,
          mimeType: "application/pdf",
          fileName: "invoice.pdf",
          size: 1,
        },
      }),
    ).toBe("📄 invoice.pdf");
  });
});

describe("irc attachment access", () => {
  it("allows registered users to resolve irc channel assets", () => {
    expect(authorizeIrcChatAttachmentAccess(USER, ircAsset())).toBe(true);
  });

  it("denies non-irc channel assets", () => {
    expect(authorizeIrcChatAttachmentAccess(USER, ircAsset("lobby"))).toBe(false);
  });
});
