import { db } from "@/lib/content-automation/db";
import type { SeoContentType } from "@/lib/content-automation/seo-types";

export type PexelsPhoto = {
  id: number;
  url: string;
  photographer: string;
  photographer_url?: string;
  alt?: string;
  width: number;
  height: number;
  src: {
    original?: string;
    large2x?: string;
    large?: string;
    landscape?: string;
    medium?: string;
  };
};

export type RankedPexelsPhoto = {
  photo: PexelsPhoto;
  score: number;
  selectedUrl: string;
  width: number;
  height: number;
};

export function buildPexelsQuery(input: {
  topic: string;
  primaryKeyword?: string | null;
  contentType: SeoContentType;
  geo?: string | null;
}): string {
  const topic = String(input.topic || "").replace(/\bchat rooms?\b/gi, "people chatting").trim();
  const geo = input.geo?.trim();
  const parts = [geo, topic || input.primaryKeyword, "people talking online"].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").slice(0, 80);
}

export function pickPexelsUrl(photo: PexelsPhoto): { url: string; width: number; height: number } {
  const url = photo.src.large2x || photo.src.landscape || photo.src.large || photo.src.original || "";
  return { url, width: photo.width, height: photo.height };
}

export function rankPexelsPhotos(
  photos: PexelsPhoto[],
  query: string,
  usedIds: Set<number>,
  preferLandscape = true,
): RankedPexelsPhoto[] {
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const ranked = photos.map((photo) => {
    let score = 0;
    const aspect = photo.height > 0 ? photo.width / photo.height : 0;
    if (preferLandscape && photo.width >= photo.height) score += 30;
    if (Math.abs(aspect - 16 / 9) < 0.18) score += 20;
    if (photo.width >= 1200) score += 20;
    else if (photo.width >= 800) score += 10;
    const hay = `${photo.alt || ""} ${photo.url}`.toLowerCase();
    for (const token of tokens) if (hay.includes(token)) score += 6;
    if (usedIds.has(photo.id)) score -= 80;
    const { url, width, height } = pickPexelsUrl(photo);
    if (!url) score -= 50;
    return { photo, score, selectedUrl: url, width, height };
  });
  return ranked.sort((a, b) => b.score - a.score);
}

export function pexelsAttributionHtml(photo: PexelsPhoto): string {
  const name = photo.photographer || "Pexels photographer";
  const personUrl = photo.photographer_url || photo.url;
  return `Photo by <a href="${personUrl}" rel="noopener noreferrer">${name}</a> on <a href="${photo.url}" rel="noopener noreferrer">Pexels</a>`;
}

export function buildPexelsFigureHtml(input: {
  src: string;
  alt: string;
  width: number;
  height: number;
  attribution: string;
  optimizeMarkup?: boolean;
}): string {
  const w = input.width || 1200;
  const h = input.height || 675;
  const img = input.optimizeMarkup === false
    ? `<img src="${input.src}" alt="${escapeAttr(input.alt)}" />`
    : `<img src="${input.src}" alt="${escapeAttr(input.alt)}" width="${w}" height="${h}" loading="lazy" decoding="async" />`;
  return [
    `<figure class="content-featured-image">`,
    img,
    `<figcaption>${input.attribution}</figcaption>`,
    `</figure>`,
  ].join("");
}

export function attachFeaturedImageHtml(html: string, figureHtml: string): string {
  if (/<!--\s*IMAGE:/i.test(html)) {
    return html.replace(/<!--\s*IMAGE:[\s\S]*?-->/i, figureHtml);
  }
  const close = /<\/p>/i.exec(html);
  if (close) {
    const i = close.index + close[0].length;
    return `${html.slice(0, i)}\n${figureHtml}${html.slice(i)}`;
  }
  return `${figureHtml}\n${html}`;
}

