import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBrand, BRAND_DEFAULTS } from "@/lib/branding";
import { useAppSettings } from "@/lib/app-settings";
import {
  CheckCircle2, AlertTriangle, XCircle, Download, FileJson, FileText,
  Printer, ShieldCheck, RefreshCw, ExternalLink, Search,
} from "lucide-react";

export const Route = createFileRoute("/admin/branding-check")({
  component: BrandingCheckPage,
});

type Status = "pass" | "warn" | "fail";
interface Check {
  id: string;
  label: string;
  status: Status;
  message?: string;
  configureTo?: string;
}
interface Section {
  key: string;
  title: string;
  checks: Check[];
}

const PLACEHOLDER_TERMS = ["Palrgo", "BooBubble", "Lovable", "Community"];
const APPEARANCE = "/admin/appearance";
const GENERAL = "/admin/general";
const SEO = "/admin/seo";
const EMAIL = "/admin/email";
const PAGES = "/admin/pages";

function isSet(v: unknown): boolean {
  if (typeof v !== "string") return !!v;
  const s = v.trim();
  if (!s) return false;
  return true;
}
function isDefault(v: string | undefined, def: string | undefined): boolean {
  if (!v || !def) return false;
  return v.trim() === def.trim();
}
function ok(id: string, label: string, extra?: Partial<Check>): Check {
  return { id, label, status: "pass", ...extra };
}
function warn(id: string, label: string, message: string, configureTo?: string): Check {
  return { id, label, status: "warn", message, configureTo };
}
function fail(id: string, label: string, message: string, configureTo?: string): Check {
  return { id, label, status: "fail", message, configureTo };
}

function checkString(
  id: string, label: string, value: string | undefined, configureTo: string,
  opts: { defaultValue?: string; required?: boolean } = {},
): Check {
  const v = (value ?? "").trim();
  if (!v) {
    return opts.required
      ? fail(id, label, "Missing", configureTo)
      : warn(id, label, "Not configured", configureTo);
  }
  if (opts.defaultValue && isDefault(v, opts.defaultValue)) {
    return warn(id, label, `Still using default ("${v}")`, configureTo);
  }
  for (const term of PLACEHOLDER_TERMS) {
    if (v.toLowerCase().includes(term.toLowerCase())) {
      return warn(id, label, `Contains placeholder "${term}"`, configureTo);
    }
  }
  return ok(id, label, { message: v });
}

function checkAsset(id: string, label: string, value: string | undefined, configureTo: string, required = false): Check {
  const v = (value ?? "").trim();
  if (!v) return required ? fail(id, label, "Missing", configureTo) : warn(id, label, "Not configured", configureTo);
  return ok(id, label, { message: v.length > 60 ? v.slice(0, 60) + "…" : v });
}

