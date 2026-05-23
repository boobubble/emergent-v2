import { useEffect, useState } from "react";
import { Link2, X, Check, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

export function ShareModal({ payload, onClose }: { payload: SharePayload; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const encodedUrl = encodeURIComponent(payload.url);
  const encodedText = encodeURIComponent(`${payload.text}\n\n${payload.url}`);
  const encodedTitle = encodeURIComponent(payload.title);

  const targets = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}`,
      gradient: "from-[#25D366] to-[#128C7E]",
      icon: <MessageCircle className="h-6 w-6" />,
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      gradient: "from-[#229ED9] to-[#0088CC]",
      icon: <Send className="h-6 w-6" />,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      gradient: "from-[#1877F2] to-[#0F5BD0]",
      icon: <FacebookGlyph />,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      gradient: "from-zinc-700 to-black",
      icon: <XGlyph />,
    },
  ];

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

  function handleClose() {
    setMounted(false);
    setTimeout(onClose, 180);
  }

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

        <div className="mt-6 grid grid-cols-4 gap-3">
          {targets.map((t) => (
            <a
              key={t.name}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTimeout(handleClose, 100)}
              className="group flex flex-col items-center gap-2"
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${t.gradient} text-white shadow-lg transition-transform group-hover:-translate-y-1 group-hover:scale-105 group-active:scale-95`}
              >
                {t.icon}
              </span>
              <span className="text-xs text-white/70 group-hover:text-white">{t.name}</span>
            </a>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 pl-4">
          <Link2 className="h-4 w-4 shrink-0 text-white/50" />
          <span className="min-w-0 flex-1 truncate text-sm text-white/80">{payload.url}</span>
          <button
            onClick={copyLink}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${copied ? "bg-emerald-500/20 text-emerald-300" : "bg-white text-black hover:bg-white/90"}`}
          >
            {copied ? (<><Check className="h-3.5 w-3.5" /> Copied</>) : "Copy link"}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/40">
          Share opens in a new tab. Link copied to your clipboard works everywhere.
        </p>
      </div>
    </div>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.55l.38-2.96H13.5V8.62c0-.85.24-1.43 1.46-1.43h1.56V4.55c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.92v2.19H7.88v2.96h2.56V21h3.06z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M18.244 2H21l-6.52 7.45L22 22h-6.84l-4.77-6.23L4.8 22H2l6.96-7.96L2 2h6.91l4.34 5.74L18.24 2zm-1.2 18.2h1.66L7.05 3.7H5.27l11.77 16.5z" />
    </svg>
  );
}
