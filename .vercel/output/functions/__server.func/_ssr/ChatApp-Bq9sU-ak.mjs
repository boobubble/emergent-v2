import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { N as Navigate, L as Link, e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { v as useOptionalChat, U as useHomePageMode, u as useAppSettings, a as useAuth, P as BADGE_MAP, q as isRemoteDmChannel, g as useChat, h as useAuthGate, i as useBrandAsset, j as BrandMark, k as BrandText, m as cn, t as getGame, r as useIgnore, w as useRemoteProfiles, x as listMyRooms, y as listMyMemberships, z as trioChannel, Q as BADGES, S as TIER_COLOR, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, f as DialogDescription, B as Button, n as normalizeConfig, s as setBotEventsConfig, o as computeEventState, p as BOT_EVENT_META, b as useServerFn, N as postsSafe, O as isNavigableSlug, K as BroadcasterTicker, A as listMembers, C as getMyCoins, T as TRIO_CREATE_COST, E as TRIO_JOIN_COST, F as rejectInvite, G as acceptInvite, l as listCompetitions, L as useSoundPrefs, M as setSoundPref, H as closeRoom, I as inviteByUsername, J as createRoom } from "./router-CYWPFaDK.mjs";
import { u as useMehfilLabel } from "./use-mehfil-label-BWBPC7g6.mjs";
import { S as Sheet, a as SheetContent, b as SheetHeader, c as SheetTitle, d as SheetDescription } from "./sheet-CorLZxGP.mjs";
import { P as Progress } from "./progress-CwWlrCUG.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { g as getTodayMissions } from "./missions.functions-CjvjLerV.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-Bzvv_rZR.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useMyRoles } from "./use-my-role-Cv7Uou7c.mjs";
import { A as Avatar } from "./Avatar-CAZashHQ.mjs";
import { l as levelProgress, F as FrameAvatar, C as CosmeticName, g as getMyRoomLoyalty, E as EmojiPicker, N as NameEmojiBadge, a as NameAdornments } from "./EmojiPicker-DcAQqNHO.mjs";
import { r as roomLoyaltyFor } from "./economy-config-CPZpIbo-.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { S as Slider } from "./slider-By2jfzl6.mjs";
import { f as fetchWallpaperCatalog, a as fetchPersonalTheme, b as fetchSharedTheme, w as wallpaperBackground, W as WALLPAPER_CATEGORIES, c as clearPersonalTheme, s as savePersonalTheme, p as purchaseWallpaper } from "./dm-wallpapers-DZuMN-3o.mjs";
import { P as ProfilePopupProvider, M as MessageList, a as MessageInput, D as DropdownMenu, b as DropdownMenuTrigger, c as DropdownMenuContent, d as DropdownMenuLabel, e as DropdownMenuSeparator, f as DropdownMenuItem, u as useProfilePopup, g as useTyping, l as linkify, G as GiphyPicker, U as UserMenu, S as StaffActionsMenu } from "./MessageInput-lDIqYtps.mjs";
import { d as deleteMyDmConversation } from "./account-dm.functions-PHcEyLmf.mjs";
import { u as useDjPlayer, n as normalizeStreamUrl, c as currentPositionSec } from "./dj-store-CLtP8DK4.mjs";
import { P as POLL_WIDGET_DEFAULTS, m as mergePollWidgetConfig, a as POLL_CATEGORY_META, f as formatRemaining, s as sumVotes } from "./poll-widget-config-BaTQ_Bgs.mjs";
import { S as ScheduledAnnouncementsRunner } from "./ScheduledAnnouncements-CqUDiMdZ.mjs";
import { u as useStaffPermissions } from "./use-staff-permissions-DnZyPMSN.mjs";
import { b as banUser, m as muteUser } from "./moderation.functions-BtSBLwCC.mjs";
import { r as recordProfileView } from "./use-profile-views-C79sW5i0.mjs";
import { c as chatVariantFor } from "./theme-variants-CF8JUZmB.mjs";
import { k as PanelLeftOpen, l as Star, X, F as Flame, m as Award, n as PanelLeftClose, o as Gamepad2, d as Trash2, Z as Zap, p as Settings, R as RotateCcw, q as LogOut, r as LogIn, s as UserPlus, T as TriangleAlert, h as MessageCircle, a as Sparkles, t as Minus, u as BotOff, v as Bot, P as Palette, U as Users, S as Shield, i as Radio, V as Vote, w as Inbox, x as Bell, y as Settings2, z as Check, D as UserCog, J as UsersRound, K as UserCheck, N as Search, O as Trophy, W as Lock, Y as Coins, _ as Clock, $ as CircleAlert, a0 as LoaderCircle, a1 as Target, a2 as Gift, a3 as Swords, a4 as PenLine, a5 as Compass, a6 as ChevronRight, a7 as Sun, a8 as Moon, a9 as User, aa as Clock3, ab as ArrowRight, ac as Disc3, ad as VolumeX, ae as Volume2, af as Play, ag as Pause, ah as Paperclip, ai as Smile, aj as Send, ak as Mic, al as ShieldX, am as Minimize2, an as Maximize2, c as Plus, ao as CheckCheck, I as Image, e as EyeOff, E as Eye, ap as Globe, aq as Calendar, f as Heart, ar as AtSign, as as UserMinus, at as BellOff, au as ShieldCheck, av as Ban, aw as Gavel, ax as ExternalLink, ay as Newspaper, az as Film, aA as ShieldHalf, aB as Crown, aC as Activity } from "../_libs/lucide-react.mjs";
function useHubData(open) {
  const { user } = useAuth();
  const fetchMissions = useServerFn(getTodayMissions);
  const fetchComps = useServerFn(listCompetitions);
  const [loading, setLoading] = reactExports.useState(false);
  const [missions, setMissions] = reactExports.useState([]);
  const [comps, setComps] = reactExports.useState([]);
  const [coins, setCoins] = reactExports.useState(0);
  const [xp, setXp] = reactExports.useState(0);
  const [level, setLevel] = reactExports.useState(1);
  const [radio, setRadio] = reactExports.useState(null);
  const [trending, setTrending] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!open || !user?.id) return;
    let alive = true;
    setLoading(true);
    (async () => {
      const [ms, cs, prof, rad, trend] = await Promise.all([
        fetchMissions({}).catch(() => ({ missions: [] })),
        fetchComps({}).catch(() => []),
        supabase.from("profiles").select("coins,xp,level").eq("id", user.id).maybeSingle(),
        supabase.from("radio_widget_state").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("posts").select("id,slug,text,reaction_count").order("reaction_count", { ascending: false }).limit(1).maybeSingle()
      ]);
      if (!alive) return;
      setMissions(ms.missions ?? []);
      const now = Date.now();
      setComps((cs ?? []).filter((c) => c.status === "live" && (!c.end_at || new Date(c.end_at).getTime() > now)).slice(0, 3));
      setCoins(prof.data?.coins ?? 0);
      setXp(prof.data?.xp ?? 0);
      setLevel(prof.data?.level ?? 1);
      setRadio(rad.data ?? null);
      setTrending(trend.data ?? null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [open, user?.id, fetchMissions, fetchComps]);
  return { loading, missions, comps, coins, xp, level, radio, trending };
}
function fmtTimeLeft(iso) {
  if (!iso) return "Ongoing";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Ending soon";
  const m = Math.floor(ms / 6e4);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d}d ${h % 24}h`;
  if (h >= 1) return `${h}h ${m % 60}m`;
  return `${Math.max(1, m)}m`;
}
const GAMES = [
  { key: "arrow", label: "Arrow Puzzle", to: "/games" },
  { key: "memory", label: "Memory Game", to: "/games" },
  { key: "ludo", label: "Ludo", to: "/games" }
];
function CommunityHub({ open, onOpenChange, isMobile }) {
  const data = useHubData(open);
  const mehfilLabel = useMehfilLabel();
  const claimable = reactExports.useMemo(
    () => data.missions.filter((m) => m.completed && !m.claimed).length,
    [data.missions]
  );
  const activeMission = data.missions.find((m) => !m.claimed) ?? data.missions[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SheetContent,
    {
      side: isMobile ? "bottom" : "right",
      className: `hub-glass overflow-y-auto border-white/10 p-0 ${isMobile ? "h-[85vh] rounded-t-3xl" : "w-full sm:max-w-md"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "sticky top-0 z-10 border-b border-white/10 bg-background/70 px-5 py-4 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetTitle, { className: "flex items-center gap-2 text-left", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5 fill-yellow-400 text-yellow-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent", children: "Community Hub" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-left text-xs text-muted-foreground", children: "One place for missions, rewards, competitions and more." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => onOpenChange(false),
              "aria-label": "Close Community Hub",
              title: "Close",
              className: "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative space-y-3 p-4 pb-8", children: [
          data.loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
            " Loading your community…"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(HubCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4" }), title: "AI Assistant", tone: "from-violet-500/25 via-fuchsia-500/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ask AI, get community help, quick tips." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed", className: "hub-chip", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
                " Ask AI"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "hub-chip", children: "Quick Tips" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "hub-chip", children: "Community Help" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(HubCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }), title: "Daily Mission", tone: "from-emerald-500/25 via-teal-500/10", children: [
            activeMission ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-semibold text-foreground", children: activeMission.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 text-muted-foreground", children: [
                  "+",
                  activeMission.coins,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "mx-0.5 inline h-3 w-3" }),
                  " · +",
                  activeMission.xp,
                  "XP"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: activeMission.progress / Math.max(1, activeMission.target) * 100, className: "mt-2 h-1.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center justify-between text-[10px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  activeMission.progress,
                  "/",
                  activeMission.target
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
                  " Resets 00:00 UTC"
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No missions right now." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HubButton, { to: "/achievements", children: "Continue Mission" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(HubCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }), title: "Daily Challenge", tone: "from-amber-500/25 via-orange-500/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Play & Win 100 Coins" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300", children: "Medium" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-[10px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
              " Resets in ",
              fmtTimeLeft(new Date((/* @__PURE__ */ new Date()).setUTCHours(24, 0, 0, 0)).toISOString())
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HubButton, { to: "/games", children: "Play Now" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(HubCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-4 w-4" }), title: "Rewards", tone: "from-pink-500/25 via-rose-500/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-center text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/5 p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Coins" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-yellow-300", children: data.coins.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/5 p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "XP" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-primary", children: data.xp.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/5 p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Level" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-accent", children: data.level })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: claimable > 0 ? `🎁 ${claimable} reward${claimable > 1 ? "s" : ""} ready` : "Come back tomorrow for your login reward." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HubButton, { to: "/achievements", children: "Claim Reward" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(HubCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-4 w-4" }), title: "Competitions", tone: "from-rose-500/25 via-amber-500/10", children: [
            data.comps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No live competitions right now." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: data.comps.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium text-foreground", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 flex shrink-0 items-center gap-1 text-[10px] text-amber-300", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
                " ",
                fmtTimeLeft(c.end_at)
              ] })
            ] }, c.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HubButton, { to: "/competitions", children: "Vote Now" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(HubCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "h-4 w-4" }), title: "Games", tone: "from-cyan-500/25 via-blue-500/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: GAMES.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: g.to, className: "hub-chip", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "h-3 w-3" }),
              " ",
              g.label
            ] }, g.key)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HubButton, { to: "/games", children: "Play" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(HubCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-4 w-4" }), title: "Radio", tone: "from-fuchsia-500/25 via-purple-500/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-foreground", children: [
                data.radio?.is_live && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-online-dot" }),
                data.radio?.host_name ?? "Off air"
              ] }),
              data.radio?.now_playing && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 truncate text-[11px] text-muted-foreground", children: [
                "🎵 ",
                data.radio.now_playing
              ] }),
              data.radio?.next_host && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-[10px] text-muted-foreground", children: [
                "Next: ",
                data.radio.next_host
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HubButton, { to: "/radio", children: "Listen Now" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(HubCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-4 w-4" }), title: mehfilLabel, tone: "from-fuchsia-500/25 via-purple-500/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Poetry, battles & writer ranks — join the community." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(HubButton, { to: "/poetry", children: [
              "Enter ",
              mehfilLabel
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(HubCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4" }), title: "Trending Feed", tone: "from-orange-500/25 via-red-500/10", children: [
            data.trending ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-xs text-foreground", children: data.trending.text || "A post is heating up in the community." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Latest community activity awaits." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HubButton, { to: "/feed", children: "Open Feed" })
          ] })
        ] })
      ]
    }
  ) });
}
function HubCard({ icon, title, tone, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `hub-card group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${tone} to-transparent p-3 shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:border-primary/30`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-2 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-xl bg-background/70 text-foreground ring-1 ring-white/10", children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-foreground", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children })
  ] });
}
function HubButton({ to, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to,
      className: "mt-2 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/30 transition hover:brightness-110 active:scale-[0.98]",
      children: [
        children,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
      ]
    }
  );
}
const SEEN_KEY = "palrgo:hub:lastSeenAt";
function useHubBadge(open) {
  const { user } = useAuth();
  const [count, setCount] = reactExports.useState(0);
  const [seenAt, setSeenAt] = reactExports.useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem(SEEN_KEY) ?? 0);
  });
  const refresh = reactExports.useCallback(async () => {
    if (!user?.id) return;
    let n = 0;
    try {
      const { data: prof } = await supabase.from("profiles").select("coins").eq("id", user.id).maybeSingle();
      if (prof) n += 0;
    } catch {
    }
    try {
      const { data: comps } = await supabase.from("competitions").select("id,status,start_at").eq("status", "live").limit(10);
      const nowMs = Date.now();
      const fresh = (comps ?? []).filter((c) => !seenAt || new Date(c.start_at).getTime() > seenAt);
      n += fresh.length;
      void nowMs;
    } catch {
    }
    setCount(n);
  }, [user?.id, seenAt]);
  reactExports.useEffect(() => {
    void refresh();
  }, [refresh]);
  reactExports.useEffect(() => {
    if (open) {
      const now = Date.now();
      setSeenAt(now);
      try {
        window.localStorage.setItem(SEEN_KEY, String(now));
      } catch {
      }
      setCount(0);
    }
  }, [open]);
  return count;
}
const DEFAULT_CHAT_THEME = "boobubble_default_chat";
const sb$2 = supabase;
async function listChatThemes() {
  const { data, error } = await sb$2.from("chat_themes").select("*").eq("enabled", true).order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
async function listMyChatUnlocks(userId) {
  const { data, error } = await sb$2.from("user_chat_themes").select("theme_key, unlocked_at, expires_at, source").eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}
async function getMyActiveChatTheme(userId) {
  const { data, error } = await sb$2.rpc("get_active_chat_theme", { _user: userId });
  if (error || !data) return DEFAULT_CHAT_THEME;
  return data;
}
async function unlockChatTheme(themeKey) {
  const { data, error } = await sb$2.rpc("unlock_chat_theme", { _theme_key: themeKey });
  if (error) throw error;
  return data;
}
async function activateChatTheme(themeKey) {
  const { data, error } = await sb$2.rpc("activate_chat_theme", { _theme_key: themeKey });
  if (error) throw error;
  const next = data ?? themeKey;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("palrgo:active-chat-theme", next);
      window.dispatchEvent(new CustomEvent("palrgo:chat-theme-changed", { detail: next }));
    }
  } catch {
  }
  return next;
}
const CHAT_THEME_CACHE_KEY = "palrgo:active-chat-theme";
function readCachedChatTheme() {
  if (typeof window === "undefined") return DEFAULT_CHAT_THEME;
  try {
    const v = localStorage.getItem(CHAT_THEME_CACHE_KEY);
    return v || DEFAULT_CHAT_THEME;
  } catch {
    return DEFAULT_CHAT_THEME;
  }
}
function useActiveChatTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = reactExports.useState(readCachedChatTheme);
  const [version, setVersion] = reactExports.useState(0);
  reactExports.useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setTheme(DEFAULT_CHAT_THEME);
      try {
        localStorage.removeItem(CHAT_THEME_CACHE_KEY);
      } catch {
      }
      return;
    }
    getMyActiveChatTheme(user.id).then((t) => {
      if (cancelled) return;
      setTheme(t);
      try {
        localStorage.setItem(CHAT_THEME_CACHE_KEY, t);
      } catch {
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, version]);
  reactExports.useEffect(() => {
    const onChanged = (e) => {
      const next = e.detail;
      if (next) setTheme(next);
      else setVersion((v) => v + 1);
    };
    const onStorage = (e) => {
      if (e.key === CHAT_THEME_CACHE_KEY && e.newValue) setTheme(e.newValue);
    };
    window.addEventListener("palrgo:chat-theme-changed", onChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("palrgo:chat-theme-changed", onChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const refresh = reactExports.useCallback(() => setVersion((v) => v + 1), []);
  return { theme, refresh };
}
function friendlyError(raw, ctx = {}) {
  const msg = (raw || "").toLowerCase();
  if (msg.includes("not enough coins")) {
    const need = ctx.price != null && ctx.balance != null ? Math.max(ctx.price - ctx.balance, 0) : null;
    return need != null ? `You need ${need.toLocaleString()} more coins to unlock this theme.` : "You don't have enough coins for this theme.";
  }
  if (msg.includes("not signed in")) return "Please sign in to unlock themes.";
  if (msg.includes("theme not available")) return "This theme is no longer available.";
  if (msg.includes("theme not unlocked")) return "You haven't unlocked this theme yet.";
  if (msg.includes("profile not found")) return "Your profile couldn't be loaded. Try refreshing.";
  if (msg.includes("forbidden")) return "You don't have permission to do that.";
  if (msg.includes("network") || msg.includes("fetch")) return "Network error — check your connection and try again.";
  return raw || "Something went wrong. Please try again.";
}
function ChatThemeStore({ open, onOpenChange, activeTheme, onThemeChange }) {
  const { user } = useAuth();
  const [themes, setThemes] = reactExports.useState([]);
  const [unlocks, setUnlocks] = reactExports.useState([]);
  const [coins, setCoins] = reactExports.useState(0);
  const [busy, setBusy] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [confirmTheme, setConfirmTheme] = reactExports.useState(null);
  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [t, u, c] = await Promise.all([
        listChatThemes(),
        listMyChatUnlocks(user.id),
        supabase.rpc("my_coin_balance")
      ]);
      setThemes(t);
      setUnlocks(u);
      setCoins(typeof c.data === "number" ? c.data : 0);
    } catch (e) {
      toast.error(friendlyError(e?.message ?? "Failed to load themes"));
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
  const doUnlock = async (t) => {
    setBusy(t.theme_key);
    try {
      await unlockChatTheme(t.theme_key);
      const remaining = Math.max(coins - t.price_coins, 0);
      toast.success(`Unlocked ${t.name}`, {
        description: `${t.price_coins.toLocaleString()} coins spent · ${remaining.toLocaleString()} left · activating…`
      });
      try {
        await activateChatTheme(t.theme_key);
        onThemeChange();
        setConfirmTheme(null);
        onOpenChange(false);
        return;
      } catch (actErr) {
        toast.error(friendlyError(actErr?.message ?? "Activate failed"));
      }
      await refresh();
    } catch (e) {
      toast.error(friendlyError(e?.message ?? "Unlock failed", { price: t.price_coins, balance: coins }));
    } finally {
      setBusy(null);
      setConfirmTheme(null);
    }
  };
  const handleUnlockClick = (t) => {
    if (coins < t.price_coins) {
      toast.error(`You need ${(t.price_coins - coins).toLocaleString()} more coins`, {
        description: "Earn coins by chatting, completing missions, or topping up."
      });
      return;
    }
    setConfirmTheme(t);
  };
  const handleActivate = async (t) => {
    setBusy(t.theme_key);
    try {
      await activateChatTheme(t.theme_key);
      toast.success(`Activated ${t.name}`);
      onThemeChange();
      onOpenChange(false);
    } catch (e) {
      toast.error(friendlyError(e?.message ?? "Activate failed"));
    } finally {
      setBusy(null);
    }
  };
  const modeLabel = (m) => m === "days_7" ? "7-day access" : m === "days_30" ? "30-day access" : "Lifetime";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-5 w-5 text-primary" }),
          "Chatroom Theme Store"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Unlock premium chatroom skins. Layout and features stay the same — only the look changes." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted px-3 py-1.5 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4 text-yellow-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: coins.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "coins available" })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-sm text-muted-foreground", children: "Loading themes…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: themes.map((t) => {
        const unlocked = isUnlocked(t);
        const active = activeTheme === t.theme_key;
        const u = unlockMap.get(t.theme_key);
        const accent = t.accent_hex ?? "#7ed321";
        const shortage = !unlocked && !t.is_default ? Math.max(t.price_coins - coins, 0) : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 h-24 w-full rounded-lg", style: { background: `linear-gradient(135deg, ${accent}, ${accent}55)` } }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground", children: [
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
            ] }),
            shortage > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-destructive", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5" }),
              "Need ",
              shortage.toLocaleString(),
              " more"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex gap-2", children: active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: true, className: "w-full", children: "Currently active" }) : unlocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "w-full", disabled: busy === t.theme_key, onClick: () => handleActivate(t), children: busy === t.theme_key ? "Activating…" : "Activate" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              className: "w-full",
              variant: shortage > 0 ? "outline" : "default",
              disabled: busy === t.theme_key,
              onClick: () => handleUnlockClick(t),
              children: shortage > 0 ? "Not enough coins" : `Unlock for ${t.price_coins.toLocaleString()}`
            }
          ) })
        ] }, t.theme_key);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!confirmTheme, onOpenChange: (v) => !v && setConfirmTheme(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          "Unlock ",
          confirmTheme?.name,
          "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "This will spend",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
              confirmTheme?.price_coins.toLocaleString(),
              " coins"
            ] }),
            " ",
            "for ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: confirmTheme ? modeLabel(confirmTheme.unlock_mode) : "" }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Balance after" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 font-semibold text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3.5 w-3.5 text-yellow-500" }),
              confirmTheme ? Math.max(coins - confirmTheme.price_coins, 0).toLocaleString() : 0
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: busy === confirmTheme?.theme_key, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertDialogAction,
          {
            disabled: busy === confirmTheme?.theme_key,
            onClick: (e) => {
              e.preventDefault();
              if (confirmTheme) doUnlock(confirmTheme);
            },
            children: busy === confirmTheme?.theme_key ? "Unlocking…" : "Confirm & Unlock"
          }
        )
      ] })
    ] }) })
  ] });
}
function useRoomOnlineCounts(channelIds) {
  const key = channelIds.slice().sort().join(",");
  const [counts, setCounts] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!channelIds.length) return;
    const channels = channelIds.map((id) => {
      const ch = supabase.channel(`room-presence:${id}`, {
        // Observer key — no track() call, so we don't inflate the count.
        config: { presence: { key: `observer-${Math.random().toString(36).slice(2)}` } }
      });
      ch.on("presence", { event: "sync" }, () => {
        const state = ch.presenceState();
        const uniq = /* @__PURE__ */ new Set();
        for (const k of Object.keys(state)) {
          const metas = state[k];
          if (!metas?.length) continue;
          uniq.add(metas[0]?.user_id || k);
        }
        const real = Array.from(uniq).filter((u) => !u.startsWith("observer-"));
        setCounts((prev) => prev[id] === real.length ? prev : { ...prev, [id]: real.length });
      }).subscribe();
      return ch;
    });
    return () => {
      for (const ch of channels) supabase.removeChannel(ch);
    };
  }, [key]);
  return counts;
}
function getInitial() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem("palrgo-theme") || "light";
}
function ThemeToggle() {
  const [theme, setTheme] = reactExports.useState("light");
  reactExports.useEffect(() => {
    const t = getInitial();
    setTheme(t);
    document.documentElement.classList.toggle("light", t === "light");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("palrgo-theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: toggle,
      className: "flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
      "aria-label": "Toggle theme",
      children: [
        theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4" }),
        theme === "dark" ? "Light mode" : "Dark mode"
      ]
    }
  );
}
function useShortcuts() {
  const mehfilLabel = useMehfilLabel();
  return [
    { to: "/feed", label: "Feed", icon: Newspaper, gradient: "from-blue-500 to-indigo-500" },
    { to: "/poetry", label: mehfilLabel, icon: PenLine, gradient: "from-fuchsia-500 to-purple-500" },
    { to: "/reels", label: "Reels", icon: Film, gradient: "from-pink-500 to-rose-500" },
    { to: "/find-friends", label: "Find Friends", icon: UserPlus, gradient: "from-orange-500 to-amber-500" },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy, gradient: "from-purple-500 to-fuchsia-500" },
    { to: "/achievements", label: "Achievements", icon: Award, gradient: "from-emerald-500 to-teal-500" },
    { to: "/battle-hub", label: "Battle Hub", icon: Swords, gradient: "from-cyan-500 to-sky-500" },
    { to: "/groups", label: "Groups", icon: Users, gradient: "from-violet-500 to-purple-500" }
  ];
}
function ChatExploreMenu() {
  const [open, setOpen] = reactExports.useState(false);
  const SHORTCUTS = useShortcuts();
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((o) => !o),
        "aria-expanded": open,
        className: "flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-white/5",
        title: "Explore more",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "h-3.5 w-3.5" }) }),
          "Explore",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: `ml-auto h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}` })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-0 z-50 mb-1 w-52 rounded-xl border border-border bg-card/95 p-1 shadow-2xl backdrop-blur-xl animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1.5 pb-0.5 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: "Explore More" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-0", children: SHORTCUTS.map(({ to, label, icon: Icon, gradient }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: to,
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: () => setOpen(false),
          className: "group flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-5 w-5 shrink-0 place-items-center rounded-md bg-gradient-to-br ${gradient} text-white shadow-sm ring-1 ring-white/10`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[11px] font-semibold text-foreground", children: label })
          ]
        },
        to
      )) })
    ] })
  ] });
}
function Sidebar({ onOpenProfile, onCollapse }) {
  const { state, setActive, createRoom: createRoom2, deleteRoom, reset } = useChat();
  const { logout, user } = useAuth();
  const { openSignIn, openSignUp } = useAuthGate();
  const { isAdmin } = useMyRoles();
  const [showNew, setShowNew] = reactExports.useState(false);
  const [newName, setNewName] = reactExports.useState("");
  const [newTopic, setNewTopic] = reactExports.useState("");
  const chatLogo = useBrandAsset("chat");
  const publicRoomIds = reactExports.useMemo(
    () => state.roomOrder.filter((id) => state.rooms[id]?.kind !== "game"),
    [state.roomOrder, state.rooms]
  );
  const onlineCounts = useRoomOnlineCounts(publicRoomIds);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "flex h-full w-56 shrink-0 flex-col bg-transparent p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col premium-floating-sidebar overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        BrandMark,
        {
          slot: "chat",
          alt: "Logo",
          className: "h-8 w-8 rounded-xl object-contain",
          fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "grid h-8 w-8 place-items-center rounded-xl text-xl font-bold text-primary-foreground",
              style: { background: "var(--primary)", boxShadow: "var(--shadow-glow)" },
              children: "P"
            }
          )
        }
      ),
      !chatLogo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BrandText, { slot: "chat", defaultText: "Chat", className: "block font-bold text-foreground", alwaysShow: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Social Chat" })
      ] }),
      onCollapse && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onCollapse,
          className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30 transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground",
          title: "Hide sidebar",
          "aria-label": "Hide sidebar",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeftClose, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 space-y-3 overflow-y-auto px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionLabel,
        {
          title: "Public Rooms",
          action: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setShowNew((s) => !s),
              className: "text-lg leading-none text-muted-foreground transition-colors hover:text-primary",
              "aria-label": "New room",
              children: "+"
            }
          )
        }
      ),
      showNew && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 space-y-1 rounded-2xl border border-border bg-background p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: newName,
            onChange: (e) => setNewName(e.target.value),
            placeholder: "Room name",
            className: "w-full rounded-lg bg-input px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: newTopic,
            onChange: (e) => setNewTopic(e.target.value),
            placeholder: "Topic",
            className: "w-full rounded-lg bg-input px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              if (newName.trim()) {
                createRoom2(newName.trim(), newTopic.trim());
                setNewName("");
                setNewTopic("");
                setShowNew(false);
              }
            },
            className: "w-full rounded-lg bg-primary px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90",
            children: "Create"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: state.roomOrder.map((id) => {
        const r = state.rooms[id];
        const active = state.activeChannel === id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "premium-nav-item group/room",
              active && "premium-nav-item-active"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setActive(id),
                  className: "flex min-w-0 flex-1 items-center gap-2.5 truncate bg-transparent p-0 text-left",
                  children: [
                    r.kind === "game" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: cn("h-3.5 w-3.5 shrink-0", active ? "text-primary" : "text-primary/70") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-base leading-none", active ? "text-primary" : "opacity-50"), children: "#" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: r.name })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[10px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-online-dot", "aria-hidden": true, style: { width: "0.4rem", height: "0.4rem" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold opacity-80", title: `${Math.max(onlineCounts[id] ?? 0, r.members.length)} online`, children: Math.max(onlineCounts[id] ?? 0, r.members.length) }),
                isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.stopPropagation();
                      if (confirm(`Delete channel "${r.name}"? This removes it for you and cannot be undone.`)) {
                        deleteRoom(id);
                      }
                    },
                    "aria-label": `Delete ${r.name}`,
                    title: "Delete channel (admin)",
                    className: "ml-1 grid h-5 w-5 place-items-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/15 hover:text-destructive group-hover/room:opacity-100",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                  }
                )
              ] })
            ]
          },
          id
        );
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatExploreMenu, {}) }),
      user && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "/feed",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "mb-1 flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
          title: "Open achievements & leaderboard in feed",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }),
            " Achievements",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary", children: state.me.badges?.length ?? 0 })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}) }),
      user ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: "/account",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "group relative block w-full overflow-hidden rounded-2xl border border-border bg-card/60 p-2 text-left transition-all hover:border-primary/30 hover:bg-card",
            title: "Open account settings in new tab",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: state.me, size: 36 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-bold text-foreground", children: state.me.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-center gap-1.5 text-[10px]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/20 to-fuchsia-500/20 px-1.5 py-0.5 font-bold text-amber-200 ring-1 ring-amber-400/30", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-2.5 w-2.5" }),
                      " Lv ",
                      state.me.level
                    ] }),
                    (state.me.streak ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 px-1.5 py-0.5 font-bold text-rose-300 ring-1 ring-rose-400/30", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-2.5 w-2.5" }),
                      state.me.streak,
                      "d"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 text-muted-foreground transition group-hover:text-foreground" })
              ] }),
              (() => {
                const lp = levelProgress(state.me.xp ?? 0);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-fuchsia-500 shadow-[0_0_10px_rgba(251,191,36,0.6)] transition-all duration-700",
                      style: { width: `${lp.pct}%` }
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center justify-between text-[9px] font-semibold text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      (state.me.xp ?? 0).toLocaleString(),
                      " XP"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      lp.intoLevel,
                      "/",
                      lp.toNext,
                      " → Lv ",
                      lp.level + 1
                    ] })
                  ] })
                ] });
              })()
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onOpenProfile,
            className: "mt-1 w-full rounded-full px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-white/5 hover:text-foreground",
            children: "Quick edit profile"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                if (confirm("Reset chat data for this account?")) reset();
              },
              className: "flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3" }),
                " Reset"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: logout,
              className: "flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive",
              title: user?.email,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3 w-3" }),
                " Sign out"
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card/60 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-[11px] text-muted-foreground", children: "Sign in to chat, react, DM and earn XP." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: openSignIn,
              className: "flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-3.5 w-3.5" }),
                " Sign in"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: openSignUp,
              className: "flex w-full items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-white/5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
                " Create account"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}
