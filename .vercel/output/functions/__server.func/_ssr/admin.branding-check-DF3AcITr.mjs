import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { aW as useBrand, u as useAppSettings, aJ as AdminPageHeader, B as Button, ae as Card, af as CardContent, aX as BRAND_DEFAULTS } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { N as Search, bQ as FileBraces, aI as Download, bT as Printer, bd as RefreshCw, au as ShieldCheck, bB as CircleX, T as TriangleAlert, bz as CircleCheck, ax as ExternalLink } from "../_libs/lucide-react.mjs";
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
const PLACEHOLDER_TERMS = ["Palrgo", "BooBubble", "Lovable", "Community"];
const APPEARANCE = "/admin/appearance";
const GENERAL = "/admin/general";
const SEO = "/admin/seo";
const EMAIL = "/admin/email";
const PAGES = "/admin/pages";
function isDefault(v, def) {
  if (!v || !def) return false;
  return v.trim() === def.trim();
}
function ok(id, label, extra) {
  return {
    id,
    label,
    status: "pass",
    ...extra
  };
}
function warn(id, label, message, configureTo) {
  return {
    id,
    label,
    status: "warn",
    message,
    configureTo
  };
}
function fail(id, label, message, configureTo) {
  return {
    id,
    label,
    status: "fail",
    message,
    configureTo
  };
}
function checkString(id, label, value, configureTo, opts = {}) {
  const v = (value ?? "").trim();
  if (!v) {
    return opts.required ? fail(id, label, "Missing", configureTo) : warn(id, label, "Not configured", configureTo);
  }
  if (opts.defaultValue && isDefault(v, opts.defaultValue)) {
    return warn(id, label, `Still using default ("${v}")`, configureTo);
  }
  for (const term of PLACEHOLDER_TERMS) {
    if (v.toLowerCase().includes(term.toLowerCase())) {
      return warn(id, label, `Contains placeholder "${term}"`, configureTo);
    }
  }
  return ok(id, label, {
    message: v
  });
}
function checkAsset(id, label, value, configureTo, required = false) {
  const v = (value ?? "").trim();
  if (!v) return required ? fail(id, label, "Missing", configureTo) : warn(id, label, "Not configured", configureTo);
  return ok(id, label, {
    message: v.length > 60 ? v.slice(0, 60) + "…" : v
  });
}
function BrandingCheckPage() {
  const brand = useBrand();
  const {
    raw,
    ready
  } = useAppSettings();
  const [uiScan, setUiScan] = reactExports.useState(null);
  const [scanning, setScanning] = reactExports.useState(false);
  const sections = reactExports.useMemo(() => {
    const wl = raw?.whitelabel ?? {};
    raw?.general ?? {};
    const branding = raw?.branding ?? {};
    const emailCfg = raw?.email ?? {};
    const general_ = {
      key: "general",
      title: "General",
      checks: [checkString("name", "Platform Name", brand.name, GENERAL, {
        defaultValue: BRAND_DEFAULTS.name,
        required: true
      }), checkString("shortName", "Short Name", brand.shortName, APPEARANCE, {
        defaultValue: BRAND_DEFAULTS.shortName
      }), checkString("tagline", "Tagline", brand.tagline, GENERAL, {
        defaultValue: BRAND_DEFAULTS.tagline
      }), checkString("company", "Company", brand.company, APPEARANCE, {
        defaultValue: BRAND_DEFAULTS.company
      }), checkString("supportEmail", "Support Email", brand.supportEmail, APPEARANCE, {
        defaultValue: BRAND_DEFAULTS.supportEmail,
        required: true
      }), checkString("supportUrl", "Support Website", brand.supportUrl, APPEARANCE)]
    };
    const assets = {
      key: "assets",
      title: "Assets",
      checks: [checkAsset("logoLight", "Logo (Light)", brand.logoLight, APPEARANCE, true), checkAsset("logoDark", "Logo (Dark)", brand.logoDark, APPEARANCE), checkAsset("loginLogo", "Login Logo", wl.loginLogo || brand.logo, APPEARANCE), checkAsset("footerLogo", "Footer Logo", wl.footerLogo || brand.logo, APPEARANCE), checkAsset("favicon", "Favicon", branding.favicon_light, APPEARANCE, true), checkAsset("appleTouchIcon", "Apple Touch Icon", brand.appleTouchIcon, APPEARANCE), checkAsset("pwaIcons", "PWA Icons", brand.logoLight || branding.favicon_light, APPEARANCE, true), checkAsset("ogImage", "OG Image", brand.ogImage, APPEARANCE)]
    };
    const seo = {
      key: "seo",
      title: "SEO",
      checks: [checkString("metaTitle", "Meta Title", brand.metaTitle, SEO, {
        defaultValue: BRAND_DEFAULTS.metaTitle,
        required: true
      }), checkString("metaDescription", "Meta Description", brand.metaDescription, SEO, {
        defaultValue: BRAND_DEFAULTS.metaDescription,
        required: true
      }), checkString("metaKeywords", "Meta Keywords", brand.metaKeywords, SEO, {
        defaultValue: BRAND_DEFAULTS.metaKeywords
      }), typeof document !== "undefined" && document.querySelector('link[rel="canonical"]') ? ok("canonical", "Canonical") : warn("canonical", "Canonical", "No <link rel=canonical> found on current page", SEO), typeof document !== "undefined" && document.querySelector('script[type="application/ld+json"]') ? ok("jsonld", "JSON-LD") : warn("jsonld", "JSON-LD", "No structured data on current page", SEO), typeof document !== "undefined" && document.querySelector('meta[property="og:title"]') ? ok("og", "OpenGraph") : warn("og", "OpenGraph", "og:title tag missing", SEO), typeof document !== "undefined" && document.querySelector('meta[name="twitter:card"], meta[name="twitter:title"]') ? ok("twitter", "Twitter Card") : warn("twitter", "Twitter Card", "Twitter meta missing", SEO), typeof document !== "undefined" && document.querySelector('link[rel="manifest"]') ? ok("manifest", "Manifest") : warn("manifest", "Manifest", "No <link rel=manifest> reference", APPEARANCE)]
    };
    const email = {
      key: "email",
      title: "Email",
      checks: [checkString("senderName", "Sender Name", brand.senderName, EMAIL, {
        defaultValue: BRAND_DEFAULTS.senderName,
        required: true
      }), checkString("replyTo", "Reply-To", brand.replyTo || emailCfg.reply_to, EMAIL), checkString("footer", "Email Footer", brand.footerText || emailCfg.footer, EMAIL), checkAsset("emailLogo", "Email Logo", emailCfg.logo || brand.logoLight, EMAIL)]
    };
    const pwa = {
      key: "pwa",
      title: "PWA",
      checks: [checkString("pwaName", "App Name", brand.name, APPEARANCE, {
        defaultValue: BRAND_DEFAULTS.name,
        required: true
      }), checkAsset("pwaIcons2", "Icons", brand.logoLight || branding.favicon_light, APPEARANCE, true), /^#[0-9a-f]{3,8}$/i.test(brand.themeColor) ? ok("themeColor", "Theme Color", {
        message: brand.themeColor
      }) : warn("themeColor", "Theme Color", "Not set or invalid", APPEARANCE), checkAsset("splash", "Splash", wl.splashImage || brand.ogImage, APPEARANCE)]
    };
    const legal = {
      key: "legal",
      title: "Legal",
      checks: [checkString("privacy", "Privacy", brand.privacyUrl, PAGES, {
        defaultValue: BRAND_DEFAULTS.privacyUrl,
        required: true
      }), checkString("terms", "Terms", brand.termsUrl, PAGES, {
        defaultValue: BRAND_DEFAULTS.termsUrl,
        required: true
      }), checkString("cookies", "Cookies", wl.cookiesUrl, PAGES), checkString("refund", "Refund", wl.refundUrl, PAGES), checkString("contact", "Contact", wl.contactUrl || brand.supportUrl, PAGES)]
    };
    const uiScanChecks = uiScan ? uiScan.map((r) => r.count === 0 ? ok(`ui-${r.term}`, r.term) : warn(`ui-${r.term}`, r.term, `${r.count} occurrence(s): ${r.samples.slice(0, 2).join(" · ")}`, APPEARANCE)) : [warn("ui-scan", "UI Scan", "Not run yet — click Scan Visible UI", APPEARANCE)];
    const ui = {
      key: "ui",
      title: "UI Scan",
      checks: uiScanChecks
    };
    return [general_, assets, seo, email, pwa, legal, ui];
  }, [brand, raw, uiScan]);
  const totals = reactExports.useMemo(() => {
    const all = sections.flatMap((s) => s.checks);
    const pass = all.filter((c) => c.status === "pass").length;
    const warn2 = all.filter((c) => c.status === "warn").length;
    const fail2 = all.filter((c) => c.status === "fail").length;
    const total = all.length;
    const score = total === 0 ? 0 : Math.round((pass + warn2 * 0.5) / total * 100);
    return {
      pass,
      warn: warn2,
      fail: fail2,
      total,
      score
    };
  }, [sections]);
  const ready100 = totals.fail === 0 && totals.warn === 0;
  function runUiScan() {
    setScanning(true);
    try {
      const bodyText = document.body?.innerText ?? "";
      const results = PLACEHOLDER_TERMS.map((term) => {
        const re = new RegExp(term, "gi");
        const matches = bodyText.match(re) ?? [];
        const samples = [];
        let m;
        const finder = new RegExp(term, "gi");
        while ((m = finder.exec(bodyText)) && samples.length < 3) {
          const start = Math.max(0, m.index - 20);
          const end = Math.min(bodyText.length, m.index + term.length + 20);
          samples.push("…" + bodyText.slice(start, end).replace(/\s+/g, " ").trim() + "…");
        }
        return {
          term,
          count: matches.length,
          samples
        };
      });
      setUiScan(results);
    } finally {
      setScanning(false);
    }
  }
  function buildReport() {
    return {
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      brand: {
        name: brand.name,
        company: brand.company
      },
      score: totals.score,
      totals,
      sections: sections.map((s) => ({
        title: s.title,
        checks: s.checks.map((c) => ({
          id: c.id,
          label: c.label,
          status: c.status,
          message: c.message ?? ""
        }))
      }))
    };
  }
  function download(filename, content, mime) {
    const blob = new Blob([content], {
      type: mime
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  function exportJSON() {
    download("white-label-report.json", JSON.stringify(buildReport(), null, 2), "application/json");
  }
  function exportCSV() {
    const rows = [["Section", "Check", "Status", "Message"]];
    for (const s of sections) for (const c of s.checks) rows.push([s.title, c.label, c.status, c.message ?? ""]);
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    download("white-label-report.csv", csv, "text/csv");
  }
  function exportPDF() {
    window.print();
  }
  if (!ready) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "White Label Checker", description: "Loading settings…" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print:bg-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "White Label Checker", description: "Read-only audit of branding, assets, SEO, PWA, email and legal configuration.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: runUiScan, disabled: scanning, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4" }),
        scanning ? "Scanning…" : "Scan Visible UI"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: exportJSON, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileBraces, { className: "mr-2 h-4 w-4" }),
        "JSON"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: exportCSV, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
        "CSV"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: exportPDF, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "mr-2 h-4 w-4" }),
        "PDF"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setUiScan(null), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
        "Reset"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `mb-6 overflow-hidden border-2 ${ready100 ? "border-emerald-500/40" : totals.fail > 0 ? "border-red-500/40" : "border-amber-500/40"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-6 sm:p-8 ${ready100 ? "bg-emerald-500/5" : totals.fail > 0 ? "bg-red-500/5" : "bg-amber-500/5"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-16 w-16 items-center justify-center rounded-2xl ${ready100 ? "bg-emerald-500/15 text-emerald-500" : totals.fail > 0 ? "bg-red-500/15 text-red-500" : "bg-amber-500/15 text-amber-500"}`, children: ready100 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-8 w-8" }) : totals.fail > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-8 w-8" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: "Branding Score" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-bold tracking-tight sm:text-4xl", children: [
              totals.score,
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm font-medium", children: ready100 ? "✔ White Label Ready" : totals.fail > 0 ? "❌ Configuration Incomplete" : "⚠ Configuration Incomplete" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-1 h-3 w-3" }),
            totals.pass,
            " pass"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-amber-500/40 text-amber-600 dark:text-amber-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mr-1 h-3 w-3" }),
            totals.warn,
            " warn"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-red-500/40 text-red-600 dark:text-red-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "mr-1 h-3 w-3" }),
            totals.fail,
            " fail"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            totals.total,
            " total"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 h-2 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full transition-all ${ready100 ? "bg-emerald-500" : totals.fail > 0 ? "bg-red-500" : "bg-amber-500"}`, style: {
        width: `${totals.score}%`
      } }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 lg:grid-cols-2", children: sections.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border/60 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: s.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionSummary, { checks: s.checks })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border/60", children: s.checks.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { status: c.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: c.label }),
            c.status !== "pass" && c.configureTo && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "ghost", className: "h-7 px-2 text-xs print:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: c.configureTo, children: [
              "Configure ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "ml-1 h-3 w-3" })
            ] }) })
          ] }),
          c.message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: c.message })
        ] })
      ] }, c.id)) })
    ] }) }, s.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-xs text-muted-foreground", children: "This tool is read-only. It never modifies settings. Use the Configure shortcuts to jump to the relevant admin screen." })
  ] });
}
function StatusIcon({
  status
}) {
  if (status === "pass") return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-500" });
  if (status === "warn") return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-500" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "mt-0.5 h-4 w-4 shrink-0 text-red-500" });
}
function SectionSummary({
  checks
}) {
  const pass = checks.filter((c) => c.status === "pass").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
    pass,
    "/",
    checks.length
  ] });
}
export {
  BrandingCheckPage as component
};
