import type { ResolvedSeo, SeoGlobal } from "./types";

type HeadMeta = { title?: string; name?: string; property?: string; content?: string; charSet?: string };

export function buildHeadMeta(seo: ResolvedSeo, global?: SeoGlobal | null): HeadMeta[] {
  const meta: HeadMeta[] = [
    { title: seo.title },
    { name: "description", content: seo.description },
  ];
  if (seo.keywords) meta.push({ name: "keywords", content: seo.keywords });
  if (seo.robots) meta.push({ name: "robots", content: seo.robots });
  if (global?.author) meta.push({ name: "author", content: global.author });
  if (global?.theme_color) meta.push({ name: "theme-color", content: global.theme_color });
  if (global?.google_verification) meta.push({ name: "google-site-verification", content: global.google_verification });
  if (global?.bing_verification) meta.push({ name: "msvalidate.01", content: global.bing_verification });
  if (global?.yandex_verification) meta.push({ name: "yandex-verification", content: global.yandex_verification });
  if (global?.baidu_verification) meta.push({ name: "baidu-site-verification", content: global.baidu_verification });

  meta.push(
    { property: "og:title", content: seo.ogTitle },
    { property: "og:description", content: seo.ogDescription },
    { property: "og:type", content: seo.ogType },
  );
  if (seo.ogImage) meta.push({ property: "og:image", content: seo.ogImage });
  if (seo.canonical) meta.push({ property: "og:url", content: seo.canonical });

  meta.push({ name: "twitter:card", content: seo.twitterCard });
  meta.push({ name: "twitter:title", content: seo.twitterTitle });
  meta.push({ name: "twitter:description", content: seo.twitterDescription });
  if (seo.twitterImage) meta.push({ name: "twitter:image", content: seo.twitterImage });
  if (global?.twitter_site) meta.push({ name: "twitter:site", content: global.twitter_site });
  if (global?.twitter_creator) meta.push({ name: "twitter:creator", content: global.twitter_creator });
  if (global?.facebook_app_id) meta.push({ property: "fb:app_id", content: global.facebook_app_id });

  return meta;
}

export function buildHeadLinks(seo: ResolvedSeo): { rel: string; href: string }[] {
  if (!seo.canonical) return [];
  return [{ rel: "canonical", href: seo.canonical }];
}

export function buildJsonLdScripts(jsonLd: Record<string, string | number | boolean | null> | null | undefined): { type: string; children: string }[] {
  if (!jsonLd || !Object.keys(jsonLd).length) return [];
  try {
    return [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }];
  } catch {
    return [];
  }
}

/** Sanitize and build template variables for dynamic route SEO. */

export function sanitizeTemplateValue(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeTemplateVars(vars: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    out[key] = sanitizeTemplateValue(value);
  }
  return out;
}

export function stripUnresolvedTemplateVars(text: string): string {
  return text
    .replace(/\{\{[a-z_][a-z0-9_]*\}\}/gi, "")
    .replace(/\{[a-z_][a-z0-9_]*\}/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([|–—-])/g, " $1")
    .replace(/([|–—-])\s+/g, "$1 ")
    .trim();
}

export function buildCompetitionSeoVars(input: {
  competition: Record<string, unknown>;
  slug: string;
  siteName: string;
  origin: string;
}): Record<string, string> {
  const c = input.competition;
  const category = (c.category as { name?: string } | null)?.name
    ?? sanitizeTemplateValue(c.category_name);
  return sanitizeTemplateVars({
    site_name: input.siteName,
    competition_name: c.name,
    title: c.name,
    slug: input.slug,
    description: c.description,
    category,
    country: c.country,
    start_date: c.start_at,
    end_date: c.end_at,
    prize: c.prize ?? c.reward_summary,
    image: c.banner_url ?? c.cover_url ?? c.image_url,
    canonical_url: `${input.origin}/competitions/${input.slug}`,
  });
}

