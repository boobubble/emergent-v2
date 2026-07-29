import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useMehfilSettings } from "./use-mehfil-label-BWBPC7g6.mjs";
import { R as RouteErrorBoundary, a as useAuth, h as useAuthGate, w as useRemoteProfiles, cJ as useFeedPrefs, u as useAppSettings, b as useServerFn, j as BrandMark, k as BrandText, O as isNavigableSlug, K as BroadcasterTicker, N as postsSafe, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, f as DialogDescription, B as Button, g as useChat, cK as ChatErrorBoundary, l as listCompetitions, cG as getLanguage, bx as LANGUAGES, cH as prefetchLanguage, cL as resolveDmTargetId, cI as setLanguage } from "./router-CYWPFaDK.mjs";
import { u as useThemeMode } from "./use-theme-mode-DLsH6S68.mjs";
import { u as useSavedPosts, P as PostCard, a as Popover, b as PopoverTrigger, c as PopoverContent } from "./PostCard-DLZQjCkW.mjs";
import { u as useMyRoles } from "./use-my-role-Cv7Uou7c.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { p as pingDailyStreak, C as Composer } from "./Composer-B7ERp76N.mjs";
import { A as Avatar } from "./Avatar-CAZashHQ.mjs";
import { l as listConfessions } from "./confessions.functions-BBpBF4R_.mjs";
import { getAssistantFeedRecommendations, triggerWelcomeIfNeeded, triggerMissionDigestIfNeeded, triggerRewardDigestIfNeeded, triggerEventAnnouncementIfNeeded, triggerSecurityDigestIfNeeded, getFriendSuggestions, getBoobubblePublic } from "./boobubble.functions-BRP0x1de.mjs";
import { M as MehfilTrendingWidget } from "./MehfilTrendingWidget-LpbzmQfn.mjs";
import { m as mergeDiscoveryWidgetsConfig } from "./discovery-widgets-config-cgdFDrdx.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { g as getTodayMissions, c as claimMission } from "./missions.functions-CjvjLerV.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { f as feedVariantFor } from "./theme-variants-CF8JUZmB.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as EmojiPicker } from "./EmojiPicker-DcAQqNHO.mjs";
import { X, a3 as Swords, bg as TrendingUp, f as Heart, E as Eye, h as MessageCircle, ay as Newspaper, F as Flame, U as Users, bi as Bookmark, x as Bell, cD as CirclePlus, a as Sparkles, aB as Crown, ap as Globe, g as MessageSquare, a4 as PenLine, az as Film, aZ as FileText, J as UsersRound, m as Award, O as Trophy, i as Radio, a2 as Gift, Y as Coins, a5 as Compass, _ as Clock, c as Plus, cE as CircleUser, B as Bug, s as UserPlus, z as Check, W as Lock, p as Settings, a7 as Sun, a8 as Moon, S as Shield, a0 as LoaderCircle, cF as ArrowDown, l as Star, Z as Zap, d as Trash2, cG as ImagePlus, bu as ChevronLeft, a6 as ChevronRight, ab as ArrowRight, aC as Activity, a$ as ChartColumn, bb as WandSparkles, bd as RefreshCw, aR as SlidersHorizontal, ae as Volume2, ad as VolumeX, cH as VenetianMask, cI as Cake, aN as Menu, N as Search, H as House, ai as Smile, a_ as ScrollText, c9 as MessagesSquare, br as MapPin, I as Image, P as Palette, q as LogOut, Q as Quote, bm as Music, V as Vote } from "../_libs/lucide-react.mjs";
import { u as useTranslation } from "../_libs/react-i18next.mjs";
import { o as objectType, n as numberType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "./mehfil-admin.functions-BntRjkJU.mjs";
import "./mehfil-types-okfUX99d.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "tslib";
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
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-http-backend.mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "./client.server-BXCYxJZY.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
import "./sitemap-Dl8Aqg_O.mjs";
import "./reserved-routes-BWsWje6t.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "./economy-config-CPZpIbo-.mjs";
import "./focus-composer-config-C2kdKn7r.mjs";
import "./cache-manager-cID9K-3q.mjs";
import "./shop-catalog-QoXq-K4P.mjs";
import "./country-flag-Bsg6nfgK.mjs";
function LanguageSwitcher({ variant = "icon", className = "" }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = reactExports.useState(false);
  const current = getLanguage(i18n.language || "en");
  const change = async (code) => {
    await setLanguage(code);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setOpen((v) => !v),
        "aria-label": "Change language",
        className: "inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm hover:bg-accent",
        children: variant === "icon" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: current.flag }),
          variant === "full" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: current.nativeName })
        ] })
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 z-50 mt-2 max-h-80 w-56 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-xl", children: LANGUAGES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => change(l.code),
          onMouseEnter: () => prefetchLanguage(l.code),
          onFocus: () => prefetchLanguage(l.code),
          className: "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: l.flag }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: l.nativeName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(",
                l.name,
                ")"
              ] })
            ] }),
            current.code === l.code && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-primary" })
          ]
        },
        l.code
      )) })
    ] })
  ] });
}
const chatroomIcon = "/assets/chatroom-icon-CUq7micG.jpg";
function PostSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-full skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-1/3 rounded skeleton-shimmer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-1/4 rounded skeleton-shimmer" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-full skeleton-shimmer" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-full rounded skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-11/12 rounded skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-4/5 rounded skeleton-shimmer" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-44 w-full rounded-xl skeleton-shimmer" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-20 rounded-full skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-20 rounded-full skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-16 rounded-full skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto h-7 w-7 rounded-full skeleton-shimmer" })
    ] })
  ] });
}
function StoryCardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 snap-start w-[112px] h-[176px] rounded-[1.25rem] overflow-hidden bg-card border border-border relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 skeleton-shimmer opacity-60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-2 h-8 w-8 rounded-full skeleton-shimmer ring-2 ring-card" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-2 bottom-2 h-3 rounded skeleton-shimmer" })
  ] });
}
function StoryTraySkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-3 sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-hidden", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(StoryCardSkeleton, {}, i)) }) });
}
function WidgetSkeleton({ rows = 3, title = true }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-card p-4", children: [
    title && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary/60" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-24 rounded skeleton-shimmer" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-full skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 flex-1 rounded skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-8 rounded skeleton-shimmer" })
    ] }, i)) })
  ] });
}
function RewardsWidgetSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-card p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-20 rounded skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-14 rounded-full skeleton-shimmer" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-10 rounded skeleton-shimmer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-8 rounded skeleton-shimmer" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 items-end flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-14 rounded skeleton-shimmer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-10 rounded skeleton-shimmer" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-1.5 w-full rounded-full skeleton-shimmer" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-3 gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 rounded-xl skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 rounded-xl skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 rounded-xl skeleton-shimmer" })
    ] })
  ] });
}
const KEY = "palrgo:stories:v1";
const TTL = 24 * 60 * 60 * 1e3;
function normalize(raw) {
  if (!raw || typeof raw !== "object") return null;
  const r = raw;
  const images = Array.isArray(r.images) ? r.images.filter((v) => typeof v === "string") : typeof r.image === "string" ? [r.image] : [];
  if (!images.length) return null;
  const captions = Array.isArray(r.captions) ? r.captions.map((v) => typeof v === "string" ? v : "") : void 0;
  return {
    id: String(r.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    user_id: String(r.user_id ?? ""),
    username: String(r.username ?? ""),
    images,
    captions,
    text: typeof r.text === "string" ? r.text : void 0,
    created_at: typeof r.created_at === "number" ? r.created_at : Date.now()
  };
}
function loadStories() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const all = JSON.parse(raw).map(normalize).filter((s) => !!s);
    const now = Date.now();
    const fresh = all.filter((s) => now - s.created_at < TTL);
    if (fresh.length !== all.length) localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  } catch {
    return [];
  }
}
function saveStories(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
  }
}
function StoryTray() {
  const { user } = useAuth();
  const [stories, setStories] = reactExports.useState([]);
  const [hydrated, setHydrated] = reactExports.useState(false);
  const [uploading, setUploading] = reactExports.useState(false);
  const [viewIndex, setViewIndex] = reactExports.useState(null);
  const [slideIndex, setSlideIndex] = reactExports.useState(0);
  const [composerOpen, setComposerOpen] = reactExports.useState(false);
  const [draftFiles, setDraftFiles] = reactExports.useState([]);
  const [draftCaptions, setDraftCaptions] = reactExports.useState([]);
  const [draftText, setDraftText] = reactExports.useState("");
  const [activeDraft, setActiveDraft] = reactExports.useState(0);
  const fileRef = reactExports.useRef(null);
  const touchStartX = reactExports.useRef(null);
  const touchStartY = reactExports.useRef(null);
  reactExports.useEffect(() => {
    setStories(loadStories());
    setHydrated(true);
  }, []);
  function openComposer() {
    setDraftFiles([]);
    setDraftCaptions([]);
    setDraftText("");
    setActiveDraft(0);
    setComposerOpen(true);
  }
  function onPick(e) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setDraftFiles((prev2) => {
      const next2 = [...prev2, ...files].slice(0, 10);
      setDraftCaptions((prevCaps) => {
        const caps = [...prevCaps];
        while (caps.length < next2.length) caps.push("");
        return caps.slice(0, next2.length);
      });
      setActiveDraft(prev2.length);
      return next2;
    });
  }
  function removeDraft(i) {
    setDraftFiles((prev2) => prev2.filter((_, j) => j !== i));
    setDraftCaptions((prev2) => prev2.filter((_, j) => j !== i));
    setActiveDraft((prev2) => Math.max(0, Math.min(prev2, draftFiles.length - 2)));
  }
  async function publishStory() {
    if (!user) return;
    if (!draftFiles.length && !draftText.trim()) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of draftFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/stories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("feed-media").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      const captions = draftFiles.map((_, i) => (draftCaptions[i] ?? "").trim());
      if (!urls.length) {
        urls.push("");
        captions.push(draftText.trim());
      }
      const story = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        user_id: user.id,
        username: user.username,
        images: urls,
        captions: captions.some((c) => c.length > 0) ? captions : void 0,
        text: draftText.trim() || void 0,
        created_at: Date.now()
      };
      const next2 = [story, ...stories.filter((s) => s.user_id !== user.id)];
      setStories(next2);
      saveStories(next2);
      setComposerOpen(false);
      setDraftFiles([]);
      setDraftCaptions([]);
      setDraftText("");
      setActiveDraft(0);
    } catch (err) {
      console.error("story upload failed", err);
    } finally {
      setUploading(false);
    }
  }
  function buildViewerList() {
    if (!user) return stories;
    const my = stories.find((s) => s.user_id === user.id);
    const others2 = stories.filter((s) => s.user_id !== user.id);
    return my ? [my, ...others2] : others2;
  }
  function openAt(story) {
    const list = buildViewerList();
    const idx = list.findIndex((s) => s.id === story.id);
    setSlideIndex(0);
    setViewIndex(idx >= 0 ? idx : 0);
  }
  function close() {
    setViewIndex(null);
    setSlideIndex(0);
  }
  function next() {
    const list = buildViewerList();
    if (viewIndex == null) return;
    const cur = list[viewIndex];
    if (cur && slideIndex < cur.images.length - 1) {
      setSlideIndex((s) => s + 1);
      return;
    }
    setSlideIndex(0);
    setViewIndex((i) => i == null ? null : Math.min(list.length - 1, i + 1));
  }
  function prev() {
    if (viewIndex == null) return;
    if (slideIndex > 0) {
      setSlideIndex((s) => s - 1);
      return;
    }
    const list = buildViewerList();
    const newIdx = Math.max(0, viewIndex - 1);
    setViewIndex(newIdx);
    setSlideIndex(Math.max(0, list[newIdx].images.length - 1));
  }
  reactExports.useEffect(() => {
    if (viewIndex == null) return;
    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewIndex, slideIndex]);
  function onTouchStart(e) {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }
  function onTouchEnd(e) {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    } else if (dy < -80 && Math.abs(dy) > Math.abs(dx)) {
      close();
    }
  }
  if (!user) return null;
  if (!hydrated) return /* @__PURE__ */ jsxRuntimeExports.jsx(StoryTraySkeleton, {});
  const myStory = stories.find((s) => s.user_id === user.id);
  const others = stories.filter((s) => s.user_id !== user.id);
  const viewerList = buildViewerList();
  const viewing = viewIndex != null ? viewerList[viewIndex] : null;
  const viewingSlide = viewing?.images[slideIndex] ?? "";
  const viewingCaption = viewing ? viewing.captions?.[slideIndex]?.trim() || viewing.text?.trim() || "" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "story-tray", className: "feed-card p-3 sm:p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 overflow-x-auto pb-1 feed-scrollbar-hide snap-x snap-mandatory touch-pan-x", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            "data-story-add": true,
            onClick: () => myStory ? openAt(myStory) : openComposer(),
            className: "relative shrink-0 snap-start w-[112px] h-[176px] rounded-[1.25rem] overflow-hidden bg-gradient-to-b from-primary/20 via-card to-card border border-border group transition hover:-translate-y-1 hover:shadow-[0_16px_30px_-12px_var(--primary-glow)]",
            "aria-label": myStory ? "View your story" : "Add story",
            children: [
              myStory ? myStory.images[0] ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: myStory.images[0], alt: "Your story", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full w-full place-items-center bg-gradient-to-br from-primary/30 to-card p-3 text-center text-[12px] font-semibold text-foreground", children: myStory.text?.slice(0, 60) ?? "Your story" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full w-full place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_8px_22px_-6px_var(--primary-glow)] ring-4 ring-card", children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 py-1.5 text-[11px] font-semibold text-white text-center", children: myStory ? "Your story" : "Add story" }),
              myStory && myStory.images.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white", children: myStory.images.length })
            ]
          }
        ),
        others.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 snap-start story-ring transition hover:-translate-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => openAt(s),
            className: "relative block w-[108px] h-[172px] rounded-[1.1rem] overflow-hidden bg-card",
            "aria-label": `View ${s.username}'s story`,
            children: [
              s.images[0] ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.images[0], alt: s.username, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full w-full place-items-center bg-gradient-to-br from-primary/20 to-card p-3 text-center text-[12px] font-semibold text-foreground", children: s.text?.slice(0, 60) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 py-1.5 text-[11px] font-semibold text-white truncate text-center", children: s.username }),
              s.images.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white", children: s.images.length })
            ]
          }
        ) }, s.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: onPick })
    ] }),
    composerOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 animate-fade-in",
        onClick: () => !uploading && setComposerOpen(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "w-full max-w-md rounded-3xl bg-card border border-border p-5 shadow-2xl animate-scale-in",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "New story" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setComposerOpen(false),
                    disabled: uploading,
                    className: "rounded-full p-1.5 text-muted-foreground hover:bg-accent/30 hover:text-foreground transition disabled:opacity-50",
                    "aria-label": "Close",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
                  }
                )
              ] }),
              draftFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-5 gap-2", children: draftFiles.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setActiveDraft(i),
                  className: `relative aspect-[3/4] overflow-hidden rounded-xl border transition ${activeDraft === i ? "border-primary ring-2 ring-primary/50" : "border-border hover:border-primary/50"}`,
                  "aria-label": `Edit slide ${i + 1}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: URL.createObjectURL(f), alt: "", className: "h-full w-full object-cover" }),
                    draftCaptions[i] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-white truncate", children: draftCaptions[i] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        role: "button",
                        tabIndex: 0,
                        onClick: (e) => {
                          e.stopPropagation();
                          removeDraft(i);
                        },
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            removeDraft(i);
                          }
                        },
                        className: "absolute top-1 right-1 grid h-5 w-5 cursor-pointer place-items-center rounded-full bg-black/70 text-white hover:bg-destructive transition",
                        "aria-label": "Remove slide",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                      }
                    )
                  ]
                },
                i
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => fileRef.current?.click(),
                  disabled: uploading || draftFiles.length >= 10,
                  className: "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-accent/10 px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-accent/20 hover:text-foreground transition disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-4 w-4" }),
                    draftFiles.length ? `Add more (${draftFiles.length}/10)` : "Add photos"
                  ]
                }
              ),
              (() => {
                const MAX = 280;
                const WARN = 240;
                const cur = draftFiles.length ? draftCaptions[activeDraft] ?? "" : draftText;
                const counterTone = cur.length >= MAX ? "text-destructive" : cur.length >= WARN ? "text-amber-400" : "text-muted-foreground";
                return draftFiles.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between text-xs font-semibold", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                      "Caption for slide ",
                      activeDraft + 1,
                      " of ",
                      draftFiles.length
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: counterTone, "aria-live": "polite", children: [
                      cur.length,
                      "/",
                      MAX
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      value: draftCaptions[activeDraft] ?? "",
                      maxLength: MAX,
                      onChange: (e) => {
                        const v = e.target.value.slice(0, MAX);
                        setDraftCaptions((prev2) => {
                          const next2 = [...prev2];
                          while (next2.length < draftFiles.length) next2.push("");
                          next2[activeDraft] = v;
                          return next2;
                        });
                      },
                      placeholder: "Caption for this photo… (optional)",
                      rows: 3,
                      className: "mt-1.5 w-full resize-none rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      value: draftText,
                      maxLength: MAX,
                      onChange: (e) => setDraftText(e.target.value.slice(0, MAX)),
                      placeholder: "Say something… (text-only story)",
                      rows: 3,
                      className: "mt-3 w-full resize-none rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-1 text-right text-[11px] font-semibold ${counterTone}`, "aria-live": "polite", children: [
                    cur.length,
                    "/",
                    MAX
                  ] })
                ] });
              })(),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-end gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setComposerOpen(false),
                    disabled: uploading,
                    className: "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent/20 hover:text-foreground transition disabled:opacity-50",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: publishStory,
                    disabled: uploading || !draftFiles.length && !draftText.trim(),
                    className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-5 py-2 text-sm font-bold text-primary-foreground shadow-[0_6px_18px_-6px_var(--primary-glow)] hover:scale-[1.03] active:scale-95 transition disabled:opacity-50 disabled:hover:scale-100",
                    children: [
                      uploading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                      uploading ? "Posting…" : "Share story"
                    ]
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "fixed inset-0 z-50 grid place-items-center bg-black/95 p-4 animate-fade-in",
        onClick: close,
        onTouchStart,
        onTouchEnd,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 left-3 right-3 flex gap-1", children: viewing.images.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 flex-1 overflow-hidden rounded-full bg-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full ${i < slideIndex ? "w-full bg-white" : i === slideIndex ? "w-full bg-white" : "w-0"}` }) }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                close();
              },
              className: "absolute top-6 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20",
              "aria-label": "Close",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
            }
          ),
          (viewIndex > 0 || slideIndex > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                prev();
              },
              className: "hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20",
              "aria-label": "Previous",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-6 w-6" })
            }
          ),
          (viewIndex < viewerList.length - 1 || slideIndex < viewing.images.length - 1) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                next();
              },
              className: "hidden sm:grid absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20",
              "aria-label": "Next",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-h-[90vh] max-w-md w-full", onClick: (e) => e.stopPropagation(), children: [
            viewingSlide ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: viewingSlide,
                alt: viewing.username,
                className: "w-full max-h-[85vh] object-contain rounded-2xl animate-scale-in",
                draggable: false
              },
              `${viewing.id}-${slideIndex}`
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full aspect-[3/4] max-h-[85vh] grid place-items-center rounded-2xl bg-gradient-to-br from-primary/40 via-fuchsia-500/30 to-amber-400/30 animate-scale-in p-6 sm:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "max-w-full text-center text-xl sm:text-2xl font-bold text-white whitespace-pre-wrap break-words [text-wrap:balance]",
                style: { textShadow: "0 2px 12px rgba(0,0,0,0.55)" },
                children: viewingCaption
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs font-semibold text-white", children: viewing.username }),
            viewingCaption && viewingSlide && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute inset-x-3 rounded-2xl bg-black/70 backdrop-blur-md px-4 py-2.5 text-center text-sm sm:text-base font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/10 max-h-[40vh] overflow-y-auto whitespace-pre-wrap break-words [text-wrap:pretty] [overflow-wrap:anywhere]",
                style: {
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
                  textShadow: "0 1px 6px rgba(0,0,0,0.6)"
                },
                children: viewingCaption
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  prev();
                },
                className: "sm:hidden absolute inset-y-0 left-0 w-1/3",
                "aria-label": "Previous"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  next();
                },
                className: "sm:hidden absolute inset-y-0 right-0 w-1/3",
                "aria-label": "Next"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-0 right-0 text-center text-[11px] text-white/60 sm:hidden", children: "Swipe to navigate · Swipe up to close" })
        ]
      }
    )
  ] });
}
function FriendsWidget({ meId, profiles }) {
  const [friendships, setFriendships] = reactExports.useState([]);
  const [loaded, setLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    async function load() {
      const { data } = await supabase.from("friendships").select("*");
      setFriendships(data ?? []);
      setLoaded(true);
    }
    load();
    const ch = supabase.channel(`fr-${meId}`).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [meId]);
  const pendingIn = friendships.filter((f) => f.receiver_id === meId && f.status === "pending");
  const friendIds = new Set(friendships.filter((f) => f.status === "accepted").map((f) => f.sender_id === meId ? f.receiver_id : f.sender_id));
  const sentIds = new Set(friendships.filter((f) => f.sender_id === meId && f.status === "pending").map((f) => f.receiver_id));
  const friends = Array.from(friendIds).map((id) => profiles[id]).filter(Boolean);
  const suggestions = Object.values(profiles).filter((u) => u.id !== meId && !friendIds.has(u.id) && !sentIds.has(u.id) && !u.isGuest && !u.isBot).slice(0, 5);
  async function accept(f) {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", f.id);
  }
  async function reject(f) {
    await supabase.from("friendships").delete().eq("id", f.id);
  }
  async function sendRequest(toId) {
    await supabase.from("friendships").insert({ sender_id: meId, receiver_id: toId, status: "pending" });
  }
  if (!loaded) return /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetSkeleton, { rows: 4 });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    pendingIn.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumCard, { title: "Friend requests", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5 text-fuchsia-700 dark:text-fuchsia-400" }), accent: "fuchsia", badge: pendingIn.length, children: pendingIn.map((f) => {
      const u = profiles[f.sender_id];
      if (!u) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RingAvatar, { user: u, size: 34, ring: "fuchsia" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$username", params: { username: u.name }, className: "flex-1 truncate text-sm font-semibold hover:underline", children: u.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => accept(f),
            "aria-label": "Accept",
            className: "rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 p-1.5 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] transition hover:scale-105",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => reject(f),
            "aria-label": "Reject",
            className: "rounded-full bg-foreground/[0.06] dark:bg-white/[0.06] p-1.5 text-muted-foreground ring-1 ring-inset ring-border/60 dark:ring-white/10 transition hover:bg-white/[0.1] hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ] }, f.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PremiumCard,
      {
        title: "Friends",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5 text-amber-700 dark:text-amber-300" }),
        accent: "amber",
        badge: friends.length,
        children: friends.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-fuchsia-500/10 p-3 ring-1 ring-inset ring-amber-400/25", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-400/25 blur-2xl", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_6px_18px_-6px_rgba(245,158,11,0.7)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-bold text-foreground", children: "Build your circle" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10.5px] text-muted-foreground", children: "Add friends to unlock chats & gifts." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/find-friends",
              className: "mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-[0_6px_18px_-8px_rgba(245,158,11,0.75)] transition hover:brightness-110 active:scale-95",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
                " Find friends"
              ]
            }
          ),
          suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80", children: [
            suggestions.length,
            " suggestions below ↓"
          ] })
        ] }) : friends.slice(0, 6).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/u/$username",
            params: { username: u.name },
            className: "group flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RingAvatar, { user: u, size: 30, ring: u.status === "online" ? "emerald" : "muted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-sm font-medium", children: u.name }),
              u.status === "online" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" })
                ] }),
                "Live"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-muted-foreground/40" })
            ]
          },
          u.id
        ))
      }
    ),
    suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumCard, { title: "Suggested for you", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-violet-700 dark:text-violet-300" }), accent: "violet", children: suggestions.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RingAvatar, { user: u, size: 30, ring: "violet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$username", params: { username: u.name }, className: "flex-1 truncate text-sm font-semibold hover:underline", children: u.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => sendRequest(u.id),
          "aria-label": `Add ${u.name}`,
          className: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 px-2.5 py-1 text-[11px] font-bold text-violet-700 dark:text-violet-200 ring-1 ring-inset ring-violet-400/30 transition hover:from-violet-500/35 hover:to-fuchsia-500/35 hover:text-white",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3 w-3" }),
            " Add"
          ]
        }
      )
    ] }, u.id)) })
  ] });
}
function HashtagsWidget() {
  const [tags, setTags] = reactExports.useState([]);
  const [loaded, setLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    supabase.from("hashtags").select("tag, usage_count").order("usage_count", { ascending: false }).limit(8).then(({ data }) => {
      setTags(data ?? []);
      setLoaded(true);
    });
  }, []);
  if (!loaded) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumCard, { title: "Trending tags", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5 text-sky-700 dark:text-sky-300" }), accent: "sky", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-6 w-16 rounded-full skeleton-shimmer" }, i)) }) });
  }
  if (!tags.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumCard, { title: "Trending tags", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5 text-sky-700 dark:text-sky-300" }), accent: "sky", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: tags.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition hover:scale-105 ${i === 0 ? "bg-gradient-to-r from-amber-400/25 to-fuchsia-500/25 text-amber-800 dark:text-amber-100 ring-amber-300/40" : "bg-foreground/[0.05] dark:bg-white/[0.05] ring-border/60 dark:ring-white/10"}`,
      children: [
        "#",
        t.tag,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-0.5 text-muted-foreground", children: t.usage_count })
      ]
    },
    t.tag
  )) }) });
}
function RingAvatar({ user, size, ring }) {
  const ringColor = {
    emerald: "from-emerald-400 to-emerald-600",
    fuchsia: "from-fuchsia-400 to-pink-600",
    violet: "from-violet-400 to-indigo-600",
    amber: "from-amber-300 to-orange-500",
    muted: "from-white/10 to-white/5"
  }[ring];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `relative inline-flex shrink-0 rounded-full bg-gradient-to-br ${ringColor} p-[1.5px]`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-background p-[1.5px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user, size }) }) });
}
const accentMap = {
  amber: { dot: "bg-amber-400", icon: "text-amber-600 dark:text-amber-300" },
  fuchsia: { dot: "bg-fuchsia-400", icon: "text-fuchsia-600 dark:text-fuchsia-300" },
  violet: { dot: "bg-violet-400", icon: "text-violet-600 dark:text-violet-300" },
  emerald: { dot: "bg-emerald-400", icon: "text-emerald-600 dark:text-emerald-300" },
  sky: { dot: "bg-sky-400", icon: "text-sky-600 dark:text-sky-300" },
  rose: { dot: "bg-rose-400", icon: "text-rose-500 dark:text-rose-300" }
};
function PremiumCard({
  title,
  icon,
  children,
  accent = "amber",
  badge,
  rightSlot
}) {
  const a = accentMap[accent];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative premium-surface premium-surface-hover p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block h-1.5 w-1.5 rounded-full ${a.dot}`, "aria-hidden": true }),
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: title }),
      typeof badge === "number" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded-full bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-foreground/80 ring-1 ring-inset ring-border", children: badge }),
      rightSlot && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: rightSlot })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5", children })
  ] });
}
function isDemoUser(u) {
  const name = (u.name ?? "").trim().toLowerCase();
  const handle = (u.username ?? "").toString().trim().toLowerCase();
  return name.startsWith("demo") || handle.startsWith("demo");
}
const PROMO_BADGES = ["Verified", "VIP", "Creator", "Top"];
function PromotedPostsWidget({ profiles }) {
  const [following, setFollowing] = reactExports.useState({});
  const promoted = reactExports.useMemo(() => {
    return Object.values(profiles).filter((u) => !u.isBot && !u.isGuest && !isDemoUser(u)).sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)).slice(0, 3);
  }, [profiles]);
  async function follow(targetId) {
    if (following[targetId]) return;
    setFollowing((s) => ({ ...s, [targetId]: true }));
    try {
      const { data: auth } = await supabase.auth.getUser();
      const meId = auth.user?.id;
      if (!meId || meId === targetId) return;
      await supabase.from("friendships").insert({
        sender_id: meId,
        receiver_id: targetId,
        status: "pending"
      });
    } catch {
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    PremiumCard,
    {
      title: "Promoted users",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5 text-amber-600 dark:text-amber-300" }),
      accent: "amber",
      rightSlot: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/30 to-orange-500/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-amber-800 dark:text-amber-100 ring-1 ring-inset ring-amber-400/40 shadow-[0_0_14px_-4px_rgba(245,158,11,0.55)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-2.5 w-2.5" }),
        " Featured"
      ] }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative -mx-1 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-transparent p-2 ring-1 ring-inset ring-amber-400/15", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
        promoted.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-1 py-2 text-xs text-muted-foreground", children: "No featured members yet." }),
        promoted.map((u, idx) => {
          const isFollowing = !!following[u.id];
          const badge = PROMO_BADGES[idx % PROMO_BADGES.length];
          const mutuals = (u.xp ?? 0) % 9 + 1;
          const tagline = u.bio?.trim() || `Level ${u.level ?? 1} · ${(u.xp ?? 0).toLocaleString()} XP`;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "group relative overflow-hidden rounded-2xl bg-background/70 dark:bg-white/[0.035] p-2.5 ring-1 ring-inset ring-border/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:ring-amber-400/45 hover:shadow-[0_14px_30px_-18px_rgba(245,158,11,0.7)] chat-bubble-in",
              style: { animationDelay: `${idx * 70}ms` },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-70",
                    "aria-hidden": true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full p-[2px] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_18px_-4px_rgba(245,158,11,0.6)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-background p-[1.5px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: u, size: 48 }) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background",
                        "aria-hidden": true
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[13px] font-bold text-foreground", children: u.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-md bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-1.5 py-px text-[9px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-100 ring-1 ring-inset ring-amber-400/40", children: badge })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-1 text-[11px] leading-snug text-muted-foreground", children: tagline }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-2 text-[10px] font-medium text-muted-foreground tabular-nums", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-violet-500/12 px-1.5 py-px text-violet-700 dark:text-violet-200 ring-1 ring-inset ring-violet-400/25", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-2.5 w-2.5" }),
                        "Lv ",
                        u.level ?? 1
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "h-2.5 w-2.5" }),
                        mutuals,
                        " mutual"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => follow(u.id),
                      disabled: isFollowing,
                      className: `shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition active:scale-95 ${isFollowing ? "bg-amber-500/15 text-amber-700 dark:text-amber-200 ring-1 ring-inset ring-amber-400/40" : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_6px_18px_-6px_rgba(245,158,11,0.75)] hover:brightness-110"}`,
                      children: isFollowing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                        "Added"
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3 w-3" }),
                        "Follow"
                      ] })
                    }
                  )
                ] })
              ]
            },
            u.id
          );
        })
      ] }) })
    }
  );
}
function FeaturedMembersWidget({
  meId,
  profiles
}) {
  const [following, setFollowing] = reactExports.useState({});
  const featured = reactExports.useMemo(() => {
    return Object.values(profiles).filter((u) => u.id !== meId && !u.isBot && !u.isGuest && !isDemoUser(u)).sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)).slice(0, 4);
  }, [profiles, meId]);
  async function follow(targetId) {
    if (!meId || following[targetId]) return;
    setFollowing((s) => ({ ...s, [targetId]: true }));
    await supabase.from("friendships").insert({
      sender_id: meId,
      receiver_id: targetId,
      status: "pending"
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    PremiumCard,
    {
      title: "Featured members",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-300" }),
      accent: "fuchsia",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1.5 pt-1", children: [
        featured.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-1 py-2 text-xs text-muted-foreground", children: "No members to feature yet." }),
        featured.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2.5 rounded-xl p-1.5 -mx-1 transition hover:bg-foreground/[0.04]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: u, size: 34 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[12px] font-semibold text-foreground", children: u.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 rounded bg-violet-500/15 px-1.5 py-px text-[9px] font-bold uppercase text-violet-700 dark:text-violet-300 ring-1 ring-inset ring-violet-400/25", children: [
                "Lv ",
                u.level ?? 1
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground tabular-nums", children: [
              (u.xp ?? 0).toLocaleString(),
              " XP",
              u.badges?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                " · ",
                u.badges.length,
                " 🏅"
              ] }) : null
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => follow(u.id),
              disabled: !!following[u.id],
              className: "inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-[0_2px_8px_-2px_var(--primary-glow)] transition hover:bg-primary active:scale-95 disabled:opacity-60",
              children: following[u.id] ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                "Sent"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3 w-3" }),
                "Add"
              ] })
            }
          )
        ] }, u.id))
      ] })
    }
  );
}
const SUGGESTED_GROUPS = [
  { id: "g-night", name: "Night Owls", members: 1284, emoji: "🦉", category: "Lifestyle", cover: "radial-gradient(120% 80% at 20% 20%, rgba(139,92,246,0.55), transparent 60%), linear-gradient(135deg, #4c1d95, #1e1b4b)", tint: "from-indigo-500/30 to-violet-600/20" },
  { id: "g-music", name: "Vibe Lounge", members: 982, emoji: "🎧", category: "Music", cover: "radial-gradient(120% 80% at 80% 20%, rgba(244,114,182,0.6), transparent 60%), linear-gradient(135deg, #831843, #4a044e)", tint: "from-fuchsia-500/30 to-pink-600/20" },
  { id: "g-gamers", name: "Pro Gamers Hub", members: 2317, emoji: "🎮", category: "Gaming", cover: "radial-gradient(120% 80% at 30% 80%, rgba(16,185,129,0.55), transparent 60%), linear-gradient(135deg, #064e3b, #022c22)", tint: "from-emerald-500/30 to-teal-600/20" },
  { id: "g-art", name: "Daily Sketch", members: 548, emoji: "🎨", category: "Creative", cover: "radial-gradient(120% 80% at 70% 30%, rgba(251,146,60,0.6), transparent 60%), linear-gradient(135deg, #7c2d12, #431407)", tint: "from-amber-500/30 to-orange-600/20" }
];
function SuggestedGroupsWidget() {
  const [joined, setJoined] = reactExports.useState({});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    PremiumCard,
    {
      title: "Suggested groups",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" }),
      accent: "emerald",
      rightSlot: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30", children: "For you" }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid gap-2.5 pt-1", children: SUGGESTED_GROUPS.map((g, idx) => {
        const isJoined = !!joined[g.id];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "li",
          {
            className: "group relative overflow-hidden rounded-2xl bg-background/70 dark:bg-white/[0.035] ring-1 ring-inset ring-border/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:ring-emerald-400/45 hover:shadow-[0_14px_30px_-18px_rgba(16,185,129,0.7)] chat-bubble-in",
            style: { animationDelay: `${idx * 70}ms` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "relative h-14 w-full",
                  style: { backgroundImage: g.cover },
                  "aria-hidden": true,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 top-2 rounded-full bg-black/40 px-1.5 py-px text-[9px] font-black uppercase tracking-wider text-white/90 ring-1 ring-inset ring-white/20 backdrop-blur-sm", children: g.category }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "absolute -bottom-4 left-3 grid h-10 w-10 place-items-center rounded-xl text-xl ring-2 ring-background shadow-[0_6px_18px_-6px_rgba(0,0,0,0.5)]",
                        style: { backgroundImage: g.cover },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]", children: g.emoji })
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-2 px-3 pb-2.5 pt-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[13px] font-bold text-foreground", children: g.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "h-2.5 w-2.5" }),
                    g.members.toLocaleString(),
                    " members"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setJoined((s) => ({ ...s, [g.id]: !s[g.id] })),
                    className: `shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition active:scale-95 ${isJoined ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-inset ring-emerald-400/40" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_6px_18px_-6px_rgba(16,185,129,0.75)] hover:brightness-110"}`,
                    children: isJoined ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                      "Joined"
                    ] }) : "Join"
                  }
                )
              ] })
            ]
          },
          g.id
        );
      }) })
    }
  );
}
const TRENDING_COMMUNITIES = [
  { id: "c-startup", name: "Indie Builders", growth: "+24%", members: 4310, emoji: "🚀" },
  { id: "c-fit", name: "Morning Run Club", growth: "+18%", members: 1972, emoji: "🏃" },
  { id: "c-foodies", name: "Street Foodies", growth: "+12%", members: 3614, emoji: "🍜" }
];
function TrendingCommunitiesWidget() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    PremiumCard,
    {
      title: "Trending communities",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5 text-rose-500 dark:text-rose-300" }),
      accent: "rose",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 pt-1", children: TRENDING_COMMUNITIES.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2.5 rounded-xl p-1.5 -mx-1 transition hover:bg-foreground/[0.04]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-6 w-6 shrink-0 place-items-center rounded-md bg-foreground/[0.06] text-[10px] font-black tabular-nums text-foreground/70 ring-1 ring-inset ring-border", children: i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: c.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[12px] font-semibold text-foreground", children: c.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground tabular-nums", children: [
            c.members.toLocaleString(),
            " members"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-rose-600 dark:text-rose-300 ring-1 ring-inset ring-rose-400/30", children: c.growth })
      ] }, c.id)) })
    }
  );
}
const TINT_STYLES = {
  violet: {
    chip: "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/15 text-violet-700 dark:text-violet-200 ring-violet-400/30",
    ring: "ring-violet-400/50",
    glow: "shadow-[0_0_18px_-6px_rgba(139,92,246,0.55)]",
    iconWrap: "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
  },
  amber: {
    chip: "bg-gradient-to-r from-amber-500/20 to-orange-500/15 text-amber-700 dark:text-amber-200 ring-amber-400/30",
    ring: "ring-amber-400/50",
    glow: "shadow-[0_0_18px_-6px_rgba(245,158,11,0.55)]",
    iconWrap: "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
  },
  emerald: {
    chip: "bg-gradient-to-r from-emerald-500/20 to-teal-500/15 text-emerald-700 dark:text-emerald-200 ring-emerald-400/30",
    ring: "ring-emerald-400/50",
    glow: "shadow-[0_0_18px_-6px_rgba(16,185,129,0.55)]",
    iconWrap: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
  },
  rose: {
    chip: "bg-gradient-to-r from-rose-500/20 to-pink-500/15 text-rose-600 dark:text-rose-200 ring-rose-400/30",
    ring: "ring-rose-400/50",
    glow: "shadow-[0_0_18px_-6px_rgba(244,63,94,0.55)]",
    iconWrap: "bg-gradient-to-br from-rose-500 to-pink-500 text-white"
  }
};
function CommunityActivityWidget({
  meId,
  profiles
}) {
  const pool = reactExports.useMemo(() => {
    const users = Object.values(profiles).filter((u) => u.id !== meId && !u.isBot && !isDemoUser(u)).slice(0, 16);
    if (users.length === 0) return [];
    const verbs = [
      { verb: "reached", target: "a new level", tint: "violet", Icon: Sparkles },
      { verb: "earned", target: "a new badge", tint: "amber", Icon: Award },
      { verb: "joined", target: "a group", tint: "emerald", Icon: UsersRound },
      { verb: "created", target: "a trending post", tint: "rose", Icon: TrendingUp },
      { verb: "reacted to", target: "a hot post", tint: "rose", Icon: Flame },
      { verb: "starred", target: "a creator", tint: "amber", Icon: Star }
    ];
    return users.map((u, i) => ({
      id: u.id + ":" + i,
      user: u,
      ...verbs[i % verbs.length],
      time: "now"
    }));
  }, [profiles, meId]);
  const [head, setHead] = reactExports.useState(0);
  const [tick, setTick] = reactExports.useState(0);
  const containerRef = reactExports.useRef(null);
  const [inView, setInView] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  reactExports.useEffect(() => {
    if (pool.length <= 4 || !inView) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setHead((h) => (h + 1) % pool.length);
      setTick((t) => t + 1);
    }, 9e3);
    return () => window.clearInterval(id);
  }, [pool.length, inView]);
  const items = reactExports.useMemo(() => {
    if (pool.length === 0) return [];
    const out = [];
    const labels = ["just now", "2m", "8m", "15m"];
    for (let i = 0; i < Math.min(4, pool.length); i++) {
      const src = pool[(head + i) % pool.length];
      out.push({ ...src, id: `${src.id}:${tick}:${i}`, time: labels[i] ?? "now" });
    }
    return out;
  }, [pool, head, tick]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    PremiumCard,
    {
      title: "Community activity",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3.5 w-3.5 text-sky-600 dark:text-sky-300" }),
      accent: "sky",
      rightSlot: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 ${inView ? "animate-ping" : ""}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" })
        ] }),
        inView ? "Live" : "Paused"
      ] }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1.5 pt-1", children: [
          items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-1 py-2 text-xs text-muted-foreground", children: "Quiet for now — check back soon." }),
          items.map((it, idx) => {
            const t = TINT_STYLES[it.tint];
            const isFresh = idx === 0 && tick > 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "li",
              {
                className: `group relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-transparent p-1.5 -mx-1 transition-all duration-300 hover:-translate-y-px hover:border-foreground/10 hover:bg-gradient-to-r hover:from-foreground/[0.06] hover:to-foreground/[0.02] hover:shadow-sm ${idx === 0 ? "activity-slide-in" : "chat-bubble-in"} ${isFresh ? "activity-unread" : ""} ${idx % 2 === 1 ? "bg-foreground/[0.025] dark:bg-white/[0.02]" : ""}`,
                style: { animationDelay: idx === 0 ? "0ms" : `${idx * 60}ms` },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "pointer-events-none absolute inset-y-1 left-0 w-[3px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                      style: { background: "linear-gradient(180deg, var(--primary), color-mix(in oklab, var(--primary) 40%, transparent))" },
                      "aria-hidden": true
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-full p-[1.5px] bg-gradient-to-br ring-1 ${t.ring} transition-transform duration-300 group-hover:scale-105 ${t.glow}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: it.user, size: 32 }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full ring-2 ring-background ${t.iconWrap}`,
                        "aria-hidden": true,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(it.Icon, { className: "h-2.5 w-2.5" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 text-[12px] leading-snug", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: it.user.name }),
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: it.verb })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-0.5 inline-block rounded-md px-1.5 py-px text-[10px] font-semibold ring-1 ring-inset ${t.chip}`, children: it.target })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground/80", children: it.time })
                ]
              },
              it.id + it.verb
            );
          })
        ] }),
        items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/feed",
            className: "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500/15 via-violet-500/15 to-fuchsia-500/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-foreground/80 ring-1 ring-inset ring-border/60 transition hover:text-foreground hover:ring-sky-400/40 hover:shadow-[0_8px_22px_-14px_rgba(56,189,248,0.65)]",
            children: [
              "View all activity ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
            ]
          }
        )
      ]
    }
  ) });
}
function PullToRefresh({
  onRefresh,
  children,
  threshold = 70,
  max = 120,
  className = ""
}) {
  const startY = reactExports.useRef(null);
  const [pull, setPull] = reactExports.useState(0);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  const onTouchStart = (e) => {
    if (refreshing) return;
    if (window.scrollY > 0) {
      startY.current = null;
      return;
    }
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    if (startY.current == null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) {
      setPull(0);
      return;
    }
    const eased = Math.min(max, dy * 0.55);
    setPull(eased);
  };
  const onTouchEnd = async () => {
    if (startY.current == null) return;
    startY.current = null;
    if (pull >= threshold && !refreshing) {
      setRefreshing(true);
      setPull(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };
  const progress = Math.min(1, pull / threshold);
  const ready = progress >= 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: onTouchEnd,
      className: `relative ${className}`,
      style: { touchAction: pull > 0 ? "none" : "pan-y" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "aria-hidden": !pull && !refreshing,
            className: "pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center",
            style: {
              height: `${pull}px`,
              opacity: pull > 6 || refreshing ? 1 : 0,
              transition: startY.current == null ? "height 220ms cubic-bezier(.2,.8,.2,1), opacity 180ms" : "none"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "mt-2 flex h-9 w-9 items-center justify-center rounded-full feed-glass ring-1 ring-border shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]",
                style: {
                  transform: `scale(${0.6 + 0.4 * progress})`,
                  transition: startY.current == null ? "transform 200ms" : "none"
                },
                children: refreshing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ArrowDown,
                  {
                    className: `h-4 w-4 transition-transform ${ready ? "rotate-180 text-primary" : "text-muted-foreground"}`,
                    style: { transform: ready ? "rotate(180deg)" : `rotate(${progress * 180}deg)` }
                  }
                )
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              transform: `translateY(${pull}px)`,
              transition: startY.current == null ? "transform 220ms cubic-bezier(.2,.8,.2,1)" : "none"
            },
            children
          }
        )
      ]
    }
  );
}
function ConfessionsFeedWidget() {
  const fetchList = useServerFn(listConfessions);
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let mounted = true;
    fetchList({ data: { sort: "recent", limit: 5 } }).then((rows) => {
      if (!mounted) return;
      setItems(rows ?? []);
    }).catch(() => {
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [fetchList]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 via-card to-card p-3 shadow-[0_8px_24px_-16px_oklch(0_0_0/0.4)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-fuchsia-500/20 blur-2xl", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-lg bg-fuchsia-500/20 text-fuchsia-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VenetianMask, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-fuchsia-400", children: "Anonymous Confessions" })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 py-3 text-xs text-muted-foreground", children: "Loading…" }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 py-2 text-xs text-muted-foreground", children: "No confessions yet — be the first." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: items.slice(0, 4).map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/confessions",
        className: "group block rounded-xl border border-border/60 bg-background/60 px-2.5 py-2 transition hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: it.avatar_emoji ?? "🕶️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: it.alias ?? "Anonymous" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-fuchsia-400/80", children: it.category })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-2 text-xs text-foreground/90 group-hover:text-foreground", children: it.text || "(no text)" })
        ]
      },
      it.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/confessions",
        className: "mt-2 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-[0_6px_18px_-8px_rgb(217_70_239/0.7)] hover:scale-[1.02] active:scale-95 transition",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
          " Open Confessions ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
        ]
      }
    )
  ] });
}
function ActivePollsWidget() {
  const [poll, setPoll] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await postsSafe().select("id, slug, poll, reaction_count, created_at").eq("kind", "poll").eq("privacy", "public").order("created_at", { ascending: false }).limit(20);
      if (!mounted) return;
      const rows = (data ?? []).filter((r) => r.poll?.question && Array.isArray(r.poll?.options));
      rows.sort((a, b) => (b.reaction_count ?? 0) - (a.reaction_count ?? 0));
      const top = rows[0];
      if (top) {
        const votes = top.poll.votes ?? {};
        const total = Object.values(votes).reduce((s, n) => s + (Number(n) || 0), 0);
        setPoll({
          id: top.id,
          slug: top.slug ?? top.id,
          question: top.poll.question,
          options: top.poll.options.slice(0, 3),
          votes,
          total
        });
      }
      setLoading(false);
    })().catch(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);
  const ranked = reactExports.useMemo(() => {
    if (!poll) return [];
    return poll.options.map((label, idx) => {
      const count = Number(poll.votes?.[String(idx)] ?? poll.votes?.[label] ?? 0);
      const pct = poll.total > 0 ? Math.round(count / poll.total * 100) : 0;
      return { label, count, pct };
    });
  }, [poll]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-3 shadow-[0_8px_24px_-16px_oklch(0_0_0/0.4)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/25 blur-2xl", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-inset ring-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-black uppercase tracking-wider text-primary", children: "Live Poll" }),
      poll && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-2.5 w-2.5" }),
        " ",
        poll.total,
        " votes"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 pt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-2/3 rounded skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 rounded-lg skeleton-shimmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 rounded-lg skeleton-shimmer" })
    ] }) : !poll || !isNavigableSlug(poll.slug) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 py-1 text-xs text-muted-foreground", children: "No active polls — create one with the composer." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/feed/$slug",
        params: { slug: poll.slug },
        className: "block rounded-xl ring-1 ring-inset ring-border/60 bg-background/60 dark:bg-white/[0.03] p-2.5 transition hover:ring-primary/40 hover:shadow-[0_8px_24px_-14px_var(--primary-glow)]",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-[12px] font-semibold text-foreground/95", children: poll.question }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1.5", children: ranked.map((opt, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-md bg-foreground/[0.06] dark:bg-white/[0.04] ring-1 ring-inset ring-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute inset-y-0 left-0 bg-gradient-to-r from-primary/35 to-primary/15",
                style: { width: `${opt.pct}%` },
                "aria-hidden": true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between px-2 py-1 text-[11px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium text-foreground/90", children: opt.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 shrink-0 font-black tabular-nums text-foreground/80", children: [
                opt.pct,
                "%"
              ] })
            ] })
          ] }, i)) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/feed",
        className: "mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-primary to-primary/70 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_6px_18px_-8px_var(--primary-glow)] hover:brightness-110 active:scale-95 transition",
        children: [
          poll ? "Vote now" : "Browse polls",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
        ]
      }
    )
  ] });
}
const DISMISS_KEY = "boobubble:feed-rec:dismissed-at";
const CATEGORY_META = {
  post: {
    label: "Post",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Newspaper, { className: "h-3 w-3" }),
    tone: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
    bg: "bg-violet-500/10",
    text: "text-violet-300",
    ring: "ring-violet-500/20"
  },
  poll: {
    label: "Poll",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-3 w-3" }),
    tone: "from-amber-500/20 via-orange-500/10 to-transparent",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    ring: "ring-amber-500/20"
  },
  confession: {
    label: "Confession",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VenetianMask, { className: "h-3 w-3" }),
    tone: "from-emerald-500/20 via-teal-500/10 to-transparent",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    ring: "ring-emerald-500/20"
  }
};
function BoobubbleAssistantWidget() {
  const { user } = useAuth();
  const fetchRecs = useServerFn(getAssistantFeedRecommendations);
  const triggerWelcome = useServerFn(triggerWelcomeIfNeeded);
  const triggerMissions = useServerFn(triggerMissionDigestIfNeeded);
  const triggerRewards = useServerFn(triggerRewardDigestIfNeeded);
  const triggerEvent = useServerFn(triggerEventAnnouncementIfNeeded);
  const triggerSecurity = useServerFn(triggerSecurityDigestIfNeeded);
  const fetchFriends = useServerFn(getFriendSuggestions);
  const fetchPublic = useServerFn(getBoobubblePublic);
  const fetchComps = useServerFn(listCompetitions);
  const [items, setItems] = reactExports.useState([]);
  const [friends, setFriends] = reactExports.useState([]);
  const [enabled, setEnabled] = reactExports.useState(true);
  const [loading, setLoading] = reactExports.useState(true);
  const [dismissed, setDismissed] = reactExports.useState(false);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  const [refreshTick, setRefreshTick] = reactExports.useState(0);
  const [botAvatar, setBotAvatar] = reactExports.useState(null);
  const [botUsername, setBotUsername] = reactExports.useState(null);
  const [liveComps, setLiveComps] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!user?.id || user.isGuest) return;
    triggerWelcome({}).catch(() => {
    });
    triggerMissions({}).catch(() => {
    });
    triggerRewards({}).catch(() => {
    });
    triggerEvent({}).catch(() => {
    });
    triggerSecurity({}).catch(() => {
    });
  }, [user?.id, user?.isGuest, triggerWelcome, triggerMissions, triggerRewards, triggerEvent, triggerSecurity]);
  reactExports.useEffect(() => {
    try {
      const ts = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (ts && Date.now() - ts < 24 * 60 * 60 * 1e3) setDismissed(true);
    } catch {
    }
  }, []);
  const load = reactExports.useCallback(() => {
    if (!user?.id || user.isGuest || dismissed) {
      setLoading(false);
      return;
    }
    let alive = true;
    Promise.all([
      fetchPublic({}),
      fetchRecs({}),
      fetchFriends({}),
      fetchComps({}).catch(() => [])
    ]).then(([pub, recs, fr, comps]) => {
      if (!alive) return;
      setEnabled(Boolean(pub?.enabled && pub?.feed_recs_enabled));
      setBotAvatar(pub?.bot_avatar_url ?? null);
      setBotUsername(pub?.bot_username ?? null);
      setItems(recs.items ?? []);
      setFriends(fr.items ?? []);
      const now = Date.now();
      const live = (Array.isArray(comps) ? comps : []).filter((c) => c.status === "live" && (!c.end_at || new Date(c.end_at).getTime() > now)).slice(0, 3);
      setLiveComps(live);
      setRefreshTick((t) => t + 1);
    }).catch(() => {
      if (alive) {
        setItems([]);
        setFriends([]);
        setLiveComps([]);
      }
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [user?.id, user?.isGuest, dismissed, fetchPublic, fetchRecs, fetchFriends, fetchComps]);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  const refresh = reactExports.useCallback(() => {
    setRefreshing(true);
    load();
    setTimeout(() => setRefreshing(false), 800);
  }, [load]);
  const containerRef = reactExports.useRef(null);
  const [inView, setInView] = reactExports.useState(false);
  const [tabVisible, setTabVisible] = reactExports.useState(
    typeof document !== "undefined" ? !document.hidden : true
  );
  const REFRESH_MS = 6e4;
  reactExports.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [dismissed, enabled, loading]);
  reactExports.useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  reactExports.useEffect(() => {
    if (!inView || !tabVisible || dismissed || !enabled) return;
    if (!user?.id || user.isGuest) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setRefreshing(true);
      load();
      window.setTimeout(() => setRefreshing(false), 800);
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [inView, tabVisible, dismissed, enabled, user?.id, user?.isGuest, load]);
  if (!user?.id || user.isGuest || dismissed || !enabled) return null;
  if (loading && items.length === 0 && friends.length === 0 && liveComps.length === 0) return null;
  if (items.length === 0 && friends.length === 0 && liveComps.length === 0) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
    }
    setDismissed(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "ai-border-glow relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950 via-purple-950 to-slate-950 p-[1px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-violet-500/25 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-950/80 via-violet-950/70 to-slate-950/80 p-4 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-orb-breathe relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-400 via-fuchsia-400 to-purple-500 shadow-lg shadow-fuchsia-500/30", children: [
            botAvatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: botAvatar,
                alt: botUsername ? `@${botUsername}` : "Boobubble assistant",
                loading: "lazy",
                className: "h-full w-full object-cover"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-4.5 w-4.5 text-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 ${inView && tabVisible ? refreshing ? "bg-fuchsia-400 animate-ping" : "bg-emerald-400 animate-pulse" : "bg-white/30"}`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-extrabold tracking-tight text-white", children: botUsername ? `${botUsername}'s Picks` : "AI Picks For You" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-violet-300/80", children: inView && tabVisible ? refreshing ? "Refreshing…" : "Live · auto-refresh" : "Paused" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: refresh,
              title: "Refresh picks",
              "aria-label": "Refresh picks",
              className: "grid h-7 w-7 place-items-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}` })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: dismiss,
              className: "grid h-7 w-7 place-items-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white",
              "aria-label": "Dismiss recommendations",
              title: "Hide for today",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-[11px] text-white/50", children: "Real picks from the community — refreshed for you." }),
      liveComps.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1.5 text-[11px] font-semibold text-white/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3 text-amber-400" }),
          " Running competitions",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-300 ring-1 ring-rose-500/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" }),
            " Live"
          ] })
        ] }),
        liveComps.filter((c) => isNavigableSlug(c.slug)).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/competitions/$slug",
            params: { slug: c.slug },
            className: "group flex items-center gap-3 overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent p-2.5 transition hover:-translate-y-0.5 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/10",
            children: [
              c.banner_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: c.banner_url,
                  alt: "",
                  loading: "lazy",
                  className: "h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-amber-400/20"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/30 to-rose-500/20 ring-1 ring-amber-400/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-amber-300" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[12px] font-semibold text-white/90 group-hover:text-white transition", children: c.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-amber-200/70", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TimeLeft, { endAt: c.end_at ?? null })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5 shrink-0 text-white/20 opacity-0 transition group-hover:translate-x-0.5 group-hover:text-white/60 group-hover:opacity-100" })
            ]
          },
          c.id
        ))
      ] }),
      items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.slice(0, 5).map((it, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(RecCard, { item: it, index: idx }, `${refreshTick}:${it.kind}:${it.id}`)) }),
      friends.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 border-t border-white/10 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-white/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 text-violet-400" }),
          " People you may know"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 scrollbar-hide", children: friends.slice(0, 4).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/u/$username",
            params: { username: f.username },
            className: "group flex min-w-[140px] flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:-translate-y-0.5 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-violet-500/10",
            children: [
              f.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: f.avatar_url,
                  alt: "",
                  loading: "lazy",
                  className: "h-10 w-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-violet-400/40 transition"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-bold text-white", children: f.username.slice(0, 1).toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "max-w-[100px] truncate text-[11px] font-semibold text-white/90", children: [
                "@",
                f.username
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-white/40", children: [
                f.mutual_count,
                " mutual"
              ] })
            ]
          },
          f.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between border-t border-white/10 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/feed",
            className: "inline-flex items-center gap-1 text-[11px] font-medium text-white/50 transition hover:text-violet-300",
            children: [
              "See more picks ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/account",
            className: "inline-flex items-center gap-1 text-[11px] font-medium text-white/50 transition hover:text-violet-300",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-3 w-3" }),
              " Personalize feed"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function RecCard({ item, index }) {
  const meta = CATEGORY_META[item.kind];
  const href = item.kind === "confession" ? "/confessions" : item.slug ? `/feed/${item.slug}` : `/feed`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: href,
      className: "chat-bubble-in group flex items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent p-2.5 transition hover:-translate-y-0.5 hover:border-white/10 hover:shadow-lg hover:shadow-violet-500/10 hover:bg-white/[0.05]",
      style: { animationDelay: `${index * 70}ms` },
      children: [
        item.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: item.thumbnail_url,
              alt: "",
              loading: "lazy",
              className: "h-12 w-12 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-violet-400/30 transition"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-slate-950 ring-1 ring-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] leading-none", children: meta.icon }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${meta.tone} ring-1 ${meta.ring}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: meta.text, children: meta.icon }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.text}`, children: [
              meta.icon,
              meta.label
            ] }),
            item.reaction_count !== null && item.reaction_count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-[10px] text-white/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-2.5 w-2.5 text-rose-400/70" }),
              " ",
              item.reaction_count
            ] }),
            item.score > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-[10px] text-white/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-2.5 w-2.5 text-amber-400/70" }),
              " ",
              Math.round(item.score)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[12px] font-semibold text-white/90 group-hover:text-white transition", children: item.title || "View" }),
          item.author_username && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate text-[10px] text-white/40", children: [
            "@",
            item.author_username
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5 shrink-0 text-white/20 opacity-0 transition group-hover:translate-x-0.5 group-hover:text-white/60 group-hover:opacity-100" })
      ]
    }
  );
}
function TimeLeft({ endAt }) {
  const [now, setNow] = reactExports.useState(() => Date.now());
  reactExports.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 6e4);
    return () => window.clearInterval(id);
  }, []);
  if (!endAt) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Ongoing" });
  const ms = new Date(endAt).getTime() - now;
  if (ms <= 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Ending soon" });
  const mins = Math.floor(ms / 6e4);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days >= 1) return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    days,
    "d ",
    hrs % 24,
    "h left"
  ] });
  if (hrs >= 1) return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    hrs,
    "h ",
    mins % 60,
    "m left"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    Math.max(1, mins),
    "m left"
  ] });
}
const POOL = [
  { id: "post", title: "Create a post", emoji: "✍️", goal: 1, xp: 30, reward: "+30 XP" },
  { id: "react5", title: "React to 5 posts", emoji: "❤️", goal: 5, xp: 20, reward: "+20 XP" },
  { id: "comment3", title: "Comment on 3 posts", emoji: "💬", goal: 3, xp: 25, reward: "+25 XP" },
  { id: "friend", title: "Add a friend", emoji: "🤝", goal: 1, xp: 35, reward: "+35 XP · badge" },
  {
    id: "login",
    title: "Keep your login streak",
    emoji: "🔥",
    goal: 1,
    xp: 15,
    reward: "+15 XP · streak shield"
  }
];
function todayKey() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayIndex() {
  const d = /* @__PURE__ */ new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = (d.getTime() - start.getTime()) / 864e5;
  return Math.floor(diff);
}
function pickDailyChallenges() {
  const idx = dayIndex();
  const rotating = POOL.filter((c) => c.id !== "login");
  const out = [];
  for (let i = 0; i < 3; i++) out.push(rotating[(idx + i) % rotating.length]);
  out.push(POOL.find((c) => c.id === "login"));
  return out;
}
function emptyProgress() {
  return { date: todayKey(), values: {}, claimed: {} };
}
function normalizeProgress(value) {
  if (!value || value.date !== todayKey()) return emptyProgress();
  const values = value.values && typeof value.values === "object" ? value.values : {};
  const claimed = value.claimed && typeof value.claimed === "object" ? value.claimed : {};
  return { date: todayKey(), values, claimed };
}
function readProgress(meId) {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(`dc:${meId}`);
    if (!raw) return emptyProgress();
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}
function writeProgress(meId, p) {
  try {
    localStorage.setItem(`dc:${meId}`, JSON.stringify(p));
  } catch {
  }
}
function scaleChallenges(base, level) {
  const tier = Math.max(1, Math.floor((Math.min(level, 999) - 1) / 5) + 1);
  return base.map((c) => {
    const goal = c.id === "login" ? 1 : Math.ceil(c.goal * (1 + (tier - 1) * 0.5));
    const xp = Math.round(c.xp * (1 + (tier - 1) * 0.35));
    const reward = c.reward.replace(/\+\d+\s*XP/, `+${xp} XP`);
    return { ...c, goal, xp, reward };
  });
}
function DailyChallengesWidget({ meId }) {
  const instanceId = reactExports.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [level, setLevel] = reactExports.useState(1);
  const challenges = reactExports.useMemo(() => scaleChallenges(pickDailyChallenges(), level), [level]);
  const [progress, setProgress] = reactExports.useState(() => readProgress(meId));
  const [celebrate, setCelebrate] = reactExports.useState(null);
  const [resetIn, setResetIn] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!meId) return;
    let cancelled = false;
    supabase.from("profiles").select("level").eq("id", meId).maybeSingle().then(({ data }) => {
      if (!cancelled && data?.level) setLevel(data.level);
    });
    const ch = supabase.channel(`dc-lvl-${meId}-${instanceId}`).on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${meId}` },
      (payload) => {
        const lv = payload.new?.level;
        if (typeof lv === "number") setLevel(lv);
      }
    ).subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [meId, instanceId]);
  reactExports.useEffect(() => {
    function tick() {
      const now = /* @__PURE__ */ new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const ms = end.getTime() - now.getTime();
      const h = Math.floor(ms / 36e5);
      const m = Math.floor(ms % 36e5 / 6e4);
      setResetIn(`${h}h ${m}m`);
    }
    tick();
    const i = setInterval(tick, 6e4);
    return () => clearInterval(i);
  }, []);
  reactExports.useEffect(() => {
    if (!meId) return;
    let cancelled = false;
    async function load() {
      const start = /* @__PURE__ */ new Date();
      start.setHours(0, 0, 0, 0);
      const iso = start.toISOString();
      const [posts, reacts, comments, friends] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", meId).gte("created_at", iso),
        supabase.from("reactions").select("id", { count: "exact", head: true }).eq("user_id", meId).gte("created_at", iso),
        supabase.from("comments").select("id", { count: "exact", head: true }).eq("author_id", meId).gte("created_at", iso),
        supabase.from("friendships").select("id", { count: "exact", head: true }).eq("status", "accepted").or(`sender_id.eq.${meId},receiver_id.eq.${meId}`).gte("created_at", iso)
      ]);
      if (cancelled) return;
      setProgress((prev) => {
        const next = { ...prev, date: todayKey(), values: { ...prev.values } };
        next.values.post = posts.count ?? 0;
        next.values.react5 = reacts.count ?? 0;
        next.values.comment3 = comments.count ?? 0;
        next.values.friend = friends.count ?? 0;
        next.values.login = 1;
        writeProgress(meId, next);
        return next;
      });
    }
    load();
    const ch = supabase.channel(`dc-${meId}-${instanceId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts", filter: `author_id=eq.${meId}` },
      load
    ).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reactions", filter: `user_id=eq.${meId}` },
      load
    ).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments", filter: `author_id=eq.${meId}` },
      load
    ).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, load).subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [meId, instanceId]);
  reactExports.useEffect(() => {
    for (const c of challenges) {
      const v = progress.values[c.id] ?? 0;
      if (v >= c.goal && !progress.claimed[c.id]) {
        setCelebrate(c.id);
        const next = { ...progress, claimed: { ...progress.claimed, [c.id]: true } };
        writeProgress(meId, next);
        setProgress(next);
        setTimeout(() => setCelebrate((s) => s === c.id ? null : s), 1800);
        break;
      }
    }
  }, [progress.values, challenges, meId]);
  const completed = challenges.filter((c) => (progress.values[c.id] ?? 0) >= c.goal).length;
  const totalXp = challenges.filter((c) => (progress.values[c.id] ?? 0) >= c.goal).reduce((s, c) => s + c.xp, 0);
  const overallPct = Math.round(completed / challenges.length * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-950 via-rose-950 to-slate-950 p-[1px] shadow-[0_20px_60px_-15px_rgba(244,114,182,0.45)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-400/25 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-rose-500/25 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-950/90 via-rose-950/70 to-slate-950/90 p-4 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-500 shadow-lg shadow-rose-500/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-slate-950 animate-pulse" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-1.5 text-sm font-extrabold tracking-tight text-white", children: [
              "Daily Challenges",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-gradient-to-r from-amber-400/30 to-rose-400/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 ring-1 ring-amber-300/30", children: [
                "Lv ",
                level
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-medium uppercase tracking-wider text-rose-300/80", children: [
              "Resets in ",
              resetIn
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-400/20 px-2.5 py-1 text-[11px] font-extrabold text-amber-200 ring-1 ring-amber-400/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3" }),
          " ",
          totalXp
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between text-[11px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-white/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-extrabold text-white", children: completed }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/60", children: [
              " / ",
              challenges.length,
              " complete"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 font-bold text-amber-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
            " ",
            overallPct,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500 shadow-[0_0_10px_rgba(244,114,182,0.6)] transition-all duration-700",
            style: { width: `${overallPct}%` }
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-2", children: challenges.map((c) => {
        const v = Math.min(progress.values[c.id] ?? 0, c.goal);
        const isDone = v >= c.goal;
        const pct = Math.round(v / c.goal * 100);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "li",
          {
            className: `group relative overflow-hidden rounded-2xl p-3 ring-1 transition-all ${isDone ? "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent ring-emerald-400/30" : "bg-white/5 ring-white/10 hover:bg-white/[0.07] hover:ring-white/20"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl shadow-inner ${isDone ? "bg-emerald-500/20 ring-1 ring-emerald-400/30" : "bg-gradient-to-br from-amber-400/15 to-rose-500/15 ring-1 ring-white/10"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.emoji }),
                isDone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 ring-2 ring-slate-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-2.5 w-2.5 text-slate-900" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `truncate text-sm font-bold ${isDone ? "text-white/70" : "text-white"}`, children: c.title }),
                  isDone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-2.5 w-2.5" }),
                    " Done"
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 text-[10px] font-semibold text-white/50", children: [
                    v,
                    "/",
                    c.goal
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 flex-1 overflow-hidden rounded-full bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `h-full rounded-full transition-all duration-500 ${isDone ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-gradient-to-r from-amber-400 to-rose-400"}`,
                      style: { width: `${Math.max(0, Math.min(100, pct))}%` }
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300/90", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-2.5 w-2.5" }),
                    " ",
                    c.reward
                  ] })
                ] })
              ] })
            ] })
          },
          c.id
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white/70 ring-1 ring-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3 text-orange-400" }),
        "Complete all for a streak bonus"
      ] }),
      celebrate && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 z-10 grid place-items-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center gap-1 rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-fuchsia-500/20 px-6 py-5 shadow-[0_0_40px_rgba(251,191,36,0.5)] animate-in zoom-in-95 duration-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-8 w-8 text-amber-300 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-extrabold text-white", children: "Challenge complete!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] font-bold text-amber-200", children: [
          "+",
          challenges.find((c) => c.id === celebrate)?.xp ?? 0,
          " XP earned"
        ] })
      ] }) })
    ] })
  ] });
}
const STORAGE_KEY = "discovery-widgets:v1";
function loadStats() {
  if (typeof window === "undefined") return { impressions: {}, clicks: {} };
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
  } catch {
    return { impressions: {}, clicks: {} };
  }
}
function saveStats(s) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
  }
}
function ModuleDiscoveryWidget({ slotIndex = 0 }) {
  const { raw } = useAppSettings();
  const config = reactExports.useMemo(
    () => mergeDiscoveryWidgetsConfig(raw?.discovery_widgets),
    [raw]
  );
  const [stats, setStats] = reactExports.useState(() => loadStats());
  const [sessionShown] = reactExports.useState(() => /* @__PURE__ */ new Set());
  const item = reactExports.useMemo(() => {
    if (!config.enabled) return null;
    const pool = config.items.filter((it) => it.enabled);
    if (pool.length === 0) return null;
    const scored = pool.map((it) => {
      const imps = stats.impressions[it.key] ?? 0;
      const clicks = stats.clicks[it.key] ?? 0;
      const visitedPenalty = clicks > 0 ? 0.35 : 1.5;
      const weight = (it.priority || 1) * (1 / (1 + imps * 0.6)) * visitedPenalty;
      return { it, weight };
    });
    scored.sort((a, b) => b.weight - a.weight);
    const fresh = scored.filter((s) => !sessionShown.has(s.it.key));
    const winner = (fresh[0] ?? scored[0]).it;
    const rotated = scored[slotIndex % scored.length]?.it ?? winner;
    const pick = sessionShown.has(rotated.key) ? winner : rotated;
    return pick;
  }, [config, stats, slotIndex, sessionShown]);
  reactExports.useEffect(() => {
    if (!item) return;
    sessionShown.add(item.key);
    setStats((prev) => {
      const next = {
        impressions: { ...prev.impressions, [item.key]: (prev.impressions[item.key] ?? 0) + 1 },
        clicks: { ...prev.clicks }
      };
      saveStats(next);
      return next;
    });
  }, [item?.key]);
  if (!item) return null;
  const onClick = () => {
    setStats((prev) => {
      const next = {
        impressions: { ...prev.impressions },
        clicks: { ...prev.clicks, [item.key]: (prev.clicks[item.key] ?? 0) + 1 }
      };
      saveStats(next);
      return next;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-card group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/[0.06] via-background to-background p-4 shadow-sm transition hover:border-primary/40 hover:shadow-[0_10px_30px_-15px_var(--primary-glow,rgba(139,92,246,0.55))]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-70",
        "aria-hidden": true
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl",
        "aria-hidden": true
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-2xl ring-1 ring-inset ring-primary/25", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: item.icon }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-sm font-bold text-foreground", children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary ring-1 ring-inset ring-primary/25", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-2.5 w-2.5" }),
            " Discover"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground", children: item.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: item.to,
            onClick,
            className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-[0_6px_18px_-6px_var(--primary-glow,rgba(139,92,246,0.7))] transition hover:brightness-110 active:scale-95",
            children: [
              item.ctaText,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
            ]
          }
        ) })
      ] })
    ] })
  ] });
}
const getFriendBirthdaysToday = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(createSsrRpc("0a8dd47bdefe52f0d2a14e538afcf1438f38f026249b39309a493bd8d805d3f7"));
function BirthdaysWidget() {
  const fetchBirthdays = useServerFn(getFriendBirthdaysToday);
  const [items, setItems] = reactExports.useState([]);
  const [loaded, setLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancel = false;
    fetchBirthdays({}).then((rows) => {
      if (!cancel) {
        setItems(rows);
        setLoaded(true);
      }
    }).catch(() => {
      if (!cancel) setLoaded(true);
    });
    return () => {
      cancel = true;
    };
  }, [fetchBirthdays]);
  if (!loaded || items.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Cake, { className: "h-3.5 w-3.5 text-pink-400" }),
      " Birthdays today"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: items.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-xs", children: [
      b.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: b.avatar_url, alt: b.username, className: "h-7 w-7 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-full bg-muted text-[10px] font-bold", children: b.username.slice(0, 2).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-semibold", children: b.username }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: b.turning_years != null ? `Turning ${b.turning_years} 🎂` : "Happy birthday! 🎉" })
      ] })
    ] }, b.id)) })
  ] });
}
const getMyCreatorRank = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(createSsrRpc("144e62f99e7f7056d280dd69f6d06a2069ce67b247347e85a2558a151ead5dd6"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(createSsrRpc("41cfdb8af178472f9839a1a826968c8eab17b2ba7b80f94704992f662ce29f01"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(createSsrRpc("4e68ea51bbb50b27654ea3e6f9866e8da98c9ee9d42b97e3c31fcabe0c949230"));
const SOUND_KEY = "missions:sound";
const COLORS = ["#fbbf24", "#f472b6", "#a78bfa", "#34d399", "#60a5fa", "#fb7185"];
function playClaimSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(1e-4, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(1e-4, start + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
    setTimeout(() => ctx.close(), 800);
  } catch (e) {
    console.warn("claim sound failed", e);
  }
}
function MissionsPanel() {
  const fetchMissions = useServerFn(getTodayMissions);
  const claim = useServerFn(claimMission);
  const fetchRank = useServerFn(getMyCreatorRank);
  const [missions, setMissions] = reactExports.useState([]);
  const [rank, setRank] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [claiming, setClaiming] = reactExports.useState(null);
  const [bursts, setBursts] = reactExports.useState([]);
  const [soundOn, setSoundOn] = reactExports.useState(true);
  const burstId = reactExports.useRef(0);
  reactExports.useEffect(() => {
    try {
      const v = localStorage.getItem(SOUND_KEY);
      if (v !== null) setSoundOn(v === "1");
    } catch {
    }
  }, []);
  function toggleSound() {
    setSoundOn((s) => {
      const next = !s;
      try {
        localStorage.setItem(SOUND_KEY, next ? "1" : "0");
      } catch {
      }
      return next;
    });
  }
  async function load() {
    try {
      const [m, r] = await Promise.all([fetchMissions(), fetchRank()]);
      setMissions(m.missions);
      setRank({ score: r.score, title: r.rank.title, chip: r.rank.chip });
    } catch (e) {
      console.error("missions load failed", e);
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    void load();
  }, []);
  const inFlight = reactExports.useRef(/* @__PURE__ */ new Set());
  async function onClaim(id) {
    if (inFlight.current.has(id)) return;
    if (claiming === id) return;
    const target = missions.find((m) => m.id === id);
    if (!target) return;
    if (target.claimed) {
      toast.info("Already claimed");
      return;
    }
    if (!target.completed) {
      toast.error("Mission not yet complete");
      return;
    }
    inFlight.current.add(id);
    setClaiming(id);
    setMissions((prev) => prev.map((m) => m.id === id ? { ...m, claimed: true, completed: true } : m));
    const bId = ++burstId.current;
    setBursts((b) => [...b, { id: bId, missionId: id, coins: target.coins }]);
    if (soundOn) playClaimSound();
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== bId)), 1400);
    try {
      await claim({ data: { missionId: id } });
      toast.success(`Claimed +${target.coins} coins`);
      void load();
    } catch (e) {
      console.error("claim failed", e);
      const msg = e instanceof Error ? e.message : "Couldn't claim reward. Please try again.";
      toast.error(msg);
      setMissions((prev) => prev.map((m) => m.id === id ? { ...m, claimed: false } : m));
      setBursts((b) => b.filter((x) => x.id !== bId));
    } finally {
      inFlight.current.delete(id);
      setClaiming(null);
    }
  }
  const total = missions.length;
  const done = missions.filter((m) => m.claimed).length;
  const overallPct = total ? Math.round(done / total * 100) : 0;
  const totalCoins = missions.reduce((s, m) => s + (m.claimed ? 0 : m.coins), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-[1px] shadow-[0_20px_60px_-15px_rgba(99,102,241,0.5)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-fuchsia-500/30 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-950/90 via-indigo-950/80 to-slate-950/90 p-4 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4.5 w-4.5 text-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-extrabold tracking-tight text-white", children: "Daily Missions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-indigo-300/80", children: "Resets in 24h" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          rank && rank.title !== "Newcomer" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-200 ring-1 ring-amber-400/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }),
            " ",
            rank.title
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: toggleSound,
              title: soundOn ? "Mute claim sound" : "Unmute claim sound",
              "aria-label": soundOn ? "Mute claim sound" : "Unmute claim sound",
              className: "grid h-7 w-7 place-items-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white",
              children: soundOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-3.5 w-3.5" })
            }
          )
        ] })
      ] }),
      !loading && total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between text-[11px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-white/90", children: [
            done,
            "/",
            total,
            " completed"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 font-bold text-amber-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3 w-3" }),
            " ",
            totalCoins,
            " to earn"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 shadow-[0_0_10px_rgba(217,70,239,0.6)] transition-all duration-700",
            style: { width: `${overallPct}%` }
          }
        ) })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-indigo-300" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: missions.map((m) => {
        const pct = Math.min(100, Math.round(m.progress / m.target * 100));
        const isClaimed = m.claimed;
        const isReady = m.completed && !m.claimed;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "li",
          {
            className: `group relative overflow-hidden rounded-2xl p-3 ring-1 transition-all ${isClaimed ? "bg-emerald-500/5 ring-emerald-500/20" : isReady ? "bg-gradient-to-r from-amber-500/15 via-fuchsia-500/10 to-transparent ring-amber-400/40 shadow-lg shadow-amber-500/10" : "bg-white/5 ring-white/10 hover:bg-white/[0.07] hover:ring-white/20"}`,
            children: [
              isReady && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" }),
              bursts.filter((b) => b.missionId === m.id).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 z-10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-2xl ring-2 ring-amber-300/70 animate-[claim-glow_1.2s_ease-out_forwards] shadow-[0_0_30px_rgba(251,191,36,0.7)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-3 top-1 text-xs font-extrabold text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-[float-up_1.2s_ease-out_forwards]", children: [
                  "+",
                  b.coins,
                  " 🪙"
                ] }),
                Array.from({ length: 14 }).map((_, i) => {
                  const angle = i / 14 * Math.PI * 2;
                  const dist = 40 + Math.random() * 30;
                  const dx = Math.cos(angle) * dist;
                  const dy = Math.sin(angle) * dist;
                  const color = COLORS[i % COLORS.length];
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "absolute left-6 top-1/2 h-1.5 w-1.5 rounded-sm animate-[confetti_1.1s_ease-out_forwards]",
                      style: {
                        backgroundColor: color,
                        ["--dx"]: `${dx}px`,
                        ["--dy"]: `${dy}px`,
                        animationDelay: `${i * 12}ms`
                      }
                    },
                    i
                  );
                })
              ] }, b.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl shadow-inner ${isClaimed ? "bg-emerald-500/20 ring-1 ring-emerald-400/30" : isReady ? "bg-gradient-to-br from-amber-400/30 to-fuchsia-500/30 ring-1 ring-amber-300/40" : "bg-white/5 ring-1 ring-white/10"}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isClaimed ? "grayscale opacity-60" : "", children: m.icon }),
                  isReady && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 ring-2 ring-slate-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-2.5 w-2.5 text-slate-900" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `truncate text-sm font-bold ${isClaimed ? "text-white/50 line-through" : "text-white"}`, children: m.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[11px] text-white/60", children: m.description }) })
                ] }),
                isClaimed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/30", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                  " Claimed"
                ] }) : isReady ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => onClaim(m.id),
                    disabled: claiming === m.id,
                    className: "group/btn relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-lg shadow-fuchsia-500/40 ring-1 ring-white/20 transition-all hover:scale-105 hover:shadow-fuchsia-500/60 disabled:opacity-60",
                    children: [
                      claiming === m.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-3 w-3" }),
                      "Claim +",
                      m.coins
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300/80", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-2.5 w-2.5" }),
                    "+",
                    m.coins
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-semibold text-white/50", children: [
                    m.progress,
                    "/",
                    m.target
                  ] })
                ] })
              ] }),
              !isClaimed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2.5 h-1 overflow-hidden rounded-full bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-full rounded-full transition-all duration-500 ${isReady ? "bg-gradient-to-r from-amber-400 to-fuchsia-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-gradient-to-r from-indigo-400 to-fuchsia-400"}`,
                  style: { width: `${pct}%` }
                }
              ) })
            ]
          },
          m.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes claim-glow {
          0% { opacity: 0; transform: scale(0.92); }
          30% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0; transform: scale(1.06); }
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(8px) scale(0.8); }
          25% { opacity: 1; transform: translateY(-2px) scale(1.15); }
          100% { opacity: 0; transform: translateY(-28px) scale(1); }
        }
        @keyframes confetti {
          0% { opacity: 0; transform: translate(0,0) scale(0.5) rotate(0deg); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1) rotate(540deg); }
        }
      ` })
  ] });
}
function timeAgo(iso) {
  const d = Date.now() - new Date(iso).getTime();
  const s = Math.floor(d / 1e3);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
const KIND_LABELS = {
  friend_post: "shared a new post",
  friend_comment: "commented on a post"
};
function FeedNotifications({ meId, profiles }) {
  const [items, setItems] = reactExports.useState([]);
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!meId) return;
    async function load() {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", meId).order("created_at", { ascending: false }).limit(20);
      setItems(data ?? []);
    }
    load();
    const ch = supabase.channel(`notif-${meId}`).on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${meId}` }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [meId]);
  const unread = reactExports.useMemo(() => items.filter((i) => !i.read).length, [items]);
  async function markAllRead() {
    if (!unread) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", meId).eq("read", false);
  }
  async function markOne(id) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        className: "relative grid h-9 w-9 place-items-center rounded-full hover:bg-accent",
        "aria-label": "Notifications",
        title: "Notifications",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5 text-foreground" }),
          unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground", children: unread > 9 ? "9+" : unread })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "fixed inset-0 z-30", "aria-hidden": true, onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-11 z-40 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "Notifications" }),
          unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: markAllRead, className: "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
            " Mark all read"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[60vh] overflow-y-auto", children: items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-8 text-center text-xs text-muted-foreground", children: "No notifications yet." }) : items.map((n) => {
          const actor = n.actor_id ? profiles[n.actor_id] : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => markOne(n.id),
              className: `flex w-full items-start gap-2 border-b border-border/40 px-3 py-2 text-left text-sm hover:bg-accent ${!n.read ? "bg-primary/5" : ""}`,
              children: [
                actor ? /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: actor, size: 32 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-muted" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: actor?.name ?? "Someone" }),
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: KIND_LABELS[n.kind] ?? n.kind })
                  ] }),
                  n.payload?.text && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: n.payload.text }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-[10px] text-muted-foreground", children: [
                    timeAgo(n.created_at),
                    " ago"
                  ] })
                ] }),
                !n.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" })
              ]
            },
            n.id
          );
        }) })
      ] })
    ] })
  ] });
}
const DEFAULT_FEED_THEME = "boobubble_default";
const sb = supabase;
async function listFeedThemes() {
  const { data, error } = await sb.from("feed_themes").select("*").eq("enabled", true).order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
async function listMyUnlocks(userId) {
  const { data, error } = await sb.from("user_feed_themes").select("theme_key, unlocked_at, expires_at, source").eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}
async function getMyActiveFeedTheme(userId) {
  const { data, error } = await sb.rpc("get_active_feed_theme", { _user: userId });
  if (error || !data) return DEFAULT_FEED_THEME;
  return data;
}
async function unlockFeedTheme(themeKey) {
  const { data, error } = await sb.rpc("unlock_feed_theme", { _theme_key: themeKey });
  if (error) throw error;
  return data;
}
async function activateFeedTheme(themeKey) {
  const { data, error } = await sb.rpc("activate_feed_theme", { _theme_key: themeKey });
  if (error) throw error;
  const next = data ?? themeKey;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("palrgo:active-feed-theme", next);
      window.dispatchEvent(new CustomEvent("palrgo:feed-theme-changed", { detail: next }));
    }
  } catch {
  }
  return next;
}
const FEED_THEME_CACHE_KEY = "palrgo:active-feed-theme";
const FEED_THEME_PREVIEW_KEY = "palrgo:feed-theme-preview";
function readPreviewTheme() {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(FEED_THEME_PREVIEW_KEY);
    return v || null;
  } catch {
    return null;
  }
}
function readCachedFeedTheme() {
  if (typeof window === "undefined") return DEFAULT_FEED_THEME;
  const preview = readPreviewTheme();
  if (preview) return preview;
  try {
    const v = localStorage.getItem(FEED_THEME_CACHE_KEY);
    return v || DEFAULT_FEED_THEME;
  } catch {
    return DEFAULT_FEED_THEME;
  }
}
function useActiveFeedTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = reactExports.useState(readCachedFeedTheme);
  const [version, setVersion] = reactExports.useState(0);
  const [preview, setPreview] = reactExports.useState(readPreviewTheme);
  reactExports.useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      if (!preview) setTheme(DEFAULT_FEED_THEME);
      try {
        localStorage.removeItem(FEED_THEME_CACHE_KEY);
      } catch {
      }
      return;
    }
    getMyActiveFeedTheme(user.id).then((t) => {
      if (cancelled) return;
      try {
        localStorage.setItem(FEED_THEME_CACHE_KEY, t);
      } catch {
      }
      if (!preview) setTheme(t);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, version, preview]);
  reactExports.useEffect(() => {
    const onChanged = (e) => {
      const next = e.detail;
      if (preview) return;
      if (next) setTheme(next);
      else setVersion((v) => v + 1);
    };
    const onPreview = (e) => {
      const next = e.detail ?? null;
      setPreview(next);
      if (next) setTheme(next);
      else {
        try {
          const cached = localStorage.getItem(FEED_THEME_CACHE_KEY);
          setTheme(cached || DEFAULT_FEED_THEME);
        } catch {
          setTheme(DEFAULT_FEED_THEME);
        }
        setVersion((v) => v + 1);
      }
    };
    const onStorage = (e) => {
      if (e.key === FEED_THEME_PREVIEW_KEY) {
        const next = e.newValue || null;
        setPreview(next);
        if (next) setTheme(next);
        else setVersion((v) => v + 1);
        return;
      }
      if (e.key === FEED_THEME_CACHE_KEY && e.newValue && !preview) setTheme(e.newValue);
    };
    window.addEventListener("palrgo:feed-theme-changed", onChanged);
    window.addEventListener("palrgo:feed-theme-preview-changed", onPreview);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("palrgo:feed-theme-changed", onChanged);
      window.removeEventListener("palrgo:feed-theme-preview-changed", onPreview);
      window.removeEventListener("storage", onStorage);
    };
  }, [preview]);
  const refresh = reactExports.useCallback(() => setVersion((v) => v + 1), []);
  return { theme, refresh, preview };
}
const feedThemes = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DEFAULT_FEED_THEME,
  activateFeedTheme,
  getMyActiveFeedTheme,
  listFeedThemes,
  listMyUnlocks,
  unlockFeedTheme,
  useActiveFeedTheme
}, Symbol.toStringTag, { value: "Module" }));
function FeedThemeStore({ open, onOpenChange, activeTheme, onThemeChange }) {
  const { user } = useAuth();
  const [themes, setThemes] = reactExports.useState([]);
  const [unlocks, setUnlocks] = reactExports.useState([]);
  const [coins, setCoins] = reactExports.useState(0);
  const [busy, setBusy] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [t, u, c] = await Promise.all([
        listFeedThemes(),
        listMyUnlocks(user.id),
        supabase.rpc("my_coin_balance")
      ]);
      setThemes(t);
      setUnlocks(u);
      setCoins(typeof c.data === "number" ? c.data : 0);
    } catch (e) {
      toast.error(e.message ?? "Failed to load themes");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (open) refresh();
  }, [open, user?.id]);
  const unlockMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const u of unlocks) m.set(u.theme_key, u);
    return m;
  }, [unlocks]);
  const isUnlocked = (t) => {
    if (t.is_default) return true;
    const u = unlockMap.get(t.theme_key);
    if (!u) return false;
    if (!u.expires_at) return true;
    return new Date(u.expires_at).getTime() > Date.now();
  };
  const handleUnlock = async (t) => {
    if (!user?.id) return;
    setBusy(t.theme_key);
    try {
      await unlockFeedTheme(t.theme_key);
      toast.success(`Unlocked ${t.name}`, { description: "Activating…" });
      try {
        await activateFeedTheme(t.theme_key);
        onThemeChange();
        onOpenChange(false);
        return;
      } catch (actErr) {
        toast.error(actErr?.message ?? "Activate failed");
      }
      await refresh();
    } catch (e) {
      toast.error(e.message ?? "Unlock failed");
    } finally {
      setBusy(null);
    }
  };
  const handleActivate = async (t) => {
    setBusy(t.theme_key);
    try {
      await activateFeedTheme(t.theme_key);
      toast.success(`Activated ${t.name}`);
      onThemeChange();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message ?? "Activate failed");
    } finally {
      setBusy(null);
    }
  };
  const modeLabel = (m) => m === "days_7" ? "7-day access" : m === "days_30" ? "30-day access" : "Lifetime";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
        "Feed Theme Store"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Unlock premium skins for your feed. Layout stays the same — only the look changes." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 inline-flex items-center gap-2 self-start rounded-full bg-muted px-3 py-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4 text-yellow-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: coins.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "coins" })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-sm text-muted-foreground", children: "Loading themes…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: themes.map((t) => {
      const unlocked = isUnlocked(t);
      const active = activeTheme === t.theme_key;
      const u = unlockMap.get(t.theme_key);
      const accent = t.accent_hex ?? "#7c3aed";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "mb-3 h-24 w-full rounded-lg",
                style: {
                  background: `linear-gradient(135deg, ${accent}, ${accent}55)`
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: t.name }),
                active && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", className: "gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                  " Active"
                ] }),
                !unlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
                  " Locked"
                ] })
              ] }),
              t.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: t.description })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-3 text-xs text-muted-foreground", children: [
              !t.is_default && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3.5 w-3.5 text-yellow-500" }),
                  t.price_coins.toLocaleString()
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
                  modeLabel(t.unlock_mode)
                ] })
              ] }),
              u?.expires_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-500", children: [
                "Expires ",
                new Date(u.expires_at).toLocaleDateString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex gap-2", children: active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: true, className: "w-full", children: "Currently active" }) : unlocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                className: "w-full",
                disabled: busy === t.theme_key,
                onClick: () => handleActivate(t),
                children: "Activate"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                className: "w-full",
                disabled: busy === t.theme_key || coins < t.price_coins,
                onClick: () => handleUnlock(t),
                children: coins < t.price_coins ? "Not enough coins" : `Unlock for ${t.price_coins.toLocaleString()}`
              }
            ) })
          ]
        },
        t.theme_key
      );
    }) })
  ] }) });
}
const listTestimonialsForUser = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  targetUserId: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(50).default(10)
}).parse(d ?? {})).middleware([requireSupabaseAuth, withRateLimit("profile.write")]).handler(createSsrRpc("5a1cb07c0526b841478f038c97ad40388ca433cec30a61a2d01488b929ffd5ea"));
const writeTestimonial = createServerFn({
  method: "POST"
}).middleware([withRateLimit("profile.write")]).inputValidator((d) => objectType({
  targetUserId: stringType().uuid(),
  body: stringType().trim().min(1).max(500)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("profile.write")]).handler(createSsrRpc("4ba37046414343fe8bab0f28ba64459913d806eb3bcc3cb69be0c762da4d6669"));
const deleteTestimonial = createServerFn({
  method: "POST"
}).middleware([withRateLimit("profile.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("profile.write")]).handler(createSsrRpc("fe90f2cf958f24d37819c992306e3d620ff6997cadc8dd247eba4dd9f5f398a0"));
function useThemeBrandLabel(themeKey, fallback) {
  const { raw } = useAppSettings();
  const map = raw?.theme_brand_labels || {};
  const v = map[themeKey];
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}
function synthUser(username, id) {
  return {
    id,
    name: username,
    avatarColor: "#1d4488",
    status: "online",
    xp: 0,
    level: 1
  };
}
const ORKUT_BLUE = "#1d4488";
const ORKUT_BLUE_DARK = "#15356b";
const ORKUT_BLUE_LIGHT = "#4068a3";
const ORKUT_PINK = "#ff66aa";
function OrkutFeedLayout(props) {
  const {
    meId,
    user,
    profiles,
    posts,
    friendIds,
    loading,
    onReload,
    onOpenThemeStore,
    onOpenAccount,
    onOpenProfile,
    onOpenFindFriends,
    onOpenMessages
  } = props;
  const friendList = reactExports.useMemo(
    () => Array.from(friendIds).map((id) => profiles[id]).filter(Boolean),
    [friendIds, profiles]
  );
  const allProfiles = reactExports.useMemo(
    () => Object.values(profiles).filter((p) => p && p.id !== meId),
    [profiles, meId]
  );
  const username = user.username;
  const me = profiles[meId] ?? synthUser(username, meId);
  const myPosts = reactExports.useMemo(() => posts.filter((p) => p.author_id === meId).length, [posts, meId]);
  const photos = reactExports.useMemo(() => posts.filter((p) => p.author_id === meId && (p.media_urls?.length ?? 0) > 0).length, [posts, meId]);
  const fans = friendList.length;
  const brandLabel = useThemeBrandLabel("orkut_retro", "boobubble");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen overflow-x-hidden orkut-classic-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: ORKUT_CSS }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      OrkutTopBar,
      {
        username,
        me,
        brandLabel,
        onOpenProfile,
        onOpenMessages,
        onOpenThemeStore,
        onOpenFindFriends,
        headerSlot: props.headerSlot
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-[1180px] gap-4 px-3 py-4 md:grid-cols-[230px_minmax(0,1fr)_260px] md:gap-4 md:px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutProfileCard, { user: me, username, fansCount: fans, onEdit: onOpenAccount, onProfile: () => onOpenProfile(username) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutProfileStats, { fans }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OrkutQuickLinks,
          {
            onProfile: () => onOpenProfile(username),
            onFindFriends: onOpenFindFriends,
            onMessages: onOpenMessages,
            onAccount: onOpenAccount,
            onThemes: onOpenThemeStore
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-w-0 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutStatusBox, { name: me.name || username, authorId: meId, onPosted: onReload }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OrkutSocialCounters,
          {
            posts: myPosts,
            photos,
            fans,
            messages: 0,
            friends: fans
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutFriendSuggestions, { users: allProfiles.slice(0, 6), friendIds, meId, onOpenProfile }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", "data-orkut-scrapbook": true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Scraps from the Community" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-[#d6e0ee] bg-[#f5f8fc] p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Composer, { authorId: meId, onPosted: onReload }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-3", children: [
            loading && Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostSkeleton, {}, i)),
            !loading && posts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded border border-dashed border-[#b5c7e0] bg-[#f5f8fc] p-8 text-center text-xs text-[#5a6b85]", children: "No scraps yet — be the first to leave one on the community feed!" }),
            !loading && posts.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-feed-post": post.id, className: "orkut-post-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post, profiles, meId }) }, post.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutFriendsPanel, { friends: friendList, onOpenProfile, onFindFriends: onOpenFindFriends }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutPromotedUsers, { users: allProfiles.slice(0, 4), onOpenProfile }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutPromotedGroups, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutCommunities, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutTestimonials, { meId, onOpenProfile, friends: friendList }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutFanCounter, { fans }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutMusicScrap, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-6 border-t border-[#b5c7e0] bg-[#e8eef5] py-4 text-center text-[11px] text-[#5a6b85]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "orkut-brand", children: brandLabel }),
      " · classic retro layout · powered by the platform · ",
      (/* @__PURE__ */ new Date()).getFullYear()
    ] })
  ] });
}
function OrkutTopBar({
  username,
  me,
  brandLabel,
  onOpenProfile,
  onOpenMessages,
  onOpenThemeStore,
  onOpenFindFriends,
  headerSlot
}) {
  const [q, setQ] = reactExports.useState("");
  const navigate = useNavigate();
  const goHome = () => {
    navigate({ to: "/feed" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goScrapbook = () => {
    if (typeof window !== "undefined") {
      const el = document.querySelector("[data-orkut-scrapbook]");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const goCommunities = () => navigate({ to: "/groups" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "orkut-navbar sticky top-0 z-30 text-white shadow-[0_2px_0_rgba(0,0,0,0.08)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "orkut-logo", children: brandLabel }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          onSubmit: (e) => e.preventDefault(),
          className: "ml-2 hidden flex-1 max-w-[360px] items-center gap-1 rounded-sm bg-white p-0.5 pl-2 text-[#1d4488] shadow-inner sm:flex",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5 opacity-70" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: q,
                onChange: (e) => setQ(e.target.value),
                placeholder: "search friends, communities, scraps…",
                className: "w-full bg-transparent px-1 py-0.5 text-[12px] outline-none placeholder:text-[#7d8da5]"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                className: "orkut-btn-blue px-2 py-0.5 text-[11px]",
                children: "search"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center gap-2 text-[11px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onOpenProfile(username),
          className: "flex items-center gap-1.5 rounded-sm bg-white/15 pl-1 pr-2 py-0.5 hover:bg-white/25",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-5 w-5 place-items-center rounded-sm bg-white text-[10px] font-black text-[#1d4488]", children: (me.name || username).slice(0, 1).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden text-[11px] font-bold sm:inline", children: me.name || username })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "border-t border-white/15 bg-[color-mix(in_oklab,#15356b_55%,transparent)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1180px] items-center gap-0.5 overflow-x-auto px-2 text-[12px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopLink, { icon: House, label: "home", onClick: goHome }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopLink, { icon: Smile, label: "profile", onClick: () => onOpenProfile(username) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopLink, { icon: ScrollText, label: "scrapbook", onClick: goScrapbook }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopLink, { icon: Users, label: "friends", onClick: onOpenFindFriends }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopLink, { icon: Star, label: "communities", onClick: goCommunities }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopLink, { icon: MessageCircle, label: "messages", onClick: onOpenMessages }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopLink, { icon: MessagesSquare, label: "chatrooms", onClick: () => navigate({ to: "/chatroom" }) })
    ] }) })
  ] });
}
function TopLink({
  icon: Icon,
  label,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      "data-tip": label,
      className: "orkut-tab orkut-tip flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 font-bold uppercase tracking-wide text-white/90 transition hover:bg-white/15 hover:text-white",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
      ]
    }
  );
}
function OrkutProfileCard({
  user,
  username,
  fansCount,
  onEdit,
  onProfile
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "my profile" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onProfile,
          className: "mx-auto inline-block rounded-sm border border-[#b5c7e0] bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:border-[#1d4488]",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user, size: 92 })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[13px] font-bold leading-tight text-[#1d4488]", children: user.name || username }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#5a6b85]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-1.5 w-1.5 rounded-full ${user.status === "online" ? "bg-emerald-500" : user.status === "away" ? "bg-amber-500" : "bg-zinc-400"}` }),
        user.status ?? "online"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t border-[#d6e0ee] bg-[#f5f8fc] p-3 text-[11px] text-[#3b4a66]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatLine, { icon: Crown, label: "level", value: String(user.level ?? 1) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatLine, { icon: Sparkles, label: "xp", value: String(user.xp ?? 0) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatLine, { icon: Coins, label: "coins", value: String(user.coins ?? 0) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatLine, { icon: Flame, label: "streak", value: `${user.streak ?? 0} days` }),
      user.countryCode && /* @__PURE__ */ jsxRuntimeExports.jsx(StatLine, { icon: MapPin, label: "from", value: user.countryCode.toUpperCase() })
    ] }),
    user.bio && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-[#d6e0ee] bg-white p-3 text-[11px] italic text-[#5a6b85]", children: [
      '"',
      user.bio,
      '"'
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-px border-t border-[#d6e0ee] bg-[#d6e0ee] text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "fans", value: fansCount }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "cool", value: Math.min(99, fansCount * 2) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "trusty", value: Math.min(99, (user.level ?? 1) * 5) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 border-t border-[#d6e0ee] bg-[#f5f8fc] p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onProfile, className: "orkut-btn-blue flex-1 px-2 py-1 text-[11px]", children: "view profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onEdit, className: "orkut-btn-light flex-1 px-2 py-1 text-[11px]", children: "edit" })
    ] })
  ] });
}
function StatLine({ icon: Icon, label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3 text-[#ff66aa]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-[#5a6b85]", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tabular-nums text-[#1d4488]", children: value })
  ] });
}
function MiniStat({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0 bg-white py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-black tabular-nums text-[#1d4488]", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase tracking-wider text-[#5a6b85]", children: label })
  ] });
}
function OrkutProfileStats({ fans }) {
  const fortunes = [
    "Lucky day ahead 🌟",
    "A new friend awaits 💌",
    "Sweet scraps in store 💖",
    "Smile, you're cool 😎",
    "Music will find you 🎵",
    "Reconnect with someone 📞",
    "Adventure incoming ✨"
  ];
  const day = /* @__PURE__ */ new Date();
  const fortune = fortunes[(day.getDate() + day.getMonth()) % fortunes.length];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "profile stats" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "divide-y divide-[#d6e0ee] bg-white text-[11px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between px-3 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#5a6b85]", children: "profile views" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tabular-nums text-[#1d4488]", children: 280 + fans * 4 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between px-3 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#5a6b85]", children: "recent visitors" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tabular-nums text-[#1d4488]", children: Math.max(1, Math.min(fans, 9)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start justify-between gap-2 px-3 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#5a6b85]", children: "today's fortune" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right font-bold text-[#d6336c]", children: fortune })
      ] })
    ] })
  ] });
}
function OrkutQuickLinks({
  onProfile,
  onFindFriends,
  onMessages,
  onAccount,
  onThemes
}) {
  const navigate = useNavigate();
  const scrollToScrapbook = () => {
    if (typeof window === "undefined") return;
    const el = document.querySelector("[data-orkut-scrapbook]");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/welcome" });
  };
  const items = [
    { icon: Smile, label: "profile", onClick: onProfile },
    { icon: ScrollText, label: "scrapbook", onClick: scrollToScrapbook },
    { icon: Image, label: "photos", onClick: scrollToScrapbook },
    { icon: Users, label: "friends", onClick: onFindFriends },
    { icon: Star, label: "communities", onClick: () => navigate({ to: "/groups" }) },
    { icon: MessageCircle, label: "messages", onClick: onMessages },
    { icon: MessagesSquare, label: "chatrooms", onClick: () => navigate({ to: "/chatroom" }) },
    { icon: Palette, label: "themes", onClick: onThemes },
    { icon: Settings, label: "account", onClick: onAccount },
    { icon: LogOut, label: "logout", onClick: logout }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "quick links" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "bg-white p-1.5 text-[11px]", children: items.map((it) => {
      const Icon = it.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: it.onClick,
          "data-tip": `go to ${it.label}`,
          className: "orkut-tip flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-[#3b4a66] transition hover:bg-[#eef3fa] hover:text-[#1d4488]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3 text-[#ff66aa]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: it.label })
          ]
        }
      ) }, it.label);
    }) })
  ] });
}
function OrkutStatusBox({ name, authorId, onPosted }) {
  const [text, setText] = reactExports.useState("");
  const [posting, setPosting] = reactExports.useState(false);
  const submit = async () => {
    const body = text.trim();
    if (!body || posting) return;
    setPosting(true);
    const slug = body.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || `status-${Date.now()}`;
    const { error } = await supabase.from("posts").insert({
      author_id: authorId,
      owner_id: authorId,
      kind: "text",
      text: body,
      slug,
      media_urls: [],
      privacy: "public",
      is_anonymous: false,
      hashtags: []
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status updated ✨");
    setText("");
    onPosted();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "what are you doing, ",
        name.toLowerCase(),
        "?"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 bg-white p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-sm border border-[#b5c7e0] bg-[#fbfcfe] p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "grid h-6 w-6 shrink-0 place-items-center rounded-sm border border-[#d6e0ee] bg-white text-base hover:bg-[#fff8e0]",
              title: "add emoji",
              children: "🙂"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-72 p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmojiPicker, { onPick: (e) => setText((t) => (t + e).slice(0, 140)) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: text,
            onChange: (e) => setText(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") submit();
            },
            placeholder: "share a quick update… (e.g. listening to old hindi songs 🎶)",
            className: "w-full bg-transparent text-[12px] text-[#1d2942] outline-none placeholder:text-[#7d8da5]",
            maxLength: 140
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-[#7d8da5] tabular-nums", children: [
          text.length,
          "/140"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setText(""),
            className: "orkut-btn-light px-3 py-1 text-[11px]",
            disabled: !text,
            children: "cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: submit,
            className: "orkut-btn-blue px-3 py-1 text-[11px]",
            disabled: !text.trim() || posting,
            children: posting ? "updating…" : "update status"
          }
        )
      ] })
    ] })
  ] });
}
function OrkutSocialCounters({
  posts,
  photos,
  fans,
  messages,
  friends
}) {
  const items = [
    { icon: ScrollText, label: "posts", value: posts },
    { icon: Image, label: "photos", value: photos },
    { icon: Heart, label: "fans", value: fans },
    { icon: MessageCircle, label: "messages", value: messages },
    { icon: Users, label: "friends", value: friends }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "orkut-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 divide-x divide-[#d6e0ee] bg-white", children: items.map((it) => {
    const Icon = it.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5 px-2 py-2.5 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 text-[#ff66aa]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black tabular-nums text-[#1d4488]", children: it.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase tracking-wider text-[#5a6b85]", children: it.label })
    ] }, it.label);
  }) }) });
}
function OrkutFriendSuggestions({
  users,
  friendIds,
  meId,
  onOpenProfile
}) {
  const [pending, setPending] = reactExports.useState(/* @__PURE__ */ new Set());
  const [sent, setSent] = reactExports.useState(/* @__PURE__ */ new Set());
  async function addFriend(otherId) {
    if (!otherId || otherId === meId) return;
    setPending((p) => new Set(p).add(otherId));
    const { error } = await supabase.from("friendships").insert({ sender_id: meId, receiver_id: otherId, status: "pending" });
    setPending((p) => {
      const n = new Set(p);
      n.delete(otherId);
      return n;
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Friend request sent ✨");
    setSent((s) => new Set(s).add(otherId));
  }
  const visible = users.filter((u) => !friendIds.has(u.id));
  if (visible.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "friend suggestions" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto bg-white p-3", children: visible.map((u) => {
      const isPending = pending.has(u.id);
      const isSent = sent.has(u.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "orkut-tip min-w-[110px] shrink-0 rounded-sm border border-[#d6e0ee] bg-[#fbfcfe] p-2 text-center transition hover:border-[#1d4488] hover:bg-white",
          "data-tip": `view ${u.name}'s profile`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onOpenProfile(u.name),
                className: "mx-auto block rounded-sm border border-[#b5c7e0] bg-white p-0.5",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: u, size: 52 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onOpenProfile(u.name),
                className: "mt-1.5 block w-full truncate text-[11px] font-bold text-[#1d4488] hover:underline",
                children: u.name
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => addFriend(u.id),
                disabled: isPending || isSent,
                className: `orkut-tip mt-1.5 w-full px-1 py-0.5 text-[10px] ${isSent ? "orkut-btn-light" : "orkut-btn-blue"}`,
                "data-tip": isSent ? "request sent" : "send friend request",
                children: isPending ? "sending…" : isSent ? "✓ sent" : "+ add friend"
              }
            )
          ]
        },
        u.id
      );
    }) })
  ] });
}
function OrkutFriendsPanel({
  friends,
  onOpenProfile,
  onFindFriends
}) {
  const [q, setQ] = reactExports.useState("");
  const filtered = friends.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 9);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "my friends (",
        friends.length,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 bg-white p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 rounded-sm border border-[#b5c7e0] bg-[#fbfcfe] px-1.5 py-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3 w-3 text-[#7d8da5]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: q,
            onChange: (e) => setQ(e.target.value),
            placeholder: "search friends",
            className: "w-full bg-transparent py-0.5 text-[11px] outline-none placeholder:text-[#7d8da5]"
          }
        )
      ] }),
      filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-sm border border-dashed border-[#b5c7e0] p-3 text-center text-[10px] italic text-[#5a6b85]", children: friends.length === 0 ? "no friends yet — add some!" : "no matches" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1.5", children: filtered.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onOpenProfile(f.name),
          className: "group flex flex-col items-center gap-1 rounded-sm border border-transparent p-1 text-center hover:border-[#b5c7e0] hover:bg-[#eef3fa]",
          title: f.name,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm border border-[#b5c7e0] bg-white p-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: f, size: 44 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 w-full text-[10px] font-bold text-[#1d4488]", children: f.name })
          ]
        },
        f.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onFindFriends, className: "orkut-btn-light w-full px-2 py-1 text-[11px]", children: "find more friends" })
    ] })
  ] });
}
function OrkutPromotedUsers({
  users,
  onOpenProfile
}) {
  if (users.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card orkut-promoted", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header orkut-header-glossy", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "promoted users" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[9px] font-bold uppercase tracking-wider opacity-90", children: "★ sponsored" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-[#d6e0ee] bg-white", children: users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => onOpenProfile(u.name),
        className: "orkut-tip flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#eef3fa]",
        "data-tip": `visit ${u.name}'s profile`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm border-2 border-[#b5c7e0] bg-white p-0.5 shadow-[0_1px_2px_rgba(29,68,136,0.15)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: u, size: 28 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate text-[11px] font-bold text-[#1d4488]", children: u.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] uppercase tracking-wider text-[#5a6b85]", children: [
              "featured · lvl ",
              u.level ?? 1
            ] })
          ] })
        ]
      }
    ) }, u.id)) })
  ] });
}
const ORKUT_PROMOTED_GROUPS = [
  { name: "Retro Web Lovers", members: "5.2k", emoji: "💾", tag: "nostalgia" },
  { name: "Bollywood Classics", members: "9.1k", emoji: "🎬", tag: "movies" },
  { name: "Late Night Scrappers", members: "1.7k", emoji: "🌙", tag: "chill" }
];
function OrkutPromotedGroups() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card orkut-promoted", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header orkut-header-glossy", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "promoted groups" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[9px] font-bold uppercase tracking-wider opacity-90", children: "★ sponsored" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-[#d6e0ee] bg-white", children: ORKUT_PROMOTED_GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-sm border-2 border-[#b5c7e0] bg-gradient-to-br from-[#eef3fa] to-white text-base shadow-[0_1px_2px_rgba(29,68,136,0.15)]", children: g.emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate text-[11px] font-bold text-[#1d4488]", children: g.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] uppercase tracking-wider text-[#5a6b85]", children: [
          g.tag,
          " · ",
          g.members
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "orkut-btn-blue orkut-tip px-2 py-0.5 text-[10px]",
          "data-tip": `join ${g.name}`,
          children: "join"
        }
      )
    ] }, g.name)) })
  ] });
}
function OrkutTestimonials({
  meId,
  friends,
  onOpenProfile
}) {
  const qc = useQueryClient();
  const list = useServerFn(listTestimonialsForUser);
  const write = useServerFn(writeTestimonial);
  const remove = useServerFn(deleteTestimonial);
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials", meId],
    queryFn: () => list({ data: { targetUserId: meId, limit: 10 } }),
    enabled: !!meId
  });
  const [open, setOpen] = reactExports.useState(false);
  const [targetId, setTargetId] = reactExports.useState("");
  const [body, setBody] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const eligibleTargets = reactExports.useMemo(
    () => friends.filter((f) => f && f.id && f.id !== meId),
    [friends, meId]
  );
  async function submit() {
    if (!targetId) {
      toast.error("Pick a friend to write about");
      return;
    }
    if (body.trim().length < 1) {
      toast.error("Write a few words");
      return;
    }
    setSubmitting(true);
    try {
      await write({ data: { targetUserId: targetId, body: body.trim() } });
      toast.success("Testimonial sent 💖");
      setOpen(false);
      setBody("");
      setTargetId("");
      qc.invalidateQueries({ queryKey: ["testimonials"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send testimonial");
    } finally {
      setSubmitting(false);
    }
  }
  async function onDelete(id) {
    try {
      await remove({ data: { id } });
      qc.invalidateQueries({ queryKey: ["testimonials"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Quote, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "testimonials" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 bg-white p-3 text-[11px]", children: [
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-sm border border-dashed border-[#b5c7e0] p-2 text-center italic text-[#5a6b85]", children: "loading testimonials…" }) : testimonials.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-sm border border-dashed border-[#b5c7e0] p-2 text-center italic text-[#5a6b85]", children: "no testimonials yet. add friends to receive scraps of love." }) : testimonials.map((t) => {
        const author = {
          id: t.author_id,
          name: t.author_username || "friend",
          avatarColor: t.author_avatar_color || "#1d4488",
          status: "offline",
          xp: 0,
          level: 1
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-sm border border-[#d6e0ee] bg-[#fbfcfe] p-2 transition hover:border-[#1d4488] hover:bg-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => t.author_username && onOpenProfile(t.author_username),
                    className: "flex items-center gap-2 text-left",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: author, size: 24 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-[#1d4488]", children: t.author_username || "friend" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => onDelete(t.id),
                    className: "text-[10px] text-[#5a6b85] hover:text-[#c91a4a]",
                    title: "Remove testimonial",
                    children: "✕"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 italic leading-snug text-[#3b4a66]", children: t.body })
            ]
          },
          t.id
        );
      }),
      !open ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            if (eligibleTargets.length === 0) {
              toast.info("Add some friends first to write testimonials about them.");
              return;
            }
            setTargetId(eligibleTargets[0]?.id ?? "");
            setOpen(true);
          },
          className: "orkut-btn-pink w-full px-2 py-1 text-[11px]",
          children: "+ write a testimonial"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-sm border border-[#d6e0ee] bg-[#f5f8fc] p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] font-bold uppercase text-[#1d4488]", children: "About" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: targetId,
            onChange: (e) => setTargetId(e.target.value),
            className: "w-full rounded-sm border border-[#b5c7e0] bg-white px-1 py-1 text-[11px] text-[#1d4488]",
            children: eligibleTargets.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: f.id, children: f.name }, f.id))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: body,
            onChange: (e) => setBody(e.target.value.slice(0, 500)),
            placeholder: "say something nice…",
            rows: 3,
            className: "w-full resize-none rounded-sm border border-[#b5c7e0] bg-white px-2 py-1 text-[11px] text-[#3b4a66] outline-none focus:border-[#1d4488]"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-[#5a6b85]", children: [
            body.length,
            "/500"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                disabled: submitting,
                onClick: () => {
                  setOpen(false);
                  setBody("");
                },
                className: "rounded-sm border border-[#b5c7e0] bg-white px-2 py-1 text-[10px] text-[#1d4488] hover:bg-[#f0f4fa]",
                children: "cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                disabled: submitting,
                onClick: submit,
                className: "orkut-btn-pink px-2 py-1 text-[10px] disabled:opacity-60",
                children: submitting ? "sending…" : "send"
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}
const ORKUT_COMMUNITIES = [
  { name: "Music Lovers", members: "12.4k", emoji: "🎵" },
  { name: "SEO Masters", members: "3.1k", emoji: "🔎" },
  { name: "Movie Club", members: "8.7k", emoji: "🎬" },
  { name: "I love early 2000s internet", members: "2.4k", emoji: "💾" },
  { name: "Scrapbook Artists", members: "920", emoji: "🎨" }
];
function OrkutCommunities() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "top communities" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-[#d6e0ee] bg-white", children: ORKUT_COMMUNITIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-[#b5c7e0] bg-[#eef3fa] text-base", children: c.emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate text-[11px] font-bold text-[#1d4488]", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-[#5a6b85]", children: [
          c.members,
          " members"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "orkut-btn-blue px-2 py-0.5 text-[10px]", children: "join" })
    ] }, c.name)) })
  ] });
}
function OrkutFanCounter({ fans }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", style: { background: "linear-gradient(180deg, #ff85b8, #ff66aa 50%, #e64f93)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "fan counter" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-b from-[#fff0f6] to-white p-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black tabular-nums text-[#d6336c]", children: fans }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase tracking-[0.2em] text-[#7d8da5]", children: "total fans" })
    ] })
  ] });
}
function OrkutMusicScrap() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "orkut-card-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "currently listening" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-white p-3 text-[11px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-[#b5c7e0] bg-gradient-to-br from-[#eef3fa] to-white text-base", children: "🎵" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-bold text-[#1d4488]", children: "Mr. Brightside" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[10px] text-[#5a6b85]", children: "The Killers · 2003" })
      ] })
    ] })
  ] });
}
const ORKUT_CSS = `
.orkut-classic-root {
  font-family: Verdana, Tahoma, Geneva, "DejaVu Sans", Arial, sans-serif;
  background: #e8eef5;
  color: #1d2942;
}
.dark .orkut-classic-root { background: #0f1a2e; color: #e6eaf2; }

.orkut-classic-root .orkut-card {
  background: #ffffff;
  border: 1px solid #b5c7e0;
  border-radius: 4px;
  box-shadow: 0 1px 0 #e6ecf5;
  overflow: hidden;
}
.dark .orkut-classic-root .orkut-card { background: #16223a; border-color: #2a3a5c; box-shadow: 0 1px 0 #0b1426; }

.orkut-classic-root .orkut-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #ffffff;
  background: linear-gradient(180deg, ${ORKUT_BLUE_LIGHT} 0%, ${ORKUT_BLUE} 55%, ${ORKUT_BLUE_DARK} 100%);
  border-bottom: 1px solid ${ORKUT_BLUE_DARK};
  text-shadow: 0 1px 0 rgba(0,0,0,0.2);
}

/* Glossy navbar */
.orkut-classic-root .orkut-navbar {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%),
    linear-gradient(180deg, ${ORKUT_BLUE_LIGHT} 0%, ${ORKUT_BLUE} 55%, ${ORKUT_BLUE_DARK} 100%);
  border-bottom: 1px solid ${ORKUT_BLUE_DARK};
}
.orkut-classic-root .orkut-logo {
  font-family: Verdana, Tahoma, Arial, sans-serif;
  font-weight: 900;
  font-size: 22px;
  letter-spacing: -1px;
  color: #ffffff;
  text-shadow: 0 1px 0 rgba(0,0,0,0.25);
  padding: 0 2px;
}
.orkut-classic-root .orkut-tab {
  border-radius: 3px 3px 0 0;
  font-size: 11px;
}
.orkut-classic-root .orkut-tab:active { transform: translateY(1px); }

/* Buttons — glossy classic */
.orkut-classic-root .orkut-btn-blue {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid ${ORKUT_BLUE_DARK};
  background: linear-gradient(180deg, #6f93cf 0%, ${ORKUT_BLUE_LIGHT} 50%, ${ORKUT_BLUE} 100%);
  color: #ffffff;
  font-weight: 700;
  border-radius: 3px;
  text-shadow: 0 1px 0 rgba(0,0,0,0.2);
  transition: filter 120ms ease, transform 80ms ease;
}
.orkut-classic-root .orkut-btn-blue:hover { filter: brightness(1.08); }
.orkut-classic-root .orkut-btn-blue:active { transform: translateY(1px); filter: brightness(0.95); }
.orkut-classic-root .orkut-btn-blue:disabled { opacity: 0.55; cursor: not-allowed; }

.orkut-classic-root .orkut-btn-light {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #b5c7e0;
  background: linear-gradient(180deg, #ffffff 0%, #eef3fa 100%);
  color: #1d4488;
  font-weight: 700;
  border-radius: 3px;
  transition: background 120ms ease, transform 80ms ease;
}
.orkut-classic-root .orkut-btn-light:hover { background: linear-gradient(180deg, #ffffff 0%, #dfe8f5 100%); }
.orkut-classic-root .orkut-btn-light:active { transform: translateY(1px); }
.orkut-classic-root .orkut-btn-light:disabled { opacity: 0.55; cursor: not-allowed; }

.orkut-classic-root .orkut-btn-pink {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #c0327a;
  background: linear-gradient(180deg, #ff9bc4 0%, ${ORKUT_PINK} 55%, #e64f93 100%);
  color: #ffffff;
  font-weight: 700;
  border-radius: 3px;
  text-shadow: 0 1px 0 rgba(0,0,0,0.2);
  transition: filter 120ms ease, transform 80ms ease;
}
.orkut-classic-root .orkut-btn-pink:hover { filter: brightness(1.06); }
.orkut-classic-root .orkut-btn-pink:active { transform: translateY(1px); }

/* Re-skin nested PostCard to feel like an Orkut scrap */
.orkut-classic-root .orkut-post-wrap > * {
  border-radius: 3px !important;
  border: 1px solid #d6e0ee !important;
  background: #ffffff !important;
  box-shadow: 0 1px 0 #eef3fa !important;
}
.dark .orkut-classic-root .orkut-post-wrap > * {
  background: #16223a !important;
  border-color: #2a3a5c !important;
  box-shadow: 0 1px 0 #0b1426 !important;
}

.orkut-brand { font-weight: 900; color: ${ORKUT_BLUE}; letter-spacing: -0.5px; }

/* Glossy header variant for promoted cards */
.orkut-classic-root .orkut-header-glossy {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 48%),
    linear-gradient(180deg, #ffd76b 0%, #f0a91a 55%, #c87b00 100%);
  color: #4a2d00;
  text-shadow: 0 1px 0 rgba(255,255,255,0.35);
  border-bottom: 1px solid #a86a00;
}
.orkut-classic-root .orkut-promoted {
  border-color: #d0a64a;
  box-shadow: 0 1px 0 #f5e7c2, 0 0 0 1px #fff5d6 inset;
}

/* Classic nostalgic tooltip — yellow note with thin black border */
.orkut-classic-root .orkut-tip { position: relative; }
.orkut-classic-root .orkut-tip[data-tip]::after {
  content: attr(data-tip);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 6px);
  transform: translateX(-50%) translateY(2px);
  background: #fffbcc;
  color: #3b2a00;
  border: 1px solid #806600;
  box-shadow: 1px 1px 0 rgba(0,0,0,0.15);
  font-family: Verdana, Tahoma, Geneva, Arial, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 3px 7px;
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 120ms ease, transform 120ms ease;
  z-index: 60;
}
.orkut-classic-root .orkut-tip[data-tip]::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: calc(100% + 2px);
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #806600;
  opacity: 0;
  transition: opacity 120ms ease;
  z-index: 60;
}
.orkut-classic-root .orkut-tip:hover[data-tip]::after,
.orkut-classic-root .orkut-tip:focus-visible[data-tip]::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.orkut-classic-root .orkut-tip:hover[data-tip]::before,
.orkut-classic-root .orkut-tip:focus-visible[data-tip]::before {
  opacity: 1;
}
`;
const universalSearch = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("821deb39e172443f74404bf648a4be5487d7ac2283f4790c539cc68cf0b44805"));
const AccountPanel = reactExports.lazy(() => import("./AccountPanel-DRbs04As.mjs").then((m) => ({
  default: m.AccountPanel
})));
const ProfilePanel = reactExports.lazy(() => import("./ProfilePanel-BKxvIjh0.mjs").then((m) => ({
  default: m.ProfilePanel
})));
const FeedSettingsPanel = reactExports.lazy(() => import("./FeedSettingsPanel-wsyxN0Jt.mjs").then((m) => ({
  default: m.FeedSettingsPanel
})));
const AchievementsPanel = reactExports.lazy(() => import("./AchievementsPanel-CEEHjovt.mjs").then((m) => ({
  default: m.AchievementsPanel
})));
const LeaderboardPanel = reactExports.lazy(() => import("./LeaderboardPanel-DvjMYfSn.mjs").then((m) => ({
  default: m.LeaderboardPanel
})));
const FindFriendsPanel = reactExports.lazy(() => import("./FindFriendsPanel-HTLZD7Fc.mjs").then((m) => ({
  default: m.FindFriendsPanel
})));
const DailyChestPanel = reactExports.lazy(() => import("./DailyChestPanel-g2VmY512.mjs").then((m) => ({
  default: m.DailyChestPanel
})));
const SpinWheelPanel = reactExports.lazy(() => import("./SpinWheelPanel-DR2C7h4x.mjs").then((m) => ({
  default: m.SpinWheelPanel
})));
const ShopPanel = reactExports.lazy(() => import("./ShopPanel-jh1wJ-qV.mjs").then((m) => ({
  default: m.ShopPanel
})));
const RewardsWidget = reactExports.lazy(() => import("./RewardsWidget-B4Eo70kA.mjs").then((m) => ({
  default: m.RewardsWidget
})));
const FeedDMDock = reactExports.lazy(() => import("./FeedDMDock-omr3YLMU.mjs").then((m) => ({
  default: m.FeedDMDock
})));
const PanelFallback = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-muted-foreground", children: "Loading…" });
function isVisibleFeedTab(tab) {
  return ["foryou", "trending", "latest", "friends", "saved", "notifications"].includes(tab);
}
function normalizePost(row) {
  return {
    id: row.id ?? "",
    author_id: row.author_id ?? "",
    owner_id: row.owner_id ?? row.author_id ?? "",
    kind: row.kind ?? "text",
    text: row.text ?? "",
    slug: row.slug ?? row.id ?? "post",
    media_urls: Array.isArray(row.media_urls) ? row.media_urls : [],
    poll: row.poll ?? null,
    privacy: row.privacy ?? "public",
    is_anonymous: Boolean(row.is_anonymous),
    hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
    reaction_count: row.reaction_count ?? 0,
    comment_count: row.comment_count ?? 0,
    trending_score: row.trending_score ?? 0,
    created_at: row.created_at ?? (/* @__PURE__ */ new Date()).toISOString()
  };
}
function getInitialView() {
  if (typeof window === "undefined") return {
    view: "feed",
    username: ""
  };
  const sp = new URLSearchParams(window.location.search);
  if (sp.get("u")) return {
    view: "profile",
    username: sp.get("u") || ""
  };
  if (sp.get("tab") === "account") return {
    view: "account",
    username: ""
  };
  return {
    view: "feed",
    username: ""
  };
}
function FeedPage() {
  const {
    user
  } = useAuth();
  const {
    openSignIn,
    openSignUp
  } = useAuthGate();
  const {
    profiles
  } = useRemoteProfiles();
  const {
    prefs
  } = useFeedPrefs();
  const {
    savedIds
  } = useSavedPosts();
  const [tab, setTabState] = reactExports.useState(isVisibleFeedTab(prefs.defaultTab) ? prefs.defaultTab : "foryou");
  const initial = getInitialView();
  const [view, setView] = reactExports.useState(initial.view);
  const [profileUsername, setProfileUsername] = reactExports.useState(initial.username);
  const [posts, setPosts] = reactExports.useState([]);
  const [friendIds, setFriendIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [loading, setLoading] = reactExports.useState(true);
  const [dmOpenKey, setDmOpenKey] = reactExports.useState(0);
  const [defaultTabApplied, setDefaultTabApplied] = reactExports.useState(false);
  const [fabOpen, setFabOpen] = reactExports.useState(false);
  const [exploreKey, setExploreKey] = reactExports.useState(0);
  const [query, setQuery] = reactExports.useState("");
  const [searchOpen, setSearchOpen] = reactExports.useState(false);
  const [searchHighlight, setSearchHighlight] = reactExports.useState(0);
  const searchInputRef = reactExports.useRef(null);
  const navigate = useNavigate();
  const mehfilSettings = useMehfilSettings();
  const mehfilLabel = mehfilSettings.module_name || "Poetry Hub";
  const mehfilWidgetEnabled = mehfilSettings.enabled !== false;
  const mehfilWidgetFreq = Math.max(2, Number(mehfilSettings.trending_widget_frequency) || 5);
  const appSettings = useAppSettings();
  const discoveryCfg = reactExports.useMemo(() => mergeDiscoveryWidgetsConfig(appSettings.raw?.discovery_widgets), [appSettings.raw]);
  const runUniversalSearch = useServerFn(universalSearch);
  const [remoteResults, setRemoteResults] = reactExports.useState(null);
  const [remoteLoading, setRemoteLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const raw = query.trim().replace(/^[#@]/, "");
    if (raw.length < 2) {
      setRemoteResults(null);
      return;
    }
    let cancelled = false;
    setRemoteLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await runUniversalSearch({
          data: {
            q: raw,
            limit: 5
          }
        });
        if (!cancelled) setRemoteResults(res);
      } catch {
        if (!cancelled) setRemoteResults(null);
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, runUniversalSearch]);
  const focusComposer = () => {
    setView("feed");
    setTimeout(() => {
      const ta = document.querySelector(`textarea[placeholder^="What’s on your mind"], textarea[placeholder^="What's on your mind"]`);
      ta?.focus();
      ta?.click();
      ta?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 50);
  };
  const meId = user?.id ?? "";
  function setTab(next) {
    setTabState(next);
  }
  reactExports.useEffect(() => {
    if (defaultTabApplied) return;
    setTab(isVisibleFeedTab(prefs.defaultTab) ? prefs.defaultTab : "foryou");
    setDefaultTabApplied(true);
  }, [prefs.defaultTab, defaultTabApplied]);
  reactExports.useEffect(() => {
    if (!meId) return;
    void pingDailyStreak().catch((e) => console.error("streak ping failed", e));
  }, [meId]);
  reactExports.useEffect(() => {
    if (!meId) return;
    async function loadF() {
      const {
        data
      } = await supabase.from("friendships").select("*").eq("status", "accepted").or(`sender_id.eq.${meId},receiver_id.eq.${meId}`);
      const ids = /* @__PURE__ */ new Set();
      (data ?? []).forEach((f) => {
        ids.add(f.sender_id === meId ? f.receiver_id : f.sender_id);
      });
      setFriendIds(ids);
    }
    loadF();
    const ch = supabase.channel(`feed-fr-${meId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "friendships"
    }, () => loadF()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [meId]);
  async function loadPosts() {
    setLoading(true);
    const {
      data
    } = await postsSafe().select("*").is("community_id", null).order("created_at", {
      ascending: false
    }).limit(50);
    setPosts((data ?? []).map(normalizePost));
    setLoading(false);
  }
  reactExports.useEffect(() => {
    loadPosts();
    const ch = supabase.channel("feed-posts").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "posts"
    }, (payload) => {
      const row = payload.new ?? payload.old;
      if (row && row.community_id) return;
      if (payload.eventType === "INSERT") setPosts((p) => [normalizePost(payload.new), ...p]);
      else if (payload.eventType === "DELETE") setPosts((p) => p.filter((x) => x.id !== payload.old.id));
      else if (payload.eventType === "UPDATE") setPosts((p) => p.map((x) => x.id === payload.new.id ? normalizePost(payload.new) : x));
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [meId]);
  const filtered = reactExports.useMemo(() => {
    let list = [...posts];
    if (prefs.hideMedia) {
      list = list.filter((p) => !(p.media_urls && p.media_urls.length > 0));
    }
    if (prefs.mutedKeywords.length > 0) {
      list = list.filter((p) => {
        const t = (p.text || "").toLowerCase();
        return !prefs.mutedKeywords.some((k) => t.includes(k));
      });
    }
    if (prefs.mutedHashtags.length > 0) {
      list = list.filter((p) => {
        const tags = (p.hashtags || []).map((t) => t.toLowerCase());
        return !prefs.mutedHashtags.some((k) => tags.includes(k));
      });
    }
    const effective = prefs.sortOverride !== "smart" ? prefs.sortOverride : tab;
    if (effective === "trending" || tab === "trending") {
      list.sort((a, b) => {
        const sa = a.reaction_count * 2 + a.comment_count * 3;
        const sb2 = b.reaction_count * 2 + b.comment_count * 3;
        return sb2 - sa;
      });
    } else if (effective === "latest" || tab === "latest") {
      list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    } else if (tab === "friends") {
      list = list.filter((p) => friendIds.has(p.owner_id) || p.owner_id === meId);
    } else {
      list.sort((a, b) => {
        const af = friendIds.has(a.owner_id) ? 1 : 0;
        const bf = friendIds.has(b.owner_id) ? 1 : 0;
        if (af !== bf) return bf - af;
        return +new Date(b.created_at) - +new Date(a.created_at);
      });
    }
    const q = query.trim().toLowerCase();
    if (q) {
      const isTag = q.startsWith("#");
      const isUser = q.startsWith("@");
      const needle = isTag || isUser ? q.slice(1) : q;
      list = list.filter((p) => {
        const text = (p.text || "").toLowerCase();
        const tags = (p.hashtags || []).map((t) => t.toLowerCase());
        const author = profiles[p.owner_id]?.name?.toLowerCase() ?? "";
        if (isTag) return tags.some((t) => t.includes(needle));
        if (isUser) return author.includes(needle);
        return text.includes(needle) || tags.some((t) => t.includes(needle)) || author.includes(needle);
      });
    }
    return list;
  }, [posts, tab, friendIds, meId, prefs.hideMedia, prefs.mutedKeywords, prefs.mutedHashtags, prefs.sortOverride, query, profiles]);
  const searchSuggestions = reactExports.useMemo(() => {
    const raw = query.trim();
    if (!raw) return [];
    const tagPool = /* @__PURE__ */ new Map();
    for (const p of posts) {
      for (const t of p.hashtags || []) {
        const k = String(t).toLowerCase().replace(/^#/, "");
        if (k) tagPool.set(k, (tagPool.get(k) ?? 0) + 1);
      }
    }
    const userPool = Object.values(profiles).filter(Boolean);
    const out = [];
    const mode = raw.startsWith("#") ? "hashtag" : raw.startsWith("@") ? "user" : "any";
    const needle = raw.replace(/^[#@]/, "").toLowerCase();
    if (mode === "hashtag" || mode === "any") {
      const tags = Array.from(tagPool.entries()).filter(([t]) => needle ? t.includes(needle) : true).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, n]) => ({
        kind: "hashtag",
        value: `#${t}`,
        label: `#${t}`,
        sub: `${n} post${n === 1 ? "" : "s"}`
      }));
      out.push(...tags);
    }
    if (mode === "user" || mode === "any") {
      const users = userPool.filter((u) => {
        const n = (u.name || "").toLowerCase();
        return needle ? n.includes(needle) : true;
      }).slice(0, 6).map((u) => ({
        kind: "user",
        value: `@${u.name}`,
        label: u.name,
        sub: "Person"
      }));
      out.push(...users);
    }
    return out.slice(0, 8);
  }, [query, posts, profiles]);
  reactExports.useEffect(() => {
    setSearchHighlight(0);
  }, [query]);
  const applySuggestion = (s) => {
    setSearchOpen(false);
    searchInputRef.current?.blur();
    if (s.kind === "user") {
      const uname = s.value.replace(/^@/, "");
      setQuery("");
      setProfileUsername(uname);
      setView("profile");
      return;
    }
    if (s.kind === "hashtag") {
      setQuery(s.value);
      if (view !== "feed") setView("feed");
      const tag = s.value.replace(/^#/, "").toLowerCase();
      const match = posts.find((p) => (p.hashtags || []).some((t) => String(t).toLowerCase().replace(/^#/, "") === tag));
      if (match?.slug && isNavigableSlug(match.slug)) {
        navigate({
          to: "/feed/$slug",
          params: {
            slug: match.slug
          }
        });
        return;
      }
      setTimeout(() => {
        const el = document.querySelector(match ? `[data-feed-post="${match.id}"]` : "[data-feed-post]");
        if (el) {
          el.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
          el.setAttribute("tabindex", "-1");
          el.focus({
            preventScroll: true
          });
          el.classList.add("ring-2", "ring-primary");
          setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 1600);
        }
      }, 80);
      return;
    }
    setQuery(s.value);
    if (view !== "feed") setView("feed");
  };
  const displayUsername = user?.username ?? "";
  const TABS = [{
    id: "foryou",
    label: "For You",
    icon: Sparkles
  }, {
    id: "trending",
    label: "Trending",
    icon: Flame
  }, {
    id: "latest",
    label: "Latest",
    icon: Clock
  }, {
    id: "friends",
    label: "Friends",
    icon: Users
  }];
  const leftRailRef = reactExports.useRef(null);
  const rightRailRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const HEADER = 64;
    const GAP = 8;
    let lastY = window.scrollY;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      const dir = y > lastY ? "down" : y < lastY ? "up" : null;
      const vh = window.innerHeight;
      for (const el of [leftRailRef.current, rightRailRef.current]) {
        if (!el) continue;
        const parent = el.parentElement;
        if (!parent) continue;
        const h = el.offsetHeight;
        const fits = h + HEADER + GAP <= vh;
        if (fits) {
          el.style.position = "sticky";
          el.style.top = `${HEADER + GAP}px`;
          el.style.transform = "";
          continue;
        }
        const parentRect = parent.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const currentOffset = elRect.top - parentRect.top;
        if (dir === "down") {
          const desiredTopVp = vh - h - GAP;
          const targetOffset = desiredTopVp - parentRect.top;
          HEADER + GAP - parentRect.top;
          const offset = Math.max(currentOffset, Math.min(targetOffset, parent.offsetHeight - h));
          if (elRect.bottom <= vh + 0.5) {
            el.style.position = "sticky";
            el.style.top = `${vh - h - GAP}px`;
            el.style.transform = "";
          } else {
            el.style.position = "relative";
            el.style.top = "0";
            el.style.transform = `translateY(${Math.max(0, Math.min(offset, parent.offsetHeight - h))}px)`;
          }
        } else if (dir === "up") {
          if (elRect.top >= HEADER + GAP - 0.5) {
            el.style.position = "sticky";
            el.style.top = `${HEADER + GAP}px`;
            el.style.transform = "";
          } else {
            el.style.position = "relative";
            el.style.top = "0";
            el.style.transform = `translateY(${Math.max(0, currentOffset)}px)`;
          }
        }
      }
      lastY = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll);
    apply();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [view, tab]);
  const {
    theme: feedTheme,
    refresh: refreshFeedTheme
  } = useActiveFeedTheme();
  const [themeStoreOpen, setThemeStoreOpen] = reactExports.useState(false);
  if (feedTheme === "orkut_retro" && user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-feed-theme": feedTheme, "data-theme-variant": feedVariantFor(feedTheme), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeedThemeStore, { open: themeStoreOpen, onOpenChange: setThemeStoreOpen, activeTheme: feedTheme, onThemeChange: refreshFeedTheme }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OrkutFeedLayout, { meId, user: {
        username: displayUsername
      }, profiles, posts: filtered, friendIds, loading, onReload: loadPosts, onOpenThemeStore: () => setThemeStoreOpen(true), onOpenAccount: () => setView("account"), onOpenProfile: (uname) => {
        setProfileUsername(uname);
        setView("profile");
      }, onOpenFindFriends: () => setView("findFriends"), onOpenMessages: () => setDmOpenKey((k) => k + 1), headerSlot: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutSwitcher, { activeTheme: feedTheme, onChanged: refreshFeedTheme, onNeedsUnlock: () => setThemeStoreOpen(true), variant: "orkut" }) }),
      dmOpenKey > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedDMDock, { meId, profiles, initialOpen: true }, dmOpenKey) }),
      view !== "feed" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[80] overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl rounded-2xl bg-background text-foreground shadow-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold capitalize", children: view }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("feed"), className: "rounded-md border px-3 py-1 text-xs font-semibold hover:bg-muted", children: "Close" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: [
          view === "account" && /* @__PURE__ */ jsxRuntimeExports.jsx(AccountPanel, {}),
          view === "profile" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePanel, { username: profileUsername, onBack: () => setView("feed") }),
          view === "findFriends" && /* @__PURE__ */ jsxRuntimeExports.jsx(FindFriendsPanel, {}),
          view === "achievements" && /* @__PURE__ */ jsxRuntimeExports.jsx(AchievementsPanel, {}),
          view === "leaderboard" && /* @__PURE__ */ jsxRuntimeExports.jsx(LeaderboardPanel, {}),
          view === "settings" && /* @__PURE__ */ jsxRuntimeExports.jsx(FeedSettingsPanel, {}),
          view === "dailyChest" && /* @__PURE__ */ jsxRuntimeExports.jsx(DailyChestPanel, { onBack: () => setView("feed") }),
          view === "spin" && /* @__PURE__ */ jsxRuntimeExports.jsx(SpinWheelPanel, { onBack: () => setView("feed") }),
          view === "shop" && /* @__PURE__ */ jsxRuntimeExports.jsx(ShopPanel, { onBack: () => setView("feed"), onOpenThemes: () => setThemeStoreOpen(true) })
        ] }) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-feed-theme": feedTheme, "data-theme-variant": feedVariantFor(feedTheme), className: "min-h-screen overflow-x-hidden bg-background text-foreground pb-24 lg:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FeedThemeStore, { open: themeStoreOpen, onOpenChange: setThemeStoreOpen, activeTheme: feedTheme, onThemeChange: refreshFeedTheme }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 feed-glass border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1360px] items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed", className: "flex items-center gap-2 text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl [&_img]:!h-9 [&_img]:!w-9 [&_img]:!max-h-9 [&_img]:!max-w-9 [&_img]:object-contain", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { slot: "feed", alt: "Logo", className: "h-9 w-9 rounded-xl object-contain", fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold shadow-[0_4px_14px_-4px_var(--primary-glow)]", children: "P" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BrandText, { slot: "feed", defaultText: "Feed", className: "hidden text-[17px] font-bold tracking-tight sm:inline" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto hidden w-full max-w-md md:block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm ring-1 ring-border focus-within:ring-primary/40 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "🔎" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: searchInputRef, type: "text", value: query, onChange: (e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
            if (view !== "feed") setView("feed");
          }, onFocus: () => setSearchOpen(true), onBlur: () => setTimeout(() => setSearchOpen(false), 120), onKeyDown: (e) => {
            const open = searchOpen && searchSuggestions.length > 0;
            if (e.key === "Escape") {
              e.preventDefault();
              if (query) setQuery("");
              setSearchOpen(false);
              searchInputRef.current?.blur();
            } else if (e.key === "ArrowDown" && open) {
              e.preventDefault();
              setSearchHighlight((i) => (i + 1) % searchSuggestions.length);
            } else if (e.key === "ArrowUp" && open) {
              e.preventDefault();
              setSearchHighlight((i) => (i - 1 + searchSuggestions.length) % searchSuggestions.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (open) {
                applySuggestion(searchSuggestions[searchHighlight] ?? searchSuggestions[0]);
              } else {
                setSearchOpen(false);
                if (view !== "feed") setView("feed");
                searchInputRef.current?.blur();
              }
            }
          }, placeholder: "Search posts, people, hashtags…", "aria-label": "Search feed", "aria-autocomplete": "list", "aria-expanded": searchOpen && searchSuggestions.length > 0, "aria-controls": "feed-search-suggestions", "aria-activedescendant": searchOpen && searchSuggestions.length > 0 ? `feed-search-opt-${searchHighlight}` : void 0, role: "combobox", className: "flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground" }),
          query && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onMouseDown: (e) => {
            e.preventDefault();
            setQuery("");
            searchInputRef.current?.focus();
          }, className: "text-muted-foreground hover:text-foreground", "aria-label": "Clear search", type: "button", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] }),
        (() => {
          const sources = remoteResults?.sources ?? {
            users: true
          };
          const usersOn = sources.users !== false;
          const localSuggestions = usersOn ? searchSuggestions : [];
          const poems = remoteResults?.poems ?? [];
          const battles = remoteResults?.battles ?? [];
          const cats = remoteResults?.categories ?? [];
          const hof = remoteResults?.hof ?? [];
          const totalRemote = poems.length + battles.length + cats.length + hof.length;
          const show = searchOpen && (localSuggestions.length > 0 || totalRemote > 0 || remoteLoading);
          if (!show) return null;
          const fmtRemaining = (iso) => {
            if (!iso) return null;
            const diff = new Date(iso).getTime() - Date.now();
            if (diff <= 0) return "ended";
            const h = Math.floor(diff / 36e5);
            if (h < 1) return `${Math.max(1, Math.floor(diff / 6e4))}m left`;
            if (h < 48) return `${h}h left`;
            return `${Math.floor(h / 24)}d left`;
          };
          const Section = ({
            title,
            children
          }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 pt-2 first:pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: title }),
            children
          ] });
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "feed-search-suggestions", role: "listbox", className: "absolute left-0 right-0 top-full z-40 mt-2 max-h-[28rem] overflow-auto rounded-2xl border border-border bg-popover p-1 text-sm shadow-[var(--shadow-soft-3,0_10px_30px_-10px_rgba(0,0,0,0.25))]", children: [
            localSuggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Users", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: localSuggestions.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { id: `feed-search-opt-${i}`, role: "option", "aria-selected": i === searchHighlight, onMouseDown: (e) => {
              e.preventDefault();
              applySuggestion(s);
            }, onMouseEnter: () => setSearchHighlight(i), className: `flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 transition ${i === searchHighlight ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 truncate", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${s.kind === "hashtag" ? "bg-primary/15 text-primary" : "bg-secondary text-secondary-foreground"}`, children: s.kind === "hashtag" ? "#" : "@" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: s.label })
              ] }),
              s.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: s.sub })
            ] }, `${s.kind}-${s.value}`)) }) }),
            poems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Poems", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: poems.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { onMouseDown: (e) => {
              e.preventDefault();
              setSearchOpen(false);
              setQuery("");
              if (isNavigableSlug(p.slug)) navigate({
                to: "/poetry/$slug",
                params: {
                  slug: p.slug
                }
              });
            }, className: "flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-accent/50", children: [
              p.author?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.author.avatar_url, alt: "", className: "mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary", children: (p.author?.name ?? "P").slice(0, 1).toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium text-foreground", children: p.author?.name ?? "Poet" }),
                  p.author?.writer_rank && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary", children: p.author.writer_rank.replace(/_/g, " ") }),
                  p.category && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                    "· ",
                    p.category.name
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate font-semibold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                    "🌹 ",
                    p.title
                  ] }),
                  p.is_battle && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold text-orange-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-2.5 w-2.5" }),
                    " Battle"
                  ] }),
                  p.is_trending && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-bold text-rose-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-2.5 w-2.5" }),
                    " Trending"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: p.preview }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3" }),
                    " ",
                    p.upvotes
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
                    " ",
                    p.reads
                  ] })
                ] })
              ] })
            ] }, `poem-${p.id}`)) }) }),
            battles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Battles", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: battles.map((b) => {
              const remaining = fmtRemaining(b.end_at);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { onMouseDown: (e) => {
                e.preventDefault();
                setSearchOpen(false);
                setQuery("");
                if (isNavigableSlug(b.slug)) navigate({
                  to: "/competitions/$slug",
                  params: {
                    slug: b.slug
                  }
                });
              }, className: "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/15 text-orange-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate font-semibold", children: [
                    "⚔ ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: b.name })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase", children: b.status }),
                    remaining && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: remaining }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "· ",
                      b.participants,
                      " entries"
                    ] }),
                    b.prize && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "· 🏅 ",
                      b.prize
                    ] })
                  ] })
                ] })
              ] }, `battle-${b.id}`);
            }) }) }),
            cats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Categories", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: cats.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { onMouseDown: (e) => {
              e.preventDefault();
              setSearchOpen(false);
              setQuery("");
              if (isNavigableSlug(c.slug)) navigate({
                to: "/poetry/category/$slug",
                params: {
                  slug: c.slug
                }
              });
            }, className: "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-sm", children: "📚" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate font-semibold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: c.name }),
                  c.is_trending && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-bold text-rose-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-2.5 w-2.5" }),
                    " Trending"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                  c.poem_count,
                  " poem",
                  c.poem_count === 1 ? "" : "s"
                ] })
              ] })
            ] }, `cat-${c.id}`)) }) }),
            hof.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Hall of Fame", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: hof.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { onMouseDown: (e) => {
              e.preventDefault();
              setSearchOpen(false);
              setQuery("");
              if (isNavigableSlug(h.poem_slug)) navigate({
                to: "/poetry/$slug",
                params: {
                  slug: h.poem_slug
                }
              });
            }, className: "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-600 text-sm", children: "🏆" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-semibold", children: h.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                  "Rank #",
                  h.rank,
                  " · ",
                  h.period
                ] })
              ] })
            ] }, `hof-${h.id}`)) }) }),
            remoteLoading && totalRemote === 0 && localSuggestions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-4 text-center text-xs text-muted-foreground", children: "Searching…" })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center gap-1.5", children: user ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FeedNotifications, { meId, profiles }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDmOpenKey((k) => k + 1), className: "grid h-9 w-9 place-items-center rounded-full hover:bg-accent/30 transition", title: "Messages", "aria-label": "Messages", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5 text-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserMenu, { username: displayUsername, onProfile: () => {
          setProfileUsername(displayUsername);
          setView("profile");
        }, onSettings: () => setView("account") })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: openSignIn, className: "rounded-full px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-accent/30", children: "Sign in" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: openSignUp, className: "rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90", children: "Create account" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-[1360px] gap-4 px-2 py-4 sm:px-4 lg:grid-cols-[260px_minmax(0,1fr)_320px] lg:gap-6 lg:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: leftRailRef, className: "space-y-3 pr-1 will-change-transform", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "feed-card p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-section-label", children: "Feed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { active: view === "feed" && tab === "foryou", onClick: () => {
            setView("feed");
            setTab("foryou");
          }, icon: Newspaper, label: "For You", color: "text-sky-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { active: view === "feed" && tab === "trending", onClick: () => {
            setView("feed");
            setTab("trending");
          }, icon: Flame, label: "Trending", color: "text-orange-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { active: view === "feed" && tab === "friends", onClick: () => {
            setView("feed");
            setTab("friends");
          }, icon: Users, label: "Friends", color: "text-emerald-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { active: view === "feed" && tab === "saved", onClick: () => {
            setView("feed");
            setTab("saved");
          }, icon: Bookmark, label: "Saved", color: "text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { active: view === "feed" && tab === "notifications", onClick: () => {
            setView("feed");
            setTab("notifications");
          }, icon: Bell, label: "Notifications", color: "text-rose-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-section-label", children: "Create" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { onClick: () => {
            setView("feed");
            setTimeout(() => {
              const el = document.getElementById("story-tray");
              if (el) el.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
              const addBtn = document.querySelector("[data-story-add]");
              addBtn?.click();
            }, 50);
          }, icon: CirclePlus, label: "Add Story", color: "text-fuchsia-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { onClick: () => {
            setView("feed");
            setTimeout(() => {
              const el = document.getElementById("story-tray");
              if (el) el.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
            }, 50);
          }, icon: Sparkles, label: "Stories", color: "text-violet-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-section-label", children: "Explore" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideLink, { to: "/chatroom", iconSrc: chatroomIcon, label: "Chatrooms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideNavLink, { to: "/hall-of-fame", icon: Crown, label: "Hall of Fame", color: "text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideNavLink, { to: "/communities", icon: Globe, label: "Communities", color: "text-emerald-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideNavLink, { to: "/feedback", icon: MessageSquare, label: "Community Forum", color: "text-blue-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideNavLink, { to: "/poetry", icon: PenLine, label: mehfilLabel, color: "text-fuchsia-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideNavLink, { to: "/reels", icon: Film, label: "Reels", badge: "Soon", color: "text-pink-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideNavLink, { to: "/pages", icon: FileText, label: "Pages", badge: "Soon", color: "text-cyan-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideNavLink, { to: "/groups", icon: UsersRound, label: "Groups", badge: "Soon", color: "text-indigo-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { onClick: () => setView("findFriends"), active: view === "findFriends", icon: Users, label: "Find Friends", color: "text-teal-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-section-label", children: "Rewards" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { onClick: () => setView("achievements"), active: view === "achievements", icon: Award, label: "Achievements", color: "text-yellow-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { onClick: () => setView("leaderboard"), active: view === "leaderboard", icon: Trophy, label: "Leaderboard", color: "text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideNavLink, { to: "/competitions", icon: Trophy, label: "Competitions", color: "text-amber-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideNavLink, { to: "/battle-hub", icon: Radio, label: "Battle Hub", color: "text-rose-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { onClick: () => setView("dailyChest"), active: view === "dailyChest", icon: Gift, label: "Daily Chest", color: "text-rose-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { onClick: () => setView("spin"), active: view === "spin", icon: Sparkles, label: "Daily Spin", color: "text-violet-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SideItem, { onClick: () => setView("shop"), active: view === "shop", icon: Coins, label: "Shop", color: "text-emerald-400" })
        ] }),
        meId && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(RewardsWidgetSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RewardsWidget, { meId, onOpenChest: () => setView("dailyChest"), onOpenSpin: () => setView("spin"), onOpenShop: () => setView("shop") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FriendsListCard, { friendIds, profiles, onChat: () => setDmOpenKey((k) => k + 1) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-w-0 mx-auto w-full max-w-[680px]", children: view === "account" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountPanel, {}) }) }) : view === "settings" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedSettingsPanel, {}) }) }) : view === "achievements" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(AchievementsPanel, {}) }) }) : view === "leaderboard" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(LeaderboardPanel, {}) }) }) : view === "findFriends" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FindFriendsPanel, {}) }) }) : view === "dailyChest" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DailyChestPanel, { onBack: () => setView("feed") }) }) }) : view === "spin" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SpinWheelPanel, { onBack: () => setView("feed") }) }) }) : view === "shop" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShopPanel, { onBack: () => setView("feed"), onOpenThemes: () => setThemeStoreOpen(true) }) }) }) : view === "profile" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePanel, { username: profileUsername, onBack: () => setView("feed") }) }) }) : view === "explore" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PullToRefresh, { onRefresh: async () => {
        setExploreKey((k) => k + 1);
        await new Promise((r) => setTimeout(r, 450));
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-lg font-black tracking-tight", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "h-5 w-5 text-primary" }),
            " Explore"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            "Discover people, groups and trending communities.",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 hidden sm:inline", children: "Pull down to refresh." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FriendsWidget, { meId, profiles }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeaturedMembersWidget, { meId, profiles }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PromotedPostsWidget, { profiles }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestedGroupsWidget, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingCommunitiesWidget, {})
        ] }, exploreKey)
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        meId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 space-y-3 lg:hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(RewardsWidgetSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RewardsWidget, { meId, onOpenChest: () => setView("dailyChest"), onOpenSpin: () => setView("spin"), onOpenShop: () => setView("shop") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DailyChallengesWidget, { meId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BroadcasterTicker, { target: "feed", className: "mb-3 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StoryTray, {}),
        meId ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Composer, { authorId: meId, onPosted: loadPosts }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SignInToPostCard, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex gap-1 overflow-x-auto rounded-full feed-card p-1.5 feed-scrollbar-hide", children: TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab(t.id), className: `feed-pill-tab flex-1 ${active ? "feed-pill-tab-active" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
            " ",
            t.label
          ] }, t.id);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-4", children: tab === "saved" ? (() => {
          const savedPosts = savedIds.map((id) => posts.find((p) => p.id === id)).filter((p) => !!p);
          if (savedPosts.length === 0) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-card p-10 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "mx-auto h-10 w-10 text-muted-foreground/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-base font-semibold", children: "No saved posts yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Tap the bookmark icon on any post to save it here." })
            ] });
          }
          return savedPosts.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-feed-post": post.id, className: "rounded-3xl transition-shadow outline-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post, profiles, meId }) }, post.id));
        })() : tab === "notifications" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-card p-10 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "mx-auto h-10 w-10 text-muted-foreground/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-base font-semibold", children: "Notifications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Tap the bell in the top bar to view your latest activity." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          loading && Array.from({
            length: 3
          }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostSkeleton, {}, i)),
          !loading && filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-card p-10 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No posts yet. Be the first to share something!" }) }),
          !loading && filtered.map((post, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "contents", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-feed-post": post.id, className: "rounded-3xl transition-shadow outline-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post, profiles, meId }) }),
            idx === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PromotedPostsWidget, { profiles }) }),
            mehfilWidgetEnabled && idx > 0 && (idx + 1) % mehfilWidgetFreq === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(MehfilTrendingWidget, {}),
            discoveryCfg.enabled && idx > 0 && (idx + 1) % discoveryCfg.insertEvery === 0 && (idx + 1) % mehfilWidgetFreq !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ModuleDiscoveryWidget, { slotIndex: Math.floor((idx + 1) / discoveryCfg.insertEvery) }),
            idx === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestedGroupsWidget, {}) }),
            idx === 6 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityActivityWidget, { meId, profiles }) }),
            idx === 8 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingCommunitiesWidget, {}) }),
            idx === 11 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeaturedMembersWidget, { meId, profiles }) }),
            idx === 14 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActivePollsWidget, {}) }),
            idx === 17 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FriendsWidget, { meId, profiles }) })
          ] }, post.id)),
          !loading && filtered.length > 0 && filtered.length <= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 lg:hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PromotedPostsWidget, { profiles }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestedGroupsWidget, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityActivityWidget, { meId, profiles }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingCommunitiesWidget, {})
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: rightRailRef, className: "space-y-4 pl-1 will-change-transform", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RailSection, { label: "For you", tone: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoobubbleAssistantWidget, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MissionsPanel, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DailyChallengesWidget, { meId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RailSection, { label: "Community", tone: "sky" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FeaturedMembersWidget, { meId, profiles }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityActivityWidget, { meId, profiles }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingCommunitiesWidget, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RailSection, { label: "Discover", tone: "amber" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PromotedPostsWidget, { profiles }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestedGroupsWidget, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActivePollsWidget, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ConfessionsFeedWidget, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BirthdaysWidget, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FriendsWidget, { meId, profiles }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(HashtagsWidget, {})
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "fixed bottom-0 left-0 right-0 z-30 flex items-end feed-glass border-t border-border lg:hidden pb-[env(safe-area-inset-bottom)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setView("feed"), className: `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${view === "feed" ? "text-primary" : "text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5" }),
        " Feed"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/chatroom", className: "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: chatroomIcon, alt: "Chatrooms", className: "h-5 w-5 rounded-full bg-white object-contain p-0.5" }),
        " Rooms"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setView("feed");
        setTimeout(() => {
          const ta = document.querySelector(`textarea[placeholder^="What’s on your mind"], textarea[placeholder^="What's on your mind"]`);
          ta?.focus();
          ta?.click();
          ta?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }, 50);
      }, "aria-label": "Create post", className: "-mt-6 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_10px_24px_-8px_var(--primary-glow,theme(colors.primary.DEFAULT))] ring-4 ring-background transition-transform active:scale-95", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-7 w-7", strokeWidth: 2.5 }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setView("explore"), className: `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${view === "explore" ? "text-primary" : "text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "h-5 w-5" }),
        " Explore"
      ] }),
      user ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        setProfileUsername(displayUsername);
        setView("profile");
      }, className: `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${view === "profile" ? "text-primary" : "text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUser, { className: "h-5 w-5" }),
        " Me"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: openSignIn, className: "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUser, { className: "h-5 w-5" }),
        " Sign in"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileSpeedDial, { open: fabOpen, onToggle: () => setFabOpen((o) => !o), onClose: () => setFabOpen(false), actions: [{
      label: "Add Story",
      icon: CirclePlus,
      color: "from-fuchsia-500 to-pink-500",
      onClick: () => {
        setView("feed");
        setTimeout(() => {
          document.getElementById("story-tray")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
          document.querySelector("[data-story-add]")?.click();
        }, 60);
      }
    }, {
      label: "Find Friends",
      icon: UserPlus,
      color: "from-teal-500 to-emerald-500",
      onClick: () => setView("findFriends")
    }, {
      label: "Messages",
      icon: MessageCircle,
      color: "from-sky-500 to-indigo-500",
      onClick: () => setDmOpenKey((k) => k + 1)
    }, {
      label: "Notifications",
      icon: Bell,
      color: "from-rose-500 to-red-500",
      onClick: () => {
        setView("feed");
        setTab("notifications");
      }
    }, {
      label: "Hall of Fame",
      icon: Crown,
      color: "from-amber-500 to-yellow-500",
      onClick: () => navigate({
        to: "/hall-of-fame"
      })
    }, {
      label: "Achievements",
      icon: Award,
      color: "from-yellow-500 to-amber-500",
      onClick: () => setView("achievements")
    }, {
      label: "Leaderboard",
      icon: Trophy,
      color: "from-amber-500 to-orange-500",
      onClick: () => setView("leaderboard")
    }, {
      label: "Competitions",
      icon: Trophy,
      color: "from-amber-400 to-yellow-500",
      onClick: () => navigate({
        to: "/competitions"
      })
    }, {
      label: "Battle Hub",
      icon: Radio,
      color: "from-rose-500 to-red-500",
      onClick: () => navigate({
        to: "/battle-hub"
      })
    }, {
      label: mehfilLabel,
      icon: PenLine,
      color: "from-fuchsia-500 to-purple-500",
      onClick: () => navigate({
        to: "/poetry"
      })
    }, {
      label: "Communities",
      icon: Globe,
      color: "from-emerald-500 to-teal-500",
      onClick: () => navigate({
        to: "/communities"
      })
    }, {
      label: "Daily Chest",
      icon: Gift,
      color: "from-rose-500 to-fuchsia-500",
      onClick: () => setView("dailyChest")
    }, {
      label: "Daily Spin",
      icon: Sparkles,
      color: "from-violet-500 to-purple-500",
      onClick: () => setView("spin")
    }, {
      label: "Shop",
      icon: Coins,
      color: "from-emerald-500 to-green-500",
      onClick: () => setView("shop")
    }, {
      label: "Feedback",
      icon: MessageSquare,
      color: "from-blue-500 to-indigo-500",
      onClick: () => navigate({
        to: "/feedback"
      })
    }, {
      label: "Report a Bug",
      icon: Bug,
      color: "from-rose-500 to-red-600",
      onClick: () => navigate({
        to: "/feedback",
        search: {
          type: "bug"
        }
      })
    }], extraActions: [{
      label: "Create Post",
      icon: Plus,
      color: "from-primary to-primary/70",
      onClick: focusComposer
    }, {
      label: "Public Chat",
      icon: Users,
      color: "from-sky-500 to-cyan-500",
      onClick: () => navigate({
        to: "/chatroom"
      })
    }, {
      label: "Private Chat",
      icon: MessageCircle,
      color: "from-indigo-500 to-violet-500",
      onClick: () => setDmOpenKey((k) => k + 1)
    }, {
      label: "Hall of Fame",
      icon: Crown,
      color: "from-amber-500 to-yellow-500",
      onClick: () => navigate({
        to: "/hall-of-fame"
      })
    }, {
      label: "Communities",
      icon: Globe,
      color: "from-emerald-500 to-teal-500",
      onClick: () => navigate({
        to: "/communities"
      })
    }, {
      label: "Feedback",
      icon: MessageSquare,
      color: "from-blue-500 to-indigo-500",
      onClick: () => navigate({
        to: "/feedback"
      })
    }, {
      label: "Report a Bug",
      icon: Bug,
      color: "from-rose-500 to-red-600",
      onClick: () => navigate({
        to: "/feedback",
        search: {
          type: "bug"
        }
      })
    }] }),
    dmOpenKey > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedDMDock, { meId, profiles, initialOpen: true }, dmOpenKey) })
  ] });
}
function FriendsListCard({
  friendIds,
  profiles,
  onChat
}) {
  const {
    startDM
  } = useChat();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatErrorBoundary, { label: "feed-friends-dm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FriendsListCardInner, { friendIds, profiles, onChat, startDM }) });
}
function FriendsListCardInner({
  friendIds,
  profiles,
  onChat,
  startDM
}) {
  const list = Array.from(friendIds).map((id) => profiles[id]).filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card p-3 shadow-sm border border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
      "Friends (",
      list.length,
      ")"
    ] }),
    list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 py-2 text-xs text-muted-foreground", children: "No friends yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5", children: list.slice(0, 8).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
      const targetId = resolveDmTargetId(u.id, profiles);
      if (!targetId) return;
      startDM(targetId);
      onChat();
    }, className: "flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-accent", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: u, size: 28 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-sm", children: u.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2 w-2 rounded-full ${u.status === "online" ? "bg-green-500" : "bg-muted-foreground/40"}` })
    ] }, u.id)) })
  ] });
}
function SideItem({
  icon: Icon,
  label,
  active,
  onClick,
  color
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: `feed-side-item ${active ? "feed-side-item-active" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `feed-icon-chip ${color ?? "text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: label })
  ] });
}
function SideLink({
  to,
  iconSrc,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "feed-side-item", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-icon-chip text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: iconSrc, alt: "", className: "h-4 w-4 rounded-full bg-white object-contain p-0.5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: label })
  ] });
}
function SideNavLink({
  to,
  icon: Icon,
  label,
  badge,
  color
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "feed-side-item", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `feed-icon-chip ${color ?? "text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: label }),
    badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary", children: badge })
  ] });
}
function UserMenu({
  username,
  onProfile,
  onSettings
}) {
  const {
    mode,
    setMode
  } = useThemeMode();
  const {
    isAdmin
  } = useMyRoles();
  const isDark = mode === "dark";
  const [open, setOpen] = reactExports.useState(false);
  const close = () => setOpen(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-accent/30 transition", title: "Account", "aria-label": "Account menu", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm font-bold ring-2 ring-card", children: username.slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden text-sm font-semibold sm:inline", children: username })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { align: "end", className: "w-60 p-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        close();
        onProfile();
      }, className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUser, { className: "h-4 w-4 text-primary" }),
        " My Profile"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        close();
        onSettings();
      }, className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 text-slate-400" }),
        " Settings"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setMode(isDark ? "light" : "dark"), className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition", children: [
        isDark ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4 text-amber-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4 text-indigo-400" }),
        isDark ? "Light mode" : "Dark mode"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, { variant: "compact" }) }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/admin", target: "_blank", rel: "noopener noreferrer", onClick: close, className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-rose-400" }),
        " Admin Panel"
      ] })
    ] })
  ] });
}
function RailSection({
  label,
  tone
}) {
  const toneClass = {
    primary: "from-primary/80 to-primary/0",
    sky: "from-sky-400/80 to-sky-400/0",
    amber: "from-amber-400/80 to-amber-400/0"
  }[tone];
  const dot = {
    primary: "bg-primary",
    sky: "bg-sky-400",
    amber: "bg-amber-400"
  }[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-1 pt-1 first:pt-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-1.5 w-1.5 rounded-full ${dot} shadow-[0_0_8px_currentColor]`, "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/80", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-px flex-1 bg-gradient-to-r ${toneClass}`, "aria-hidden": true })
  ] });
}
function MobileSpeedDial({
  open,
  onToggle,
  onClose,
  actions,
  extraActions = []
}) {
  const [mode, setMode] = reactExports.useState("primary");
  const longPressFired = reactExports.useRef(false);
  const timerRef = reactExports.useRef(null);
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const startPress = () => {
    longPressFired.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      longPressFired.current = true;
      setMode("extra");
      if (!open) onToggle();
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.(15);
        } catch {
        }
      }
    }, 450);
  };
  const endPress = () => clearTimer();
  const handleClick = () => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (open && mode === "extra") {
      setMode("primary");
      return;
    }
    setMode("primary");
    onToggle();
  };
  const closeAll = () => {
    setMode("primary");
    onClose();
  };
  const list = mode === "extra" ? extraActions : actions;
  const showingExtra = mode === "extra" && open;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:hidden", children: [
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Close menu", onClick: closeAll, className: "fixed inset-0 z-[55] bg-background/60 backdrop-blur-sm animate-in fade-in duration-200" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `fixed left-3 z-[58] flex flex-col-reverse items-start gap-2 transition-all duration-200 ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"}`, style: {
      bottom: "calc(7.5rem + env(safe-area-inset-bottom))"
    }, children: [
      showingExtra && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-1 mb-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary", children: "Quick Shortcuts" }),
      list.map((a, i) => {
        const Icon = a.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          a.onClick();
          closeAll();
        }, style: {
          transitionDelay: open ? `${i * 25}ms` : "0ms"
        }, className: "group flex items-center gap-2.5 rounded-full border border-border bg-card/95 pl-2 pr-4 py-1.5 shadow-lg backdrop-blur transition-all hover:scale-[1.03] active:scale-95", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${a.color} text-white shadow-md`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4.5 w-4.5", strokeWidth: 2.25 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground whitespace-nowrap", children: a.label })
        ] }, a.label);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleClick, onPointerDown: startPress, onPointerUp: endPress, onPointerLeave: endPress, onPointerCancel: endPress, onContextMenu: (e) => e.preventDefault(), "aria-label": open ? "Close quick menu" : "Open quick menu (long-press for shortcuts)", "aria-expanded": open, className: `fixed left-4 z-[60] grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${showingExtra ? "from-fuchsia-500 to-violet-500" : "from-primary to-primary/70"} text-primary-foreground shadow-[0_10px_24px_-8px_var(--primary-glow)] ring-4 ring-background transition-all active:scale-90 select-none touch-none`, style: {
      bottom: "calc(5.5rem + env(safe-area-inset-bottom))"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `transition-transform duration-200 ${open ? "rotate-90" : ""}`, children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5", strokeWidth: 2.5 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5", strokeWidth: 2.5 }) }) })
  ] });
}
function LayoutSwitcher({
  activeTheme,
  onChanged,
  onNeedsUnlock,
  variant = "default"
}) {
  const isOrkut = activeTheme === "orkut_retro";
  const [orkutName, setOrkutName] = reactExports.useState("Orkut");
  reactExports.useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => feedThemes).then(({
      listFeedThemes: listFeedThemes2
    }) => {
      listFeedThemes2().then((rows) => {
        if (cancelled) return;
        const row = rows.find((r) => r.theme_key === "orkut_retro");
        if (row?.name) setOrkutName(row.name);
      }).catch(() => {
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const switchTo = async (key) => {
    if (key === activeTheme) return;
    try {
      await activateFeedTheme(key);
      onChanged();
    } catch {
      onNeedsUnlock();
    }
  };
  const baseBtn = "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition";
  const wrap = variant === "orkut" ? "hidden md:inline-flex items-center rounded-md bg-white/15 p-0.5 text-white" : "hidden md:inline-flex items-center rounded-full bg-muted p-0.5 mr-1";
  const activeCls = variant === "orkut" ? "bg-white text-[#9333ea] rounded" : "bg-card text-foreground rounded-full shadow-sm";
  const idleCls = variant === "orkut" ? "text-white/85 hover:text-white rounded" : "text-muted-foreground hover:text-foreground rounded-full";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: wrap, role: "group", "aria-label": "Feed layout", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => switchTo("boobubble_default"), className: `${baseBtn} ${!isOrkut ? activeCls : idleCls}`, title: "Default feed layout", children: "Default" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => switchTo("orkut_retro"), className: `${baseBtn} ${isOrkut ? activeCls : idleCls}`, title: `${orkutName} premium layout`, children: [
      orkutName,
      " ✨"
    ] })
  ] });
}
function SignInToPostCard() {
  const {
    openSignIn,
    openSignUp
  } = useAuthGate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-card mt-4 p-6 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold", children: "Join the conversation" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in to post, react, comment and follow other members." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: openSignIn, className: "rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90", children: "Sign in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: openSignUp, className: "rounded-full border px-5 py-2 text-sm font-semibold hover:bg-muted", children: "Create account" })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RouteErrorBoundary, { section: "Feed", featureStore: "feed-prefs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedPage, {}) });
const feed_index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  component: SplitComponent
}, Symbol.toStringTag, { value: "Module" }));
export {
  LanguageSwitcher as L,
  feed_index as f
};
