import { buildCanonicalUrl, DEFAULT_SITE_ORIGIN } from "@/lib/seo/resolve-seo";
import { isReservedSlug } from "@/lib/reserved-routes";

export const CMS_QUALITY_STATUSES = ["Excellent", "Good", "Needs Improvement", "Critical"] as const;
export type CmsQualityStatus = (typeof CMS_QUALITY_STATUSES)[number];

export type CmsQualityWarning = {
  code: string;
  severity: "critical" | "warning";
  message: string;
};

export type CmsQualityInput = {
  slug: string;
  title?: string | null;
  h1?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  content?: string | null;
  intro_content?: string | null;
  tags?: string[] | null;
  noindex?: boolean | null;
  publishedSlugs?: Iterable<string>;
};

const RESEARCH_PHRASES = [
  "research summary",
  "pages cms",
  "slug exists",
  "seo notes",
  "keyword research",
  "search intent",
  "competitor analysis",
  "content angle",
  "target keyword",
  "search volume",
  "traffic estimate",
  "ai instructions",
  "generated content",
  "replace city",
  "template instructions",
  "serp",
];

const PLACEHOLDER_RE = /\[[A-Z0-9][A-Z0-9 /,_–-]{2,80}\]/g;

const TYPO_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bcahte rooms?\b/gi, "chat room"],
  [/\bfreinds\b/gi, "friends"],
];

/** Existing-or-closest published URL replacements. Never invent new pages. */
export const CMS_BROKEN_HREF_REMAP: Record<string, string> = {
  "/chatrooms": "/chatroom",
  "/terms-and-conditions": "/terms-conditions",
  "/english-chat-room": "/english-chat-room-free-online-chat",
  "/create-chat-room": "/chatroom",
  "/group-chat-room": "/chatroom",
  "/online-chat-room": "/chatroom",
  "/public-chat-room": "/chatroom",
  "/text-chat-room": "/chatroom",
  "/worldwide-chat-room": "/chatroom",
  "/no-signup-chat": "/chat-rooms-without-registration-2026",
  "/anonymous-chat-room": "/chat-rooms-without-registration-2026",
  "/chat-with-strangers": "/chatroom",
  "/stranger-chat-room": "/chatroom",
  "/ai-chat-room": "/chatroom",
  "/poetry-chat-room": "/poetry",
  "/shayari-chat-room": "/poetry",
  "/india-girls-chat-room": "/girls-chat-room",
  "/hindi-chat-room": "/india-chat-room",
  "/punjabi-chat-room": "/india-chat-room",
  "/noida-chat-room": "/delhi-chat-room",
  "/gurugram-chat-room": "/delhi-chat-room",
  "/haryana-chat-room": "/delhi-chat-room",
  "/india-friendship-chat-room": "/friendship-chat-room",
  "/tamil-nadu-chat-room": "/chennai-chat-room",
  "/coimbatore-chat-room": "/chennai-chat-room",
  "/madurai-chat-room": "/chennai-chat-room",
  "/tamil-chat-room": "/chennai-chat-room",
  "/urdu-chat-room": "/pakistan-chat-room",
  "/community-chat-room": "/communities",
  "/karachi-dating-chat-room": "/dating-chat-room",
  "/karachi-friendship-chat-room": "/friendship-chat-room",
  "/pakistan-girls-chat-room": "/girls-chat-room",
  "/sindh-chat-room": "/karachi-chat-room",
  "/maharashtra-chat-room": "/mumbai-chat-room",
  "/marathi-chat-room": "/mumbai-chat-room",
  "/mumbai-dating-chat-room": "/dating-chat-room",
  "/mumbai-friendship-chat-room": "/friendship-chat-room",
  "/mumbai-girls-chat-room": "/girls-chat-room",
  "/pune-chat-room": "/mumbai-chat-room",
  "/punjab-india-chat-room": "/india-chat-room",
  "/punjab-pakistan-chat-room": "/lahore-chat-room",
  "/social-chat-room": "/feed",
};

/** No relevant existing target — unwrap to plain text. */
export const CMS_BROKEN_HREF_UNWRAP = new Set([
  "/food-chat-room",
  "/cricket-chat-room",
  "/movies-chat-room",
  "/student-chat-room",
  "/international-chat-room",
  "/australia-chat-room",
  "/canada-chat-room",
  "/music-chat-room",
  "/gaming-chat-room",
  "/bollywood-chat-room",
  "/boys-chat-room",
]);

