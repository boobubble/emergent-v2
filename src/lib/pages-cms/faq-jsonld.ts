/**
 * Extract visible FAQ pairs from CMS HTML and build FAQPage JSON-LD.
 * Matches the Q1/strong pattern used on city pages plus h3 FAQ blocks.
 */

export type FaqItem = { question: string; answer: string };

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function extractFaqItems(html: string): FaqItem[] {
  const src = html || "";
  const items: FaqItem[] = [];
  const seen = new Set<string>();

  const push = (q: string, a: string) => {
    const question = stripTags(q).replace(/^(q\d+[:.\s]+)/i, "").trim();
    const answer = stripTags(a);
    if (!question || !answer || question.length < 8 || answer.length < 8) return;
    const key = question.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ question, answer });
  };

  const qStrong = /<strong>\s*(Q\d+[:.\s]+[^<]+)<\/strong>\s*(?:<\/p>\s*<p[^>]*>\s*)?([\s\S]*?)(?=<p[^>]*>\s*<strong>\s*Q\d+|<h2\b|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = qStrong.exec(src))) {
    push(m[1] || "", m[2] || "");
  }

  if (items.length >= 2) return items.slice(0, 8);

  const h3 = /<h3[^>]*>([\s\S]*?)<\/h3>\s*(?:<p[^>]*>)?([\s\S]*?)(?=<h[23]\b|$)/gi;
  while ((m = h3.exec(src))) {
    push(m[1] || "", m[2] || "");
  }
  return items.slice(0, 8);
}

export function faqItemsFromStored(
  faq: unknown,
): FaqItem[] {
  if (!Array.isArray(faq)) return [];
  const out: FaqItem[] = [];
  for (const row of faq) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const question = String(rec.question ?? rec.q ?? "").trim();
    const answer = String(rec.answer ?? rec.a ?? "").trim();
    if (question.length >= 8 && answer.length >= 8) out.push({ question, answer });
  }
  return out.slice(0, 8);
}

export function buildCmsPageJsonLd(input: {
  title: string;
  description: string;
  url: string;
  publishedAt?: string | null;
  image?: string | null;
  faqs?: FaqItem[];
}): Record<string, unknown> {
  const webpage: Record<string, unknown> = {
    "@type": "WebPage",
    name: input.title,
    headline: input.title,
    description: input.description,
    url: input.url,
  };
  if (input.publishedAt) webpage.datePublished = input.publishedAt;
  if (input.image) webpage.image = [input.image];

  const graph: Record<string, unknown>[] = [webpage];
  const faqs = (input.faqs ?? []).filter((f) => f.question && f.answer);
  if (faqs.length >= 2) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
