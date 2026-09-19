import {
  IRC_CHAT_ATTACHMENT_MAX_BYTES,
  IRC_CHAT_FILE_MIMES,
  IRC_CHAT_IMAGE_MIMES,
  classifyIrcAttachmentMime,
  sanitizeAttachmentDisplayName,
} from "./irc-attachment-retention";

export type IrcMessageAttachment = {
  id: string;
  url?: string;
  mimeType: string;
  fileName: string;
  size: number;
};

export type IrcAttachmentContentType = "image" | "file";

const ATTACHMENT_TOKEN_RE =
  /^:a:([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}):$/i;

export function createAttachmentToken(assetId: string): string {
  return `:a:${assetId.trim().toLowerCase()}:`;
}

export function parseAttachmentToken(text: string): string | null {
  const match = ATTACHMENT_TOKEN_RE.exec(String(text || "").trim());
  if (!match) return null;
  return match[1].toLowerCase();
}

export function isAttachmentOnlyMessageText(text: string): boolean {
  return ATTACHMENT_TOKEN_RE.test(String(text || "").trim());
}

export function resolveAttachmentIdForMessage(
  text: string,
  attachmentId: string | null | undefined,
  contentType: string | null | undefined,
): string | null {
  const fromMeta =
    typeof attachmentId === "string" && attachmentId.trim()
      ? attachmentId.trim().toLowerCase()
      : null;
  const rawType = String(contentType || "").trim().toLowerCase();
  if (rawType === "image" || rawType === "file") {
    return fromMeta || parseAttachmentToken(text);
  }
  return fromMeta || parseAttachmentToken(text);
}

export type ClientAttachmentPick = {
  file: File;
  previewUrl: string;
  contentType: IrcAttachmentContentType;
};

export function validateClientAttachmentFile(file: File): {
  ok: true;
  contentType: IrcAttachmentContentType;
} | { ok: false; message: string } {
  if (file.size > IRC_CHAT_ATTACHMENT_MAX_BYTES) {
    return { ok: false, message: "File is too large (max 2 MB)" };
  }
  const mime = (file.type || "").trim().toLowerCase();
  const kind = classifyIrcAttachmentMime(mime);
  if (!kind) {
    return { ok: false, message: "Unsupported file type" };
  }
  if (kind === "image" && !IRC_CHAT_IMAGE_MIMES.has(mime)) {
    return { ok: false, message: "Unsupported image type" };
  }
  if (kind === "file" && !IRC_CHAT_FILE_MIMES.has(mime)) {
    return { ok: false, message: "Unsupported file type" };
  }
  return { ok: true, contentType: kind };
}

export function sanitizeClientFileName(name: string): string {
  return sanitizeAttachmentDisplayName(name);
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
