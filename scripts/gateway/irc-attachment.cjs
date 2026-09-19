/**
 * IRC chat attachments — validate registry assets and sign URLs (gateway-only).
 */

const { isValidUuid } = require("./irc-pm.cjs");
const { validateRoomId } = require("./irc-moderation.cjs");

const IRC_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const IRC_FILE_MIMES = new Set(["application/pdf", "text/plain"]);

const ATTACHMENT_TOKEN_RE =
  /^:a:([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}):$/i;

function parseAttachmentToken(text) {
  const match = ATTACHMENT_TOKEN_RE.exec(String(text || "").trim());
  if (!match) return null;
  const id = match[1].trim();
  return isValidUuid(id) ? id.toLowerCase() : null;
}

function classifyMime(mime) {
  const m = String(mime || "").trim().toLowerCase();
  if (IRC_IMAGE_MIMES.has(m)) return "image";
  if (IRC_FILE_MIMES.has(m)) return "file";
  return null;
}

function sanitizeFileName(name) {
  const base = String(name || "file")
    .replace(/[\r\n]/g, "")
    .replace(/[<>]/g, "")
    .trim();
  return (base || "file").slice(0, 120);
}

function ircAttachmentChannelId(room) {
  return `irc:${room}`;
}

function inferMimeFromPath(storagePath) {
  const lower = String(storagePath || "").toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".txt")) return "text/plain";
  return "";
}

async function fetchAssetRow(env, assetId) {
  const serviceKey = env.serviceRoleKey;
  if (!env.supabaseUrl || !serviceKey) return null;
  const query =
    `select=id,storage_path,uploader_id,channel_id,message_id,image_expired,image_expires_at` +
    `&id=eq.${encodeURIComponent(assetId)}`;
  const res = await fetch(`${env.supabaseUrl}/rest/v1/chat_image_assets?${query}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows[0]) return null;
  return rows[0];
}

async function signStoragePath(env, storagePath) {
  const serviceKey = env.serviceRoleKey;
  if (!env.supabaseUrl || !serviceKey) return null;
  const encodedPath = String(storagePath || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const res = await fetch(
    `${env.supabaseUrl}/storage/v1/object/sign/chat-images/${encodedPath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  const signed = data?.signedURL || data?.signedUrl;
  if (!signed) return null;
  if (signed.startsWith("http")) return signed;
  const suffix = signed.startsWith("/") ? signed : `/${signed}`;
  return `${env.supabaseUrl}/storage/v1${suffix}`;
}

function isAssetExpired(row, nowMs = Date.now()) {
  if (row.image_expired) return true;
  if (!row.image_expires_at) return false;
  return new Date(row.image_expires_at).getTime() <= nowMs;
}

/**
 * @param {object} env
 * @param {string} userId
 * @param {string} room
 * @param {string} attachmentId
 */
async function loadValidatedIrcAttachment(env, userId, room, attachmentId) {
  const row = await fetchAssetRow(env, attachmentId);
  if (!row) return { ok: false, code: "INVALID_ATTACHMENT", message: "Attachment not found" };
  if (isAssetExpired(row)) {
    return { ok: false, code: "ATTACHMENT_EXPIRED", message: "Attachment expired" };
  }
  const expectedChannel = ircAttachmentChannelId(room);
  if (String(row.channel_id || "") !== expectedChannel) {
    return { ok: false, code: "INVALID_ATTACHMENT", message: "Attachment room mismatch" };
  }
  if (String(row.uploader_id || "").trim() !== String(userId || "").trim()) {
    return { ok: false, code: "INVALID_ATTACHMENT", message: "Attachment uploader mismatch" };
  }
  const storagePath = String(row.storage_path || "");
  if (!storagePath.startsWith("irc/") || storagePath.includes("..")) {
    return { ok: false, code: "INVALID_ATTACHMENT", message: "Invalid attachment path" };
  }
  const mimeType = inferMimeFromPath(storagePath);
  const contentType = classifyMime(mimeType);
  if (!contentType) {
    return { ok: false, code: "INVALID_ATTACHMENT", message: "Unsupported attachment type" };
  }
  const fileName = sanitizeFileName(storagePath.split("/").pop());
  const url = await signStoragePath(env, storagePath);
  if (!url) {
    return { ok: false, code: "ATTACHMENT_UNAVAILABLE", message: "Could not sign attachment URL" };
  }
  return {
    ok: true,
    contentType,
    attachment: {
      id: attachmentId.toLowerCase(),
      url,
      mimeType,
      fileName,
      size: 0,
    },
  };
}

function buildIrcAttachmentFallback(contentType, fileName, url) {
  const safeName = sanitizeFileName(fileName);
  if (contentType === "image") {
    return url ? `[Image] ${url}` : "[Image]";
  }
  return url ? `[File: ${safeName}] ${url}` : `[File: ${safeName}]`;
}

module.exports = {
  parseAttachmentToken,
  loadValidatedIrcAttachment,
  buildIrcAttachmentFallback,
  ATTACHMENT_TOKEN_RE,
};
