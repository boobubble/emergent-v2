import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaConfig, parseYoutubeId, parseGiphyUrl } from "@/lib/media-providers-config";

/** First URL token in the message. */
function firstUrl(text: string): string | null {
  const m = (text || "").match(/https?:\/\/\S+/);
  return m ? m[0] : null;
}

/** Detect and render YouTube / Giphy embeds from message text. */
export function MediaEmbed({ text }: { text: string }) {
  const { raw } = useAppSettings();
  const media = mergeMediaConfig((raw as any).media);
  const url = firstUrl(text);
  if (!url) return null;

  const ytId = parseYoutubeId(url);
  if (ytId && media.youtube.enabled) {
    const host = media.youtube.defaultPrivacy === "unlisted"
      ? "https://www.youtube-nocookie.com"
      : "https://www.youtube.com";
    return (
      <div className="mt-1 max-w-[320px] overflow-hidden rounded-xl border border-border bg-black">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`${host}/embed/${ytId}`}
            title="YouTube video"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    );
  }

  const giphy = parseGiphyUrl(url);
  if (giphy && media.giphy.enabled) {
    return (
      <a href={url} target="_blank" rel="noreferrer"
         className="mt-1 block max-w-[280px] overflow-hidden rounded-xl border border-border">
        <img src={giphy.gifUrl} alt="GIF" className="block max-h-72 w-full object-contain bg-black/30" />
      </a>
    );
  }

  // Direct giphy media url
  if (/\.gif($|\?)/i.test(url) && /giphy\.com/i.test(url) && media.giphy.enabled) {
    return (
      <a href={url} target="_blank" rel="noreferrer"
         className="mt-1 block max-w-[280px] overflow-hidden rounded-xl border border-border">
        <img src={url} alt="GIF" className="block max-h-72 w-full object-contain bg-black/30" />
      </a>
    );
  }

  return null;
}
