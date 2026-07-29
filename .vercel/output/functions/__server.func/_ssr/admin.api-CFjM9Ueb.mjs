import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { aJ as AdminPageHeader, b as useServerFn, ae as Card, ag as CardHeader, ah as CardTitle, B as Button, af as CardContent, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, ac as Label, a0 as Input, aw as DialogFooter, aM as Switch } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { C as Checkbox } from "./checkbox-Dkz64jvR.mjs";
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
import { b6 as KeyRound, bP as Webhook, c as Plus, d as Trash2, by as Copy, aj as Send, bd as RefreshCw } from "../_libs/lucide-react.mjs";
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
import "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-checkbox.mjs";
const listApiKeys = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(createSsrRpc("dee789de6065d63c67f8ff2db3be3eaa7a2f980f2cea7a84c0f3c82b6f37893d"));
const createApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createSsrRpc("f9eb70435824945d9ec1a72b8875c2a5b47a29d1008f4b084ba2330b7c394d44"));
const revokeApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createSsrRpc("c51331d8664ee9a1b99eccabd850522a922888a9a04337e7aa9a1384fc92b1e6"));
const deleteApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createSsrRpc("8cbdb6d7a736e93cce4ff31a9e919e7f506aad2cfa65c318263e93178744d958"));
const WEBHOOK_EVENTS = ["user.created", "post.created", "comment.created", "message.created", "confession.created", "report.created"];
const listWebhooks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(createSsrRpc("a0ab0a5b5b79eebeb91f6d0a6175ebcb7407243ced1144cd91bc38956264e9b3"));
const createWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createSsrRpc("fc2b1a748d338abb64f21c551a45e8dbcdf590f8f968f3b3f32715ef8ae22e33"));
const updateWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createSsrRpc("f7de6d8e9da976fdc2b72f697da43f50e538ef7e8ca8e73ba2f36e197b33c6ea"));
const deleteWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createSsrRpc("49df20710ad565cf42f7a116945977c25e13c0e4792cd58c6a836da350b6a5ba"));
const rotateWebhookSecret = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createSsrRpc("7940784e868707665f83d64093656b192cd4da361b9c17e33387b0f3a47bc6c0"));
const testWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createSsrRpc("f3d228f71174d2627a413c5bde8c1df6a81b573be644681bf92372e066b8057f"));
const listDeliveries = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createSsrRpc("c5de9c0a853d8bf4f45a9fa48ef0231bfaad52960f65f2485027c597cc602bf3"));
function copy(text, label = "Copied") {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
}
function ApiPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "API & Webhooks", description: "Outbound webhooks and API keys. Super admin only." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "keys", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "keys", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "mr-2 h-4 w-4" }),
          "API keys"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "hooks", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Webhook, { className: "mr-2 h-4 w-4" }),
          "Webhooks"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "keys", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApiKeysPanel, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hooks", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WebhooksPanel, {}) })
    ] })
  ] });
}
function ApiKeysPanel() {
  const list = useServerFn(listApiKeys);
  const create = useServerFn(createApiKey);
  const revoke = useServerFn(revokeApiKey);
  const del = useServerFn(deleteApiKey);
  const qc = useQueryClient();
  const {
    data = [],
    isLoading
  } = useQuery({
    queryKey: ["api_keys"],
    queryFn: () => list()
  });
  const [open, setOpen] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [newKey, setNewKey] = reactExports.useState(null);
  const createMut = useMutation({
    mutationFn: () => create({
      data: {
        name
      }
    }),
    onSuccess: (res) => {
      setNewKey(res.key);
      setName("");
      qc.invalidateQueries({
        queryKey: ["api_keys"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const revokeMut = useMutation({
    mutationFn: (id) => revoke({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Revoked");
      qc.invalidateQueries({
        queryKey: ["api_keys"]
      });
    }
  });
  const delMut = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["api_keys"]
      });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "API keys" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setNewKey(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        "New key"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No API keys yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: data.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: k.name }),
          k.revoked_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "revoked" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-xs text-muted-foreground", children: [
          k.key_prefix,
          "…"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Created ",
          new Date(k.created_at).toLocaleDateString(),
          k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`
        ] })
      ] }),
      !k.revoked_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => revokeMut.mutate(k.id), children: "Revoke" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => delMut.mutate(k.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, k.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: newKey ? "API key created" : "New API key" }) }),
      newKey ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Copy now — you won't see it again." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 truncate font-mono text-xs", children: newKey }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => copy(newKey), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Mobile app" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: newKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setOpen(false), children: "Done" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(), disabled: !name.trim() || createMut.isPending, children: "Create" }) })
    ] }) })
  ] });
}
function WebhooksPanel() {
  const list = useServerFn(listWebhooks);
  const create = useServerFn(createWebhook);
  const update = useServerFn(updateWebhook);
  const del = useServerFn(deleteWebhook);
  const rotate = useServerFn(rotateWebhookSecret);
  const test = useServerFn(testWebhook);
  const qc = useQueryClient();
  const {
    data = [],
    isLoading
  } = useQuery({
    queryKey: ["webhooks"],
    queryFn: () => list()
  });
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    name: "",
    url: "",
    events: []
  });
  const [createdSecret, setCreatedSecret] = reactExports.useState(null);
  const refresh = () => qc.invalidateQueries({
    queryKey: ["webhooks"]
  });
  const createMut = useMutation({
    mutationFn: () => create({
      data: form
    }),
    onSuccess: (r) => {
      setCreatedSecret(r.secret);
      setForm({
        name: "",
        url: "",
        events: []
      });
      refresh();
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Outbound webhooks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setCreatedSecret(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        "New webhook"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No webhooks configured." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: data.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookRow, { w, onToggle: (active) => update({
      data: {
        id: w.id,
        active
      }
    }).then(refresh), onDelete: () => del({
      data: {
        id: w.id
      }
    }).then(() => {
      toast.success("Deleted");
      refresh();
    }), onRotate: async () => {
      const r = await rotate({
        data: {
          id: w.id
        }
      });
      copy(r.secret, "New secret copied");
    }, onTest: async () => {
      const r = await test({
        data: {
          id: w.id
        }
      });
      toast[r.ok ? "success" : "error"](r.ok ? `Delivered (${r.status})` : `Failed: ${r.error ?? r.status}`);
      refresh();
    } }, w.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: createdSecret ? "Webhook created" : "New webhook" }) }),
      createdSecret ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Signing secret — copy now. Each delivery sends headers ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "x-webhook-timestamp" }),
          ", ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "x-webhook-id" }),
          ", and ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "x-webhook-signature: t=<ts>,v1=<hex>" }),
          " where the signature is",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { children: [
            "HMAC-SHA256(secret, `$",
            "{ts}",
            ".$",
            "{id}",
            ".$",
            "{body}",
            "`)"
          ] }),
          ". Reject deliveries older than 5 minutes and dedupe by ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "x-webhook-id" }),
          " to prevent replay."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 truncate font-mono text-xs", children: createdSecret }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => copy(createdSecret), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({
            ...form,
            name: e.target.value
          }), placeholder: "Zapier — new posts" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.url, onChange: (e) => setForm({
            ...form,
            url: e.target.value
          }), placeholder: "https://example.com/hook" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Events" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid grid-cols-2 gap-2", children: WEBHOOK_EVENTS.map((ev) => {
            const checked = form.events.includes(ev);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 rounded-md border border-border p-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked, onCheckedChange: (v) => {
                setForm({
                  ...form,
                  events: v ? [...form.events, ev] : form.events.filter((e) => e !== ev)
                });
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: ev })
            ] }, ev);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: createdSecret ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setOpen(false), children: "Done" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(), disabled: !form.name.trim() || !form.url.trim() || createMut.isPending, children: "Create" }) })
    ] }) })
  ] });
}
function WebhookRow({
  w,
  onToggle,
  onDelete,
  onRotate,
  onTest
}) {
  const listDel = useServerFn(listDeliveries);
  const [deliveries, setDeliveries] = reactExports.useState([]);
  const [showLog, setShowLog] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (showLog) listDel({
      data: {
        endpoint_id: w.id
      }
    }).then(setDeliveries);
  }, [showLog, w.id, listDel]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: w.name }),
          w.last_status != null && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: w.last_status >= 200 && w.last_status < 300 ? "default" : "destructive", children: w.last_status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-mono text-xs text-muted-foreground", children: w.url }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex flex-wrap gap-1", children: (w.events ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: e }, e)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!w.active, onCheckedChange: onToggle }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: onTest, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "mr-1 h-3.5 w-3.5" }),
          "Test"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: onRotate, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-1 h-3.5 w-3.5" }),
          "Rotate"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: onDelete, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "mt-2 text-xs text-primary hover:underline", onClick: () => setShowLog((s) => !s), children: [
      showLog ? "Hide" : "Show",
      " recent deliveries"
    ] }),
    showLog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1 text-xs", children: deliveries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "No deliveries yet." }) : deliveries.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded border border-border/60 px-2 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: d.event }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: d.ok ? "text-emerald-500" : "text-red-500", children: [
        d.status_code ?? "—",
        " · ",
        new Date(d.created_at).toLocaleString()
      ] })
    ] }, d.id)) })
  ] });
}
export {
  ApiPage as component
};
