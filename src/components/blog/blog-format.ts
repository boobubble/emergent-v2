/** Display helpers for Blog UI. Do not change stored fields or slug generation. */

export function formatBlogDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Compact admin timestamp. blog_posts has published_at, not updated_at. */
export function formatBlogTimestamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function plainTextFromHtml(html: string | null | undefined): string {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Display-only excerpt. Does not change stored HTML. */
export function excerptFromHtml(html: string | null | undefined, max = 160): string {
  const text = plainTextFromHtml(html);
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "").trimEnd()}…`;
}

/** Word-count estimate from HTML. Returns null when there is no readable text. */
export function readingTimeFromHtml(html: string | null | undefined): string | null {
  const text = plainTextFromHtml(html);
  if (!text) return null;
  const words = text.split(" ").filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 220));
  return `${mins} min read`;
}

/** Visual slug preview only — write route still uses generateUniqueSlug on submit. */
export function previewSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}
