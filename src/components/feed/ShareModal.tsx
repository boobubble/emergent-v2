import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Link2, X, Check, Search } from "lucide-react";
import { toast } from "sonner";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
  /** Optional image URL — used by Pinterest media share */
  image?: string;
};

type Target = {
  name: string;
  href: string;
  bg: string;
  icon: JSX.Element;
};

export function ShareModal({ payload, onClose }: { payload: SharePayload; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const targets = useMemo<Target[]>(() => {
    const u = encodeURIComponent(payload.url);
    const t = encodeURIComponent(payload.title);
    const txt = encodeURIComponent(payload.text || payload.title);
    const both = encodeURIComponent(`${payload.text || payload.title}\n\n${payload.url}`);
    const img = encodeURIComponent(payload.image || "");

    return [
      { name: "WhatsApp", href: `https://wa.me/?text=${both}`, bg: "#25D366", icon: <I.WhatsApp /> },
      { name: "SMS", href: `sms:?&body=${both}`, bg: "#34B7F1", icon: <I.SMS /> },
      { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, bg: "#1877F2", icon: <I.Facebook /> },
      { name: "Messenger", href: `https://www.facebook.com/dialog/send?link=${u}&app_id=291494419107518&redirect_uri=${u}`, bg: "#0084FF", icon: <I.Messenger /> },
      { name: "Twitter", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, bg: "#000000", icon: <I.Twitter /> },
      { name: "Gmail", href: `https://mail.google.com/mail/?view=cm&fs=1&su=${t}&body=${both}`, bg: "#EA4335", icon: <I.Gmail /> },
      { name: "VK", href: `https://vk.com/share.php?url=${u}&title=${t}&description=${txt}`, bg: "#4A76A8", icon: <I.VK /> },
      { name: "OK.ru", href: `https://connect.ok.ru/offer?url=${u}&title=${t}&description=${txt}`, bg: "#EE8208", icon: <I.OK /> },
      { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, bg: "#0A66C2", icon: <I.LinkedIn /> },
      { name: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${u}&media=${img}&description=${t}`, bg: "#E60023", icon: <I.Pinterest /> },
      { name: "Reddit", href: `https://www.reddit.com/submit?url=${u}&title=${t}`, bg: "#FF4500", icon: <I.Reddit /> },
      { name: "Digg", href: `https://digg.com/submit?url=${u}&title=${t}`, bg: "#005be2", icon: <I.Digg /> },
      { name: "Tumblr", href: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${u}&title=${t}&caption=${txt}`, bg: "#36465D", icon: <I.Tumblr /> },
      { name: "Email", href: `mailto:?subject=${t}&body=${both}`, bg: "#6B7280", icon: <I.Email /> },
      { name: "Viber", href: `viber://forward?text=${both}`, bg: "#7360F2", icon: <I.Viber /> },
      { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, bg: "#229ED9", icon: <I.Telegram /> },
    ];
  }, [payload]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return targets;
    return targets.filter((x) => x.name.toLowerCase().includes(q));
  }, [targets, query]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(payload.url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: payload.title, text: payload.text, url: payload.url });
      } catch { /* user cancelled */ }
    }
  }

  function handleClose() {
    setMounted(false);
    setTimeout(onClose, 180);
  }

  const hasNative = typeof navigator !== "undefined" && !!(navigator as any).share;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 sm:items-center ${mounted ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md transform overflow-hidden rounded-t-3xl border border-white/10 bg-zinc-900/90 p-6 text-white shadow-2xl backdrop-blur-xl transition-all duration-200 sm:rounded-3xl ${mounted ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`}
        style={{ background: "linear-gradient(135deg, rgba(24,24,27,0.92), rgba(9,9,11,0.92))" }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15 sm:hidden" />
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">Share this post</h2>
            <p className="mt-1 line-clamp-1 text-sm text-white/60">{payload.title}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close share"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps…"
            className="w-full bg-transparent text-sm placeholder:text-white/40 focus:outline-none"
          />
          {hasNative && (
            <button
              onClick={nativeShare}
              className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:bg-white/15"
            >
              More…
            </button>
          )}
        </div>

        <div className="mt-5 max-h-[42vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {filtered.map((t) => (
              <a
                key={t.name}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTimeout(handleClose, 100)}
                className="group flex flex-col items-center gap-1.5"
                aria-label={`Share on ${t.name}`}
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg transition-transform group-hover:-translate-y-0.5 group-hover:scale-105 group-active:scale-95"
                  style={{ backgroundColor: t.bg }}
                >
                  {t.icon}
                </span>
                <span className="text-[11px] text-white/70 group-hover:text-white">{t.name}</span>
              </a>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-6 text-center text-sm text-white/50">No apps match “{query}”.</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 pl-4">
          <Link2 className="h-4 w-4 shrink-0 text-white/50" />
          <span className="min-w-0 flex-1 truncate text-sm text-white/80">{payload.url}</span>
          <button
            onClick={copyLink}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${copied ? "bg-emerald-500/20 text-emerald-300" : "bg-white text-black hover:bg-white/90"}`}
          >
            {copied ? (<><Check className="h-3.5 w-3.5" /> Copied</>) : "Copy link"}
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-white/40">
          Share opens in a new tab. Works on timeline, group, page, and photo posts.
        </p>
      </div>
    </div>
  );
}

