import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, bb as getCompetition, bc as adminSetParticipantStatus, bd as adminListCompetitorVotes, be as adminDeleteCompetitorVote, bf as adminResetCompetitionVotes, bg as getCompetitionAnalytics, bh as adminSetManualWinners, b5 as adminFinalizeWinners, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, ae as Card, af as CardContent, B as Button, a0 as Input, b7 as adminReorderCompetitors, b8 as adminDeleteCompetitor, b9 as adminSetCompetitorFlags, ba as adminSaveCompetitor } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { f as useSensors, h as useSensor, j as KeyboardSensor, P as PointerSensor, D as DndContext, i as closestCenter } from "../_libs/dnd-kit__core.mjs";
import { s as sortableKeyboardCoordinates, S as SortableContext, v as verticalListSortingStrategy, a as arrayMove, u as useSortable } from "../_libs/dnd-kit__sortable.mjs";
import { C as CSS } from "../_libs/dnd-kit__utilities.mjs";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-gAgf0_IN.mjs";
import { flagFromCode } from "./country-flag-Bsg6nfgK.mjs";
import { e as emptyCompetitor, C as CompetitorEditorDialog } from "./CompetitorEditorDialog-BG_3zT5L.mjs";
import { E as Eye, U as Users, O as Trophy, V as Vote, aB as Crown, c as Plus, R as RotateCcw, d as Trash2, aI as Download, G as GripVertical, a as Sparkles, bv as Pin, e as EyeOff, b_ as Undo2, av as Ban, b$ as Pencil } from "../_libs/lucide-react.mjs";
function AdminCompetitorSortableGrid({ competitionId: _competitionId, competitors, onEdit, invalidateKey }) {
  const [items, setItems] = reactExports.useState(competitors);
  reactExports.useEffect(() => setItems(competitors), [competitors]);
  const reorder = useServerFn(adminReorderCompetitors);
  const del = useServerFn(adminDeleteCompetitor);
  const setFlags = useServerFn(adminSetCompetitorFlags);
  const save = useServerFn(adminSaveCompetitor);
  const qc = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = reactExports.useMemo(() => items.map((i) => i.id), [items]);
  const reorderM = useMutation({
    mutationFn: (orders) => reorder({ data: { orders } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Reorder failed")
  });
  const delM = useMutation({
    mutationFn: (id) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: invalidateKey });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed")
  });
  const flagsM = useMutation({
    mutationFn: (v) => setFlags({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed")
  });
  const toggleM = useMutation({
    mutationFn: (v) => save({
      data: {
        id: v.c.id,
        competition_id: v.c.competition_id,
        name: v.c.name,
        photo_url: v.c.photo_url ?? null,
        cover_image_url: v.c.cover_image_url ?? null,
        description: v.c.description ?? null,
        linked_user_id: v.c.linked_user_id ?? null,
        country: v.c.country ?? null,
        website: v.c.website ?? null,
        social_links: v.c.social_links ?? {},
        is_featured: v.field === "is_featured" ? !v.c.is_featured : v.c.is_featured,
        is_pinned: v.field === "is_pinned" ? !v.c.is_pinned : v.c.is_pinned
      }
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed")
  });
  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorderM.mutate(next.map((c, idx) => ({ id: c.id, sort_order: idx })));
  };
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No nominees yet. Add the first one above." });
  }
  const rankMap = reactExports.useMemo(() => {
    const eligible = items.filter((c) => !c.is_hidden && !c.is_disqualified).sort((a, b) => b.vote_count - a.vote_count);
    const map = /* @__PURE__ */ new Map();
    eligible.forEach((c, i) => map.set(c.id, i + 1));
    return map;
  }, [items]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SortableContext, { items: ids, strategy: verticalListSortingStrategy, children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: items.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    SortableRow,
    {
      c,
      rank: rankMap.get(c.id) ?? null,
      onEdit: () => onEdit(c),
      onDelete: () => confirm(`Remove ${c.name}?`) && delM.mutate(c.id),
      onToggleHidden: () => flagsM.mutate({ id: c.id, is_hidden: !c.is_hidden }),
      onToggleDisqualified: () => flagsM.mutate({ id: c.id, is_disqualified: !c.is_disqualified }),
      onToggleFeatured: () => toggleM.mutate({ c, field: "is_featured" }),
      onTogglePinned: () => toggleM.mutate({ c, field: "is_pinned" })
    },
    c.id
  )) }) }) });
}
function SortableRow({
  c,
  rank,
  onEdit,
  onDelete,
  onToggleHidden,
  onToggleDisqualified,
  onToggleFeatured,
  onTogglePinned
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };
  const flag = flagFromCode(c.country);
  const rankTone = rank === 1 ? "border-amber-400/50 bg-amber-400/15 text-amber-300" : rank === 2 ? "border-slate-300/40 bg-slate-300/15 text-slate-200" : rank === 3 ? "border-orange-400/40 bg-orange-400/15 text-orange-300" : "border-white/10 bg-white/5 text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "li",
    {
      ref: setNodeRef,
      style,
      className: `flex items-center gap-3 rounded-xl border border-white/10 bg-background/60 p-2 pr-3 backdrop-blur ${c.is_hidden ? "opacity-60" : ""} ${c.is_disqualified ? "border-rose-500/30" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            ...attributes,
            ...listeners,
            "aria-label": "Drag to reorder",
            className: "grid h-9 w-6 shrink-0 cursor-grab place-items-center text-muted-foreground hover:text-foreground active:cursor-grabbing",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-4 w-4" })
          }
        ),
        rank !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${rankTone}`, children: [
          "#",
          rank
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-10 w-10 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: c.photo_url ?? c.linked_profile?.avatar_url ?? void 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: c.linked_profile?.avatar_color ?? void 0 }, children: c.name.slice(0, 1).toUpperCase() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
            flag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", "aria-label": c.country ?? "", children: flag }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-medium", children: c.name }),
            c.linked_profile?.username && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate text-xs text-muted-foreground", children: [
              "@",
              c.linked_profile.username
            ] }),
            c.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "border border-amber-500/40 bg-amber-500/15 text-[10px] text-amber-300", children: "Featured" }),
            c.is_pinned && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "border border-sky-500/40 bg-sky-500/15 text-[10px] text-sky-300", children: "Pinned" }),
            c.is_hidden && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: "Hidden" }),
            c.is_disqualified && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-[10px]", children: "Disqualified" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            c.vote_count.toLocaleString(),
            " votes"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              onClick: onToggleFeatured,
              "aria-label": c.is_featured ? "Unfeature" : "Feature",
              title: c.is_featured ? "Unfeature" : "Feature",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: `h-4 w-4 ${c.is_featured ? "text-amber-400" : ""}` })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              onClick: onTogglePinned,
              "aria-label": c.is_pinned ? "Unpin" : "Pin",
              title: c.is_pinned ? "Unpin" : "Pin",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: `h-4 w-4 ${c.is_pinned ? "text-sky-400" : ""}` })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: onToggleHidden, "aria-label": c.is_hidden ? "Show" : "Hide", title: c.is_hidden ? "Show" : "Hide", children: c.is_hidden ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              onClick: onToggleDisqualified,
              "aria-label": c.is_disqualified ? "Restore" : "Disqualify",
              title: c.is_disqualified ? "Restore" : "Disqualify",
              children: c.is_disqualified ? /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4 text-rose-400" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: onEdit, "aria-label": "Edit", title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: onDelete, "aria-label": "Delete", title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-rose-400" }) })
        ] })
      ]
    }
  );
}
function downloadCSV(filename, rows) {
  if (rows.length === 0) {
    toast.error("Nothing to export");
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v === null || v === void 0 ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function AdminCompetitionManageDialog({
  competitionId,
  onClose
}) {
  const qc = useQueryClient();
  const getComp = useServerFn(getCompetition);
  const setStatus = useServerFn(adminSetParticipantStatus);
  const listVotes = useServerFn(adminListCompetitorVotes);
  const delVote = useServerFn(adminDeleteCompetitorVote);
  const resetAll = useServerFn(adminResetCompetitionVotes);
  const getAnalytics = useServerFn(getCompetitionAnalytics);
  const setWinners = useServerFn(adminSetManualWinners);
  const finalize = useServerFn(adminFinalizeWinners);
  const [voteFilter, setVoteFilter] = reactExports.useState("");
  const [nomineeDraft, setNomineeDraft] = reactExports.useState(null);
  const { data: manage } = useQuery({
    queryKey: ["competition-manage", competitionId],
    queryFn: () => competitionId ? getComp({ data: { id: competitionId } }) : Promise.resolve(null),
    enabled: !!competitionId
  });
  const { data: votes = [] } = useQuery({
    queryKey: ["competition-votes", competitionId],
    queryFn: () => competitionId ? listVotes({ data: { competitionId } }) : Promise.resolve([]),
    enabled: !!competitionId
  });
  const { data: analytics } = useQuery({
    queryKey: ["competition-analytics", competitionId],
    queryFn: () => competitionId ? getAnalytics({ data: { competitionId } }) : Promise.resolve(null),
    enabled: !!competitionId
  });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["competition-manage", competitionId] });
    qc.invalidateQueries({ queryKey: ["competition-votes", competitionId] });
    qc.invalidateQueries({ queryKey: ["competition-analytics", competitionId] });
    qc.invalidateQueries({ queryKey: ["competitions"] });
  };
  const statusM = useMutation({
    mutationFn: (v) => setStatus({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      invalidate();
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const delVoteM = useMutation({
    mutationFn: (voteId) => delVote({ data: { voteId } }),
    onSuccess: () => {
      toast.success("Vote removed");
      invalidate();
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const resetM = useMutation({
    mutationFn: () => resetAll({ data: { competitionId } }),
    onSuccess: () => {
      toast.success("All votes reset");
      invalidate();
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const finalizeM = useMutation({
    mutationFn: () => finalize({ data: { competitionId } }),
    onSuccess: () => {
      toast.success("Winners announced");
      invalidate();
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const winnersM = useMutation({
    mutationFn: (winners) => setWinners({ data: { competitionId, winners, markCompleted: true } }),
    onSuccess: () => {
      toast.success("Winners saved");
      invalidate();
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const comp = manage?.competition;
  const competitors = manage?.competitors ?? [];
  const participants = manage?.participants ?? [];
  const awards = manage?.awards ?? [];
  const filteredVotes = reactExports.useMemo(() => {
    const q = voteFilter.trim().toLowerCase();
    if (!q) return votes;
    return votes.filter(
      (v) => (v.voter?.username ?? v.voter_id ?? "").toLowerCase().includes(q) || (v.competitor?.name ?? "").toLowerCase().includes(q)
    );
  }, [votes, voteFilter]);
  const [manualWinners, setManualWinners] = reactExports.useState({});
  const setPlace = (place, competitorId) => setManualWinners((p) => ({ ...p, [place]: competitorId }));
  const submitManual = () => {
    const entries = Object.entries(manualWinners).map(([place, cid]) => {
      const cc = competitors.find((c) => c.id === cid);
      const userId = cc?.linked_user_id;
      if (!userId) return null;
      return { place: Number(place), user_id: userId, badge_label: `${comp?.name} — #${place}` };
    }).filter(Boolean);
    if (entries.length === 0) {
      toast.error("Pick competitors linked to a user");
      return;
    }
    winnersM.mutate(entries);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: !!competitionId, onOpenChange: (o) => !o && onClose(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] max-w-4xl overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Manage — ",
        comp?.name
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "analytics", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "analytics", children: "Analytics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "nominees", children: [
            "Nominees (",
            competitors.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "participants", children: "Participants" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "votes", children: [
            "Votes (",
            votes.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "winners", children: "Winners" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "export", children: "Export" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "analytics", className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
            { label: "Views", value: analytics?.total_views ?? 0, icon: Eye },
            { label: "Participants", value: analytics?.total_participants ?? 0, icon: Users },
            { label: "Competitors", value: analytics?.total_competitors ?? 0, icon: Trophy },
            { label: "Votes", value: analytics?.total_votes ?? 0, icon: Vote },
            { label: "Unique voters", value: analytics?.unique_voters ?? 0, icon: Users },
            {
              label: "Conversion",
              value: analytics && analytics.total_views ? `${Math.round(analytics.unique_voters / analytics.total_views * 100)}%` : "—",
              icon: Vote
            }
          ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: s.value })
            ] })
          ] }) }, s.label)) }),
          analytics?.leading_competitor_name && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5 text-amber-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Leading competitor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
                analytics.leading_competitor_name,
                " · ",
                analytics.leading_competitor_votes ?? 0,
                " votes"
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "nominees", className: "mt-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Drag rows to reorder. Featured/pinned nominees surface on the detail page." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                onClick: () => competitionId && setNomineeDraft(emptyCompetitor(competitionId, competitors.length)),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
                  " Add nominee"
                ]
              }
            )
          ] }),
          competitionId && /* @__PURE__ */ jsxRuntimeExports.jsx(
            AdminCompetitorSortableGrid,
            {
              competitionId,
              competitors,
              onEdit: (c) => setNomineeDraft({ ...c }),
              invalidateKey: ["competition-manage", competitionId]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "participants", className: "mt-4 space-y-2", children: [
          participants.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No participants yet." }),
          participants.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 truncate", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: p.profile?.username ?? p.user_id }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                p.vote_count,
                " votes · ",
                p.status
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: p.status, onValueChange: (v) => statusM.mutate({ participantId: p.id, status: v }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["pending", "approved", "removed", "disqualified"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
            ] })
          ] }, p.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "votes", className: "mt-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search voter or competitor…",
                value: voteFilter,
                onChange: (e) => setVoteFilter(e.target.value),
                className: "max-w-sm"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "destructive",
                onClick: () => confirm("Reset ALL votes on this competition?") && resetM.mutate(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-1 h-4 w-4" }),
                  " Reset all votes"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1fr_auto_auto] gap-2 border-b bg-white/5 p-2 text-xs font-semibold text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Voter" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Competitor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "When" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {})
            ] }),
            filteredVotes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-sm text-muted-foreground", children: "No votes match." }),
            filteredVotes.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2 border-b p-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate", children: v.voter?.username ?? v.voter_id.slice(0, 8) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate", children: v.competitor?.name ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: new Date(v.created_at).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  onClick: () => confirm("Remove this vote?") && delVoteM.mutate(v.id),
                  "aria-label": "Delete vote",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-rose-400" })
                }
              )
            ] }, v.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "winners", className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm font-semibold", children: "Automatic (top by participant votes)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "secondary", onClick: () => finalizeM.mutate(), disabled: finalizeM.isPending, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "mr-1 h-4 w-4" }),
              " Finalize automatically"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm font-semibold", children: "Manual winners" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Pick a competitor for each place. Only competitors linked to a user account can be awarded." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3].slice(0, comp?.winner_count ?? 1).map((place) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "w-14 justify-center", children: [
                "#",
                place
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: manualWinners[place] ?? "",
                  onValueChange: (v) => setPlace(place, v),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose competitor" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: competitors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, disabled: !c.linked_user_id, children: [
                      c.name,
                      c.linked_user_id ? "" : " (no linked user)"
                    ] }, c.id)) })
                  ]
                }
              )
            ] }, place)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: submitManual, disabled: winnersM.isPending, children: "Save winners & mark completed" }) })
          ] }),
          awards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm font-semibold", children: "Current winners" }),
            awards.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { children: [
                "#",
                a.place
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: a.profile?.username ?? a.user_id.slice(0, 8) }),
              a.badge_label && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "· ",
                a.badge_label
              ] })
            ] }, a.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "export", className: "mt-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Download CSV files. Open in Excel or Google Sheets." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                onClick: () => downloadCSV(
                  `${comp?.slug}-competitors.csv`,
                  competitors.map((c) => ({
                    id: c.id,
                    name: c.name,
                    votes: c.vote_count,
                    hidden: c.is_hidden ? "yes" : "no",
                    disqualified: c.is_disqualified ? "yes" : "no",
                    linked_user: c.linked_profile?.username ?? ""
                  }))
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-1 h-4 w-4" }),
                  " Competitors CSV"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                onClick: () => downloadCSV(
                  `${comp?.slug}-votes.csv`,
                  votes.map((v) => ({
                    id: v.id,
                    voter: v.voter?.username ?? v.voter_id,
                    competitor: v.competitor?.name ?? v.competitor_id,
                    at: v.created_at
                  }))
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-1 h-4 w-4" }),
                  " Votes CSV"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                onClick: () => downloadCSV(
                  `${comp?.slug}-participants.csv`,
                  participants.map((p) => ({
                    id: p.id,
                    user: p.profile?.username ?? p.user_id,
                    status: p.status,
                    votes: p.vote_count,
                    joined_at: p.joined_at
                  }))
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-1 h-4 w-4" }),
                  " Participants CSV"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                onClick: () => downloadCSV(
                  `${comp?.slug}-winners.csv`,
                  awards.map((a) => ({
                    place: a.place,
                    user: a.profile?.username ?? a.user_id,
                    badge: a.badge_label ?? "",
                    awarded_at: a.awarded_at
                  }))
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-1 h-4 w-4" }),
                  " Winners CSV"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CompetitorEditorDialog,
      {
        value: nomineeDraft,
        onChange: setNomineeDraft,
        invalidateKey: ["competition-manage", competitionId ?? ""]
      }
    )
  ] });
}
export {
  AdminCompetitionManageDialog as A
};
