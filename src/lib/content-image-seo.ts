/**
 * Derive Image SEO status from existing HTML. No extra tables, storage
 * fetches, or mass rewrites — lists and editors parse the content they already have.
 */

export const GENERIC_ALT = new Set([
  "image",
  "photo",
  "picture",
  "img",
  "graphic",
  "icon",
  "pic",
  "photograph",
]);

export type ImageOptimizationState = "ok" | "required" | "unavailable";
export type ImageStatusKind = "missing" | "ready" | "attention";

export type ContentImageIssue =
  | "missing_src"
  | "unsafe_src"
  | "missing_alt"
  | "weak_alt"
  | "optimization_required"
  | "optimization_unavailable";

export type ContentImageCheck = {
  src: string;
  alt: string;
  decorative: boolean;
  uploaded: boolean;
  srcSafe: boolean;
  altOk: boolean;
  optimization: ImageOptimizationState;
  issues: ContentImageIssue[];
  ready: boolean;
};

export type ContentImageStatus = {
  kind: ImageStatusKind;
  readyCount: number;
  total: number;
  images: ContentImageCheck[];
  label: string;
  compactLabel: string;
};

export type ImageStatusSummary = {
  kind: ImageStatusKind;
  readyCount: number;
  total: number;
  label: string;
  compactLabel: string;
};

const ATTR_RE = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
const IMG_RE = /<img\b([^>]*)\/?>/gi;

export function isSafeContentImageSrc(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^\s*javascript:/i.test(v) || /^\s*data:/i.test(v) || /^\s*vbscript:/i.test(v)) return false;
  if (v.startsWith("/") || v.startsWith("./") || v.startsWith("../")) return true;
  if (/^https?:\/\//i.test(v)) return true;
  return false;
}

export function parseHtmlAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = new RegExp(ATTR_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const name = m[1].toLowerCase();
    attrs[name] = m[3] ?? m[4] ?? m[5] ?? "";
  }
  return attrs;
}

export function extractContentImages(html: string | null | undefined): Record<string, string>[] {
  if (!html) return [];
  const out: Record<string, string>[] = [];
  const re = new RegExp(IMG_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push(parseHtmlAttributes(m[1] || ""));
  }
  return out;
}

export function isFilenameOnlyAlt(alt: string, src: string): boolean {
  const a = alt.trim().toLowerCase();
  if (!a) return false;
  if (/\.(jpe?g|png|gif|webp|avif|svg|bmp|tiff?)$/i.test(a)) return true;
  const file = (src.split(/[?#]/)[0].split("/").pop() ?? "").toLowerCase();
  if (!file) return false;
  const noExt = file.replace(/\.[a-z0-9]+$/i, "");
  return a === file || a === noExt;
}

export function isWeakAltText(alt: string, src = ""): boolean {
  const trimmed = alt.trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  if (GENERIC_ALT.has(lower)) return true;
  if (trimmed.length <= 2) return true;
  if (/^(img|pic|photo|picto)\d*$/i.test(trimmed)) return true;
  if (isFilenameOnlyAlt(trimmed, src)) return true;
  return false;
}

export function optimizationFromAttrs(attrs: Record<string, string>): ImageOptimizationState {
  const flag = (attrs["data-optimized"] || "").toLowerCase();
  if (flag === "true" || flag === "ok") return "ok";
  if (flag === "unavailable") return "unavailable";
  const src = (attrs.src || "").split("?")[0].toLowerCase();
  if (/\.(webp|avif|svg)$/i.test(src)) return "ok";
  const bytes = Number(attrs["data-bytes"] || "");
  if (Number.isFinite(bytes) && bytes > 0 && bytes <= 350_000 && /\.jpe?g$/i.test(src)) return "ok";
  return "required";
}

export function evaluateContentImage(attrs: Record<string, string>): ContentImageCheck {
  const src = (attrs.src || "").trim();
  const decorative = attrs["data-decorative"] === "true";
  const alt = attrs.alt ?? "";
  const srcSafe = isSafeContentImageSrc(src);
  const uploaded = Boolean(src) && srcSafe;
  const issues: ContentImageIssue[] = [];

  if (!src) issues.push("missing_src");
  else if (!srcSafe) issues.push("unsafe_src");

  const altOk = decorative || !isWeakAltText(alt, src);
  if (uploaded && !decorative && isWeakAltText(alt, src)) {
    issues.push(alt.trim() ? "weak_alt" : "missing_alt");
  }

  const optimization = uploaded ? optimizationFromAttrs(attrs) : "required";
  if (uploaded) {
    if (optimization === "required") issues.push("optimization_required");
    if (optimization === "unavailable") issues.push("optimization_unavailable");
  }

  const ready = uploaded && altOk && optimization === "ok";
  return {
    src,
    alt,
    decorative,
    uploaded,
    srcSafe,
    altOk,
    optimization,
    issues,
    ready,
  };
}

function statusLabel(kind: ImageStatusKind, readyCount: number, total: number): { label: string; compactLabel: string } {
  if (kind === "missing" || total === 0) {
    return { label: "Image Missing", compactLabel: "Missing" };
  }
  if (kind === "ready") {
    if (total === 1) return { label: "Image Ready", compactLabel: "Ready" };
    return { label: `${readyCount}/${total} Images Ready`, compactLabel: `${readyCount}/${total}` };
  }
  if (total > 1) {
    return { label: `${readyCount}/${total} Images Ready`, compactLabel: `${readyCount}/${total}` };
  }
  return { label: "Image Needs Attention", compactLabel: "Needs attention" };
}

export function summarizeContentImages(...htmlParts: Array<string | null | undefined>): ContentImageStatus {
  const images = extractContentImages(htmlParts.filter(Boolean).join("\n")).map(evaluateContentImage);
  const total = images.length;
  const readyCount = images.filter((img) => img.ready).length;
  let kind: ImageStatusKind = "attention";
  if (total === 0) kind = "missing";
  else if (readyCount === total) kind = "ready";
  const { label, compactLabel } = statusLabel(kind, readyCount, total);
  return { kind, readyCount, total, images, label, compactLabel };
}

export function toImageStatusSummary(status: ContentImageStatus): ImageStatusSummary {
  return {
    kind: status.kind,
    readyCount: status.readyCount,
    total: status.total,
    label: status.label,
    compactLabel: status.compactLabel,
  };
}

export function attachImageStatus<T extends Record<string, unknown>>(
  row: T,
  htmlParts: Array<string | null | undefined>,
): Omit<T, "content" | "intro_content"> & { image_status: ImageStatusSummary } {
  const status = toImageStatusSummary(summarizeContentImages(...htmlParts));
  const next = { ...row, image_status: status } as T & { image_status: ImageStatusSummary };
  delete (next as { content?: unknown }).content;
  delete (next as { intro_content?: unknown }).intro_content;
  return next as Omit<T, "content" | "intro_content"> & { image_status: ImageStatusSummary };
}

export function issueLabel(issue: ContentImageIssue): string {
  switch (issue) {
    case "missing_src":
      return "Image missing";
    case "unsafe_src":
      return "Image URL is invalid";
    case "missing_alt":
      return "Alt text missing";
    case "weak_alt":
      return "Alt text needs a real description";
    case "optimization_required":
      return "Optimization required";
    case "optimization_unavailable":
      return "Optimization unavailable";
  }
}
