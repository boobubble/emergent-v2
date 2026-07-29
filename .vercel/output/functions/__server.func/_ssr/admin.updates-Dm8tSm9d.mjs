import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, aJ as AdminPageHeader, ae as Card, ag as CardHeader, ai as CardDescription, ah as CardTitle, af as CardContent, B as Button, m as cn } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { R as Root } from "../_libs/radix-ui__react-separator.mjs";
import { S as ScrollArea } from "./scroll-area-88D-EwEX.mjs";
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
import { a as Sparkles, bz as CircleCheck, bd as RefreshCw, bS as Package, a0 as LoaderCircle, bH as Upload, a6 as ChevronRight, d as Trash2, bQ as FileBraces, aS as ShieldAlert, bB as CircleX, T as TriangleAlert, af as Play, _ as Clock, aI as Download, b5 as History, R as RotateCcw, E as Eye, cn as Gauge, co as Skull, cp as GitCompare } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, b as booleanType, f as anyType, r as recordType, a as arrayType, e as enumType, n as numberType } from "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-scroll-area.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__number.mjs";
const Separator = reactExports.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    ),
    ...props
  }
));
Separator.displayName = Root.displayName;
const PackageSchema = objectType({
  version: stringType().min(1).max(32),
  build_number: numberType().int().positive().default(1),
  release_date: stringType().optional(),
  channel: enumType(["stable", "beta", "hotfix"]).default("stable"),
  min_from_version: stringType().optional(),
  max_from_version: stringType().optional(),
  installer_version: stringType().optional(),
  schema_version: stringType().optional(),
  package_sha256: stringType().optional(),
  release_notes: objectType({
    features: arrayType(stringType()).optional(),
    improvements: arrayType(stringType()).optional(),
    fixes: arrayType(stringType()).optional(),
    performance: arrayType(stringType()).optional(),
    security: arrayType(stringType()).optional(),
    database: arrayType(stringType()).optional(),
    breaking: arrayType(stringType()).optional(),
    deprecated: arrayType(stringType()).optional()
  }).default({}),
  impacts: recordType(stringType(), enumType(["safe", "attention", "manual"])).optional(),
  migrations: arrayType(objectType({
    id: stringType().min(1),
    description: stringType().optional(),
    sql: stringType().min(1)
  })).default([]),
  assets: arrayType(objectType({
    path: stringType(),
    url: stringType()
  })).default([]),
  manifest: recordType(stringType(), anyType()).default({})
});
const getSystemVersion = createServerFn({
  method: "GET"
}).handler(createSsrRpc("4b67fc921f3e13d1aa6e9d3ed1e5964f3bdf8285e048bea9aa7996bc402e0caf"));
const listUpdates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("a69dbd564799d575578bb2f5698f682d5d2290882438177360a14b8721fdd78c"));
const uploadUpdatePackage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => PackageSchema.parse(raw)).handler(createSsrRpc("df4fdbe6e2c28811c724b6c7bfe6f800d4fa2746431b26a78284cb859ea082f6"));
const deleteUpdatePackage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  id: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("5cb69cd947cdad0ac250481405d1de36e3870ab3d45172514d7f34758b1ef0f2"));
const preUpdateChecks = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  version: stringType()
}).parse(raw)).handler(createSsrRpc("4b5f3ef063af3e60de6d9a2b2aa329ff847671bf5ab7dac6d8bb8080efeb59ee"));
const runUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  version: stringType(),
  skipBackup: booleanType().default(false)
}).parse(raw)).handler(createSsrRpc("f4653e3bb99cbf159fa69ff5faea7248a3d8f0dd78c20b3186ed6408479ab38d"));
const rollbackUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  historyId: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("a545729233d4e6859a6ab323109b23797d3af9e8cda10a2985d1f4da02e8bcf9"));
const listUpdateHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("92bf685e2de1ae64a662debdfcfa03dbdf44d29dcc7f33657310aaaf69b2e410"));
const validatePackage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  pkg: anyType()
}).parse(raw)).handler(createSsrRpc("ba4e0c7be3f2edbb44873ec181e3b54b86e1ad34a146507ca124e5ff1cb56c7a"));
const previewUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  version: stringType()
}).parse(raw)).handler(createSsrRpc("ad75fb9944eec0d95794e659b8ac2de998b6c81b27128a3e5548eb5eb4908dd9"));
function fmtDate(v) {
  return v ? new Date(v).toLocaleString() : "—";
}
function fmtDuration(ms) {
  if (!ms && ms !== 0) return "—";
  if (ms < 1e3) return `${ms}ms`;
  const s = Math.floor(ms / 1e3);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}
