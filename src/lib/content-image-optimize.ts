/**
 * Browser-only image optimization using Canvas. Reuses the existing upload
 * path — does not add a storage bucket or image service.
 */

export const IMAGE_WARN_BYTES = 350_000;
export const IMAGE_MAX_EDGE = 2560;
export const IMAGE_WEBP_QUALITY = 0.82;

export type OptimizeImageResult = {
  file: File;
  width: number;
  height: number;
  originalBytes: number;
  outputBytes: number;
  mime: string;
  status: "ok" | "required" | "unavailable";
  fileName: string;
};

function extensionOf(name: string, mime: string): string {
  const fromName = (name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName) return fromName;
  if (mime.includes("webp")) return "webp";
  if (mime.includes("avif")) return "avif";
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  return "jpg";
}

function rename(fileName: string, ext: string): string {
  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${ext}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file);
      const size = { width: bmp.width, height: bmp.height };
      bmp.close();
      return size;
    } catch {
      /* fall through */
    }
  }
  if (typeof document === "undefined") return null;
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(size);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));
}

async function tryWebp(
  file: File,
  width: number,
  height: number,
): Promise<{ blob: Blob; width: number; height: number } | null> {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  let w = width;
  let h = height;
  const edge = Math.max(w, h);
  if (edge > IMAGE_MAX_EDGE) {
    const scale = IMAGE_MAX_EDGE / edge;
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  try {
    const bmp = typeof createImageBitmap === "function" ? await createImageBitmap(file) : null;
    if (bmp) {
      ctx.drawImage(bmp, 0, 0, w, h);
      bmp.close();
    } else {
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("decode failed"));
        };
        img.src = url;
      });
    }
    const blob = await canvasToBlob(canvas, "image/webp", IMAGE_WEBP_QUALITY);
    if (!blob || blob.size < 32) return null;
    return { blob, width: w, height: h };
  } catch {
    return null;
  }
}

function passthrough(
  file: File,
  width: number,
  height: number,
  status: OptimizeImageResult["status"],
): OptimizeImageResult {
  return {
    file,
    width,
    height,
    originalBytes: file.size,
    outputBytes: file.size,
    mime: file.type || "image/jpeg",
    status,
    fileName: file.name,
  };
}

export async function optimizeImageFile(file: File): Promise<OptimizeImageResult> {
  const dims = await readImageDimensions(file);
  const width = dims?.width ?? 0;
  const height = dims?.height ?? 0;
  const mime = (file.type || "").toLowerCase();
  const ext = extensionOf(file.name, mime);

  if (mime.includes("svg") || ext === "svg") {
    return passthrough(file, width, height, "ok");
  }
  if ((mime.includes("webp") || mime.includes("avif") || ext === "webp" || ext === "avif") && file.size <= IMAGE_WARN_BYTES) {
    return passthrough(file, width, height, "ok");
  }

  const converted = await tryWebp(file, width || 1, height || 1);
  if (!converted) {
    const status = file.size > IMAGE_WARN_BYTES || !/\.webp$|\.avif$/i.test(file.name) ? "unavailable" : "ok";
    return passthrough(file, width, height, status);
  }

  const better = converted.blob.size < file.size * 0.98 || ext === "png" || ext === "gif" || file.size > IMAGE_WARN_BYTES;
  if (!better && (ext === "webp" || ext === "avif")) {
    return passthrough(file, width, height, "ok");
  }

  const outFile = new File([converted.blob], rename(file.name, "webp"), { type: "image/webp" });
  return {
    file: outFile,
    width: converted.width,
    height: converted.height,
    originalBytes: file.size,
    outputBytes: outFile.size,
    mime: "image/webp",
    status: "ok",
    fileName: outFile.name,
  };
}

export async function optimizeImageFromUrl(src: string): Promise<OptimizeImageResult | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) return null;
    const name = (src.split("?")[0].split("/").pop() || "image") + "";
    const file = new File([blob], name, { type: blob.type || "image/jpeg" });
    return optimizeImageFile(file);
  } catch {
    return null;
  }
}
