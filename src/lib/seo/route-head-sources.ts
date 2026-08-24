/** Read-only audit of how each public route supplies SEO metadata today. */

export type SeoFieldState = "available" | "missing" | "dynamic";

export type RouteHeadAudit = {
  source: string;
  title: SeoFieldState;
  description: SeoFieldState;
  canonical: SeoFieldState;
  indexState: "index" | "noindex" | "conditional" | "unknown";
  jsonLd: SeoFieldState;
};

const ROOT_FALLBACK: RouteHeadAudit = {
  source: "__root.tsx static shell defaults (DynamicBrandHead = brand chrome only)",
  title: "missing",
  description: "missing",
  canonical: "missing",
  indexState: "index",
  jsonLd: "missing",
};

const EXACT: Record<string, RouteHeadAudit> = {
  "/": {
    source: "routes/index.tsx head() via homeRouteHead",
    title: "available",
    description: "available",
    canonical: "available",
    indexState: "index",
    jsonLd: "available",
  },
  "/welcome": {
    source: "routes/welcome.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/heropage": {
    source: "routes/heropage.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/feed": {
    source: "routes/feed.index.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/chatroom": {
    source: "routes/chatroom.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/chatrooms": {
    source: "Redirect 뿯↽ /chatroom (inherits chatroom SEO)",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/confessions": {
    source: "loadRouteSeo 뿯↽ seo_settings + resolve-seo",
    title: "dynamic",
    description: "dynamic",
    canonical: "dynamic",
    indexState: "unknown",
    jsonLd: "dynamic",
  },
  "/poetry": {
    source: "loadRouteSeo 뿯↽ seo_settings + resolve-seo",
    title: "dynamic",
    description: "dynamic",
    canonical: "dynamic",
    indexState: "unknown",
    jsonLd: "dynamic",
  },
  "/games": {
    source: "loadRouteSeo 뿯↽ seo_settings + resolve-seo",
    title: "dynamic",
    description: "dynamic",
    canonical: "dynamic",
    indexState: "unknown",
    jsonLd: "dynamic",
  },
  "/battle-hub": {
    source: "loadRouteSeo 뿯↽ seo_settings + resolve-seo",
    title: "dynamic",
    description: "dynamic",
    canonical: "dynamic",
    indexState: "unknown",
    jsonLd: "dynamic",
  },
  "/hall-of-fame": {
    source: "loadRouteSeo 뿯↽ seo_settings + resolve-seo",
    title: "dynamic",
    description: "dynamic",
    canonical: "dynamic",
    indexState: "unknown",
    jsonLd: "dynamic",
  },
  "/competitions": {
    source: "routes/competitions.index.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/communities": {
    source: "routes/communities.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/find-friends": {
    source: "routes/find-friends.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/pricing": {
    source: "routes/pricing.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/trust": {
    source: "routes/trust.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/wallet": {
    source: "routes/wallet.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "noindex",
    jsonLd: "missing",
  },
  "/achievements": {
    source: "routes/achievements.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/gamification": {
    source: "routes/gamification.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/reels": {
    source: "routes/reels.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/groups": {
    source: "routes/groups.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/leaderboard": {
    source: "routes/leaderboard.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/pages": {
    source: "routes/pages.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/login": {
    source: "routes/login.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "noindex",
    jsonLd: "missing",
  },
  "/reset-password": {
    source: "routes/reset-password.tsx head() (if present) or __root",
    title: "missing",
    description: "missing",
    canonical: "missing",
    indexState: "noindex",
    jsonLd: "missing",
  },
  "/journey": {
    source: "routes/journey.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/games/ludo": {
    source: "routes/games.ludo.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/competitions/hall-of-fame": {
    source: "routes/competitions.hall-of-fame.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/competitions/leaderboard": {
    source: "routes/competitions.leaderboard.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/poetry/challenges": {
    source: "routes/poetry.challenges.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/poetry/compose": {
    source: "routes/poetry.compose.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "noindex",
    jsonLd: "missing",
  },
  "/poetry/hall-of-fame": {
    source: "routes/poetry.hall-of-fame.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/poetry/leaderboard": {
    source: "routes/poetry.leaderboard.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/feedback": {
    source: "routes/feedback.index.tsx head()",
    title: "available",
    description: "available",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
  "/mehfil": {
    source: "Redirect 뿯↽ /poetry (legacy alias)",
    title: "missing",
    description: "missing",
    canonical: "missing",
    indexState: "unknown",
    jsonLd: "missing",
  },
  "/settings/privacy": {
    source: "routes/_authenticated.settings.privacy.tsx head()",
    title: "available",
    description: "missing",
    canonical: "missing",
    indexState: "index",
    jsonLd: "missing",
  },
};

type PatternRule = { test: RegExp; audit: RouteHeadAudit };

const PATTERNS: PatternRule[] = [
  {
    test: /^\/feed\/\$slug$/,
    audit: {
      source: "routes/feed.$slug.tsx head() (loader-driven)",
      title: "dynamic",
      description: "dynamic",
      canonical: "dynamic",
      indexState: "conditional",
      jsonLd: "dynamic",
    },
  },
  {
    test: /^\/poetry\/\$slug$/,
    audit: {
      source: "routes/poetry.$slug.tsx head() (poem + seo_title fields)",
      title: "dynamic",
      description: "dynamic",
      canonical: "dynamic",
      indexState: "index",
      jsonLd: "dynamic",
    },
  },
  {
    test: /^\/poetry\/category\/\$slug$/,
    audit: {
      source: "routes/poetry.category.$slug.tsx head()",
      title: "dynamic",
      description: "dynamic",
      canonical: "missing",
      indexState: "index",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/competitions\/\$slug$/,
    audit: {
      source: "routes/competitions.$slug.tsx head() (competition loader)",
      title: "dynamic",
      description: "dynamic",
      canonical: "dynamic",
      indexState: "index",
      jsonLd: "dynamic",
    },
  },
  {
    test: /^\/competitions\/\$slug\/memes$/,
    audit: {
      source: "routes/competitions.$slug.memes.tsx head()",
      title: "dynamic",
      description: "dynamic",
      canonical: "missing",
      indexState: "index",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/competitions\/\$slug\/recap$/,
    audit: {
      source: "routes/competitions.$slug.recap.tsx head()",
      title: "dynamic",
      description: "dynamic",
      canonical: "missing",
      indexState: "index",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/competitions\/\$slug\/fun\/\$type$/,
    audit: {
      source: "routes/competitions.$slug.fun.$type.tsx head()",
      title: "dynamic",
      description: "dynamic",
      canonical: "missing",
      indexState: "index",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/community\/\$slug\/dashboard$/,
    audit: {
      source: "routes/community.$slug.dashboard.tsx head()",
      title: "available",
      description: "missing",
      canonical: "missing",
      indexState: "noindex",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/community\/\$slug\/chatrooms/,
    audit: {
      source: "Community chatroom routes (no dedicated head)",
      title: "missing",
      description: "missing",
      canonical: "missing",
      indexState: "unknown",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/community\/\$slug\/(feed|members|competitions)$/,
    audit: {
      source: "Community sub-route (inherits parent / __root)",
      title: "missing",
      description: "missing",
      canonical: "missing",
      indexState: "unknown",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/community\/\$slug\/?$/,
    audit: {
      source: "routes/community.$slug.tsx head() (community loader)",
      title: "dynamic",
      description: "dynamic",
      canonical: "dynamic",
      indexState: "conditional",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/\$slug$/,
    audit: {
      source: "routes/$slug.tsx head() (CMS pages table)",
      title: "dynamic",
      description: "dynamic",
      canonical: "dynamic",
      indexState: "conditional",
      jsonLd: "dynamic",
    },
  },
  {
    test: /^\/p\/\$slug$/,
    audit: {
      source: "routes/p.$slug.tsx (creator page — no route head() found)",
      title: "missing",
      description: "missing",
      canonical: "missing",
      indexState: "unknown",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/u\/\$username$/,
    audit: {
      source: "routes/u.$username.tsx redirect 뿯↽ /feed?u= (no dedicated SEO head)",
      title: "missing",
      description: "missing",
      canonical: "missing",
      indexState: "unknown",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/invite\/\$code$/,
    audit: {
      source: "routes/invite.$code.tsx head()",
      title: "dynamic",
      description: "dynamic",
      canonical: "missing",
      indexState: "noindex",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/feedback\/\$id$/,
    audit: {
      source: "routes/feedback.$id.tsx head()",
      title: "available",
      description: "available",
      canonical: "missing",
      indexState: "index",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/mehfil/,
    audit: {
      source: "Legacy Mehfil routes (redirect or no head)",
      title: "missing",
      description: "missing",
      canonical: "missing",
      indexState: "unknown",
      jsonLd: "missing",
    },
  },
  {
    test: /^\/pages-editor/,
    audit: {
      source: "Editor route (typically auth-gated)",
      title: "missing",
      description: "missing",
      canonical: "missing",
      indexState: "noindex",
      jsonLd: "missing",
    },
  },
];

export function lookupRouteHeadAudit(routePath: string): RouteHeadAudit {
  const normalized = routePath === "/" ? "/" : routePath.replace(/\/+$/, "") || "/";
  const exact = EXACT[normalized];
  if (exact) return exact;

  for (const { test, audit } of PATTERNS) {
    if (test.test(normalized)) return audit;
  }

  return {
    source: "Not configured",
    title: "missing",
    description: "missing",
    canonical: "missing",
    indexState: "unknown",
    jsonLd: "missing",
  };
}

export function mergeDbPageAudit(
  audit: RouteHeadAudit,
  page: {
    enabled?: boolean;
    title?: string | null;
    description?: string | null;
    canonical_url?: string | null;
    json_ld?: Record<string, unknown> | null;
    noindex?: boolean;
  } | null | undefined,
): RouteHeadAudit {
  if (!page) return audit;

  const hasDbTitle = !!page.title?.trim();
  const hasDbDesc = !!page.description?.trim();
  const hasDbCanonical = !!page.canonical_url?.trim();
  const hasDbJsonLd = !!page.json_ld && Object.keys(page.json_ld).length > 0;

  const source =
    audit.source === "Not configured"
      ? "seo_settings table"
      : `${audit.source} + seo_settings`;

  return {
    source,
    title: hasDbTitle ? "available" : audit.title,
    description: hasDbDesc ? "available" : audit.description,
    canonical: hasDbCanonical ? "available" : audit.canonical,
    indexState: page.noindex ? "noindex" : audit.indexState === "unknown" && page.enabled ? "index" : audit.indexState,
    jsonLd: hasDbJsonLd ? "available" : audit.jsonLd,
  };
}

export { ROOT_FALLBACK };