function SectionLabel({
  title,
  action,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "mb-1.5 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
        action
      ]
    }
  );
}
function LoyaltyChip({ channelId }) {
  const fetchLoyalty = useServerFn(getMyRoomLoyalty);
  const [data, setData] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!channelId || channelId.startsWith("dm:")) return;
    let cancelled = false;
    fetchLoyalty({ data: { channelId } }).then((r) => {
      if (!cancelled) setData({ total: r.total_messages ?? 0, streak: r.streak_days ?? 0 });
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [channelId]);
  if (!data) return null;
  const lvl = roomLoyaltyFor(data.total);
  const showLoyaltyName = lvl.level > 1;
  if (!showLoyaltyName && data.streak <= 1) return null;
  const title = showLoyaltyName ? `${lvl.name} · ${data.total} msgs` : `${data.total} msgs`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${lvl.chip}`, title, children: [
    showLoyaltyName && lvl.name,
    data.streak > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-orange-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-2.5 w-2.5" }),
      data.streak
    ] })
  ] });
}
const KINDS = ["fish", "dig", "wine"];
function useBotEvents() {
  const { raw } = useAppSettings();
  const config = reactExports.useMemo(() => normalizeConfig(raw.bot_events), [raw.bot_events]);
  reactExports.useEffect(() => {
    setBotEventsConfig(config);
  }, [config]);
  const [now, setNow] = reactExports.useState(() => Date.now());
  reactExports.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1e3);
    return () => window.clearInterval(id);
  }, []);
  const states = reactExports.useMemo(() => {
    const out = {};
    for (const k of KINDS) out[k] = computeEventState(k, config[k], now);
    return out;
  }, [config, now]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const store = window;
    if (!store.__botEventLast) store.__botEventLast = {};
    const last = store.__botEventLast;
    for (const k of KINDS) {
      const s = states[k];
      if (!config[k].enabled) continue;
      const key = `${s.cycleId}:${s.live ? "live" : "closed"}`;
      if (last[k] === key) continue;
      const hadPrev = !!last[k];
      last[k] = key;
      if (!hadPrev && !s.live) continue;
      window.dispatchEvent(new CustomEvent("palrgo:bot-event", {
        detail: {
          kind: k,
          live: s.live,
          cycleId: s.cycleId,
          duration_min: config[k].duration_min,
          interval_min: config[k].interval_min,
          golden: s.golden
        }
      }));
    }
  }, [states, config]);
  return { config, states, meta: BOT_EVENT_META };
}
function fmt(ms) {
  const total = Math.max(0, Math.floor(ms / 1e3));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${String(mm).padStart(2, "0")}m`;
  }
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}
const TIPS = [
  { key: "tip-mention", priority: 90, emoji: "💬", label: "Mention friends using @username" },
  { key: "tip-streak", priority: 91, emoji: "🎁", label: "Complete daily streaks for bonus XP" },
  { key: "tip-radio", priority: 92, emoji: "📻", label: "Join today's live radio session", href: "/radio" },
  { key: "tip-vote", priority: 93, emoji: "🏆", label: "Vote in community competitions", href: "/competitions" },
  { key: "tip-post", priority: 94, emoji: "📝", label: "Share your latest post on the Feed", href: "/feed" }
];
function botEventToItem(kind, s) {
  const meta = BOT_EVENT_META[kind];
  const short = meta.label.replace(" Event", "");
  if (s.live) {
    const endingSoon = s.msUntilClose <= 6e4;
    return {
      key: `bot-${kind}-live`,
      priority: endingSoon ? 0 : 1,
      emoji: meta.emoji,
      label: `${short} Event is LIVE${s.golden ? " ✨2×" : ""}`,
      suffix: `ends in ${fmt(s.msUntilClose)}`,
      live: true
    };
  }
  const soon = s.msUntilOpen <= 5 * 6e4;
  return {
    key: `bot-${kind}-wait`,
    priority: soon ? 2 : 5,
    emoji: meta.emoji,
    label: `${short} Event starts in ${fmt(s.msUntilOpen)}`
  };
}
const ROTATE_MS = 5e3;
function CommunityEventsTicker() {
  const { states, config } = useBotEvents();
  const navigate = useNavigate();
  const items = reactExports.useMemo(() => {
    const list = [];
    for (const k of ["fish", "dig", "wine"]) {
      if (config[k].enabled) list.push(botEventToItem(k, states[k]));
    }
    list.push(...TIPS);
    list.sort((a, b) => a.priority - b.priority);
    return list;
  }, [states, config]);
  const [index, setIndex] = reactExports.useState(0);
  const [phase, setPhase] = reactExports.useState("in");
  const prevTopKey = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const topKey = items[0]?.key ?? null;
    if (topKey && topKey !== prevTopKey.current && items[0]?.live) {
      setIndex(0);
      setPhase("in");
    }
    prevTopKey.current = topKey;
  }, [items]);
  reactExports.useEffect(() => {
    if (items.length <= 1) return;
    const holdId = window.setTimeout(() => {
      setPhase("out");
      const swapId = window.setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setPhase("in");
      }, 320);
      return () => window.clearTimeout(swapId);
    }, ROTATE_MS);
    return () => window.clearTimeout(holdId);
  }, [index, items.length]);
  const current = items[Math.min(index, items.length - 1)] ?? null;
  if (!current) return null;
  const clickable = !!current.href || current.key.startsWith("bot-");
  const handleClick = () => {
    if (current.href) {
      navigate({ to: current.href }).catch(() => {
      });
      return;
    }
    if (current.key.startsWith("bot-")) {
      window.dispatchEvent(new CustomEvent("palrgo:focus-composer"));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "community-ticker relative flex-1 min-w-0 overflow-hidden",
      "aria-label": "Community announcements",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: clickable ? handleClick : void 0,
          disabled: !clickable,
          className: `community-announcement group inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium leading-none backdrop-blur-md transition ${clickable ? "cursor-pointer hover:bg-white/10" : "cursor-default"} ${current.live ? "text-emerald-100 border-emerald-400/30 bg-emerald-400/10" : "text-foreground/80"} ${phase === "in" ? "community-announcement-in" : "community-announcement-out"}`,
          children: [
            current.live ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-1.5 w-1.5 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] leading-none shrink-0", children: current.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1 truncate text-left", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: current.live ? "font-semibold" : "", children: current.label }),
              current.suffix && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 tabular-nums text-emerald-200/90", children: [
                "· ",
                current.suffix
              ] })
            ] })
          ]
        },
        current.key
      ) })
    }
  );
}
const sb$1 = supabase;
const DEFAULT_THEME = {
  wallpaper: null,
  opacity: 1,
  blur: 0,
  brightness: 1,
  overlay: 0,
  bubbleAccent: null,
  source: "default"
};
function useDmTheme(channelId, userId) {
  const isDm = !!channelId && channelId.startsWith("dm:");
  const [catalog, setCatalog] = reactExports.useState([]);
  const [personal, setPersonal] = reactExports.useState(null);
  const [shared, setShared] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [reloadCounter, setReloadCounter] = reactExports.useState(0);
  reactExports.useEffect(() => {
    let cancelled = false;
    fetchWallpaperCatalog().then((rows) => {
      if (!cancelled) setCatalog(rows);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, []);
  reactExports.useEffect(() => {
    if (!isDm || !channelId || !userId || !isRemoteDmChannel(channelId, userId)) {
      setPersonal(null);
      setShared(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchPersonalTheme(channelId, userId).catch(() => null),
      fetchSharedTheme(channelId).catch(() => null)
    ]).then(([p, s]) => {
      if (cancelled) return;
      setPersonal(p);
      setShared(s);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isDm, channelId, userId, reloadCounter]);
  reactExports.useEffect(() => {
    if (!isDm || !channelId || !userId || !isRemoteDmChannel(channelId, userId)) return;
    const channel = sb$1.channel(`dm-shared-theme-${channelId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dm_shared_themes", filter: `channel_id=eq.${channelId}` },
      (payload) => {
        if (payload.eventType === "DELETE") setShared(null);
        else setShared(payload.new ?? null);
      }
    ).subscribe();
    return () => {
      sb$1.removeChannel(channel);
    };
  }, [isDm, channelId]);
  const refresh = reactExports.useCallback(() => setReloadCounter((n) => n + 1), []);
  const active = reactExports.useMemo(() => {
    if (!isDm) return DEFAULT_THEME;
    const row = shared ?? personal ?? null;
    if (!row) return DEFAULT_THEME;
    const wp = row.wallpaper_key ? catalog.find((w) => w.wallpaper_key === row.wallpaper_key) ?? null : null;
    return {
      wallpaper: wp,
      opacity: Number(row.opacity ?? 1),
      blur: Number(row.blur ?? 0),
      brightness: Number(row.brightness ?? 1),
      overlay: Number(row.overlay ?? 0),
      bubbleAccent: row.bubble_accent ?? null,
      source: shared ? "shared" : "personal"
    };
  }, [isDm, catalog, personal, shared]);
  return { ...active, catalog, loading, refresh };
}
const sb = supabase;
function DMWallpaperSheet({ open, onOpenChange, channelId }) {
  const { state } = useChat();
  const meCoins = state.me?.coins ?? 0;
  const [authUserId, setAuthUserId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    sb.auth.getUser().then((res) => {
      setAuthUserId(res?.data?.user?.id ?? null);
    });
  }, []);
  const dm = useDmTheme(channelId, authUserId);
  const [owned, setOwned] = reactExports.useState(/* @__PURE__ */ new Set());
  const [category, setCategory] = reactExports.useState("All");
  const [pickedKey, setPickedKey] = reactExports.useState(null);
  const [opacity, setOpacity] = reactExports.useState(1);
  const [blur, setBlur] = reactExports.useState(0);
  const [brightness, setBrightness] = reactExports.useState(1);
  const [overlay, setOverlay] = reactExports.useState(0);
  const [confirm2, setConfirm] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!open || !authUserId) return;
    sb.from("user_dm_wallpapers").select("wallpaper_key").eq("user_id", authUserId).then((r) => {
      setOwned(new Set((r.data ?? []).map((x) => x.wallpaper_key)));
    });
  }, [open, authUserId]);
  reactExports.useEffect(() => {
    if (!open) return;
    setPickedKey(dm.wallpaper?.wallpaper_key ?? null);
    setOpacity(dm.opacity);
    setBlur(dm.blur);
    setBrightness(dm.brightness);
    setOverlay(dm.overlay);
  }, [open, dm.wallpaper?.wallpaper_key, dm.opacity, dm.blur, dm.brightness, dm.overlay]);
  const categories = reactExports.useMemo(() => {
    const s = /* @__PURE__ */ new Set();
    dm.catalog.forEach((w) => s.add(w.category));
    return ["All", ...WALLPAPER_CATEGORIES.filter((c) => s.has(c)), ...Array.from(s).filter((c) => !WALLPAPER_CATEGORIES.includes(c))];
  }, [dm.catalog]);
  const filtered = reactExports.useMemo(() => {
    if (category === "All") return dm.catalog;
    return dm.catalog.filter((w) => w.category === category);
  }, [dm.catalog, category]);
  const picked = reactExports.useMemo(
    () => pickedKey ? dm.catalog.find((w) => w.wallpaper_key === pickedKey) ?? null : null,
    [pickedKey, dm.catalog]
  );
  const isOwned = (w) => owned.has(w.wallpaper_key) || w.price_coins === 0;
  const applyPersonal = async () => {
    if (!authUserId) return;
    if (!picked) {
      await clearPersonalTheme(channelId, authUserId).catch((e) => toast.error(e.message));
      dm.refresh();
      onOpenChange(false);
      return;
    }
    if (!isOwned(picked)) {
      setConfirm({ type: "self", wallpaper: picked });
      return;
    }
    setBusy(true);
    try {
      await savePersonalTheme(channelId, authUserId, {
        wallpaper_key: picked.wallpaper_key,
        opacity,
        blur,
        brightness,
        overlay
      });
      toast.success("Wallpaper applied");
      dm.refresh();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const applyShared = async () => {
    if (!picked) return;
    setConfirm({ type: "shared", wallpaper: picked });
  };
  const runPurchase = async () => {
    if (!confirm2 || !authUserId) return;
    const { wallpaper, type } = confirm2;
    setBusy(true);
    try {
      await purchaseWallpaper(wallpaper.wallpaper_key, type, channelId);
      if (type === "self") {
        await savePersonalTheme(channelId, authUserId, {
          wallpaper_key: wallpaper.wallpaper_key,
          opacity,
          blur,
          brightness,
          overlay
        });
      }
      toast.success(type === "shared" ? "Applied for both of you" : "Wallpaper unlocked & applied");
      setOwned((s) => /* @__PURE__ */ new Set([...s, wallpaper.wallpaper_key]));
      setConfirm(null);
      dm.refresh();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    if (!authUserId) return;
    try {
      await clearPersonalTheme(channelId, authUserId);
      setPickedKey(null);
      setOpacity(1);
      setBlur(0);
      setBrightness(1);
      setOverlay(0);
      toast.success("Reset to default");
      dm.refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "w-full max-w-lg overflow-y-auto p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-10 border-b bg-background/95 px-5 py-4 backdrop-blur", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { className: "text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
            "Chat Personalization"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: "Pick a wallpaper for this conversation. Only you see personal picks; shared themes apply for both of you." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3.5 w-3.5 text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: meCoins }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "coins available" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PreviewCard, { picked, opacity, blur, brightness, overlay }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: category, onValueChange: setCategory, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "flex w-full flex-wrap justify-start gap-1 bg-transparent p-0", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: c,
            className: "rounded-full border border-border bg-muted/30 px-3 py-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            children: c
          },
          c
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: category, className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-4", children: [
          filtered.map((w) => {
            const active = pickedKey === w.wallpaper_key;
            const own = isOwned(w);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setPickedKey(w.wallpaper_key),
                className: `group relative aspect-square overflow-hidden rounded-xl border-2 transition ${active ? "border-primary shadow-lg" : "border-transparent hover:border-primary/50"}`,
                style: { background: wallpaperBackground(w) },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 rounded-lg bg-black/55 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-semibold", children: w.name }),
                    own ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-emerald-500/80 px-1 text-[9px] font-bold uppercase", children: "Owned" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-amber-300", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-2.5 w-2.5" }),
                      " ",
                      w.price_coins
                    ] })
                  ] }),
                  w.is_premium && !own && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute right-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold uppercase text-amber-300 backdrop-blur", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mr-0.5 inline h-2.5 w-2.5" }),
                    " Premium"
                  ] }),
                  w.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-1 top-1 rounded bg-primary/90 px-1 py-0.5 text-[9px] font-bold uppercase text-primary-foreground", children: "★" })
                ]
              },
              w.wallpaper_key
            );
          }),
          filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-full text-center text-xs text-muted-foreground", children: "No wallpapers in this category." })
        ] }) })
      ] }) }),
      picked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 px-5 pt-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Opacity", value: opacity, min: 0.2, max: 1, step: 0.05, onChange: setOpacity, display: `${Math.round(opacity * 100)}%` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Blur", value: blur, min: 0, max: 30, step: 1, onChange: setBlur, display: `${blur}px` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Brightness", value: brightness, min: 0.4, max: 1.2, step: 0.05, onChange: setBrightness, display: `${Math.round(brightness * 100)}%` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Dark overlay", value: overlay, min: 0, max: 0.7, step: 0.05, onChange: setOverlay, display: `${Math.round(overlay * 100)}%` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 mt-4 flex flex-wrap items-center justify-between gap-2 border-t bg-background/95 px-5 py-3 backdrop-blur", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: reset, disabled: busy, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-1 h-3.5 w-3.5" }),
          " Reset"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => onOpenChange(false), disabled: busy, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-3.5 w-3.5" }),
            " Cancel"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: applyPersonal, disabled: busy || !picked, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "mr-1 h-3.5 w-3.5" }),
            " Apply for me"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "default", onClick: applyShared, disabled: busy || !picked, className: "bg-primary/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "mr-1 h-3.5 w-3.5" }),
            " Apply for both"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!confirm2, onOpenChange: (o) => !o && setConfirm(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogContent, { children: confirm2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { className: "flex items-center gap-2", children: [
          confirm2.type === "shared" ? /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5" }),
          confirm2.type === "shared" ? "Apply for both" : "Unlock wallpaper"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: confirm2.wallpaper.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 font-semibold text-amber-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4" }),
              " ",
              owned.has(confirm2.wallpaper.wallpaper_key) ? 0 : confirm2.wallpaper.price_coins
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Your balance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: meCoins })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Balance after" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: Math.max(0, meCoins - (owned.has(confirm2.wallpaper.wallpaper_key) ? 0 : confirm2.wallpaper.price_coins)) })
          ] }),
          confirm2.type === "shared" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded bg-primary/10 p-2 text-xs text-primary", children: "Both participants will see this theme. Only your coins are used — the other person pays nothing." }),
          !owned.has(confirm2.wallpaper.wallpaper_key) && meCoins < confirm2.wallpaper.price_coins && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded bg-destructive/10 p-2 text-xs text-destructive", children: "You don't have enough coins to unlock this wallpaper." })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: busy, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          AlertDialogAction,
          {
            disabled: busy || !owned.has(confirm2.wallpaper.wallpaper_key) && meCoins < confirm2.wallpaper.price_coins,
            onClick: (e) => {
              e.preventDefault();
              runPurchase();
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-1 h-4 w-4" }),
              " Buy & Apply"
            ]
          }
        )
      ] })
    ] }) }) })
  ] });
}
function SliderRow({ label, value, min, max, step, onChange, display }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: display })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { min, max, step, value: [value], onValueChange: ([v]) => onChange(v) })
  ] });
}
function PreviewCard({ picked, opacity, blur, brightness, overlay }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-32 w-full overflow-hidden rounded-xl border border-border bg-muted", children: [
    picked && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0",
          style: {
            background: wallpaperBackground(picked),
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity,
            filter: `${blur ? `blur(${blur}px) ` : ""}brightness(${brightness})`,
            transform: blur ? "scale(1.05)" : void 0
          }
        }
      ),
      overlay > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: { background: `rgba(0,0,0,${overlay})` } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 flex items-end justify-between p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl rounded-bl-none bg-white/95 px-3 py-1.5 text-xs text-black shadow", children: "Hey! ✨" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl rounded-br-none bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow", children: "Looks great 💫" })
    ] })
  ] });
}
function ChatHeader(_props = {}) {
  const { state, isDM, dmUser, channelLabel, closeDM, setActive } = useChat();
  const { ignoreAllBots, setIgnoreAllBots } = useIgnore();
  const [wallpaperOpen, setWallpaperOpen] = reactExports.useState(false);
  const id = state.activeChannel;
  if (isDM(id)) {
    const u = dmUser(id);
    if (!u) return null;
    const ONLINE_WINDOW_MS = 5 * 60 * 1e3;
    const isOnline = u.isBot ? u.status !== "offline" : u.status === "online" && (!u.lastSeen || Date.now() - u.lastSeen <= ONLINE_WINDOW_MS);
    const statusLabel = isOnline ? "online" : "offline";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "chat-glass sticky top-0 z-20 flex h-16 items-center justify-between gap-3 px-6 pl-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: u, size: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 leading-tight", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate font-bold text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5 shrink-0 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: u.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-[11px] capitalize text-muted-foreground flex items-center gap-1.5", children: [
              isOnline && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-online-dot", "aria-hidden": true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isOnline ? "text-primary font-semibold" : "", children: statusLabel }),
              u.bio ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                "· ",
                u.bio
              ] }) : null
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setWallpaperOpen(true),
              "aria-label": "Personalize this chat",
              title: "Personalize this chat",
              className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                window.dispatchEvent(new CustomEvent("palrgo:minimizeMobileDM", { detail: { peerId: u.id } }));
                const fallback = state.roomOrder?.[0] || "lobby";
                setActive(fallback);
              },
              "aria-label": "Minimize DM",
              title: "Minimize",
              className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-foreground lg:hidden",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => closeDM(u.id),
              "aria-label": "Close DM",
              className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DMWallpaperSheet, { open: wallpaperOpen, onOpenChange: setWallpaperOpen, channelId: id })
    ] });
  }
  const room = state.rooms[id];
  if (!room) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "chat-glass sticky top-0 z-20 flex h-16 items-center justify-between gap-1.5 px-2 pl-12 sm:gap-2 sm:px-6 sm:pl-14", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        BrandMark,
        {
          slot: "chat",
          roomId: id,
          alt: "Room logo",
          className: "hidden h-9 w-9 shrink-0 rounded-xl object-contain ring-1 ring-border sm:block"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 sm:gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-bold text-foreground", children: channelLabel(id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoyaltyChip, { channelId: id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityEventsTicker, {}) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setIgnoreAllBots(!ignoreAllBots),
          title: ignoreAllBots ? "Show bot messages" : "Hide all bot messages",
          "aria-pressed": ignoreAllBots,
          className: `hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${ignoreAllBots ? "bg-destructive/15 text-destructive hover:bg-destructive/20" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`,
          children: [
            ignoreAllBots ? /* @__PURE__ */ jsxRuntimeExports.jsx(BotOff, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ignoreAllBots ? "Bots hidden" : "Bots on" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "chat-icon-btn",
          title: "Chatroom themes",
          "aria-label": "Chatroom themes",
          onClick: () => window.dispatchEvent(new Event("palrgo:open-chat-theme-store")),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => window.dispatchEvent(new Event("open-members-panel")),
          className: "chat-icon-btn relative lg:hidden",
          "aria-label": "Show members",
          title: "Members",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground", children: room.members.length > 99 ? "99+" : room.members.length })
          ]
        }
      )
    ] })
  ] });
}
function GameRoomCanvas({ room }) {
  const cfg = room.game;
  getGame(cfg?.type);
  {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid flex-1 place-items-center px-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex max-w-sm flex-col items-center gap-2 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 text-amber-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-foreground", children: "Game not configured" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
        "This game room has no game assigned. An admin can configure one from",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 rounded bg-muted px-1 py-0.5 font-mono text-[11px]", children: "/admin/chatrooms" }),
        "."
      ] })
    ] }) });
  }
}
function DMChatBackground({
  wallpaper,
  opacity = 1,
  blur = 0,
  brightness = 1,
  overlay = 0,
  paused = false
}) {
  const ref = reactExports.useRef(null);
  const bg = wallpaperBackground(wallpaper);
  reactExports.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.animationPlayState = paused ? "paused" : "running";
  }, [paused]);
  if (!wallpaper || !bg) return null;
  const isImage = wallpaper.kind === "image" || wallpaper.kind === "animated";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref,
      "aria-hidden": true,
      className: "pointer-events-none absolute inset-0 z-0 overflow-hidden",
      style: { opacity },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0",
            style: {
              background: bg,
              filter: `${blur ? `blur(${blur}px) ` : ""}brightness(${brightness})`,
              transform: blur ? "scale(1.05)" : void 0,
              // hide blur edges
              backgroundSize: isImage ? "cover" : void 0,
              backgroundPosition: isImage ? "center" : void 0,
              backgroundRepeat: isImage ? "no-repeat" : void 0,
              visibility: paused && wallpaper.kind === "animated" ? "hidden" : void 0
            }
          }
        ),
        overlay > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0",
            style: { background: `rgba(0,0,0,${overlay})` }
          }
        )
      ]
    }
  );
}
const heroBg = "/assets/gaming-arena-hero-BErXaHpM.jpg";
function GamingArenaHero({ channelId }) {
  const { state, channelLabel, channelMessages } = useChat();
  const room = state.rooms[channelId];
  const online = Math.max(1, room?.members?.length ?? 1);
  const label = channelLabel(channelId);
  const msgs = channelMessages(channelId);
  const messagesToday = reactExports.useMemo(() => {
    const start = /* @__PURE__ */ new Date();
    start.setHours(0, 0, 0, 0);
    return msgs.filter((m) => m.ts >= start.getTime() && m.kind !== "system").length;
  }, [msgs]);
  const roomIdShort = (channelId || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "GA245";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "arena-hero relative mx-2 mt-2 flex flex-col gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "arena-hero__banner relative overflow-hidden rounded-2xl border border-primary/30 shadow-[0_16px_48px_-20px_oklch(0.55_0.28_300/0.75)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: heroBg,
          alt: "",
          "aria-hidden": true,
          className: "absolute inset-0 h-full w-full object-cover opacity-90",
          width: 1600,
          height: 640,
          loading: "lazy"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-background/85 via-background/45 to-background/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(120%_80%_at_10%_20%,oklch(0.55_0.28_300/0.35),transparent_60%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-2 top-2 z-10 flex items-center gap-1.5 sm:right-3 sm:top-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "chat-icon-btn",
            title: "Chatroom themes",
            "aria-label": "Chatroom themes",
            onClick: () => window.dispatchEvent(new Event("palrgo:open-chat-theme-store")),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => window.dispatchEvent(new Event("open-members-panel")),
            className: "chat-icon-btn relative",
            "aria-label": "Show members",
            title: "Members",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground", children: online > 99 ? "99+" : online })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-3 p-2.5 pr-20 sm:p-3 sm:pr-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "data-level-ring": true,
            className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 text-primary-foreground shadow-lg sm:h-11 sm:w-11",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-white" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5 text-yellow-300" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "truncate text-base font-black tracking-wide sm:text-xl", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[11px] leading-tight text-muted-foreground sm:text-xs", children: room?.topic || "Where gamers unite & dominate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-1.5 text-[10px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-red-500/90 px-1.5 py-0.5 font-bold text-white shadow-[0_0_10px_-2px_oklch(0.65_0.25_25/0.9)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-white" }),
              " LIVE"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-background/60 px-1.5 py-0.5 font-semibold text-foreground backdrop-blur", children: [
              online.toLocaleString(),
              " Online"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-background/60 px-1.5 py-0.5 font-mono text-muted-foreground backdrop-blur", children: [
              "ID: #",
              roomIdShort
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "arena-ticker relative -mx-px overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "arena-ticker__track text-[11px] font-semibold", children: [
        { icon: "🎁", t: "Lucky Drop in 03:12" },
        { icon: "🔥", t: "Double XP Active" },
        { icon: "🏆", t: "Weekly Competition Live" },
        { icon: "🎙", t: "Live Radio: Neon Nights" },
        { icon: "⚡", t: "Server Boost x2" },
        { icon: "🎁", t: "Lucky Drop in 03:12" },
        { icon: "🔥", t: "Double XP Active" },
        { icon: "🏆", t: "Weekly Competition Live" },
        { icon: "🎙", t: "Live Radio: Neon Nights" },
        { icon: "⚡", t: "Server Boost x2" }
      ].map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-foreground/90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.t })
      ] }, i)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sr-only", "aria-live": "polite", children: [
      "Gaming Arena • ",
      online,
      " online • ",
      messagesToday,
      " messages today"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "hidden" })
  ] });
}
function useBotEventsNotifier() {
  useBotEvents();
  const chat = useOptionalChat();
  reactExports.useEffect(() => {
    if (!chat) return;
    const seen = /* @__PURE__ */ new Set();
    const NOTICE_KEY = "palrgo:bot-events:notified";
    const readNoticed = () => {
      try {
        return JSON.parse(localStorage.getItem(NOTICE_KEY) || "{}");
      } catch {
        return {};
      }
    };
    const markNoticed = (key) => {
      try {
        const m = readNoticed();
        m[key] = true;
        const keys = Object.keys(m);
        if (keys.length > 200) for (const k of keys.slice(0, keys.length - 200)) delete m[k];
        localStorage.setItem(NOTICE_KEY, JSON.stringify(m));
      } catch {
      }
    };
    const handler = (e) => {
      const detail = e.detail;
      const key = `${detail.cycleId}:${detail.live ? "open" : "closed"}`;
      if (seen.has(key)) return;
      seen.add(key);
      const noticed = readNoticed();
      if (noticed[key]) return;
      markNoticed(key);
      const meta = BOT_EVENT_META[detail.kind];
      const channelId = chat.state.activeChannel;
      if (channelId.startsWith("dm:")) return;
      const nextInMin = Math.max(1, detail.interval_min - detail.duration_min);
      const text = detail.live ? `${meta.emoji} **${detail.golden ? meta.goldenLabel : meta.label} is now LIVE!** ${detail.golden ? "✨ 2× rewards! " : ""}You have ${detail.duration_min} minutes to type **${meta.command}**.` : `⛔ ${meta.emoji} ${meta.label} has ended. Next round in ${nextInMin}m.`;
      chat.pushSystem(channelId, text);
    };
    window.addEventListener("palrgo:bot-event", handler);
    return () => window.removeEventListener("palrgo:bot-event", handler);
  }, [chat]);
}
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const ICONS = {
  owner: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3 text-warning" }),
  admin: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3 text-primary" }),
  mod: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldHalf, { className: "h-3 w-3 text-primary/70" }),
  member: null
};
function MemberRow({
  id,
  role,
  user,
  muted,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-white/5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(UserMenu, { userId: user.id, username: user.name, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user, size: 32 }),
      muted && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          title: "Muted in lobby",
          className: "absolute -bottom-0.5 -left-0.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-destructive-foreground shadow",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-2.5 w-2.5" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UserMenu, { userId: user.id, username: user.name, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate text-xs font-semibold text-foreground/90 hover:text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: user.id, name: user.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NameAdornments, { user }),
        ICONS[role],
        muted && /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-3 w-3 text-destructive" })
      ] }),
      (muted || user.isBot || user.isGuest) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: muted ? "Muted" : user.isBot ? "Bot" : "Guest" }) })
    ] }) }),
    id !== "me" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StaffActionsMenu, { targetUserId: user.id, targetName: user.name, isBot: user.isBot, size: "xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick,
          title: "Send DM",
          className: "shrink-0 rounded-full p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5" })
        }
      )
    ] })
  ] });
}
function MembersPanel({ roomId }) {
  const { state, startDM, closeDM, dmChannelFor, isDmUnread, dmUnreadCount } = useChat();
  const { user: authUser } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [showAllOffline, setShowAllOffline] = reactExports.useState(false);
  const [sheetOpen, setSheetOpen] = reactExports.useState(false);
  const [notifs, setNotifs] = reactExports.useState([]);
  const [friendIds, setFriendIds] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [searchOpen, setSearchOpen] = reactExports.useState(false);
  const [tab, setTab] = reactExports.useState("users");
  const isMobile = useIsMobile();
  const openDM = (id) => {
    if (!id || id === "me") return;
    if (isMobile) {
      startDM(id);
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("palrgo:openMiniDM", { detail: { peerId: id } }));
    }
  };
  const [botMode, setBotMode] = reactExports.useState(() => {
    if (typeof window === "undefined") return "auto";
    const v = window.localStorage.getItem("chat-bot-mode");
    return v === "split" || v === "merged" || v === "auto" ? v : "auto";
  });
  reactExports.useEffect(() => {
    try {
      window.localStorage.setItem("chat-bot-mode", botMode);
    } catch {
    }
  }, [botMode]);
  const meId = authUser?.id;
  reactExports.useEffect(() => {
    if (!meId) return;
    async function load() {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", meId).in("kind", ["friend_post", "friend_comment"]).order("created_at", { ascending: false }).limit(20);
      setNotifs(data ?? []);
    }
    load();
    const ch = supabase.channel(`notif-${meId}`).on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${meId}` }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [meId]);
  reactExports.useEffect(() => {
    const open = () => setSheetOpen(true);
    window.addEventListener("open-members-panel", open);
    return () => window.removeEventListener("open-members-panel", open);
  }, []);
  reactExports.useEffect(() => {
    if (!meId) return;
    async function loadFriends() {
      const { data } = await supabase.from("friendships").select("sender_id,receiver_id,status").eq("status", "accepted").or(`sender_id.eq.${meId},receiver_id.eq.${meId}`);
      const ids = (data ?? []).map((f) => f.sender_id === meId ? f.receiver_id : f.sender_id);
      setFriendIds(ids);
    }
    loadFriends();
    const ch = supabase.channel(`friends-${meId}`).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => loadFriends()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [meId]);
  const unreadCount = notifs.filter((n) => !n.read).length;
  async function markAllRead() {
    if (!meId || unreadCount === 0) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", meId).eq("read", false);
  }
  const room = state.rooms[roomId];
  const usersById = { ...state.users };
  Object.entries(profiles).forEach(([id, u]) => {
    if (authUser && id === authUser.id) return;
    usersById[id] = u;
  });
  const localIds = room?.members ?? [];
  const remoteIds = Object.keys(profiles).filter((id) => !authUser || id !== authUser.id);
  const allIds = Array.from(/* @__PURE__ */ new Set([...localIds, ...remoteIds]));
  const roleOrder = { owner: 0, admin: 1, mod: 2, member: 3 };
  const ONLINE_WINDOW_MS = 5 * 60 * 1e3;
  const now = Date.now();
  const isOnline = (id) => {
    const u = usersById[id];
    if (!u) return false;
    if (u.isBot) return u.status !== "offline";
    if (u.status !== "online") return false;
    if (u.lastSeen && now - u.lastSeen > ONLINE_WINDOW_MS) return false;
    return true;
  };
  const q = search.trim().toLowerCase();
  const matchesQuery = (id) => {
    if (!q) return true;
    const name = (usersById[id]?.name || "").toLowerCase();
    return name.includes(q);
  };
  const online = allIds.filter((id) => isOnline(id) && !usersById[id]?.isGuest && matchesQuery(id)).sort((a, b) => {
    const ra = roleOrder[room?.roles[a] || "member"];
    const rb = roleOrder[room?.roles[b] || "member"];
    if (ra !== rb) return ra - rb;
    return (usersById[a]?.name || "").localeCompare(usersById[b]?.name || "");
  });
  const offlineSorted = allIds.filter((id) => !isOnline(id) && !usersById[id]?.isGuest && matchesQuery(id)).sort((a, b) => (usersById[b]?.lastSeen ?? 0) - (usersById[a]?.lastSeen ?? 0));
  const OFFLINE_MIN = 20;
  const offline = showAllOffline || q ? offlineSorted : offlineSorted.slice(0, OFFLINE_MIN);
  const hiddenOffline = offlineSorted.length - offline.length;
  const isBot = (id) => !!usersById[id]?.isBot;
  const onlineUsers = reactExports.useMemo(() => online.filter((id) => !isBot(id)), [online]);
  const onlineBots = reactExports.useMemo(() => online.filter((id) => isBot(id)), [online]);
  const offlineUsers = reactExports.useMemo(() => offline.filter((id) => !isBot(id)), [offline]);
  const offlineSortedUsers = reactExports.useMemo(() => offlineSorted.filter((id) => !isBot(id)), [offlineSorted]);
  const hiddenOfflineUsers = offlineSortedUsers.length - offlineUsers.length;
  const totalUsersCount = allIds.filter((id) => !isBot(id) && !usersById[id]?.isGuest).length;
  const totalBotsCount = allIds.filter((id) => isBot(id)).length;
  const effectiveMode = botMode === "auto" ? onlineUsers.length >= 8 ? "split" : "merged" : botMode;
  const meRole = meId && room?.roles[meId] || "member";
  const isStaff = meRole === "owner" || meRole === "admin";
  reactExports.useEffect(() => {
    if (tab === "bots" && (effectiveMode === "merged" || totalBotsCount === 0)) {
      setTab("users");
    }
  }, [tab, effectiveMode, totalBotsCount]);
  const hubBadge = useHubBadge(false);
  if (!room) return null;
  const renderMemberRow = (id, onClick) => {
    const u = usersById[id];
    if (!u) return null;
    const lobbyMod = state.moderation?.["lobby"]?.[id];
    const muted = !!(lobbyMod?.mutedUntil && lobbyMod.mutedUntil > Date.now());
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MemberRow,
      {
        id,
        role: room.roles[id] || "member",
        user: u,
        muted,
        onClick
      }
    );
  };
  const body = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-0 px-3 pt-2 pr-12 lg:pr-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          title: "Community Hub",
          "aria-label": "Open Community Hub",
          onClick: () => window.dispatchEvent(new Event("palrgo:open-hub")),
          className: "relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5 fill-yellow-400 text-yellow-400" }),
            hubBadge > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground", children: hubBadge > 9 ? "9+" : hubBadge })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            title: "Direct messages",
            "aria-label": "Direct messages",
            className: "relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "h-5 w-5" }),
              dmUnreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "unread-pop absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground",
                  children: dmUnreadCount > 9 ? "9+" : dmUnreadCount
                },
                `dm-${dmUnreadCount}`
              )
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { children: "Direct messages" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
          state.dmOrder.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-3 text-xs text-muted-foreground", children: "No conversations yet. Click a member to start one." }) : state.dmOrder.map((uid) => {
            const u = state.users[uid];
            if (!u) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DropdownMenuItem,
              {
                onSelect: (e) => {
                  e.preventDefault();
                  openDM(uid);
                },
                className: "gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: u, size: 24 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: u.id, name: u.name }) }),
                  isDmUnread(uid) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "unread-pop unread-dot-primary ml-1 h-1.5 w-1.5 rounded-full bg-primary", title: "Unread" }, "dm-unread"),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `ml-auto h-2 w-2 rounded-full ${u.status === "online" ? "bg-primary" : "bg-muted-foreground/40"}`
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        closeDM(uid);
                      },
                      title: "Close DM",
                      "aria-label": "Close DM",
                      className: "grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
                    }
                  )
                ]
              },
              uid
            );
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { onOpenChange: (open) => {
        if (!open) void markAllRead();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            title: "Notifications",
            "aria-label": "Notifications",
            className: "relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }),
              unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "unread-pop absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground",
                  children: unreadCount > 9 ? "9+" : unreadCount
                },
                `notif-${unreadCount}`
              )
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-72 max-h-96 overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { children: "Notifications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
          notifs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-3 text-xs text-muted-foreground", children: "You're all caught up." }) : notifs.map((n) => {
            const actor = n.actor_id ? usersById[n.actor_id] ?? profiles[n.actor_id] : null;
            const verb = n.kind === "friend_post" ? "shared a new post" : "commented on a post";
            const preview = n.payload?.text;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { asChild: true, className: !n.read ? "bg-primary/5" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed", className: "flex items-start gap-2 py-2", children: [
              actor ? /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: actor, size: 28 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-full bg-muted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: actor?.name ?? "A friend" }),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: verb })
                ] }),
                preview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-muted-foreground", children: preview }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground/70", children: new Date(n.created_at).toLocaleString() })
              ] }),
              !n.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" })
            ] }) }, n.id);
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          title: "3 Some Rooms",
          "aria-label": "Open 3 Some Rooms",
          onClick: () => window.dispatchEvent(new CustomEvent("trio:open-launcher")),
          className: "relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-400 text-white shadow-[0_0_12px_-2px_rgba(236,72,153,0.7)] ring-1 ring-white/20 transition-transform hover:scale-110 hover:shadow-[0_0_16px_-1px_rgba(236,72,153,0.9)]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 drop-shadow" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute inset-0 rounded-full ring-2 ring-fuchsia-400/40 animate-pulse" })
          ]
        }
      ),
      isStaff && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            title: "Member list mode",
            "aria-label": "Member list mode",
            className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-5 w-5" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-52", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { children: "Members list mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
          [
            { v: "auto", label: "Auto", hint: "Split when 8+ users online" },
            { v: "split", label: "Split users & bots", hint: "Always separate sections" },
            { v: "merged", label: "Merge lists", hint: "Single combined list" }
          ].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DropdownMenuItem,
            {
              onSelect: (e) => {
                e.preventDefault();
                setBotMode(opt.v);
              },
              className: "flex items-start gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: `mt-0.5 h-3.5 w-3.5 shrink-0 ${botMode === opt.v ? "opacity-100 text-primary" : "opacity-0"}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold", children: opt.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: opt.hint })
                ] })
              ]
            },
            opt.v
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/feed?tab=account",
          target: "_blank",
          rel: "noopener noreferrer",
          title: "Profile settings (opens in new tab)",
          "aria-label": "Profile settings",
          className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "h-5 w-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 px-2 pt-1.5", children: [
      isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSheetOpen(false),
          title: "Close",
          "aria-label": "Close members panel",
          className: "grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      ),
      [
        {
          key: "users",
          label: "Users",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "h-3.5 w-3.5" }),
          count: effectiveMode === "merged" ? totalUsersCount + totalBotsCount : totalUsersCount
        },
        {
          key: "friends",
          label: "Friends",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-3.5 w-3.5" }),
          count: friendIds.length
        },
        ...effectiveMode === "split" && totalBotsCount > 0 ? [{
          key: "bots",
          label: "Bots",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3.5 w-3.5" }),
          count: totalBotsCount
        }] : []
      ].map((t) => {
        const active = tab === t.key;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setTab(t.key),
            title: t.label,
            "aria-pressed": active,
            className: `flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition-colors ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`,
            children: [
              t.icon,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: t.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] tabular-nums ${active ? "opacity-90" : "opacity-70"}`, children: t.count })
            ]
          },
          t.key
        );
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSearchOpen((s) => !s),
          title: "Search",
          "aria-label": "Toggle search",
          "aria-pressed": searchOpen,
          className: `grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${searchOpen ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" })
        }
      )
    ] }),
    searchOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-3 mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          autoFocus: true,
          type: "text",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: `Search ${tab}…`,
          className: "w-full rounded-full bg-white/5 py-1.5 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary"
        }
      ),
      search && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSearch(""),
          "aria-label": "Clear search",
          className: "absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
        }
      )
    ] }),
    tab === "friends" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-2", children: friendIds.filter(matchesQuery).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-8 text-center text-xs text-muted-foreground", children: q ? "No friends match your search." : "No friends yet. Add some from the feed or click a member to start." }) : friendIds.filter(matchesQuery).slice().sort((a, b) => {
      const ao = isOnline(a) ? 0 : 1;
      const bo = isOnline(b) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return (usersById[a]?.name || profiles[a]?.name || "").localeCompare(usersById[b]?.name || profiles[b]?.name || "");
    }).map((id) => {
      const activeInRoom = isOnline(id) && room.members.includes(id);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: activeInRoom ? "rounded-xl ring-1 ring-primary/40 bg-primary/5" : "",
          title: activeInRoom ? "Active in this room" : void 0,
          children: renderMemberRow(id, () => openDM(id))
        },
        id
      );
    }) }) : tab === "bots" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-2", children: onlineBots.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-6 text-center text-xs text-muted-foreground", children: q ? "No bots match your search." : "No bots available." }) : onlineBots.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: renderMemberRow(id, () => openDM(id)) }, id)) }) : (
      // Users tab — in merged mode bots are included via `online`/`offline`; in split mode bots are excluded.
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-4 overflow-y-auto px-3 pb-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: (effectiveMode === "split" ? onlineUsers : online).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-6 text-center text-xs text-muted-foreground", children: q ? "No users match your search." : "No users online." }) : (effectiveMode === "split" ? onlineUsers : online).map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: renderMemberRow(id, () => openDM(id)) }, id)) }),
        (effectiveMode === "split" ? offlineUsers : offline).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60", children: [
            "Offline — ",
            (effectiveMode === "split" ? offlineSortedUsers : offlineSorted).length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 opacity-60", children: (effectiveMode === "split" ? offlineUsers : offline).map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: renderMemberRow(id, () => openDM(id)) }, id)) }),
          (effectiveMode === "split" ? hiddenOfflineUsers : hiddenOffline) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowAllOffline(true),
              className: "mt-2 w-full rounded-full px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary",
              children: [
                "Show ",
                effectiveMode === "split" ? hiddenOfflineUsers : hiddenOffline,
                " more"
              ]
            }
          ),
          showAllOffline && offlineSorted.length > OFFLINE_MIN && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setShowAllOffline(false),
              className: "mt-2 w-full rounded-full px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary",
              children: "Show less"
            }
          )
        ] })
      ] })
    )
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden h-full w-60 shrink-0 flex-col border-l border-border bg-card lg:flex", children: body }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: sheetOpen, onOpenChange: setSheetOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetContent, { side: "right", className: "w-72 bg-card p-0 flex flex-col", children: body }) })
  ] });
}
function TypingIndicator({
  typers,
  className = ""
}) {
  if (typers.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1.5 px-3 py-1 text-[11px] italic text-muted-foreground ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex gap-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 animate-bounce rounded-full bg-primary" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: typers.length === 1 ? `${typers[0].name} is typing…` : typers.length === 2 ? `${typers[0].name} and ${typers[1].name} are typing…` : `${typers.length} people are typing…` })
  ] });
}
const MAX_OPEN = 2;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
function FloatingDMDock() {
  const chat = useChat();
  const { state, send, dmChannelFor, startDM, setActive } = chat;
  const { user: authUser } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = reactExports.useState([]);
  const [minimized, setMinimized] = reactExports.useState([]);
  const [leaving, setLeaving] = reactExports.useState({});
  function bumpToTop(peerId) {
    setOpen((curr) => curr[curr.length - 1] === peerId ? curr : [...curr.filter((id) => id !== peerId), peerId]);
  }
  reactExports.useEffect(() => {
    function onOpen(e) {
      const ce = e;
      const peerId = ce.detail?.peerId;
      if (!peerId || peerId === "me") return;
      if (isMobile) {
        startDM(peerId);
        return;
      }
      setMinimized((m) => m.filter((id) => id !== peerId));
      setOpen((curr) => {
        if (curr.includes(peerId)) {
          return curr[curr.length - 1] === peerId ? curr : [...curr.filter((id) => id !== peerId), peerId];
        }
        if (curr.length < MAX_OPEN) return [...curr, peerId];
        const [oldest, ...rest] = curr;
        setLeaving((l) => ({ ...l, [oldest]: "minimize" }));
        window.setTimeout(() => {
          setLeaving((l) => {
            const { [oldest]: _gone, ...next } = l;
            return next;
          });
          setMinimized((m) => m.includes(oldest) ? m : [oldest, ...m]);
        }, 180);
        return [...rest, peerId];
      });
    }
    window.addEventListener("palrgo:openMiniDM", onOpen);
    return () => window.removeEventListener("palrgo:openMiniDM", onOpen);
  }, [isMobile, startDM]);
  reactExports.useEffect(() => {
    if (isMobile) {
      setOpen([]);
      setMinimized([]);
      setLeaving({});
    }
  }, [isMobile]);
  const closeWindow = reactExports.useCallback((peerId) => {
    setLeaving((l) => ({ ...l, [peerId]: "close" }));
    window.setTimeout(() => {
      setOpen((o) => o.filter((id) => id !== peerId));
      setMinimized((m) => m.filter((id) => id !== peerId));
      setLeaving((l) => {
        const { [peerId]: _gone, ...rest } = l;
        return rest;
      });
    }, 160);
  }, []);
  const minimizeWindow = reactExports.useCallback((peerId) => {
    setLeaving((l) => ({ ...l, [peerId]: "minimize" }));
    window.setTimeout(() => {
      setOpen((o) => o.filter((id) => id !== peerId));
      setMinimized((m) => m.includes(peerId) ? m : [peerId, ...m]);
      setLeaving((l) => {
        const { [peerId]: _gone, ...rest } = l;
        return rest;
      });
    }, 180);
  }, []);
  const restoreWindow = reactExports.useCallback((peerId) => {
    setMinimized((m) => m.filter((id) => id !== peerId));
    setOpen((curr) => {
      if (curr.includes(peerId)) return curr;
      if (curr.length < MAX_OPEN) return [...curr, peerId];
      const [oldest, ...rest] = curr;
      setLeaving((l) => ({ ...l, [oldest]: "minimize" }));
      window.setTimeout(() => {
        setLeaving((l) => {
          const { [oldest]: _gone, ...next } = l;
          return next;
        });
        setMinimized((m) => m.includes(oldest) ? m : [oldest, ...m]);
      }, 180);
      return [...rest, peerId];
    });
  }, []);
  reactExports.useEffect(() => {
    if (!authUser?.id || open.length === 0) return;
    const meId = authUser.id;
    open.forEach((peerId) => {
      const ch = dmChannelFor(peerId);
      if (!ch || !isRemoteDmChannel(ch, meId)) return;
      void supabase.from("dm_reads").upsert(
        { user_id: meId, channel_id: ch, last_read_at: (/* @__PURE__ */ new Date()).toISOString() },
        { onConflict: "user_id,channel_id" }
      );
    });
  }, [open, authUser?.id, dmChannelFor, state.messages]);
  if (isMobile) return null;
  if (!authUser?.id) return null;
  if (open.length === 0 && minimized.length === 0) return null;
  const visibleMinimized = minimized.slice(0, 4);
  const moreMinimized = Math.max(0, minimized.length - visibleMinimized.length);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none fixed bottom-0 right-4 z-40 hidden items-end gap-3 lg:flex", children: [
    (visibleMinimized.length > 0 || moreMinimized > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto mb-3 flex items-end gap-2", children: [
      visibleMinimized.map((peerId) => {
        const u = state.users[peerId];
        if (!u) return null;
        const unread = chat.isDmUnread(peerId);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => restoreWindow(peerId),
            title: u.name,
            className: "group relative rounded-full bg-card/80 p-0.5 shadow-lg ring-1 ring-border backdrop-blur-md transition-all duration-200 hover:scale-110 animate-scale-in",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: u, size: 36 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${u.status === "online" ? "bg-emerald-500" : "bg-muted-foreground/50"}`
                }
              ),
              unread && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "unread-pop unread-dot absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card",
                  children: "•"
                },
                "unread"
              )
            ]
          },
          peerId
        );
      }),
      moreMinimized > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "grid h-9 min-w-[36px] place-items-center rounded-full bg-card/80 px-2 text-[11px] font-bold text-foreground shadow-lg ring-1 ring-border backdrop-blur-md",
          title: `${moreMinimized} more DM${moreMinimized === 1 ? "" : "s"}`,
          children: [
            "+",
            moreMinimized
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-auto flex items-end gap-3", children: open.map((peerId) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MiniDMWindow,
      {
        peerId,
        leavingMode: leaving[peerId],
        onClose: () => closeWindow(peerId),
        onMinimize: () => minimizeWindow(peerId),
        onOpenFull: () => {
          const ch = dmChannelFor(peerId);
          if (ch) setActive(ch);
        },
        onActivity: () => bumpToTop(peerId),
        send,
        dmChannelFor
      },
      peerId
    )) })
  ] });
}
function MiniDMWindow({
  peerId,
  leavingMode,
  onClose,
  onMinimize,
  onOpenFull,
  onActivity,
  send,
  dmChannelFor
}) {
  const chat = useChat();
  const { state } = chat;
  const unread = chat.isDmUnread(peerId);
  const u = state.users[peerId];
  const channelId = dmChannelFor(peerId);
  if (!channelId || !u) return null;
  const me = state.users.me;
  const meForTyping = me && !me.isGuest ? { id: me.id, name: me.name } : null;
  const { typers, sendTyping } = useTyping(channelId, meForTyping, !!meForTyping);
  const [text, setText] = reactExports.useState("");
  const [attachment, setAttachment] = reactExports.useState(null);
  const [attachError, setAttachError] = reactExports.useState("");
  const [deleting, setDeleting] = reactExports.useState(false);
  const inputRef = reactExports.useRef(null);
  const fileRef = reactExports.useRef(null);
  const deleteDm = useServerFn(deleteMyDmConversation);
  reactExports.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  if (!u) return null;
  const submit = () => {
    const t = text.trim();
    if (!t && !attachment) return;
    send(t, { channelId, attachment: attachment ?? void 0 });
    setText("");
    setAttachment(null);
    setAttachError("");
    onActivity();
  };
  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAttachError("");
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachError(`Max ${(MAX_ATTACHMENT_BYTES / 1024 / 1024).toFixed(0)}MB`);
      return;
    }
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      setAttachment({
        kind: file.type.startsWith("image/") ? "image" : "file",
        name: file.name.slice(0, 120),
        mime: file.type || "application/octet-stream",
        size: file.size,
        dataUrl
      });
    } catch {
      setAttachError("Couldn't read file");
    }
  }
  const isLeaving = !!leavingMode;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onMouseDown: onActivity,
      className: `flex h-[440px] w-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl origin-bottom-right transition-all duration-200 ease-out ${isLeaving ? "scale-90 opacity-0 translate-y-3" : "scale-100 opacity-100 translate-y-0 animate-scale-in"}`,
      style: { boxShadow: "var(--shadow-glow, 0 10px 40px rgba(0,0,0,.35))" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border bg-card/70 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpenFull, className: "relative flex min-w-0 flex-1 items-center gap-2 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: u, size: 28 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${u.status === "online" ? "bg-emerald-500" : "bg-muted-foreground/50"}`
                }
              ),
              unread && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "unread-pop unread-dot absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card",
                  title: "Unread"
                },
                "hdr-unread"
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: u.id, name: u.name }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[10px] text-muted-foreground", children: u.status === "online" ? "Online" : u.isBot ? "Bot" : "Offline" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              disabled: deleting,
              onClick: async () => {
                if (!window.confirm(`Delete the entire chat with ${u.name}? This removes messages for both of you and cannot be undone.`)) return;
                setDeleting(true);
                try {
                  await deleteDm({ data: { peerId: u.id } });
                  onClose();
                } catch (e) {
                  alert(e.message || "Failed to delete chat");
                } finally {
                  setDeleting(false);
                }
              },
              title: "Delete chat",
              className: "grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:opacity-50",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: onMinimize,
              title: "Minimize",
              className: "grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: onClose,
              title: "Close",
              className: "grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-0 flex-1 flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageList, { channelId }) }),
        attachment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-2 mb-1 mt-1 flex items-center gap-2 rounded-xl border border-border bg-white/5 px-2 py-1.5", children: [
          attachment.kind === "image" ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: attachment.dataUrl, alt: attachment.name, className: "h-9 w-9 rounded-md object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-md bg-white/5 text-base", children: "📎" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: attachment.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
              (attachment.size / 1024).toFixed(1),
              " KB"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setAttachment(null),
              className: "text-muted-foreground hover:text-destructive",
              "aria-label": "Remove attachment",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        attachError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-1 text-[11px] text-destructive", children: attachError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TypingIndicator, { typers }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 border-t border-border bg-card/70 px-2 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              onChange: onFile,
              className: "hidden",
              accept: "image/*,application/pdf,text/plain,.zip,.doc,.docx"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              title: "Attach file",
              onClick: () => fileRef.current?.click(),
              className: "grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              title: "Emoji",
              className: "grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
              onClick: () => setText((t) => t + "😊"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: inputRef,
              value: text,
              onChange: (e) => {
                setText(e.target.value);
                sendTyping();
              },
              onFocus: onActivity,
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              },
              placeholder: `Message ${u.name}…`,
              className: "min-w-0 flex-1 rounded-full bg-muted/40 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 focus:bg-muted/60"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: submit,
              disabled: !text.trim() && !attachment,
              title: "Send",
              className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
            }
          )
        ] })
      ]
    }
  );
}
function MobileDMMinimizedDock() {
  const isMobile = useIsMobile();
  const chat = useChat();
  const { state, setActive, dmChannelFor, isDmUnread } = chat;
  const [minimized, setMinimized] = reactExports.useState([]);
  reactExports.useEffect(() => {
    function onMinimize(e) {
      const ce = e;
      const peerId = ce.detail?.peerId;
      if (!peerId) return;
      setMinimized((m) => (m.includes(peerId) ? m : [peerId, ...m]).slice(0, 6));
    }
    window.addEventListener("palrgo:minimizeMobileDM", onMinimize);
    return () => window.removeEventListener("palrgo:minimizeMobileDM", onMinimize);
  }, []);
  reactExports.useEffect(() => {
    if (minimized.length === 0) return;
    setMinimized((m) => m.filter((peerId) => dmChannelFor(peerId) !== state.activeChannel));
  }, [state.activeChannel, dmChannelFor, minimized.length]);
  if (!isMobile || minimized.length === 0) return null;
  const restore = (peerId) => {
    const ch = dmChannelFor(peerId);
    if (!ch) return;
    setActive(ch);
    setMinimized((m) => m.filter((id) => id !== peerId));
  };
  const close = (peerId) => {
    setMinimized((m) => m.filter((id) => id !== peerId));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none fixed bottom-20 right-3 z-40 flex flex-col items-end gap-2 lg:hidden", children: minimized.map((peerId) => {
    const u = state.users[peerId];
    if (!u) return null;
    const unread = isDmUnread(peerId);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto relative animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => restore(peerId),
          title: u.name,
          className: "group relative rounded-full bg-card/90 p-0.5 shadow-2xl ring-2 ring-primary/40 backdrop-blur-md transition-transform hover:scale-110",
          style: { boxShadow: "var(--shadow-glow, 0 10px 30px rgba(0,0,0,.45))" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: u, size: 48 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${u.status === "online" ? "bg-emerald-500" : "bg-muted-foreground/50"}`
              }
            ),
            unread && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "unread-pop unread-dot absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card", children: "•" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => close(peerId),
          "aria-label": "Close minimized DM",
          className: "absolute -top-1 -left-1 grid h-5 w-5 place-items-center rounded-full bg-card text-muted-foreground shadow ring-1 ring-border transition hover:bg-destructive/15 hover:text-destructive",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
        }
      )
    ] }, peerId);
  }) });
}
function TrioRoomsDock() {
  const { user } = useAuth();
  useIsMobile();
  const [openRooms, setOpenRooms] = reactExports.useState([]);
  const [minimized, setMinimized] = reactExports.useState([]);
  const [invites, setInvites] = reactExports.useState([]);
  const [showCreate, setShowCreate] = reactExports.useState(false);
  const [showLauncher, setShowLauncher] = reactExports.useState(false);
  const [unread, setUnread] = reactExports.useState({});
  const [acceptedRooms, setAcceptedRooms] = reactExports.useState([]);
  const openRoomIdRef = reactExports.useRef(null);
  const uid = user?.id;
  reactExports.useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const [rooms, members] = await Promise.all([listMyRooms(), listMyMemberships()]);
        if (cancelled) return;
        const acceptedRoomIds = new Set(
          members.filter((m) => m.status === "accepted").map((m) => m.room_id)
        );
        const invitedIds = members.filter((m) => m.status === "invited").map((m) => m.room_id);
        const roomById = new Map(rooms.map((r) => [r.id, r]));
        const inv = [];
        for (const rid of invitedIds) {
          const r = roomById.get(rid);
          if (r)
            inv.push({
              roomId: r.id,
              roomName: r.name,
              ownerId: r.owner_id,
              passwordRequired: false
            });
        }
        setInvites(inv);
        const accepted = [];
        for (const rid of acceptedRoomIds) {
          const r = roomById.get(rid);
          if (r) accepted.push({ id: r.id, name: r.name, ownerId: r.owner_id });
        }
        setAcceptedRooms(accepted);
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);
  reactExports.useEffect(() => {
    const onOpenCreate = () => setShowCreate(true);
    const onOpenLauncher = () => setShowLauncher(true);
    window.addEventListener("trio:open-create", onOpenCreate);
    window.addEventListener("trio:open-launcher", onOpenLauncher);
    return () => {
      window.removeEventListener("trio:open-create", onOpenCreate);
      window.removeEventListener("trio:open-launcher", onOpenLauncher);
    };
  }, []);
  reactExports.useEffect(() => {
    if (!uid) return;
    const ch = supabase.channel(`trio-invites-${uid}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "trio_room_members",
        filter: `user_id=eq.${uid}`
      },
      async (payload) => {
        const row = payload.new;
        if (row.status !== "invited") return;
        const { data: r } = await supabase.from("trio_rooms").select("id,name,owner_id").eq("id", row.room_id).maybeSingle();
        if (!r) return;
        setInvites(
          (prev) => prev.some((p) => p.roomId === r.id) ? prev : [
            ...prev,
            { roomId: r.id, roomName: r.name, ownerId: r.owner_id, passwordRequired: false }
          ]
        );
      }
    ).subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [uid]);
  const openRoom = reactExports.useCallback((room) => {
    setOpenRooms((prevOpen) => {
      const others = prevOpen.filter((r) => r.id !== room.id);
      if (others.length > 0) {
        setMinimized((m) => {
          const next = [...m];
          for (const o of others) if (!next.some((n) => n.id === o.id)) next.push(o);
          return next;
        });
      }
      return [room];
    });
    setMinimized((m) => m.filter((r) => r.id !== room.id));
    setUnread((u) => u[room.id] ? { ...u, [room.id]: 0 } : u);
    openRoomIdRef.current = room.id;
    setAcceptedRooms((prev) => prev.some((r) => r.id === room.id) ? prev : [...prev, room]);
  }, []);
  reactExports.useEffect(() => {
    openRoomIdRef.current = openRooms[0]?.id ?? null;
  }, [openRooms]);
  reactExports.useEffect(() => {
    if (!uid || acceptedRooms.length === 0) return;
    const channels = acceptedRooms.map((room) => {
      const channelId = trioChannel(room.id);
      return supabase.channel(`trio-unread-${room.id}`).on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          const row = payload.new;
          if (row.author_id === uid) return;
          if (openRoomIdRef.current === room.id) return;
          setUnread((u) => ({ ...u, [room.id]: (u[room.id] ?? 0) + 1 }));
          setMinimized((m) => m.some((r) => r.id === room.id) ? m : [...m, room]);
        }
      ).subscribe();
    });
    return () => {
      for (const ch of channels) void supabase.removeChannel(ch);
    };
  }, [uid, acceptedRooms]);
  reactExports.useEffect(() => {
    if (!uid) return;
    const ch = supabase.channel(`trio-membership-${uid}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "trio_room_members", filter: `user_id=eq.${uid}` },
      async (payload) => {
        const row = payload.new ?? payload.old;
        if (!row) return;
        const newStatus = payload.new?.status;
        if (payload.eventType === "DELETE" || newStatus === "removed") {
          setAcceptedRooms((prev) => prev.filter((r) => r.id !== row.room_id));
          return;
        }
        if (newStatus === "accepted") {
          const { data: r } = await supabase.from("trio_rooms").select("id,name,owner_id").eq("id", row.room_id).maybeSingle();
          if (!r) return;
          setAcceptedRooms(
            (prev) => prev.some((p) => p.id === r.id) ? prev : [...prev, { id: r.id, name: r.name, ownerId: r.owner_id }]
          );
        }
      }
    ).subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [uid]);
  const closeWindow = (id) => {
    setOpenRooms((o) => o.filter((r) => r.id !== id));
    setMinimized((m) => m.filter((r) => r.id !== id));
  };
  const minimizeWindow = (room) => {
    setOpenRooms((o) => o.filter((r) => r.id !== room.id));
    setMinimized((m) => m.some((r) => r.id === room.id) ? m : [...m, room]);
  };
  async function handleAccept(inv, password) {
    try {
      await acceptInvite(inv.roomId, password);
      setInvites((prev) => prev.filter((p) => p.roomId !== inv.roomId));
      openRoom({ id: inv.roomId, name: inv.roomName, ownerId: inv.ownerId });
    } catch (e) {
      alert(e.message || "Could not join");
    }
  }
  async function handleReject(inv) {
    await rejectInvite(inv.roomId);
    setInvites((prev) => prev.filter((p) => p.roomId !== inv.roomId));
  }
  if (!uid) return null;
  const visibleMinimized = minimized.slice(0, 4);
  const moreMinimized = Math.max(0, minimized.length - visibleMinimized.length);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    (openRooms.length > 0 || visibleMinimized.length > 0 || moreMinimized > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none fixed bottom-0 right-4 z-40 flex max-w-[calc(100vw-1rem)] items-end gap-3", children: [
      (visibleMinimized.length > 0 || moreMinimized > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto mb-3 flex items-end gap-2", children: [
        visibleMinimized.map((room) => {
          const count = unread[room.id] ?? 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => openRoom(room),
              title: room.name,
              className: "group relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-400 text-white shadow-[0_0_12px_-2px_rgba(236,72,153,0.7)] ring-1 ring-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:shadow-[0_0_16px_-1px_rgba(236,72,153,0.9)] animate-scale-in",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 drop-shadow" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute inset-0 rounded-full ring-2 ring-fuchsia-400/40 animate-pulse" }),
                count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "unread-pop absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card", children: count > 99 ? "99+" : count })
              ]
            },
            room.id
          );
        }),
        moreMinimized > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "grid h-10 min-w-10 place-items-center rounded-full bg-card/80 px-2 text-[11px] font-bold text-foreground shadow-lg ring-1 ring-border backdrop-blur-md",
            title: `${moreMinimized} more private room${moreMinimized === 1 ? "" : "s"}`,
            children: [
              "+",
              moreMinimized
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-auto flex items-end gap-3", children: openRooms.map((room) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TrioRoomWindow,
        {
          room,
          meId: uid,
          onClose: () => closeWindow(room.id),
          onMinimize: () => minimizeWindow(room)
        },
        room.id
      )) })
    ] }),
    showCreate && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreateRoomDialog,
      {
        onClose: () => setShowCreate(false),
        onCreated: (r) => {
          setShowCreate(false);
          openRoom({ id: r.id, name: r.name, ownerId: r.owner_id });
        }
      }
    ),
    showLauncher && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LauncherDialog,
      {
        rooms: acceptedRooms,
        invites,
        unread,
        onClose: () => setShowLauncher(false),
        onOpenRoom: (r) => {
          setShowLauncher(false);
          openRoom(r);
        },
        onCreate: () => {
          setShowLauncher(false);
          setShowCreate(true);
        },
        onAccept: async (inv, pwd) => {
          await handleAccept(inv, pwd);
          setShowLauncher(false);
        },
        onReject: handleReject
      }
    )
  ] });
}
function LauncherDialog({
  rooms,
  invites,
  unread,
  onClose,
  onOpenRoom,
  onCreate,
  onAccept,
  onReject
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "w-[22rem] max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-2xl animate-scale-in",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-fuchsia-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "3 Some Rooms" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: onCreate,
                className: "mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                  "Create new room"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Your rooms" }),
            rooms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground", children: "You're not in any private rooms yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1.5", children: rooms.map((r) => {
              const count = unread[r.id] ?? 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => onOpenRoom(r),
                  className: "flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition hover:border-primary/50 hover:bg-primary/5",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 truncate", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-fuchsia-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: r.name })
                    ] }),
                    count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground", children: count > 99 ? "99+" : count })
                  ]
                },
                r.id
              );
            }) }),
            invites.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Pending invites" }),
              invites.map((inv) => /* @__PURE__ */ jsxRuntimeExports.jsx(InviteCard, { inv, onAccept, onReject }, inv.roomId))
            ] })
          ]
        }
      )
    }
  );
}
function InviteCard({
  inv,
  onAccept,
  onReject
}) {
  const chat = useChat();
  const ownerName = chat.state.users[inv.ownerId]?.name ?? "Someone";
  const [pwd, setPwd] = reactExports.useState("");
  const [balance, setBalance] = reactExports.useState(null);
  const cost = TRIO_JOIN_COST;
  reactExports.useEffect(() => {
    getMyCoins().then(setBalance).catch(() => setBalance(0));
  }, []);
  const insufficient = balance !== null && balance < cost;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded-xl border border-primary/30 bg-primary/5 p-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: ownerName }),
      " invited you to"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 truncate text-sm font-semibold", children: [
      "Join ",
      inv.roomName
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center justify-between rounded-md bg-background/60 px-2 py-1 text-[10px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Cost" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-amber-500", children: [
        "🪙 ",
        cost
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center justify-between px-2 text-[10px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Your balance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold ${insufficient ? "text-destructive" : "text-foreground"}`, children: balance === null ? "…" : `🪙 ${balance.toLocaleString()}` })
    ] }),
    insufficient && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 rounded-md bg-destructive/10 px-2 py-1 text-[10px] text-destructive", children: "Not enough coins. Earn more by chatting, posting, or completing daily missions." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value: pwd,
        onChange: (e) => setPwd(e.target.value),
        placeholder: "Password (if required)",
        className: "mt-1.5 w-full rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-primary"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => onAccept(inv, pwd || void 0),
          disabled: insufficient,
          className: "flex-1 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
          children: insufficient ? "Need coins" : `Join · 🪙${cost}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => onReject(inv),
          className: "flex-1 rounded-md bg-muted/40 px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted/60",
          children: "Reject"
        }
      )
    ] })
  ] });
}
function CreateRoomDialog({
  onClose,
  onCreated
}) {
  const [name, setName] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [hidden, setHidden] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState("");
  const [balance, setBalance] = reactExports.useState(null);
  const createCost = TRIO_CREATE_COST;
  const joinCost = TRIO_JOIN_COST;
  reactExports.useEffect(() => {
    getMyCoins().then(setBalance).catch(() => setBalance(0));
  }, []);
  const insufficient = balance !== null && balance < createCost;
  async function submit() {
    setErr("");
    if (!name.trim()) {
      setErr("Name required");
      return;
    }
    if (insufficient) {
      setErr("Not enough coins");
      return;
    }
    setBusy(true);
    try {
      const r = await createRoom({ name: name.trim(), password: password || null, hidden });
      onCreated(r);
    } catch (e) {
      setErr(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-scale-in",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "Create 3 Some Room" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-primary/5 p-2.5 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Create cost" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-amber-500", children: [
                  "🪙 ",
                  createCost
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Each invited member pays" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-amber-500/90", children: [
                  "🪙 ",
                  joinCost
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center justify-between border-t border-border/50 pt-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Your balance" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold ${insufficient ? "text-destructive" : "text-foreground"}`, children: balance === null ? "…" : `🪙 ${balance.toLocaleString()}` })
              ] }),
              insufficient && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded-md bg-destructive/10 px-2 py-1 text-[10px] text-destructive", children: "Not enough coins. Earn more from daily missions, chatting, and posting — or top up from the shop." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Room name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                autoFocus: true,
                value: name,
                maxLength: 60,
                onChange: (e) => setName(e.target.value),
                placeholder: "Late night lounge",
                className: "mb-3 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Password (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 mt-1 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  placeholder: "Leave blank for open invite",
                  className: "flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-3 flex items-center gap-2 text-xs text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: hidden, onChange: (e) => setHidden(e.target.checked) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-3.5 w-3.5" }),
              "Hidden room (don't surface to others)"
            ] }),
            err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs text-destructive", children: err }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "flex-1 rounded-md bg-muted/40 px-3 py-2 text-sm hover:bg-muted/60",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: submit,
                  disabled: busy || insufficient,
                  className: "flex-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
                  children: busy ? "Creating…" : insufficient ? "Need coins" : `Create · 🪙${createCost}`
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function TrioRoomWindow({
  room,
  meId,
  onClose,
  onMinimize
}) {
  const chat = useChat();
  const channelId = trioChannel(room.id);
  const me = chat.state.users.me;
  const meForTyping = me && !me.isGuest ? { id: me.id, name: me.name } : null;
  const { typers, sendTyping } = useTyping(channelId, meForTyping, !!meForTyping);
  const [messages, setMessages] = reactExports.useState([]);
  const [members, setMembers] = reactExports.useState([]);
  const [text, setText] = reactExports.useState("");
  const [showInvite, setShowInvite] = reactExports.useState(false);
  const [inviteName, setInviteName] = reactExports.useState("");
  const [inviteErr, setInviteErr] = reactExports.useState("");
  const [closed, setClosed] = reactExports.useState(false);
  const [showEmoji, setShowEmoji] = reactExports.useState(false);
  const [showGif, setShowGif] = reactExports.useState(false);
  const [pending, setPending] = reactExports.useState(null);
  const scrollRef = reactExports.useRef(null);
  const fileRef = reactExports.useRef(null);
  const isOwner = room.ownerId === meId;
  const [fullscreen, setFullscreen] = reactExports.useState(false);
  const [reads, setReads] = reactExports.useState({});
  const markRead = reactExports.useCallback(async () => {
    try {
      await supabase.from("dm_reads").upsert(
        { user_id: meId, channel_id: channelId, last_read_at: (/* @__PURE__ */ new Date()).toISOString() },
        { onConflict: "user_id,channel_id" }
      );
    } catch {
    }
  }, [channelId, meId]);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("dm_reads").select("user_id,last_read_at").eq("channel_id", channelId);
      if (cancelled) return;
      const next = {};
      (data ?? []).forEach((r) => {
        next[r.user_id] = new Date(r.last_read_at).getTime();
      });
      setReads(next);
    })();
    const ch = supabase.channel(`trio-reads-${room.id}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dm_reads", filter: `channel_id=eq.${channelId}` },
      (payload) => {
        const r = payload.new ?? payload.old;
        if (!r) return;
        setReads((prev) => ({ ...prev, [r.user_id]: new Date(r.last_read_at).getTime() }));
      }
    ).subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(ch);
    };
  }, [channelId, room.id]);
  reactExports.useEffect(() => {
    if (document.visibilityState === "visible") void markRead();
  }, [messages.length, markRead]);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("messages").select("id,author_id,text,created_at,attachment").eq("channel_id", channelId).order("created_at", { ascending: true }).limit(200);
      if (cancelled) return;
      setMessages(
        (data ?? []).map((r) => ({
          id: r.id,
          authorId: r.author_id,
          text: r.text ?? "",
          ts: new Date(r.created_at).getTime(),
          attachment: r.attachment ?? null
        }))
      );
      const m = await listMembers(room.id);
      if (!cancelled) setMembers(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [channelId, room.id]);
  reactExports.useEffect(() => {
    const ch = supabase.channel(`trio-room-${room.id}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `channel_id=eq.${channelId}`
      },
      (payload) => {
        const r = payload.new;
        setMessages(
          (prev) => prev.some((m) => m.id === r.id) ? prev : [
            ...prev,
            {
              id: r.id,
              authorId: r.author_id,
              text: r.text ?? "",
              ts: new Date(r.created_at).getTime(),
              attachment: r.attachment ?? null
            }
          ]
        );
      }
    ).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "trio_room_members",
        filter: `room_id=eq.${room.id}`
      },
      async () => {
        const m = await listMembers(room.id);
        setMembers(m);
      }
    ).on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "trio_rooms", filter: `id=eq.${room.id}` },
      (payload) => {
        const r = payload.new;
        if (r.closed_at) setClosed(true);
      }
    ).subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [channelId, room.id]);
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);
  const activeMembers = reactExports.useMemo(
    () => members.filter((m) => m.status === "accepted" || m.status === "invited"),
    [members]
  );
  const canInvite = isOwner && activeMembers.length < 3 && !closed;
  async function send() {
    const t = text.trim();
    if (!t && !pending || closed) return;
    const att = pending;
    setText("");
    setPending(null);
    const { error } = await supabase.from("messages").insert({
      channel_id: channelId,
      author_id: meId,
      text: t,
      kind: att?.kind === "image" ? "image" : "text",
      attachment: att ? JSON.parse(JSON.stringify(att)) : null
    });
    if (error) {
      setText(t);
      setPending(att ?? null);
      alert(error.message);
    }
  }
  function onPickFile(e) {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Max 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPending({
        kind: file.type.startsWith("image/") ? "image" : "file",
        name: file.name,
        mime: file.type,
        size: file.size,
        dataUrl: String(reader.result)
      });
    };
    reader.readAsDataURL(file);
  }
  async function doInvite() {
    setInviteErr("");
    try {
      await inviteByUsername(room.id, inviteName);
      setInviteName("");
      setShowInvite(false);
      const m = await listMembers(room.id);
      setMembers(m);
    } catch (e) {
      setInviteErr(e.message);
    }
  }
  async function forceClose() {
    if (!confirm("Close this room for everyone?")) return;
    await closeRoom(room.id);
    onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: fullscreen ? "fixed inset-0 z-[60] flex flex-col overflow-hidden rounded-none border-0 bg-card/95 shadow-2xl backdrop-blur-xl animate-scale-in" : "flex h-[440px] w-[min(320px,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl origin-bottom-right animate-scale-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full flex-col overflow-hidden bg-card/70", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-bold", children: room.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
          activeMembers.filter((m) => m.status === "accepted").length,
          "/3 in room",
          closed && " · closed"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          title: "Voice chat coming soon",
          disabled: true,
          className: "grid h-7 w-7 place-items-center rounded-full text-muted-foreground/40 cursor-not-allowed",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-3.5 w-3.5" })
        }
      ),
      isOwner && !closed && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: forceClose,
          title: "Force close room",
          className: "grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldX, { className: "h-3.5 w-3.5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setFullscreen((f) => !f),
          title: fullscreen ? "Exit full screen" : "Full screen",
          className: "grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground",
          children: fullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-3.5 w-3.5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onMinimize,
          title: "Minimize",
          className: "grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          title: "Close",
          className: "grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 border-b border-border bg-card/60 px-2 py-1.5", children: [
      activeMembers.map((m) => {
        const u = chat.state.users[m.user_id];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] ${m.status === "accepted" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 text-muted-foreground"}`,
            children: [
              u ? /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: u, size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-4 w-4 place-items-center rounded-full bg-muted text-[8px]", children: "?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[80px] truncate", children: u ? /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: u.id, name: u.name }) : m.user_id.slice(0, 6) }),
              m.status === "invited" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-60", children: "…" })
            ]
          },
          m.user_id
        );
      }),
      canInvite && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setShowInvite((s) => !s),
          className: "ml-auto flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/25",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
            " Invite"
          ]
        }
      )
    ] }),
    showInvite && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border bg-muted/20 p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            autoFocus: true,
            value: inviteName,
            onChange: (e) => setInviteName(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") doInvite();
            },
            placeholder: "@username",
            className: "flex-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-primary"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: doInvite,
            className: "rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground",
            children: "Send"
          }
        )
      ] }),
      inviteErr && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-destructive", children: inviteErr })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: scrollRef, className: "flex-1 space-y-1.5 overflow-y-auto px-3 py-2", children: [
      messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full place-items-center text-center text-[11px] text-muted-foreground", children: "🔒 Private room. Only invited members can see this chat." }),
      messages.map((m) => {
        const u = chat.state.users[m.authorId];
        const mine = m.authorId === meId;
        const others = activeMembers.filter((mm) => mm.status === "accepted" && mm.user_id !== meId).map((mm) => mm.user_id);
        const readers = others.filter((uid) => (reads[uid] ?? 0) >= m.ts);
        const allRead = others.length > 0 && readers.length === others.length;
        const anyRead = readers.length > 0;
        const tickTitle = others.length === 0 ? "Sent" : allRead ? "Read by everyone" : anyRead ? `Read by ${readers.length}/${others.length}` : "Delivered";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex gap-1.5 ${mine ? "flex-row-reverse" : ""}`, children: [
          u && /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: u, size: 20 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `max-w-[75%] rounded-2xl px-2.5 py-1.5 text-xs ${mine ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground"}`,
              children: [
                !mine && u && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-semibold opacity-70", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: u.id, name: u.name }) }),
                m.attachment?.kind === "image" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: m.attachment.dataUrl,
                    alt: m.attachment.name ?? "image",
                    className: "mt-1 max-h-64 max-w-full rounded-lg object-contain"
                  }
                ),
                m.attachment?.kind === "file" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "a",
                  {
                    href: m.attachment.dataUrl,
                    download: m.attachment.name,
                    className: "mt-1 flex items-center gap-1 underline",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3 w-3" }),
                      " ",
                      m.attachment.name
                    ]
                  }
                ),
                m.text && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap break-words", children: linkify(m.text, m.id) }),
                mine && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "mt-0.5 flex items-center justify-end gap-1 text-[9px] opacity-80",
                    title: tickTitle,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
                      anyRead ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: `h-3 w-3 ${allRead ? "text-sky-300" : ""}` }) : others.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3 w-3 opacity-60" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 opacity-60" })
                    ]
                  }
                )
              ]
            }
          )
        ] }, m.id);
      }),
      closed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-center text-[11px] text-destructive", children: "This room was closed." })
    ] }),
    pending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-t border-border bg-muted/20 px-3 py-2", children: [
      pending.kind === "image" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: pending.dataUrl,
          alt: pending.name,
          className: "h-12 w-12 rounded object-cover"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: pending.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
          ((pending.size ?? 0) / 1024).toFixed(1),
          " KB"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setPending(null),
          className: "text-muted-foreground hover:text-destructive",
          "aria-label": "Remove",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TypingIndicator, { typers }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-1.5 border-t border-border bg-card/70 px-2 py-2", children: [
      showEmoji && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-12 left-2 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        EmojiPicker,
        {
          onPick: (e) => {
            setText((t) => t + e);
            setShowEmoji(false);
          }
        }
      ) }),
      showGif && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-12 left-2 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        GiphyPicker,
        {
          onPick: (gif) => {
            setPending({
              kind: "image",
              name: `${gif.title || "gif"}.gif`,
              mime: "image/gif",
              size: 0,
              dataUrl: gif.fullUrl
            });
            setShowGif(false);
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileRef,
          type: "file",
          onChange: onPickFile,
          className: "hidden",
          accept: "image/*,application/pdf,text/plain,.zip,.doc,.docx"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => fileRef.current?.click(),
          disabled: closed,
          title: "Attach",
          className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted/40 hover:text-foreground disabled:opacity-40",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setShowEmoji((s) => !s);
            setShowGif(false);
          },
          disabled: closed,
          title: "Emoji",
          className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted/40 hover:text-foreground disabled:opacity-40",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setShowGif((s) => !s);
            setShowEmoji(false);
          },
          disabled: closed,
          title: "GIF",
          className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted/40 hover:text-foreground disabled:opacity-40",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: text,
          onChange: (e) => {
            setText(e.target.value);
            sendTyping();
          },
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          },
          disabled: closed,
          placeholder: closed ? "Room closed" : "Private message…",
          className: "min-w-0 flex-1 rounded-full bg-muted/40 px-3 py-1.5 text-xs outline-none focus:bg-muted/60 disabled:opacity-50"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: send,
          disabled: !text.trim() && !pending || closed,
          className: "grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-40",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
        }
      )
    ] })
  ] }) });
}
const JOIN_DELAY_MS = 2500;
const LEAVE_DELAY_MS = 8e3;
const COOLDOWN_MS = 6e4;
const MAX_VISIBLE = 30;
function PresenceFeed({ channelId }) {
  const { state, isDM } = useChat();
  const { raw } = useAppSettings();
  const enabled = raw.presence_messages !== false;
  const [events, setEvents] = reactExports.useState([]);
  const meRef = reactExports.useRef({ id: "me", name: state.me.name });
  meRef.current = { id: state.me.name || "me", name: state.me.name };
  reactExports.useEffect(() => {
    if (!enabled) return;
    if (isDM(channelId)) return;
    let cancelled = false;
    let pendingJoin = /* @__PURE__ */ new Map();
    let pendingLeave = /* @__PURE__ */ new Map();
    const lastJoinAt = /* @__PURE__ */ new Map();
    const lastLeaveAt = /* @__PURE__ */ new Map();
    let knownPresent = /* @__PURE__ */ new Set();
    let firstSyncDone = false;
    let userId = "anon-" + Math.random().toString(36).slice(2, 9);
    function push(kind, name) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const ev = { id, kind, name };
      if (cancelled) return;
      setEvents((prev) => {
        const next = [...prev, ev];
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });
    }
    async function start() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user?.id) userId = data.user.id;
      } catch {
      }
      if (cancelled) return;
      const channel = supabase.channel(`room-presence:${channelId}`, {
        config: { presence: { key: userId } }
      });
      channel.on("presence", { event: "sync" }, () => {
        const stateMap = channel.presenceState();
        const presentNow = /* @__PURE__ */ new Set();
        const nameMap = /* @__PURE__ */ new Map();
        for (const key of Object.keys(stateMap)) {
          const metas = stateMap[key];
          if (!metas || !metas.length) continue;
          const uid = metas[0].user_id || key;
          presentNow.add(uid);
          if (metas[0].name) nameMap.set(uid, metas[0].name);
        }
        if (!firstSyncDone) {
          knownPresent = presentNow;
          firstSyncDone = true;
          return;
        }
        presentNow.forEach((uid) => {
          if (uid === userId) return;
          if (knownPresent.has(uid)) {
            const t2 = pendingLeave.get(uid);
            if (t2) {
              clearTimeout(t2);
              pendingLeave.delete(uid);
            }
            return;
          }
          if (pendingJoin.has(uid)) return;
          const nm = nameMap.get(uid) || "Someone";
          const t = setTimeout(() => {
            pendingJoin.delete(uid);
            const last = lastJoinAt.get(uid) || 0;
            if (Date.now() - last < COOLDOWN_MS) return;
            lastJoinAt.set(uid, Date.now());
            push("join", nm);
          }, JOIN_DELAY_MS);
          pendingJoin.set(uid, t);
        });
        knownPresent.forEach((uid) => {
          if (presentNow.has(uid)) return;
          if (uid === userId) return;
          const tj = pendingJoin.get(uid);
          if (tj) {
            clearTimeout(tj);
            pendingJoin.delete(uid);
          }
          if (pendingLeave.has(uid)) return;
          const nameForUid = nameMap.get(uid) || "Someone";
          const t = setTimeout(() => {
            pendingLeave.delete(uid);
            const last = lastLeaveAt.get(uid) || 0;
            if (Date.now() - last < COOLDOWN_MS) return;
            lastLeaveAt.set(uid, Date.now());
            push("leave", nameForUid);
          }, LEAVE_DELAY_MS);
          pendingLeave.set(uid, t);
        });
        knownPresent = presentNow;
      }).subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId, name: meRef.current.name });
        }
      });
      return channel;
    }
    const channelPromise = start();
    return () => {
      cancelled = true;
      pendingJoin.forEach((t) => clearTimeout(t));
      pendingLeave.forEach((t) => clearTimeout(t));
      pendingJoin = /* @__PURE__ */ new Map();
      pendingLeave = /* @__PURE__ */ new Map();
      void channelPromise.then((ch) => {
        if (ch) void supabase.removeChannel(ch);
      });
    };
  }, [channelId, enabled, isDM]);
  if (!enabled || isDM(channelId) || events.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-1 z-10 flex flex-col items-stretch gap-0.5 px-3", children: events.map((ev) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "presence-msg pointer-events-none flex items-center gap-2 px-1 py-0.5 text-[12px] text-muted-foreground",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] text-muted-foreground/80", children: ev.kind === "join" ? "👤" : "👋" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground/80", children: ev.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-75", children: ev.kind === "join" ? " has joined the room" : " has left the room" })
        ] })
      ]
    },
    ev.id
  )) });
}
const LISTENER_MUTE_KEY = "dj_player.listener_muted.v2";
function DjFooter() {
  const { state, ready } = useDjPlayer();
  const [listenerMuted, setListenerMuted] = reactExports.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LISTENER_MUTE_KEY) === "1";
  });
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LISTENER_MUTE_KEY, listenerMuted ? "1" : "0");
  }, [listenerMuted]);
  if (!ready || !state.enabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DjFooterView,
    {
      state,
      listenerMuted,
      onToggleListenerMute: () => setListenerMuted((m) => !m)
    }
  );
}
function DjFooterView({
  state,
  listenerMuted,
  onToggleListenerMute
}) {
  const muted = state.allowListenerMute && listenerMuted;
  const effectiveVolume = muted ? 0 : Math.max(0, Math.min(100, state.defaultVolume));
  const [playbackBlocked, setPlaybackBlocked] = reactExports.useState(false);
  const [localPaused, setLocalPaused] = reactExports.useState(false);
  const mediaControlsRef = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/60 bg-muted/40 backdrop-blur-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BroadcasterTicker, { target: "chatbar" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 px-3 py-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full bg-background/70 px-2.5 py-1 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `inline-block h-2 w-2 rounded-full ${state.playing && state.track ? "bg-red-500 animate-pulse" : "bg-muted-foreground/40"}`,
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: state.playing && state.track ? "On Air" : "Off Air" }),
        state.djName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground/80", children: [
          "· ",
          state.djName
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Disc3,
          {
            className: `h-4 w-4 shrink-0 text-primary ${state.playing && state.track ? "animate-spin" : "opacity-50"}`,
            style: { animationDuration: "3.5s" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-foreground/90", children: state.track ? state.track.title || (state.track.kind === "youtube" ? "YouTube stream" : "Audio stream") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "Nothing on air" }) })
      ] }),
      state.allowListenerMute && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "ghost",
          size: "icon",
          className: "h-8 w-8",
          onClick: () => {
            onToggleListenerMute();
            if (muted) mediaControlsRef.current?.play();
          },
          title: muted ? "Unmute" : "Mute",
          "aria-label": muted ? "Unmute DJ player" : "Mute DJ player",
          children: muted ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RadioNotifyToggle, {}),
      state.playing && state.track?.kind === "audio" && !muted && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: playbackBlocked ? "default" : "outline",
          size: "sm",
          className: "h-8 gap-1 px-2",
          onClick: () => {
            if (localPaused) {
              setLocalPaused(false);
              mediaControlsRef.current?.play();
            } else {
              setLocalPaused(true);
              mediaControlsRef.current?.pause();
            }
          },
          title: localPaused ? "Play stream" : "Pause stream",
          children: localPaused ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5" }),
            " Play"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5" }),
            " Pause"
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DjMediaSink,
      {
        state,
        volume: effectiveVolume,
        muted,
        controlRef: mediaControlsRef,
        onPlaybackBlockedChange: setPlaybackBlocked
      }
    )
  ] });
}
function DjMediaSink({
  state,
  volume,
  muted,
  controlRef,
  onPlaybackBlockedChange
}) {
  const audioRef = reactExports.useRef(null);
  const audioSrc = state.track?.kind === "audio" ? normalizeStreamUrl(state.track.url) : null;
  const requestAudioPlay = reactExports.useCallback((reload = false) => {
    const el = audioRef.current;
    if (!el || state.track?.kind !== "audio" || !state.playing) return;
    el.volume = Math.max(0, Math.min(1, volume / 100));
    el.muted = muted;
    if (reload || el.error || el.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      try {
        el.load();
      } catch {
      }
    }
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => onPlaybackBlockedChange(false)).catch((err) => {
        onPlaybackBlockedChange(true);
        console.warn("[DjPlayer] audio play blocked:", err);
      });
    } else {
      onPlaybackBlockedChange(false);
    }
  }, [muted, onPlaybackBlockedChange, state.playing, state.track?.kind, volume]);
  reactExports.useEffect(() => {
    controlRef.current = {
      play: () => requestAudioPlay(true),
      pause: () => {
        audioRef.current?.pause();
        onPlaybackBlockedChange(false);
      }
    };
    return () => {
      controlRef.current = null;
    };
  }, [controlRef, requestAudioPlay, onPlaybackBlockedChange]);
  reactExports.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = Math.max(0, Math.min(1, volume / 100));
    el.muted = muted;
  }, [volume, muted]);
  reactExports.useEffect(() => {
    const el = audioRef.current;
    if (!el || state.track?.kind !== "audio") return;
    if (state.playing) {
      requestAudioPlay();
    } else {
      el.pause();
      onPlaybackBlockedChange(false);
    }
  }, [requestAudioPlay, state.playing, audioSrc, state.track?.kind, onPlaybackBlockedChange]);
  const youtubeSrc = reactExports.useMemo(() => {
    if (!state.track || state.track.kind !== "youtube" || !state.track.videoId) return null;
    if (!state.playing) return null;
    const start = Math.floor(currentPositionSec(state));
    const params = new URLSearchParams({
      autoplay: "1",
      start: String(start),
      controls: "0",
      modestbranding: "1",
      rel: "0",
      playsinline: "1",
      mute: muted ? "1" : "0"
    });
    return `https://www.youtube-nocookie.com/embed/${state.track.videoId}?${params.toString()}`;
  }, [state.track?.videoId, state.playing, state.startedAtMs, muted]);
  if (audioSrc) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "audio",
      {
        ref: audioRef,
        src: audioSrc,
        autoPlay: state.playing,
        preload: "auto",
        playsInline: true,
        className: "hidden",
        onPlaying: () => onPlaybackBlockedChange(false),
        onError: () => onPlaybackBlockedChange(true)
      },
      audioSrc
    );
  }
  if (youtubeSrc) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "iframe",
      {
        src: youtubeSrc,
        title: "DJ player",
        allow: "autoplay; encrypted-media; picture-in-picture",
        className: "absolute h-0 w-0 border-0 opacity-0 pointer-events-none",
        "aria-hidden": true
      },
      youtubeSrc
    );
  }
  return null;
}
function RadioNotifyToggle() {
  const prefs = useSoundPrefs();
  const on = prefs.radio_announcements !== false;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      type: "button",
      variant: "ghost",
      size: "icon",
      className: "h-8 w-8",
      onClick: () => setSoundPref("radio_announcements", !on),
      title: on ? "Mute radio notifications" : "Enable radio notifications",
      "aria-label": on ? "Mute radio notifications" : "Enable radio notifications",
      children: on ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "h-4 w-4 text-muted-foreground" })
    }
  );
}
const SETTINGS_KEY = "poll_widget";
function usePollWidgetConfig() {
  const [config, setConfig] = reactExports.useState(POLL_WIDGET_DEFAULTS);
  const [ready, setReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
      if (!mounted) return;
      setConfig(mergePollWidgetConfig(data?.value));
      setReady(true);
    };
    load().catch(() => {
      if (mounted) setReady(true);
    });
    const channel = supabase.channel(`poll_widget_${Math.random().toString(36).slice(2, 8)}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "app_settings", filter: `key=eq.${SETTINGS_KEY}` },
      (payload) => {
        const next = payload.new?.value;
        setConfig(mergePollWidgetConfig(next));
      }
    ).subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);
  return { config, ready };
}
function usePollPreviews(config) {
  const [rows, setRows] = reactExports.useState([]);
  const [names, setNames] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!config.enabled) {
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await postsSafe().select("id, slug, owner_id, is_anonymous, poll, reaction_count, trending_score, created_at").eq("kind", "poll").eq("privacy", "public").order("created_at", { ascending: false }).limit(40);
      if (!mounted) return;
      const polls = data ?? [];
      setRows(polls);
      const ownerIds = Array.from(
        new Set(polls.filter((p) => !p.is_anonymous && p.owner_id).map((p) => p.owner_id))
      );
      if (ownerIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id, username").in("id", ownerIds);
        if (!mounted) return;
        const map = {};
        for (const p of profs ?? []) map[p.id] = p.username ?? "user";
        setNames(map);
      }
      setLoading(false);
    })().catch(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [config.enabled]);
  const previews = reactExports.useMemo(() => {
    if (!config.enabled || !rows.length) return [];
    const lifetimeMs = Math.max(1, config.pollLifetimeDays) * 864e5;
    const now = Date.now();
    const dayAgo = now - 864e5;
    const weekAgo = now - 7 * 864e5;
    const toPreview = (row, category) => {
      if (!row.poll) return null;
      const created = new Date(row.created_at).getTime();
      const expiresAt = created + lifetimeMs;
      const creatorName = row.is_anonymous ? "Anonymous" : names[row.owner_id] ?? "Someone";
      return {
        id: row.id,
        slug: row.slug,
        question: row.poll.question,
        voteCount: sumVotes(row.poll.votes),
        creatorName,
        isAnonymous: row.is_anonymous,
        createdAt: row.created_at,
        expiresAt,
        status: now >= expiresAt ? "closed" : "open",
        category
      };
    };
    const out = [];
    const used = /* @__PURE__ */ new Set();
    const pick = (enabled, category, pool, sort) => {
      if (!enabled) return;
      const sorted = [...pool].sort(sort);
      const row = sorted.find((r) => !used.has(r.id) && r.poll);
      if (!row) return;
      const p = toPreview(row, category);
      if (p) {
        out.push(p);
        used.add(row.id);
      }
    };
    pick(config.showTrending, "trending", rows, (a, b) => b.trending_score - a.trending_score);
    pick(
      config.showPollOfDay,
      "poll_of_day",
      rows.filter((r) => new Date(r.created_at).getTime() >= dayAgo),
      (a, b) => b.reaction_count - a.reaction_count
    );
    pick(
      config.showCreatorPolls,
      "creator",
      rows.filter((r) => !r.is_anonymous),
      (a, b) => b.reaction_count - a.reaction_count
    );
    pick(
      config.showWeeklyVote,
      "weekly",
      rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo),
      (a, b) => {
        const va = sumVotes(a.poll?.votes);
        const vb = sumVotes(b.poll?.votes);
        return vb - va;
      }
    );
    return out;
  }, [rows, names, config]);
  return { previews, loading };
}
function PollDiscoveryWidget() {
  const { config, ready } = usePollWidgetConfig();
  const { previews, loading } = usePollPreviews(config);
  if (!ready || !config.enabled) return null;
  if (loading) return null;
  if (!previews.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/60 bg-card/40 px-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-3 w-3" }),
      "Active polls",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/60", children: "· tap to vote in the feed" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1", children: previews.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PollPreviewCard, { preview: p, config }, `${p.category}-${p.id}`)) })
  ] });
}
function PollPreviewCard({
  preview,
  config
}) {
  const meta = POLL_CATEGORY_META[preview.category];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative min-w-[260px] max-w-[300px] flex-1 snap-start rounded-xl border border-border/60 bg-background/80 p-3 shadow-sm transition-colors hover:border-primary/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${meta.tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: meta.emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: meta.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${preview.status === "open" ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`,
          children: preview.status === "open" ? "OPEN" : "CLOSED"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-sm font-medium leading-snug text-foreground", children: preview.question }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3 text-[11px] text-muted-foreground", children: [
      config.showVoteCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
        preview.voteCount.toLocaleString(),
        " votes"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock3, { className: "h-3 w-3" }),
        formatRemaining(preview.expiresAt)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[11px] text-muted-foreground/80", children: [
      "by ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/80", children: preview.creatorName })
    ] }),
    config.redirectToFeed && isNavigableSlug(preview.slug) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/feed/$slug",
        params: { slug: preview.slug },
        className: "mt-2 inline-flex items-center gap-1 rounded-lg bg-primary/90 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary",
        "aria-label": `Vote on ${preview.question} in the feed`,
        children: [
          "Vote Now ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
        ]
      }
    )
  ] });
}
const ABOUT_WORD_LIMIT = 100;
function countWords(s) {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/u).length;
}
function Backdrop({ onClose, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: (e) => e.stopPropagation(), className: "w-full max-w-md rounded-lg border border-border bg-card shadow-2xl", style: { boxShadow: "var(--shadow-panel)" }, children })
    }
  );
}
function ProfileModal({ open, onClose }) {
  const { state, updateMe } = useChat();
  const { user: authUser } = useAuth();
  const [name, setName] = reactExports.useState(state.me.name);
  const [bio, setBio] = reactExports.useState(state.me.bio || "");
  const [aboutMe, setAboutMe] = reactExports.useState(state.me.aboutMe || "");
  const [status, setStatus] = reactExports.useState(state.me.status);
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open) {
      setName(state.me.name);
      setBio(state.me.bio || "");
      setAboutMe(state.me.aboutMe || "");
      setStatus(state.me.status);
    }
  }, [open, state.me]);
  const wordCount = reactExports.useMemo(() => countWords(aboutMe), [aboutMe]);
  const overLimit = wordCount > ABOUT_WORD_LIMIT;
  if (!open) return null;
  const earnedBadges = (state.me.badges || []).map((id) => BADGE_MAP[id]).filter(Boolean);
  const xpForLevel = state.me.level * 50;
  const xpThisLevel = state.me.xp - (state.me.level - 1) * 50;
  const pct = Math.min(100, Math.round(xpThisLevel / 50 * 100));
  const handleAboutChange = (val) => {
    setAboutMe(val.slice(0, 1e3));
  };
  const handleSave = async () => {
    if (overLimit) {
      toast.error(`About me must be ${ABOUT_WORD_LIMIT} words or fewer`);
      return;
    }
    const cleanName = name.trim() || state.me.name;
    const cleanBio = bio.trim();
    const cleanAbout = aboutMe.trim();
    updateMe({ name: cleanName, bio: cleanBio, aboutMe: cleanAbout, status });
    if (authUser?.id) {
      setSaving(true);
      const { error } = await supabase.from("profiles").update({ bio: cleanBio || null, about_me: cleanAbout || null }).eq("id", authUser.id);
      setSaving(false);
      if (error) {
        toast.error(error.message || "Couldn't save profile");
        return;
      }
    }
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Backdrop, { onClose, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Your Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[70vh] space-y-4 overflow-y-auto p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: state.me, size: 56 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
            "Level ",
            state.me.level
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            state.me.xp,
            " / ",
            xpForLevel,
            " XP"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all", style: { width: `${pct}%` } }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-white/5 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3 text-orange-400" }),
            " Daily streak"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-lg font-bold", children: [
            state.me.streak ?? 0,
            " day",
            (state.me.streak ?? 0) === 1 ? "" : "s"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
            "Best: ",
            state.me.longestStreak ?? 0
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-white/5 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3 w-3 text-primary" }),
            " Badges"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-lg font-bold", children: [
            earnedBadges.length,
            " / ",
            BADGES.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
            state.me.messageCount ?? 0,
            " messages sent"
          ] })
        ] })
      ] }),
      earnedBadges.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Earned" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: earnedBadges.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 rounded-full border bg-gradient-to-br px-2.5 py-1 text-[11px] font-semibold ${TIER_COLOR[b.tier]}`, title: b.description, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.emoji }),
          b.name
        ] }, b.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Display name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "w-full rounded bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Bio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: bio, onChange: (e) => setBio(e.target.value.slice(0, 160)), rows: 2, placeholder: "Short tagline shown next to your name", className: "w-full resize-none rounded bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold uppercase text-muted-foreground", children: "About me" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[10px] font-semibold ${overLimit ? "text-destructive" : "text-muted-foreground"}`, children: [
            wordCount,
            "/",
            ABOUT_WORD_LIMIT,
            " words"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: aboutMe,
            onChange: (e) => handleAboutChange(e.target.value),
            rows: 5,
            placeholder: "Tell others about yourself ✨ (emojis welcome, up to 100 words)",
            className: `w-full resize-none rounded bg-input px-3 py-2 text-sm outline-none focus:ring-1 ${overLimit ? "ring-1 ring-destructive focus:ring-destructive" : "focus:ring-ring"}`
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["online", "away", "offline"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatus(s), className: `flex-1 rounded px-3 py-1.5 text-xs font-medium capitalize ${status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`, children: s }, s)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 border-t border-border p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleSave,
          disabled: saving || overLimit,
          className: "rounded px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-60",
          style: { background: "var(--gradient-accent)" },
          children: saving ? "Saving…" : "Save"
        }
      )
    ] })
  ] });
}
function LeaderboardModal({ open, onClose }) {
  const { state, adjustPoints } = useChat();
  const [tab, setTab] = reactExports.useState("xp");
  if (!open) return null;
  const all = Object.values(state.users);
  const ranked = tab === "xp" ? [...all].sort((a, b) => b.xp - a.xp).slice(0, 10) : [...all].sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0) || (b.longestStreak ?? 0) - (a.longestStreak ?? 0)).slice(0, 10);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Backdrop, { onClose, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-lg font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-warning" }),
        " Leaderboard"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 border-b border-border px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTab("xp"),
          className: `flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "xp" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mr-1 inline h-3 w-3" }),
            " Top XP"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTab("streak"),
          className: `flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "streak" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "mr-1 inline h-3 w-3" }),
            " Top Streaks"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[60vh] overflow-y-auto p-2", children: ranked.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-md p-2 hover:bg-muted", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 text-center font-bold text-muted-foreground", children: i + 1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: u, size: 32 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 truncate text-sm font-medium", children: [
          u.name,
          u.isBot && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-accent/20 px-1 text-[10px] font-bold uppercase text-accent", children: "Bot" }),
          (u.badges || []).slice(0, 3).map((bid) => {
            const b = BADGE_MAP[bid];
            if (!b) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: b.name, className: "text-xs", children: b.emoji }, bid);
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Lv ",
          u.level,
          " · 🔥 ",
          u.streak ?? 0
        ] })
      ] }),
      tab === "xp" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm text-accent", children: [
        u.xp,
        " XP"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm text-orange-400", children: [
        u.streak ?? 0,
        "d"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => adjustPoints(u.id, -10), className: "grid h-6 w-6 place-items-center rounded bg-muted text-xs hover:bg-destructive/30", title: "-10 XP", children: "−" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => adjustPoints(u.id, 10), className: "grid h-6 w-6 place-items-center rounded bg-muted text-xs hover:bg-primary/30", title: "+10 XP", children: "+" })
      ] })
    ] }, u.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border px-4 py-2 text-[10px] text-muted-foreground", children: "Adjust points with +/−. Streaks rise by signing in on consecutive days." })
  ] });
}
function AchievementsModal({ open, onClose }) {
  const { state } = useChat();
  if (!open) return null;
  const earned = new Set(state.me.badges || []);
  const earnedCount = earned.size;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Backdrop, { onClose, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-lg font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-5 w-5 text-primary" }),
        " Achievements"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Unlocked" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
        earnedCount,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "/ ",
          BADGES.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all", style: { width: `${earnedCount / BADGES.length * 100}%` } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[60vh] space-y-2 overflow-y-auto p-3", children: BADGES.map((b) => {
      const has = earned.has(b.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex items-center gap-3 rounded-2xl border p-3 transition-all ${has ? `bg-gradient-to-br ${TIER_COLOR[b.tier]}` : "border-border bg-white/[0.02] text-muted-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-10 w-10 shrink-0 place-items-center rounded-xl text-2xl ${has ? "bg-black/20" : "bg-white/5"}`, children: has ? b.emoji : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-bold", children: [
                b.name,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-black/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", children: b.tier })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80", children: b.description })
            ] })
          ]
        },
        b.id
      );
    }) })
  ] });
}
const ROLE_ICON = {
  owner: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 shrink-0 text-warning" }),
  admin: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 shrink-0 text-primary" }),
  mod: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldHalf, { className: "h-4 w-4 shrink-0 text-primary/70" }),
  member: null
};
function relTime(ms) {
  if (!ms) return "—";
  const diff = Date.now() - ms;
  if (diff < 6e4) return "just now";
  if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
  if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
  return new Date(ms).toLocaleDateString();
}
function ProfilePopup({
  userId,
  open,
  onClose
}) {
  const pendingCloseReasonRef = reactExports.useRef("programmatic");
  const handleDialogOpenChange = (next) => {
    if (!next) {
      onClose(pendingCloseReasonRef.current);
      pendingCloseReasonRef.current = "programmatic";
    }
  };
  const closeNow = (reason) => {
    pendingCloseReasonRef.current = reason;
    onClose(reason);
    pendingCloseReasonRef.current = "programmatic";
  };
  const { state, startDM, addFriend, removeFriend, blockUser, unblockUser, isFriend, isBlocked, staffKick } = useChat();
  const { isIgnored, toggleIgnoreUser } = useIgnore();
  const { user: authUser } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [tab, setTab] = reactExports.useState("info");
  const [friendCount, setFriendCount] = reactExports.useState(null);
  const [memberSince, setMemberSince] = reactExports.useState(null);
  const [recentPosts, setRecentPosts] = reactExports.useState([]);
  const realId = userId === "me" ? authUser?.id ?? "me" : userId;
  const user = state.users[userId] || profiles[realId] || state.users[realId];
  const isMe = userId === "me" || authUser && realId === authUser.id;
  const friend = !isMe && isFriend(userId);
  const blocked = !isMe && isBlocked(userId);
  const room = state.rooms[state.activeChannel];
  const role = room?.roles?.[userId] || room?.roles?.[realId] || "member";
  const currentRoom = room && !state.activeChannel.startsWith("dm:") ? room.name : "N/A";
  const { isAdmin, isModerator } = useMyRoles();
  const staffPerms = useStaffPermissions();
  const isStaff = isModerator && !isMe && !user?.isBot;
  const canKick = isStaff && (isAdmin || staffPerms.mod_can_kick);
  const canMute = isStaff && (isAdmin || staffPerms.mod_can_mute);
  const canBan = isStaff && (isAdmin || staffPerms.mod_can_ban);
  const banFn = useServerFn(banUser);
  const muteFn = useServerFn(muteUser);
  reactExports.useEffect(() => {
    if (!open || !user || user.isBot) return;
    let cancel = false;
    (async () => {
      if (realId && realId !== "me") {
        if (!isMe && !user.isBot && authUser?.id && realId !== authUser.id) {
          recordProfileView(realId);
        }
        const { data: prof } = await supabase.from("profiles").select("created_at").eq("id", realId).maybeSingle();
        if (!cancel && prof?.created_at) setMemberSince(new Date(prof.created_at).toLocaleDateString());
        const { count } = await supabase.from("friendships").select("*", { count: "exact", head: true }).eq("status", "accepted").or(`sender_id.eq.${realId},receiver_id.eq.${realId}`);
        if (!cancel) setFriendCount(count ?? 0);
        const { data: posts } = await supabase.from("posts").select("id, text, created_at, reaction_count, comment_count").eq("author_id", realId).eq("privacy", "public").order("created_at", { ascending: false }).limit(5);
        if (!cancel) setRecentPosts(posts ?? []);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [open, realId, user]);
  const daily = reactExports.useMemo(() => {
    if (!isMe || !realId || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`dc:${realId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const today = /* @__PURE__ */ new Date();
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (parsed.date !== key) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [isMe, realId, open]);
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: handleDialogOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "User not found." }) }) });
  }
  const lastSeenLabel = user.status === "online" ? "Online now" : `Last seen ${relTime(user.lastSeen)}`;
  const tabs = [
    { id: "info", label: "Info" },
    { id: "about", label: "About" },
    ...!user.isBot ? [{ id: "friends", label: "Friends" }] : [],
    ...!user.isBot ? [{ id: "activity", label: "Activity" }] : [],
    ...isMe ? [{ id: "daily", label: "Daily" }] : []
  ];
  const activeTab = tabs.some((t) => t.id === tab) ? tab : "info";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: handleDialogOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-w-sm max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border-border bg-card p-0 [&>button.absolute]:hidden",
      onOpenAutoFocus: (e) => e.preventDefault(),
      onPointerDownOutside: () => {
        pendingCloseReasonRef.current = "outside-click";
      },
      onEscapeKeyDown: () => {
        pendingCloseReasonRef.current = "escape-key";
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-gradient-to-b from-primary/30 via-primary/10 to-transparent px-6 pb-4 pt-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => closeNow("x-button"),
              className: "absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/40 text-muted-foreground hover:bg-background/70 hover:text-foreground",
              "aria-label": "Close",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user, size: 88, square: false }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: [
            user.isBot ? "Bot" : user.isGuest ? "Guest" : "User",
            ROLE_ICON[role]
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-0.5 flex items-center justify-center gap-1.5 text-xl font-bold", children: [
            user.name,
            /* @__PURE__ */ jsxRuntimeExports.jsx(NameEmojiBadge, { user })
          ] }),
          user.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-1 max-w-[260px] text-xs text-muted-foreground", children: user.bio }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider", children: [
            !user.isBot && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex h-6 items-center gap-1 rounded-full bg-yellow-500/15 px-2 text-yellow-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5 shrink-0" }),
                " Lv ",
                user.level
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex h-6 items-center gap-1 rounded-full bg-amber-500/15 px-2 text-amber-400", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3.5 w-3.5 shrink-0" }),
                " ",
                user.coins ?? 0
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex h-6 items-center gap-1 rounded-full bg-orange-500/15 px-2 text-orange-400", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5 shrink-0" }),
                " ",
                user.streak ?? 0,
                "d"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex h-6 items-center gap-1 rounded-full px-2 ${user.status === "online" ? "bg-green-500/15 text-green-400" : "bg-muted-foreground/15 text-muted-foreground"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-1.5 w-1.5 shrink-0 rounded-full ${user.status === "online" ? "bg-green-400" : "bg-muted-foreground/60"}` }),
              user.status === "online" ? "Online" : "Offline"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 border-b border-border bg-card px-3", children: tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setTab(t.id),
            className: `relative h-10 w-[68px] shrink-0 text-xs font-semibold transition-colors ${tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`,
            children: [
              t.label,
              tab === t.id && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" })
            ]
          },
          t.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm sm:max-h-[320px]", children: [
          activeTab === "info" && /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 shrink-0" }), label: "Last seen", value: lastSeenLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4 shrink-0" }), label: "Current room", value: currentRoom }),
            !user.isBot && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 shrink-0" }), label: "Member since", value: memberSince ?? "…" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 shrink-0" }), label: "XP", value: `${user.xp} pts` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 shrink-0" }), label: "Gender", value: user.gender ? user.gender[0].toUpperCase() + user.gender.slice(1) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4 shrink-0" }), label: "Badges", value: `${(user.badges || []).length}` })
            ] })
          ] }),
          activeTab === "about" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            user.aboutMe ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words text-foreground/90", children: user.aboutMe }) : user.bio ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/90", children: user.bio }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "italic text-muted-foreground", children: "No about me yet." }),
            user.aboutMe && user.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "border-t border-border pt-2 text-xs text-muted-foreground", children: user.bio }),
            (user.badges || []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Badges" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: (user.badges || []).map((id) => {
                const b = BADGE_MAP[id];
                if (!b) return null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `flex items-center gap-1 rounded-full border bg-gradient-to-br px-2 py-0.5 text-[10px] font-semibold ${TIER_COLOR[b.tier]}`, title: b.description, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.emoji }),
                  b.name
                ] }, id);
              }) })
            ] })
          ] }),
          activeTab === "friends" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-primary", children: friendCount ?? (user.isBot ? 0 : "…") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs uppercase tracking-wider text-muted-foreground", children: "Friends" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/find-friends",
                className: "mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
                  " Find more friends"
                ]
              }
            )
          ] }),
          activeTab === "activity" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: recentPosts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "No public feed activity yet." }) : recentPosts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/feed",
              className: "block rounded-xl border border-border bg-white/[0.02] px-3 py-2 hover:bg-white/5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-xs text-foreground/90", children: p.text || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-3 text-[10px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(p.created_at).toLocaleDateString() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-2.5 w-2.5" }),
                    p.reaction_count
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-2.5 w-2.5" }),
                    p.comment_count
                  ] })
                ] })
              ]
            },
            p.id
          )) }),
          activeTab === "daily" && /* @__PURE__ */ jsxRuntimeExports.jsx(DailyProgress, { data: daily })
        ] }),
        !isMe && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-t border-border bg-card px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
                if (isMobile) startDM(userId);
                else window.dispatchEvent(new CustomEvent("palrgo:openMiniDM", { detail: { peerId: userId } }));
              },
              className: "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground hover:opacity-90",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 shrink-0" }),
                " Message"
              ]
            }
          ),
          !user.isBot && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                window.dispatchEvent(new CustomEvent("palrgo:mention", { detail: { name: user.name } }));
              },
              title: `Mention @${user.name} in chat`,
              className: "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(AtSign, { className: "h-4 w-4 shrink-0" })
            }
          ),
          !user.isBot && (friend ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => removeFriend(userId), className: "inline-flex h-10 w-[110px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-card text-xs font-semibold hover:bg-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserMinus, { className: "h-4 w-4 shrink-0" }),
            " Friends"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => addFriend(userId), className: "inline-flex h-10 w-[110px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 shrink-0" }),
            " Add"
          ] })),
          !isMe && (isIgnored(userId, user.isBot) ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleIgnoreUser(userId), className: "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-white/5", title: "Unignore (show messages)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 shrink-0" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleIgnoreUser(userId), className: "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-white/5 hover:text-foreground", title: "Ignore (hide messages in chat)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "h-4 w-4 shrink-0" }) })),
          !user.isBot && (blocked ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => unblockUser(userId), className: "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-white/5", title: "Unblock", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 shrink-0" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => blockUser(userId), className: "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20", title: "Block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4 shrink-0" }) }))
        ] }),
        isStaff && (canKick || canMute || canBan) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 border-t border-border bg-card px-4 py-3", children: [
          canKick && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                staffKick(realId, state.activeChannel, user.name);
                toast.success(`Kicked ${user.name} from this room`);
              },
              className: "inline-flex h-9 flex-1 min-w-[80px] items-center justify-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-3 text-xs font-bold text-warning hover:bg-warning/20",
              title: "Kick from this room",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
                " Kick"
              ]
            }
          ),
          canMute && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: async () => {
                try {
                  await muteFn({ data: { user_id: realId, scope: "room", channel_id: state.activeChannel, expires_in_minutes: 60, reason: "Staff mute" } });
                  toast.success(`Muted ${user.name} for 1h`);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to mute");
                }
              },
              className: "inline-flex h-9 flex-1 min-w-[80px] items-center justify-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/20",
              title: "Mute in this room for 1 hour",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-4 w-4" }),
                " Mute"
              ]
            }
          ),
          canBan && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: async () => {
                if (!confirm(`Ban ${user.name} for 24 hours?`)) return;
                try {
                  await banFn({ data: { user_id: realId, ban_type: "temp_ban", expires_in_hours: 24, reason: "Staff ban" } });
                  toast.success(`Banned ${user.name} for 24h`);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to ban");
                }
              },
              className: "inline-flex h-9 flex-1 min-w-[80px] items-center justify-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-3 text-xs font-bold text-destructive hover:bg-destructive/20",
              title: "Ban for 24 hours",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "h-4 w-4" }),
                " Ban"
              ]
            }
          )
        ] }),
        isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 border-t border-border bg-card px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/feed",
            search: { tab: "account" },
            className: "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground hover:opacity-90",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 shrink-0" }),
              " Edit profile"
            ]
          }
        ) }),
        !isMe && user && !user.isBot && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 border-t border-border bg-card px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/u/$username",
            params: { username: user.name },
            className: "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground hover:opacity-90",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 shrink-0" }),
              " View full profile"
            ]
          }
        ) })
      ]
    }
  ) });
}
function Row({ icon, label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground", children: value })
  ] });
}
function DailyProgress({ data }) {
  const items = [
    { id: "post", label: "Create a post", emoji: "✍️", goal: 1 },
    { id: "react5", label: "React to 5 posts", emoji: "❤️", goal: 5 },
    { id: "comment3", label: "Comment on 3 posts", emoji: "💬", goal: 3 },
    { id: "friend", label: "Add a friend", emoji: "🤝", goal: 1 },
    { id: "login", label: "Daily login", emoji: "🔥", goal: 1 }
  ];
  const completed = items.filter((i) => (data?.values?.[i.id] ?? 0) >= i.goal).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-transparent px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3.5 w-3.5" }),
        " Today's progress"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-2xl font-bold", children: [
        completed,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          " / ",
          items.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-primary transition-all", style: { width: `${completed / items.length * 100}%` } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: items.map((i) => {
      const v = data?.values?.[i.id] ?? 0;
      const done = v >= i.goal;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 rounded-xl border border-border bg-white/[0.02] px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: i.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xs font-semibold ${done ? "text-primary" : "text-foreground"}`, children: i.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
            Math.min(v, i.goal),
            " / ",
            i.goal
          ] })
        ] }),
        done && /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" })
      ] }, i.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/feed",
        className: "block rounded-full bg-primary/10 py-2 text-center text-xs font-semibold text-primary hover:bg-primary/20",
        children: "Open feed to earn more"
      }
    )
  ] });
}
function ChatProfilePopupHost() {
  const { selectedUserId, profileDialogOpen, closeProfile } = useProfilePopup();
  if (!selectedUserId) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ProfilePopup,
    {
      userId: selectedUserId,
      open: profileDialogOpen,
      onClose: closeProfile
    }
  );
}
function ChatApp() {
  const chat = useOptionalChat();
  const { mode: homeMode } = useHomePageMode();
  const [profileOpen, setProfileOpen] = reactExports.useState(false);
  const [lbOpen, setLbOpen] = reactExports.useState(false);
  const [achOpen, setAchOpen] = reactExports.useState(false);
  const [toast2, setToast] = reactExports.useState(null);
  const [hubOpen, setHubOpen] = reactExports.useState(false);
  const [isMobile, setIsMobile] = reactExports.useState(
    () => typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false
  );
  const [feedbotChip, setFeedbotChip] = reactExports.useState(null);
  useHubBadge(hubOpen);
  useBotEventsNotifier();
  const { raw } = useAppSettings();
  const chatRef = reactExports.useRef(chat);
  chatRef.current = chat;
  reactExports.useEffect(() => {
    const c = chatRef.current;
    if (!c) return;
    const cfg = raw.chat_channels;
    const list = Array.isArray(cfg?.list) ? cfg.list : [];
    c.syncAdminChannels(list);
  }, [raw.chat_channels]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  reactExports.useEffect(() => {
    const open = () => setHubOpen(true);
    window.addEventListener("palrgo:open-hub", open);
    return () => window.removeEventListener("palrgo:open-hub", open);
  }, []);
  reactExports.useEffect(() => {
    const SESSION_WELCOMED = "palrgo:hub:welcomed";
    const SESSION_TOPICS_SHOWN = "palrgo:hub:topicsShown";
    const LAST_REMINDER_AT = "palrgo:hub:lastReminderAt";
    const REMINDER_COOLDOWN_MS = 15 * 60 * 1e3;
    const FIRST_TOPIC_DELAY_MS = 6 * 60 * 1e3;
    const TOPICS = {
      missions: { title: "🎯 New missions", body: "Fresh missions are ready to claim." },
      challenges: { title: "⚔️ Daily challenge", body: "A new challenge just went live." },
      rewards: { title: "🎁 Rewards waiting", body: "Unclaimed coins & XP in your Hub." },
      competitions: { title: "🏆 Live competition", body: "A competition is running right now." },
      radio: { title: "📻 Radio is on air", body: "Tune in to what's playing now." },
      trending: { title: "🔥 Trending on feed", body: "See what the community is loving." }
    };
    const readShown = () => {
      try {
        return JSON.parse(window.sessionStorage.getItem(SESSION_TOPICS_SHOWN) || "[]");
      } catch {
        return [];
      }
    };
    const markShown = (key) => {
      try {
        const s = readShown();
        if (!s.includes(key)) s.push(key);
        window.sessionStorage.setItem(SESSION_TOPICS_SHOWN, JSON.stringify(s));
        window.localStorage.setItem(LAST_REMINDER_AT, String(Date.now()));
      } catch {
      }
    };
    const canShowNow = () => {
      try {
        const last = Number(window.localStorage.getItem(LAST_REMINDER_AT) || 0);
        return Date.now() - last >= REMINDER_COOLDOWN_MS;
      } catch {
        return true;
      }
    };
    const timers = [];
    let welcomed = false;
    try {
      welcomed = window.sessionStorage.getItem(SESSION_WELCOMED) === "1";
    } catch {
    }
    if (!welcomed) {
      try {
        window.sessionStorage.setItem(SESSION_WELCOMED, "1");
      } catch {
      }
      timers.push(window.setTimeout(() => {
        setFeedbotChip({
          title: "👋 Welcome back",
          body: "You have missions, rewards & live events waiting."
        });
        try {
          window.localStorage.setItem(LAST_REMINDER_AT, String(Date.now()));
        } catch {
        }
      }, 1500));
    }
    const scheduleNextTopic = (delay) => {
      timers.push(window.setTimeout(() => {
        setFeedbotChip((current) => {
          if (current) {
            scheduleNextTopic(REMINDER_COOLDOWN_MS);
            return current;
          }
          if (!canShowNow()) {
            scheduleNextTopic(REMINDER_COOLDOWN_MS);
            return current;
          }
          const shown = readShown();
          const remaining = Object.keys(TOPICS).filter((k) => !shown.includes(k));
          if (remaining.length === 0) return current;
          const pick = remaining[Math.floor(Math.random() * remaining.length)];
          markShown(pick);
          scheduleNextTopic(REMINDER_COOLDOWN_MS);
          return TOPICS[pick];
        });
      }, delay));
    };
    scheduleNextTopic(FIRST_TOPIC_DELAY_MS);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
  reactExports.useEffect(() => {
    if (!feedbotChip) return;
    const t = window.setTimeout(() => setFeedbotChip(null), 3e4);
    return () => window.clearTimeout(t);
  }, [feedbotChip]);
  const [sidebarOpen, setSidebarOpenState] = reactExports.useState(() => {
    if (typeof window === "undefined") return true;
    const isMobile2 = window.matchMedia("(max-width: 768px)").matches;
    try {
      const saved = window.localStorage.getItem("palrgo:sidebarOpen");
      if (saved === "1") return true;
      if (saved === "0") return false;
    } catch {
    }
    return !isMobile2;
  });
  const setSidebarOpen = (next) => {
    setSidebarOpenState(next);
    try {
      window.localStorage.setItem("palrgo:sidebarOpen", next ? "1" : "0");
    } catch {
    }
  };
  const rootRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    function show(t, buzz = false) {
      setToast(t);
      if (buzz) {
        const el = rootRef.current;
        if (el) {
          el.classList.remove("palrgo-buzzing");
          void el.offsetWidth;
          el.classList.add("palrgo-buzzing");
          setTimeout(() => el.classList.remove("palrgo-buzzing"), 750);
        }
      }
      setTimeout(() => setToast((curr) => curr && curr.key === t.key ? null : curr), 3200);
    }
    function onBuzz(e) {
      const ce = e;
      show({ key: Date.now(), kind: "buzz", title: ce.detail.actor ? `${ce.detail.actor} found` : "Rare find", body: `⚡ ${ce.detail.reason}` }, true);
    }
    function onStreak(e) {
      const ce = e;
      show({ key: Date.now(), kind: "streak", title: `${ce.detail.streak}-day streak!`, body: `+${ce.detail.bonus} XP daily reward` });
    }
    function onBadge(e) {
      const ce = e;
      const names = ce.detail.ids.map((id) => BADGE_MAP[id]).filter(Boolean);
      if (!names.length) return;
      const head = names[0];
      const more = names.length > 1 ? ` (+${names.length - 1} more)` : "";
      show({ key: Date.now(), kind: "badge", title: "Achievement unlocked", body: `${head.emoji} ${head.name}${more}` });
    }
    window.addEventListener("palrgo:buzz", onBuzz);
    window.addEventListener("palrgo:streak", onStreak);
    window.addEventListener("palrgo:badge", onBadge);
    return () => {
      window.removeEventListener("palrgo:buzz", onBuzz);
      window.removeEventListener("palrgo:streak", onStreak);
      window.removeEventListener("palrgo:badge", onBadge);
    };
  }, []);
  if (!chat) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: homeMode === "hero" ? "/heropage" : "/welcome", replace: true });
  const { state, isDM } = chat;
  const { theme: chatTheme, refresh: refreshChatTheme } = useActiveChatTheme();
  const [themeStoreOpen, setThemeStoreOpen] = reactExports.useState(false);
  const [authUserId, setAuthUserId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    supabase.auth.getUser().then((r) => setAuthUserId(r?.data?.user?.id ?? null));
  }, []);
  const activeIsDM = isDM(state.activeChannel);
  const dmTheme = useDmTheme(activeIsDM ? state.activeChannel : null, authUserId);
  const [chatVisible, setChatVisible] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const onVis = () => setChatVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  reactExports.useEffect(() => {
    const open = () => setThemeStoreOpen(true);
    window.addEventListener("palrgo:open-chat-theme-store", open);
    return () => window.removeEventListener("palrgo:open-chat-theme-store", open);
  }, []);
  reactExports.useEffect(() => {
    if (typeof document === "undefined") return;
    if (chatTheme !== "gaming_arena") return;
    const root = document.documentElement;
    const prevMode = typeof localStorage !== "undefined" ? localStorage.getItem("palrgo-theme-mode") : null;
    const prevClass = root.classList.contains("light") ? "light" : root.classList.contains("dark") ? "dark" : null;
    root.classList.remove("light");
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.setAttribute("data-force-dark", "gaming_arena");
    const observer = new MutationObserver(() => {
      if (root.classList.contains("light") || root.getAttribute("data-theme") === "light") {
        root.classList.remove("light");
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => {
      observer.disconnect();
      root.removeAttribute("data-force-dark");
      if (prevMode === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
        root.setAttribute("data-theme", "light");
      } else if (prevMode === "system" && typeof window !== "undefined") {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.remove("light", "dark");
        root.classList.add(dark ? "dark" : "light");
        root.setAttribute("data-theme", dark ? "dark" : "light");
      } else if (prevClass === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
        root.setAttribute("data-theme", "light");
      }
    };
  }, [chatTheme]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePopupProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: rootRef, "data-chat-theme": chatTheme, "data-theme-variant": chatVariantFor(chatTheme), className: "flex h-screen w-full overflow-hidden bg-background text-foreground", children: [
      sidebarOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "aria-label": "Close sidebar",
            onClick: () => setSidebarOpen(false),
            className: "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-y-0 left-0 z-40 w-[85vw] max-w-xs shadow-2xl md:static md:z-auto md:w-auto md:max-w-none md:shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Sidebar,
          {
            onOpenProfile: () => setProfileOpen(true),
            onOpenLeaderboard: () => setLbOpen(true),
            onOpenAchievements: () => setAchOpen(true),
            onCollapse: () => setSidebarOpen(false)
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative flex h-full min-w-0 flex-1 flex-col", children: [
        !sidebarOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSidebarOpen(true),
            className: "absolute left-3 top-3.5 z-30 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30 transition-all hover:scale-110 hover:shadow-xl hover:ring-primary/50",
            style: { boxShadow: "var(--shadow-glow)" },
            title: "Show sidebar",
            "aria-label": "Show sidebar",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeftOpen, { className: "h-5 w-5" })
          }
        ),
        (() => {
          const activeRoom = !activeIsDM ? state.rooms[state.activeChannel] : null;
          const isGameRoom = activeRoom?.kind === "game";
          if (isGameRoom && activeRoom) {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(GameRoomCanvas, { room: activeRoom });
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            !(chatTheme === "gaming_arena" && !activeIsDM) && /* @__PURE__ */ jsxRuntimeExports.jsx(ChatHeader, { onOpenHub: () => setHubOpen(true), hubOpen }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-0 flex-1 flex-col", children: [
              activeIsDM && /* @__PURE__ */ jsxRuntimeExports.jsx(
                DMChatBackground,
                {
                  wallpaper: dmTheme.wallpaper,
                  opacity: dmTheme.opacity,
                  blur: dmTheme.blur,
                  brightness: dmTheme.brightness,
                  overlay: dmTheme.overlay,
                  paused: !chatVisible
                }
              ),
              !activeIsDM && chatTheme === "gaming_arena" && /* @__PURE__ */ jsxRuntimeExports.jsx(GamingArenaHero, { channelId: state.activeChannel }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageList, { channelId: state.activeChannel }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PresenceFeed, { channelId: state.activeChannel })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PollDiscoveryWidget, {}),
            feedbotChip && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto mx-auto mb-2 flex w-[92%] max-w-md items-start gap-2 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/15 via-accent/10 to-transparent p-2.5 shadow-lg backdrop-blur-md md:mb-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 fill-current" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] font-bold text-foreground", children: feedbotChip.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-muted-foreground", children: feedbotChip.body })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setHubOpen(true);
                    setFeedbotChip(null);
                  },
                  className: "shrink-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow",
                  children: "Open Hub"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setFeedbotChip(null),
                  "aria-label": "Dismiss",
                  className: "shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageInput, {})
          ] });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DjFooter, {})
      ] }),
      !isDM(state.activeChannel) && /* @__PURE__ */ jsxRuntimeExports.jsx(MembersPanel, { roomId: state.activeChannel }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingDMDock, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MobileDMMinimizedDock, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrioRoomsDock, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileModal, { open: profileOpen, onClose: () => setProfileOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LeaderboardModal, { open: lbOpen, onClose: () => setLbOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AchievementsModal, { open: achOpen, onClose: () => setAchOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduledAnnouncementsRunner, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChatThemeStore,
        {
          open: themeStoreOpen,
          onOpenChange: setThemeStoreOpen,
          activeTheme: chatTheme,
          onThemeChange: refreshChatTheme
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityHub, { open: hubOpen, onOpenChange: setHubOpen, isMobile }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChatProfilePopupHost, {})
    ] }),
    toast2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      toast2.kind === "buzz" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "palrgo-buzz-flash" }, `flash-${toast2.key}`),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "palrgo-buzz-toast flex items-center gap-2",
          onClick: () => {
            if (toast2.kind === "badge") setAchOpen(true);
          },
          role: toast2.kind === "badge" ? "button" : void 0,
          children: [
            toast2.kind === "streak" && /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4 text-orange-400" }),
            toast2.kind === "badge" && /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col leading-tight", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider opacity-80", children: toast2.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: toast2.body })
            ] })
          ]
        },
        `toast-${toast2.key}`
      )
    ] })
  ] }) });
}
export {
  ChatApp as C
};
