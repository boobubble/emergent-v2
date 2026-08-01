import type { SeoGlobal, SeoPageRow, SeoRouteDefinition } from "./types";
import {
  categorizeInventoryRoute,
  normalizeRoutePath,
  type SeoInventoryCategoryId,
} from "./inventory-categories";
import {
  lookupRouteHeadAudit,
  mergeDbPageAudit,
  type RouteHeadAudit,
  type SeoFieldState,
} from "./route-head-sources";
import { labelFromPath } from "./route-registry";

export type SeoInventoryStatus = "configured" | "partial" | "missing";

export type SeoInventoryRow = {
  id: string;
  pageName: string;
  routePattern: string;
  routePath: string;
  isDynamic: boolean;
  category: SeoInventoryCategoryId;
  seoSource: string;
  title: SeoFieldState;
  description: SeoFieldState;
  canonical: SeoFieldState;
  indexState: RouteHeadAudit["indexState"];
  jsonLd: SeoFieldState;
  status: SeoInventoryStatus;
  pageKey: string | null;
  dbEnabled: boolean | null;
};

export type SeoInventorySummary = {
  total: number;
  configured: number;
  partial: number;
  missing: number;
  static: number;
  dynamic: number;
  byCategory: Record<SeoInventoryCategoryId, number>;
};

const LABEL_OVERRIDES: Record<string, string> = {
  "/": "Home / Chatrooms Router",
  "/feed": "Feed",
  "/poetry": "Poetry Hub",
  "/competitions": "Competitions Hub",
  "/community": "Community Layout",
  "/$slug": "Static / CMS Pages",
  "/p/$slug": "Creator / Premium Pages",
  "/u/$username": "User Profiles",
  "/feed/$slug": "Feed Post",
  "/chatrooms": "Chatrooms (redirect)",
  "/mehfil": "Mehfil (redirect 뿯↽ Poetry)",
  "/settings/privacy": "Privacy Settings",
};

function fieldOk(state: SeoFieldState): boolean {
  return state === "available" || state === "dynamic";
}

function computeStatus(audit: RouteHeadAudit): SeoInventoryStatus {
  const titleOk = fieldOk(audit.title);
  const descOk = fieldOk(audit.description);
  const canonicalOk = fieldOk(audit.canonical);
  const jsonOk = fieldOk(audit.jsonLd);

  if (titleOk && descOk && canonicalOk) return "configured";
  if (titleOk && descOk && audit.indexState !== "unknown") return "configured";
  if (titleOk || descOk || canonicalOk || jsonOk) return "partial";
  if (audit.source !== "Not configured") return "partial";
  return "missing";
}

function findPageForRoute(pages: SeoPageRow[], routePath: string): SeoPageRow | undefined {
  const norm = normalizeRoutePath(routePath);
  return pages.find((p) => normalizeRoutePath(p.route_path ?? "") === norm)
    ?? pages.find((p) => p.route_path === routePath);
}

function buildRouteRow(
  routePath: string,
  catalogEntry: SeoRouteDefinition | undefined,
  pages: SeoPageRow[],
): SeoInventoryRow {
  const norm = normalizeRoutePath(routePath);
  const page = findPageForRoute(pages, norm);
  const baseAudit = lookupRouteHeadAudit(norm);
  const audit = mergeDbPageAudit(baseAudit, page);
  const isDynamic = catalogEntry?.isDynamic ?? routePath.includes("$");
  const routePattern = catalogEntry?.dynamicPattern ?? catalogEntry?.routePath ?? norm;

  return {
    id: norm,
    pageName: catalogEntry?.label ?? LABEL_OVERRIDES[norm] ?? labelFromPath(norm),
    routePattern,
    routePath: norm,
    isDynamic,
    category: categorizeInventoryRoute(norm),
    seoSource: audit.source,
    title: audit.title,
    description: audit.description,
    canonical: audit.canonical,
    indexState: audit.indexState,
    jsonLd: audit.jsonLd,
    status: computeStatus(audit),
    pageKey: page?.page_key ?? catalogEntry?.pageKey ?? null,
    dbEnabled: page?.enabled ?? null,
  };
}

function buildGlobalRow(global: SeoGlobal | null): SeoInventoryRow {
  const title = global?.default_title?.trim() ? "available" : "missing";
  const description = global?.default_description?.trim() ? "available" : "missing";
  const canonical = global?.canonical_domain?.trim() ? "available" : "missing";
  const jsonLd = "missing" as SeoFieldState;

  const audit: RouteHeadAudit = {
    source: global ? "seo_global table" : "Not configured",
    title,
    description,
    canonical,
    indexState: global?.robots?.includes("noindex") ? "noindex" : "index",
    jsonLd,
  };

  return {
    id: "__global__",
    pageName: "Global SEO Defaults",
    routePattern: "(site-wide defaults)",
    routePath: "__global__",
    isDynamic: false,
    category: "global-defaults",
    seoSource: audit.source,
    title: audit.title,
    description: audit.description,
    canonical: audit.canonical,
    indexState: audit.indexState,
    jsonLd: audit.jsonLd,
    status: computeStatus(audit),
    pageKey: null,
    dbEnabled: null,
  };
}

export function buildSeoInventory(input: {
  global: SeoGlobal | null;
  pages: SeoPageRow[];
  catalog: SeoRouteDefinition[];
  discovered: string[];
}): SeoInventoryRow[] {
  const catalogByPath = new Map<string, SeoRouteDefinition>();
  for (const entry of input.catalog) {
    catalogByPath.set(normalizeRoutePath(entry.routePath), entry);
  }

  const routePaths = new Set<string>();
  for (const path of input.discovered) {
    routePaths.add(normalizeRoutePath(path));
  }
  for (const entry of input.catalog) {
    routePaths.add(normalizeRoutePath(entry.routePath));
  }

  const rows: SeoInventoryRow[] = [buildGlobalRow(input.global)];

  for (const routePath of [...routePaths].sort((a, b) => a.localeCompare(b))) {
    if (routePath === "__global__") continue;
    rows.push(buildRouteRow(routePath, catalogByPath.get(routePath), input.pages));
  }

  return rows;
}

export function summarizeSeoInventory(rows: SeoInventoryRow[]): SeoInventorySummary {
  const routeRows = rows.filter((r) => r.id !== "__global__");
  const byCategory = {} as Record<SeoInventoryCategoryId, number>;

  for (const row of rows) {
    byCategory[row.category] = (byCategory[row.category] ?? 0) + 1;
  }

  return {
    total: routeRows.length,
    configured: routeRows.filter((r) => r.status === "configured").length,
    partial: routeRows.filter((r) => r.status === "partial").length,
    missing: routeRows.filter((r) => r.status === "missing").length,
    static: routeRows.filter((r) => !r.isDynamic).length,
    dynamic: routeRows.filter((r) => r.isDynamic).length,
    byCategory,
  };
}

export function fieldStateLabel(state: SeoFieldState): string {
  if (state === "available") return "Available";
  if (state === "dynamic") return "Dynamic";
  return "Missing";
}

export function indexStateLabel(state: RouteHeadAudit["indexState"]): string {
  if (state === "index") return "index";
  if (state === "noindex") return "noindex";
  if (state === "conditional") return "conditional";
  return "unknown";
}