function UpdatesPage() {
  const _getSys = useServerFn(getSystemVersion);
  const _listUpdates = useServerFn(listUpdates);
  const _upload = useServerFn(uploadUpdatePackage);
  const _delete = useServerFn(deleteUpdatePackage);
  const _preCheck = useServerFn(preUpdateChecks);
  const _run = useServerFn(runUpdate);
  const _rollback = useServerFn(rollbackUpdate);
  const _history = useServerFn(listUpdateHistory);
  const _validate = useServerFn(validatePackage);
  const _preview = useServerFn(previewUpdate);
  const [sys, setSys] = reactExports.useState(null);
  const [pkgs, setPkgs] = reactExports.useState([]);
  const [history, setHistory] = reactExports.useState([]);
  const [selected, setSelected] = reactExports.useState(null);
  const [checks, setChecks] = reactExports.useState(null);
  const [validation, setValidation] = reactExports.useState(null);
  const [preview, setPreview] = reactExports.useState(null);
  const [progress, setProgress] = reactExports.useState([]);
  const [running, setRunning] = reactExports.useState(false);
  const [startedAt, setStartedAt] = reactExports.useState(null);
  const [now, setNow] = reactExports.useState(Date.now());
  const [busy, setBusy] = reactExports.useState(null);
  const [ackDestructive, setAckDestructive] = reactExports.useState(false);
  const fileRef = reactExports.useRef(null);
  const refresh = async () => {
    const [s, p, h] = await Promise.all([_getSys(), _listUpdates(), _history()]);
    setSys(s);
    setPkgs(p);
    setHistory(h);
    if (!selected && p.length) setSelected(p[0]);
  };
  reactExports.useEffect(() => {
    refresh().catch((e) => toast.error(e.message));
  }, []);
  reactExports.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [running]);
  const targetPkg = reactExports.useMemo(() => selected ?? pkgs[0] ?? null, [selected, pkgs]);
  const isUpdateAvailable = sys?.update_available;
  async function onUploadFile(f) {
    setBusy("upload");
    try {
      const text = await f.text();
      const json = JSON.parse(text);
      const v = await _validate({
        data: {
          pkg: json
        }
      });
      if (!v.valid) {
        setValidation(v);
        toast.error("Package failed validation — see report below");
        return;
      }
      const res = await _upload({
        data: json
      });
      toast.success(res.replaced ? "Package replaced" : "Package uploaded");
      await refresh();
    } catch (e) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  reactExports.useEffect(() => {
    if (!targetPkg) {
      setPreview(null);
      setValidation(null);
      return;
    }
    (async () => {
      try {
        const [prv, val] = await Promise.all([_preview({
          data: {
            version: targetPkg.version
          }
        }), _validate({
          data: {
            pkg: {
              version: targetPkg.version,
              build_number: targetPkg.build_number,
              release_date: targetPkg.release_date,
              channel: targetPkg.channel,
              min_from_version: targetPkg.min_from_version ?? void 0,
              release_notes: targetPkg.release_notes ?? {},
              migrations: targetPkg.migrations ?? [],
              manifest: targetPkg.manifest ?? {},
              package_sha256: targetPkg.package_sha256 ?? void 0
            }
          }
        })]);
        setPreview(prv);
        setValidation(val);
        setAckDestructive(false);
      } catch (e) {
        toast.error(e.message);
      }
    })();
  }, [targetPkg?.id]);
  async function onCheck() {
    if (!targetPkg) return;
    setBusy("check");
    try {
      const res = await _preCheck({
        data: {
          version: targetPkg.version
        }
      });
      setChecks(res);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }
  const checklist = reactExports.useMemo(() => {
    const hasDestructive = (preview?.sql?.destructive?.length ?? 0) > 0;
    return [{
      key: "validated",
      label: "Package validated",
      ok: !!validation?.valid
    }, {
      key: "compat",
      label: "Compatibility passed",
      ok: !!preview?.compatibility?.passed
    }, {
      key: "checks",
      label: "Pre-update checks passed",
      ok: !!checks?.ready
    }, {
      key: "db",
      label: "Database connected",
      ok: checks?.checks?.find((c) => c.name === "Database connection")?.ok ?? false
    }, {
      key: "storage",
      label: "Storage healthy",
      ok: checks?.checks?.find((c) => c.name === "Storage service")?.ok ?? false
    }, {
      key: "env",
      label: "Environment valid",
      ok: checks?.checks?.find((c) => c.name === "Environment variables")?.ok ?? false
    }, {
      key: "destructive",
      label: hasDestructive ? "Destructive operations acknowledged" : "No destructive operations",
      ok: hasDestructive ? ackDestructive : true
    }];
  }, [validation, preview, checks, ackDestructive]);
  const allChecklistOk = checklist.every((c) => c.ok);
  async function onRun() {
    if (!targetPkg) return;
    if (!allChecklistOk) {
      toast.error("Complete the pre-update checklist first");
      return;
    }
    if (!confirm(`Update to v${targetPkg.version}? A backup will be created first.`)) return;
    setRunning(true);
    setStartedAt(Date.now());
    const initial = ["Preparing update", "Creating backup", "Checking compatibility", "Updating files", "Running database migrations", "Updating assets", "Verifying installation", "Clearing cache", "Finalizing"].map((s) => ({
      stage: s,
      ok: null
    }));
    setProgress(initial);
    try {
      const res = await _run({
        data: {
          version: targetPkg.version,
          skipBackup: false
        }
      });
      const merged = initial.map((row) => {
        const done = res.stages?.find((s) => s.stage === row.stage);
        return done ? {
          ...row,
          ok: done.ok,
          ms: done.ms,
          detail: done.detail
        } : row;
      });
      setProgress(merged);
      if (res.ok) toast.success("Update completed");
      else toast.error(`Update failed: ${res.error}`);
      await refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  }
  async function onDelete(id) {
    if (!confirm("Delete this update package?")) return;
    await _delete({
      data: {
        id
      }
    });
    await refresh();
    toast.success("Package removed");
  }
  async function onRollback(historyId) {
    if (!confirm("Rollback to previous version? Settings will be restored from the backup snapshot.")) return;
    try {
      const r = await _rollback({
        data: {
          historyId
        }
      });
      toast.success(`Rolled back to v${r.restoredTo}`);
      await refresh();
    } catch (e) {
      toast.error(e.message);
    }
  }
  function onDownloadReport(h) {
    const blob = new Blob([JSON.stringify(h, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `update-report-${h.to_version}-${h.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function onDownloadPreview(fmt) {
    if (!preview || !targetPkg) return;
    const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const base = `update-preview-v${targetPkg.version}-${stamp}`;
    if (fmt === "json") {
      const blob2 = new Blob([JSON.stringify({
        preview,
        validation,
        checklist
      }, null, 2)], {
        type: "application/json"
      });
      const a2 = document.createElement("a");
      a2.href = URL.createObjectURL(blob2);
      a2.download = `${base}.json`;
      a2.click();
      URL.revokeObjectURL(a2.href);
      return;
    }
    const lines = [];
    lines.push(`Update Preview Report — v${targetPkg.version} (build ${targetPkg.build_number})`);
    lines.push(`Generated: ${preview.generated_at}`);
    lines.push(`Current: v${preview.current_version ?? "?"}  →  Target: v${preview.package.version}`);
    lines.push(`Channel: ${preview.package.channel}   Release date: ${preview.package.release_date ?? "—"}`);
    lines.push(`Risk: ${preview.risk.level.toUpperCase()} (score ${preview.risk.score})`);
    lines.push("");
    lines.push("Compatibility");
    for (const c of preview.compatibility.checks) lines.push(`  [${c.ok ? "✔" : "✘"}] ${c.name} — ${c.detail ?? ""}`);
    lines.push("");
    lines.push(`Migrations: ${preview.migrations.pending} pending / ${preview.migrations.applied} applied / ${preview.migrations.total} total`);
    lines.push(`SQL summary: +${preview.sql.tables_added.length} tables, ~${preview.sql.tables_modified.length} altered, +${preview.sql.columns_added} cols, -${preview.sql.columns_removed} cols, +${preview.sql.indexes_added} idx, +${preview.sql.functions_added} fn, +${preview.sql.triggers_added} trg, +${preview.sql.policies_added} pol`);
    if (preview.sql.destructive.length) {
      lines.push("DESTRUCTIVE:");
      for (const d of preview.sql.destructive) lines.push(`  - ${d.op} in ${d.migration_id}`);
    }
    lines.push("");
    lines.push("Impact Analysis");
    for (const [k, v] of Object.entries(preview.impacts)) lines.push(`  ${k}: ${v}`);
    lines.push("");
    lines.push(`Estimated: total ${Math.round(preview.estimates_ms.total / 1e3)}s, migrations ${Math.round(preview.estimates_ms.migration / 1e3)}s, verify ${Math.round(preview.estimates_ms.verify / 1e3)}s`);
    if (preview.warnings.length) {
      lines.push("");
      lines.push("Warnings");
      for (const w of preview.warnings) lines.push(`  ! ${w}`);
    }
    lines.push("");
    lines.push("Validation");
    for (const r of validation?.results ?? []) lines.push(`  [${r.ok ? "✔" : "✘"}] ${r.name} — ${r.detail ?? ""}`);
    lines.push("");
    lines.push("Checklist");
    for (const c of checklist) lines.push(`  [${c.ok ? "✔" : " "}] ${c.label}`);
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${base}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  const elapsed = startedAt ? now - startedAt : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Update Center", description: "Version management & one-click updates. Existing user data is never modified." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Current Version" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-2xl", children: [
            "v",
            sys?.current_version ?? "…"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-xs text-muted-foreground", children: [
          "Build ",
          sys?.current_build ?? "—",
          " · Installed ",
          fmtDate(sys?.installed_at)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Latest Available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-2xl", children: [
            "v",
            sys?.latest_version ?? "…"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-xs text-muted-foreground", children: [
          "Build ",
          sys?.latest_build ?? "—",
          " · Released ",
          fmtDate(sys?.latest_release_date)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl flex items-center gap-2", children: isUpdateAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
            " Update Available"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-emerald-500" }),
            " Up to Date"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => refresh(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-3.5 w-3.5" }),
          " Check for Updates"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
          " Update Packages"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          "Upload a signed ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: ".json" }),
          " update manifest. Packages describe the target version, release notes, and database migrations."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: ".json,application/json", hidden: true, onChange: (e) => e.target.files?.[0] && onUploadFile(e.target.files[0]) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => fileRef.current?.click(), disabled: busy === "upload", children: [
            busy === "upload" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-2 h-3.5 w-3.5" }),
            "Upload Update Package"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Only super admins can upload." })
        ] }),
        pkgs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground", children: "No update packages uploaded yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border divide-y", children: pkgs.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setSelected(p);
          setChecks(null);
          setProgress([]);
        }, className: `w-full text-left p-3 hover:bg-muted/40 transition ${targetPkg?.id === p.id ? "bg-muted/50" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: `h-4 w-4 transition ${targetPkg?.id === p.id ? "rotate-90 text-primary" : "text-muted-foreground"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm flex items-center gap-2", children: [
                "v",
                p.version,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
                  "build ",
                  p.build_number
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: p.channel }),
                p.is_current && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", children: "current" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "Released ",
                fmtDate(p.release_date),
                " · ",
                p.migrations?.length ?? 0,
                " migrations"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: (e) => {
            e.stopPropagation();
            onDelete(p.id);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
        ] }) }, p.id)) })
      ] })
    ] }),
    targetPkg && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileBraces, { className: "h-4 w-4" }),
          " Release Notes · v",
          targetPkg.version
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Review changes before updating." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReleaseNotes, { notes: targetPkg.release_notes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(UpdatePreviewPanel, { preview, validation, targetPkg }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-xs space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm mb-1", children: "Required Migrations" }),
            (targetPkg.migrations ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "No database changes." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-0.5", children: targetPkg.migrations.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: m.id }),
              m.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " · ",
                m.description
              ] })
            ] }, m.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-xs space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm mb-1", children: "Compatibility" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Min. required version: ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { children: [
                "v",
                targetPkg.min_from_version ?? "any"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Channel: ",
              targetPkg.channel
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Est. update time: ",
              preview?.estimates_ms ? fmtDuration(preview.estimates_ms.total) : `~${Math.max(1, (targetPkg.migrations?.length ?? 0) + 1)} min`
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }),
              " Pre-Update Checks"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: onCheck, disabled: busy === "check", children: [
              busy === "check" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-3.5 w-3.5" }),
              "Run Checks"
            ] })
          ] }),
          !checks ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Run checks to verify readiness." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            checks.checks.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                c.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 text-destructive" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: c.detail ?? "" })
            ] }, i)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 text-xs", children: checks.ready ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-600 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
              " Ready to Update · ",
              checks.pendingMigrations,
              " new migration(s)"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-destructive flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
              " Problems Found — resolve above before updating"
            ] }) })
          ] })
        ] }),
        progress.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
              " Update Progress"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              " ",
              fmtDuration(elapsed)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: progress.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              s.ok === true && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-500" }),
              s.ok === false && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 text-destructive" }),
              s.ok === null && (running ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3.5 w-3.5 rounded-full border" })),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.stage })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              s.ms != null && `${fmtDuration(s.ms)} `,
              s.detail ?? ""
            ] })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
            " Pre-Update Checklist"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1.5 md:grid-cols-2", children: checklist.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
            c.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: c.ok ? "" : "text-muted-foreground", children: c.label })
          ] }, c.key)) }),
          (preview?.sql?.destructive?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "mt-0.5", checked: ackDestructive, onChange: (e) => setAckDestructive(e.target.checked) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "I understand this package contains ",
              preview.sql.destructive.length,
              " destructive operation(s) (",
              preview.sql.destructive.map((d) => d.op).join(", "),
              ") and I want to proceed."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onRun, disabled: running || !allChecklistOk, children: [
            running ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "mr-2 h-3.5 w-3.5" }),
            "Run Update"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => onDownloadPreview("json"), disabled: !preview, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-3.5 w-3.5" }),
            " Report (JSON)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => onDownloadPreview("txt"), disabled: !preview, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-3.5 w-3.5" }),
            " Report (TXT)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "A backup snapshot is created automatically. No user data is deleted." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
          " Update History"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Complete audit log of every update run." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No updates yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "max-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: history.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: h.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              h.from_version ? `v${h.from_version} → ` : "",
              "v",
              h.to_version
            ] }),
            h.build_number && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs", children: [
              "build ",
              h.build_number
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => onDownloadReport(h), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }) }),
            h.rollback_available && h.status === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onRollback(h.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-2 h-3.5 w-3.5" }),
              " Rollback"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
          fmtDate(h.started_at),
          " · ",
          fmtDuration(h.duration_ms),
          " · ",
          h.backup_created ? "backup ✓" : "no backup",
          h.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-destructive mt-1", children: [
            "⚠ ",
            h.error
          ] })
        ] })
      ] }, h.id)) }) }) })
    ] })
  ] });
}
function StatusBadge({
  status
}) {
  const map = {
    success: {
      label: "Success",
      cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
    },
    failed: {
      label: "Failed",
      cls: "bg-destructive/15 text-destructive border-destructive/30"
    },
    running: {
      label: "Running",
      cls: "bg-primary/15 text-primary border-primary/30"
    },
    rolled_back: {
      label: "Rolled Back",
      cls: "bg-amber-500/15 text-amber-600 border-amber-500/30"
    }
  };
  const s = map[status] ?? {
    label: status,
    cls: ""
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-xs ${s.cls}`, children: s.label });
}
function ReleaseNotes({
  notes
}) {
  if (!notes || typeof notes !== "object") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No release notes." });
  const sections = [["✨ New Features", notes.features], ["🚀 Improvements", notes.improvements], ["🐛 Bug Fixes", notes.fixes], ["⚡ Performance", notes.performance], ["🔒 Security", notes.security], ["🗄 Database Changes", notes.database], ["⚠️ Breaking Changes", notes.breaking]];
  const nonEmpty = sections.filter(([, v]) => Array.isArray(v) && v.length > 0);
  if (nonEmpty.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No release notes." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2", children: nonEmpty.map(([title, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-1", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs space-y-0.5 text-muted-foreground list-disc list-inside", children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: it }, i)) })
  ] }, title)) });
}
function RiskBadge({
  level,
  score
}) {
  const map = {
    low: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    high: "bg-destructive/15 text-destructive border-destructive/30"
  };
  const emoji = level === "high" ? "🔴" : level === "medium" ? "🟡" : "🟢";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `text-xs ${map[level] ?? ""}`, children: [
    emoji,
    " ",
    level.toUpperCase(),
    " · ",
    score
  ] });
}
function ImpactBadge({
  status
}) {
  const s = status === "safe" ? {
    l: "✔ Safe",
    c: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
  } : status === "attention" ? {
    l: "⚠ Attention",
    c: "bg-amber-500/15 text-amber-600 border-amber-500/30"
  } : {
    l: "❌ Manual",
    c: "bg-destructive/15 text-destructive border-destructive/30"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-xs ${s.c}`, children: s.l });
}
function UpdatePreviewPanel({
  preview,
  validation,
  targetPkg
}) {
  if (!preview) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-sm text-muted-foreground flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
      " Generating update preview…"
    ] });
  }
  const sql = preview.sql;
  const est = preview.estimates_ms;
  const notes = preview.release_notes ?? {};
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-xs space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
          " Update Summary"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Version: v",
          preview.current_version ?? "?",
          " → ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
            "v",
            preview.package.version
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Build: ",
          preview.package.build_number
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Released: ",
          preview.package.release_date ? new Date(preview.package.release_date).toLocaleDateString() : "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Estimated: ",
          fmtDuration(est.total),
          " (migrations ",
          fmtDuration(est.migration),
          ", verify ",
          fmtDuration(est.verify),
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-xs space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }),
          " Compatibility"
        ] }),
        preview.compatibility.checks.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          c.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 text-destructive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground ml-auto", children: c.detail ?? "" })
        ] }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-1", children: preview.compatibility.passed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", children: "✔ Compatible" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs bg-destructive/15 text-destructive border-destructive/30", children: "❌ Incompatible" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-xs space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "h-4 w-4" }),
          " Risk"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { level: preview.risk.level, score: preview.risk.score }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
          preview.migrations.pending,
          " pending migration(s) · ",
          notes.breaking?.length ?? 0,
          " breaking · ",
          sql.destructive.length,
          " destructive op(s)"
        ] }),
        sql.destructive.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-destructive flex items-center gap-1 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { className: "h-3 w-3" }),
          " ",
          sql.destructive.map((d) => d.op).join(", ")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GitCompare, { className: "h-4 w-4" }),
        " Database Preview"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Tables Added", v: sql.tables_added.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Tables Modified", v: sql.tables_modified.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Columns +", v: sql.columns_added }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Columns ~", v: sql.columns_modified }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Columns −", v: sql.columns_removed, tone: sql.columns_removed > 0 ? "danger" : void 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Indexes Added", v: sql.indexes_added }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Views Added", v: sql.views_added }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Functions Added", v: sql.functions_added }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Triggers Added", v: sql.triggers_added }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Policies Added", v: sql.policies_added })
      ] }),
      (sql.tables_added.length > 0 || sql.tables_modified.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-2 text-xs pt-1", children: [
        sql.tables_added.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Added tables:" }),
          " ",
          sql.tables_added.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "mx-0.5", children: t }, t))
        ] }),
        sql.tables_modified.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Modified tables:" }),
          " ",
          sql.tables_modified.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "mx-0.5", children: t }, t))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: "Impact Analysis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-1.5 text-xs", children: Object.entries(preview.impacts).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded border px-2 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: k }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ImpactBadge, { status: v })
      ] }, k)) })
    ] }),
    validation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileBraces, { className: "h-4 w-4" }),
        " Package Validation",
        validation.valid ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-1 text-xs", children: "✔ Valid" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-1 text-xs bg-destructive/15 text-destructive border-destructive/30", children: "❌ Invalid" })
      ] }),
      validation.results.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
        r.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 text-destructive" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground ml-auto", children: r.detail ?? "" })
      ] }, i))
    ] }),
    preview.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
        " Smart Warnings"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs list-disc list-inside space-y-0.5", children: preview.warnings.map((w, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: w }, i)) })
    ] })
  ] });
}
function Stat({
  label,
  v,
  tone
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded border px-2 py-1.5 ${tone === "danger" && v > 0 ? "border-destructive/40 bg-destructive/5" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg font-semibold ${tone === "danger" && v > 0 ? "text-destructive" : ""}`, children: v }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: label })
  ] });
}
export {
  UpdatesPage as component
};
