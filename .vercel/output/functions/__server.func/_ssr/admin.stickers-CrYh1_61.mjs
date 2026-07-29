import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { a as useAuth, aJ as AdminPageHeader, ae as Card, ac as Label, a0 as Input, B as Button, aM as Switch } from "./router-CYWPFaDK.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { bH as Upload, I as Image$1, d as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
const sb = supabase;
const BUCKET = "stickers";
const MAX_BYTES = 3 * 1024 * 1024;
const ACCEPT = "image/gif,image/webp,image/apng,image/png";
const TARGET_SIZE = 160;
const SIGNED_TTL = 60 * 60 * 24 * 365 * 10;
function readImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        w: img.naturalWidth,
        h: img.naturalHeight
      });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
function AdminStickersPage() {
  const {
    user
  } = useAuth();
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [uploading, setUploading] = reactExports.useState(false);
  const [pack, setPack] = reactExports.useState("Custom");
  const [kind, setKind] = reactExports.useState("sticker");
  const [name, setName] = reactExports.useState("");
  const fileRef = reactExports.useRef(null);
  const refresh = async () => {
    setLoading(true);
    const {
      data,
      error
    } = await sb.from("custom_stickers").select("*").order("kind", {
      ascending: true
    }).order("pack", {
      ascending: true
    }).order("sort_order", {
      ascending: true
    }).order("created_at", {
      ascending: false
    });
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    refresh();
  }, []);
  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Pick an animated GIF, WebP, APNG, or PNG file first");
    if (!ACCEPT.split(",").includes(file.type)) {
      return toast.error("Unsupported file type. Use GIF, WebP, APNG, or PNG.");
    }
    if (file.size > MAX_BYTES) {
      return toast.error(`File too large. Max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.`);
    }
    setUploading(true);
    try {
      const dims = await readImageDimensions(file);
      if (dims && (dims.w > 1024 || dims.h > 1024)) {
        toast.warning(`Large source (${dims.w}×${dims.h}px). Chat will scale to ${TARGET_SIZE}px — consider a smaller export for faster load.`);
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "gif";
      const safeName = (name || file.name.replace(/\.[^.]+$/, "")).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 40) || "sticker";
      const path = `${kind}/${pack.replace(/[^a-zA-Z0-9_-]+/g, "-")}/${Date.now()}-${safeName}.${ext}`;
      const up = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type
      });
      if (up.error) throw up.error;
      const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
      if (signed.error || !signed.data?.signedUrl) throw signed.error || new Error("Could not sign URL");
      const {
        error: insErr
      } = await sb.from("custom_stickers").insert({
        name: name || safeName,
        pack,
        kind,
        url: signed.data.signedUrl,
        storage_path: path,
        mime: file.type,
        size_bytes: file.size,
        width: dims?.w ?? null,
        height: dims?.h ?? null,
        created_by: user?.id ?? null
      });
      if (insErr) throw insErr;
      toast.success("Sticker uploaded");
      setName("");
      if (fileRef.current) fileRef.current.value = "";
      await refresh();
    } catch (e) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const toggleActive = async (row) => {
    const {
      error
    } = await sb.from("custom_stickers").update({
      is_active: !row.is_active
    }).eq("id", row.id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const remove = async (row) => {
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    if (row.storage_path) {
      await supabase.storage.from(BUCKET).remove([row.storage_path]);
    }
    const {
      error
    } = await sb.from("custom_stickers").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Stickers & Animated Emojis", description: "Upload animated stickers (GIF / WebP / APNG) and animated emojis for everyone to use in chat. All items render at a consistent, perfect size." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kind, onValueChange: (v) => setKind(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "sticker", children: [
                "Sticker (large, ~",
                TARGET_SIZE,
                "px)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "emoji", children: "Animated Emoji (small, 32px)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pack" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: pack, onChange: (e) => setPack(e.target.value), placeholder: "Custom" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Auto from filename" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "File" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ref: fileRef, type: "file", accept: ACCEPT })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Recommended: square, 256–512px source, under 1 MB. Accepted: animated GIF, WebP, APNG, PNG. Max ",
          (MAX_BYTES / 1024 / 1024).toFixed(0),
          " MB."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleUpload, disabled: uploading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-2 h-4 w-4" }),
          " ",
          uploading ? "Uploading…" : "Upload"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 text-sm font-semibold", children: [
        "Library (",
        rows.length,
        ")"
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "h-8 w-8 opacity-50" }),
        "No custom stickers or emojis yet."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid shrink-0 place-items-center overflow-hidden rounded-md bg-white/5", style: {
          width: r.kind === "emoji" ? 40 : 72,
          height: r.kind === "emoji" ? 40 : 72
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.url, alt: r.name, className: "h-full w-full object-contain", loading: "lazy" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-[11px] text-muted-foreground", children: [
            r.kind,
            " · ",
            r.pack,
            " · ",
            r.width && r.height ? `${r.width}×${r.height}` : "—",
            r.size_bytes ? ` · ${(r.size_bytes / 1024).toFixed(0)} KB` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: r.is_active, onCheckedChange: () => toggleActive(r) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: r.is_active ? "Live" : "Hidden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => remove(r), className: "ml-auto text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] })
      ] }, r.id)) })
    ] })
  ] });
}
export {
  AdminStickersPage as component
};
