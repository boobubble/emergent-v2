import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import type { Attachment } from "@/lib/chat-types";
import { isChatImageExpired, isEphemeralChatImage, isLegacyInlineImage } from "@/lib/chat-image-retention";
import { resolveChatImageUrl } from "@/lib/chat-image.functions";

export function InlineImageAttachment({ a }: { a: Attachment }) {
  const [broken, setBroken] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [src, setSrc] = useState(isLegacyInlineImage(a) ? a.dataUrl : "");
  const resolveUrl = useServerFn(resolveChatImageUrl);
  const isSticker = a.mime === "image/gif" || /\.gif$/i.test(a.name || "");
  const expired = isChatImageExpired(a);
  const ephemeral = isEphemeralChatImage(a);

  useEffect(() => {
    if (expired) return;
    if (!ephemeral) {
      if (isLegacyInlineImage(a)) setSrc(a.dataUrl);
      return;
    }
    if (!a.assetId) {
      setBroken(true);
      return;
    }
    let cancelled = false;
    void resolveUrl({ data: { assetId: a.assetId } })
      .then((res) => {
        if (cancelled) return;
        if (res.forbidden) {
          setBroken(true);
          return;
        }
        if (res.expired || !res.url) {
          setBroken(true);
          return;
        }
        setSrc(res.url);
      })
      .catch(() => {
        if (!cancelled) setBroken(true);
      });
    return () => { cancelled = true; };
  }, [a.assetId, a.dataUrl, ephemeral, expired, resolveUrl]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (expired) {
    return (
      <div className="mt-1 flex max-w-[280px] items-center rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Image expired
      </div>
    );
  }

  if (broken && !isLegacyInlineImage(a)) {
    return (
      <div className="mt-1 flex max-w-[280px] items-center rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Image unavailable
      </div>
    );
  }

  const previewClass = isSticker
    ? "block h-16 w-16 cursor-zoom-in object-contain"
    : "block max-h-72 w-full max-w-[280px] cursor-zoom-in object-contain bg-black/30";

  return (
    <>
      <div className="mt-1 flex max-w-[280px] flex-col gap-1">
        <div className="overflow-hidden rounded-xl border border-border">
          <img
            src={src}
            alt={a.name}
            loading="lazy"
            className={previewClass}
            onClick={() => setLightbox(true)}
            onError={() => setBroken(true)}
          />
        </div>
        {!isSticker && src && (
          <a
            href={src}
            download={a.name}
            className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
          >
            <Download className="h-3 w-3" />
            Download
          </a>
        )}
      </div>
      {lightbox && src && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(false)}
        >
          <img
            src={src}
            alt={a.name}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
