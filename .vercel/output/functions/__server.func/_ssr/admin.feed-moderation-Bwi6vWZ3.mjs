import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { aJ as AdminPageHeader, b as useServerFn, bj as listModerationQueue, bk as setContentModerationStatus, bl as warnUser, bm as banPosting, bn as scanContentImages, bo as scanContentText, ae as Card, ag as CardHeader, ah as CardTitle, B as Button, bp as CONTENT_TYPES, af as CardContent, bq as listPostingBans, br as restorePosting, bs as listModerationLogs, bt as getModerationSettings, ac as Label, aG as AdminToggle, a0 as Input } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { S as Skeleton } from "./skeleton-CsqSgU8F.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { E as Eye, e as EyeOff, d as Trash2, a as Sparkles, aZ as FileText, aS as ShieldAlert, R as RotateCcw, a_ as ScrollText } from "../_libs/lucide-react.mjs";
import { o as objectType, a as arrayType, s as stringType, b as booleanType, n as numberType, e as enumType } from "../_libs/zod.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
createServerFn({
  method: "GET"
}).handler(createSsrRpc("248f849df4c3d04439d35b4ddf1cdd07b9bba1352e2a29885b1215ccc6f95f68"));
const updateFeedModerationSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  enabled: booleanType().optional(),
  auto_hide_report_threshold: numberType().int().min(1).max(1e3).optional(),
  auto_hide_ai_threshold: numberType().min(0).max(1).optional(),
  duplicate_window_minutes: numberType().int().min(0).max(1440).optional(),
  max_posts_per_hour: numberType().int().min(1).max(500).optional(),
  max_comments_per_minute: numberType().int().min(1).max(200).optional(),
  ai_image_moderation_enabled: booleanType().optional(),
  ai_moderation_categories: arrayType(stringType()).optional()
}).parse(raw)).handler(createSsrRpc("0261bc80b0a2f1c160f5b63ac0c1f66bb1fd5f5598fefadc0149531607a3c8be"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((raw) => objectType({
  target_type: enumType(["post", "comment"]),
  target_id: stringType().min(1).max(200),
  reason: stringType().min(1).max(200),
  details: stringType().max(2e3).optional()
}).parse(raw)).handler(createSsrRpc("3caecbfa6f50c5adf739c43ad9b5081c0fd36848d7de51035aaa20b9275ce695"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  status: enumType(["pending_review", "hidden", "removed", "visible", "all"]).default("pending_review"),
  kind: enumType(["post", "comment", "all"]).default("all"),
  limit: numberType().int().min(1).max(200).default(50)
}).parse(raw ?? {})).handler(createSsrRpc("cec00d7120fa5ed28fc0eab31bec45ba65a47b2ecf5a1f9ee98f6b2817ff8495"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  target_type: enumType(["post", "comment"]),
  target_id: stringType().uuid(),
  status: enumType(["visible", "pending_review", "hidden", "removed"]),
  reason: stringType().max(500).optional()
}).parse(raw)).handler(createSsrRpc("b47e9f78647e19555411c5d63f3a26ebdc3bc09690bc793f4441ef0f710574d2"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().min(1).max(500),
  severity: enumType(["notice", "warning", "final_warning"]).default("warning"),
  target_type: enumType(["post", "comment"]).optional(),
  target_id: stringType().optional()
}).parse(raw)).handler(createSsrRpc("246a24223a2271e0141064446adc04fcf35af7e4fd1ae62f801b65d88fd1400e"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("7a84a1341d56e0f7879e523778af4740cfdea2cc24e696a6e9bec6b94166103c"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  id: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("777edff60046b3ac54850d08d4d5c82aa6c636334fa1f3525592ed8203cb5620"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().max(500).optional(),
  duration_hours: numberType().int().min(1).max(24 * 365).optional()
}).parse(raw)).handler(createSsrRpc("5abc54688d8062b099ae81206add8a847103db3a305faab4b8a24df8f8ae630c"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("defa6110596eced07887b9c70507327d97ab81a6c1f06e2b23ca96aafcbd300c"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("172b73de3b53195253ac8d9e3870c854a2b4839dace6eb714f3dc40c95a5a20b"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9ca93ed940bcc03f573c35a49348237467afcfb637dbc574ebb57effc7eba4c8"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  limit: numberType().int().min(1).max(200).default(100)
}).parse(raw ?? {})).handler(createSsrRpc("a19a8f526a0f09943ce31d3facccc97774dd2ed98f033d3b6c9a566289488c36"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  post_id: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("4984e2915977ae47faf1219a02cd99dacf3ad4f86b1c26736453b40fa31ef939"));
const ALL_TYPES = ["all", ...CONTENT_TYPES];
function ModerationEnginePage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Moderation Engine", description: "One unified pipeline protecting Feed, Poetry, Memes, Images, Videos, Comments, and Competition submissions." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "queue", className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "queue", children: "Queue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "bans", children: "Posting Bans" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "logs", children: "Logs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "settings", children: "Settings" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "queue", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QueueTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "bans", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BansTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "logs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, {}) })
    ] })
  ] });
}
function QueueTab() {
  const qc = useQueryClient();
  const [status, setStatus] = reactExports.useState("pending_review");
  const [type, setType] = reactExports.useState("all");
  const fetchQueue = useServerFn(listModerationQueue);
  const setStatusFn = useServerFn(setContentModerationStatus);
  const warnFn = useServerFn(warnUser);
  const banFn = useServerFn(banPosting);
  const scanImgFn = useServerFn(scanContentImages);
  const scanTextFn = useServerFn(scanContentText);
  const q = useQuery({
    queryKey: ["mod-engine-queue", status, type],
    queryFn: () => fetchQueue({
      data: {
        status,
        content_type: type,
        limit: 100
      }
    }),
    refetchInterval: 3e4
  });
  async function act(ct, id, newStatus) {
    try {
      await setStatusFn({
        data: {
          content_type: ct,
          content_id: id,
          status: newStatus
        }
      });
      toast.success(`Marked ${newStatus}`);
      qc.invalidateQueries({
        queryKey: ["mod-engine-queue"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }
  async function warn(userId) {
    const reason = window.prompt("Warning reason:");
    if (!reason) return;
    try {
      await warnFn({
        data: {
          user_id: userId,
          reason,
          severity: "warning",
          scope: "all"
        }
      });
      toast.success("Warning sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }
  async function ban(userId) {
    const hoursStr = window.prompt("Ban duration in hours (leave empty for permanent):");
    if (hoursStr === null) return;
    const duration_hours = hoursStr.trim() ? Number(hoursStr) : void 0;
    const reason = window.prompt("Ban reason:") ?? void 0;
    try {
      await banFn({
        data: {
          user_id: userId,
          reason,
          duration_hours,
          scope: "all"
        }
      });
      toast.success("Posting ban applied");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }
  async function scanImg(ct, id) {
    try {
      const r = await scanImgFn({
        data: {
          content_type: ct,
          content_id: id
        }
      });
      toast.success(`Image scan: ${"worst" in r ? r.worst.toFixed(2) : "skipped"}`);
      qc.invalidateQueries({
        queryKey: ["mod-engine-queue"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }
  async function scanTxt(ct, id) {
    try {
      const r = await scanTextFn({
        data: {
          content_type: ct,
          content_id: id
        }
      });
      toast.success(`Text scan: ${"worst" in r ? r.worst.toFixed(2) : "skipped"}`);
      qc.invalidateQueries({
        queryKey: ["mod-engine-queue"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Unified Queue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: ["pending_review", "hidden", "removed", "all"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: status === s ? "default" : "outline", onClick: () => setStatus(s), children: s.replace("_", " ") }, s)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: ALL_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: type === t ? "default" : "outline", onClick: () => setType(t), children: t }, t)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
      q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }),
      (q.data ?? []).map((row) => {
        const prev = row.preview;
        const text = prev?.text ?? prev?.body ?? "";
        const media = (prev?.media_urls ?? []).filter((u) => typeof u === "string");
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-card p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex flex-wrap items-center gap-1.5 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: row.content_type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: row.status }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
                row.report_count,
                " reports"
              ] }),
              row.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                "· ",
                row.reason
              ] })
            ] }),
            text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm", children: text.slice(0, 400) }),
            media.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex gap-2 overflow-x-auto", children: media.slice(0, 4).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: u, alt: "", className: "h-20 w-20 rounded object-cover", loading: "lazy" }, u)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[10px] text-muted-foreground", children: [
              "id ",
              String(row.content_id).slice(0, 8),
              " · owner ",
              row.owner_id ? String(row.owner_id).slice(0, 8) : "?",
              " · updated ",
              new Date(row.updated_at).toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => act(row.content_type, row.content_id, "visible"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "mr-1 h-3 w-3" }),
              "Restore"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => act(row.content_type, row.content_id, "hidden"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "mr-1 h-3 w-3" }),
              "Hide"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "destructive", onClick: () => act(row.content_type, row.content_id, "removed"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-1 h-3 w-3" }),
              "Remove"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => scanImg(row.content_type, row.content_id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mr-1 h-3 w-3" }),
              "AI Image"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => scanTxt(row.content_type, row.content_id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-1 h-3 w-3" }),
              "AI Text"
            ] }),
            row.owner_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => warn(row.owner_id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mr-1 h-3 w-3" }),
                "Warn"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", onClick: () => ban(row.owner_id), children: "Ban" })
            ] })
          ] })
        ] }) }, row.id);
      }),
      q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nothing in this state." })
    ] })
  ] });
}
function BansTab() {
  const qc = useQueryClient();
  const fetchBans = useServerFn(listPostingBans);
  const restoreFn = useServerFn(restorePosting);
  const q = useQuery({
    queryKey: ["mod-engine-bans"],
    queryFn: () => fetchBans({})
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Posting Bans" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
      q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }),
      (q.data ?? []).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border bg-card p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: b.active ? "destructive" : "outline", children: b.active ? "Active" : "Ended" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: b.scope ?? "all" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: String(b.user_id).slice(0, 8) }),
            b.expires_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "until ",
              new Date(b.expires_at).toLocaleString()
            ] }),
            !b.expires_at && b.active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive", children: "permanent" })
          ] }),
          b.reason && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: b.reason })
        ] }),
        b.active && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: async () => {
          try {
            await restoreFn({
              data: {
                user_id: b.user_id
              }
            });
            toast.success("Restored");
            qc.invalidateQueries({
              queryKey: ["mod-engine-bans"]
            });
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed");
          }
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-1 h-3 w-3" }),
          "Restore"
        ] })
      ] }, b.id)),
      q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No bans." })
    ] })
  ] });
}
function LogsTab() {
  const [type, setType] = reactExports.useState("all");
  const fetchLogs = useServerFn(listModerationLogs);
  const q = useQuery({
    queryKey: ["mod-engine-logs", type],
    queryFn: () => fetchLogs({
      data: {
        limit: 200,
        content_type: type
      }
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollText, { className: "h-4 w-4" }),
        "Moderation Logs"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: ALL_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: type === t ? "default" : "outline", onClick: () => setType(t), children: t }, t)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1 text-xs font-mono", children: [
      q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }),
      (q.data ?? []).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 border-b py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: new Date(l.created_at).toLocaleString() }),
        l.content_type && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: l.content_type }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: l.action_taken }),
        l.content_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "c=",
          String(l.content_id).slice(0, 12)
        ] }),
        l.target_user_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "user=",
          String(l.target_user_id).slice(0, 12)
        ] }),
        l.moderator_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "mod=",
          String(l.moderator_id).slice(0, 12)
        ] }),
        l.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          '"',
          l.reason,
          '"'
        ] })
      ] }, l.id)),
      q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No logs yet." })
    ] })
  ] });
}
function SettingsTab() {
  const qc = useQueryClient();
  const fetchSettings = useServerFn(getModerationSettings);
  const updateFn = useServerFn(updateFeedModerationSettings);
  const q = useQuery({
    queryKey: ["mod-engine-settings"],
    queryFn: () => fetchSettings({})
  });
  const s = q.data;
  const [form, setForm] = reactExports.useState({});
  if (q.isLoading || !s) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" });
  const cur = {
    ...s,
    ...form
  };
  const save = async () => {
    try {
      await updateFn({
        data: form
      });
      toast.success("Settings saved");
      setForm({});
      qc.invalidateQueries({
        queryKey: ["mod-engine-settings"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Engine Settings" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "These settings apply to every content type protected by the engine (Feed, Poetry, Memes, Images, Videos, Comments, Competition submissions)." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable Moderation Engine", description: "Master switch.", checked: !!cur.enabled, onCheckedChange: (v) => setForm((f) => ({
        ...f,
        enabled: v
      })) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "AI Image Moderation", description: "Nudity, violence, gore, child safety, drugs, weapons.", checked: !!cur.ai_image_moderation_enabled, onCheckedChange: (v) => setForm((f) => ({
        ...f,
        ai_image_moderation_enabled: v
      })) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "AI Text Moderation", description: "Hate speech, harassment, self-harm, unsafe text.", checked: !!cur.ai_text_moderation_enabled, onCheckedChange: (v) => setForm((f) => ({
        ...f,
        ai_text_moderation_enabled: v
      })) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Auto-hide report threshold", value: cur.auto_hide_report_threshold, onChange: (v) => setForm((f) => ({
          ...f,
          auto_hide_report_threshold: v
        })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "AI auto-hide score (0-1)", value: cur.auto_hide_ai_threshold, step: 0.05, onChange: (v) => setForm((f) => ({
          ...f,
          auto_hide_ai_threshold: v
        })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Duplicate window (minutes)", value: cur.duplicate_window_minutes, onChange: (v) => setForm((f) => ({
          ...f,
          duplicate_window_minutes: v
        })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Max posts per hour", value: cur.max_posts_per_hour, onChange: (v) => setForm((f) => ({
          ...f,
          max_posts_per_hour: v
        })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Max comments per minute", value: cur.max_comments_per_minute, onChange: (v) => setForm((f) => ({
          ...f,
          max_comments_per_minute: v
        })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "AI moderation categories" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex flex-wrap gap-1", children: cur.ai_moderation_categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: c }, c)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: Object.keys(form).length === 0, children: "Save changes" }) })
    ] })
  ] });
}
function NumberField({
  label,
  value,
  onChange,
  step = 1
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step, value: value ?? 0, onChange: (e) => onChange(Number(e.target.value)), className: "mt-1" })
  ] });
}
function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 rounded-lg border bg-card p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: label }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked, onCheckedChange })
  ] });
}
export {
  ModerationEnginePage as component
};
