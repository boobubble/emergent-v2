import { isReservedSlug } from "@/lib/reserved-routes";

const DEFAULT_MAX_LEN = 80;

export function extractSlugInput(raw: string): string {
  let s = (raw ?? "").trim();
  if (!s) return "";

  if (/^https?:\/\//i.test(s)) {
    try {
      s = new URL(s).pathname;
    } catch {
      /* keep raw */
    }
  } else if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s)) {
    const slash = s.indexOf("/");
    s = slash >= 0 ? s.slice(slash) : "";
  }

  s = s.replace(/^\/+|\/+$/g, "");
  if (s.includes("/")) {
    const parts = s.split("/").filter(Boolean);
    s = parts[parts.length - 1] ?? s;
  }

  return s;
}

export function slugifyPageSlug(input: string, maxLen = DEFAULT_MAX_LEN): string {
  let s = extractSlugInput(input);
  if (!s) return "";

  s = s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  s = s.replace(/_/g, " ");
  s = s.replace(/[^a-z0-9\s-]/g, " ");
  s = s.replace(/[\s-]+/g, "-");
  s = s.replace(/^-+|-+$/g, "");

  if (s.length > maxLen) {
    s = s.slice(0, maxLen).replace(/-+$/g, "");
  }

  return s;
}

export function slugify(input: string): string {
  return slugifyPageSlug(input) || "page";
}

export function validatePageSlug(slug: string, opts?: { required?: boolean }): string | null {
  const normalized = slugifyPageSlug(slug);
  if (!normalized) {
    return opts?.required ? "Slug is required before publishing." : null;
  }
  if (isReservedSlug(normalized)) {
    return `Slug "${normalized}" is reserved by the platform. Choose another.`;
  }
  return null;
}

export function pageSlugPreviewHost(): string {
  if (typeof window !== "undefined" && window.location.host) return window.location.host;
  return "domain.com";
}

export function pagePublicPath(slug: string): string {
  const s = slugifyPageSlug(slug);
  return s ? `/${s}` : "";
}

export function pagePublicUrl(slug: string, origin?: string): string {
  const host = origin ?? (typeof window !== "undefined" ? window.location.origin : "https://domain.com");
  const path = pagePublicPath(slug);
  return path ? `${host.replace(/\/$/, "")}${path}` : host;
}

export const DUPLICATE_PAGE_SLUG_MESSAGE =
  "This URL is already used by another page. Choose a different URL.";

export type PageSlugFieldError = {
  field: "slug";
  code: "DUPLICATE_SLUG";
  message: string;
};

export class PageSlugValidationError extends Error {
  readonly field = "slug" as const;
  readonly code = "DUPLICATE_SLUG" as const;

  constructor(message = DUPLICATE_PAGE_SLUG_MESSAGE) {
    super(message);
    this.name = "PageSlugValidationError";
  }
}

export function findPageSlugConflict(
  slug: string,
  existing: { id: string } | null | undefined,
  currentPageId?: string,
): PageSlugFieldError | null {
  if (existing && existing.id !== currentPageId) {
    return { field: "slug", code: "DUPLICATE_SLUG", message: DUPLICATE_PAGE_SLUG_MESSAGE };
  }
  return null;
}

export function assertUniquePageSlug(
  slug: string,
  existing: { id: string } | null | undefined,
  currentPageId?: string,
): void {
  const conflict = findPageSlugConflict(slug, existing, currentPageId);
  if (conflict) throw new PageSlugValidationError(conflict.message);
}
