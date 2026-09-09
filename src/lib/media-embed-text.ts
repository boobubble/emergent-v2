import { parseGiphyUrl, parseYoutubeId } from "./media-providers-config";

/** First http(s) URL token in message text. */
export function firstUrlInText(text: string): string | null {
  const m = (text || "").match(/https?:\/\/\S+/);
  return m ? m[0] : null;
}

/** First URL that MediaEmbed would render (YouTube or Giphy). */
export function firstEmbeddableMediaUrl(text: string): string | null {
  const url = firstUrlInText(text);
  if (!url) return null;
  if (parseYoutubeId(url)) return url;
  if (parseGiphyUrl(url)) return url;
  if (/\.gif($|\?)/i.test(url) && /giphy\.com/i.test(url)) return url;
  return null;
}

/** Remove the first embeddable media URL from message text to avoid duplicate link + card. */
export function stripEmbeddableUrlFromText(text: string): string {
  const url = firstEmbeddableMediaUrl(text);
  if (!url) return text;
  return text.replace(url, "").replace(/\s{2,}/g, " ").trim();
}
