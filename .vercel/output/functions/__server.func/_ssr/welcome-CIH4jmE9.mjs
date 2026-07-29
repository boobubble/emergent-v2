import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useAuth, aD as LANDING_DEFAULTS, j as BrandMark, k as BrandText, W as AuthDialogs } from "./router-CYWPFaDK.mjs";
import { M as MehfilTrendingWidget } from "./MehfilTrendingWidget-LpbzmQfn.mjs";
import { a as useMehfilSettings } from "./use-mehfil-label-BWBPC7g6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a7 as Sun, a8 as Moon, N as Search, X, aN as Menu, b2 as Rocket, U as Users, aC as Activity, h as MessageCircle, g as MessageSquare, ay as Newspaper, o as Gamepad2, f as Heart, Y as Coins, bz as CircleCheck, aM as Circle, a2 as Gift, F as Flame, a6 as ChevronRight, aB as Crown, l as Star, ab as ArrowRight, bK as Instagram, bL as Twitter, aG as Youtube } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-H8IXbXWR.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "./mehfil-admin.functions-BntRjkJU.mjs";
const fmt = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "")}K` : n.toLocaleString();
function Card({
  className = "",
  children,
  style
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-2xl border border-white/[0.07] bg-[#10101f]/80 backdrop-blur-xl ${className}`, style, children });
}
function PillAvatar({
  name,
  size = 32,
  color
}) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center rounded-full font-bold text-white ring-2 ring-white/10 shrink-0", style: {
    width: size,
    height: size,
    fontSize: size * 0.42,
    background: color || `linear-gradient(135deg, hsl(${Math.abs(name.charCodeAt(0) * 13) % 360} 70% 55%), hsl(${Math.abs(name.charCodeAt(0) * 29) % 360} 70% 45%))`
  }, children: letter });
}
function LandingPage() {
  const [data, setData] = reactExports.useState(null);
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  const [pollChoice, setPollChoice] = reactExports.useState(null);
  const [theme, setTheme] = reactExports.useState("dark");
  const [authPopup, setAuthPopup] = reactExports.useState(null);
  const {
    user
  } = useAuth();
  useNavigate();
  const handleNav = (_to) => (_e) => {
    setMenuOpen(false);
  };
  reactExports.useEffect(() => {
    try {
      const saved = localStorage.getItem("palrgo-welcome-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
    }
  }, []);
  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("palrgo-welcome-theme", next);
      } catch {
      }
      return next;
    });
  };
  reactExports.useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/public/landing");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancel) setData(json);
      } catch {
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);
  reactExports.useEffect(() => {
    const cfg2 = data?.config;
    if (!cfg2 || typeof document === "undefined") return;
    if (cfg2.seoTitle) document.title = cfg2.seoTitle;
    const setMeta = (selector, attr, key, content) => {
      if (!content) return;
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', "name", "description", cfg2.seoDescription);
    setMeta('meta[name="keywords"]', "name", "keywords", cfg2.seoKeywords);
    setMeta('meta[property="og:title"]', "property", "og:title", cfg2.seoTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", cfg2.seoDescription);
  }, [data?.config]);
  const cfg = data?.config ?? LANDING_DEFAULTS;
  const stats = data?.stats ?? {
    members: cfg.demoStats.members,
    online: cfg.demoStats.online,
    activeRooms: cfg.demoStats.activeRooms,
    messagesSent: cfg.demoStats.messagesSent,
    feedPosts: cfg.demoStats.feedPosts,
    gamesPlayed: cfg.demoStats.gamesPlayed
  };
  const chatrooms = data?.chatrooms ?? cfg.demoChatrooms;
  const topMembers = data?.topMembers ?? cfg.demoTopMembers;
  const feedPost = data?.feedPost ?? cfg.demoFeedPost;
  const poll = data?.poll ?? cfg.demoPoll;
  const confession = data?.confession ?? cfg.demoConfession;
  const trendingPosts = data?.trendingPosts ?? cfg.trendingPosts;
  const discussions = data?.discussions ?? cfg.discussions;
  const featuredMembers = data?.featuredMembers ?? cfg.featuredMembers;
  const recentConfessions = data?.recentConfessions ?? cfg.recentConfessions;
  const blogPosts = data?.blogPosts ?? cfg.blogPosts;
  data?.activities ?? cfg.activities;
  const navLinks = reactExports.useMemo(() => [{
    label: "Home",
    to: "/welcome"
  }, {
    label: "Feed",
    to: "/feed"
  }, {
    label: "Chatrooms",
    to: "/"
  }, {
    label: "Games",
    to: "/games"
  }, {
    label: "Confessions",
    to: "/confessions"
  }, {
    label: "Battle Hub",
    to: "/battle-hub"
  }, {
    label: "Leaderboard",
    to: "/leaderboard"
  }], []);
  const pollTotal = poll.options.reduce((s, o) => s + (o.votes || 0), 0) || 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `welcome-root ${theme === "light" ? "welcome-light" : "welcome-dark"} relative min-h-screen overflow-x-hidden bg-[#070713] text-white antialiased`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .welcome-light { background: #f5f6fb !important; color: #0b0b1a !important; }
        .welcome-light .bg-\\[\\#070713\\],
        .welcome-light .bg-\\[\\#070713\\]\\/80,
        .welcome-light .bg-\\[\\#070713\\]\\/95,
        .welcome-light .bg-\\[\\#06060f\\] { background-color: rgba(245,246,251,0.95) !important; }
        .welcome-light .bg-\\[\\#10101f\\],
        .welcome-light .bg-\\[\\#10101f\\]\\/80 { background-color: rgba(255,255,255,0.92) !important; }
        .welcome-light .text-white { color: #0b0b1a !important; }
        .welcome-light .text-white\\/90 { color: rgba(11,11,26,0.9) !important; }
        .welcome-light .text-white\\/85 { color: rgba(11,11,26,0.86) !important; }
        .welcome-light .text-white\\/80 { color: rgba(11,11,26,0.82) !important; }
        .welcome-light .text-white\\/70 { color: rgba(11,11,26,0.74) !important; }
        .welcome-light .text-white\\/65 { color: rgba(11,11,26,0.7) !important; }
        .welcome-light .text-white\\/60 { color: rgba(11,11,26,0.66) !important; }
        .welcome-light .text-white\\/55 { color: rgba(11,11,26,0.62) !important; }
        .welcome-light .text-white\\/50 { color: rgba(11,11,26,0.6) !important; }
        .welcome-light .text-white\\/45 { color: rgba(11,11,26,0.58) !important; }
        .welcome-light .text-white\\/40 { color: rgba(11,11,26,0.55) !important; }
        .welcome-light .text-white\\/30 { color: rgba(11,11,26,0.5) !important; }
        .welcome-light .border-white\\/5 { border-color: rgba(11,11,26,0.08) !important; }
        .welcome-light .border-white\\/10 { border-color: rgba(11,11,26,0.12) !important; }
        .welcome-light .border-white\\/15 { border-color: rgba(11,11,26,0.16) !important; }
        .welcome-light .border-white\\/\\[0\\.07\\] { border-color: rgba(11,11,26,0.08) !important; }
        .welcome-light .bg-white\\/5,
        .welcome-light .bg-white\\/10,
        .welcome-light .bg-white\\/15,
        .welcome-light .bg-white\\/\\[0\\.03\\],
        .welcome-light .bg-white\\/\\[0\\.04\\],
        .welcome-light .bg-white\\/\\[0\\.06\\],
        .welcome-light .bg-white\\/\\[0\\.08\\] { background-color: rgba(11,11,26,0.05) !important; }
        .welcome-light .hover\\:bg-white\\/5:hover,
        .welcome-light .hover\\:bg-white\\/10:hover,
        .welcome-light .hover\\:bg-white\\/\\[0\\.08\\]:hover { background-color: rgba(11,11,26,0.08) !important; }
        .welcome-light .hover\\:text-white:hover { color: #0b0b1a !important; }
        .welcome-light .text-purple-300 { color: #6d28d9 !important; }
        .welcome-light .text-purple-200 { color: #5b21b6 !important; }
        .welcome-light .hover\\:text-purple-200:hover { color: #4c1d95 !important; }
        .welcome-light .stat-value {
          background-image: none !important;
          -webkit-text-fill-color: #0b0b1a !important;
          color: #0b0b1a !important;
        }
        .welcome-light .stat-tile {
          background: linear-gradient(135deg, color-mix(in oklab, var(--stat-tint) 30%, #ffffff), color-mix(in oklab, var(--stat-tint) 14%, #ffffff)) !important;
          box-shadow: 0 8px 20px -10px color-mix(in oklab, var(--stat-tint) 65%, transparent), inset 0 1px 0 rgba(255,255,255,0.6) !important;
          --tw-ring-color: color-mix(in oklab, var(--stat-tint) 35%, transparent) !important;
        }
        .welcome-light .stat-icon { color: color-mix(in oklab, var(--stat-tint) 75%, #0b0b1a) !important; }
        .welcome-light .stat-cell::after { background-color: rgba(11,11,26,0.14) !important; }
        .welcome-light .stat-cell:hover { background-color: rgba(11,11,26,0.04) !important; }
        .welcome-light .hero-dark-preview .text-white { color: #ffffff !important; }
        .welcome-light .hero-dark-preview .text-white/90 { color: rgba(255,255,255,0.9) !important; }
        .welcome-light .hero-dark-preview .text-white/85 { color: rgba(255,255,255,0.86) !important; }
        .welcome-light .hero-dark-preview .text-white/80 { color: rgba(255,255,255,0.82) !important; }
        .welcome-light .hero-dark-preview .text-white/70 { color: rgba(255,255,255,0.72) !important; }
        .welcome-light .hero-dark-preview .text-white/60 { color: rgba(255,255,255,0.62) !important; }
        .welcome-light .hero-dark-preview .text-white/55 { color: rgba(255,255,255,0.56) !important; }
        .welcome-light .hero-dark-preview .text-white/50 { color: rgba(255,255,255,0.52) !important; }
        .welcome-light .hero-dark-preview .text-white/45 { color: rgba(255,255,255,0.46) !important; }
        .welcome-light .hero-dark-preview .text-white/40 { color: rgba(255,255,255,0.42) !important; }
        .welcome-light .hero-dark-preview .text-white/35 { color: rgba(255,255,255,0.38) !important; }
        .welcome-light .hero-dark-preview .border-white/10 { border-color: rgba(255,255,255,0.1) !important; }
        .welcome-light .hero-dark-preview .border-white/15 { border-color: rgba(255,255,255,0.15) !important; }
        .welcome-light .hero-dark-preview .bg-white/15 { background-color: rgba(255,255,255,0.15) !important; }
        .welcome-light .hero-dark-preview .bg-white/[0.04] { background-color: rgba(255,255,255,0.04) !important; }
        @keyframes welcome-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: welcome-float 4s ease-in-out infinite; }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none fixed inset-0 -z-10 select-none", "aria-hidden": true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-32 top-[-10%] h-[520px] w-[520px] rounded-full opacity-50 blur-3xl", style: {
        background: "radial-gradient(closest-side,#8b5cf6,transparent 70%)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-[-15%] top-[20%] h-[600px] w-[600px] rounded-full opacity-40 blur-3xl", style: {
        background: "radial-gradient(closest-side,#3b82f6,transparent 70%)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/3 bottom-[-10%] h-[500px] w-[500px] rounded-full opacity-30 blur-3xl", style: {
        background: "radial-gradient(closest-side,#ec4899,transparent 70%)"
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-40 border-b border-white/5 bg-[#070713]/80 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/welcome", className: "flex items-center gap-2.5 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { slot: "logo", forceTheme: "dark", alt: cfg.copyrightOwner, fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-xl text-base font-black text-white shadow-lg", style: {
            background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
            boxShadow: "0 8px 24px -8px rgba(139,92,246,0.6)"
          }, children: "💬" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BrandText, { slot: "logo", forceTheme: "dark", defaultText: cfg.copyrightOwner, className: "text-lg font-extrabold tracking-tight" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "ml-6 hidden items-center gap-1 lg:flex", children: navLinks.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: l.to, onClick: handleNav(l.to), className: "rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white", activeProps: {
          className: "rounded-full px-3.5 py-2 text-sm font-semibold text-white bg-white/10"
        }, children: l.label }, l.to + l.label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleTheme, className: "grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:text-white", "aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode", title: theme === "dark" ? "Light mode" : "Dark mode", children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "hidden grid h-9 w-9 sm:grid place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:text-white", "aria-label": "Search", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAuthPopup("signin"), className: "hidden rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.08] sm:inline-flex", children: "Login" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAuthPopup("signup"), className: "rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03]", style: {
            background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
            boxShadow: "0 8px 24px -8px rgba(139,92,246,0.7)"
          }, children: "Sign Up" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMenuOpen((v) => !v), className: "grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden", "aria-label": "Toggle menu", children: menuOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" }) })
        ] })
      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-white/10 bg-[#070713]/95 px-4 pb-4 pt-2 lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "grid gap-1", children: navLinks.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: l.to, onClick: handleNav(l.to), className: "rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5", children: l.label }, l.to + l.label)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-8 lg:pt-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-[40px] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[58px]", children: [
          cfg.heroTitle,
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-clip-text text-transparent", style: {
            backgroundImage: "linear-gradient(120deg,#a78bfa 0%,#c084fc 40%,#60a5fa 100%)"
          }, children: cfg.heroTitleHighlight })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-xl text-base text-white/65 sm:text-lg", children: cfg.heroSubtitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: cfg.heroBadges.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur", children: b }, b)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setAuthPopup("signin"), className: "group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03]", style: {
            background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
            boxShadow: "0 12px 32px -8px rgba(139,92,246,0.65)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "h-4 w-4" }),
            " ",
            cfg.primaryCtaLabel
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setAuthPopup("signup"), className: "inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/[0.08]", children: [
            "✨ ",
            cfg.secondaryCtaLabel
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-2", children: ["Amit", "Pooja", "Rahul", "Neha"].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(PillAvatar, { name: n, size: 32 }, n)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/65 sm:text-sm", children: cfg.heroSocialProof })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative hidden lg:block min-h-[560px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 -z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-10 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl", style: {
            background: "radial-gradient(closest-side,#8b5cf6,transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full opacity-50 blur-3xl", style: {
            background: "radial-gradient(closest-side,#3b82f6,transparent 70%)"
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hero-dark-preview absolute right-0 top-4 w-[480px] rotate-[-2deg] rounded-2xl border border-white/15 bg-[#0e0e22]/90 shadow-[0_30px_80px_-20px_rgba(139,92,246,0.55)] backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-white/10 px-4 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-6 w-6 place-items-center rounded-md text-[11px] font-black text-white", style: {
              background: "linear-gradient(135deg,#8b5cf6,#3b82f6)"
            }, children: "💬" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-white/85", children: "ChitChat" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-white/15" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-white/15" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 text-white/40" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_120px] gap-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-r border-white/10 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-lg text-sm", style: {
                  background: "linear-gradient(135deg,#f59e0b,#dc2626)"
                }, children: "🇮🇳" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-white", children: "India Chat" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-white/50", children: "128 online" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [{
                n: "Amit Sharma",
                t: "Hello everyone! 👋",
                ts: "10:30"
              }, {
                n: "Pooja Singh",
                t: "Good morning all ☀️",
                ts: "10:31"
              }, {
                n: "Rahul Verma",
                t: "Anyone up for a game?",
                ts: "10:32"
              }, {
                n: "Neha Patel",
                t: "Hey! How's it going?",
                ts: "10:33"
              }, {
                n: "Vikram",
                t: "Let's play Ludo! 🎲",
                ts: "10:34"
              }].map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PillAvatar, { name: m.n, size: 22 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-white/90", children: m.n }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[8px] text-white/35", children: [
                      m.ts,
                      " AM"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] leading-snug text-white/70", children: m.t })
                ] })
              ] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] text-white/40", children: [
                "Type a message...",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto", children: "😊" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📎" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[9px] font-bold uppercase tracking-wider text-white/50", children: "Online · 128" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: ["Amit Sharma", "Pooja Singh", "Rahul Verma", "Neha Patel", "Vikram", "Aditya", "Kavya"].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PillAvatar, { name: n, size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[9px] text-white/70", children: n.split(" ")[0] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" })
              ] }, n)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-lg bg-white/[0.04] p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-bold text-white/60", children: "Room Info" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[9px] font-bold text-white", children: "India Chat" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] text-white/45", children: "Public Room" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-[-10px] bottom-0 w-[200px] rotate-[-6deg] rounded-[28px] border border-white/15 bg-[#0a0a1a] p-1.5 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.6)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-[22px] bg-[#10101f]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 top-1.5 z-10 h-3 w-16 -translate-x-1/2 rounded-full bg-black" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2.5 pb-2 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[8px] text-white/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "9:41" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📶 📡 🔋" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PillAvatar, { name: "Tara", size: 20 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold text-white", children: "Tara Sparks" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 rounded-lg bg-white/[0.05] p-1.5 text-[8px] text-white/70", children: "Going strong! 🚀" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PillAvatar, { name: "Pooja", size: 20 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold text-white", children: "Pooja Singh" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 rounded-lg bg-white/[0.05] p-1.5 text-[8px] text-white/70", children: "Good morning all ☀️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid grid-cols-4 gap-1", children: ["🐼", "🦊", "🐻", "🐰", "🦁", "🐯", "🐨", "🐶"].map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid aspect-square place-items-center rounded-md bg-white/[0.06] text-[14px]", children: e }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex justify-around border-t border-white/5 pt-1.5 text-[10px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🏠" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🔍" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💬" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🎮" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "👤" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-2 top-1 grid h-14 w-14 animate-bounce-slow place-items-center rounded-full text-3xl shadow-[0_10px_30px_-5px_rgba(168,85,247,0.7)]", style: {
          background: "linear-gradient(135deg,#a855f7,#6366f1)"
        }, children: "😎" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-8 top-[260px] grid h-12 w-12 place-items-center rounded-2xl text-xl shadow-[0_10px_30px_-5px_rgba(59,130,246,0.7)]", style: {
          background: "linear-gradient(135deg,#3b82f6,#8b5cf6)"
        }, children: "💬" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-dark-preview absolute right-4 bottom-8 rounded-2xl border border-white/15 bg-[#0e0e22]/90 px-3 py-2 backdrop-blur-xl shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-white", children: "Connected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/55", children: "128 Online" })
        ] }) })
      ] })
    ] }) }),
    cfg.showStats && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-white/10 p-2 sm:p-3 backdrop-blur-2xl shadow-[0_30px_80px_-30px_rgba(139,92,246,0.45)]", style: {
      background: "linear-gradient(135deg,rgba(139,92,246,0.10),rgba(59,130,246,0.06) 50%,rgba(236,72,153,0.08))"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full opacity-40 blur-3xl", style: {
        background: "radial-gradient(closest-side,#8b5cf6,transparent 70%)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full opacity-40 blur-3xl", style: {
        background: "radial-gradient(closest-side,#3b82f6,transparent 70%)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { icon: Users, tint: "#a78bfa", label: "Members", value: fmt(stats.members) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { icon: Activity, tint: "#34d399", label: "Online Now", value: fmt(stats.online), pulse: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { icon: MessageCircle, tint: "#60a5fa", label: "Active Chatrooms", value: fmt(stats.activeRooms) }),
        cfg.showMessageCount && /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { icon: MessageSquare, tint: "#22d3ee", label: "Messages Sent", value: fmt(stats.messagesSent) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { icon: Newspaper, tint: "#f472b6", label: "Feed Posts", value: fmt(stats.feedPosts) }),
        cfg.showGameCount && /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { icon: Gamepad2, tint: "#fbbf24", label: "Games Played", value: fmt(stats.gamesPlayed) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", children: cfg.featureCards.map((f, i) => {
      const palettes = [
        "linear-gradient(135deg,#8b5cf6,#6d28d9)",
        // purple
        "linear-gradient(135deg,#3b82f6,#1d4ed8)",
        // blue
        "linear-gradient(135deg,#f97316,#ea580c)",
        // orange
        "linear-gradient(135deg,#10b981,#059669)",
        // green
        "linear-gradient(135deg,#ef4444,#b91c1c)",
        // red
        "linear-gradient(135deg,#a855f7,#7c3aed)"
        // violet
      ];
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden p-0 text-center transition-transform hover:-translate-y-0.5", children: f.href ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: f.href, className: "block p-5", target: f.href.startsWith("http") ? "_blank" : void 0, rel: f.href.startsWith("http") ? "noopener noreferrer" : void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl shadow-lg", style: {
          background: palettes[i % palettes.length],
          boxShadow: `0 10px 24px -10px ${["#8b5cf6", "#3b82f6", "#f97316", "#10b981", "#ef4444", "#a855f7"][i % 6]}99`
        }, children: f.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 text-sm font-bold", children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] leading-snug text-white/55", children: f.description })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl shadow-lg", style: {
          background: palettes[i % palettes.length],
          boxShadow: `0 10px 24px -10px ${["#8b5cf6", "#3b82f6", "#f97316", "#10b981", "#ef4444", "#a855f7"][i % 6]}99`
        }, children: f.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 text-sm font-bold", children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] leading-snug text-white/55", children: f.description })
      ] }) }, `${f.title}-${i}`);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "🔥", title: "Trending Chatrooms", href: "/" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2.5", children: chatrooms.slice(0, 5).map((r, i) => {
            const thumbs = ["linear-gradient(135deg,#f59e0b,#dc2626)", "linear-gradient(135deg,#3b82f6,#1e3a8a)", "linear-gradient(135deg,#10b981,#065f46)", "linear-gradient(135deg,#f97316,#7c2d12)", "linear-gradient(135deg,#ec4899,#831843)"];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid h-11 w-14 place-items-center overflow-hidden rounded-lg text-xl ring-1 ring-white/10", style: {
                background: thumbs[i % thumbs.length]
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "drop-shadow", children: r.emoji }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 bg-black/20" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-sm font-bold", children: [
                  "#",
                  r.name.replace(/^#/, "")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-white/50", children: [
                  fmt(r.online),
                  " Online"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" })
            ] }, r.name);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "🏆", title: "Top Members", suffix: "(This Week)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: topMembers.slice(0, 3).map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-6 w-6 place-items-center rounded-md text-[11px] font-black", style: {
              background: i === 0 ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : i === 1 ? "linear-gradient(135deg,#e5e7eb,#9ca3af)" : "linear-gradient(135deg,#fbbf24,#b45309)",
              color: "#0a0a0a"
            }, children: i + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PillAvatar, { name: u.username, size: 32 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-bold", children: u.username }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-purple-300", children: [
              fmt(u.xp),
              " XP"
            ] })
          ] }, u.username)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/leaderboard", className: "mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-white/85 hover:bg-white/[0.06]", children: "View Leaderboard" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "📝", title: "Latest Feed", href: "/feed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mt-3 rounded-xl bg-white/[0.03] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PillAvatar, { name: feedPost.username, size: 36 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-bold", children: feedPost.username }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-white/50", children: feedPost.ago })
            ] }),
            feedPost.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 px-2.5 py-1 text-[10px] font-bold text-white", children: feedPost.badge })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2.5 text-[13px] leading-snug text-white/85", children: feedPost.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-3 flex items-center gap-4 text-[11px] text-white/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5 text-pink-400" }),
              " ",
              feedPost.likes
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
              " ",
              feedPost.comments
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3.5 w-3.5 text-amber-400" }),
              " ",
              feedPost.coins
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl bg-white/[0.03] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] text-white/55", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-lg bg-blue-500/20 text-base", children: "📊" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-white", children: "Community Poll" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/45", children: poll.ago })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2.5 text-[13px] font-semibold text-white/90", children: poll.question }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2.5 space-y-1.5", children: poll.options.map((o, i) => {
            const pct = Math.round(o.votes / pollTotal * 100);
            const active = pollChoice === i;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPollChoice(i), className: `relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-xs transition-colors ${active ? "border-purple-400/60" : "border-white/10 hover:bg-white/[0.04]"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-y-0 left-0 -z-0 rounded-lg", style: {
                width: `${pct}%`,
                background: "linear-gradient(90deg,rgba(139,92,246,0.35),rgba(59,130,246,0.25))"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 font-semibold", children: [
                  active ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-purple-300" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3.5 w-3.5 text-white/40" }),
                  o.label
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-white/85", children: [
                  pct,
                  "%"
                ] })
              ] })
            ] }, i);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2.5 flex items-center justify-between text-[10px] text-white/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              pollTotal,
              " votes · ",
              poll.daysLeft,
              " days left"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-white/15", children: "Vote Now" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl bg-white/[0.03] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-full text-lg", style: {
              background: "linear-gradient(135deg,#ec4899,#8b5cf6)"
            }, children: confession.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-bold", children: confession.alias }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/50", children: confession.ago })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[13px] leading-snug text-white/85", children: confession.text })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "🎮", title: "Popular Games", href: "/games" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: cfg.games.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-lg text-xl", style: {
              background: "linear-gradient(135deg,#ec4899,#8b5cf6)"
            }, children: g.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-bold", children: g.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-white/55", children: g.plays ?? g.reward })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/games", className: "shrink-0 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1.5 text-[11px] font-bold text-purple-200 hover:bg-purple-500/25", children: "Play Now" })
          ] }, g.name)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "🎯", title: "Today's Missions", href: "/achievements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2.5", children: cfg.missions.slice(0, 3).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5", children: [
            m.complete ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-emerald-400 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-5 w-5 text-white/30 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold text-white/90", children: m.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-1.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: {
                width: `${m.progress}%`,
                background: "linear-gradient(90deg,#8b5cf6,#3b82f6)"
              } }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-emerald-300", children: m.progressLabel ?? `${m.progress}%` })
          ] }, m.title)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-6 w-6 text-amber-300 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-[11px] text-white/70", children: "Rewards" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-[11px] font-bold text-purple-200", children: "⚡ +100 XP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-[11px] font-bold text-amber-200", children: "🪙 +50 Coins" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "🔥", title: "Trending Posts", suffix: "(Hot right now)", href: "/feed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: trendingPosts.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-purple-400/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-60", style: {
          background: "radial-gradient(closest-side,#a855f7,transparent)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PillAvatar, { name: p.user, size: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-bold", children: p.user }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-white/50", children: p.ago })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4 text-orange-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "relative mt-2.5 line-clamp-3 text-[13px] leading-snug text-white/85", children: p.text }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "relative mt-3 flex items-center justify-between text-[11px] text-white/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-200", children: p.tag }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5 text-pink-400" }),
              " ",
              p.likes
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
              " ",
              p.comments
            ] })
          ] })
        ] })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MehfilLandingSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "💬", title: "Latest Public Discussions", href: "/" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 divide-y divide-white/[0.05]", children: discussions.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feedback", className: "flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.02] sm:gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-base ring-1 ring-white/10", children: "💬" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-semibold text-white/90", children: d.topic }),
            d.hot && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden shrink-0 rounded-full bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-300 sm:inline-flex", children: "HOT" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 truncate text-[11px] text-white/55", children: [
            "in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-300", children: d.room }),
            " · by ",
            d.author,
            " · last reply ",
            d.last
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden shrink-0 items-center gap-1 text-[11px] text-white/60 sm:flex", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
          " ",
          d.replies
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 shrink-0 text-white/40" })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "⭐", title: "Featured Members", suffix: "(Stars of the week)", href: "/leaderboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: featuredMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative overflow-hidden rounded-xl bg-gradient-to-br ${m.gradient} p-4 ring-1 ring-white/10`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PillAvatar, { name: m.name, size: 64 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "absolute -top-1 -right-1 h-5 w-5 text-amber-300 drop-shadow" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2.5 text-sm font-bold", children: m.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-white/70", children: m.role }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex items-center gap-1 text-base", children: m.badges.split(/\s+/).filter(Boolean).map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-bold text-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }),
            " ",
            m.xp.toLocaleString(),
            " XP"
          ] })
        ] })
      ] }, m.name)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "🤫", title: "Recent Confessions", suffix: "(Anonymous)", href: "/confessions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: recentConfessions.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-br from-pink-500/[0.08] via-purple-500/[0.05] to-transparent p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-3 top-3 text-[10px] font-bold uppercase tracking-wider text-pink-300/70", children: "Anon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-full text-xl ring-1 ring-white/15", style: {
            background: "linear-gradient(135deg,#ec4899,#8b5cf6)"
          }, children: c.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-bold", children: c.alias }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-white/50", children: c.ago })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-[13px] leading-snug text-white/85", children: [
          '"',
          c.text,
          '"'
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[11px] text-white/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5 text-pink-400" }),
            " ",
            c.reacts,
            " reactions"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/confessions", className: "font-bold text-pink-300 hover:text-pink-200", children: "Read →" })
        ] })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "⚡", title: "Latest Community Activity", suffix: "(Live feed)", href: "/feed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-white/[0.02]", children: [{
        who: "Amit",
        action: "joined",
        target: "India Chat",
        ago: "just now",
        emoji: "💬",
        tint: "from-blue-500/30 to-cyan-500/20",
        accent: "text-cyan-200",
        href: "/"
      }, {
        who: "Pooja",
        action: "earned",
        target: "Gold Badge",
        ago: "2m ago",
        emoji: "🏆",
        tint: "from-amber-500/35 to-yellow-500/20",
        accent: "text-amber-200",
        href: "/achievements"
      }, {
        who: "Rahul",
        action: "posted",
        target: "a new discussion",
        ago: "5m ago",
        emoji: "📝",
        tint: "from-purple-500/30 to-pink-500/20",
        accent: "text-pink-200",
        href: "/feed"
      }, {
        who: "Sneha",
        action: "started a DM with",
        target: "Aanya",
        ago: "8m ago",
        emoji: "💌",
        tint: "from-rose-500/30 to-fuchsia-500/20",
        accent: "text-rose-200",
        href: "/feed"
      }, {
        who: "Kabir",
        action: "won",
        target: "a Ludo match",
        ago: "12m ago",
        emoji: "🎲",
        tint: "from-emerald-500/30 to-teal-500/20",
        accent: "text-emerald-200",
        href: "/games"
      }, {
        who: "Meera",
        action: "hit a",
        target: "7-day streak 🔥",
        ago: "18m ago",
        emoji: "🔥",
        tint: "from-orange-500/35 to-red-500/20",
        accent: "text-orange-200",
        href: "/achievements"
      }, {
        who: "Yash",
        action: "created room",
        target: "Late Night Vibes",
        ago: "25m ago",
        emoji: "🌙",
        tint: "from-indigo-500/30 to-violet-500/20",
        accent: "text-indigo-200",
        href: "/"
      }, {
        who: "Riya",
        action: "leveled up to",
        target: "Level 12",
        ago: "32m ago",
        emoji: "⭐",
        tint: "from-yellow-500/30 to-amber-500/20",
        accent: "text-yellow-200",
        href: "/leaderboard"
      }].map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 px-3 py-3 transition-colors hover:bg-white/[0.04] sm:px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${a.tint} text-base ring-1 ring-white/10`, children: a.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 text-sm leading-snug text-white/85", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", children: a.who }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/65", children: a.action }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: a.href, className: `font-semibold ${a.accent} hover:underline`, children: a.target })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-[11px] font-medium text-white/45", children: a.ago })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "📰", title: "Community Blog", suffix: "(Stories & guides)", href: "/blog" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-4 lg:grid-cols-3", children: blogPosts.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] transition-all hover:-translate-y-0.5 hover:border-white/15", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative h-32 bg-gradient-to-br ${b.gradient}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center text-5xl opacity-90", children: b.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur", children: b.tag }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/85 backdrop-blur", children: b.read })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-black leading-snug text-white group-hover:text-purple-200", children: b.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-2 text-[13px] leading-snug text-white/65", children: b.excerpt }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-white/55", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "By ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/80", children: b.author }),
              " · ",
              b.date
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/pages", className: "inline-flex items-center gap-1 font-bold text-purple-300 hover:text-purple-200", children: [
              "Read ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
            ] })
          ] })
        ] })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/pages", className: "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white/85 hover:bg-white/[0.07]", children: [
        "Visit Blog ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[1.6fr_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "relative overflow-hidden p-6 sm:p-8", style: {
        background: "linear-gradient(135deg,rgba(168,85,247,0.35),rgba(236,72,153,0.25) 60%,rgba(59,130,246,0.2))"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-30 blur-3xl", style: {
          background: "radial-gradient(closest-side,#ec4899,transparent)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid items-center gap-5 sm:grid-cols-[1fr_auto]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-black sm:text-3xl", children: cfg.finalCtaTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/80", children: cfg.finalCtaSubtitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setAuthPopup("signup"), className: "mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#1a0b2e] shadow-lg hover:scale-[1.03] transition-transform", children: [
              "Create Free Account ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
            ] })
          ] }),
          cfg.finalCtaImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: cfg.finalCtaImageUrl, alt: cfg.finalCtaImageAlt || "Join the community", loading: "lazy", className: "hidden h-40 w-40 rounded-2xl object-cover ring-1 ring-white/10 shadow-xl sm:block sm:h-44 sm:w-44" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "relative overflow-hidden p-6", style: {
        background: "linear-gradient(135deg,rgba(139,92,246,0.4),rgba(59,130,246,0.3))"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-40 blur-2xl", style: {
          background: "radial-gradient(closest-side,#60a5fa,transparent)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-base font-extrabold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "h-5 w-5 text-pink-300" }),
            " ",
            cfg.referralHeadline
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-white/80", children: cfg.referralDescription }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/find-friends", className: "mt-4 inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-purple-400", children: "Invite Now" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-white/5 bg-[#06060f]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[1.5fr_repeat(4,1fr)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-xl text-base", style: {
              background: "linear-gradient(135deg,#8b5cf6,#3b82f6)"
            }, children: "💬" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-extrabold", children: cfg.copyrightOwner })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-xs text-sm text-white/55", children: cfg.brandTagline })
        ] }),
        cfg.footerColumns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-white", children: col.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-2", children: col.links.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: l.href, className: "text-sm text-white/55 hover:text-white", children: l.label }) }, l.label + l.href)) })
        ] }, col.title)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-white", children: "Follow Us" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex items-center gap-2", children: [{
            Icon: MessageCircle,
            label: "Discord",
            color: "bg-indigo-500/20 text-indigo-300"
          }, {
            Icon: Instagram,
            label: "Instagram",
            color: "bg-pink-500/20 text-pink-300"
          }, {
            Icon: Twitter,
            label: "Twitter",
            color: "bg-sky-500/20 text-sky-300"
          }, {
            Icon: Youtube,
            label: "YouTube",
            color: "bg-red-500/20 text-red-300"
          }].map(({
            Icon,
            label,
            color
          }) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", "aria-label": label, className: `grid h-9 w-9 place-items-center rounded-full ${color} hover:scale-105 transition-transform`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }, label)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 border-t border-white/5 pt-6 text-center text-xs text-white/40", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        cfg.copyrightOwner,
        ". All rights reserved."
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthDialogs, { popup: authPopup, setPopup: setAuthPopup })
  ] });
}
function StatCell({
  icon: Icon,
  label,
  value,
  tint = "#a78bfa",
  pulse = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-cell group relative flex min-w-0 items-center gap-2 p-2.5 transition-colors hover:bg-white/[0.04] sm:gap-3 sm:rounded-2xl sm:p-4 lg:p-5\r\n                 [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:right-0 [&:not(:last-child)]:after:top-1/2\r\n                 [&:not(:last-child)]:after:hidden [&:not(:last-child)]:after:h-8 [&:not(:last-child)]:after:w-px\r\n                 [&:not(:last-child)]:after:-translate-y-1/2 [&:not(:last-child)]:after:bg-white/10 sm:[&:not(:last-child)]:after:h-10 lg:[&:not(:last-child)]:after:block\r\n                 [&:not(:nth-child(2n))]:after:block sm:[&:not(:nth-child(2n))]:after:hidden\r\n                 sm:[&:not(:nth-child(3n))]:after:block", style: {
    ["--stat-tint"]: tint
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-tile grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-white/10 backdrop-blur-md sm:h-11 sm:w-11 sm:rounded-xl", style: {
      background: `linear-gradient(135deg, color-mix(in oklab, ${tint} 28%, transparent), color-mix(in oklab, ${tint} 10%, transparent))`,
      boxShadow: `0 8px 24px -10px ${tint}90, inset 0 1px 0 rgba(255,255,255,0.08)`
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "stat-icon h-4 w-4 sm:h-5 sm:w-5", style: {
      color: tint
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-lg font-black leading-none tracking-tight sm:text-2xl lg:text-[26px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value truncate bg-clip-text text-transparent", style: {
          backgroundImage: `linear-gradient(135deg,#ffffff, color-mix(in oklab, ${tint} 60%, #ffffff))`
        }, children: value }),
        pulse && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative grid h-2 w-2 shrink-0 place-items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/70" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wider text-white/60 sm:mt-1 sm:text-[11px]", children: label })
    ] })
  ] });
}
function SectionTitle({
  icon,
  title,
  suffix,
  href
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-white", children: title }),
      suffix && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-[11px] text-white/50", children: suffix })
    ] }),
    href && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: href, className: "inline-flex items-center gap-0.5 text-[11px] font-bold text-purple-300 hover:text-purple-200", children: [
      "View All ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
    ] })
  ] });
}
function MehfilLandingSection() {
  const settings = useMehfilSettings();
  if (!settings.enabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: "📜", title: `Trending on ${settings.module_name}`, suffix: "(Poetry & battles)", href: "/poetry" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MehfilTrendingWidget, {}) })
  ] }) });
}
export {
  LandingPage as component
};
