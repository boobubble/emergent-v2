import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { cZ as Route$K, a as useAuth, h as useAuthGate, b as useServerFn, c_ as getPoemBySlug, d1 as recordPoemRead, d2 as togglePoemBookmark, d0 as getPoemNeighbors, c$ as getMehfilRelated, O as isNavigableSlug, D as Dialog, ab as DialogTrigger, B as Button, c as DialogContent, d as DialogHeader, e as DialogTitle, ac as Label, ad as Textarea, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { M as MehfilShell } from "./MehfilShell-Czus6X_P.mjs";
import { W as WriterRankBadge } from "./WriterRankBadge-Ct9hdIy_.mjs";
import { P as PoemCard } from "./PoemCard-DCMBI4oU.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { A as submitReport } from "./moderation.functions-BtSBLwCC.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { c as MEHFIL_REACTIONS } from "./mehfil-types-okfUX99d.mjs";
import { g as gamify, G as GAM_EVENTS } from "./gamification-emit-CN-BLne_.mjs";
import { a as useMehfilPoemRealtime } from "./mehfil-realtime-CjiOrhC8.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { F as Flame, a3 as Swords, _ as Clock, t as Minus, c as Plus, f as Heart, E as Eye, h as MessageCircle, z as Check, by as Copy, bi as Bookmark, bh as Share2, bu as ChevronLeft, a6 as ChevronRight, K as UserCheck, s as UserPlus, b0 as Flag } from "../_libs/lucide-react.mjs";
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
import "../_libs/i18next-http-backend.mjs";
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
import "../_libs/dnd-kit__utilities.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "./use-mehfil-label-BWBPC7g6.mjs";
import "./mehfil-admin.functions-BntRjkJU.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./gamification-engine.functions-CTvD5DWu.mjs";
const followWriter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("40648a3abfa792287eaeb749da830c7f64cf89cc220c6669c088db80c7696d5e"));
const unfollowWriter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("1d89ac9e596e2fc7d46f74c289672ce4eaa4d7b305eecc14807aeaa45dfd4fe9"));
const isFollowingWriter = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("71aace1675bb3936411307ee44011ba9fdd60832d0b391a91d23ebabb79f2fc9"));
createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("75067d7dec8a74ecd65158227c2c31234120036d4cc0aaff6d99a58ec9fa96e1"));
createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("7d8e0af3509fc5012bd4d42054e074cefed6059cd37d7597e6218ff542db1637"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => {
  if (!input.name?.trim()) throw new Error("Name is required");
  return input;
}).handler(createSsrRpc("fa8bf24e3dee9e07bc3a7a6f8643d30ce3953c5e85c17831df0ee35c8dd620a2"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("b5490f50d948d65c932096de75a53003b24aeac3396f34149e288ed05973c2e5"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("521d5db889021145140f96086287f653a846d8cc3ed852f7a6f64c29d71ceec0"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("2f898c16f58158f99eecad007c9d7df19838e90932ee6a65e17b6194ad291cfb"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a322919cc4038a3751abad19208450753a2d39392effb65fdf18a73a67899d30"));
createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("ba25933fa0ac4b6e8477fdd236ac049c2bdf6bcc1d005ff51b05b06670fd7777"));
function FollowWriterButton({ writerId, writerName, variant = "default", onChange }) {
  const { user } = useAuth();
  const gate = useAuthGate();
  const follow = useServerFn(followWriter);
  const unfollow = useServerFn(unfollowWriter);
  const check = useServerFn(isFollowingWriter);
  const [following, setFollowing] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!user || user.id === writerId) {
      setFollowing(null);
      return;
    }
    let cancelled = false;
    check({ data: { writerId } }).then((r) => {
      if (!cancelled) setFollowing(!!r.following);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, writerId, check]);
  if (!writerId || user?.id === writerId) return null;
  const onClick = () => {
    if (!user) {
      gate.openSignIn();
      return;
    }
    if (busy) return;
    setBusy(true);
    const wasFollowing = !!following;
    setFollowing(!wasFollowing);
    const call = wasFollowing ? unfollow({ data: { writerId } }) : follow({ data: { writerId } });
    call.then(() => {
      onChange?.(!wasFollowing);
      toast.success(wasFollowing ? "Unfollowed" : `Following${writerName ? " " + writerName : ""}`);
    }).catch((e) => {
      setFollowing(wasFollowing);
      toast.error(e?.message ?? "Couldn't update follow");
    }).finally(() => setBusy(false));
  };
  const isFollowing = !!following;
  const label = following === null ? user ? "Follow" : "Follow" : isFollowing ? "Following" : "Follow";
  const Icon = isFollowing ? UserCheck : UserPlus;
  if (variant === "compact") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick,
        disabled: busy,
        "aria-pressed": isFollowing,
        className: `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${isFollowing ? "border border-border bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
          " ",
          label
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      disabled: busy,
      "aria-pressed": isFollowing,
      className: `inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${isFollowing ? "border border-border bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
        " ",
        label
      ]
    }
  );
}
const REASONS = ["Spam", "Harassment", "Hate speech", "NSFW", "Phishing / scam", "Other"];
function ReportButton({
  targetType,
  targetId,
  size = "sm",
  variant = "ghost",
  className
}) {
  const submit = useServerFn(submitReport);
  const [open, setOpen] = reactExports.useState(false);
  const [reason, setReason] = reactExports.useState(REASONS[0]);
  const [details, setDetails] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  async function send() {
    setBusy(true);
    try {
      await submit({ data: { target_type: targetType, target_id: targetId, reason, details: details || void 0 } });
      toast.success("Report submitted. Thanks!");
      setOpen(false);
      setDetails("");
    } catch (e) {
      toast.error(e?.message ?? "Failed to send report");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size, variant, className, "aria-label": "Report", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5" }),
      size !== "icon" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5", children: "Report" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Report ",
        targetType
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1 block text-xs", children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: reason, onValueChange: setReason, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1 block text-xs", children: "Details (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: details, onChange: (e) => setDetails(e.target.value), maxLength: 2e3, rows: 3, placeholder: "Add any context that helps moderators…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: send, disabled: busy, children: busy ? "Sending…" : "Submit" })
      ] })
    ] })
  ] });
}
const FONT_SIZES = [16, 18, 20, 22, 24, 26, 28];
const FONT_STORAGE_KEY = "poetry:reader:fontSize";
function countryFlag(cc) {
  if (!cc || cc.length !== 2) return null;
  const A = 127462;
  const up = cc.toUpperCase();
  return String.fromCodePoint(A + up.charCodeAt(0) - 65) + String.fromCodePoint(A + up.charCodeAt(1) - 65);
}
function PoemDetailPage() {
  const {
    slug
  } = Route$K.useParams();
  const {
    poem: initial
  } = Route$K.useLoaderData();
  const {
    user
  } = useAuth();
  const gate = useAuthGate();
  const fetchPoem = useServerFn(getPoemBySlug);
  const recordRead = useServerFn(recordPoemRead);
  const toggleBookmark = useServerFn(togglePoemBookmark);
  const fetchNeighbors = useServerFn(getPoemNeighbors);
  const q = useQuery({
    queryKey: ["mehfil", "poem", slug],
    queryFn: () => fetchPoem({
      data: {
        slug
      }
    }),
    initialData: initial,
    refetchOnWindowFocus: false
  });
  const poem = q.data ?? initial;
  const qc = useQueryClient();
  useMehfilPoemRealtime(poem?.id, (row) => {
    qc.setQueryData(["mehfil", "poem", slug], (prev2) => prev2 ? {
      ...prev2,
      ...row
    } : prev2);
  });
  const fetchRelated = useServerFn(getMehfilRelated);
  const relatedQ = useQuery({
    queryKey: ["mehfil", "related", poem?.id],
    queryFn: () => fetchRelated({
      data: {
        poemId: poem.id,
        authorId: poem.author_id,
        categoryId: poem.category_id ?? null
      }
    }),
    enabled: !!poem?.id,
    staleTime: 6e4
  });
  const neighborsQ = useQuery({
    queryKey: ["mehfil", "neighbors", poem?.id],
    queryFn: () => fetchNeighbors({
      data: {
        poemId: poem.id,
        publishedAt: poem.published_at ?? poem.created_at,
        categoryId: poem.category_id ?? null
      }
    }),
    enabled: !!poem?.id && !!(poem?.published_at ?? poem?.created_at),
    staleTime: 5 * 6e4
  });
  reactExports.useEffect(() => {
    if (!poem) return;
    void recordRead({
      data: {
        poemId: poem.id
      }
    }).catch(() => {
    });
  }, [poem?.id, recordRead]);
  const [fontIdx, setFontIdx] = reactExports.useState(() => {
    if (typeof window === "undefined") return 2;
    const raw = window.localStorage.getItem(FONT_STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n >= 0 && n < FONT_SIZES.length ? n : 2;
  });
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(FONT_STORAGE_KEY, String(fontIdx));
  }, [fontIdx]);
  const fontPx = FONT_SIZES[fontIdx];
  const articleRef = reactExports.useRef(null);
  const [progress, setProgress] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(rect.top < 0 ? 100 : 0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(scrolled / total * 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [poem?.id]);
  const readingMinutes = reactExports.useMemo(() => {
    const words = (poem?.body ?? "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 180));
  }, [poem?.body]);
  const bookmarkMut = useMutation({
    mutationFn: () => toggleBookmark({
      data: {
        poemId: poem.id
      }
    }),
    onSuccess: (r) => toast.success(r.bookmarked ? "Bookmarked" : "Removed bookmark"),
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const themeStyle = poem.theme ? {
    background: poem.theme
  } : {
    background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)/0.3) 100%)"
  };
  const author = poem.author;
  const displayName = author?.display_name || author?.username || "Anonymous";
  const flag = countryFlag(author?.country_code);
  const requireAuth = (fn) => user ? fn() : gate.openSignIn();
  const [reactions, setReactions] = reactExports.useState([]);
  const [reactionBusy, setReactionBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!poem?.id) return;
    let cancelled = false;
    supabase.from("reactions").select("id,user_id,type").eq("target_type", "mehfil_poem").eq("target_id", poem.id).then(({
      data
    }) => {
      if (!cancelled) setReactions(data ?? []);
    });
    const ch = supabase.channel(`mehfil-reactions-${poem.id}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "reactions",
      filter: `target_id=eq.${poem.id}`
    }, (payload) => {
      if (payload.eventType === "INSERT") {
        const row = payload.new;
        if (row.target_type === "mehfil_poem") setReactions((prev2) => prev2.some((r) => r.id === row.id) ? prev2 : [...prev2, row]);
      } else if (payload.eventType === "DELETE") {
        const row = payload.old;
        setReactions((prev2) => prev2.filter((r) => r.id !== row.id));
      } else if (payload.eventType === "UPDATE") {
        const row = payload.new;
        setReactions((prev2) => prev2.map((r) => r.id === row.id ? row : r));
      }
    }).subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(ch);
    };
  }, [poem?.id]);
  const myReaction = user ? reactions.find((r) => r.user_id === user.id) ?? null : null;
  const counts = {};
  for (const r of reactions) counts[r.type] = (counts[r.type] ?? 0) + 1;
  const react = async (rt) => {
    if (!user || reactionBusy) return;
    setReactionBusy(true);
    try {
      if (myReaction?.type === rt) {
        setReactions((prev2) => prev2.filter((r) => r.id !== myReaction.id));
        await supabase.from("reactions").delete().eq("id", myReaction.id);
        return;
      }
      if (myReaction) {
        setReactions((prev2) => prev2.filter((r) => r.id !== myReaction.id));
        await supabase.from("reactions").delete().eq("id", myReaction.id);
      }
      const {
        data,
        error
      } = await supabase.from("reactions").insert({
        user_id: user.id,
        target_type: "mehfil_poem",
        target_id: poem.id,
        type: rt
      }).select("id,user_id,type").single();
      if (error) throw error;
      if (data) setReactions((prev2) => [...prev2.filter((r) => r.user_id !== user.id), data]);
      gamify(GAM_EVENTS.feedReactionAdded, 1, {
        target: "mehfil_poem",
        poem_id: poem.id,
        reaction: rt
      });
    } catch (e) {
      toast.error(e?.message ?? "Couldn't react");
    } finally {
      setReactionBusy(false);
    }
  };
  const [copied, setCopied] = reactExports.useState(false);
  const copyPoem = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const text = `${poem.title}
by ${displayName}

${poem.body}

${url}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Poem copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };
  const share = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) navigator.share({
      title: poem.title,
      url
    }).catch(() => {
    });
    else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
    gamify("poetry_share", 1, {
      poem_id: poem.id
    });
  };
  const isTrending = (relatedQ.data?.trending ?? []).some((p) => p.id === poem.id) || (poem.upvote_count ?? 0) >= 25 || (poem.read_count ?? 0) >= 500;
  const isOwnPoem = user?.id === poem.author_id;
  const prev = neighborsQ.data?.prev ?? null;
  const next = neighborsQ.data?.next ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MehfilShell, { showBack: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none fixed left-0 right-0 top-0 z-40 h-1 bg-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-[width] duration-100", style: {
      width: `${progress}%`
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { ref: articleRef, className: "mx-auto max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          poem.category && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/poetry/category/$slug", params: {
            slug: poem.category.slug
          }, className: "inline-block rounded-full px-3 py-1 text-xs font-semibold", style: {
            backgroundColor: `${poem.category.color ?? "#6366f1"}22`,
            color: poem.category.color ?? "#6366f1"
          }, children: poem.category.name }),
          isTrending && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3" }),
            " Trending"
          ] }),
          poem.competition_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-3 w-3" }),
            " In Battle"
          ] }),
          poem.is_editors_pick && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-500", children: "Editor’s Pick" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-serif text-3xl font-bold leading-tight md:text-5xl", children: poem.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/u/$username", params: {
            username: author?.username ?? ""
          }, className: "flex items-center gap-3 hover:opacity-90", children: [
            author?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: author.avatar_url, alt: "", className: "h-12 w-12 rounded-full object-cover ring-2 ring-primary/10" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-base font-semibold text-primary", children: displayName.slice(0, 1).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm font-semibold", children: [
                displayName,
                flag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", title: author?.country_code ?? "", children: flag })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(WriterRankBadge, { rank: poem.writer_rank }),
                poem.published_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(poem.published_at).toLocaleDateString(void 0, {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                  " ",
                  readingMinutes,
                  " min read"
                ] })
              ] })
            ] })
          ] }),
          !isOwnPoem && author?.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FollowWriterButton, { writerId: author.id, writerName: displayName }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-end gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1", children: "Aa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFontIdx((i) => Math.max(0, i - 1)), disabled: fontIdx === 0, className: "grid h-7 w-7 place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-40", "aria-label": "Decrease font size", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1)), disabled: fontIdx === FONT_SIZES.length - 1, className: "grid h-7 w-7 place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-40", "aria-label": "Increase font size", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-3xl border border-border/60 p-8 shadow-sm md:p-14", style: themeStyle, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap font-serif leading-[1.85] tracking-[0.005em]", style: {
        fontSize: `${fontPx}px`,
        lineHeight: 1.85
      }, children: poem.body }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-2", children: [
        MEHFIL_REACTIONS.map((r) => {
          const active = myReaction?.type === r.type;
          const c = counts[r.type] ?? 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => requireAuth(() => react(r.type)), disabled: reactionBusy, "aria-pressed": active, className: `group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 hover:shadow disabled:opacity-60 ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/50"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base", children: r.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.label }),
            c > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-primary/20" : "bg-muted"}`, children: c })
          ] }, r.type);
        }),
        reactions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-[11px] text-muted-foreground", children: [
          reactions.length,
          " ",
          reactions.length === 1 ? "reaction" : "reactions"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 hidden items-center justify-between rounded-2xl border border-border/60 bg-card p-4 md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-5 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4" }),
            " ",
            poem.upvote_count
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
            " ",
            poem.read_count
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
            " ",
            poem.comment_count
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: copyPoem, className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted", children: [
            copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }),
            " ",
            copied ? "Copied" : "Copy"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => requireAuth(() => bookmarkMut.mutate()), disabled: bookmarkMut.isPending, className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "h-3.5 w-3.5" }),
            " Bookmark"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: share, className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5" }),
            " Share"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReportButton, { targetType: "post", targetId: poem.id, variant: "outline" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center gap-5 rounded-2xl border border-border/60 bg-card p-3 text-sm text-muted-foreground md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4" }),
          " ",
          poem.upvote_count
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
          " ",
          poem.read_count
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
          " ",
          poem.comment_count
        ] })
      ] }),
      poem.tags?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: poem.tags.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground", children: [
        "#",
        t
      ] }, t)) }),
      (prev || next) && /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mt-10 grid gap-3 sm:grid-cols-2", children: [
        prev && isNavigableSlug(prev.slug) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry/$slug", params: {
          slug: prev.slug
        }, className: "group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition hover:border-primary/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Previous" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: prev.title })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
        next && isNavigableSlug(next.slug) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry/$slug", params: {
          slug: next.slug
        }, className: "group flex items-center justify-end gap-3 rounded-2xl border border-border/60 bg-card p-4 text-right transition hover:border-primary/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Next" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: next.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "comments", className: "mt-10 rounded-2xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground", children: "Comments coming soon — the shared platform comments module lands here in Phase 2." }),
      relatedQ.data?.moreFromAuthor && relatedQ.data.moreFromAuthor.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: [
          "More from ",
          displayName
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: relatedQ.data.moreFromAuthor.slice(0, 4).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PoemCard, { poem: p, variant: "compact" }, p.id)) })
      ] }),
      relatedQ.data?.related && relatedQ.data.related.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: [
          "Related poems",
          poem.category ? ` in ${poem.category.name}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: relatedQ.data.related.slice(0, 4).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PoemCard, { poem: p, variant: "compact" }, p.id)) })
      ] }),
      relatedQ.data?.trending && relatedQ.data.trending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: "Trending on Poetry Hub" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: relatedQ.data.trending.slice(0, 4).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PoemCard, { poem: p, variant: "compact" }, p.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-3xl items-center justify-around gap-1 px-2 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: copyPoem, className: "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-muted-foreground", children: [
        copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: copied ? "Copied" : "Copy" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => requireAuth(() => bookmarkMut.mutate()), disabled: bookmarkMut.isPending, className: "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Save" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: share, className: "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Share" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#comments", className: "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Comment" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportButton, { targetType: "post", targetId: poem.id, variant: "ghost", size: "icon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Report" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 md:hidden" })
  ] });
}
export {
  PoemDetailPage as component
};
