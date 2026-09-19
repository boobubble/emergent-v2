import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, FileText, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import type { IrcMessageAttachment } from "@/lib/irc-chat/irc-attachment";
import { resolveIrcChatAttachmentUrl } from "@/lib/irc-chat-attachment.functions";
import { cn } from "@/lib/utils";

function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(mime: string): string {
  const m = mime.toLowerCase();
  if (m === "application/pdf") return "PDF";
  if (m === "text/plain") return "TXT";
  if (m.startsWith("image/")) return m.slice("image/".length).toUpperCase();
  return "File";
}

export function IrcMessageImageAttachment({
  attachment,
  className,
}: {
  attachment: IrcMessageAttachment;
  className?: string;
}) {
  const [src, setSrc] = useState(attachment.url ?? "");
  const [broken, setBroken] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const resolveUrl = useServerFn(resolveIrcChatAttachmentUrl);

  useEffect(() => {
    if (attachment.url) {
      setSrc(attachment.url);
      setBroken(false);
      return;
    }
    let cancelled = false;
    void resolveUrl({ data: { assetId: attachment.id } })
      .then((res) => {
        if (cancelled) return;
        if (res.forbidden || res.expired || !res.url) {
          setBroken(true);
          return;
        }
        setSrc(res.url);
        setBroken(false);
      })
      .catch(() => {
        if (!cancelled) setBroken(true);
      });
    return () => {
      cancelled = true;
    };
  }, [attachment.id, attachment.url, resolveUrl]);

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

  if (broken) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>Image unavailable</p>
    );
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "irc-attachment-image-btn block max-w-full overflow-hidden rounded-xl border border-white/5 bg-black/20",
          className,
        )}
        onClick={() => src && setLightbox(true)}
        aria-label={`Open image ${attachment.fileName}`}
      >
        {src ? (
          <img
            src={src}
            alt={attachment.fileName}
            loading="lazy"
            className="irc-attachment-image max-h-72 w-auto max-w-full object-contain"
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="block px-4 py-8 text-xs text-muted-foreground">Loading image…</span>
        )}
      </button>
      {lightbox && src
        ? createPortal(
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4"
              role="dialog"
              aria-modal="true"
              onClick={() => setLightbox(false)}
            >
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white"
                aria-label="Close"
                onClick={() => setLightbox(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={src}
                alt={attachment.fileName}
                className="max-h-[90vh] max-w-[min(96vw,1200px)] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function IrcMessageFileAttachment({
  attachment,
  className,
}: {
  attachment: IrcMessageAttachment;
  className?: string;
}) {
  const [href, setHref] = useState(attachment.url ?? "");
  const resolveUrl = useServerFn(resolveIrcChatAttachmentUrl);

  useEffect(() => {
    if (attachment.url) {
      setHref(attachment.url);
      return;
    }
    let cancelled = false;
    void resolveUrl({ data: { assetId: attachment.id } })
      .then((res) => {
        if (cancelled) return;
        if (!res.forbidden && !res.expired && res.url) setHref(res.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [attachment.id, attachment.url, resolveUrl]);

  const sizeLabel = formatFileSize(attachment.size);
  const meta = [fileTypeLabel(attachment.mimeType), sizeLabel].filter(Boolean).join(" • ");

  return (
    <div
      className={cn(
        "irc-attachment-file flex max-w-full items-start gap-3 rounded-xl border border-white/5 bg-muted/20 px-3 py-2.5",
        className,
      )}
    >
      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{attachment.fileName}</p>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            <span className="sm:hidden">Open</span>
            <span className="hidden sm:inline">Open / Download</span>
          </a>
        ) : (
          <span className="mt-1 text-xs text-muted-foreground">Preparing link…</span>
        )}
      </div>
    </div>
  );
}
