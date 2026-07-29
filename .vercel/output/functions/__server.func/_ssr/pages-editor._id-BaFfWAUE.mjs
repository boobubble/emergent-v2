import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link, e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as useAuth, b as useServerFn, _ as getMyRoles, B as Button, cU as Route$M, cV as getPage, cW as savePage, a0 as Input, cX as slugify, ac as Label, ad as Textarea, aG as AdminToggle } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { C as Collapsible } from "./Collapsible-BYvkEmuh.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { u as useEditor, E as EditorContent } from "../_libs/tiptap__react.mjs";
import { i as index_default$1 } from "../_libs/tiptap__starter-kit.mjs";
import { i as index_default } from "../_libs/tiptap__extension-underline.mjs";
import { i as index_default$2 } from "../_libs/tiptap__extension-link.mjs";
import { i as index_default$3 } from "../_libs/tiptap__extension-image.mjs";
import { i as index_default$4 } from "../_libs/tiptap__extension-placeholder.mjs";
import { i as index_default$5 } from "../_libs/tiptap__extension-task-list.mjs";
import { i as index_default$6 } from "../_libs/tiptap__extension-task-item.mjs";
import { T as TableRow, a as Table, b as TableHeader, c as TableCell } from "../_libs/tiptap__extension-table.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { s as sanitizeHtml } from "./pages-io-D2u0cRTH.mjs";
import { i as injectHeadingIds } from "./heading-ids-CyHysT4r.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/isomorphic-dompurify.mjs";
import { au as ShieldCheck, A as ArrowLeft, aZ as FileText, E as Eye, b as Save, N as Search, ax as ExternalLink, aq as Calendar, l as Star, c5 as Tag, I as Image, y as Settings2, cL as CloudOff, bw as Cloud, cM as Heading1, cN as Heading2, cO as Heading3, cP as Bold, cQ as Italic, cR as Underline, cS as List, b7 as ListOrdered, cT as SquareCheckBig, Q as Quote, bn as CodeXml, aK as Link$1, a0 as LoaderCircle, bH as Upload, cU as Table$1, t as Minus, cw as Info, cV as ListTree, b_ as Undo2, cW as Redo2, b$ as Pencil } from "../_libs/lucide-react.mjs";
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
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/tiptap__core.mjs";
import "../_libs/prosemirror-transform.mjs";
import "../_libs/prosemirror-model.mjs";
import "../_libs/orderedmap.mjs";
import "../_libs/prosemirror-commands.mjs";
import "../_libs/prosemirror-state.mjs";
import "../_libs/prosemirror-schema-list.mjs";
import "../_libs/prosemirror-view.mjs";
import "../_libs/prosemirror-keymap.mjs";
import "../_libs/w3c-keyname.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiptap__extension-blockquote.mjs";
import "../_libs/tiptap__extension-bold.mjs";
import "../_libs/tiptap__extension-code.mjs";
import "../_libs/tiptap__extension-code-block.mjs";
import "../_libs/tiptap__extension-document.mjs";
import "../_libs/tiptap__extension-hard-break.mjs";
import "../_libs/tiptap__extension-heading.mjs";
import "../_libs/@tiptap/extension-horizontal-rule+[...].mjs";
import "../_libs/tiptap__extension-italic.mjs";
import "../_libs/tiptap__extension-list.mjs";
import "../_libs/tiptap__extension-paragraph.mjs";
import "../_libs/tiptap__extension-strike.mjs";
import "../_libs/tiptap__extension-text.mjs";
import "../_libs/tiptap__extensions.mjs";
import "../_libs/prosemirror-dropcursor.mjs";
import "../_libs/prosemirror-gapcursor.mjs";
import "../_libs/prosemirror-history.mjs";
import "../_libs/rope-sequence.mjs";
import "../_libs/linkifyjs.mjs";
import "../_libs/prosemirror-tables.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/jsdom.mjs";
import "path";
import "url";
import "vm";
import "events";
import "node:vm";
import "zlib";
import "fs";
import "../_libs/tough-cookie.mjs";
import "../_libs/tldts.mjs";
import "../_libs/tldts-core.mjs";
import "../_libs/html-encoding-sniffer.mjs";
import "../_libs/exodus__bytes.mjs";
import "node:buffer";
import "../_libs/whatwg-url.mjs";
import "../_libs/webidl-conversions.mjs";
import "../_libs/tr46.mjs";
import "../_libs/punycode.mjs";
import "../_libs/whatwg-mimetype.mjs";
import "../_libs/undici.mjs";
import "node:assert";
import "node:net";
import "node:querystring";
import "node:events";
import "node:diagnostics_channel";
import "node:util";
import "node:tls";
import "node:zlib";
import "node:perf_hooks";
import "node:util/types";
import "node:sqlite";
import "node:worker_threads";
import "node:url";
import "node:console";
import "node:fs/promises";
import "node:timers";
import "node:dns";
import "node:http";
import "node:crypto";
import "node:path";
import "../_libs/symbol-tree.mjs";
import "../_libs/is-potential-custom-element-name+[...].mjs";
import "../_libs/xml-name-validator.mjs";
import "../_libs/saxes.mjs";
import "../_libs/xmlchars.mjs";
import "../_libs/parse5.mjs";
import "../_libs/entities.mjs";
import "../_libs/w3c-xmlserializer.mjs";
import "../_libs/asamuzakjp__css-color.mjs";
import "../_libs/asamuzakjp__generational-cache.mjs";
import "../_libs/csstools__css-tokenizer.mjs";
import "../_libs/csstools__css-calc.mjs";
import "../_libs/@csstools/css-parser-algorithms+[...].mjs";
import "../_libs/csstools__css-color-parser.mjs";
import "../_libs/csstools__color-helpers.mjs";
import "../_libs/@csstools/css-syntax-patches-for-csstree+[...].mjs";
import "../_libs/css-tree.mjs";
import "../_libs/source-map-js.mjs";
import "../_libs/mdn-data.mjs";
import "module";
import "../_libs/lru-cache.mjs";
import "node:fs";
import "../_libs/bramus__specificity.mjs";
import "../_libs/asamuzakjp__dom-selector.mjs";
import "../_libs/asamuzakjp__nwsapi.mjs";
import "../_libs/bidi-js.mjs";
import "../_libs/data-urls.mjs";
import "../_libs/decimal.js.mjs";
import "os";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
function RichTextEditor({ value, onChange, placeholder, uploadFolder = "pages" }) {
  const fileRef = reactExports.useRef(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const [mode, setMode] = reactExports.useState("edit");
  const editor = useEditor({
    extensions: [
      index_default$1.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "rounded-md bg-muted p-3 text-xs font-mono" } },
        link: false,
        underline: false
      }),
      index_default,
      index_default$2.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } }),
      index_default$3.configure({ HTMLAttributes: { class: "max-w-full h-auto rounded-md" } }),
      index_default$4.configure({ placeholder: placeholder ?? "Write your page content…" }),
      index_default$5.configure({ HTMLAttributes: { class: "not-prose space-y-1" } }),
      index_default$6.configure({ nested: true, HTMLAttributes: { class: "flex gap-2 items-start" } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full my-3" } }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: "border border-border bg-muted px-2 py-1 text-left font-semibold" } }),
      TableCell.configure({ HTMLAttributes: { class: "border border-border px-2 py-1 align-top" } })
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert min-h-[320px] max-w-none p-3 text-sm outline-none focus:outline-none"
      }
    },
    onUpdate: ({ editor: editor2 }) => onChange(editor2.getHTML())
  });
  reactExports.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && !editor.isFocused) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);
  const uploadFile = reactExports.useCallback(async (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported");
      return null;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Image must be under 8 MB");
      return null;
    }
    setUploading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        toast.error("You must be signed in to upload");
        return null;
      }
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${uid}/${uploadFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("feed-media").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
      return data.publicUrl;
    } catch (e) {
      toast.error(e?.message ?? "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }, [uploadFolder]);
  const handlePickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    const url = await uploadFile(file);
    if (url) editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
  };
  const insertLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL (https://… or /internal-slug)", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const insertImageByUrl = () => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };
  const insertCallout = (variant = "info") => {
    if (!editor) return;
    const html = `<div class="callout callout-${variant}"><p>💡 Type your callout here…</p></div><p></p>`;
    editor.chain().focus().insertContent(html).run();
  };
  const insertTable = () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  const insertTOC = () => {
    if (!editor) return;
    const headings = [];
    const used = /* @__PURE__ */ new Set();
    editor.state.doc.descendants((node) => {
      if (node.type.name === "heading" && (node.attrs.level === 2 || node.attrs.level === 3)) {
        const text = node.textContent.trim();
        if (!text) return;
        let id = text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "section";
        let base = id, n = 2;
        while (used.has(id)) id = `${base}-${n++}`;
        used.add(id);
        headings.push({ level: node.attrs.level, text, id });
      }
    });
    if (!headings.length) {
      toast.info("Add some H2 or H3 headings first");
      return;
    }
    const items = headings.map(
      (h) => `<li class="toc-l${h.level}"><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`
    ).join("");
    const toc = `<nav class="toc" aria-label="Table of contents"><div class="toc-title">Table of contents</div><ul>${items}</ul></nav><p></p>`;
    editor.chain().focus("start").insertContentAt(0, toc).run();
    toast.success("Table of contents inserted");
  };
  if (!editor) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-input bg-background p-4 text-sm text-muted-foreground", children: "Loading editor…" });
  }
  const previewHtml = reactExports.useMemo(() => sanitizeHtml(injectHeadingIds(editor.getHTML())), [editor, mode]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-input bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-0.5 border-b p-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("heading", { level: 1 }), onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), title: "H1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heading1, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), title: "H2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heading2, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), title: "H3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heading3, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("paragraph"), onClick: () => editor.chain().focus().setParagraph().run(), title: "Paragraph", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold", children: "P" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sep, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run(), title: "Bold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bold, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run(), title: "Italic", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Italic, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("underline"), onClick: () => editor.chain().focus().toggleUnderline().run(), title: "Underline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Underline, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sep, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run(), title: "Bullet list", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run(), title: "Numbered list", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListOrdered, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("taskList"), onClick: () => editor.chain().focus().toggleTaskList().run(), title: "Checklist", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run(), title: "Quote", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Quote, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("codeBlock"), onClick: () => editor.chain().focus().toggleCodeBlock().run(), title: "Code block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CodeXml, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sep, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { active: editor.isActive("link"), onClick: insertLink, title: "Link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { onClick: () => fileRef.current?.click(), title: "Upload image", children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { onClick: insertImageByUrl, title: "Image by URL", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { onClick: insertTable, title: "Insert table", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table$1, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { onClick: () => editor.chain().focus().setHorizontalRule().run(), title: "Divider", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { onClick: () => insertCallout("info"), title: "Callout / Info box", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { onClick: insertTOC, title: "Insert Table of Contents", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListTree, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sep, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { onClick: () => editor.chain().focus().undo().run(), title: "Undo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TB, { onClick: () => editor.chain().focus().redo().run(), title: "Redo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redo2, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center rounded-md border p-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setMode("edit"),
            className: `inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] ${mode === "edit" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }),
              " Edit"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setMode("preview"),
            className: `inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] ${mode === "preview" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
              " Preview"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: handlePickFile }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onDragOver: (e) => e.preventDefault(),
        onDrop: async (e) => {
          const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
          if (!file) return;
          e.preventDefault();
          const url = await uploadFile(file);
          if (url) editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
        },
        onPaste: async (e) => {
          const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
          if (!item) return;
          const file = item.getAsFile();
          if (!file) return;
          e.preventDefault();
          const url = await uploadFile(file);
          if (url) editor.chain().focus().setImage({ src: url }).run();
        },
        children: mode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EditorContent, { editor }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "prose prose-sm dark:prose-invert min-h-[320px] max-w-none p-3 text-sm",
            dangerouslySetInnerHTML: { __html: previewHtml }
          }
        )
      }
    )
  ] });
}
function TB({ children, onClick, title, active }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      type: "button",
      variant: "ghost",
      size: "icon",
      className: `h-7 w-7 ${active ? "bg-muted text-foreground" : ""}`,
      onClick,
      title,
      children
    }
  );
}
function Sep() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-1 h-5 w-px bg-border" });
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function emptyPage() {
  return {
    id: "",
    slug: "",
    title: "",
    content: "",
    excerpt: "",
    tags: [],
    status: "draft",
    featured: false,
    layout: "boxed",
    sidebar_left: "none",
    sidebar_right: "none",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    canonical_url: "",
    noindex: false,
    nofollow: false
  };
}
const LAYOUTS = [{
  value: "boxed",
  label: "Boxed container"
}, {
  value: "full",
  label: "Full width"
}];
const SIDEBARS = [{
  value: "none",
  label: "None"
}, {
  value: "ads",
  label: "Ads slot"
}, {
  value: "feed",
  label: "Feed menu"
}];
function PageEditorGate() {
  const {
    user,
    ready
  } = useAuth();
  const fetchRoles = useServerFn(getMyRoles);
  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: () => fetchRoles({}),
    enabled: !!user && ready,
    staleTime: 3e4
  });
  if (!ready || isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background text-sm text-muted-foreground", children: "Checking access…" });
  }
  if (isError || !data?.isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mx-auto h-10 w-10 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-lg font-semibold", children: "Admin access required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "You don't have permission to edit pages." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-4 inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Back to app" }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PageEditor, {});
}
function PageEditor() {
  const {
    id
  } = Route$M.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const fetchPage = useServerFn(getPage);
  const save = useServerFn(savePage);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin", "pages", "edit", id],
    queryFn: () => isNew ? null : fetchPage({
      data: {
        id
      }
    }),
    enabled: !isNew,
    staleTime: 0
  });
  const [row, setRow] = reactExports.useState(emptyPage());
  const [autoSlug, setAutoSlug] = reactExports.useState(isNew);
  const [saving, setSaving] = reactExports.useState(false);
  const [draftStatus, setDraftStatus] = reactExports.useState("idle");
  const [draftAt, setDraftAt] = reactExports.useState(null);
  const draftKey = `lovable.pageDraft.${id}`;
  const hydrated = reactExports.useRef(false);
  const skipNextSave = reactExports.useRef(false);
  reactExports.useEffect(() => {
    const serverRow = isNew ? emptyPage() : data ? {
      ...emptyPage(),
      ...data
    } : emptyPage();
    skipNextSave.current = true;
    setRow(serverRow);
    setAutoSlug(isNew);
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const serverAt = data?.updated_at ? new Date(data.updated_at).getTime() : 0;
        const differs = !sameDraft(parsed.row, serverRow);
        if (parsed.savedAt > serverAt && differs) {
          const ok = window.confirm("An unsaved local draft was found for this page. Restore it?");
          if (ok) {
            skipNextSave.current = true;
            setRow(parsed.row);
            setAutoSlug(false);
            setDraftAt(parsed.savedAt);
          } else {
            localStorage.removeItem(draftKey);
          }
        } else if (!differs) {
          localStorage.removeItem(draftKey);
        }
      }
    } catch {
    }
    hydrated.current = true;
  }, [data, isNew, draftKey]);
  const update = (k, v) => setRow((r) => ({
    ...r,
    [k]: v
  }));
  reactExports.useEffect(() => {
    if (!hydrated.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (!row.title && !row.content) return;
    setDraftStatus("saving");
    const t = setTimeout(() => {
      try {
        const savedAt = Date.now();
        localStorage.setItem(draftKey, JSON.stringify({
          row,
          savedAt
        }));
        setDraftAt(savedAt);
        setDraftStatus("saved");
      } catch {
        setDraftStatus("error");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [row, draftKey]);
  reactExports.useEffect(() => {
    const handler = (e) => {
      if (draftStatus === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [draftStatus]);
  async function handleSave(opts = {}) {
    if (!row.title.trim()) {
      toast.error("Add a title first");
      return;
    }
    setSaving(true);
    try {
      const status = opts.publish ? "published" : row.status;
      const payload = {
        id: row.id || void 0,
        slug: row.slug || slugify(row.title),
        title: row.title,
        content: row.content,
        excerpt: row.excerpt || null,
        layout: row.layout,
        sidebar_left: row.sidebar_left,
        sidebar_right: row.sidebar_right,
        tags: row.tags ?? [],
        status,
        featured: row.featured,
        meta_title: row.meta_title || null,
        meta_description: row.meta_description || null,
        meta_keywords: row.meta_keywords || null,
        og_title: row.og_title || null,
        og_description: row.og_description || null,
        og_image: row.og_image || null,
        canonical_url: row.canonical_url || null,
        noindex: row.noindex,
        nofollow: row.nofollow,
        overwrite: opts.overwrite
      };
      const saved = await save({
        data: payload
      });
      toast.success(opts.publish ? "Published" : "Saved");
      try {
        localStorage.removeItem(draftKey);
      } catch {
      }
      setDraftStatus("idle");
      setDraftAt(null);
      if (saved?.id && saved.id !== row.id) {
        navigate({
          to: "/pages-editor/$id",
          params: {
            id: saved.id
          },
          replace: true
        });
      } else {
        skipNextSave.current = true;
        setRow((r) => ({
          ...r,
          status
        }));
      }
    } catch (e) {
      const msg = e?.message ?? "Save failed";
      if (msg.toLowerCase().includes("already in use")) {
        if (confirm(`${msg}

Overwrite the existing page?`)) return handleSave({
          ...opts,
          overwrite: true
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  }
  if (!isNew && isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center text-sm text-muted-foreground", children: "Loading editor…" });
  }
  const publicUrl = row.slug ? `/${row.slug}` : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur sm:px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/pages", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Back to pages", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-semibold", children: row.title || (isNew ? "Add New Page" : "Edit Page") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: row.status === "published" ? "default" : "outline", className: "text-[10px]", children: row.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DraftIndicator, { status: draftStatus, savedAt: draftAt }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        row.status === "published" && publicUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: publicUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "mr-1.5 h-3.5 w-3.5" }),
          "View"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: saving, onClick: () => handleSave(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1.5 h-3.5 w-3.5" }),
          row.status === "published" ? "Update" : "Save draft"
        ] }),
        row.status !== "published" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: saving, onClick: () => handleSave({
          publish: true
        }), children: "Publish" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid w-full max-w-6xl gap-5 px-3 py-5 sm:px-5 lg:grid-cols-[1fr_320px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.title, maxLength: 200, onChange: (e) => {
            const t = e.target.value;
            setRow((r) => ({
              ...r,
              title: t,
              slug: autoSlug ? slugify(t) : r.slug
            }));
          }, placeholder: "Add title", className: "!h-auto border-0 bg-transparent px-0 py-2 text-2xl font-bold shadow-none focus-visible:ring-0 sm:text-3xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Permalink:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-foreground", children: [
              "/",
              row.slug || "your-slug"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.slug, maxLength: 120, onChange: (e) => {
              update("slug", slugify(e.target.value));
              setAutoSlug(false);
            }, className: "ml-2 h-7 max-w-[220px] font-mono text-xs", placeholder: "page-slug" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RichTextEditor, { value: row.content, onChange: (html) => update("content", html) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5" }),
            " Search appearance"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-lg border border-border bg-muted/40 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-xs text-muted-foreground", children: [
              typeof window !== "undefined" ? window.location.origin : "",
              "/",
              row.slug || "your-slug"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 truncate text-base text-[#1a0dab] dark:text-blue-400", children: (row.meta_title || row.title || "Page title").slice(0, 60) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 line-clamp-2 text-xs text-muted-foreground", children: (row.meta_description || row.excerpt || "Add a meta description to control how this page is summarized in search results.").slice(0, 160) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "SEO title" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                  (row.meta_title ?? "").length,
                  "/60"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.meta_title ?? "", maxLength: 200, onChange: (e) => update("meta_title", e.target.value), placeholder: row.title || "Defaults to page title" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Meta description" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                  (row.meta_description ?? "").length,
                  "/160"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: row.meta_description ?? "", rows: 2, maxLength: 400, onChange: (e) => update("meta_description", e.target.value), placeholder: "A clear summary of this page in 1–2 sentences." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: "Excerpt", defaultOpen: false, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: row.excerpt ?? "", maxLength: 500, rows: 3, onChange: (e) => update("excerpt", e.target.value), placeholder: "A short summary shown in listings and search results." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: "Advanced SEO (social & indexing)", defaultOpen: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Keywords" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.meta_keywords ?? "", maxLength: 500, onChange: (e) => update("meta_keywords", e.target.value), placeholder: row.tags?.length ? row.tags.join(", ") : "chat, india, friends" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: row.meta_keywords?.trim() ? `Custom keywords will be used in the page's <meta name="keywords"> tag.` : row.tags?.length ? `Leave blank to auto-use tags: ${row.tags.join(", ")}` : "Leave blank to auto-use the page's tags." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "OG title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.og_title ?? "", maxLength: 200, onChange: (e) => update("og_title", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "OG image URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.og_image ?? "", maxLength: 500, onChange: (e) => update("og_image", e.target.value), placeholder: "https://…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "OG description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: row.og_description ?? "", rows: 2, maxLength: 400, onChange: (e) => update("og_description", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Canonical URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.canonical_url ?? "", maxLength: 500, onChange: (e) => update("canonical_url", e.target.value), placeholder: "https://example.com/page" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: !!row.noindex, onCheckedChange: (v) => update("noindex", v) }),
              "Noindex"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: !!row.nofollow, onCheckedChange: (v) => update("nofollow", v) }),
              "Nofollow"
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }), title: "Publish", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: row.status, onValueChange: (v) => update("status", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "published", children: "Published" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Visibility" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: row.noindex ? "Hidden from search" : "Public" })
          ] }),
          row.updated_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Last updated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: new Date(row.updated_at).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "flex-1", disabled: saving, onClick: () => handleSave(), children: "Save draft" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "flex-1", disabled: saving, onClick: () => handleSave({
              publish: true
            }), children: row.status === "published" ? "Update" : "Publish" })
          ] }),
          row.status === "published" && publicUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: publicUrl, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-xs text-primary hover:underline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }),
            publicUrl
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4" }), title: "Featured", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Show as featured" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: !!row.featured, onCheckedChange: (v) => update("featured", v) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-4 w-4" }), title: "Tags", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TagsInput, { value: row.tags ?? [], onChange: (tags) => update("tags", tags) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Comma separated (max 20)." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" }), title: "Featured image (OG)", children: [
          row.og_image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: row.og_image, alt: "", className: "mb-2 aspect-video w-full rounded-md border border-border object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 grid aspect-video w-full place-items-center rounded-md border border-dashed border-border text-xs text-muted-foreground", children: "No image set" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.og_image ?? "", onChange: (e) => update("og_image", e.target.value), placeholder: "https://…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-4 w-4" }), title: "Page attributes", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Layout" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: row.layout, onValueChange: (v) => update("layout", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LAYOUTS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l.value, children: l.label }, l.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Left sidebar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: row.sidebar_left, onValueChange: (v) => update("sidebar_left", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SIDEBARS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Right sidebar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: row.sidebar_right, onValueChange: (v) => update("sidebar_right", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SIDEBARS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
            ] })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
