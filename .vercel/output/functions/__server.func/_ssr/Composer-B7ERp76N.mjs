import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAppSettings, b as useServerFn, cN as searchActiveCompetitions, cO as listCompetitionNominees, ct as FUN_META, cs as FUN_CATEGORIES } from "./router-CYWPFaDK.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { j as earnFeedPost, E as EmojiPicker } from "./EmojiPicker-DcAQqNHO.mjs";
import { c as createConfession } from "./confessions.functions-BBpBF4R_.mjs";
import { a as Popover, b as PopoverTrigger, c as PopoverContent, e as extractHashtags, s as slugify } from "./PostCard-DLZQjCkW.mjs";
import { u as useFocusComposerConfig } from "./focus-composer-config-C2kdKn7r.mjs";
import { i as isCurrentUserAdmin, c as clearCaches, f as formatClearReport } from "./cache-manager-cID9K-3q.mjs";
import { ap as Globe, U as Users, W as Lock, a as Sparkles, X, a$ as ChartColumn, cH as VenetianMask, bo as Laugh, e as EyeOff, O as Trophy, N as Search, c as Plus, I as Image, ai as Smile, bF as Hash, a0 as LoaderCircle, af as Play } from "../_libs/lucide-react.mjs";
const XP_ACTIONS = {
  post: 5,
  comment: 1,
  reaction: 1,
  daily_login: 10
};
const awardXp = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((input) => {
  if (!input || typeof input.action !== "string" || !(input.action in XP_ACTIONS)) {
    throw new Error("Invalid XP action");
  }
  return {
    action: input.action
  };
}).handler(createSsrRpc("417f909761be074b0ec58b2556613f6f72b464544eef72f807a11ce3b6ffe628"));
const pingDailyStreak = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(createSsrRpc("712b9ee2080ac24476f7b48f0e09a6deaaf01126deb43d8798e9d0fd9acad5dc"));
function VideoThumb({ file, className }) {
  const [thumb, setThumb] = reactExports.useState(null);
  const urlRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    let cancelled = false;
    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };
    const capture = () => {
      try {
        const w = video.videoWidth || 320;
        const h = video.videoHeight || 240;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        if (!cancelled) setThumb(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
      } finally {
        cleanup();
      }
    };
    const onLoaded = () => {
      try {
        video.currentTime = Math.min(0.1, (video.duration || 1) / 2);
      } catch {
        capture();
      }
    };
    const onSeeked = () => capture();
    const onError = () => cleanup();
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      cleanup();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [file]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative h-full w-full bg-black ${className ?? ""}`, children: [
    thumb ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: thumb, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full animate-pulse bg-neutral-800" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center bg-black/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-full bg-black/60 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5 fill-white text-white" }) }) })
  ] });
}
const PRIVACY = [
  { id: "public", label: "Public", icon: Globe },
  { id: "friends", label: "Friends", icon: Users },
  { id: "private", label: "Only me", icon: Lock }
];
const DRAFT_KEY = "feed-composer-draft";
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_VIDEO_EXTS = ["mp4", "webm"];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
function validateAndFilter(incoming) {
  const ok = [];
  const rejected = [];
  for (const f of incoming) {
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const isVideoLike = f.type.startsWith("video/") || ["mp4", "webm", "mov", "m4v", "ogg", "avi", "mkv"].includes(ext);
    if (isVideoLike) {
      const typeOk = ALLOWED_VIDEO_TYPES.includes(f.type) || ALLOWED_VIDEO_EXTS.includes(ext);
      if (!typeOk) {
        rejected.push(`${f.name} — only MP4 or WebM videos are allowed`);
        continue;
      }
      if (f.size > MAX_VIDEO_BYTES) {
        rejected.push(`${f.name} — video exceeds 100 MB`);
        continue;
      }
    }
    ok.push(f);
  }
  return { ok, rejected };
}
function Composer({ authorId, onPosted, communityId }) {
  const [text, setText] = reactExports.useState(() => typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) || "" : "");
  const [files, setFiles] = reactExports.useState([]);
  const [privacy, setPrivacy] = reactExports.useState("public");
  const [anonymous, setAnonymous] = reactExports.useState(false);
  const [eligibleForCompetitions, setEligibleForCompetitions] = reactExports.useState(true);
  const [posting, setPosting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [focused, setFocused] = reactExports.useState(false);
  const [mode, setMode] = reactExports.useState("post");
  const [pollQuestion, setPollQuestion] = reactExports.useState("");
  const [pollOptions, setPollOptions] = reactExports.useState(["", ""]);
  const { modules } = useAppSettings();
  const [memeCompetition, setMemeCompetition] = reactExports.useState(null);
  const [memeCompQuery, setMemeCompQuery] = reactExports.useState("");
  const [memeCompResults, setMemeCompResults] = reactExports.useState([]);
  const [memeNominees, setMemeNominees] = reactExports.useState([]);
  const [memeNomineeId, setMemeNomineeId] = reactExports.useState(null);
  const [funCategory, setFunCategory] = reactExports.useState("meme");
  const fileRef = reactExports.useRef(null);
  const textareaRef = reactExports.useRef(null);
  const earnPost = useServerFn(earnFeedPost);
  const submitConfession = useServerFn(createConfession);
  const { config: focusConfig } = useFocusComposerConfig();
  const hasDraft = text.trim().length > 0 || files.length > 0;
  reactExports.useEffect(() => {
    if (!focused) return;
    const onKey = (e) => {
      if (e.key === "Escape") setFocused(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [focused]);
  reactExports.useEffect(() => {
    if (mode !== "meme") return;
    let alive = true;
    const t = setTimeout(async () => {
      const rows = await searchActiveCompetitions(memeCompQuery);
      if (alive) setMemeCompResults(rows);
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [mode, memeCompQuery]);
  reactExports.useEffect(() => {
    if (!memeCompetition || !modules.nomineeMemeTagging) {
      setMemeNominees([]);
      setMemeNomineeId(null);
      return;
    }
    let alive = true;
    listCompetitionNominees(memeCompetition.id).then((n) => {
      if (alive) setMemeNominees(n);
    });
    return () => {
      alive = false;
    };
  }, [memeCompetition, modules.nomineeMemeTagging]);
  function openFocus() {
    if (!focusConfig.enabled) return;
    setFocused(true);
    setTimeout(() => textareaRef.current?.focus(), 30);
  }
  function updateText(v) {
    setText(v);
    try {
      localStorage.setItem(DRAFT_KEY, v);
    } catch {
    }
  }
  async function uploadFiles() {
    if (!files.length) return [];
    const urls = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${authorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: error2 } = await supabase.storage.from("feed-media").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error2) throw new Error(error2.message);
      const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }
  const queryClient = useQueryClient();
  async function submit() {
    if (mode === "poll") {
      const cleanOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
      if (!pollQuestion.trim()) {
        setError("Add a poll question.");
        return;
      }
      if (cleanOpts.length < 2) {
        setError("Add at least two poll options.");
        return;
      }
    } else if (mode === "confession") {
      if (!text.trim()) {
        setError("Write your confession first.");
        return;
      }
    } else if (mode === "meme") {
      if (!text.trim() && !files.length) {
        setError(`Add a caption or an image for your ${FUN_META[funCategory].label.toLowerCase()}.`);
        return;
      }
    } else {
      if (!text.trim() && !files.length) return;
    }
    const trimmed = text.trim();
    if (mode === "post" && /^\/clearcache\b/i.test(trimmed)) {
      const ok = await isCurrentUserAdmin();
      if (!ok) {
        toast.error("Admins only", { description: "/clearcache is restricted to admins." });
        return;
      }
      toast.loading("Clearing caches…", { id: "clearcache" });
      const report = await clearCaches({ queryClient });
      toast.success("Caches cleared", { id: "clearcache", description: formatClearReport(report) });
      setText("");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
      }
      return;
    }
    setPosting(true);
    setError(null);
    try {
      if (mode === "confession") {
        await submitConfession({ data: {
          kind: "text",
          category: "secrets",
          text: text.trim(),
          display_mode: "fully_anonymous"
        } });
        toast.success("Confession shared anonymously");
        setText("");
        setMode("post");
        setFocused(false);
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
        }
        return;
      }
      const hashtags = extractHashtags(text);
      if (mode === "poll") {
        const cleanOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
        const { error: error2 } = await supabase.from("posts").insert({
          author_id: authorId,
          owner_id: authorId,
          kind: "poll",
          text: text.trim(),
          slug: slugify(pollQuestion.trim() || "poll"),
          media_urls: [],
          poll: { question: pollQuestion.trim(), options: cleanOpts, votes: {} },
          privacy,
          is_anonymous: anonymous,
          hashtags,
          ...communityId ? { community_id: communityId } : {}
        });
        if (error2) throw new Error(error2.message);
      } else {
        const media_urls = await uploadFiles();
        const hasMedia = files.length > 0;
        const kind = hasMedia ? "image" : "text";
        const isMeme = mode === "meme";
        const activeCategory = isMeme ? funCategory : "meme";
        const { error: error2 } = await supabase.from("posts").insert({
          author_id: authorId,
          owner_id: authorId,
          kind,
          text: text.trim(),
          slug: slugify(text.trim() || (isMeme ? activeCategory : kind)),
          media_urls,
          privacy,
          is_anonymous: anonymous,
          hashtags,
          ...communityId ? { community_id: communityId } : {},
          ...isMeme ? { category: activeCategory } : {},
          ...isMeme && memeCompetition ? { competition_id: memeCompetition.id } : {},
          ...isMeme && memeCompetition && memeNomineeId ? { nominee_id: memeNomineeId } : {},
          eligible_for_competitions: eligibleForCompetitions
        });
        if (error2) throw new Error(error2.message);
      }
      try {
        await awardXp({ data: { action: "post" } });
      } catch (e) {
        console.error("xp award failed", e);
      }
      earnPost().catch(() => {
      });
      setText("");
      setFiles([]);
      setAnonymous(false);
      setFocused(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setMode("post");
      setMemeCompetition(null);
      setMemeCompQuery("");
      setMemeCompResults([]);
      setMemeNomineeId(null);
      setFunCategory("meme");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
      }
      onPosted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  }
  const PrivacyIconEl = PRIVACY.find((p) => p.id === privacy).icon;
  const spotlight = focused && focusConfig.enabled;
  const useAnim = focusConfig.animations;
  const card = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: [
        "relative rounded-[1.25rem] border bg-card p-5 transition-[box-shadow,border-color,transform] duration-200",
        spotlight ? "border-primary/60 shadow-2xl ring-2 ring-primary/30 sm:scale-[1.01]" : "border-border shadow-[0_8px_24px_-16px_oklch(0_0_0/0.5)]",
        spotlight && useAnim ? "animate-scale-in" : ""
      ].join(" "),
      children: [
        spotlight && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
            " Focus mode"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setFocused(false),
              className: "rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
              "aria-label": "Close focus composer",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold ring-2 ring-card", children: authorId ? authorId.slice(0, 1).toUpperCase() : "?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              ref: textareaRef,
              value: text,
              onChange: (e) => updateText(e.target.value),
              onFocus: openFocus,
              onClick: openFocus,
              rows: spotlight ? 6 : 2,
              placeholder: mode === "confession" ? "Share something honest — posted anonymously to the confessions board…" : mode === "poll" ? "Optional context for your poll…" : mode === "meme" ? `Add a caption for your ${FUN_META[funCategory].label.toLowerCase()}… ${FUN_META[funCategory].emoji}` : "What's on your mind? Use #hashtags and @mentions…",
              className: "w-full resize-none rounded-2xl border border-transparent bg-transparent px-1 py-2 text-[15px] leading-relaxed placeholder:text-muted-foreground focus:outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ModeChip, { active: mode === "post", onClick: () => setMode("post"), label: "Post" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ModeChip, { active: mode === "poll", onClick: () => setMode("poll"), icon: ChartColumn, label: "Poll", tone: "primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ModeChip, { active: mode === "confession", onClick: () => setMode("confession"), icon: VenetianMask, label: "Confess", tone: "fuchsia" }),
          modules.competitionMemes && /* @__PURE__ */ jsxRuntimeExports.jsx(ModeChip, { active: mode === "meme", onClick: () => setMode("meme"), icon: Laugh, label: "🎉 Fun", tone: "amber" }),
          mode === "confession" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-3 w-3" }),
            " Posted anonymously to /confessions"
          ] })
        ] }),
        mode === "meme" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-500", children: "Post type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: FUN_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setFunCategory(cat),
                className: `rounded-full border px-3 py-1 text-[12px] font-semibold ${funCategory === cat ? "border-amber-500 bg-amber-500/15 text-amber-500" : "border-border text-muted-foreground hover:text-foreground"}`,
                children: [
                  FUN_META[cat].emoji,
                  " ",
                  FUN_META[cat].label
                ]
              },
              cat
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }),
            " Related competition ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal normal-case text-muted-foreground", children: "(optional)" })
          ] }),
          memeCompetition ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-amber-500/30 bg-background/60 px-3 py-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-semibold", children: memeCompetition.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase text-muted-foreground", children: memeCompetition.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setMemeCompetition(null);
                  setMemeNomineeId(null);
                },
                className: "rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground",
                "aria-label": "Clear competition",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: memeCompQuery,
                  onChange: (e) => setMemeCompQuery(e.target.value),
                  placeholder: "Search active competitions…",
                  className: "flex-1 bg-transparent text-sm focus:outline-none"
                }
              )
            ] }),
            memeCompResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 overflow-y-auto rounded-xl border border-border bg-background/60", children: memeCompResults.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setMemeCompetition(c);
                  setMemeCompQuery("");
                  setMemeCompResults([]);
                },
                className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: c.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase text-muted-foreground", children: c.status })
                ]
              },
              c.id
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Leave empty to post as a normal Feed meme." })
          ] }),
          memeCompetition && modules.nomineeMemeTagging && memeNominees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-500", children: [
              "Supported nominee ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal normal-case text-muted-foreground", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex max-h-32 flex-wrap gap-1.5 overflow-y-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setMemeNomineeId(null),
                  className: `rounded-full border px-2.5 py-1 text-[11px] font-semibold ${!memeNomineeId ? "border-amber-500 bg-amber-500/15 text-amber-500" : "border-border text-muted-foreground hover:text-foreground"}`,
                  children: "None"
                }
              ),
              memeNominees.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setMemeNomineeId(n.id),
                  className: `rounded-full border px-2.5 py-1 text-[11px] font-semibold ${memeNomineeId === n.id ? "border-amber-500 bg-amber-500/15 text-amber-500" : "border-border text-muted-foreground hover:text-foreground"}`,
                  children: n.name
                },
                n.id
              ))
            ] })
          ] })
        ] }),
        mode === "poll" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-2xl border border-primary/30 bg-primary/5 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: pollQuestion,
              onChange: (e) => setPollQuestion(e.target.value),
              placeholder: "Ask a question…",
              maxLength: 280,
              className: "mb-2 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: pollOptions.map((opt, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: opt,
                onChange: (e) => setPollOptions((p) => p.map((v, j) => j === i ? e.target.value : v)),
                placeholder: `Option ${i + 1}`,
                maxLength: 120,
                className: "flex-1 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              }
            ),
            pollOptions.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setPollOptions((p) => p.filter((_, j) => j !== i)),
                className: "rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                "aria-label": `Remove option ${i + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
              }
            )
          ] }, i)) }),
          pollOptions.length < 6 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setPollOptions((p) => [...p, ""]),
              className: "mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
                " Add option"
              ]
            }
          )
        ] }),
        files.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: files.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-black", children: [
          f.type.startsWith("video/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(VideoThumb, { file: f }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: URL.createObjectURL(f), alt: f.name, className: "h-full w-full object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFiles(files.filter((_, j) => j !== i)), className: "absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white", "aria-label": "Remove file", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
        ] }, i)) }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-destructive", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileRef.current?.click(), className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-400/10 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Photo" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              accept: "image/*,video/mp4,video/webm,.mp4,.webm",
              multiple: true,
              className: "hidden",
              onChange: (e) => {
                const picked = Array.from(e.target.files ?? []);
                const { ok, rejected } = validateAndFilter(picked);
                if (rejected.length) toast.error("Some files were skipped", { description: rejected.join("\n") });
                if (ok.length) setFiles([...files, ...ok]);
                if (fileRef.current) fileRef.current.value = "";
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-4 w-4" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Emoji" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { align: "start", className: "w-[320px] p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmojiPicker, { onPick: (e) => updateText(text + e) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => updateText(text + " #"), className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-sky-400 hover:bg-sky-400/10 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "h-4 w-4" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Tag" })
          ] }),
          spotlight && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden text-[11px] text-muted-foreground sm:inline", children: hasDraft ? "Draft auto-saved" : "Draft empty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: privacy,
                onChange: (e) => setPrivacy(e.target.value),
                className: "rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs font-medium",
                "aria-label": "Post audience",
                children: PRIVACY.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.label }, p.id))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setAnonymous(!anonymous), className: `inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${anonymous ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-3 w-3" }),
              " Anon"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setEligibleForCompetitions((v) => !v),
                title: "Allow this post to auto-qualify for matching competitions",
                className: `inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${eligibleForCompetitions ? "border-amber-400/60 bg-amber-400/10 text-amber-300" : "border-border text-muted-foreground hover:text-foreground"}`,
                children: "🏆 Eligible"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyIconEl, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: submit,
                disabled: posting || mode === "post" && !text.trim() && !files.length || mode === "confession" && !text.trim() || mode === "meme" && !text.trim() && !files.length || mode === "poll" && (!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2),
                className: "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 px-5 py-2 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-8px_var(--primary-glow)] hover:scale-[1.03] active:scale-[0.97] transition disabled:opacity-50 disabled:hover:scale-100",
                children: [
                  posting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
                  mode === "confession" ? "Confess" : mode === "poll" ? "Publish poll" : mode === "meme" ? `Post ${FUN_META[funCategory].label.toLowerCase()}` : "Post"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
  if (!spotlight) return card;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground", children: [
      "Composer open in focus mode — press ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded bg-muted px-1.5 py-0.5 text-[11px]", children: "Esc" }),
      " to close."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: [
          "fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto px-0 py-0 sm:items-center sm:px-4 sm:py-8",
          useAnim ? "animate-fade-in" : ""
        ].join(" "),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Create a post",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              "aria-label": "Dismiss focus composer",
              onClick: () => setFocused(false),
              className: [
                "absolute inset-0 bg-background/70",
                focusConfig.blur ? "backdrop-blur-md" : ""
              ].join(" ")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 flex min-h-full w-full max-w-2xl flex-col justify-center sm:min-h-0", children: card })
        ]
      }
    )
  ] });
}
function ModeChip({
  active,
  onClick,
  icon: Icon,
  label,
  tone
}) {
  const accent = tone === "fuchsia" ? "border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-500" : tone === "amber" ? "border-amber-500 bg-amber-500/15 text-amber-500" : "border-primary bg-primary/15 text-primary";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      className: `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? accent : "border-border text-muted-foreground hover:text-foreground"}`,
      children: [
        Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
        label
      ]
    }
  );
}
export {
  Composer as C,
  pingDailyStreak as p
};
