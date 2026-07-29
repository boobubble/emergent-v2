import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, aF as updateSetting, ae as Card, ag as CardHeader, ah as CardTitle, af as CardContent, B as Button, a0 as Input } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { l as listWidgets, i as listQueue, j as addQueueItem, r as removeQueueItem, k as clearQueue } from "./broadcaster.functions-qVw6vjOe.mjs";
import { u as useDjPlayer, b as buildTrackFromUrl, c as currentPositionSec, a as analyzeStreamUrl } from "./dj-store-CLtP8DK4.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { ag as Pause, af as Play, aL as Square, d as Trash2, i as Radio } from "../_libs/lucide-react.mjs";
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
import "./media-providers-config-Do_nLlCF.mjs";
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
function QueuePage() {
  const qc = useQueryClient();
  const fetchWidgets = useServerFn(listWidgets);
  const fetchQueue = useServerFn(listQueue);
  const add = useServerFn(addQueueItem);
  const remove = useServerFn(removeQueueItem);
  const clear = useServerFn(clearQueue);
  const saveSetting = useServerFn(updateSetting);
  const {
    state: djState
  } = useDjPlayer();
  const widgets = useQuery({
    queryKey: ["broadcaster-widgets"],
    queryFn: () => fetchWidgets()
  });
  const [widgetId, setWidgetId] = reactExports.useState("");
  const queue = useQuery({
    queryKey: ["broadcaster-queue", widgetId],
    queryFn: () => fetchQueue({
      data: {
        widget_id: widgetId
      }
    }),
    enabled: !!widgetId
  });
  const [url, setUrl] = reactExports.useState("");
  const [streamUrl, setStreamUrl] = reactExports.useState("");
  const [streamName, setStreamName] = reactExports.useState("");
  const addMut = useMutation({
    mutationFn: () => add({
      data: {
        widget_id: widgetId,
        url
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["broadcaster-queue", widgetId]
      });
      setUrl("");
    },
    onError: (e) => toast.error(e.message)
  });
  const removeMut = useMutation({
    mutationFn: (id) => remove({
      data: {
        id,
        widget_id: widgetId
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["broadcaster-queue", widgetId]
    })
  });
  const clearMut = useMutation({
    mutationFn: () => clear({
      data: {
        widget_id: widgetId
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["broadcaster-queue", widgetId]
    })
  });
  const playMut = useMutation({
    mutationFn: async (item) => {
      const track = buildTrackFromUrl(item.youtube_url, item.title ?? void 0);
      if (!track) throw new Error("Could not parse track URL");
      const next = {
        ...djState,
        enabled: true,
        track,
        playing: true,
        startedAtMs: Date.now(),
        positionSec: 0
      };
      await saveSetting({
        data: {
          key: "dj_player",
          value: next
        }
      });
    },
    onSuccess: () => toast.success("Now playing"),
    onError: (e) => toast.error(e.message)
  });
  const togglePauseMut = useMutation({
    mutationFn: async () => {
      if (!djState.track) return;
      const next = {
        ...djState,
        playing: !djState.playing,
        positionSec: djState.playing ? currentPositionSec(djState) : djState.positionSec,
        startedAtMs: djState.playing ? 0 : Date.now()
      };
      await saveSetting({
        data: {
          key: "dj_player",
          value: next
        }
      });
    },
    onSuccess: () => toast.success(djState.playing ? "Paused" : "Resumed"),
    onError: (e) => toast.error(e.message)
  });
  const stopMut = useMutation({
    mutationFn: async () => {
      const next = {
        ...djState,
        playing: false,
        track: null,
        positionSec: 0,
        startedAtMs: 0
      };
      await saveSetting({
        data: {
          key: "dj_player",
          value: next
        }
      });
    },
    onSuccess: () => toast.success("Stopped"),
    onError: (e) => toast.error(e.message)
  });
  const nowPlayingItem = (queue.data ?? []).find((q) => q.youtube_url === djState.track?.url);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    djState.enabled && djState.track && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-primary/40 bg-primary/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs uppercase tracking-wide text-primary flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block h-2 w-2 rounded-full ${djState.playing ? "bg-red-500 animate-pulse" : "bg-muted-foreground"}` }),
        djState.playing ? "Now playing" : "Paused"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-3", children: [
        nowPlayingItem?.thumbnail && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: nowPlayingItem.thumbnail, alt: "", className: "h-12 w-20 rounded object-cover" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: djState.track.title || nowPlayingItem?.title || djState.track.url }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: nowPlayingItem?.channel || djState.track.url })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: togglePauseMut.isPending, onClick: () => togglePauseMut.mutate(), className: "gap-1", children: djState.playing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4" }),
          " Pause"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
          " Resume"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", disabled: stopMut.isPending, onClick: () => stopMut.mutate(), className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4" }),
          " Stop"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "YouTube queue" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: widgetId, onValueChange: setWidgetId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose widget" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (widgets.data ?? []).map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w.id, children: w.name }, w.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Paste a YouTube URL", value: url, onChange: (e) => setUrl(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !widgetId || !url || addMut.isPending, onClick: () => addMut.mutate(), children: "Add" })
        ] }),
        widgetId && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
          if (confirm("Clear queue?")) clearMut.mutate();
        }, children: "Clear queue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Tip: click ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "inline h-3 w-3" }),
          " on a track to push it live to every listener via the DJ player."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StreamUrlCard, { streamUrl, setStreamUrl, streamName, setStreamName, onGoLive: (finalUrl) => playMut.mutate({
      youtube_url: finalUrl,
      title: streamName.trim() || null
    }), isPending: playMut.isPending }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      (queue.data ?? []).map((q) => {
        const isLoaded = djState.track?.url === q.youtube_url;
        const isCurrent = isLoaded && djState.playing;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 rounded-md border p-2 ${isLoaded ? "border-primary/50 bg-primary/5" : ""}`, children: [
          q.thumbnail && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: q.thumbnail, alt: "", className: "h-12 w-20 rounded object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-sm font-medium flex items-center gap-2", children: [
              isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" }),
              isLoaded && !isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(paused)" }),
              q.title || q.youtube_url
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: q.channel || q.youtube_id })
          ] }),
          isLoaded ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: togglePauseMut.isPending, onClick: () => togglePauseMut.mutate(), className: "gap-1", children: djState.playing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4" }),
            " Pause"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
            " Resume"
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: playMut.isPending, onClick: () => playMut.mutate({
            youtube_url: q.youtube_url,
            title: q.title
          }), className: "gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
            " Play"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeMut.mutate(q.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, q.id);
      }),
      widgetId && (queue.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Queue is empty." })
    ] })
  ] });
}
function StreamUrlCard({
  streamUrl,
  setStreamUrl,
  streamName,
  setStreamName,
  onGoLive,
  isPending
}) {
  const analysis = analyzeStreamUrl(streamUrl);
  const showFeedback = streamUrl.trim().length > 0;
  const toneClass = analysis.kind === "invalid" || analysis.kind === "player-page" ? "text-destructive" : analysis.wasNormalized ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-4 w-4" }),
      " Play radio stream URL"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Station name (optional, e.g. YoChat Radio)", value: streamName, maxLength: 120, onChange: (e) => setStreamName(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "https://radio.example.org/listen/yourstation/radio.mp3", value: streamUrl, maxLength: 2048, onChange: (e) => setStreamUrl(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !analysis.ok || isPending, onClick: () => onGoLive(analysis.normalizedUrl), className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
          " Go live"
        ] })
      ] }),
      showFeedback && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: toneClass, children: analysis.note }),
        analysis.wasNormalized && analysis.ok && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground break-all", children: [
          "Will play: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1 py-0.5", children: analysis.normalizedUrl })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pushes the stream live to every listener via the DJ player. Use Pause/Stop above to control it." })
    ] })
  ] });
}
export {
  QueuePage as component
};
