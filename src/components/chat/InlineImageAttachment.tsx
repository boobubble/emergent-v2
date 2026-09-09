import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Attachment } from "@/lib/chat-types";

export function InlineImageAttachment({ a }: { a: Attachment }) {
  const [broken, setBroken] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const isSticker = a.mime === "image/gif" || /\.gif$/i.test(a.name || "");

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (broken) {
    return (
      <div className="mt-1 flex max-w-[280px] flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span>Image unavailable</span>
        <a href={a.dataUrl} download={a.name} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          <Download className="h-3 w-3" />
          Download
        </a>
      </div>
    );
  }

  const previewClass = isSticker
    ? "block h-16 w-16 object-contain"
    : "block max-h-72 w-full max-w-[280px] object-contain bg-black/30";

  return (
    <>
      <div className="mt-1 flex max-w-[280px] flex-col gap-1">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="overflow-hidden rounded-xl border border-border text-left"
          aria-label={`View image ${a.name}`}
        >
          <img
            src={a.dataUrl}
            alt={a.name}
            loading="lazy"
            className={previewClass}
            onError={() => setBroken(true)}
          />
        </button>
        {!isSticker && (
          <a
            href={a.dataUrl}
            download={a.name}
            className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
          >
            <Download className="h-3 w-3" />
            Download
          </a>
        )}
      </div>
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(false)}
        >
          <img
            src={a.dataUrl}
            alt={a.name}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