export function buildCommunitySeoVars(input: {
  community: Record<string, unknown>;
  slug: string;
  siteName: string;
  origin: string;
  ownerName?: string;
}): Record<string, string> {
  const c = input.community;
  return sanitizeTemplateVars({
    site_name: input.siteName,
    community_name: c.name,
    title: c.name,
    slug: input.slug,
    description: c.description,
    category: c.category,
    country: c.country,
    language: c.language,
    owner_name: input.ownerName ?? c.owner_name,
    image: c.banner_url ?? c.avatar_url,
    canonical_url: `${input.origin}/community/${input.slug}`,
  });
}

export function buildPoetrySeoVars(input: {
  poem: Record<string, unknown>;
  slug: string;
  siteName: string;
  origin: string;
}): Record<string, string> {
  const p = input.poem;
  const author = p.author as { display_name?: string; username?: string } | null | undefined;
  const authorName = author?.display_name || author?.username || "Anonymous";
  const category = (p.category as { name?: string } | null)?.name;
  return sanitizeTemplateVars({
    site_name: input.siteName,
    poetry_title: p.title,
    title: p.seo_title || p.title,
    slug: input.slug,
    description: p.seo_description || p.excerpt || p.body,
    category,
    author_name: authorName,
    username: author?.username,
    image: p.cover_url,
    canonical_url: `${input.origin}/poetry/${input.slug}`,
  });
}

export function buildFeedPostSeoVars(input: {
  post: Record<string, unknown>;
  slug: string;
  siteName: string;
  origin: string;
  authorName: string;
  authorUsername?: string | null;
}): Record<string, string> {
  const text = sanitizeTemplateValue(input.post.text);
  const excerpt = text.slice(0, 160);
  return sanitizeTemplateVars({
    site_name: input.siteName,
    title: text ? `${input.authorName}: ${text.slice(0, 60)}` : `${input.authorName} shared a post`,
    slug: input.slug,
    description: excerpt || `See ${input.authorName}'s latest post.`,
    post_excerpt: excerpt,
    author_name: input.authorName,
    username: input.authorUsername,
    image: Array.isArray(input.post.media_urls) ? input.post.media_urls[0] : undefined,
    canonical_url: `${input.origin}/feed/${input.slug}`,
  });
}

export function buildProfileSeoVars(input: {
  profile: Record<string, unknown>;
  username: string;
  siteName: string;
  origin: string;
}): Record<string, string> {
  const p = input.profile;
  const name = sanitizeTemplateValue(p.display_name) || input.username;
  const bio = sanitizeTemplateValue(p.bio);
  return sanitizeTemplateVars({
    site_name: input.siteName,
    name,
    username: input.username,
    bio,
    description: bio || `${name} on ${input.siteName}`,
    country: p.country,
    avatar: p.avatar_url,
    canonical_url: `${input.origin}/u/${input.username}`,
  });
}

export function buildGameSeoVars(input: {
  game: Record<string, unknown>;
  slug: string;
  siteName: string;
  origin: string;
}): Record<string, string> {
  const g = input.game;
  return sanitizeTemplateVars({
    site_name: input.siteName,
    game_name: g.name ?? g.title,
    title: g.name ?? g.title,
    slug: input.slug,
    description: g.description,
    category: g.category,
    image: g.image ?? g.cover_url,
    canonical_url: `${input.origin}/games/${input.slug}`,
  });
}

export function buildCmsPageSeoVars(input: {
  page: Record<string, unknown>;
  slug: string;
  siteName: string;
  origin: string;
}): Record<string, string> {
  const p = input.page;
  return sanitizeTemplateVars({
    site_name: input.siteName,
    title: p.meta_title || p.title,
    name: p.title,
    slug: input.slug,
    description: p.meta_description || p.excerpt,
    author_name: p.author_name,
    canonical_url: p.canonical_url || `${input.origin}/${input.slug}`,
  });
}