function BrandingCheckPage() {
  const brand = useBrand();
  const { raw, ready } = useAppSettings();
  const [uiScan, setUiScan] = useState<{ term: string; count: number; samples: string[] }[] | null>(null);
  const [scanning, setScanning] = useState(false);

  const sections: Section[] = useMemo(() => {
    const wl: any = raw?.whitelabel ?? {};
    const general: any = raw?.general ?? {};
    const branding: any = raw?.branding ?? {};
    const emailCfg: any = raw?.email ?? {};

    const general_: Section = {
      key: "general", title: "General",
      checks: [
        checkString("name", "Platform Name", brand.name, GENERAL, { defaultValue: BRAND_DEFAULTS.name, required: true }),
        checkString("shortName", "Short Name", brand.shortName, APPEARANCE, { defaultValue: BRAND_DEFAULTS.shortName }),
        checkString("tagline", "Tagline", brand.tagline, GENERAL, { defaultValue: BRAND_DEFAULTS.tagline }),
        checkString("company", "Company", brand.company, APPEARANCE, { defaultValue: BRAND_DEFAULTS.company }),
        checkString("supportEmail", "Support Email", brand.supportEmail, APPEARANCE, { defaultValue: BRAND_DEFAULTS.supportEmail, required: true }),
        checkString("supportUrl", "Support Website", brand.supportUrl, APPEARANCE),
      ],
    };

    const assets: Section = {
      key: "assets", title: "Assets",
      checks: [
        checkAsset("logoLight", "Logo (Light)", brand.logoLight, APPEARANCE, true),
        checkAsset("logoDark", "Logo (Dark)", brand.logoDark, APPEARANCE),
        checkAsset("loginLogo", "Login Logo", wl.loginLogo || brand.logo, APPEARANCE),
        checkAsset("footerLogo", "Footer Logo", wl.footerLogo || brand.logo, APPEARANCE),
        checkAsset("favicon", "Favicon", branding.favicon_light, APPEARANCE, true),
        checkAsset("appleTouchIcon", "Apple Touch Icon", brand.appleTouchIcon, APPEARANCE),
        checkAsset("pwaIcons", "PWA Icons", brand.logoLight || branding.favicon_light, APPEARANCE, true),
        checkAsset("ogImage", "OG Image", brand.ogImage, APPEARANCE),
      ],
    };

    const seo: Section = {
      key: "seo", title: "SEO",
      checks: [
        checkString("metaTitle", "Meta Title", brand.metaTitle, SEO, { defaultValue: BRAND_DEFAULTS.metaTitle, required: true }),
        checkString("metaDescription", "Meta Description", brand.metaDescription, SEO, { defaultValue: BRAND_DEFAULTS.metaDescription, required: true }),
        checkString("metaKeywords", "Meta Keywords", brand.metaKeywords, SEO, { defaultValue: BRAND_DEFAULTS.metaKeywords }),
        (typeof document !== "undefined" && document.querySelector('link[rel="canonical"]'))
          ? ok("canonical", "Canonical")
          : warn("canonical", "Canonical", "No <link rel=canonical> found on current page", SEO),
        (typeof document !== "undefined" && document.querySelector('script[type="application/ld+json"]'))
          ? ok("jsonld", "JSON-LD")
          : warn("jsonld", "JSON-LD", "No structured data on current page", SEO),
        (typeof document !== "undefined" && document.querySelector('meta[property="og:title"]'))
          ? ok("og", "OpenGraph")
          : warn("og", "OpenGraph", "og:title tag missing", SEO),
        (typeof document !== "undefined" && document.querySelector('meta[name="twitter:card"], meta[name="twitter:title"]'))
          ? ok("twitter", "Twitter Card")
          : warn("twitter", "Twitter Card", "Twitter meta missing", SEO),
        (typeof document !== "undefined" && document.querySelector('link[rel="manifest"]'))
          ? ok("manifest", "Manifest")
          : warn("manifest", "Manifest", "No <link rel=manifest> reference", APPEARANCE),
      ],
    };

    const email: Section = {
      key: "email", title: "Email",
      checks: [
        checkString("senderName", "Sender Name", brand.senderName, EMAIL, { defaultValue: BRAND_DEFAULTS.senderName, required: true }),
        checkString("replyTo", "Reply-To", brand.replyTo || emailCfg.reply_to, EMAIL),
        checkString("footer", "Email Footer", brand.footerText || emailCfg.footer, EMAIL),
        checkAsset("emailLogo", "Email Logo", emailCfg.logo || brand.logoLight, EMAIL),
      ],
    };

    const pwa: Section = {
      key: "pwa", title: "PWA",
      checks: [
        checkString("pwaName", "App Name", brand.name, APPEARANCE, { defaultValue: BRAND_DEFAULTS.name, required: true }),
        checkAsset("pwaIcons2", "Icons", brand.logoLight || branding.favicon_light, APPEARANCE, true),
        (/^#[0-9a-f]{3,8}$/i.test(brand.themeColor)) ? ok("themeColor", "Theme Color", { message: brand.themeColor }) : warn("themeColor", "Theme Color", "Not set or invalid", APPEARANCE),
        checkAsset("splash", "Splash", wl.splashImage || brand.ogImage, APPEARANCE),
      ],
    };

    const legal: Section = {
      key: "legal", title: "Legal",
      checks: [
        checkString("privacy", "Privacy", brand.privacyUrl, PAGES, { defaultValue: BRAND_DEFAULTS.privacyUrl, required: true }),
        checkString("terms", "Terms", brand.termsUrl, PAGES, { defaultValue: BRAND_DEFAULTS.termsUrl, required: true }),
        checkString("cookies", "Cookies", wl.cookiesUrl, PAGES),
        checkString("refund", "Refund", wl.refundUrl, PAGES),
        checkString("contact", "Contact", wl.contactUrl || brand.supportUrl, PAGES),
      ],
    };

    const uiScanChecks: Check[] = uiScan
      ? uiScan.map((r) =>
          r.count === 0
            ? ok(`ui-${r.term}`, r.term)
            : warn(`ui-${r.term}`, r.term, `${r.count} occurrence(s): ${r.samples.slice(0, 2).join(" · ")}`, APPEARANCE),
        )
      : [warn("ui-scan", "UI Scan", "Not run yet — click Scan Visible UI", APPEARANCE)];

    const ui: Section = { key: "ui", title: "UI Scan", checks: uiScanChecks };

    return [general_, assets, seo, email, pwa, legal, ui];
  }, [brand, raw, uiScan]);

  const totals = useMemo(() => {
    const all = sections.flatMap((s) => s.checks);
    const pass = all.filter((c) => c.status === "pass").length;
    const warn = all.filter((c) => c.status === "warn").length;
    const fail = all.filter((c) => c.status === "fail").length;
    const total = all.length;
    // Fail counts 0, warn counts 0.5, pass counts 1.
    const score = total === 0 ? 0 : Math.round(((pass + warn * 0.5) / total) * 100);
    return { pass, warn, fail, total, score };
  }, [sections]);

  const ready100 = totals.fail === 0 && totals.warn === 0;

  function runUiScan() {
    setScanning(true);
    try {
      const bodyText = document.body?.innerText ?? "";
      const results = PLACEHOLDER_TERMS.map((term) => {
        const re = new RegExp(term, "gi");
        const matches = bodyText.match(re) ?? [];
        // Build sample snippets
        const samples: string[] = [];
        let m: RegExpExecArray | null;
        const finder = new RegExp(term, "gi");
        while ((m = finder.exec(bodyText)) && samples.length < 3) {
          const start = Math.max(0, m.index - 20);
          const end = Math.min(bodyText.length, m.index + term.length + 20);
          samples.push("…" + bodyText.slice(start, end).replace(/\s+/g, " ").trim() + "…");
        }
        return { term, count: matches.length, samples };
      });
      setUiScan(results);
    } finally {
      setScanning(false);
    }
  }

  function buildReport() {
    return {
      generatedAt: new Date().toISOString(),
      brand: {
        name: brand.name,
        company: brand.company,
      },
      score: totals.score,
      totals,
      sections: sections.map((s) => ({
        title: s.title,
        checks: s.checks.map((c) => ({ id: c.id, label: c.label, status: c.status, message: c.message ?? "" })),
      })),
    };
  }

  function download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
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
    return (
      <div>
        <AdminPageHeader title="White Label Checker" description="Loading settings…" />
      </div>
    );
  }

  return (
    <div className="print:bg-white">
      <AdminPageHeader
        title="White Label Checker"
        description="Read-only audit of branding, assets, SEO, PWA, email and legal configuration."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={runUiScan} disabled={scanning}>
              <Search className="mr-2 h-4 w-4" />{scanning ? "Scanning…" : "Scan Visible UI"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportJSON}><FileJson className="mr-2 h-4 w-4" />JSON</Button>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-2 h-4 w-4" />CSV</Button>
            <Button variant="outline" size="sm" onClick={exportPDF}><Printer className="mr-2 h-4 w-4" />PDF</Button>
            <Button variant="outline" size="sm" onClick={() => setUiScan(null)}><RefreshCw className="mr-2 h-4 w-4" />Reset</Button>
          </>
        }
      />

      {/* Final status card */}
      <Card className={`mb-6 overflow-hidden border-2 ${ready100 ? "border-emerald-500/40" : totals.fail > 0 ? "border-red-500/40" : "border-amber-500/40"}`}>
        <CardContent className="p-0">
          <div className={`p-6 sm:p-8 ${ready100 ? "bg-emerald-500/5" : totals.fail > 0 ? "bg-red-500/5" : "bg-amber-500/5"}`}>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${ready100 ? "bg-emerald-500/15 text-emerald-500" : totals.fail > 0 ? "bg-red-500/15 text-red-500" : "bg-amber-500/15 text-amber-500"}`}>
                  {ready100 ? <ShieldCheck className="h-8 w-8" /> : totals.fail > 0 ? <XCircle className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Branding Score</div>
                  <div className="text-3xl font-bold tracking-tight sm:text-4xl">{totals.score}%</div>
                  <div className="mt-1 text-sm font-medium">
                    {ready100 ? "✔ White Label Ready" : totals.fail > 0 ? "❌ Configuration Incomplete" : "⚠ Configuration Incomplete"}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" />{totals.pass} pass
                </Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="mr-1 h-3 w-3" />{totals.warn} warn
                </Badge>
                <Badge variant="outline" className="border-red-500/40 text-red-600 dark:text-red-400">
                  <XCircle className="mr-1 h-3 w-3" />{totals.fail} fail
                </Badge>
                <Badge variant="outline">{totals.total} total</Badge>
              </div>
            </div>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${ready100 ? "bg-emerald-500" : totals.fail > 0 ? "bg-red-500" : "bg-amber-500"}`}
                style={{ width: `${totals.score}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.key} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <SectionSummary checks={s.checks} />
              </div>
              <ul className="divide-y divide-border/60">
                {s.checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 px-4 py-3">
                    <StatusIcon status={c.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">{c.label}</div>
                        {c.status !== "pass" && c.configureTo && (
                          <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs print:hidden">
                            <Link to={c.configureTo}>
                              Configure <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                      {c.message && (
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">{c.message}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        This tool is read-only. It never modifies settings. Use the Configure shortcuts to jump to the relevant admin screen.
      </p>
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "pass") return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />;
  if (status === "warn") return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />;
  return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />;
}

function SectionSummary({ checks }: { checks: Check[] }) {
  const pass = checks.filter((c) => c.status === "pass").length;
  return (
    <div className="text-xs text-muted-foreground">
      {pass}/{checks.length}
    </div>
  );
}
