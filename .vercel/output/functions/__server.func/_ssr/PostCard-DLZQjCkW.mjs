import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { cJ as useFeedPrefs, h as useAuthGate, b as useServerFn, O as isNavigableSlug, cM as reportContent, m as cn } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { c as earnFeedReaction, d as earnFeedComment, f as earnFeedShare, i as boostPost, F as FrameAvatar, C as CosmeticName, N as NameEmojiBadge, R as RankChip, E as EmojiPicker } from "./EmojiPicker-DcAQqNHO.mjs";
import { R as Root2, T as Trigger, P as Portal, C as Content2 } from "../_libs/radix-ui__react-popover.mjs";
import { claimShareReward } from "./boobubble.functions-BRP0x1de.mjs";
import { S as SPEND } from "./economy-config-CPZpIbo-.mjs";
import { r as reactDomExports } from "../_libs/react-dom.mjs";
import { e as EyeOff, F as Flame, d as Trash2, b0 as Flag, h as MessageCircle, a0 as LoaderCircle, b2 as Rocket, bh as Share2, bi as Bookmark, ai as Smile, aj as Send, a$ as ChartColumn, bz as CircleCheck, cJ as VideoOff, af as Play, X, ag as Pause, N as Search, aU as Link2, z as Check } from "../_libs/lucide-react.mjs";
const Popover = Root2;
const PopoverTrigger = Trigger;
const PopoverContent = reactExports.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = Content2.displayName;
const KEY = "palrgo:saved-posts:v1";
const EVT = "palrgo:saved-posts:changed";
function read() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
function write(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVT));
  } catch {
  }
}
function useSavedPosts() {
  const [ids, setIds] = reactExports.useState(() => read());
  reactExports.useEffect(() => {
    const onChange = () => setIds(read());
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", (e) => {
      if (e.key === KEY) onChange();
    });
    return () => {
      window.removeEventListener(EVT, onChange);
    };
  }, []);
  const isSaved = reactExports.useCallback((id) => ids.includes(id), [ids]);
  const toggle = reactExports.useCallback((id) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
    write(next);
    setIds(next);
    return !current.includes(id);
  }, []);
  return { savedIds: ids, isSaved, toggle };
}
const REACTION_EMOJI = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  angry: "😡",
  fire: "🔥"
};
const REACTION_ORDER = ["like", "love", "haha", "angry", "fire"];
function extractHashtags(text) {
  const matches = text.match(/#[\p{L}0-9_]{2,32}/giu) ?? [];
  return Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())));
}
function slugify(input, maxLen = 60) {
  if (!input) return "post";
  let s = input.toLowerCase();
  s = s.replace(/https?:\/\/\S+/g, " ");
  s = s.replace(/[^a-z0-9\s-]/g, " ");
  s = s.replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "");
  if (s.length > maxLen) s = s.slice(0, maxLen).replace(/-+$/g, "");
  return s || "post";
}
function postSlug(post) {
  if (post.slug) return post.slug;
  const base = post.text?.trim() ? slugify(post.text) : post.kind || "post";
  return `${base}-${post.id.slice(0, 4)}`;
}
function ShareModal({ payload, onClose }) {
  const [copied, setCopied] = reactExports.useState(false);
  const [mounted, setMounted] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  reactExports.useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);
  const targets = reactExports.useMemo(() => {
    const u = encodeURIComponent(payload.url);
    const t = encodeURIComponent(payload.title);
    const txt = encodeURIComponent(payload.text || payload.title);
    const both = encodeURIComponent(`${payload.text || payload.title}

${payload.url}`);
    const img = encodeURIComponent(payload.image || "");
    return [
      { name: "WhatsApp", href: `https://wa.me/?text=${both}`, bg: "#25D366", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.WhatsApp, {}) },
      { name: "SMS", href: `sms:?&body=${both}`, bg: "#34B7F1", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.SMS, {}) },
      { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, bg: "#1877F2", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Facebook, {}) },
      { name: "Messenger", href: `https://www.facebook.com/dialog/send?link=${u}&app_id=291494419107518&redirect_uri=${u}`, bg: "#0084FF", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Messenger, {}) },
      { name: "Twitter", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, bg: "#000000", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Twitter, {}) },
      { name: "Gmail", href: `https://mail.google.com/mail/?view=cm&fs=1&su=${t}&body=${both}`, bg: "#EA4335", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Gmail, {}) },
      { name: "VK", href: `https://vk.com/share.php?url=${u}&title=${t}&description=${txt}`, bg: "#4A76A8", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.VK, {}) },
      { name: "OK.ru", href: `https://connect.ok.ru/offer?url=${u}&title=${t}&description=${txt}`, bg: "#EE8208", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.OK, {}) },
      { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, bg: "#0A66C2", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.LinkedIn, {}) },
      { name: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${u}&media=${img}&description=${t}`, bg: "#E60023", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Pinterest, {}) },
      { name: "Reddit", href: `https://www.reddit.com/submit?url=${u}&title=${t}`, bg: "#FF4500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Reddit, {}) },
      { name: "Digg", href: `https://digg.com/submit?url=${u}&title=${t}`, bg: "#005be2", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Digg, {}) },
      { name: "Tumblr", href: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${u}&title=${t}&caption=${txt}`, bg: "#36465D", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Tumblr, {}) },
      { name: "Email", href: `mailto:?subject=${t}&body=${both}`, bg: "#6B7280", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Email, {}) },
      { name: "Viber", href: `viber://forward?text=${both}`, bg: "#7360F2", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Viber, {}) },
      { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, bg: "#229ED9", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(I.Telegram, {}) }
    ];
  }, [payload]);
  const filtered = reactExports.useMemo(() => {
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
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: payload.title, text: payload.text, url: payload.url });
      } catch {
      }
    }
  }
  function handleClose() {
    setMounted(false);
    setTimeout(onClose, 180);
  }
  const hasNative = typeof navigator !== "undefined" && !!navigator.share;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 sm:items-center ${mounted ? "opacity-100" : "opacity-0"}`,
      onClick: handleClose,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: (e) => e.stopPropagation(),
            className: `relative w-full max-w-md transform overflow-hidden rounded-t-3xl border border-white/10 bg-zinc-900/90 p-6 text-white shadow-2xl backdrop-blur-xl transition-all duration-200 sm:rounded-3xl ${mounted ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`,
            style: { background: "linear-gradient(135deg, rgba(24,24,27,0.92), rgba(9,9,11,0.92))" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15 sm:hidden" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Share this post" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-1 text-sm text-white/60", children: payload.title })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleClose,
                    className: "rounded-full bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white",
                    "aria-label": "Close share",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-white/40" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    placeholder: "Search apps…",
                    className: "w-full bg-transparent text-sm placeholder:text-white/40 focus:outline-none"
                  }
                ),
                hasNative && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: nativeShare,
                    className: "rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:bg-white/15",
                    children: "More…"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 max-h-[42vh] overflow-y-auto pr-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3 sm:grid-cols-5", children: [
                filtered.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "a",
                  {
                    href: t.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    onClick: () => setTimeout(handleClose, 100),
                    className: "group flex flex-col items-center gap-1.5",
                    "aria-label": `Share on ${t.name}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg transition-transform group-hover:-translate-y-0.5 group-hover:scale-105 group-active:scale-95",
                          style: { backgroundColor: t.bg },
                          children: t.icon
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-white/70 group-hover:text-white", children: t.name })
                    ]
                  },
                  t.name
                )),
                filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "col-span-full py-6 text-center text-sm text-white/50", children: [
                  "No apps match “",
                  query,
                  "”."
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 pl-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 shrink-0 text-white/50" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate text-sm text-white/80", children: payload.url }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: copyLink,
                    className: `inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${copied ? "bg-emerald-500/20 text-emerald-300" : "bg-white text-black hover:bg-white/90"}`,
                    children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
                      " Copied"
                    ] }) : "Copy link"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-[11px] text-white/40", children: "Share opens in a new tab. Works on timeline, group, page, and photo posts." })
            ]
          }
        )
      ]
    }
  );
}
const sz = "h-5 w-5 fill-current";
const I = {
  WhatsApp: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.8-1.6A11 11 0 1 0 20.5 3.5Zm-8.5 17a8.9 8.9 0 0 1-4.5-1.2l-.3-.2-2.9.9.9-2.8-.2-.3A8.9 8.9 0 1 1 12 20.5Zm5-6.6c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.6.1a7.3 7.3 0 0 1-3.6-3.1c-.3-.5.3-.4.7-1.4a.5.5 0 0 0 0-.4c0-.1-.6-1.5-.9-2.1s-.5-.4-.6-.4h-.5a1 1 0 0 0-.8.4 3.2 3.2 0 0 0-1 2.4 5.6 5.6 0 0 0 1.2 3 12.7 12.7 0 0 0 4.8 4.2c2.9 1.2 2.9.8 3.5.8a2.7 2.7 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z" }) }),
  SMS: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7l-5 4V6a2 2 0 0 1 2-2Zm3 6v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z" }) }),
  Facebook: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13.5 21v-7.5h2.55l.38-2.96H13.5V8.62c0-.85.24-1.43 1.46-1.43h1.56V4.55c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.92v2.19H7.88v2.96h2.56V21h3.06z" }) }),
  Messenger: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2C6.5 2 2.2 6.1 2.2 11.3a8.9 8.9 0 0 0 3.3 6.9V22l3-1.7a10.8 10.8 0 0 0 3.5.5c5.5 0 9.8-4.1 9.8-9.5S17.5 2 12 2Zm1 12.6-2.5-2.7-4.9 2.7 5.4-5.7 2.5 2.7 4.8-2.7-5.3 5.7Z" }) }),
  Twitter: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18.244 2H21l-6.52 7.45L22 22h-6.84l-4.77-6.23L4.8 22H2l6.96-7.96L2 2h6.91l4.34 5.74L18.24 2zm-1.2 18.2h1.66L7.05 3.7H5.27l11.77 16.5z" }) }),
  Gmail: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 6.5 12 13l9-6.5V18a2 2 0 0 1-2 2h-2V10.4L12 14.6 7 10.4V20H5a2 2 0 0 1-2-2V6.5Zm0-.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2L12 12 3 6Z" }) }),
  VK: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2.5 6h3.6c.2 0 .3.1.4.3.5 2 1.6 4.7 3.2 6 .1.1.2 0 .2-.1V7c-.1-.7-.6-1-1-1-.1 0-.2-.1-.1-.3.2-.4.7-.7 1.7-.7h2.6c.7 0 .9.3.9 1.1v4.7c0 .3.2.4.4.2.9-1 1.9-3 2.4-4.4.1-.4.4-.6.8-.6h2.6c.7 0 .9.4.7 1-.5 1.4-2 3.7-2.7 4.7-.2.2-.2.4 0 .6.6.8 2.2 2.5 2.7 3.6.3.6 0 1.1-.7 1.1h-2.6c-.5 0-.8-.2-1-.6-.5-.9-1.4-2-2-2.6-.2-.2-.4-.1-.4.2v2c0 .7-.2 1-1.4 1-2.6 0-5.6-1.6-7.7-6.3-1.4-3-1.8-5.5-1.8-6 0-.4.1-.6.7-.6Z" }) }),
  OK: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 12.7a4.3 4.3 0 1 0-4.3-4.3A4.3 4.3 0 0 0 12 12.7Zm0-6.3a2 2 0 1 1-2 2 2 2 0 0 1 2-2Zm3.8 8.4a.9.9 0 0 0-1.3-.3 5.4 5.4 0 0 1-5 0 .9.9 0 1 0-.8 1.7 7.4 7.4 0 0 0 2.7.8L9 19.5a1 1 0 0 0 1.4 1.4l1.6-1.6 1.6 1.6a1 1 0 0 0 1.4-1.4l-2.4-2.5a7.4 7.4 0 0 0 2.7-.8.9.9 0 0 0 .5-1.2Z" }) }),
  LinkedIn: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.5h4V21H3V9.5Zm6 0h3.8v1.6h.1A4.2 4.2 0 0 1 16.5 9c4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9V9.5Z" }) }),
  Pinterest: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2C6.5 2 2 6.5 2 12a10 10 0 0 0 6.3 9.3 9 9 0 0 1 0-2.7l1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 1-.6 2.4-.9 3.7-.3 1.1.6 2 1.7 2 2 0 3.6-2.2 3.6-5.2 0-2.7-2-4.6-4.8-4.6a5 5 0 0 0-5.2 5c0 1 .4 2 .9 2.6.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.4-.6-2.2-2.7-2.2-4.3 0-3.5 2.5-6.8 7.4-6.8 3.9 0 6.9 2.8 6.9 6.5 0 3.9-2.4 7-5.8 7-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.2 1-.9 2.3-1.4 3A10 10 0 0 0 22 12c0-5.5-4.5-10-10-10Z" }) }),
  Reddit: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 12a2.2 2.2 0 0 0-3.7-1.6 10.7 10.7 0 0 0-5.7-1.8l1-4.5 3.1.7a1.6 1.6 0 1 0 .2-1l-3.5-.8a.5.5 0 0 0-.6.4l-1.1 5a10.7 10.7 0 0 0-5.8 1.8A2.2 2.2 0 1 0 3 13.8a4.4 4.4 0 0 0 0 .6c0 3.4 4 6.1 9 6.1s9-2.7 9-6.1a4.4 4.4 0 0 0 0-.6 2.2 2.2 0 0 0 1-1.8ZM7 13.5a1.5 1.5 0 1 1 1.5 1.5A1.5 1.5 0 0 1 7 13.5Zm8.6 4.2a5.7 5.7 0 0 1-3.6 1 5.7 5.7 0 0 1-3.6-1 .4.4 0 1 1 .5-.6 4.9 4.9 0 0 0 3.1.8 4.9 4.9 0 0 0 3.1-.8.4.4 0 1 1 .5.6ZM15.5 15a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5Z" }) }),
  Digg: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2 8h2v8H2zm3 0h4v10H5v-2h2v-6H5zm5-2h2v10h-2zm3 2h4v10h-4v-2h2v-1h-2zm0 2h2v3h-2zm5-2h4v10h-4v-2h2v-1h-2zm0 2h2v3h-2z" }) }),
  Tumblr: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 3v3.6h3.6V10H14v5.3c0 1.2.6 1.7 1.6 1.7H18V21h-3.3c-3 0-4.7-1.8-4.7-4.7V10H7.5V7.3A4.5 4.5 0 0 0 11 3Z" }) }),
  Email: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 4v.5l8 5 8-5V8l-8 5Z" }) }),
  Viber: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2C7 2 3 5.6 3 10a8 8 0 0 0 3 6.2V21l3.8-2.2a11 11 0 0 0 2.2.2c5 0 9-3.6 9-8s-4-9-9-9Zm-2 4.5a4.5 4.5 0 0 1 4.5 4.5.5.5 0 1 1-1 0A3.5 3.5 0 0 0 10 7.5a.5.5 0 1 1 0-1Zm0 2a2.5 2.5 0 0 1 2.5 2.5.5.5 0 1 1-1 0A1.5 1.5 0 0 0 10 9.5a.5.5 0 1 1 0-1Zm5.8 7.2c-.4.5-1.3.9-1.9.7-1.7-.5-3.7-2.5-4.2-4.2-.2-.6.2-1.5.7-1.9.2-.1.4-.1.5.1l.7 1c.1.2 0 .4-.1.5l-.3.3c-.1.1-.1.2 0 .3.4.7 1 1.3 1.7 1.7.1.1.2.1.3 0l.3-.3c.1-.1.3-.2.5-.1l1 .7c.2.1.2.3.1.5Z" }) }),
  Telegram: () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: sz, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9.6 14.9 9.3 19a.7.7 0 0 0 1.1.5l2.4-2.2 4.9 3.6c.9.5 1.5.2 1.7-.8L22 4.7c.3-1.3-.5-1.9-1.4-1.5L2.7 10.1c-1.3.5-1.2 1.2-.2 1.5l4.6 1.4 10.7-6.7c.5-.3 1-.1.6.3Z" }) })
};
const VOTE_KEY = (postId) => `feed-poll-vote:${postId}`;
function readVoted(postId) {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(VOTE_KEY(postId));
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
function PollBlock({ post }) {
  const poll = post.poll;
  const [votes, setVotes] = reactExports.useState(() => ({ ...poll?.votes ?? {} }));
  const [voted, setVoted] = reactExports.useState(() => readVoted(post.id));
  const [busy, setBusy] = reactExports.useState(false);
  const total = reactExports.useMemo(() => Object.values(votes).reduce((a, b) => a + (Number(b) || 0), 0), [votes]);
  if (!poll) return null;
  async function castVote(idx) {
    if (voted !== null || busy) return;
    setBusy(true);
    const next = { ...votes, [String(idx)]: (votes[String(idx)] ?? 0) + 1 };
    setVotes(next);
    setVoted(idx);
    try {
      localStorage.setItem(VOTE_KEY(post.id), String(idx));
    } catch {
    }
    try {
      const { data: row } = await supabase.from("posts").select("poll").eq("id", post.id).maybeSingle();
      const current = row?.poll?.votes ?? {};
      const merged = { ...current, [String(idx)]: (current[String(idx)] ?? 0) + 1 };
      const basePoll = row?.poll ?? poll;
      const newPoll = { ...basePoll, votes: merged };
      await supabase.from("posts").update({ poll: newPoll }).eq("id", post.id);
      setVotes(merged);
    } catch {
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 via-card to-card p-4 shadow-[0_4px_18px_-12px_var(--primary-glow)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-primary", children: "Poll" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[11px] text-muted-foreground", children: [
        total,
        " ",
        total === 1 ? "vote" : "votes"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-[15px] font-semibold leading-snug", children: poll.question }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: poll.options.map((opt, idx) => {
      const count = votes[String(idx)] ?? 0;
      const pct = total > 0 ? Math.round(count / total * 100) : 0;
      const isPicked = voted === idx;
      const showResults = voted !== null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => castVote(idx),
          disabled: showResults || busy,
          className: `relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm transition ${isPicked ? "border-primary bg-primary/10 text-foreground" : showResults ? "border-border bg-background/60 text-foreground" : "border-border bg-background/60 hover:border-primary/60 hover:bg-primary/5"}`,
          children: [
            showResults && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                "aria-hidden": true,
                className: `absolute inset-y-0 left-0 ${isPicked ? "bg-primary/20" : "bg-muted/60"}`,
                style: { width: `${pct}%` }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex items-center gap-2", children: [
              isPicked && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-medium", children: opt }),
              showResults && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-muted-foreground", children: [
                pct,
                "%"
              ] }),
              busy && isPicked && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin text-primary" })
            ] })
          ]
        },
        idx
      );
    }) }),
    voted === null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] text-muted-foreground", children: "Tap an option to vote." })
  ] });
}
function FeedVideo({
  src,
  className = ""
}) {
  const previewRef = reactExports.useRef(null);
  const modalVideoRef = reactExports.useRef(null);
  const [poster, setPoster] = reactExports.useState(null);
  const [status, setStatus] = reactExports.useState("loading");
  const [hovering, setHovering] = reactExports.useState(false);
  const [open, setOpen] = reactExports.useState(false);
  const [modalPlaying, setModalPlaying] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.src = src;
    const onLoaded = () => {
      try {
        v.currentTime = Math.min(0.1, (v.duration || 1) / 2);
      } catch {
        capture();
      }
    };
    const onSeeked = () => capture();
    const capture = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = v.videoWidth || 640;
        const h = v.videoHeight || 360;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(v, 0, 0, w, h);
          const url = canvas.toDataURL("image/jpeg", 0.7);
          if (!cancelled) {
            setPoster(url);
            setStatus("ready");
          }
        } else if (!cancelled) {
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("ready");
      }
    };
    const onError = () => {
      if (!cancelled) setStatus("error");
    };
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("error", onError);
    return () => {
      cancelled = true;
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("error", onError);
      v.src = "";
    };
  }, [src]);
  reactExports.useEffect(() => {
    const v = previewRef.current;
    if (!v) return;
    if (hovering) {
      v.muted = true;
      v.currentTime = 0;
      v.play().catch(() => {
      });
    } else {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
      }
    }
  }, [hovering]);
  reactExports.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  function openModal() {
    setOpen(true);
    setModalPlaying(true);
    requestAnimationFrame(() => {
      const v = modalVideoRef.current;
      if (!v) return;
      v.muted = false;
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => setModalPlaying(false));
      });
    });
  }
  function closeModal() {
    const v = modalVideoRef.current;
    if (v) v.pause();
    setOpen(false);
    setModalPlaying(false);
  }
  function togglePlay() {
    const v = modalVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {
      });
      setModalPlaying(true);
    } else {
      v.pause();
      setModalPlaying(false);
    }
  }
  if (status === "error") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid place-items-center bg-black/80 text-muted-foreground ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(VideoOff, { className: "h-8 w-8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Video unavailable" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `relative bg-black overflow-hidden cursor-pointer ${className}`,
        onMouseEnter: () => setHovering(true),
        onMouseLeave: () => setHovering(false),
        onClick: openModal,
        role: "button",
        "aria-label": "Play video fullscreen",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "video",
            {
              ref: previewRef,
              src,
              poster: poster ?? void 0,
              playsInline: true,
              muted: true,
              preload: "metadata",
              className: "h-full w-full object-contain pointer-events-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center bg-gradient-to-t from-black/40 via-transparent to-transparent transition-colors hover:bg-black/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-14 w-14 place-items-center rounded-full bg-white/95 text-black shadow-lg ring-1 ring-black/10 transition-transform duration-200 hover:scale-110 active:scale-95", children: status === "loading" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-7 w-7 translate-x-0.5 fill-current" }) }) })
        ]
      }
    ),
    open && typeof document !== "undefined" && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm animate-fade-in flex items-center justify-center",
          onClick: closeModal,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  closeModal();
                },
                "aria-label": "Close video",
                className: "absolute top-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20 active:scale-95",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "relative max-h-full max-w-full w-full h-full flex items-center justify-center p-4 sm:p-8",
                onClick: (e) => e.stopPropagation(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "video",
                    {
                      ref: modalVideoRef,
                      src,
                      poster: poster ?? void 0,
                      controls: true,
                      autoPlay: true,
                      playsInline: true,
                      onPlay: () => setModalPlaying(true),
                      onPause: () => setModalPlaying(false),
                      onEnded: () => setModalPlaying(false),
                      className: "max-h-full max-w-full rounded-lg shadow-2xl bg-black"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: togglePlay,
                      "aria-label": modalPlaying ? "Pause" : "Resume",
                      className: `absolute inset-0 grid place-items-center transition-opacity ${modalPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black shadow-xl ring-1 ring-black/10 transition-transform hover:scale-110 active:scale-95", children: modalPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-7 w-7 fill-current" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-8 w-8 translate-x-0.5 fill-current" }) })
                    }
                  )
                ]
              }
            )
          ]
        }
      ),
      document.body
    )
  ] });
}
function timeAgo(iso) {
  const time = new Date(iso).getTime();
  const d = Number.isFinite(time) ? Date.now() - time : 0;
  const m = Math.floor(d / 6e4);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
const PostCard = reactExports.memo(function PostCard2({
  post,
  profiles,
  meId
}) {
  const { prefs } = useFeedPrefs();
  const compact = prefs.compactCards;
  const hideCounts = prefs.hideCounts;
  const [reactions, setReactions] = reactExports.useState([]);
  const [reactionsLoaded, setReactionsLoaded] = reactExports.useState(false);
  const [showComments, setShowComments] = reactExports.useState(false);
  const [comments, setComments] = reactExports.useState([]);
  const [commentText, setCommentText] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const [pickerOpen, setPickerOpen] = reactExports.useState(false);
  const [shareOpen, setShareOpen] = reactExports.useState(null);
  const [boosting, setBoosting] = reactExports.useState(false);
  const { isSaved, toggle: toggleSaved } = useSavedPosts();
  const saved = isSaved(post.id);
  const { requireAuth } = useAuthGate();
  const earnReaction = useServerFn(earnFeedReaction);
  const earnComment = useServerFn(earnFeedComment);
  const earnShare = useServerFn(earnFeedShare);
  const claimShare = useServerFn(claimShareReward);
  const doBoost = useServerFn(boostPost);
  const author = post.is_anonymous ? null : profiles[post.author_id];
  const mediaUrls = Array.isArray(post.media_urls) ? post.media_urls : [];
  const reactionCount = post.reaction_count ?? 0;
  const commentCount = post.comment_count ?? 0;
  const trendingScore = post.trending_score ?? 0;
  const myReaction = reactions.find((r) => r.user_id === meId);
  const counts = {};
  for (const r of reactions) counts[r.type] = (counts[r.type] ?? 0) + 1;
  const totalReactions = reactionsLoaded ? reactions.length : reactionCount;
  async function ensureReactions() {
    if (reactionsLoaded) return;
    const { data } = await supabase.from("reactions").select("*").eq("target_type", "post").eq("target_id", post.id);
    setReactions(data ?? []);
    setReactionsLoaded(true);
  }
  reactExports.useEffect(() => {
    if (!showComments) return;
    let cancelled = false;
    supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true }).then(({ data }) => {
      if (!cancelled) setComments(data ?? []);
    });
    const ch = supabase.channel(`post-c-${post.id}`).on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${post.id}` }, (payload) => {
      if (payload.eventType === "INSERT") setComments((p) => [...p, payload.new]);
      if (payload.eventType === "DELETE") setComments((p) => p.filter((c) => c.id !== payload.old.id));
    }).subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [showComments, post.id]);
  async function react(type) {
    setPickerOpen(false);
    await ensureReactions();
    const existing = reactions.find((r) => r.user_id === meId);
    if (existing?.type === type) {
      setReactions((p) => p.filter((r) => r.id !== existing.id));
      await supabase.from("reactions").delete().eq("id", existing.id);
      return;
    }
    if (existing) {
      setReactions((p) => p.filter((r) => r.id !== existing.id));
      await supabase.from("reactions").delete().eq("id", existing.id);
    }
    const { data } = await supabase.from("reactions").insert({ user_id: meId, target_type: "post", target_id: post.id, type }).select().single();
    if (data) {
      setReactions((p) => [...p, data]);
      earnReaction({ data: { postId: post.id } }).catch(() => {
      });
    }
  }
  async function addComment() {
    if (!commentText.trim()) return;
    setSending(true);
    const { error } = await supabase.from("comments").insert({ post_id: post.id, author_id: meId, text: commentText.trim() });
    if (!error) {
      earnComment({ data: { postId: post.id } }).catch(() => {
      });
    }
    setCommentText("");
    setSending(false);
  }
  async function boost() {
    if (boosting) return;
    if (!confirm(`Boost this post for ${SPEND.boost_post.coins} coins?`)) return;
    setBoosting(true);
    try {
      await doBoost({ data: { postId: post.id } });
    } catch (e) {
      alert(e.message ?? "Couldn't boost");
    } finally {
      setBoosting(false);
    }
  }
  async function del() {
    if (!confirm("Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", post.id);
  }
  function renderText(t) {
    const parts = t.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith("#") && part.length > 1) return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "text-primary hover:underline", children: part }, i);
      if (part.startsWith("@") && part.length > 1) return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$username", params: { username: part.slice(1) }, className: "text-primary hover:underline", children: part }, i);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: part }, i);
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `feed-card feed-card-hover ${compact ? "p-4 sm:p-[1.05rem]" : "p-5 sm:p-6"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-3", children: [
      author ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$username", params: { username: author.name }, className: "transition-transform duration-300 hover:scale-[1.05]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: author, size: 44 }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 place-items-center rounded-full bg-muted/70 text-muted-foreground ring-1 ring-inset ring-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          author ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$username", params: { username: author.name }, className: "font-semibold text-[15px] tracking-tight text-foreground hover:underline decoration-primary/60 underline-offset-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: author.id, name: author.name }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NameEmojiBadge, { user: author }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RankChip, { level: author.level, compact: true })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-[15px] tracking-tight text-muted-foreground", children: "Anonymous" }),
          trendingScore > 50 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400 ring-1 ring-inset ring-orange-500/25", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3" }),
            " Trending"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground/85", children: [
          isNavigableSlug(postSlug(post)) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed/$slug", params: { slug: postSlug(post) }, className: "hover:text-foreground/90 transition-colors", children: timeAgo(post.created_at) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: timeAgo(post.created_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize tracking-wide", children: post.privacy })
        ] })
      ] }),
      post.owner_id === meId ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: del, className: "rounded-full p-2 text-muted-foreground/80 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200", "aria-label": "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => requireAuth(async () => {
            const reason = window.prompt("Why are you reporting this post? (Spam, Abuse, NSFW, Harassment, Other)");
            if (!reason) return;
            try {
              await reportContent({ data: { content_type: "feed_post", content_id: post.id, reason: reason.slice(0, 200) } });
              toast.success("Reported. Our team will review it.");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed to report");
            }
          }),
          className: "rounded-full p-2 text-muted-foreground/80 hover:bg-orange-500/10 hover:text-orange-500 transition-colors",
          "aria-label": "Report post",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-4 w-4" })
        }
      )
    ] }),
    post.text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-4 whitespace-pre-wrap text-foreground/95 ${compact ? "text-[14px] leading-[1.6]" : "text-[15.5px] leading-[1.65]"}`, children: renderText(post.text) }),
    post.kind === "poll" && post.poll && /* @__PURE__ */ jsxRuntimeExports.jsx(PollBlock, { post }),
    mediaUrls.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-4 grid gap-1 overflow-hidden rounded-2xl ring-1 ring-inset ring-border/70 shadow-[0_8px_24px_-16px_oklch(0_0_0/0.55)] ${mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`, children: mediaUrls.map((u, i) => {
      const isVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(u);
      if (isVideo) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          FeedVideo,
          {
            src: u,
            className: `w-full ${compact ? "max-h-80 aspect-video" : "max-h-[480px] aspect-video"}`
          },
          i
        );
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: u,
          alt: "",
          loading: "lazy",
          decoding: "async",
          onLoad: (e) => e.currentTarget.classList.add("feed-media-in"),
          className: `w-full bg-muted/40 object-cover transition-transform duration-[450ms] ease-out hover:scale-[1.02] ${compact ? "max-h-80" : "max-h-[480px]"}`
        },
        i
      );
    }) }),
    !hideCounts && (totalReactions > 0 || commentCount > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        Object.keys(counts).length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-1", children: Object.entries(counts).slice(0, 3).map(([k]) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-5 w-5 place-items-center rounded-full bg-card ring-2 ring-card text-[12px]", children: REACTION_EMOJI[k] }, k)) }) : totalReactions > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base", children: "👍" }),
        totalReactions > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: totalReactions })
      ] }),
      commentCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        commentCount,
        " ",
        commentCount === 1 ? "comment" : "comments"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-3 flex items-center gap-1 border-t border-border/70 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => requireAuth(() => {
              ensureReactions();
              setPickerOpen(!pickerOpen);
            }),
            className: `inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${myReaction ? "text-primary bg-primary/10 ring-1 ring-inset ring-primary/20" : "text-muted-foreground hover:bg-accent/25 hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-lg ${myReaction ? "like-burst" : ""}`, children: myReaction ? REACTION_EMOJI[myReaction.type] : "👍" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: hideCounts ? "React" : myReaction ? "Reacted" : "Like" })
            ]
          }
        ),
        pickerOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-glass absolute bottom-full left-0 z-10 mb-2 flex gap-1 rounded-full p-1.5 animate-scale-in", children: REACTION_ORDER.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => requireAuth(() => react(r)), className: "rounded-full p-1.5 text-xl transition-transform duration-200 hover:scale-[1.45] hover:-translate-y-1 active:scale-110", children: REACTION_EMOJI[r] }, r)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowComments(!showComments), className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent/25 hover:text-foreground transition-all duration-200 active:scale-[0.97]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Comment" })
      ] }),
      post.owner_id !== meId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => requireAuth(boost),
          disabled: boosting,
          className: "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]",
          title: `Boost (${SPEND.boost_post.coins} coins)`,
          children: [
            boosting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Boost" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: async () => {
            const url = `${window.location.origin}/feed/${postSlug(post)}`;
            const authorName = author?.name ?? "Anonymous";
            const title = post.text ? `${authorName}: ${post.text.slice(0, 60)}${post.text.length > 60 ? "…" : ""}` : authorName;
            const shareText = post.text ? post.text : `Check out this post by ${authorName}`;
            const payload = { title, text: shareText, url };
            earnShare({ data: { postId: post.id } }).catch(() => {
            });
            claimShare({ data: { postId: post.id, target: "native" } }).then((r) => {
              if (r?.ok && r.awarded > 0) toast.success(`+${r.awarded} 🪙 for sharing!`);
            }).catch(() => {
            });
            if (typeof navigator !== "undefined" && navigator.share) {
              try {
                await navigator.share({ title, text: shareText, url });
                return;
              } catch (e) {
                if (e?.name === "AbortError") return;
              }
            }
            setShareOpen(payload);
          },
          className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent/25 hover:text-foreground transition-all duration-200 active:scale-[0.97]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Share" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => requireAuth(() => {
            const nowSaved = toggleSaved(post.id);
            toast.success(nowSaved ? "Saved to bookmarks" : "Removed from bookmarks");
          }),
          "aria-pressed": saved,
          title: saved ? "Remove bookmark" : "Save post",
          className: `inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${saved ? "text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/25" : "text-muted-foreground hover:bg-accent/25 hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: `h-4 w-4 ${saved ? "fill-current" : ""}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: saved ? "Saved" : "Save" })
          ]
        }
      )
    ] }),
    shareOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ShareModal, { payload: shareOpen, onClose: () => setShareOpen(null) }),
    showComments && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 border-t border-border/70 pt-4 animate-fade-in", children: [
      comments.map((c) => {
        const cAuthor = profiles[c.author_id];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2.5 animate-fade-in", children: [
          cAuthor && /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: cAuthor, size: 32 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 rounded-2xl bg-gradient-to-b from-accent/20 to-accent/10 border border-border/60 px-3.5 py-2.5 shadow-[inset_0_1px_0_oklch(1_0_0/0.04)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11.5px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground tracking-tight", children: cAuthor ? /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: cAuthor.id, name: cAuthor.name }) : "user" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/80", children: timeAgo(c.created_at) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[14px] leading-[1.6] text-foreground/95", children: c.text })
          ] })
        ] }, c.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: commentText,
            onChange: (e) => setCommentText(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                requireAuth(addComment);
              }
            },
            placeholder: "Write a comment…",
            className: "flex-1 rounded-full border border-border/70 bg-background/60 px-4 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "rounded-full p-2 text-muted-foreground hover:bg-accent/30 hover:text-foreground transition-colors duration-200", "aria-label": "Add emoji", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { align: "end", className: "w-auto p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmojiPicker, { onPick: (e) => setCommentText((t) => t + e) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => requireAuth(addComment), disabled: sending || !commentText.trim(), className: "rounded-full bg-gradient-to-br from-primary to-primary/80 p-2.5 text-primary-foreground shadow-[0_8px_22px_-8px_var(--primary-glow)] hover:scale-[1.06] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100", children: sending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] })
    ] })
  ] });
});
export {
  PostCard as P,
  Popover as a,
  PopoverTrigger as b,
  PopoverContent as c,
  extractHashtags as e,
  postSlug as p,
  slugify as s,
  useSavedPosts as u
};
