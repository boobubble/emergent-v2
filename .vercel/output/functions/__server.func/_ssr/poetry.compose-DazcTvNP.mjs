import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useAuth, b as useServerFn, cY as listMehfilCategories, d3 as publishPoem, O as isNavigableSlug, as as AuthScreen } from "./router-CYWPFaDK.mjs";
import { u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { M as MehfilShell } from "./MehfilShell-Czus6X_P.mjs";
import { g as gamify } from "./gamification-emit-CN-BLne_.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { X, a as Sparkles, a0 as LoaderCircle, a3 as Swords, aj as Send, b as Save } from "../_libs/lucide-react.mjs";
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
import "./env.server-Bcmcot3M.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "./use-mehfil-label-BWBPC7g6.mjs";
import "./mehfil-admin.functions-BntRjkJU.mjs";
import "./gamification-engine.functions-CTvD5DWu.mjs";
const assistPoemAI = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => {
  if (!input?.action) throw new Error("action required");
  if (!input?.text || input.text.trim().length < 3) throw new Error("text too short");
  if (input.text.length > 4e3) throw new Error("text too long");
  return input;
}).handler(createSsrRpc("5cc41eddc3a1c5f04125f22b2801d8ae1339f4504dfab9ef76954346698f4ece"));
const THEMES = [{
  key: "paper",
  label: "Paper",
  css: "linear-gradient(135deg,#fef7e0 0%,#faf0d0 100%)"
}, {
  key: "night",
  label: "Night",
  css: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)"
}, {
  key: "rose",
  label: "Rose",
  css: "linear-gradient(135deg,#fecdd3 0%,#fda4af 100%)"
}, {
  key: "ocean",
  label: "Ocean",
  css: "linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)"
}, {
  key: "sunset",
  label: "Sunset",
  css: "linear-gradient(135deg,#fed7aa 0%,#fca5a5 100%)"
}, {
  key: "sage",
  label: "Sage",
  css: "linear-gradient(135deg,#d9f99d 0%,#a7f3d0 100%)"
}];
function ComposePage() {
  const {
    user
  } = useAuth();
  const nav = useNavigate();
  const fetchCats = useServerFn(listMehfilCategories);
  const publish = useServerFn(publishPoem);
  const cats = useQuery({
    queryKey: ["mehfil", "categories"],
    queryFn: () => fetchCats()
  });
  const [title, setTitle] = reactExports.useState("");
  const [body, setBody] = reactExports.useState("");
  const [categorySlug, setCategorySlug] = reactExports.useState("original-poetry");
  const [theme, setTheme] = reactExports.useState(null);
  const [tags, setTags] = reactExports.useState("");
  const [language, setLanguage] = reactExports.useState("en");
  const [optInBattle, setOptInBattle] = reactExports.useState(false);
  const [aiBusy, setAiBusy] = reactExports.useState(null);
  const aiFn = useServerFn(assistPoemAI);
  const runAI = async (action) => {
    if (!body.trim() && action !== "continue") return toast.error("Write something first");
    setAiBusy(action);
    try {
      const res = await aiFn({
        data: {
          action,
          text: body || title,
          title,
          targetLang: language
        }
      });
      if (res?.text) {
        setBody(action === "continue" ? `${body}

${res.text}` : res.text);
        toast.success("AI applied");
      }
    } catch (e) {
      toast.error(e?.message ?? "AI failed");
    } finally {
      setAiBusy(null);
    }
  };
  const publishMut = useMutation({
    mutationFn: (status) => publish({
      data: {
        title,
        body,
        categorySlug,
        language,
        tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
        theme: theme ?? void 0,
        status,
        optInBattle
      }
    }),
    onSuccess: (poem) => {
      if (poem.status === "published") {
        gamify("poetry_publish", 1, {
          poem_id: poem.id,
          category: categorySlug
        });
        toast.success(optInBattle ? "Published & entered active battle" : "Poem published to Poetry Hub");
        if (isNavigableSlug(poem.slug)) {
          nav({
            to: "/poetry/$slug",
            params: {
              slug: poem.slug
            }
          });
        } else {
          nav({
            to: "/poetry"
          });
        }
      } else {
        toast.success("Saved as draft");
        nav({
          to: "/poetry"
        });
      }
    },
    onError: (e) => toast.error(e?.message ?? "Failed to publish")
  });
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(MehfilShell, { showBack: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-2xl font-bold", children: "Sign in to write" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Join Poetry Hub to publish your poetry, earn writer ranks, and enter poetry battles." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthScreen, {}) })
    ] }) });
  }
  const themeCss = theme ?? "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)/0.4) 100%)";
  const canPublish = title.trim().length > 0 && body.trim().length >= 10 && !publishMut.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MehfilShell, { showBack: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl font-bold", children: "Write a Poem" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Draft, publish and share with the Poetry Hub community." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/poetry", className: "rounded-md p-2 hover:bg-muted", "aria-label": "Close", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr_260px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Title your poem…", className: "w-full rounded-xl border border-border bg-card px-4 py-3 font-serif text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/40", maxLength: 140 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60", style: {
          background: themeCss
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: body, onChange: (e) => setBody(e.target.value), placeholder: "Let your words breathe…\n\nEvery line matters. Write it your way.", rows: 16, className: "min-h-[420px] w-full resize-y bg-transparent p-6 font-serif text-lg leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: tags, onChange: (e) => setTags(e.target.value), placeholder: "Tags (comma separated): love, urdu, monsoon", className: "w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: categorySlug, onChange: (e) => setCategorySlug(e.target.value), className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm", children: (cats.data ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.slug, children: c.name }, c.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Language" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: language, onChange: (e) => setLanguage(e.target.value), className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "en", children: "English" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hi", children: "Hindi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ur", children: "Urdu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pa", children: "Punjabi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bn", children: "Bengali" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "es", children: "Spanish" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ar", children: "Arabic" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Background Theme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTheme(null), className: `h-10 rounded-lg border text-[10px] font-semibold ${theme === null ? "border-primary ring-2 ring-primary/40" : "border-border"}`, children: "Default" }),
            THEMES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTheme(t.css), className: `h-10 rounded-lg border text-[10px] font-semibold ${theme === t.css ? "border-primary ring-2 ring-primary/40" : "border-border"}`, style: {
              background: t.css
            }, title: t.label, children: t.label }, t.key))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "AI Assist" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5", children: [["improve", "Improve"], ["continue", "Continue"], ["beautify", "Beautify"], ["translate", "Translate"], ["urdu_style", "Urdu Style"], ["hindi_style", "Hindi Style"], ["english_style", "English"]].map(([act, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => runAI(act), disabled: aiBusy !== null, className: "inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] font-semibold hover:bg-muted disabled:opacity-50", children: [
            aiBusy === act ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : null,
            label
          ] }, act)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 cursor-pointer hover:border-primary/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: optInBattle, onChange: (e) => setOptInBattle(e.target.checked), className: "mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-4 w-4 text-primary" }),
              " Enter Poetry Battle"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: "Auto-enroll this poem in the active battle for its category." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => publishMut.mutate("published"), disabled: !canPublish, className: "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
            " Publish"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => publishMut.mutate("draft"), disabled: !title.trim() || publishMut.isPending, className: "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
            " Save Draft"
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  ComposePage as component
};
