import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppSettings, b as useServerFn, aF as updateSetting, aJ as AdminPageHeader, ae as Card, af as CardContent, aG as AdminToggle } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { g as MessageSquare, o as Gamepad2, c4 as Wallet, I as Image, a as Sparkles, m as Award, ai as Smile, ak as Mic, x as Bell, f as Heart, F as Flame, s as UserPlus, bo as Laugh, c5 as Tag, O as Trophy, bA as PartyPopper, P as Palette, c6 as Camera, az as Film, a_ as ScrollText, c7 as Sparkle, Z as Zap, au as ShieldCheck, i as Radio } from "../_libs/lucide-react.mjs";
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
const MODULE_REGISTRY = [
  { key: "feed", label: "Social Feed", description: "Posts, comments and timeline.", icon: MessageSquare, group: "social" },
  { key: "games", label: "Games", description: "In-app mini games and competitions.", icon: Gamepad2, group: "engagement" },
  { key: "wallet", label: "Wallet", description: "Coins, balance and transactions.", icon: Wallet, group: "system" },
  { key: "gif", label: "GIF System", description: "GIF picker inside chat & feed.", icon: Image, group: "media" },
  { key: "ai", label: "AI Tools", description: "AI assistant & generators.", icon: Sparkles, group: "system" },
  { key: "badges", label: "Badges", description: "Achievements and profile badges.", icon: Award, group: "engagement" },
  { key: "emojis", label: "Emojis", description: "Custom emoji packs.", icon: Smile, group: "media" },
  { key: "voice", label: "Voice Rooms", description: "Realtime voice channels.", icon: Mic, group: "social" },
  { key: "notifications", label: "Notifications", description: "In-app and push notifications.", icon: Bell, group: "system" },
  { key: "reactions", label: "Reactions", description: "Quick reactions on posts & messages.", icon: Heart, group: "engagement" },
  { key: "streaks", label: "Streaks", description: "Daily login streaks.", icon: Flame, group: "engagement" },
  { key: "referrals", label: "Referrals", description: "Invite & reward system.", icon: UserPlus, group: "engagement" },
  { key: "competitionMemes", label: "Competition Memes", description: "Let users tag Feed memes with a competition.", icon: Laugh, group: "engagement" },
  { key: "nomineeMemeTagging", label: "Nominee Meme Tagging", description: "Show meme counts on nominee cards and allow supporting a nominee.", icon: Tag, group: "engagement" },
  { key: "trendingMemeSection", label: "Trending Meme Section", description: "Show the 😂 Trending Battle Memes carousel on competition pages.", icon: Trophy, group: "engagement" },
  { key: "funZone", label: "Fun Zone", description: "Master switch for the 🎉 Fun Zone hub on competition pages.", icon: PartyPopper, group: "engagement" },
  { key: "funZoneMemes", label: "Fun Zone · Memes", description: "Show the 😂 Memes card inside the Fun Zone.", icon: Laugh, group: "engagement" },
  { key: "funZoneFanArts", label: "Fun Zone · Fan Arts", description: "Show the 🎨 Fan Arts card inside the Fun Zone.", icon: Palette, group: "engagement" },
  { key: "funZonePosters", label: "Fun Zone · Posters", description: "Show the 📸 Campaign Posters card inside the Fun Zone.", icon: Camera, group: "engagement" },
  { key: "funZoneFanEdits", label: "Fun Zone · Fan Edits", description: "Show the 🎥 Fan Edits card inside the Fun Zone.", icon: Film, group: "engagement" },
  { key: "battleRecap", label: "Battle Recap", description: "Enable the premium recap page for completed competitions.", icon: ScrollText, group: "engagement" },
  { key: "autoAwards", label: "Auto Fun Zone Awards", description: "Auto-select Meme / Fan Art / Poster winner on competition finish.", icon: Sparkle, group: "engagement" },
  { key: "smartQualification", label: "Smart Auto Qualification", description: "Master switch for competition Smart / Hybrid auto-qualification.", icon: Zap, group: "engagement" },
  { key: "smartQualificationApproval", label: "Qualification Approval", description: "Route auto-qualified competitors through admin approval before appearing.", icon: ShieldCheck, group: "engagement" },
  { key: "smartQualificationLive", label: "Live Qualification Updates", description: "Update competitor list in realtime when engagement changes.", icon: Radio, group: "engagement" }
];
function ModulesPage() {
  const {
    modules,
    refresh
  } = useAppSettings();
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (next) => saveSetting({
      data: {
        key: "modules",
        value: next
      }
    }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
      toast.success("Updated");
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const toggle = (key, v) => mut.mutate({
    ...modules,
    [key]: v
  });
  const groups = {};
  for (const m of MODULE_REGISTRY) (groups[m.group] ||= []).push(m);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Modules", description: "Enable or disable features across the platform. Disabled modules are not loaded on the client." }),
    Object.entries(groups).map(([group, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: group }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "divide-y p-0", children: items.map((m) => {
        const Icon = m.icon;
        const on = modules[m.key];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-9 w-9 place-items-center rounded-md ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: m.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: m.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: on, onCheckedChange: (v) => toggle(m.key, v), disabled: mut.isPending })
        ] }, m.key);
      }) }) })
    ] }, group))
  ] });
}
export {
  ModulesPage as component
};
