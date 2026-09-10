import {
  mergeMediaConfig,
  parseGiphyUrl,
  parseYoutubeId,
  type MediaConfig,
} from "./media-providers-config";

/** Strip trailing punctuation often glued to pasted URLs. */
export function trimUrlTrailingPunctuation(url: string): string {
  return url.replace(/[)\]},.!?:;]+$/, "");
}

/** First http(s) URL token in message text. */
export function firstUrlInText(text: string): string | null {
  const m = (text || "").match(/https?:\/\/\S+/);
  return m ? trimUrlTrailingPunctuation(m[0]) : null;
}

/** First URL that could be embedded (YouTube or Giphy), regardless of provider settings. */
export function firstEmbeddableMediaUrl(text: string): string | null {
  const url = firstUrlInText(text);
  if (!url) return null;
  if (parseYoutubeId(url)) return url;
  if (parseGiphyUrl(url)) return url;
  if (/\.gif($|\?)/i.test(url) && /giphy\.com/i.test(url)) return url;
  return null;
}

export type ActiveMediaEmbedKind = "youtube" | "giphy";

export type ActiveMediaEmbed = {
  url: string | null;
  kind: ActiveMediaEmbedKind | null;
  willRender: boolean;
};

/** Whether MediaEmbed would render for this text given current provider settings. */
export function resolveActiveMediaEmbed(text: string, mediaInput?: unknown): ActiveMediaEmbed {
  const media = mergeMediaConfig(mediaInput);
  const url = firstUrlInText(text);
  if (!url) return { url: null, kind: null, willRender: false };

  // YouTube paste-to-embed is always on; admin "enabled" only gates the search picker/API key.
  const ytId = parseYoutubeId(url);
  if (ytId) {
    return { url, kind: "youtube", willRender: true };
  }

  const giphy = parseGiphyUrl(url);
  if (giphy && media.giphy.enabled) {
    return { url, kind: "giphy", willRender: true };
  }

  if (/\.gif($|\?)/i.test(url) && /giphy\.com/i.test(url) && media.giphy.enabled) {
    return { url, kind: "giphy", willRender: true };
  }

  return { url, kind: null, willRender: false };
}

/** Remove embeddable URL only when the same URL would actively render as media. */
export function stripEmbeddableUrlFromText(text: string, mediaInput?: unknown): string {
  const resolved = resolveActiveMediaEmbed(text, mediaInput);
  if (!resolved.willRender || !resolved.url) return text;
  return text.replace(resolved.url, "").replace(/\s{2,}/g, " ").trim();
}

/** Safe display text: never hide content when media will not render. */
export function messageDisplayText(
  text: string,
  mediaInput?: unknown,
  opts?: { hasAttachment?: boolean },
): string {
  const safe = (text || "").trim();
  const stripped = stripEmbeddableUrlFromText(safe, mediaInput);
  if (stripped) return stripped;
  const resolved = resolveActiveMediaEmbed(safe, mediaInput);
  if (resolved.willRender || opts?.hasAttachment) return stripped;
  return safe;
}

export function mergeMediaFromSettings(raw: unknown): MediaConfig {
  return mergeMediaConfig((raw as { media?: unknown } | null)?.media);
}
