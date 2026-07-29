import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, aJ as AdminPageHeader, ac as Label, a0 as Input, B as Button, ad as Textarea, aM as Switch } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as SettingsCard, T as ToggleRow, N as NumberField } from "./SettingsSection-DpMwxV3D.mjs";
import { listAIChatbots, createAIChatbot, updateAIChatbot, deleteAIChatbot, getAIChatSettings, saveAIChatSettings } from "./ai-chatbots.functions-Bjx8FIhN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { c as Plus, v as Bot, d as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
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
function AIChatbotsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAIChatbots);
  const createFn = useServerFn(createAIChatbot);
  const updateFn = useServerFn(updateAIChatbot);
  const deleteFn = useServerFn(deleteAIChatbot);
  const getSettings = useServerFn(getAIChatSettings);
  const saveSettings = useServerFn(saveAIChatSettings);
  const {
    data: list
  } = useQuery({
    queryKey: ["ai-chatbots"],
    queryFn: () => listFn({})
  });
  const {
    data: settings
  } = useQuery({
    queryKey: ["ai-chatbots-settings"],
    queryFn: () => getSettings({})
  });
  const [cfg, setCfg] = reactExports.useState({
    enabled: false,
    openrouter_api_key: "",
    model: "openrouter/auto"
  });
  reactExports.useEffect(() => {
    if (settings) setCfg(settings);
  }, [settings]);
  const saveCfg = useMutation({
    mutationFn: () => saveSettings({
      data: cfg
    }),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({
        queryKey: ["ai-chatbots-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const [form, setForm] = reactExports.useState({
    username: "",
    description: "",
    persona: "",
    rooms: "lobby",
    reply_chance: 0.6,
    cooldown_sec: 20
  });
  const createMut = useMutation({
    mutationFn: () => createFn({
      data: {
        username: form.username.trim(),
        description: form.description,
        persona: form.persona,
        allowed_rooms: form.rooms.split(",").map((r) => r.trim()).filter(Boolean),
        reply_chance: form.reply_chance,
        cooldown_sec: form.cooldown_sec
      }
    }),
    onSuccess: () => {
      toast.success("Bot created");
      setForm({
        username: "",
        description: "",
        persona: "",
        rooms: "lobby",
        reply_chance: 0.6,
        cooldown_sec: 20
      });
      qc.invalidateQueries({
        queryKey: ["ai-chatbots"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const delMut = useMutation({
    mutationFn: (id) => deleteFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({
        queryKey: ["ai-chatbots"]
      });
    }
  });
  const updMut = useMutation({
    mutationFn: ({
      id,
      patch
    }) => updateFn({
      data: {
        id,
        patch
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["ai-chatbots"]
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "AI Chat Bots", description: "Assign existing users as AI-powered bots that reply in chatrooms using OpenRouter." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Provider settings", description: "OpenRouter provides access to many AI models. Get a key at openrouter.ai/keys.", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable AI Chat Bots", desc: "Master switch. When off, no AI replies are generated.", value: cfg.enabled, onChange: (v) => setCfg({
        ...cfg,
        enabled: v
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "OpenRouter API key" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", placeholder: "sk-or-...", value: cfg.openrouter_api_key, onChange: (e) => setCfg({
          ...cfg,
          openrouter_api_key: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Model ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "openrouter/auto", value: cfg.model, onChange: (e) => setCfg({
          ...cfg,
          model: e.target.value
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
          "e.g. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "openai/gpt-4o-mini" }),
          ", ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "google/gemini-2.0-flash-001" }),
          ", ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "anthropic/claude-3.5-haiku" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveCfg.mutate(), disabled: saveCfg.isPending, children: saveCfg.isPending ? "Saving…" : "Update" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Add a chat bot", description: "Enter the username of an existing user to convert them into an AI bot.", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Username" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.username, onChange: (e) => setForm({
            ...form,
            username: e.target.value
          }), placeholder: "aria" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Rooms (comma-separated channel IDs)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.rooms, onChange: (e) => setForm({
            ...form,
            rooms: e.target.value
          }), placeholder: "lobby, games" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.description, onChange: (e) => setForm({
          ...form,
          description: e.target.value
        }), placeholder: "Helpful community greeter" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Persona / system prompt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.persona, onChange: (e) => setForm({
          ...form,
          persona: e.target.value
        }), placeholder: "You are a friendly community member. Keep replies short, casual, and human." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Reply chance (0–1)", value: form.reply_chance, onChange: (v) => setForm({
          ...form,
          reply_chance: Math.max(0, Math.min(1, Number(v)))
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Cooldown (sec)", value: form.cooldown_sec, onChange: (v) => setForm({
          ...form,
          cooldown_sec: Math.max(0, Math.floor(Number(v)))
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => createMut.mutate(), disabled: createMut.isPending || !form.username.trim(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-1" }),
        " ",
        createMut.isPending ? "Creating…" : "Create"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Existing bots", description: `${list?.bots?.length ?? 0} configured`, children: list?.bots?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: list.bots.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-3 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "size-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium truncate", children: [
              "@",
              b.profile?.username ?? b.user_id.slice(0, 8)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: b.description || "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: b.enabled, onCheckedChange: (v) => updMut.mutate({
              id: b.id,
              patch: {
                enabled: v
              }
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: b.enabled ? "On" : "Off" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
            if (confirm("Remove this bot?")) delMut.mutate(b.id);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] text-muted-foreground", children: "Rooms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { defaultValue: (b.allowed_rooms ?? []).join(", "), onBlur: (e) => {
            const rooms = e.target.value.split(",").map((r) => r.trim()).filter(Boolean);
            updMut.mutate({
              id: b.id,
              patch: {
                allowed_rooms: rooms
              }
            });
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] text-muted-foreground", children: "Reply chance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: 0, max: 1, defaultValue: b.reply_chance, onBlur: (e) => updMut.mutate({
            id: b.id,
            patch: {
              reply_chance: Math.max(0, Math.min(1, Number(e.target.value)))
            }
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] text-muted-foreground", children: "Cooldown (sec)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, defaultValue: b.cooldown_sec, onBlur: (e) => updMut.mutate({
            id: b.id,
            patch: {
              cooldown_sec: Math.max(0, Math.floor(Number(e.target.value)))
            }
          }) })
        ] })
      ] })
    ] }, b.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No bots configured yet." }) })
  ] });
}
export {
  AIChatbotsPage as component
};
