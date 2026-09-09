import { useState } from "react";
import { Play } from "lucide-react";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaFromSettings, resolveActiveMediaEmbed } from "@/lib/media-embed-text";
import { parseYoutubeId, parseGiphyUrl } from "@/lib/media-providers-config";

function LazyYoutubeEmbed({
  videoId,
  host,
}: {
  videoId: string;
  host: string;
}) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="absolute inset-0 h-full w-full"
        aria-label="Play YouTube video"
      >
        <img
          src={thumb}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute inset-0 grid place-items-center bg-black/35">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-red-600 text-white shadow-lg">
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <iframe
      src={`${host}/embed/${videoId}?autoplay=1`}
      title="YouTube video"
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="absolute inset-0 h-full w-full"
    />
  );
}

/** Detect and render YouTube / Giphy embeds from message text. */
export function MediaEmbed({ text }: { text: string }) {
  const { raw } = useAppSettings();
  const media = mergeMediaFromSettings(raw);
  const resolved = resolveActiveMediaEmbed(text, media);
  if (!resolved.willRender || !resolved.url) return null;

  if (resolved.kind === "youtube") {
    const ytId = parseYoutubeId(resolved.url);
    if (!ytId) return null;
    const host = media.youtube.defaultPrivacy === "unlisted"
      ? "https://www.youtube-nocookie.com"
      : "https://www.youtube.com";
    return (
      <div className="mt-1 max-w-[320px] overflow-hidden rounded-xl border border-border bg-black">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <LazyYoutubeEmbed videoId={ytId} host={host} />
        </div>
      </div>
    );
  }

  const giphy = parseGiphyUrl(resolved.url);
  if (giphy) {
    return (
      <a href={resolved.url} target="_blank" rel="noreferrer"
         className="mt-1 block max-w-[280px] overflow-hidden rounded-xl border border-border">
        <img src={giphy.gifUrl} alt="GIF" loading="lazy" className="block max-h-72 w-full object-contain bg-black/30" />
      </a>
    );
  }

  if (/\.gif($|\?)/i.test(resolved.url) && /giphy\.com/i.test(resolved.url)) {
    return (
      <a href={resolved.url} target="_blank" rel="noreferrer"
         className="mt-1 block max-w-[280px] overflow-hidden rounded-xl border border-border">
        <img src={resolved.url} alt="GIF" loading="lazy" className="block max-h-72 w-full object-contain bg-black/30" />
      </a>
    );
  }

  return null;
}