function SidebarCard({
  icon,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: [
      icon,
      title
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children })
  ] });
}
function DraftIndicator({
  status,
  savedAt
}) {
  if (status === "idle") return null;
  const label = status === "saving" ? "Saving draft…" : status === "error" ? "Draft save failed" : savedAt ? `Draft saved · ${new Date(savedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}` : "Draft saved";
  const Icon = status === "error" ? CloudOff : Cloud;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex", title: "Autosaved locally in your browser", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-3 w-3 ${status === "saving" ? "animate-pulse" : ""}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
  ] });
}
function TagsInput({
  value,
  onChange
}) {
  const [text, setText] = reactExports.useState(value.join(", "));
  const lastExternal = reactExports.useRef(value.join(", "));
  reactExports.useEffect(() => {
    const joined = value.join(", ");
    if (joined !== lastExternal.current) {
      lastExternal.current = joined;
      setText(joined);
    }
  }, [value]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: text, onChange: (e) => {
    const v = e.target.value;
    setText(v);
    const tags = v.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
    lastExternal.current = tags.join(", ");
    onChange(tags);
  }, placeholder: "chat, india, free" });
}
function sameDraft(a, b) {
  const keys = ["slug", "title", "content", "excerpt", "tags", "status", "featured", "layout", "sidebar_left", "sidebar_right", "meta_title", "meta_description", "meta_keywords", "og_title", "og_description", "og_image", "canonical_url", "noindex", "nofollow"];
  for (const k of keys) {
    const av = a?.[k];
    const bv = b?.[k];
    if (Array.isArray(av) || Array.isArray(bv)) {
      if (JSON.stringify(av ?? []) !== JSON.stringify(bv ?? [])) return false;
    } else if ((av ?? "") !== (bv ?? "")) {
      return false;
    }
  }
  return true;
}
export {
  PageEditorGate as component
};
