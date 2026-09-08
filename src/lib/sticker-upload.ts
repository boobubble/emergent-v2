import { supabase } from "@/integrations/supabase/client";
import {
  STICKERS_BUCKET,
  stickerUploadMeta,
  validateStickerFile,
  displayNameFromFilename,
  slugToken,
} from "./sticker-catalog";

function stickerClient() {
  const sb = supabase as any;
  return { sb, storage: sb.storage };
}

function readImageDimensions(file: File): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export type StickerUploadOk = {
  ok: true;
  id: string;
  storage_path: string;
  name: string;
  fileName: string;
};

export type StickerUploadFail = {
  ok: false;
  fileName: string;
  error: string;
};

export async function uploadOneSticker(opts: {
  file: File;
  packName: string;
  packId: string;
  kind: "sticker" | "emoji";
  userId: string | null;
  displayName?: string;
}): Promise<StickerUploadOk | StickerUploadFail> {
  const fileName = opts.file.name;
  const typeErr = validateStickerFile(opts.file);
  if (typeErr) return { ok: false, fileName, error: typeErr };

  const dims = await readImageDimensions(opts.file);
  if (!dims) return { ok: false, fileName, error: "Invalid image" };

  const { ext, contentType } = stickerUploadMeta(opts.file);
  const display = (opts.displayName?.trim() || displayNameFromFilename(fileName)).slice(0, 80);
  const safeName = display.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 40) || "sticker";
  const packSlug = slugToken(opts.packName);
  const path = `${opts.kind}/${packSlug}/${Date.now()}-${safeName}.${ext}`;
  const { sb, storage } = stickerClient();

  const up = await storage.from(STICKERS_BUCKET).upload(path, opts.file, {
    cacheControl: "31536000",
    upsert: false,
    contentType,
  });
  if (up.error) {
    const msg = up.error.message ?? "Upload failed";
    if (/bucket not found/i.test(msg)) {
      return { ok: false, fileName, error: "Stickers storage bucket is missing" };
    }
    return { ok: false, fileName, error: msg };
  }

  const { data: pub } = storage.from(STICKERS_BUCKET).getPublicUrl(path);
  if (!pub?.publicUrl) {
    await storage.from(STICKERS_BUCKET).remove([path]).catch(() => {});
    return { ok: false, fileName, error: "Could not build public URL" };
  }

  const { data: row, error: insErr } = await sb
    .from("custom_stickers")
    .insert({
      name: display,
      pack: opts.packName,
      pack_id: opts.packId,
      kind: opts.kind,
      url: pub.publicUrl,
      storage_path: path,
      mime: contentType,
      size_bytes: opts.file.size,
      width: dims?.w ?? null,
      height: dims?.h ?? null,
      created_by: opts.userId,
    })
    .select("id")
    .single();

  if (insErr || !row?.id) {
    await storage.from(STICKERS_BUCKET).remove([path]).catch(() => {});
    return { ok: false, fileName, error: insErr?.message ?? "Could not save sticker record" };
  }

  return { ok: true, id: row.id, storage_path: path, name: display, fileName };
}
