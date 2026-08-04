import { isReservedSlug } from "@/lib/reserved-routes";

/** True when `slug` is safe to pass as a TanStack Router route param. */
export function isNavigableSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (!trimmed) return false;
  if (trimmed === "$slug") return false;
  return true;
}

/**
 * True for top-level `/{slug}` paths handled by the public CMS route (`/$slug`).
 * Lets AuthGate pass anonymous visitors through before the route loader decides 404 vs page.
 */
export function isPublicCmsSlugPath(pathname: string): boolean {
  if (!pathname || pathname === "/") return false;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  const slug = segments[0];
  if (!isNavigableSlug(slug)) return false;
  if (isReservedSlug(slug)) return false;
  return true;
}