export function describeImageAlt(topic: string, photoAlt?: string | null): string {
  const fromPhoto = String(photoAlt || "").trim();
  if (fromPhoto && fromPhoto.length > 8 && !/stock|pexels/i.test(fromPhoto)) return fromPhoto.slice(0, 140);
  const clean = topic.replace(/\s+/g, " ").trim();
  return `People connecting online around ${clean}`.slice(0, 140);
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

async function usedPexelsIds(): Promise<Set<number>> {
  const { data, error } = await db().from("seo_pexels_images").select("pexels_photo_id");
  if (error) return new Set();
  return new Set((data ?? []).map((r: { pexels_photo_id: number }) => Number(r.pexels_photo_id)));
}

export async function searchPexels(query: string, perPage = 15): Promise<PexelsPhoto[]> {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) throw new Error("PEXELS_API_KEY is not set");
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Authorization: key },
  });
  if (res.status === 429) throw new Error("Pexels rate limit");
  if (!res.ok) throw new Error(`Pexels HTTP ${res.status}`);
  const json = (await res.json()) as { photos?: PexelsPhoto[] };
  return Array.isArray(json.photos) ? json.photos : [];
}

export type AttachPexelsResult = {
  ok: boolean;
  html: string;
  imageStatus: "ready" | "failed" | "pending";
  photoId?: number;
  imageUrl?: string;
  error?: string;
  ogImage?: string;
};

export async function attachPexelsImage(input: {
  html: string;
  topic: string;
  primaryKeyword?: string | null;
  contentType: SeoContentType;
  sourceId?: string;
  geo?: string | null;
  preferLandscape?: boolean;
  preventDuplicates?: boolean;
  optimizeMarkup?: boolean;
}): Promise<AttachPexelsResult> {
  const query = buildPexelsQuery(input);
  try {
    const photos = await searchPexels(query);
    if (photos.length === 0) {
      await recordImageFailure(input, query, "No suitable Pexels results");
      return { ok: false, html: input.html, imageStatus: "pending", error: "No suitable Pexels results" };
    }
    const used = input.preventDuplicates === false ? new Set<number>() : await usedPexelsIds();
    const ranked = rankPexelsPhotos(photos, query, used, input.preferLandscape !== false);
    const best = ranked.find((r) => r.selectedUrl && (!used.has(r.photo.id) || ranked.every((x) => used.has(x.photo.id))));
    if (!best?.selectedUrl) {
      await recordImageFailure(input, query, "No unused relevant photo");
      return { ok: false, html: input.html, imageStatus: "pending", error: "No unused relevant photo" };
    }
    const alt = describeImageAlt(input.topic, best.photo.alt);
    const figure = buildPexelsFigureHtml({
      src: best.selectedUrl,
      alt,
      width: best.width,
      height: best.height,
      attribution: pexelsAttributionHtml(best.photo),
      optimizeMarkup: input.optimizeMarkup,
    });
    const html = attachFeaturedImageHtml(input.html, figure);
    const { data } = await db()
      .from("seo_pexels_images")
      .insert({
        content_type: input.contentType,
        source_id: input.sourceId ?? null,
        pexels_photo_id: best.photo.id,
        pexels_page_url: best.photo.url,
        photographer_name: best.photo.photographer,
        photographer_url: best.photo.photographer_url ?? null,
        source_url: best.photo.url,
        selected_image_url: best.selectedUrl,
        width: best.width,
        height: best.height,
        search_query: query,
        alt_text: alt,
        caption: `Photo by ${best.photo.photographer} on Pexels`,
        status: "attached",
      })
      .select("id")
      .maybeSingle();
    if (data && input.sourceId) {
      await db().from("seo_pexels_images").update({ source_id: input.sourceId }).eq("id", data.id);
    }
    return {
      ok: true,
      html,
      imageStatus: "ready",
      photoId: best.photo.id,
      imageUrl: best.selectedUrl,
      ogImage: best.selectedUrl,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await recordImageFailure(input, query, message);
    return { ok: false, html: input.html, imageStatus: "failed", error: message };
  }
}

async function recordImageFailure(
  input: { contentType: SeoContentType; sourceId?: string },
  query: string,
  error: string,
) {
  await db().from("seo_pexels_images").insert({
    content_type: input.contentType,
    source_id: input.sourceId ?? null,
    pexels_photo_id: 0,
    search_query: query,
    status: "failed",
    error: error.slice(0, 500),
  });
}

export async function listPexelsImages(status?: string, limit = 40) {
  let q = db().from("seo_pexels_images").select("*").order("created_at", { ascending: false }).limit(limit);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

export function shouldReplaceExistingImage(html: string, ogImage?: string | null): boolean {
  const hasImg = /<img\b/i.test(html || "");
  const hasOg = Boolean(ogImage && /^https?:\/\//i.test(ogImage));
  return !hasImg && !hasOg;
}
