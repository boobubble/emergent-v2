import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, ba as adminSaveCompetitor, bi as adminSearchProfiles, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, B as Button, ac as Label, a0 as Input, ad as Textarea, aM as Switch, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-gAgf0_IN.mjs";
import { bj as BadgeCheck, X, N as Search, a9 as User, z as Check } from "../_libs/lucide-react.mjs";
function emptyCompetitor(competitionId, sortOrder = 0) {
  return {
    competition_id: competitionId,
    name: "",
    photo_url: "",
    cover_image_url: "",
    description: "",
    linked_user_id: null,
    sort_order: sortOrder,
    country: "",
    website: "",
    social_links: {},
    is_featured: false,
    is_pinned: false
  };
}
function useDebounced(value, delay = 250) {
  const [v, setV] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
function CompetitorEditorDialog({
  value,
  onChange,
  invalidateKey
}) {
  const save = useServerFn(adminSaveCompetitor);
  const searchFn = useServerFn(adminSearchProfiles);
  const qc = useQueryClient();
  const [draft, setDraft] = reactExports.useState(value);
  const [query, setQuery] = reactExports.useState("");
  const debounced = useDebounced(query, 250);
  reactExports.useEffect(() => {
    setDraft(value);
    setQuery("");
  }, [value]);
  const { data: hits = [], isFetching } = useQuery({
    queryKey: ["admin-profile-search", debounced],
    enabled: debounced.trim().length >= 2 && !draft?.linked_user_id,
    queryFn: () => searchFn({ data: { query: debounced.trim(), limit: 8 } })
  });
  const m = useMutation({
    mutationFn: (d) => save({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: invalidateKey });
      onChange(null);
    },
    onError: (e) => {
      const msg = e instanceof Error ? e.message : "Failed to save";
      toast.error(msg);
    }
  });
  const socials = reactExports.useMemo(
    () => ({
      twitter: draft?.social_links?.twitter ?? "",
      instagram: draft?.social_links?.instagram ?? "",
      tiktok: draft?.social_links?.tiktok ?? "",
      youtube: draft?.social_links?.youtube ?? ""
    }),
    [draft]
  );
  if (!draft) return null;
  const setSocial = (key, val) => {
    setDraft({
      ...draft,
      social_links: { ...draft.social_links ?? {}, [key]: val.trim() || null }
    });
  };
  const applyLinkedUser = (p) => {
    setDraft({
      ...draft,
      linked_user_id: p.id,
      name: p.display_name || p.username || draft.name,
      photo_url: p.avatar_url ?? draft.photo_url ?? "",
      linked_profile: p
    });
  };
  const clearLinkedUser = () => setDraft({ ...draft, linked_user_id: null, linked_profile: null });
  const canSave = !!draft.linked_user_id && !m.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!draft, onOpenChange: (o) => !o && onChange(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] max-w-2xl overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: draft.id ? "Edit nominee" : "Add nominee" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-3", children: [
      draft.linked_user_id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-10 w-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: draft.linked_profile?.avatar_url ?? draft.photo_url ?? void 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: draft.linked_profile?.avatar_color ?? void 0 }, children: (draft.name || "?").slice(0, 1).toUpperCase() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 truncate text-sm font-semibold", children: [
            draft.linked_profile?.display_name ?? draft.name,
            draft.linked_profile?.verified ? /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3.5 w-3.5 text-sky-400" }) : null
          ] }),
          draft.linked_profile?.username && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-xs text-muted-foreground", children: [
            "@",
            draft.linked_profile.username
          ] })
        ] }),
        !draft.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: clearLinkedUser, "aria-label": "Unlink", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Search registered members" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "pl-9",
              placeholder: "Search by name or @username",
              value: query,
              onChange: (e) => setQuery(e.target.value),
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-background/50", children: debounced.trim().length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-3 text-xs text-muted-foreground", children: "Type at least 2 characters…" }) : isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-3 text-xs text-muted-foreground", children: "Searching…" }) : hits.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-3 text-xs text-muted-foreground", children: "No members found." }) : hits.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => applyLinkedUser(p),
            className: "flex w-full items-center gap-3 border-b border-white/5 p-2 text-left transition hover:bg-white/5 last:border-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-9 w-9", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: p.avatar_url ?? void 0 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: p.avatar_color ?? void 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 truncate text-sm font-medium", children: [
                  p.display_name ?? p.username ?? "Member",
                  p.verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3.5 w-3.5 text-sky-400" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-xs text-muted-foreground", children: [
                  "@",
                  p.username ?? "user"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" })
            ]
          },
          p.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Competition bio (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            rows: 3,
            placeholder: "Why they're competing…",
            value: draft.description ?? "",
            onChange: (e) => setDraft({ ...draft, description: e.target.value })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Competition overrides" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Country (ISO)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. IN, US, PK",
              maxLength: 3,
              value: draft.country ?? "",
              onChange: (e) => setDraft({ ...draft, country: e.target.value.toUpperCase() })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Website" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "https://…", value: draft.website ?? "", onChange: (e) => setDraft({ ...draft, website: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Instagram URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: socials.instagram ?? "", onChange: (e) => setSocial("instagram", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Twitter / X URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: socials.twitter ?? "", onChange: (e) => setSocial("twitter", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TikTok URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: socials.tiktok ?? "", onChange: (e) => setSocial("tiktok", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "YouTube URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: socials.youtube ?? "", onChange: (e) => setSocial("youtube", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Display order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              value: draft.sort_order ?? 0,
              onChange: (e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Featured" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: !!draft.is_featured,
            onCheckedChange: (v) => setDraft({ ...draft, is_featured: v })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pinned" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: !!draft.is_pinned,
            onCheckedChange: (v) => setDraft({ ...draft, is_pinned: v })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onChange(null), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          disabled: !canSave,
          onClick: () => {
            const payload = {
              ...draft,
              name: draft.name.trim(),
              photo_url: draft.photo_url?.trim() || null,
              cover_image_url: draft.cover_image_url?.trim() || null,
              description: draft.description?.trim() || null
            };
            const { linked_profile: _lp, ...rest } = payload;
            m.mutate(rest);
          },
          children: m.isPending ? "Saving…" : "Save nominee"
        }
      )
    ] })
  ] }) });
}
export {
  CompetitorEditorDialog as C,
  emptyCompetitor as e
};
