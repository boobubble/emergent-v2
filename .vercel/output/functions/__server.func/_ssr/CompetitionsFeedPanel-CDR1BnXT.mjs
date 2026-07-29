import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, b2 as adminListAllCompetitions, aJ as AdminPageHeader, B as Button, ae as Card, af as CardContent, aG as AdminToggle } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { l as listChatroomsForFeedbot } from "./feedbot.functions-DszEzFwO.mjs";
import { C as COMPETITION_CATEGORY_KEYS, a as CATEGORY_LABELS } from "./feedbot-format-CFiGnWo6.mjs";
import { bj as BadgeCheck, O as Trophy, i as Radio } from "../_libs/lucide-react.mjs";
import { o as objectType, a as arrayType, s as stringType, r as recordType, b as booleanType, e as enumType } from "../_libs/zod.mjs";
const getCompetitionsFeedSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).handler(createSsrRpc("88342257376f0bad971fe12066a808e5d14c179f6f2f2f69540825670df10aa7"));
const SaveInput = objectType({
  event_flags: recordType(stringType(), booleanType()).optional(),
  target_chatrooms: arrayType(stringType().uuid()).optional()
});
const saveCompetitionsFeedSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((raw) => SaveInput.parse(raw)).handler(createSsrRpc("fb70aaa06794d903b902289664b0c93252ce39afe7c9a51dcab43ab503f05c71"));
const provisionCompetitionsBot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).handler(createSsrRpc("57154cc66bcfa087fa788685c54618bcd30d08ff18960b011d44011e5b02a0fe"));
const AnnounceInput = objectType({
  competitionId: stringType().uuid(),
  kind: enumType(["competition_trending", "competition_ending"])
});
const announceCompetitionEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((raw) => AnnounceInput.parse(raw)).handler(createSsrRpc("70140443c168486d477f4b90140fe743a1e1a220ff5235928d72bcd874e1ef89"));
function CompetitionsFeedPanel() {
  const qc = useQueryClient();
  const get = useServerFn(getCompetitionsFeedSettings);
  const save = useServerFn(saveCompetitionsFeedSettings);
  const provision = useServerFn(provisionCompetitionsBot);
  const listRooms = useServerFn(listChatroomsForFeedbot);
  const listComps = useServerFn(adminListAllCompetitions);
  const announce = useServerFn(announceCompetitionEvent);
  const settingsQ = useQuery({ queryKey: ["competitions-feed-settings"], queryFn: () => get() });
  const roomsQ = useQuery({ queryKey: ["feedbot-rooms"], queryFn: () => listRooms() });
  const compsQ = useQuery({ queryKey: ["competitions", "admin"], queryFn: () => listComps({}) });
  const [state, setState] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (settingsQ.data) setState(settingsQ.data);
  }, [settingsQ.data]);
  const saveM = useMutation({
    mutationFn: (patch) => save({ data: { event_flags: patch.event_flags, target_chatrooms: patch.target_chatrooms } }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["competitions-feed-settings"] });
    },
    onError: (e) => toast.error(e.message)
  });
  const provisionM = useMutation({
    mutationFn: () => provision({}),
    onSuccess: (r) => {
      toast.success(r.existed ? "CompetitionsBot linked" : "CompetitionsBot created");
      qc.invalidateQueries({ queryKey: ["competitions-feed-settings"] });
    },
    onError: (e) => toast.error(e.message)
  });
  const announceM = useMutation({
    mutationFn: (v) => announce({ data: v }),
    onSuccess: () => toast.success("Queued — will post within a minute"),
    onError: (e) => toast.error(e.message)
  });
  if (!state) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: "Loading…" });
  const toggleFlag = (key, val) => {
    const next = { ...state, event_flags: { ...state.event_flags, [key]: val } };
    setState(next);
    saveM.mutate({ event_flags: next.event_flags });
  };
  const toggleRoom = (id, on) => {
    const set = new Set(state.target_chatrooms);
    if (on) set.add(id);
    else set.delete(id);
    const next = { ...state, target_chatrooms: Array.from(set) };
    setState(next);
    saveM.mutate({ target_chatrooms: next.target_chatrooms });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AdminPageHeader,
      {
        title: "Competitions Feed",
        description: "Auto-post competition lifecycle events to chatrooms via a dedicated CompetitionsBot.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => provisionM.mutate(), disabled: provisionM.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-4 w-4" }),
          state.competitions_bot_user_id ? "Re-sync CompetitionsBot" : "Provision CompetitionsBot"
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }),
        " Bot identity"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "CompetitionsBot ID:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: state.competitions_bot_user_id ?? "not provisioned" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Master FeedBot pipeline (rate-limit, dispatcher, cooldowns) is reused — this bot just owns competition-related posts." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-sm font-semibold", children: "Event toggles" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: COMPETITION_CATEGORY_KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-2 rounded border border-border/60 p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: CATEGORY_LABELS[k] ?? k }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: !!state.event_flags[k], onCheckedChange: (v) => toggleFlag(k, v) })
      ] }, k)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-sm font-semibold", children: "Target chatrooms" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs text-muted-foreground", children: "Shared with FeedBot targets — competition posts land in the same rooms you already selected on the FeedBot page." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: (roomsQ.data ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-2 rounded border border-border/60 p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: state.target_chatrooms.includes(r.id), onCheckedChange: (v) => toggleRoom(r.id, v) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-4 w-4" }),
        " Manual announcements"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: 'Broadcast "Trending" or "Ending soon" for a specific competition. Rate-limited to once per hour per competition per category via dedupe keys.' }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: (compsQ.data ?? []).filter((c) => c.status !== "completed").slice(0, 25).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded border border-border/60 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => announceM.mutate({ competitionId: c.id, kind: "competition_trending" }), children: "🔥 Trending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => announceM.mutate({ competitionId: c.id, kind: "competition_ending" }), children: "⏳ Ending soon" })
      ] }, c.id)) })
    ] }) })
  ] });
}
export {
  CompetitionsFeedPanel as C
};
