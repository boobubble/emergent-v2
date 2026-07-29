import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { aJ as AdminPageHeader, ae as Card, af as CardContent, aK as useAdminSetting, ac as Label, a0 as Input, B as Button, aY as listGames, aM as Switch } from "./router-CYWPFaDK.mjs";
import { f as flattenAdminNav } from "./AdminNav-DaKVrF66.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a6 as ChevronRight, o as Gamepad2, c as Plus, bF as Hash, d as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__react-query.mjs";
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
function slugify(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "channel";
  return `adm-${base}-${Math.random().toString(36).slice(2, 6)}`;
}
const GAME_OPTIONS = listGames();
const DEFAULT_GAME_CFG = {
  type: GAME_OPTIONS[0]?.key ?? "",
  difficulty: "normal",
  spectators: true,
  coinReward: 10,
  xpReward: 20
};
function ChannelsManager() {
  const {
    values,
    patch,
    save,
    saving
  } = useAdminSetting("chat_channels", {
    list: []
  });
  const [name, setName] = reactExports.useState("");
  const [topic, setTopic] = reactExports.useState("");
  const [kind, setKind] = reactExports.useState("chat");
  const [game, setGame] = reactExports.useState(DEFAULT_GAME_CFG);
  const channels = values.list ?? [];
  function persist(next) {
    patch({
      list: next
    });
    setTimeout(() => save(), 0);
  }
  function addChannel() {
    const n = name.trim();
    if (!n) return;
    if (channels.some((c) => c.name.toLowerCase() === n.toLowerCase())) return;
    const entry = {
      id: slugify(n),
      name: n,
      topic: topic.trim() || void 0,
      kind,
      game: kind === "game" ? game : void 0
    };
    persist([...channels, entry]);
    setName("");
    setTopic("");
    setKind("chat");
    setGame(DEFAULT_GAME_CFG);
  }
  function removeChannel(id) {
    if (!confirm("Remove this channel for all users?")) return;
    persist(channels.filter((c) => c.id !== id));
  }
  const setG = (k, v) => setGame((prev) => ({
    ...prev,
    [k]: v
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Channels" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border border-border bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ch-name", children: "Channel name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "ch-name", placeholder: "e.g. Music", value: name, onChange: (e) => setName(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ch-topic", children: "Topic (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "ch-topic", placeholder: "What's this channel about?", value: topic, onChange: (e) => setTopic(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Room type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kind, onValueChange: (v) => setKind(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "chat", children: "Chat Room" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "game", children: "Game Room" })
            ] })
          ] })
        ] }),
        kind === "game" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Game" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: game.type, onValueChange: (v) => setG("type", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: GAME_OPTIONS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g.key, children: g.label }, g.key)) })
          ] })
        ] })
      ] }),
      kind === "game" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-background/40 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "h-3.5 w-3.5" }),
          " Game Room settings"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 md:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Difficulty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: game.difficulty ?? "normal", onValueChange: (v) => setG("difficulty", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "easy", children: "Easy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "normal", children: "Normal" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hard", children: "Hard" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Entry fee (coins)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: game.entryFeeCoins ?? 0, onChange: (e) => setG("entryFeeCoins", Number(e.target.value) || 0) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Coin reward" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: game.coinReward ?? 0, onChange: (e) => setG("coinReward", Number(e.target.value) || 0) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "XP reward" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: game.xpReward ?? 0, onChange: (e) => setG("xpReward", Number(e.target.value) || 0) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Daily Challenge", checked: !!game.dailyChallenge, onChange: (v) => setG("dailyChallenge", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Tournament", checked: !!game.tournament, onChange: (v) => setG("tournament", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Spectators", checked: !!game.spectators, onChange: (v) => setG("spectators", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Featured", checked: !!game.featured, onChange: (v) => setG("featured", v) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addChannel, disabled: !name.trim() || saving, className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add channel"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border", children: channels.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No custom channels yet. Seeded rooms (Lobby, Games) always exist." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: channels.map((c) => {
        const isGame = c.kind === "game";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 px-4 py-3", children: [
          isGame ? /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 truncate text-sm font-semibold", children: [
              c.name,
              isGame && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "h-5 px-1.5 text-[10px] uppercase", children: c.game?.type ?? "game" }),
              c.game?.featured && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "h-5 bg-amber-400/20 px-1.5 text-[10px] text-amber-300", children: "Featured" })
            ] }),
            c.topic && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: c.topic })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeChannel(c.id), className: "text-muted-foreground hover:bg-destructive/10 hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, c.id);
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Changes apply to all users. Removed channels disappear on their next chat load." })
    ] })
  ] });
}
function ToggleRow({
  label,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked, onCheckedChange: onChange })
  ] });
}
function ChatroomsHub() {
  const items = flattenAdminNav().filter((i) => ["/admin/moderation", "/admin/bots", "/admin/filters"].includes(i.to));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Chatrooms", description: "Manage channels and chatroom-only settings. Feed, games and economy live in their own sections." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelsManager, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Chatroom settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: items.map((i) => {
        const Icon = i.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: i.to, className: "group", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "h-full transition-colors hover:border-primary/40 hover:bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-start gap-3 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary", children: Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: i.label }),
              i.badge && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "h-5 px-1.5 text-[10px]", children: i.badge })
            ] }),
            i.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: i.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" })
        ] }) }) }, i.to);
      }) })
    ] })
  ] });
}
export {
  ChatroomsHub as component
};