export function htmlToPlainText(html: string): string {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(html: string): number {
  const text = htmlToPlainText(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function extractHeadingTexts(html: string): Array<{ level: number; text: string; empty: boolean }> {
  const out: Array<{ level: number; text: string; empty: boolean }> = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html || ""))) {
    const text = htmlToPlainText(m[2] || "");
    out.push({ level: Number(m[1]), text, empty: !text });
  }
  return out;
}

export function extractInternalHrefs(html: string): string[] {
  const hrefs: string[] = [];
  const re = /href\s*=\s*(["'])([^"']+)\1/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html || ""))) {
    const raw = m[2].trim();
    if (raw.startsWith("/") || /^https?:\/\/(www\.)?yaarzo\.com/i.test(raw)) hrefs.push(raw);
  }
  return hrefs;
}

export function normalizeInternalPath(href: string): string | null {
  try {
    if (href.startsWith("/")) {
      return href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
    }
    const url = new URL(href);
    if (!/(^|\.)yaarzo\.com$/i.test(url.hostname)) return null;
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
}

function publishedSet(input?: Iterable<string>): Set<string> {
  return new Set([...(input ?? [])].map((s) => s.replace(/^\/+/, "").toLowerCase()));
}

export function isKeepableInternalPath(path: string, published: Set<string>): boolean {
  const normalized = (path.split(/[?#]/)[0] || "/").replace(/\/+$/, "") || "/";
  if (normalized === "/") return true;
  const slug = normalized.replace(/^\//, "").split("/")[0]?.toLowerCase() ?? "";
  if (!slug) return true;
  if (slug === "chatrooms") return false;
  if (isReservedSlug(slug) && slug !== "chatrooms") return true;
  // Editor/preview without a catalog must not unwrap every CMS-looking slug.
  if (!published.size) return true;
  if (published.has(slug)) return true;
  return false;
}

export function resolveInternalHref(href: string, published: Set<string>): { href: string | null; action: "keep" | "remap" | "unwrap" } {
  const path = normalizeInternalPath(href);
  if (!path) return { href, action: "keep" };
  if (CMS_BROKEN_HREF_REMAP[path]) {
    return { href: CMS_BROKEN_HREF_REMAP[path], action: "remap" };
  }
  if (CMS_BROKEN_HREF_UNWRAP.has(path)) return { href: null, action: "unwrap" };
  if (isKeepableInternalPath(path, published)) {
    return { href: path === "/chatrooms" ? "/chatroom" : path, action: path === "/chatrooms" ? "remap" : "keep" };
  }
  return { href: null, action: "unwrap" };
}

const UK_USER_OPENING =
  "<p>People use the UK chat room to talk with others in Britain, stay in touch from the English-speaking diaspora, or join conversations around British culture and everyday life. Unlike a general English chat room, this page is for chatting with a UK focus — an ongoing community rather than a dead forum or anonymous stranger-pairing tool.</p>";

function stripResearchSections(html: string): string {
  let out = html.replace(/<hr\s*\/?>\s*<h2[^>]*>\s*Research Summary\s*<\/h2>[\s\S]*$/i, "");
  out = out.replace(/<h2[^>]*>\s*Research Summary\s*<\/h2>[\s\S]*$/i, "");
  // Keep legitimate Chennai identity copy; drop only the buried research sentences.
  out = out.replace(
    /\s*offering fresh, non-recycled content angles\.\s*Competitor pages remain generic[\s\S]*?(?=<\/p>)/gi,
    ".",
  );
  out = out.replace(/\s*Competitor pages remain generic[\s\S]*?(?=<\/p>|<br)/gi, "");
  out = out.replace(/<h2>\s*\([^<]{0,80}\)\s*<\/h2>/gi, "");
  out = out.replace(/\s*Search intent here is largely informational-to-transactional[^.]*\./gi, "");
  out = out.replace(
    /\s*Competing pages tend to be outdated[\s\S]*?(?=\s*<\/p>)/gi,
    " Yaarzo offers a free community chat room instead of anonymous one-to-one stranger chat.",
  );
  out = out.replace(
    /<p>[^<]*searches tend to come from three groups[\s\S]*?<\/p>/i,
    UK_USER_OPENING,
  );
  out = out.replace(
    /Hyderabad \(India\) is under Telangana in the Pages CMS\. The slug hyderabad-india-chat-room exists so both countries can keep clear URLs\./gi,
    "This is the India Hyderabad hub in Telangana — not Hyderabad in Pakistan.",
  );
  out = out.replace(/as the Pages CMS grows\./gi, "on Yaarzo.");
  out = out.replace(/ in the Yaarzo Pages taxonomy\./gi, ".");
  return out;
}

function stripEmptyHeadings(html: string): string {
  return html.replace(/<h([1-6])\b[^>]*>\s*(?:&nbsp;|\s|<br\s*\/?>)*<\/h\1>/gi, "");
}

function stripDuplicateLeadH2(html: string, h1: string): string {
  const needle = h1.trim().toLowerCase();
  if (!needle) return html;
  return html.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i, (full, inner: string) => {
    const text = htmlToPlainText(inner).toLowerCase();
    if (!text) return "";
    if (text === needle || needle.startsWith(text) || text === needle.replace(/[:—–-].*$/, "").trim()) {
      return "";
    }
    return full;
  });
}

function applyTypos(html: string): string {
  let out = html;
  for (const [re, replacement] of TYPO_REPLACEMENTS) out = out.replace(re, replacement);
  return out;
}

function rewriteAnchors(html: string, published: Set<string>): string {
  return html.replace(
    /<a\b([^>]*?)href\s*=\s*(["'])([^"']+)\2([^>]*)>([\s\S]*?)<\/a>/gi,
    (full, pre, _q, href, post, inner) => {
      const raw = String(href).trim();
      if (!raw.startsWith("/") && !/^https?:\/\/(www\.)?yaarzo\.com/i.test(raw)) return full;
      const resolved = resolveInternalHref(raw, published);
      if (resolved.action === "keep") {
        if (raw.includes("/chatrooms")) {
          return `<a${pre}href=${_q}${raw.replace(/\/chatrooms/g, "/chatroom")}${_q}${post}>${inner}</a>`;
        }
        return full;
      }
      if (resolved.action === "unwrap" || !resolved.href) return inner;
      const next = resolved.href.startsWith("http") ? resolved.href : resolved.href;
      return `<a${pre}href=${_q}${next}${_q}${post}>${inner}</a>`;
    },
  );
}

function cleanLegalFormatting(html: string): string {
  return html
    .replace(/<h2>\s*Page Content\s*<\/h2>/gi, "")
    .replace(/Last Updated:\s*\[(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\]/gi, "Last Updated: $1/$2/$3")
    .replace(/\[Yaarzo\]/g, "Yaarzo")
    .replace(/\[support@yaarzo\.com\]/gi, "support@yaarzo.com")
    .replace(/\[INSERT TIMEFRAME,[^\]]+\]/gi, "24–48 hours")
    .replace(/\[Embed contact form here:[^\]]*\]/gi, "")
    .replace(/\[Insert social media icons\/links\]/gi, "")
    .replace(/\[\s*16\s*\]/g, "16");
}

/** Parent/related links to append only when the destination already exists. */
export const CITY_CLUSTER_LINKS: Record<string, Array<{ href: string; label: string }>> = {
  "delhi-chat-room": [
    { href: "/india-chat-room", label: "India chat rooms" },
    { href: "/mumbai-chat-room", label: "Mumbai" },
    { href: "/chennai-chat-room", label: "Chennai" },
    { href: "/girls-chat-room", label: "Girls chat" },
    { href: "/friendship-chat-room", label: "Friendship chat" },
    { href: "/chatroom", label: "live chat rooms" },
  ],
  "chennai-chat-room": [
    { href: "/india-chat-room", label: "India chat rooms" },
    { href: "/bengaluru-chat-room", label: "Bengaluru" },
    { href: "/hyderabad-india-chat-room", label: "Hyderabad (India)" },
    { href: "/friendship-chat-room", label: "Friendship chat" },
    { href: "/chatroom", label: "live chat rooms" },
  ],
  "mumbai-chat-room": [
    { href: "/india-chat-room", label: "India chat rooms" },
    { href: "/delhi-chat-room", label: "Delhi" },
    { href: "/girls-chat-room", label: "Girls chat" },
    { href: "/dating-chat-room", label: "Dating chat" },
    { href: "/friendship-chat-room", label: "Friendship chat" },
    { href: "/chatroom", label: "live chat rooms" },
  ],
  "lahore-chat-room": [
    { href: "/pakistan-chat-room", label: "Pakistan chat rooms" },
    { href: "/islamabad-chat-room", label: "Islamabad" },
    { href: "/karachi-chat-room", label: "Karachi" },
    { href: "/rawalpindi-chat-room", label: "Rawalpindi" },
    { href: "/girls-chat-room", label: "Girls chat" },
    { href: "/friendship-chat-room", label: "Friendship chat" },
    { href: "/chatroom", label: "live chat rooms" },
  ],
  "islamabad-chat-room": [
    { href: "/pakistan-chat-room", label: "Pakistan chat rooms" },
    { href: "/rawalpindi-chat-room", label: "Rawalpindi" },
    { href: "/lahore-chat-room", label: "Lahore" },
    { href: "/english-chat-room-free-online-chat", label: "English chat" },
    { href: "/chatroom", label: "live chat rooms" },
  ],
  "faisalabad-chat-room": [
    { href: "/pakistan-chat-room", label: "Pakistan chat rooms" },
    { href: "/chatroom", label: "live chat rooms" },
  ],
  "multan-chat-room": [
    { href: "/pakistan-chat-room", label: "Pakistan chat rooms" },
    { href: "/chatroom", label: "live chat rooms" },
  ],
  "usa-chat-room": [
    { href: "/uk-chat-room", label: "UK chat" },
    { href: "/english-chat-room-free-online-chat", label: "English chat" },
    { href: "/chatroom", label: "live chat rooms" },
  ],
  "uk-chat-room": [
    { href: "/usa-chat-room", label: "USA chat" },
    { href: "/english-chat-room-free-online-chat", label: "English chat" },
    { href: "/chatroom", label: "live chat rooms" },
  ],
};

function htmlHasHref(html: string, href: string): boolean {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`href\\s*=\\s*(["'])(?:https?:\\/\\/(?:www\\.)?yaarzo\\.com)?${escaped}\\/?\\1`, "i").test(html);
}

export function ensureExistingInternalLinks(html: string, slug: string): string {
  const wanted = CITY_CLUSTER_LINKS[slug];
  if (!wanted?.length) return html;
  const missing = wanted.filter((item) => !htmlHasHref(html, item.href));
  if (!missing.length) return html;
  const items = missing.map((item) => `<a href="${item.href}">${item.label}</a>`).join(", ");
  return `${html}\n<p>Related on Yaarzo: ${items}.</p>`;
}

export function rewriteCmsHtml(
  html: string,
  opts?: { h1?: string | null; publishedSlugs?: Iterable<string>; clusterSlug?: string | null },
): string {
  if (!html) return html;
  const published = publishedSet(opts?.publishedSlugs);
  let out = html;
  out = stripResearchSections(out);
  out = stripEmptyHeadings(out);
  out = stripDuplicateLeadH2(out, opts?.h1 ?? "");
  out = applyTypos(out);
  out = rewriteAnchors(out, published);
  out = cleanLegalFormatting(out);
  if (opts?.clusterSlug) out = ensureExistingInternalLinks(out, opts.clusterSlug);
  out = out.replace(/(<p>\s*(?:&nbsp;|\s|<br\s*\/?>)*<\/p>\s*){2,}/gi, "<p></p>");
  return out;
}

export function normalizeStoredCanonical(slug: string, override?: string | null): string | null {
  const path = `/${String(slug || "").replace(/^\/+/, "")}`;
  const generated = buildCanonicalUrl(DEFAULT_SITE_ORIGIN, path);
  const trimmed = override?.trim() || "";
  if (!trimmed) return null;
  const resolved = buildCanonicalUrl(DEFAULT_SITE_ORIGIN, path, trimmed);
  if (resolved === generated) return null;
  return resolved;
}

export function detectHashtagDump(tags: string[] | null | undefined): boolean {
  const list = (tags ?? []).map((t) => t.trim()).filter(Boolean);
  const chatty = list.filter((t) => /chat/i.test(t)).length;
  if (list.length >= 8 && chatty >= 5) return true;
  return list.length >= 5 && chatty >= 4;
}

/** Display-only CMS badges are not product hashtags; drop keyword-stuffed lists. */
export function reducedPublicTags(tags: string[] | null | undefined): string[] {
  const list = (tags ?? []).map((t) => t.trim()).filter(Boolean);
  if (!detectHashtagDump(list)) return list;
  return [];
}

export function detectResearchNotes(html: string): string[] {
  const lower = html.toLowerCase();
  return RESEARCH_PHRASES.filter((p) => lower.includes(p));
}

export function tokenSet(text: string): Set<string> {
  return new Set(
    htmlToPlainText(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
}

export function jaccardSimilarity(a: string, b: string): number {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  return inter / (A.size + B.size - inter);
}

export function evaluatePageQuality(input: CmsQualityInput): {
  status: CmsQualityStatus;
  warnings: CmsQualityWarning[];
  wordCount: number;
} {
  const html = `${input.intro_content ?? ""}\n${input.content ?? ""}`;
  const warnings: CmsQualityWarning[] = [];
  const indexable = input.noindex !== true;
  const h1 = (input.h1 || input.title || "").trim();
  const headings = extractHeadingTexts(html);
  const words = countWords(html);

  if (indexable && !(input.meta_title || "").trim()) {
    warnings.push({ code: "missing_meta_title", severity: "warning", message: "Missing meta title" });
  }
  if (indexable && (input.meta_title || "").trim().length > 65) {
    warnings.push({ code: "long_meta_title", severity: "warning", message: "Meta title is overly long" });
  }
  if (indexable && !(input.meta_description || "").trim()) {
    warnings.push({ code: "missing_meta_description", severity: "warning", message: "Missing meta description" });
  }
  if (indexable && (input.meta_description || "").trim().length > 0 && (input.meta_description || "").trim().length < 50) {
    warnings.push({ code: "short_meta_description", severity: "warning", message: "Meta description is extremely short" });
  }
  if (indexable && !h1) {
    warnings.push({ code: "missing_h1", severity: "critical", message: "Missing H1" });
  }
  if (headings.filter((h) => h.level === 1).length > 0) {
    warnings.push({ code: "duplicate_h1", severity: "warning", message: "Body contains an extra H1; the template already renders one" });
  }
  if (headings.some((h) => h.empty)) {
    warnings.push({ code: "empty_heading", severity: "critical", message: "Empty heading" });
  }
  const firstH2 = headings.find((h) => h.level === 2);
  if (h1 && firstH2 && firstH2.text.toLowerCase() === h1.toLowerCase()) {
    warnings.push({ code: "duplicate_h1_h2", severity: "warning", message: "First H2 repeats the H1" });
  }
  const research = detectResearchNotes(html);
  if (research.length) {
    warnings.push({
      code: "research_notes",
      severity: "critical",
      message: `Internal research notes: ${research.slice(0, 4).join(", ")}`,
    });
  }
  if ((html.match(PLACEHOLDER_RE) || []).length) {
    warnings.push({ code: "placeholder", severity: "critical", message: "Placeholder text such as [INSERT …]" });
  }
  const published = publishedSet(input.publishedSlugs);
  const broken = extractInternalHrefs(html).filter((href) => resolveInternalHref(href, published).action === "unwrap");
  if (broken.length) {
    warnings.push({ code: "broken_internal_link", severity: "critical", message: `Broken internal link (${broken.length})` });
  }
  if (extractInternalHrefs(html).some((href) => /\/chatrooms(\/|$|\?)/i.test(href))) {
    warnings.push({ code: "chatrooms_alias", severity: "warning", message: "Internal link still uses /chatrooms" });
  }
  const resolvedCanon = input.canonical_url
    ? buildCanonicalUrl(DEFAULT_SITE_ORIGIN, `/${input.slug}`, input.canonical_url)
    : buildCanonicalUrl(DEFAULT_SITE_ORIGIN, `/${input.slug}`);
  if (/yaarzo\.com\/yaarzo\.com/i.test(resolvedCanon) || /lovable\.app/i.test(resolvedCanon)) {
    warnings.push({ code: "malformed_canonical", severity: "critical", message: "Malformed canonical URL" });
  }
  if (input.canonical_url?.trim() && !/yaarzo\.com/i.test(resolvedCanon) && !resolvedCanon.startsWith(DEFAULT_SITE_ORIGIN)) {
    warnings.push({ code: "canonical_offsite", severity: "critical", message: "Canonical outside yaarzo.com" });
  }
  if (indexable && words < 180) {
    warnings.push({ code: "thin_content", severity: "warning", message: `Very thin content (${words} words)` });
  }
  if (indexable && extractInternalHrefs(html).length === 0) {
    warnings.push({ code: "no_internal_links", severity: "warning", message: "No internal links" });
  }
  if (detectHashtagDump(input.tags)) {
    warnings.push({ code: "hashtag_dump", severity: "warning", message: "Hashtag/keyword dump in tags" });
  }

  const critical = warnings.some((w) => w.severity === "critical");
  const status: CmsQualityStatus = critical
    ? "Critical"
    : warnings.length >= 3
      ? "Needs Improvement"
      : warnings.length
        ? "Good"
        : "Excellent";
  return { status, warnings, wordCount: words };
}

export function qualityStatusLabel(status: CmsQualityStatus): string {
  return status;
}

export function qualityStatusBadgeVariant(
  status: CmsQualityStatus,
): "default" | "outline" | "secondary" | "destructive" {
  if (status === "Critical") return "destructive";
  if (status === "Needs Improvement") return "secondary";
  if (status === "Good") return "outline";
  return "default";
}
