import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, N as Navigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { a as useAuth, W as AuthDialogs, an as HERO_DEFAULTS, ao as HERO_SETTINGS_KEY, ap as mergeHeroConfig } from "./router-CYWPFaDK.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a7 as Sun, a8 as Moon, f as Heart, aB as Crown, i as Radio, F as Flame, U as Users, l as Star, a1 as Target, o as Gamepad2, ay as Newspaper, h as MessageCircle, a as Sparkles, s as UserPlus, ab as ArrowRight, r as LogIn, m as Award, Z as Zap, af as Play, bF as Hash, ak as Mic, aj as Send } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "./env.server-Bcmcot3M.mjs";
import "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./feedback-config-DIeqYcnl.mjs";
import "./app-version-8YDb-xNu.mjs";
import "../_libs/i18next-http-backend.mjs";
import "./client.server-BXCYxJZY.mjs";
import "./sitemap-Dl8Aqg_O.mjs";
import "./reserved-routes-BWsWje6t.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "./mehfil-types-okfUX99d.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/zod.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
function useHeroConfig() {
  const [cfg, setCfg] = reactExports.useState(HERO_DEFAULTS);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data
      } = await supabase.from("app_settings").select("value").eq("key", HERO_SETTINGS_KEY).maybeSingle();
      if (!cancelled) setCfg(mergeHeroConfig(data?.value));
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return cfg;
}
function useLiveStats() {
  const [stats, setStats] = reactExports.useState({
    members: 0,
    online: 0,
    rooms: 0,
    djs: 0,
    postsToday: 0
  });
  reactExports.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
        const onlineSince = new Date(Date.now() - 5 * 60 * 1e3).toISOString();
        const [m, on, p] = await Promise.all([supabase.from("profiles").select("*", {
          count: "exact",
          head: true
        }), supabase.from("profiles").select("*", {
          count: "exact",
          head: true
        }).gte("last_seen_at", onlineSince), supabase.from("posts").select("*", {
          count: "exact",
          head: true
        }).gte("created_at", since)]);
        if (cancelled) return;
        setStats({
          members: m.count ?? 0,
          online: on.count ?? 0,
          rooms: 12,
          djs: 3,
          postsToday: p.count ?? 0
        });
      } catch {
      }
    };
    load();
    const t = setInterval(load, 3e4);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);
  return stats;
}
function AnimatedCounter({
  value
}) {
  const [n, setN] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const start = performance.now();
    const from = n;
    const to = value;
    const dur = 1200;
    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: n.toLocaleString() });
}
function Reveal({
  children,
  className = "",
  delay = 0
}) {
  const ref = reactExports.useRef(null);
  const [shown, setShown] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      setShown(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -60px 0px"
    });
    io.observe(el);
    const timeout = window.setTimeout(() => setShown(true), 1200);
    return () => {
      io.disconnect();
      window.clearTimeout(timeout);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, style: {
    transitionDelay: `${delay}ms`
  }, className: `transition-all duration-700 ease-out will-change-transform ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`, children });
}
function Glass({
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${className}`, children });
}
function SectionTag({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] backdrop-blur-xl", children });
}
function FeatureRow({
  items
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 60, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.06]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500/25 to-indigo-500/25 text-xl", children: it.emoji }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: it.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xs opacity-70", children: it.description })
    ] })
  ] }) }, i)) });
}
function ThemeToggle({
  dark,
  setDark
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDark(!dark), className: "rounded-full border border-white/10 bg-white/5 p-2 text-white/80 backdrop-blur-xl hover:bg-white/10", "aria-label": "Toggle theme", children: dark ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4" }) });
}
function ChatroomMockup() {
  const rooms = [{
    name: "Chill Lounge",
    active: true,
    badge: "12k"
  }, {
    name: "Music Vibes",
    badge: "3"
  }, {
    name: "Gaming Zone",
    badge: "8"
  }, {
    name: "Late Night",
    badge: ""
  }, {
    name: "Teen Hub",
    badge: ""
  }];
  const messages = [{
    name: "Alex",
    color: "from-fuchsia-500 to-pink-500",
    text: "This song is amazing! 🔥",
    time: "3:01 PM"
  }, {
    name: "Emma",
    color: "from-indigo-500 to-cyan-500",
    text: "Anyone up for a game? 🎮",
    time: "3:02 PM"
  }, {
    name: "Luna",
    color: "from-amber-400 to-rose-500",
    text: "I'm in! Let's go 🚀",
    time: "3:03 PM"
  }, {
    name: "Sam",
    color: "from-emerald-400 to-teal-500",
    text: "Hey everyone! 👋",
    time: "3:04 PM"
  }];
  const online = ["Alex", "Emma", "Luna", "Sam", "Noah", "Olivia", "Liam", "Ava"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b1a]/90 shadow-[0_30px_80px_-20px_rgba(168,85,247,0.45)] ring-1 ring-fuchsia-400/10 backdrop-blur-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-white/5 px-4 py-3 text-xs text-white/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-fuchsia-300" }),
        " Assistant"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-rose-400/80" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-amber-400/80" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400/80" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "col-span-3 hidden border-r border-white/5 p-3 sm:block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1 text-[10px] uppercase tracking-wide text-white/40", children: "Public rooms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: rooms.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-between rounded-lg px-2 py-1.5 text-xs ${r.active ? "bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/20 ring-1 ring-fuchsia-400/30" : "hover:bg-white/5"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 truncate", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "h-3 w-3 opacity-60" }),
            r.name
          ] }),
          r.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-fuchsia-500/30 px-1.5 text-[9px] font-bold", children: r.badge })
        ] }, r.name)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 px-1 text-[10px] uppercase tracking-wide text-white/40", children: "Voice rooms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between rounded-lg bg-white/[0.04] px-2 py-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-3 w-3 text-rose-300" }),
            " Live Radio"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-rose-500/30 px-1.5 text-[9px] font-bold text-rose-200", children: "LIVE" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-12 flex flex-col sm:col-span-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-white/5 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Chill Lounge" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-emerald-300", children: "● 12k members online" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-3 p-4", children: messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", style: {
          animation: `hero-msg-in 600ms ease-out ${i * 120}ms both`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br ${m.color} text-[10px] font-bold`, children: m.name[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/40", children: m.time })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 inline-block rounded-2xl rounded-tl-sm bg-white/[0.06] px-3 py-1.5 text-xs", children: m.text })
          ] })
        ] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-white/5 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-2 text-xs text-white/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: "Type a message…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5 text-white" }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "col-span-3 hidden border-l border-white/5 p-3 lg:block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-1 text-[10px] uppercase tracking-wide text-white/40", children: [
          "Online · ",
          online.length * 16
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1.5", children: online.map((n, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs hover:bg-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold text-white bg-gradient-to-br ${["from-fuchsia-500 to-pink-500", "from-indigo-500 to-cyan-500", "from-amber-400 to-rose-500", "from-emerald-400 to-teal-500"][i % 4]}`, children: n[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: n }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400" })
        ] }, n)) })
      ] })
    ] })
  ] });
}
function FeedMockup() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b1a]/90 shadow-[0_30px_80px_-20px_rgba(99,102,241,0.45)] backdrop-blur-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 text-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-12 p-4 sm:col-span-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-xs text-white/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-[10px] font-bold", children: "Y" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: "What's on your mind?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-3 py-1 text-[11px] font-semibold", children: "Post" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-xs font-bold", children: "E" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Emma" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-60", children: "2h ago" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-sm", children: "Sunset vibes with good people 🌅✨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 aspect-[16/9] w-full rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-indigo-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-4 text-xs opacity-80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5 text-rose-400" }),
            " 1.2k"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5 text-cyan-300" }),
            " 45"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-300", children: "+20 XP" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "col-span-12 border-l border-white/5 p-4 sm:col-span-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold opacity-80", children: "🔥 Trending" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-2", children: ["GoodVibes · 12.6k", "MusicLovers · 8.2k", "Vibes · 7.1k", "GameNight · 6.3k"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-white/[0.04] px-3 py-2 text-xs", children: t }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-xs font-semibold opacity-80", children: "👑 Top Members" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1.5", children: [["Alex", "12.5K"], ["Emma", "11.3K"], ["Luna", "10.8K"]].map(([n, xp]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[9px] font-bold", children: n[0] }),
          n
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-60", children: [
          xp,
          " XP"
        ] })
      ] }, n)) })
    ] })
  ] }) });
}
function RadioMockup() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b1a]/90 shadow-[0_30px_80px_-20px_rgba(244,114,182,0.45)] backdrop-blur-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 text-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-rose-300", children: "● Live Now" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-3xl shadow-lg shadow-fuchsia-500/40", children: "🎧" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white/10 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3 w-3 fill-white text-white" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold", children: "DJ Night Vibes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-70", children: "128 listeners · Spinning lofi & house" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "hidden rounded-full bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur sm:block", children: "Tune in" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex h-16 items-end gap-1", children: Array.from({
      length: 48
    }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 rounded-sm bg-gradient-to-t from-fuchsia-500 to-cyan-300", style: {
      height: `${20 + Math.abs(Math.sin(i * 0.6)) * 80}%`,
      animation: `hero-bar 1200ms ease-in-out ${i * 35}ms infinite alternate`
    } }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-2 sm:grid-cols-3", children: [{
      name: "Chill Beats",
      time: "Today, 8:00 PM"
    }, {
      name: "Retro Hits",
      time: "Tomorrow, 10 PM"
    }, {
      name: "Love Songs",
      time: "Sunday, 9 PM"
    }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: s.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 opacity-60", children: s.time }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-2 rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-[10px] font-semibold text-fuchsia-200", children: "Set reminder" })
    ] }, s.name)) })
  ] }) });
}
function XPMockup() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b1a]/90 p-6 text-white shadow-[0_30px_80px_-20px_rgba(251,191,36,0.35)] backdrop-blur-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 p-4 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70", children: "Level 24" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300", children: "Community Star" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-9 w-9 text-amber-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-full overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-amber-300 to-fuchsia-400", style: {
              width: "62%"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] opacity-60", children: "6,520 / 10,000 XP" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/15 to-amber-400/10 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-70", children: "Daily Streak" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "🔥" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-extrabold leading-none", children: "12 Days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-60", children: "Keep it up!" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold opacity-80", children: "Top 3 This Week" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1.5 text-xs", children: [["Alex", "15.5K"], ["Emma", "13.2K"], ["Luna", "12.5K"]].map(([n, xp], i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg bg-white/[0.04] px-2 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-300", children: [
              "#",
              i + 1
            ] }),
            n
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70", children: [
            xp,
            " XP"
          ] })
        ] }, n)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold opacity-80", children: "Recent Badges" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid grid-cols-4 gap-2", children: ["🏅", "🏆", "🎙️", "👑"].map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid aspect-square place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 text-2xl", children: b }, i)) })
      ] })
    ] })
  ] });
}
function GamesMockup({
  items
}) {
  const games = [{
    emoji: "🎣",
    name: "Fishing",
    players: "1.1k playing",
    grad: "from-sky-500/30 to-cyan-500/30"
  }, {
    emoji: "🔤",
    name: "Hangman",
    players: "820 playing",
    grad: "from-amber-500/30 to-rose-500/30"
  }, {
    emoji: "🧠",
    name: "Trivia",
    players: "950 playing",
    grad: "from-indigo-500/30 to-fuchsia-500/30"
  }, {
    emoji: "⛏️",
    name: "Dig Gold",
    players: "670 playing",
    grad: "from-yellow-500/30 to-orange-500/30"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: games.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${g.grad} p-5 transition hover:-translate-y-1 hover:border-white/30`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl", children: g.emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-sm font-semibold", children: g.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[11px] opacity-70", children: g.players }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/20" })
    ] }, g.name)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: items.slice(0, 4).map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 60, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: it.emoji }),
        " ",
        it.title
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs opacity-70", children: it.description })
    ] }) }, i)) })
  ] });
}
function HeroHomepage() {
  const cfg = useHeroConfig();
  const stats = useLiveStats();
  const {
    user
  } = useAuth();
  const [dark, setDark] = reactExports.useState(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem("heropage-theme");
    return stored ? stored === "dark" : true;
  });
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("heropage-theme", dark ? "dark" : "light");
    }
  }, [dark]);
  const [popup, setPopup] = reactExports.useState(null);
  useNavigate();
  const goOrPopup = (_to) => (_e) => {
  };
  const [scrolled, setScrolled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (user) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/", replace: true });
  const bg = dark ? "bg-black bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#0b0b1a_45%,_#000_100%)] text-white" : "bg-white bg-[radial-gradient(ellipse_at_top,_#dbeafe_0%,_#f5f3ff_45%,_#fff_100%)] text-slate-900";
  const statCards = [{
    emoji: "👥",
    label: "Members",
    value: stats.members || 25e3
  }, {
    emoji: "🟢",
    label: "Online",
    value: stats.online || 1200
  }, {
    emoji: "💬",
    label: "Chatrooms",
    value: stats.rooms || 320
  }, {
    emoji: "🎙️",
    label: "Live Radios",
    value: stats.djs || 48
  }, {
    emoji: "📝",
    label: "Posts Today",
    value: stats.postsToday || 980
  }];
  const SectionShell = ({
    id,
    children,
    className = ""
  }) => /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id, className: `relative z-10 mx-auto w-full max-w-7xl px-5 py-20 sm:py-28 ${className}`, children });
  const renderSection = (s) => {
    if (!s.enabled) return null;
    switch (s.key) {
      case "hero":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SectionShell, { id: "top", className: "!py-12 sm:!py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-xl", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-fuchsia-300" }),
              " Welcome to ",
              cfg.brandName,
              " Community ✨"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-5 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl", children: [
              "Connect, Chat,",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent", children: "Share & Grow" }),
              " ",
              "Together"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-xl text-base opacity-80 sm:text-lg", children: cfg.subheadline }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPopup("signup"), className: "group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(217,70,239,0.6)] transition-transform hover:scale-[1.03]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
                " ",
                cfg.ctaJoinLabel,
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPopup("signin"), className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold backdrop-blur-xl hover:bg-white/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4" }),
                " ",
                cfg.ctaLoginLabel
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4", children: statCards.slice(0, 4).map((sc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] opacity-70", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: sc.emoji }),
                sc.label
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xl font-extrabold tracking-tight", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: sc.value }) })
            ] }, sc.label)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { delay: 120, className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -inset-10 rounded-[40px] bg-gradient-to-tr from-fuchsia-500/20 via-violet-500/10 to-cyan-500/20 blur-3xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", style: {
              animation: "hero-float 8s ease-in-out infinite"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatroomMockup, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-6 -right-2 hidden w-40 rotate-3 sm:block", style: {
              animation: "hero-float 9s ease-in-out 0.5s infinite"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Glass, { className: "overflow-hidden p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-60", children: "🔥 Trending Room" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm font-bold", children: "Music Vibes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex -space-x-1.5", children: [
                ["from-fuchsia-500 to-pink-500", "from-indigo-500 to-cyan-500", "from-amber-400 to-rose-500", "from-emerald-400 to-teal-500"].map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-5 w-5 rounded-full bg-gradient-to-br ${g} ring-2 ring-[#0b0b1a]` }, i)),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 self-center text-[10px] opacity-70", children: "+128" })
              ] })
            ] }) })
          ] })
        ] }) }, "hero");
      case "stats":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SectionShell, { className: "!py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Glass, { className: "p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4 text-orange-400" }),
            " Live community pulse"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5", children: statCards.map((sc, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 80, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: sc.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-3xl font-black tracking-tight", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: sc.value }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[10px] uppercase tracking-wider opacity-60", children: sc.label })
          ] }) }, sc.label)) })
        ] }) }) }, "stats");
      case "chatrooms":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(217,70,239,0.18),_transparent_60%)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid items-center gap-14 lg:grid-cols-[1fr_1.25fr]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTag, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5 text-fuchsia-300" }),
                " Chat Without Limits"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-black leading-tight sm:text-5xl", children: [
                "Real-time Chatrooms",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "Built for",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent", children: "Everyone" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-xl opacity-75", children: "Join public chatrooms, create private rooms or have fun in 3some rooms with your close friends. Realtime messaging, voice, radio and games — all in one place." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureRow, { items: cfg.chatroomFeatures.slice(0, 8) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { delay: 120, className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -inset-8 rounded-[40px] bg-gradient-to-tr from-fuchsia-500/25 to-indigo-500/25 blur-3xl" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", style: {
                animation: "hero-float 10s ease-in-out infinite"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatroomMockup, {}) })
            ] })
          ] }) })
        ] }, "chatrooms");
      case "feed":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15),_transparent_60%)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid items-center gap-14 lg:grid-cols-[1.25fr_1fr]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { className: "lg:order-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTag, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Newspaper, { className: "h-3.5 w-3.5 text-cyan-300" }),
                " Share Your Moments"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-black leading-tight sm:text-5xl", children: [
                "Engaging Social Feed",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "For Your",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent", children: "Community" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-xl opacity-75", children: "Share updates, photos, thoughts and connect with people through reactions, comments and trending leaderboards." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureRow, { items: cfg.feedFeatures.slice(0, 8) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: 120, className: "lg:order-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -inset-8 rounded-[40px] bg-gradient-to-tr from-indigo-500/25 to-cyan-500/20 blur-3xl" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", style: {
                animation: "hero-float 10s ease-in-out infinite"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedMockup, {}) })
            ] }) })
          ] }) })
        ] }, "feed");
      case "radio":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,114,182,0.18),_transparent_60%)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid items-center gap-14 lg:grid-cols-[1fr_1.2fr]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTag, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-3.5 w-3.5 text-rose-300" }),
                " Listen. Enjoy. Live."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-black leading-tight sm:text-5xl", children: [
                "Live Radio",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                " 24/7 ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-rose-400 to-fuchsia-400 bg-clip-text text-transparent", children: "Entertainment" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-xl opacity-75", children: "Tune into your favorite DJs, request songs and be part of the broadcast." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureRow, { items: cfg.radioFeatures.slice(0, 6) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: 120, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RadioMockup, {}) })
          ] }) })
        ] }, "radio");
      case "games":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.12),_transparent_60%)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTag, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "h-3.5 w-3.5 text-emerald-300" }),
                " Play Together"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-black leading-tight sm:text-5xl", children: [
                "Fun Games",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "Win ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent", children: "Rewards" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-xl opacity-75", children: "Play exciting games with friends, win coins, XP and special rewards." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: 120, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GamesMockup, { items: cfg.gameFeatures }) })
          ] }) })
        ] }, "games");
      case "famous_chatrooms":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(FamousChatroomsSection, { rooms: cfg.famousChatrooms }, "famous_chatrooms");
      case "live_users":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(LiveUsersSection, { users: cfg.liveUsers }, "live_users");
      case "daily_missions":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.12),_transparent_60%)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionShell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTag, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3.5 w-3.5 text-amber-300" }),
                " Level Up & Shine"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-black sm:text-5xl", children: [
                "XP, Badges & Rewards",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "For ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-amber-300 to-rose-400 bg-clip-text text-transparent", children: "Everyone" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xl opacity-75", children: "Earn XP, maintain streaks, unlock badges and climb the leaderboards." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: 80, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: cfg.dailyMissions.slice(0, 6).map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-400/25 to-rose-500/25 text-xl", children: m.emoji }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: m.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300", children: m.reward })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xs opacity-70", children: m.description })
                ] })
              ] }, i)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: 140, children: /* @__PURE__ */ jsxRuntimeExports.jsx(XPMockup, {}) })
            ] })
          ] })
        ] }, "daily_missions");
      case "social_proof":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionShell, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTag, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5 text-pink-400" }),
              " Loved by Thousands"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-black sm:text-5xl", children: [
              "A Community That",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "Feels Like ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-pink-400 to-fuchsia-400 bg-clip-text text-transparent", children: "Home 💗" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [{
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 text-amber-300" }),
            label: "Top Members",
            emoji: "👑",
            text: "Climbing the leaderboards every day."
          }, {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-4 w-4 text-pink-300" }),
            label: "Top DJs",
            emoji: "🎧",
            text: "Real DJs spinning live sets nightly."
          }, {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4 text-orange-400" }),
            label: "Trending Posts",
            emoji: "🔥",
            text: "What the community can't stop talking about."
          }, {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-cyan-300" }),
            label: "Popular Rooms",
            emoji: "💬",
            text: "Hop into the rooms with the loudest energy."
          }].map((sp, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 80, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Glass, { className: "h-full p-5 transition hover:-translate-y-1 hover:border-white/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs opacity-70", children: [
              sp.icon,
              " ",
              sp.label
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-4xl", children: sp.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm opacity-75", children: sp.text })
          ] }) }, sp.label)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-4 sm:grid-cols-3", children: [{
            n: "Alex",
            role: "Community Star",
            q: "This community is more than an app, it's a family. I've made amazing friends here!"
          }, {
            n: "Emma",
            role: "Top Radio Host",
            q: "The radio feature is incredible. I love hosting my own shows!"
          }, {
            n: "Luna",
            role: "Super Active",
            q: "The best community platform ever! So much fun and positive vibes."
          }].map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 100, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Glass, { className: "h-full p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-sm font-bold", children: t.n[0] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: t.n }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] opacity-60", children: t.role })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex text-amber-300", children: Array.from({
                length: 5
              }).map((_, k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-current" }, k)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm opacity-80", children: [
              '"',
              t.q,
              '"'
            ] })
          ] }) }, t.n)) })
        ] }, "social_proof");
      case "final_cta":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SectionShell, { className: "!pb-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-r from-fuchsia-600/30 via-violet-600/25 to-indigo-600/30 p-10 text-center backdrop-blur-2xl shadow-[0_30px_120px_-30px_rgba(217,70,239,0.6)] sm:p-16", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-20 left-1/2 h-64 w-[60%] -translate-x-1/2 rounded-full bg-fuchsia-500/40 blur-3xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "mx-auto h-10 w-10 text-pink-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-4xl font-black sm:text-5xl", children: cfg.finalCtaTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 mx-auto max-w-xl opacity-85", children: cfg.finalCtaSubtitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPopup("signup"), className: "rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-xl transition hover:scale-105", children: cfg.ctaJoinLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPopup("signin"), className: "rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl transition hover:scale-105", children: cfg.ctaLoginLabel })
          ] })
        ] }) }) }, "final_cta");
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-hero-theme": dark ? "dark" : "light", className: `min-h-screen relative overflow-x-clip ${dark ? "text-white" : "text-slate-900"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: `fixed inset-0 -z-10 ${bg}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        html { scroll-behavior: smooth; }
        @keyframes hero-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes hero-msg-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes hero-bar { from { transform: scaleY(0.4) } to { transform: scaleY(1) } }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute bottom-40 left-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: `sticky top-0 z-30 transition-all ${scrolled ? "border-b border-white/10 bg-black/40 backdrop-blur-xl" : "bg-transparent"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-5 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg shadow-lg", children: "✨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold tracking-tight", children: cfg.brandName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden items-center gap-5 text-sm opacity-80 md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/heropage", onClick: goOrPopup(), className: "hover:opacity-100", children: "Home" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", onClick: goOrPopup(), className: "hover:opacity-100", children: "Chatrooms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/feed", onClick: goOrPopup(), className: "hover:opacity-100", children: "Feed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/confessions", onClick: goOrPopup(), className: "hover:opacity-100", children: "Confessions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/battle-hub", onClick: goOrPopup(), className: "hover:opacity-100", children: "Battle Hub" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/games", onClick: goOrPopup(), className: "hover:opacity-100", children: "Games" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/leaderboard", onClick: goOrPopup(), className: "hover:opacity-100", children: "Leaderboard" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, { dark, setDark }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPopup("signin"), className: "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-xl hover:bg-white/10", children: "Login" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPopup("signup"), className: "hidden rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg sm:inline-block", children: "Join Now" })
      ] })
    ] }) }),
    cfg.sections.map((s) => {
      const node = renderSection(s);
      if (!node) return null;
      const anchor = {
        chatrooms: "chatrooms",
        feed: "feed",
        radio: "radio",
        games: "games",
        daily_missions: "rewards"
      };
      const id = anchor[s.key];
      return id ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id, children: node }, s.key) : node;
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "relative z-10 border-t border-white/10 py-8 text-center text-xs opacity-60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl px-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/welcome", className: "underline-offset-4 hover:underline", children: "View classic homepage" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1", children: "·" }),
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " ",
      cfg.brandName
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthDialogs, { popup, setPopup })
  ] });
}
function FamousChatroomsSection({
  rooms
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative z-10 mx-auto w-full max-w-7xl px-5 py-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTag, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5 text-orange-400" }),
        " Famous Chatrooms"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-black sm:text-5xl", children: [
        "Drop into the rooms",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "everyone's ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent", children: "talking about" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: rooms.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 80, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Glass, { className: "flex items-start gap-3 p-5 transition hover:-translate-y-1 hover:border-white/25", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 text-3xl", children: r.emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-base font-bold", children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400" }),
            " ",
            r.members.toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs opacity-70", children: r.topic }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex -space-x-1.5", children: ["from-fuchsia-500 to-pink-500", "from-indigo-500 to-cyan-500", "from-amber-400 to-rose-500", "from-emerald-400 to-teal-500"].map((g, k) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-6 w-6 rounded-full bg-gradient-to-br ${g} ring-2 ring-black/40` }, k)) })
      ] })
    ] }) }, i)) })
  ] });
}
function LiveUsersSection({
  users
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative z-10 mx-auto w-full max-w-7xl px-5 py-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTag, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-3.5 w-3.5 place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400 animate-pulse" }) }),
        "Live Users"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-black sm:text-5xl", children: [
        "Real people, ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent", children: "online right now" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4", children: users.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 60, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Glass, { className: "p-5 text-center transition hover:-translate-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 text-4xl", children: [
        u.imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: u.imageUrl, alt: u.name, className: "h-full w-full rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: u.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0 right-1 h-3.5 w-3.5 rounded-full border-2 border-black/80 bg-emerald-400" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-sm font-semibold", children: u.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 line-clamp-1 text-[11px] opacity-70", children: u.status }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3" }),
        " Active"
      ] })
    ] }) }, i)) })
  ] });
}
export {
  HeroHomepage as component
};
