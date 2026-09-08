import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { STICKERS_BUCKET, uniqueZipName } from "./sticker-catalog";

function stickerStorage() {
  return (supabase as any).storage;
}

export type ZipSource = {
  name: string;
  storage_path: string | null;
  url: string;
};

export type ZipResult =
  | { ok: true; blob: Blob; zipName: string; failed: string[] }
  | { ok: false; error: string; failed: string[] };

function triggerDownload(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
}

async function fetchStickerBlob(row: ZipSource): Promise<{ blob: Blob } | { error: string }> {
  if (row.storage_path && !row.storage_path.includes("..") && !row.storage_path.startsWith("/")) {
    const { data, error } = await stickerStorage().from(STICKERS_BUCKET).download(row.storage_path);
    if (!error && data) return { blob: data };
    if (error && !/not found|object not found/i.test(error.message)) {
      return { error: error.message };
    }
  }
  try {
    const res = await fetch(row.url);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return { blob: await res.blob() };
  } catch (e: any) {
    return { error: e?.message ?? "Fetch failed" };
  }
}

export async function buildStickerZip(
  rows: ZipSource[],
  zipName: string,
): Promise<ZipResult> {
  if (!rows.length) return { ok: false, error: "This pack has no stickers to download.", failed: [] };

  const zip = new JSZip();
  const used = new Set<string>();
  const failed: string[] = [];

  for (const row of rows) {
    const got = await fetchStickerBlob(row);
    if ("error" in got) {
      failed.push(`${row.name} — ${got.error}`);
      continue;
    }
    const ext = (row.storage_path?.split(".").pop() || "gif").replace(/[^a-z0-9]/gi, "") || "gif";
    const base = row.name.toLowerCase().endsWith(`.${ext}`) ? row.name : `${row.name}.${ext}`;
    zip.file(uniqueZipName(used, base), got.blob);
  }

  const added = Object.keys(zip.files).length;
  if (!added) {
    return { ok: false, error: "Could not fetch any sticker files.", failed };
  }

  const blob = await zip.generateAsync({ type: "blob" });
  return { ok: true, blob, zipName, failed };
}

export async function downloadStickerZip(rows: ZipSource[], zipName: string): Promise<ZipResult> {
  const result = await buildStickerZip(rows, zipName);
  if (result.ok) triggerDownload(result.blob, result.zipName);
  return result;
}
