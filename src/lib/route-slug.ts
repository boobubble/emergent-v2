/** True when `slug` is safe to pass as a TanStack Router route param. */
export function isNavigableSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (!trimmed) return false;
  if (trimmed === "$slug") return false;
  return true;
}
