import { useMemo, useState } from "react";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaFromSettings, resolveActiveMediaEmbed } from "@/lib/media-embed-text";
import { parseGiphyUrl } from "@/lib/media-providers-config";

/** Giphy-only rich media for IRC messages (YouTube stays a normal link). */
export function IrcMessageGiphyEmbed({ text }: { text: string }) {
  const { raw } = useAppSettings();
  const media = useMemo(() => mergeMediaFromSettings(raw), [raw]);
  const resolved = useMemo(() => resolveActiveMediaEmbed(text, media), [text, media]);
  const [failed, setFailed] = useState(false);

  if (!resolved.willRender || resolved.kind !== "giphy" || !resolved.url) {
    return null;
  }

  const giphy = parseGiphyUrl(resolved.url);
  const imgSrc = giphy?.gifUrl ?? (/\.gif($|\?)/i.test(resolved.url) ? resolved.url : null);
  if (!imgSrc || failed) {
    return (
      <a
        href={resolved.url}
        target="_blank"
        rel="noreferrer noopener"
        className="irc-msg-giphy-fallback mt-1 text-xs text-primary hover:underline"
      >
        {resolved.url}
      </a>
    );
  }

  return (
    <a
      href={resolved.url}
      target="_blank"
      rel="noreferrer noopener"
      className="irc-msg-giphy mt-1 block max-w-[min(100%,280px)] overflow-hidden rounded-xl border border-border/80 bg-black/20"
    >
      <img
        src={imgSrc}
        alt="GIF"
        loading="lazy"
        className="block max-h-72 w-full object-contain"
        onError={() => setFailed(true)}
      />
    </a>
  );
}
