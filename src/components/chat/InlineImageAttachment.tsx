import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import type { Attachment } from "@/lib/chat-types";
import { isChatImageExpired, isEphemeralChatImage, isLegacyInlineImage } from "@/lib/chat-image-retention";
import { resolveChatImageUrl } from "@/lib/chat-image.functions";

const RESOLVE_RETRY_MS = [0, 400, 1200, 2500];

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
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const attempt = (attemptIdx: number) => {
      void resolveUrl({ data: { assetId: a.assetId! } })
        .then((res) => {
          if (cancelled) return;
          if (res.forbidden) {
            const next = RESOLVE_RETRY_MS[attemptIdx + 1];
            if (next != null) {
              timeouts.push(setTimeout(() => attempt(attemptIdx + 1), next));
              return;
            }
            setBroken(true);
            return;
          }
          if (res.expired || !res.url) {
            setBroken(true);
            return;
          }
          setBroken(false);
          setSrc(res.url);
        })
        .catch(() => {
          if (cancelled) return;
          const next = RESOLVE_RETRY_MS[attemptIdx + 1];
          if (next != null) {
            timeouts.push(setTimeout(() => attempt(attemptIdx + 1), next));
            return;
          }
          setBroken(true);
        });
    };

    attempt(0);
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [a.assetId, a.dataUrl, ephemeral, expired, resolveUrl]);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
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
    ? "block h-16 w-16 object-contain"
    : "block max-h-72 w-full max-w-[280px] object-contain bg-black/30";

  return (
    <>
      <div className="mt-1 flex max-w-[280px] flex-col gap-1">
        <div className="overflow-hidden rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="block w-full cursor-zoom-in text-left"
            aria-label={`View image ${a.name}`}
          >
            <img
              src={src}
              alt={a.name}
              loading="lazy"
              className={previewClass}
              onError={() => setBroken(true)}
            />
          </button>
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
      {lightbox && src && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            className="absolute top-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20"
            aria-label="Close image"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={src}
            alt={a.name}
            className="max-h-[90vh] max-w-[min(100vw-2rem,56rem)] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body,
      )}
    </>
  );
}