/* ============== Inline SVG icon set (no external font, fast load) ============== */
const sz = "h-5 w-5 fill-current";
const I = {
  WhatsApp: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.8-1.6A11 11 0 1 0 20.5 3.5Zm-8.5 17a8.9 8.9 0 0 1-4.5-1.2l-.3-.2-2.9.9.9-2.8-.2-.3A8.9 8.9 0 1 1 12 20.5Zm5-6.6c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.6.1a7.3 7.3 0 0 1-3.6-3.1c-.3-.5.3-.4.7-1.4a.5.5 0 0 0 0-.4c0-.1-.6-1.5-.9-2.1s-.5-.4-.6-.4h-.5a1 1 0 0 0-.8.4 3.2 3.2 0 0 0-1 2.4 5.6 5.6 0 0 0 1.2 3 12.7 12.7 0 0 0 4.8 4.2c2.9 1.2 2.9.8 3.5.8a2.7 2.7 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z"/></svg>
  ),
  SMS: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7l-5 4V6a2 2 0 0 1 2-2Zm3 6v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z"/></svg>
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M13.5 21v-7.5h2.55l.38-2.96H13.5V8.62c0-.85.24-1.43 1.46-1.43h1.56V4.55c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.92v2.19H7.88v2.96h2.56V21h3.06z"/></svg>
  ),
  Messenger: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M12 2C6.5 2 2.2 6.1 2.2 11.3a8.9 8.9 0 0 0 3.3 6.9V22l3-1.7a10.8 10.8 0 0 0 3.5.5c5.5 0 9.8-4.1 9.8-9.5S17.5 2 12 2Zm1 12.6-2.5-2.7-4.9 2.7 5.4-5.7 2.5 2.7 4.8-2.7-5.3 5.7Z"/></svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M18.244 2H21l-6.52 7.45L22 22h-6.84l-4.77-6.23L4.8 22H2l6.96-7.96L2 2h6.91l4.34 5.74L18.24 2zm-1.2 18.2h1.66L7.05 3.7H5.27l11.77 16.5z"/></svg>
  ),
  Gmail: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M3 6.5 12 13l9-6.5V18a2 2 0 0 1-2 2h-2V10.4L12 14.6 7 10.4V20H5a2 2 0 0 1-2-2V6.5Zm0-.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2L12 12 3 6Z"/></svg>
  ),
  VK: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M2.5 6h3.6c.2 0 .3.1.4.3.5 2 1.6 4.7 3.2 6 .1.1.2 0 .2-.1V7c-.1-.7-.6-1-1-1-.1 0-.2-.1-.1-.3.2-.4.7-.7 1.7-.7h2.6c.7 0 .9.3.9 1.1v4.7c0 .3.2.4.4.2.9-1 1.9-3 2.4-4.4.1-.4.4-.6.8-.6h2.6c.7 0 .9.4.7 1-.5 1.4-2 3.7-2.7 4.7-.2.2-.2.4 0 .6.6.8 2.2 2.5 2.7 3.6.3.6 0 1.1-.7 1.1h-2.6c-.5 0-.8-.2-1-.6-.5-.9-1.4-2-2-2.6-.2-.2-.4-.1-.4.2v2c0 .7-.2 1-1.4 1-2.6 0-5.6-1.6-7.7-6.3-1.4-3-1.8-5.5-1.8-6 0-.4.1-.6.7-.6Z"/></svg>
  ),
  OK: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M12 12.7a4.3 4.3 0 1 0-4.3-4.3A4.3 4.3 0 0 0 12 12.7Zm0-6.3a2 2 0 1 1-2 2 2 2 0 0 1 2-2Zm3.8 8.4a.9.9 0 0 0-1.3-.3 5.4 5.4 0 0 1-5 0 .9.9 0 1 0-.8 1.7 7.4 7.4 0 0 0 2.7.8L9 19.5a1 1 0 0 0 1.4 1.4l1.6-1.6 1.6 1.6a1 1 0 0 0 1.4-1.4l-2.4-2.5a7.4 7.4 0 0 0 2.7-.8.9.9 0 0 0 .5-1.2Z"/></svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.5h4V21H3V9.5Zm6 0h3.8v1.6h.1A4.2 4.2 0 0 1 16.5 9c4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9V9.5Z"/></svg>
  ),
  Pinterest: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12a10 10 0 0 0 6.3 9.3 9 9 0 0 1 0-2.7l1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 1-.6 2.4-.9 3.7-.3 1.1.6 2 1.7 2 2 0 3.6-2.2 3.6-5.2 0-2.7-2-4.6-4.8-4.6a5 5 0 0 0-5.2 5c0 1 .4 2 .9 2.6.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.4-.6-2.2-2.7-2.2-4.3 0-3.5 2.5-6.8 7.4-6.8 3.9 0 6.9 2.8 6.9 6.5 0 3.9-2.4 7-5.8 7-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.2 1-.9 2.3-1.4 3A10 10 0 0 0 22 12c0-5.5-4.5-10-10-10Z"/></svg>
  ),
  Reddit: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M22 12a2.2 2.2 0 0 0-3.7-1.6 10.7 10.7 0 0 0-5.7-1.8l1-4.5 3.1.7a1.6 1.6 0 1 0 .2-1l-3.5-.8a.5.5 0 0 0-.6.4l-1.1 5a10.7 10.7 0 0 0-5.8 1.8A2.2 2.2 0 1 0 3 13.8a4.4 4.4 0 0 0 0 .6c0 3.4 4 6.1 9 6.1s9-2.7 9-6.1a4.4 4.4 0 0 0 0-.6 2.2 2.2 0 0 0 1-1.8ZM7 13.5a1.5 1.5 0 1 1 1.5 1.5A1.5 1.5 0 0 1 7 13.5Zm8.6 4.2a5.7 5.7 0 0 1-3.6 1 5.7 5.7 0 0 1-3.6-1 .4.4 0 1 1 .5-.6 4.9 4.9 0 0 0 3.1.8 4.9 4.9 0 0 0 3.1-.8.4.4 0 1 1 .5.6ZM15.5 15a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5Z"/></svg>
  ),
  Digg: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M2 8h2v8H2zm3 0h4v10H5v-2h2v-6H5zm5-2h2v10h-2zm3 2h4v10h-4v-2h2v-1h-2zm0 2h2v3h-2zm5-2h4v10h-4v-2h2v-1h-2zm0 2h2v3h-2z"/></svg>
  ),
  Tumblr: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M14 3v3.6h3.6V10H14v5.3c0 1.2.6 1.7 1.6 1.7H18V21h-3.3c-3 0-4.7-1.8-4.7-4.7V10H7.5V7.3A4.5 4.5 0 0 0 11 3Z"/></svg>
  ),
  Email: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 4v.5l8 5 8-5V8l-8 5Z"/></svg>
  ),
  Viber: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M12 2C7 2 3 5.6 3 10a8 8 0 0 0 3 6.2V21l3.8-2.2a11 11 0 0 0 2.2.2c5 0 9-3.6 9-8s-4-9-9-9Zm-2 4.5a4.5 4.5 0 0 1 4.5 4.5.5.5 0 1 1-1 0A3.5 3.5 0 0 0 10 7.5a.5.5 0 1 1 0-1Zm0 2a2.5 2.5 0 0 1 2.5 2.5.5.5 0 1 1-1 0A1.5 1.5 0 0 0 10 9.5a.5.5 0 1 1 0-1Zm5.8 7.2c-.4.5-1.3.9-1.9.7-1.7-.5-3.7-2.5-4.2-4.2-.2-.6.2-1.5.7-1.9.2-.1.4-.1.5.1l.7 1c.1.2 0 .4-.1.5l-.3.3c-.1.1-.1.2 0 .3.4.7 1 1.3 1.7 1.7.1.1.2.1.3 0l.3-.3c.1-.1.3-.2.5-.1l1 .7c.2.1.2.3.1.5Z"/></svg>
  ),
  Telegram: () => (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden="true"><path d="M9.6 14.9 9.3 19a.7.7 0 0 0 1.1.5l2.4-2.2 4.9 3.6c.9.5 1.5.2 1.7-.8L22 4.7c.3-1.3-.5-1.9-1.4-1.5L2.7 10.1c-1.3.5-1.2 1.2-.2 1.5l4.6 1.4 10.7-6.7c.5-.3 1-.1.6.3Z"/></svg>
  ),
};
