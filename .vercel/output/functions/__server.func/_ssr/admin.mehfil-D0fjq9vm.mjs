import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aJ as AdminPageHeader, b as useServerFn } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as adminListMehfilPoems, b as adminUpdatePoem, c as adminDeletePoem, d as adminListMehfilCategories, e as adminSaveMehfilCategory, f as adminDeleteMehfilCategory, g as getMehfilSettings, h as adminSaveMehfilSettings } from "./mehfil-admin.functions-BntRjkJU.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { l as Star, e as EyeOff, E as Eye, d as Trash2, c as Plus, b as Save } from "../_libs/lucide-react.mjs";
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
const TABS = ["Poetry", "Categories", "Settings"];
function MehfilAdmin() {
  const [tab, setTab] = reactExports.useState("Poetry");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Poetry Hub", description: "Poetry community — moderate poems, manage categories, configure Poetry Hub settings." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 mb-6 flex gap-1 rounded-xl border border-border/60 bg-card p-1 w-fit", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: `px-4 py-1.5 rounded-lg text-sm font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`, children: t }, t)) }),
    tab === "Poetry" && /* @__PURE__ */ jsxRuntimeExports.jsx(PoemsTab, {}),
    tab === "Categories" && /* @__PURE__ */ jsxRuntimeExports.jsx(CategoriesTab, {}),
    tab === "Settings" && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, {})
  ] });
}
function PoemsTab() {
  const fetchPoems = useServerFn(adminListMehfilPoems);
  const update = useServerFn(adminUpdatePoem);
  const del = useServerFn(adminDeletePoem);
  const qc = useQueryClient();
  const [status, setStatus] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const q = useQuery({
    queryKey: ["admin", "mehfil", "poems", status, search],
    queryFn: () => fetchPoems({
      data: {
        status: status || void 0,
        search: search || void 0
      }
    })
  });
  const inval = () => qc.invalidateQueries({
    queryKey: ["admin", "mehfil", "poems"]
  });
  const m = useMutation({
    mutationFn: (v) => update({
      data: v
    }),
    onSuccess: () => {
      toast.success("Updated");
      inval();
    }
  });
  const d = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Deleted");
      inval();
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search title…", className: "flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "rounded-lg border border-border bg-background px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All statuses" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "published", children: "Published" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "draft", children: "Draft" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "Pending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "archived", children: "Archived" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-card overflow-hidden", children: [
      (q.data ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 border-b border-border/40 last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: p.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
            p.status,
            " · ",
            p.upvote_count,
            " upvotes · ",
            p.read_count,
            " reads · ",
            p.slug
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => m.mutate({
          id: p.id,
          patch: {
            is_editors_pick: !p.is_editors_pick
          }
        }), className: `p-2 rounded-md hover:bg-muted ${p.is_editors_pick ? "text-amber-500" : ""}`, title: "Toggle Editor's Pick", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => m.mutate({
          id: p.id,
          patch: {
            status: p.status === "published" ? "archived" : "published"
          }
        }), className: "p-2 rounded-md hover:bg-muted", title: "Toggle publish", children: p.status === "published" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          if (confirm("Delete this poem?")) d.mutate(p.id);
        }, className: "p-2 rounded-md text-destructive hover:bg-destructive/10", title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }, p.id)),
      q.data && q.data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-sm text-muted-foreground", children: "No poems match." })
    ] })
  ] });
}
function CategoriesTab() {
  const list = useServerFn(adminListMehfilCategories);
  const save = useServerFn(adminSaveMehfilCategory);
  const del = useServerFn(adminDeleteMehfilCategory);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "mehfil", "cats"],
    queryFn: () => list()
  });
  const inval = () => qc.invalidateQueries({
    queryKey: ["admin", "mehfil", "cats"]
  });
  const s = useMutation({
    mutationFn: (v) => save({
      data: v
    }),
    onSuccess: () => {
      toast.success("Saved");
      inval();
    }
  });
  const d = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Deleted");
      inval();
    }
  });
  const [draft, setDraft] = reactExports.useState({
    name: "",
    slug: "",
    color: "#8b5cf6",
    is_active: true,
    sort_order: 0
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr_320px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border/60 bg-card overflow-hidden", children: (q.data ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 border-b border-border/40 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-4 w-4 rounded-full", style: {
        background: c.color ?? "#8b5cf6"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
          "/",
          c.slug,
          " · ",
          c.is_active ? "active" : "hidden"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDraft(c), className: "text-xs font-semibold text-primary", children: "Edit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        if (confirm("Delete category?")) d.mutate(c.id);
      }, className: "p-2 rounded-md text-destructive hover:bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "rounded-xl border border-border/60 bg-card p-4 space-y-3 h-fit", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " ",
        draft.id ? "Edit" : "New",
        " category"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: draft.name ?? "", onChange: (e) => setDraft({
        ...draft,
        name: e.target.value
      }), placeholder: "Name", className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: draft.slug ?? "", onChange: (e) => setDraft({
        ...draft,
        slug: e.target.value
      }), placeholder: "slug", className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: draft.description ?? "", onChange: (e) => setDraft({
        ...draft,
        description: e.target.value
      }), placeholder: "Description", className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: draft.color ?? "#8b5cf6", onChange: (e) => setDraft({
          ...draft,
          color: e.target.value
        }), className: "h-9 w-14 rounded border border-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: draft.sort_order ?? 0, onChange: (e) => setDraft({
          ...draft,
          sort_order: Number(e.target.value)
        }), placeholder: "Order", className: "flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: draft.is_active ?? true, onChange: (e) => setDraft({
          ...draft,
          is_active: e.target.checked
        }) }),
        " Active"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 mt-3 border-t border-border/40 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Default Minimum Engagement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Applied to all Hybrid/Smart Poetry Battles in this category. Battle-level settings override these." })
        ] }),
        (() => {
          const cfg = draft.default_qualification_config ?? {};
          const th = cfg.thresholds ?? {};
          const setTh = (k, v) => {
            const nextTh = {
              ...th
            };
            if (v > 0) nextTh[k] = v;
            else delete nextTh[k];
            setDraft({
              ...draft,
              default_qualification_config: {
                ...cfg,
                thresholds: nextTh
              }
            });
          };
          const fields = [["min_upvotes", "Min upvotes"], ["min_comments", "Min comments"], ["min_shares", "Min shares"], ["min_views", "Min views"], ["min_reads", "Min reads"], ["min_bookmarks", "Min bookmarks"]];
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: fields.map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[11px] text-muted-foreground", children: [
            label,
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, value: th[k] ?? 0, onChange: (e) => setTh(k, Number(e.target.value)), className: "mt-1 w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground" })
          ] }, k)) });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        if (!draft.name || !draft.slug) return toast.error("Name + slug required");
        s.mutate(draft);
        setDraft({
          name: "",
          slug: "",
          color: "#8b5cf6",
          is_active: true,
          sort_order: 0
        });
      }, disabled: s.isPending, className: "w-full inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
        " Save"
      ] }),
      draft.id && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDraft({
        name: "",
        slug: "",
        color: "#8b5cf6",
        is_active: true,
        sort_order: 0
      }), className: "w-full text-xs text-muted-foreground", children: "Cancel edit" })
    ] })
  ] });
}
function SettingsTab() {
  const load = useServerFn(getMehfilSettings);
  const save = useServerFn(adminSaveMehfilSettings);
  const q = useQuery({
    queryKey: ["admin", "mehfil", "settings"],
    queryFn: () => load()
  });
  const [form, setForm] = reactExports.useState(null);
  const current = form ?? q.data ?? null;
  const m = useMutation({
    mutationFn: (v) => save({
      data: v
    }),
    onSuccess: (d) => {
      toast.success("Saved");
      setForm(d);
    }
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-sm text-muted-foreground", children: "Loading…" });
  const T = ({
    k,
    label
  }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 p-3 border-b border-border/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!current[k], onChange: (e) => setForm({
      ...current,
      [k]: e.target.checked
    }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl rounded-xl border border-border/60 bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(T, { k: "enabled", label: "Enable Poetry Hub" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(T, { k: "battles_enabled", label: "Enable Poetry Battles" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(T, { k: "upvotes_enabled", label: "Enable Upvotes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(T, { k: "comments_enabled", label: "Enable Comments" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(T, { k: "reactions_enabled", label: "Enable Reactions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(T, { k: "shares_enabled", label: "Enable Shares" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(T, { k: "ai_assist_enabled", label: "Enable AI Assist in Composer" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(T, { k: "auto_publish_winners", label: "Auto-publish Battle Winners to Feed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 p-3 border-b border-border/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Trending widget frequency (every N posts)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 2, max: 30, value: current.trending_widget_frequency, onChange: (e) => setForm({
        ...current,
        trending_widget_frequency: Number(e.target.value)
      }), className: "w-20 rounded border border-border bg-background px-2 py-1 text-sm" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 p-3 border-b border-border/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
        "Module display name",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: 'Renames "Poetry Hub" everywhere in the UI. Routes stay /mehfil.' })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", maxLength: 40, value: current.module_name ?? "Poetry Hub", onChange: (e) => setForm({
        ...current,
        module_name: e.target.value
      }), className: "w-40 rounded border border-border bg-background px-2 py-1 text-sm" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => m.mutate(current), disabled: m.isPending, className: "w-full inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
      " Save Settings"
    ] }) })
  ] });
}
export {
  MehfilAdmin as component
};
