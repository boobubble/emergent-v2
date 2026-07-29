import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, a4 as listCategories, b3 as adminSaveCompetition, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, ac as Label, a0 as Input, ad as Textarea, aM as Switch, aw as DialogFooter, B as Button } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
const emptyCompetition = () => ({
  name: "",
  slug: "",
  description: "",
  rules: "",
  banner_url: "",
  category_id: null,
  start_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
  end_at: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16),
  max_participants: null,
  winner_count: 1,
  status: "upcoming",
  layout_style: "auto",
  allow_vote_change: false,
  show_live_counts: true,
  require_approval: false,
  rewards: { coins: 0, xp: 0, badge: "", premium_days: 0, custom: "" },
  announce_channels: [],
  is_published: true,
  enable_voting: true,
  enable_reactions: true,
  enable_comments: true,
  enable_sharing: true,
  enable_join: true,
  hide_results_until_end: false,
  auto_close_voting: true,
  is_featured: false,
  is_pinned: false,
  allow_multiple_votes: false,
  max_votes_per_user: 1,
  allow_guest_voting: false,
  allow_anonymous_voting: false,
  entry_mode: "hybrid",
  qualification_method: "top_n_week",
  qualification_config: {},
  auto_approve: true
});
function CompetitionEditorDialog({ value, onChange, onSaved, invalidateKeys = [["competitions"]] }) {
  const cats = useServerFn(listCategories);
  const save = useServerFn(adminSaveCompetition);
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery({ queryKey: ["competition-categories"], queryFn: () => cats({}) });
  const saveM = useMutation({
    mutationFn: (v) => {
      const payload = { ...v };
      payload.start_at = new Date(payload.start_at).toISOString();
      payload.end_at = new Date(payload.end_at).toISOString();
      if (!payload.max_participants) payload.max_participants = null;
      return save({ data: payload });
    },
    onSuccess: (res, vars) => {
      toast.success("Saved");
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      const savedId = res?.id ?? vars?.id;
      const isNew = !vars?.id;
      onChange(null);
      if (savedId) onSaved?.({ id: savedId, isNew });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const editing = value;
  const set = (patch) => onChange({ ...editing, ...patch });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editing, onOpenChange: (o) => !o && onChange(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing?.id ? "Edit Competition" : "New Competition" }) }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.name, onChange: (e) => set({ name: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Slug" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.slug, onChange: (e) => set({ slug: e.target.value }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.category_id ?? "", onValueChange: (v) => set({ category_id: v || null }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose category" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: editing.description ?? "", onChange: (e) => set({ description: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rules" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: editing.rules ?? "", onChange: (e) => set({ rules: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Banner URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.banner_url ?? "", onChange: (e) => set({ banner_url: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: editing.start_at, onChange: (e) => set({ start_at: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: editing.end_at, onChange: (e) => set({ end_at: e.target.value }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Max Participants" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: editing.max_participants ?? "", onChange: (e) => set({ max_participants: e.target.value ? Number(e.target.value) : null }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Winners" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: editing.winner_count ?? 1, onChange: (e) => set({ winner_count: Number(e.target.value) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.status, onValueChange: (v) => set({ status: v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["draft", "upcoming", "live", "completed"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Competition Layout" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.layout_style ?? "auto", onValueChange: (v) => set({ layout_style: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "auto", children: "Auto (recommended)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vs_battle", children: "VS Battle (2 nominees)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "podium", children: "Podium (3 nominees)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "tournament", children: "Tournament Grid (4–8)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "leaderboard", children: "Live Leaderboard (9+)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[11px] text-muted-foreground", children: "Auto picks the best layout based on how many nominees you add." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: editing.allow_vote_change, onCheckedChange: (v) => set({ allow_vote_change: v }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Allow vote change" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: editing.show_live_counts, onCheckedChange: (v) => set({ show_live_counts: v }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Show live counts" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: editing.require_approval, onCheckedChange: (v) => set({ require_approval: v }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Require approval" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-semibold", children: "Published" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "When off, this competition is hidden from users." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: editing.is_published ?? true, onCheckedChange: (v) => set({ is_published: v }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm font-semibold", children: "Feature toggles" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3", children: [
          ["enable_voting", "Voting"],
          ["enable_reactions", "Reactions"],
          ["enable_comments", "Comments"],
          ["enable_sharing", "Sharing"],
          ["enable_join", "Join"],
          ["hide_results_until_end", "Hide results until end"],
          ["auto_close_voting", "Auto-close voting at end"],
          ["is_featured", "Featured"],
          ["is_pinned", "Pin to top"],
          ["allow_multiple_votes", "Allow multiple votes"],
          ["allow_guest_voting", "Guest voting"],
          ["allow_anonymous_voting", "Anonymous voting"]
        ].map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!editing[k], onCheckedChange: (v) => set({ [k]: v }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: label })
        ] }, k)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 max-w-[200px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Max votes per user" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 1,
              value: editing.max_votes_per_user ?? 1,
              onChange: (e) => set({ max_votes_per_user: Math.max(1, Number(e.target.value) || 1) })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Entry & Qualification" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Entry Mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.entry_mode ?? "hybrid", onValueChange: (v) => set({ entry_mode: v }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual", children: "Manual" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "smart", children: "Smart Automatic" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hybrid", children: "Hybrid" })
              ] })
            ] })
          ] }),
          editing.entry_mode !== "manual" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qualification Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.qualification_method ?? "", onValueChange: (v) => set({ qualification_method: v || null }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose method" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: "Fixed Threshold" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "top_n_week", children: "Top N This Week" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "top_n_month", children: "Top N This Month" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "top_percent", children: "Top % by Engagement" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approval", children: "Admin Approval" })
              ] })
            ] })
          ] })
        ] }),
        editing.entry_mode !== "manual" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Module" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: editing.qualification_config?.source?.module ?? "feed",
                  onValueChange: (v) => set({ qualification_config: { ...editing.qualification_config, source: { ...editing.qualification_config?.source ?? {}, module: v } } }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "feed", children: "Feed" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "poetry", children: "Poetry" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Category (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: editing.qualification_config?.source?.category ?? "any",
                  onValueChange: (v) => set({ qualification_config: { ...editing.qualification_config, source: { ...editing.qualification_config?.source ?? {}, category: v === "any" ? void 0 : v } } }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "any", children: "Any" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "meme", children: "Meme" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fan_art", children: "Fan Art" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "poster", children: "Poster" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fan_edit", children: "Fan Edit" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "voice", children: "Voice" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reel", children: "Reel" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "video", children: "Video" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "photo", children: "Photo" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "status", children: "Status" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "profile_picture", children: "Profile Picture" })
                    ] })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/5 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 text-xs font-semibold text-muted-foreground", children: [
              "Minimum engagement to qualify",
              editing.qualification_method === "fixed" || editing.qualification_method === "approval" ? " (required)" : " (optional — applied as gates on Top N / Top %)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[11px] text-muted-foreground/80", children: "Leave blank to skip. A post must meet ALL set thresholds to qualify." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: ["likes", "comments", "shares", "views", "reads", "bookmarks"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "capitalize text-xs", children: [
                "Min ",
                k
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 0,
                  placeholder: "0",
                  value: editing.qualification_config?.thresholds?.[k] ?? "",
                  onChange: (e) => set({ qualification_config: { ...editing.qualification_config, thresholds: { ...editing.qualification_config?.thresholds ?? {}, [k]: e.target.value ? Number(e.target.value) : void 0 } } })
                }
              )
            ] }, k)) })
          ] }),
          (editing.qualification_method === "top_n_week" || editing.qualification_method === "top_n_month") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[200px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Top N" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 1,
                value: editing.qualification_config?.top_n ?? 10,
                onChange: (e) => set({ qualification_config: { ...editing.qualification_config, top_n: Math.max(1, Number(e.target.value) || 10) } })
              }
            )
          ] }),
          editing.qualification_method === "top_percent" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[200px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Top % (1-100)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 1,
                max: 100,
                value: editing.qualification_config?.top_percent ?? 5,
                onChange: (e) => set({ qualification_config: { ...editing.qualification_config, top_percent: Math.min(100, Math.max(1, Number(e.target.value) || 5)) } })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/5 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-semibold text-muted-foreground", children: "Additional gates (AND)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: ["min_likes", "min_account_age_days", "min_followers", "min_content_age_hours"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: k.replace(/_/g, " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 0,
                  value: editing.qualification_config?.gates?.[k] ?? "",
                  onChange: (e) => set({ qualification_config: { ...editing.qualification_config, gates: { ...editing.qualification_config?.gates ?? {}, [k]: e.target.value ? Number(e.target.value) : void 0 } } })
                }
              )
            ] }, k)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: editing.auto_approve ?? true, onCheckedChange: (v) => set({ auto_approve: v }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Auto-approve qualified entries (off = require admin approval)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm font-semibold", children: "Rewards" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Coins" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: editing.rewards?.coins ?? 0, onChange: (e) => set({ rewards: { ...editing.rewards, coins: Number(e.target.value) } }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "XP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: editing.rewards?.xp ?? 0, onChange: (e) => set({ rewards: { ...editing.rewards, xp: Number(e.target.value) } }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Premium days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: editing.rewards?.premium_days ?? 0, onChange: (e) => set({ rewards: { ...editing.rewards, premium_days: Number(e.target.value) } }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Badge label" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.rewards?.badge ?? "", onChange: (e) => set({ rewards: { ...editing.rewards, badge: e.target.value } }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Custom reward" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.rewards?.custom ?? "", onChange: (e) => set({ rewards: { ...editing.rewards, custom: e.target.value } }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onChange(null), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveM.mutate(editing), disabled: saveM.isPending || !editing?.name || !editing?.slug, children: "Save" })
    ] })
  ] }) });
}
export {
  CompetitionEditorDialog as C,
  emptyCompetition as e
};
