import { Play } from "lucide-react";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaFromSettings, resolveActiveMediaEmbed } from "@/lib/media-embed-text";
import { parseYoutubeId, parseGiphyUrl } from "@/lib/media-providers-config";
import { youtubeThumbnailUrl, youtubeWatchUrl } from "./youtube-embed-url";
import { useOptionalYouTubePlayer } from "./youtube-player-context";

function YoutubePreviewCard({
  videoId,
  watchUrl,
  sourceUrl,
}: {
  videoId: string;
  watchUrl: string;
  sourceUrl: string;
}) {
  const player = useOptionalYouTubePlayer();
  const thumb = youtubeThumbnailUrl(videoId);

  return (
    <div className="mt-1 max-w-[320px]">
      <div className="overflow-hidden rounded-xl border border-border bg-black">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <button
            type="button"
            onClick={() => {
              player?.openPlayer({
                videoId,
                url: watchUrl,
                title: "YouTube video",
              });
            }}
            className="absolute inset-0 h-full w-full"
            aria-label="Play video"
            disabled={!player}
          >
            {thumb && (
              <img
                src={thumb}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/35">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-red-600 text-white shadow-lg">
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              </span>
            </span>
          </button>
        </div>
        <div className="border-t border-border/60 bg-card/80 px-2 py-1.5">
          <p className="truncate text-[11px] font-medium text-foreground">YouTube video</p>
        </div>
      </div>
      <a
        href={watchUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-1 block truncate text-[10px] text-primary hover:underline"
      >
        {sourceUrl}
      </a>
    </div>
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
    const watchUrl = youtubeWatchUrl(ytId);
    if (!watchUrl) return null;
    return (
      <YoutubePreviewCard videoId={ytId} watchUrl={watchUrl} sourceUrl={resolved.url} />
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
