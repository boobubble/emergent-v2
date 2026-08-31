/**
 * Display-only CMS image placement.
 * Does not rewrite stored custom_pages.content. Moves a page image that was
 * appended after the article CTA back into the article body (after the lead
 * paragraph) so public HTML keeps the image in document flow — not via CSS order.
 */

const IMG_RE = /<img\b[^>]*>/gi;
const CTA_RE =
  /<(?:a|div)\b[^>]*class=["'][^"']*(?:custom-page-cta-button|cta-button(?:-link)?)[^"']*["'][^>]*>/i;

export type CmsImgHit = { tag: string; index: number };

export function listCmsImgTags(html: string): CmsImgHit[] {
  if (!html) return [];
  const out: CmsImgHit[] = [];
  const re = new RegExp(IMG_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push({ tag: m[0], index: m.index });
  }
  return out;
}

function ctaIndex(html: string): number {
  const m = CTA_RE.exec(html);
  return m ? m.index : -1;
}

/** Images that sit after the page CTA (appended past the article close). */
export function misplacedTrailingCmsImages(html: string): CmsImgHit[] {
  const imgs = listCmsImgTags(html);
  if (!imgs.length) return [];
  const ctaAt = ctaIndex(html);
  if (ctaAt < 0) return [];
  return imgs.filter((img) => img.index > ctaAt);
}

function insertAfterFirstParagraph(html: string, snippet: string): string {
  const close = /<\/p>/i.exec(html);
  if (close) {
    const at = close.index + close[0].length;
    return html.slice(0, at) + snippet + html.slice(at);
  }
  const h2 = html.search(/<h2[\s>]/i);
  if (h2 >= 0) return html.slice(0, h2) + snippet + html.slice(h2);
  return snippet + html;
}

function removeHit(html: string, hit: CmsImgHit): string {
  const end = hit.index + hit.tag.length;
  const after = html.slice(end);
  const empty = /^(?:\s*<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>)/i.exec(after);
  const eat = empty ? empty[0].length : 0;
  return html.slice(0, hit.index) + html.slice(end + eat);
}

/**
 * Keep in-article images where they already are. Relocate only images that
 * were appended after the CTA / article close. Idempotent. Preserves the
 * original <img> tag (alt, data-*, width/height, loading).
 */
export function placeCmsImagesInContent(html: string): string {
  if (!html || !/<img\b/i.test(html)) return html;
  const toMove = misplacedTrailingCmsImages(html);
  if (!toMove.length) return html;

  let out = html;
  for (let i = toMove.length - 1; i >= 0; i--) {
    out = removeHit(out, toMove[i]);
  }
  const snippet = toMove.map((img) => img.tag).join("");
  return insertAfterFirstParagraph(out, snippet);
}
