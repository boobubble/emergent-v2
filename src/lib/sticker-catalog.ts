/** Central sticker category/pack helpers. Category ids match sticker_categories.id. */

export const STICKERS_BUCKET = "stickers";
export const MAX_STICKER_BYTES = 2 * 1024 * 1024;
export const MAX_BULK_FILES = 20;
export const MAX_PACK_NAME = 80;
export const ACCEPT_STICKER = "image/gif,image/webp,image/apng,image/png";
export const ALLOWED_STICKER_MIME = new Set(["image/gif", "image/webp", "image/png"]);
export const ALLOWED_STICKER_EXT = new Set(["gif", "webp", "png"]);

export type StickerCategory = {
  id: string;
  name: string;
  emoji: string;
  sort_order: number;
  is_active: boolean;
};

export type StickerPack = {
  id: string;
  name: string;
  category_id: string;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const FALLBACK_CATEGORIES: StickerCategory[] = [
  { id: "custom", name: "Custom", emoji: "⭐", sort_order: 10, is_active: true },
  { id: "love", name: "Love", emoji: "❤️", sort_order: 20, is_active: true },
  { id: "funny", name: "Funny", emoji: "😂", sort_order: 30, is_active: true },
  { id: "reactions", name: "Reactions", emoji: "😍", sort_order: 40, is_active: true },
];

export function stickerUploadMeta(file: File): { ext: string; contentType: string } {
  const rawExt = file.name.split(".").pop()?.toLowerCase() || "gif";
  const ext = rawExt === "apng" ? "png" : rawExt;
  let contentType = file.type;
  if (!contentType || contentType === "application/octet-stream") {
    const byExt: Record<string, string> = {
      gif: "image/gif",
      webp: "image/webp",
      png: "image/png",
      apng: "image/png",
    };
    contentType = byExt[rawExt] || "image/png";
  }
  if (contentType === "image/apng") contentType = "image/png";
  return { ext, contentType };
}

export function validateStickerFile(file: File): string | null {
  const meta = stickerUploadMeta(file);
  if (!ALLOWED_STICKER_MIME.has(meta.contentType) || !ALLOWED_STICKER_EXT.has(meta.ext)) {
    return "Unsupported file type";
  }
  if (file.size > MAX_STICKER_BYTES) {
    return `File exceeds ${(MAX_STICKER_BYTES / 1024 / 1024).toFixed(0)} MB`;
  }
  return null;
}

export function displayNameFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  const titled = base.replace(/\b\w/g, (c) => c.toUpperCase());
  return (titled || "Sticker").slice(0, MAX_PACK_NAME);
}

export function sanitizePackName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_PACK_NAME);
}

export function slugToken(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "pack";
}

export function uniqueZipName(used: Set<string>, base: string): string {
  const safe = (base.replace(/[/\\]/g, "-").replace(/\0/g, "") || "sticker").slice(0, 80);
  if (!used.has(safe.toLowerCase())) {
    used.add(safe.toLowerCase());
    return safe;
  }
  const dot = safe.lastIndexOf(".");
  const stem = dot > 0 ? safe.slice(0, dot) : safe;
  const ext = dot > 0 ? safe.slice(dot) : "";
  let n = 2;
  let candidate = `${stem}-${n}${ext}`;
  while (used.has(candidate.toLowerCase())) {
    n += 1;
    candidate = `${stem}-${n}${ext}`;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

export function todayStamp(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
