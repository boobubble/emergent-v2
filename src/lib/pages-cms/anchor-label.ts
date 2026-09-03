/**
 * Shared cleaning for related-room / peer-geo visible anchors.
 * Full SEO titles ("Faisalabad Chat Room | Free Chat & Community – Yaarzo")
 * must never be concatenated with cityAnchors() suffixes like "rooms".
 */

export const NATURAL_ANCHOR_MAX_LEN = 48;

export function stripSeoTitleSuffix(raw: string): string {
  return (raw || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*[|–—].*$/, "")
    .replace(/\s+on\s+yaarzo\s*$/i, "")
    .trim();
}

/** True when the string is a short natural phrase, not a dumped meta title. */
export function isNaturalAnchor(text: string): boolean {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t || t.length > NATURAL_ANCHOR_MAX_LEN) return false;
  if (/[|–—]/.test(t)) return false;
  return true;
}

export function placeNameFromLabel(raw: string, slug = ""): string {
  const stripped = stripSeoTitleSuffix(raw);
  const fromSlug = slug
    .replace(/-chat-room$/i, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const base = stripped || fromSlug;
  const withoutChat = base.replace(/\s+chat(\s+room)?$/i, "").trim();
  return withoutChat || fromSlug || base;
}
