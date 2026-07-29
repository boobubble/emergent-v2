import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, ae as Card, ag as CardHeader, ah as CardTitle, af as CardContent, a0 as Input, ad as Textarea, B as Button } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { l as listWidgets, p as createWidget, q as updateWidget, t as deleteWidget } from "./broadcaster.functions-qVw6vjOe.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { d as Trash2, aK as Link, cu as Waves, i as Radio, bm as Music } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
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
function detectStreamKind(raw) {
  const url = (raw || "").trim();
  if (!url) return {
    kind: "empty",
    label: "",
    hint: "Paste an Icecast/Azuracast/SHOUTcast or HLS URL to play a live broadcast."
  };
  if (!/^https?:\/\//i.test(url)) return {
    kind: "invalid",
    label: "Invalid URL",
    hint: "Must start with http:// or https://"
  };
  const lower = url.toLowerCase();
  const path = lower.split("?")[0];
  if (path.endsWith(".m3u8")) return {
    kind: "hls",
    label: "HLS stream",
    hint: "Detected HLS (.m3u8) — adaptive live stream."
  };
  if (path.endsWith(".mp3") || path.includes("/mp3")) return {
    kind: "mp3",
    label: "MP3 stream",
    hint: "Detected MP3 audio stream."
  };
  if (path.endsWith(".aac") || path.endsWith(".m4a")) return {
    kind: "aac",
    label: "AAC stream",
    hint: "Detected AAC audio stream."
  };
  if (path.endsWith(".ogg") || path.endsWith(".opus")) return {
    kind: "ogg",
    label: "Ogg stream",
    hint: "Detected Ogg/Opus audio stream."
  };
  if (lower.includes("/public/") || lower.includes("azuracast")) return {
    kind: "azuracast",
    label: "Azuracast",
    hint: "Detected Azuracast public mount — plays as MP3/AAC."
  };
  if (lower.includes(":8000") || lower.includes("icecast") || /\/[a-z0-9_-]+$/i.test(path)) return {
    kind: "icecast",
    label: "Icecast / SHOUTcast",
    hint: "Detected Icecast/SHOUTcast mount point."
  };
  return {
    kind: "unknown",
    label: "Custom stream",
    hint: "Unknown format — the player will attempt MP3/AAC playback."
  };
}
function StreamHint({
  url
}) {
  const info = detectStreamKind(url);
  if (info.kind === "empty") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-3 w-3" }),
      " ",
      info.hint
    ] });
  }
  const Icon = info.kind === "hls" ? Waves : info.kind === "invalid" ? Link : info.kind === "azuracast" || info.kind === "icecast" || info.kind === "shoutcast" ? Radio : Music;
  const tone = info.kind === "invalid" ? "text-destructive" : "text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-xs flex items-center gap-1.5 ${tone}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
    info.label && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
      info.label,
      ":"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: info.hint })
  ] });
}
function WidgetsPage() {
  const qc = useQueryClient();
  const fetchWidgets = useServerFn(listWidgets);
  const create = useServerFn(createWidget);
  const update = useServerFn(updateWidget);
  const del = useServerFn(deleteWidget);
  const widgets = useQuery({
    queryKey: ["broadcaster-widgets"],
    queryFn: () => fetchWidgets()
  });
  const createMut = useMutation({
    mutationFn: (vars) => create({
      data: vars
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["broadcaster-widgets"]
      });
      toast.success("Widget created");
    },
    onError: (e) => toast.error(e.message)
  });
  const updateMut = useMutation({
    mutationFn: (vars) => update({
      data: vars
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["broadcaster-widgets"]
      });
      toast.success("Saved");
    },
    onError: (e) => toast.error(e.message)
  });
  const delMut = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["broadcaster-widgets"]
      });
      toast.success("Removed");
    },
    onError: (e) => toast.error(e.message)
  });
  const [name, setName] = reactExports.useState("");
  const [desc, setDesc] = reactExports.useState("");
  const [streamUrl, setStreamUrl] = reactExports.useState("");
  const [editStream, setEditStream] = reactExports.useState({});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Create radio widget" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Station name", value: name, onChange: (e) => setName(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Description (optional)", value: desc, onChange: (e) => setDesc(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Live stream URL (e.g. https://radio.example.org/public/yourstation)", value: streamUrl, onChange: (e) => setStreamUrl(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StreamHint, { url: streamUrl })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !name.trim() || createMut.isPending, onClick: () => createMut.mutate({
          name,
          description: desc || void 0,
          stream_url: streamUrl || void 0
        }, {
          onSuccess: () => {
            setName("");
            setDesc("");
            setStreamUrl("");
          }
        }), children: "Create" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      (widgets.data ?? []).map((w) => {
        const current = editStream[w.id] ?? w.stream_url ?? "";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: w.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              if (confirm("Delete widget?")) delMut.mutate(w.id);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-sm text-muted-foreground space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "/",
              w.slug
            ] }),
            w.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: w.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground", children: "Live stream URL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "https://radio.example.org/public/yourstation", value: current, onChange: (e) => setEditStream((s) => ({
                ...s,
                [w.id]: e.target.value
              })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StreamHint, { url: current }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: updateMut.isPending, onClick: () => updateMut.mutate({
                  id: w.id,
                  stream_url: current.trim() || null
                }), children: "Save stream" }),
                current && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                  setEditStream((s) => ({
                    ...s,
                    [w.id]: ""
                  }));
                  updateMut.mutate({
                    id: w.id,
                    stream_url: null
                  });
                }, children: "Clear" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: w.enabled ? "default" : "outline", onClick: () => updateMut.mutate({
              id: w.id,
              enabled: !w.enabled
            }), children: w.enabled ? "Enabled" : "Disabled" })
          ] })
        ] }, w.id);
      }),
      (widgets.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No widgets yet — create one above." })
    ] })
  ] });
}
export {
  WidgetsPage as component
};
