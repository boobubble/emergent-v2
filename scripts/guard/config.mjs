/**
 * Yaarzo module guardrails — machine-readable source of truth.
 * Humans: see docs/DEVELOPMENT-GUARDRAILS.md
 */

export const PRODUCTION_ORIGIN = "https://yaarzo.com";

/** Known-good production baseline after P0 CMS/blog SSR recovery. */
export const BASELINE = {
  commit: "82bdd7fe",
  guardrailsCommit: "b0809284",
  capturedAt: "2026-08-27",
  sitemap: {
    total: 35,
    http200: 35,
    http3xx: 0,
    http404: 0,
    http5xx: 0,
  },
  routes: {
    homepage: 200,
    feed: 200,
    chatroom: 200,
    communities: 200,
    competitions: 200,
    poetry: 200,
    blog: 200,
    "blog/yahoo": 200,
    unknownRootSlug: 404,
    "llms.txt": 404,
  },
};

/** Trailing-slash /blog is a framework 307; canonical public URL is /blog. */
export const KNOWN_REDIRECTS = {
  "/blog/": { status: 307, location: "/blog", reason: "trailing-slash normalize to /blog" },
};

export const GOLDEN_APP = [
  "/",
  "/feed",
  "/chatroom",
  "/communities",
  "/competitions",
  "/poetry",
];

export const GOLDEN_CMS = [
  "/india-chat-room",
  "/pakistan-chat-room",
  "/lahore-chat-room",
  "/teen-chat-room",
  "/chat-rooms-without-registration-2026",
  "/about-us",
  "/contact-us",
  "/privacy-policy",
  "/terms-conditions",
];

export const GOLDEN_BLOG = ["/blog", "/blog/yahoo"];

export const GOLDEN_NEGATIVE = [
  { path: "/__yaarzo-nonexistent-route-test__", status: 404 },
  { path: "/llms.txt", status: 404 },
];

export const GOLDEN_ALL = [...GOLDEN_APP, ...GOLDEN_CMS, ...GOLDEN_BLOG];

export const MODULE_GOLDEN = {
  homepage: ["/", "/__yaarzo-nonexistent-route-test__"],
  cms: [...GOLDEN_CMS, "/__yaarzo-nonexistent-route-test__"],
  blog: [...GOLDEN_BLOG, "/__yaarzo-nonexistent-route-test__"],
  feed: ["/", "/feed"],
  chatroom: ["/", "/chatroom"],
  communities: ["/", "/communities"],
  poetry: ["/", "/poetry"],
  auth: ["/", "/login"],
  all: GOLDEN_ALL,
};

/**
 * Exclusive path prefixes/files owned by a module.
 * Shared/core files are NOT listed here — they are PROTECTED instead.
 */
export const MODULES = {
  homepage: {
    id: "homepage",
    label: "HOMEPAGE",
    paths: [
      "src/routes/index.tsx",
      "src/components/home/",
      "src/routes/api/public/landing.ts",
      "src/lib/landing-live.ts",
      "src/lib/landing-live.server.ts",
      "src/lib/landing-payload.ts",
      "src/lib/landing-config.ts",
      "src/lib/landing-path.ts",
      "src/lib/landing-live.test.ts",
      "src/lib/landing-path.test.ts",
      "src/lib/guest-home-bundle.test.ts",
      "src/lib/use-home-page-mode.ts",
      "src/lib/seo/home-page.ts",
      "src/lib/seo/home-page.test.ts",
      "src/lib/seo/alternate-homepage.ts",
      "src/lib/seo/alternate-homepage.test.ts",
      "src/__tests__/welcome-theme.test.tsx",
      "src/__tests__/welcome-redirect.test.ts",
    ],
    tests: [
      "src/lib/guest-home-bundle.test.ts",
      "src/lib/landing-live.test.ts",
      "src/lib/landing-path.test.ts",
      "src/lib/seo/home-page.test.ts",
      "src/lib/seo/alternate-homepage.test.ts",
      "src/components/home/HomeGuestShell.test.tsx",
      "src/components/home/HomeSeoContent.test.tsx",
      "src/components/home/welcome-primitives.test.tsx",
      "src/__tests__/welcome-theme.test.tsx",
      "src/lib/desktop-app-layout.test.ts",
    ],
  },
  cms: {
    id: "cms",
    label: "CUSTOM_PAGES",
    paths: [
      "src/routes/$slug.tsx",
      "src/components/PublicCmsPageView.tsx",
      "src/components/PublicCmsPageView.ssr.test.tsx",
      "src/lib/fetch-published-page.ts",
      "src/lib/public-cms-route.ts",
      "src/lib/pages.functions.ts",
      "src/lib/pages-cms/",
      "src/lib/tiptap-html-source.ts",
      "src/lib/tiptap-html-source.test.ts",
      "src/lib/cta-button.ts",
      "src/lib/cta-button.css",
      "src/lib/cta-button.test.ts",
      "src/components/admin/CtaButtonDialog.tsx",
      "src/lib/page-slug.ts",
      "src/lib/custom-page-cache.ts",
      "src/lib/cms-footer.test.ts",
      "src/lib/content-image-seo.ts",
      "src/lib/content-image-seo.test.ts",
      "src/lib/content-image-optimize.ts",
      "src/lib/page-content-paste.ts",
      "src/lib/sanitize-html-fallback.ts",
      "src/lib/page-cta.ts",
      "src/lib/page-cta.test.ts",
      "src/components/content-images/",
      "src/components/admin/RichTextEditor.tsx",
      "src/routes/admin.pages.all.tsx",
      "src/routes/pages-editor.$id.tsx",
      "src/lib/content-automation/",
      "src/routes/admin.content-automation.tsx",
      "src/routes/api/run-static-publish.ts",
    ],
    tests: [
      "src/lib/public-cms-route.test.ts",
      "src/lib/seo/not-found.test.ts",
      "src/lib/seo/custom-page-title.test.ts",
      "src/lib/pages-cms/public-page-ssr.test.ts",
      "src/lib/pages-cms/public-links.test.ts",
      "src/lib/pages-cms/cms-image-status.test.ts",
      "src/lib/pages-cms/cms-image-placement.test.ts",
      "src/lib/pages-cms/cms-image-insert-pos.test.ts",
      "src/lib/pages-cms/tiptap-html-blocks.test.ts",
      "src/lib/pages-cms/anchor-label.test.ts",
      "src/lib/pages-cms/coherent-titles.test.ts",
      "src/lib/pages-cms/faq-jsonld.test.ts",
      "src/lib/pages-cms/related-chat-rooms.test.ts",
      "src/lib/pages-cms/content-quality.test.ts",
      "src/lib/pages-cms/public-link-budget.test.ts",
      "src/lib/content-automation/publish-quality.test.ts",
      "src/lib/tiptap-html-source.test.ts",
      "src/lib/cta-button.test.ts",
      "src/lib/page-cta.test.ts",
      "src/components/PublicCmsPageView.ssr.test.tsx",
      "src/lib/cms-footer.test.ts",
      "src/lib/content-image-seo.test.ts",
      "src/lib/pages-cms/pages-editor-new-page.test.tsx",
    ],
  },
  blog: {
    id: "blog",
    label: "BLOG",
    paths: [
      "src/routes/blog.index.tsx",
      "src/routes/blog.$slug.tsx",
      "src/routes/blog.write.tsx",
      "src/routes/admin.blog.moderate.tsx",
      "src/components/admin/AdminNav.ts",
      "src/components/blog/",
      "src/lib/blog.public.ts",
      "src/lib/blog.public.test.ts",
      "src/lib/blog-taxonomy.ts",
      "src/lib/blog-taxonomy.test.ts",
      "src/lib/blog-sanitize.ts",
      "src/lib/blog-sanitize.test.ts",
      "src/lib/blog-image.ts",
      "src/lib/blog-writer-editor.ts",
      "src/lib/tiptap-html-source.ts",
      "src/lib/cta-button.ts",
      "src/lib/cta-button.css",
      "src/lib/cta-button.test.ts",
      "src/components/admin/CtaButtonDialog.tsx",
      "src/lib/blog-writer.contract.test.ts",
      "src/lib/blog-write-page.test.tsx",
      "src/lib/blog-delete.ts",
      "src/lib/blog-delete.test.ts",
      "src/lib/content-image-seo.ts",
      "src/lib/content-image-seo.test.ts",
      "src/lib/content-image-optimize.ts",
      "src/components/content-images/",
      "src/lib/content-automation/",
      "src/routes/admin.content-automation.tsx",
      "src/routes/api/run-blog-publish.ts",
      "src/routes/api/run-static-publish.ts",
      "src/routes/api/admin/automation-settings.ts",
      "src/routes/api/admin/topic-ideas.ts",
    ],
    tests: [
      "src/lib/blog.public.test.ts",
      "src/lib/blog-taxonomy.test.ts",
      "src/lib/blog-sanitize.test.ts",
      "src/lib/blog-writer.contract.test.ts",
      "src/lib/blog-write-page.test.tsx",
      "src/lib/cta-button.test.ts",
      "src/lib/blog-delete.test.ts",
      "src/lib/admin-blog-nav.test.ts",
      "src/lib/content-automation/parse-bulk-ideas.test.ts",
      "src/lib/content-automation/excel-ideas.test.ts",
      "src/lib/tiptap-html-source.test.ts",
      "src/lib/content-image-seo.test.ts",
      "src/lib/public-routes.test.ts",
      "src/lib/seo/not-found.test.ts",
    ],
  },
  feed: {
    id: "feed",
    label: "FEED",
    paths: [
      "src/routes/feed.index.tsx",
      "src/routes/feed.$slug.tsx",
      "src/components/feed/",
      "src/lib/feed-prefs.tsx",
      "src/lib/feed-types.ts",
      "src/lib/feed-themes.ts",
    ],
    tests: ["src/lib/desktop-app-layout.test.ts", "src/lib/public-guest-browse.test.ts"],
  },
  chatroom: {
    id: "chatroom",
    label: "CHATROOM",
    paths: [
      "src/routes/chatroom.tsx",
      "src/routes/chatrooms.tsx",
      "src/components/chat/",
      "src/lib/chat-store.tsx",
      "src/lib/chat-optimistic.ts",
      "src/lib/chat-optimistic.test.ts",
      "src/lib/guest-lobby-feed.ts",
      "src/lib/use-guest-lobby-feed.ts",
      "src/lib/guest-chat.test.ts",
      "src/lib/chat-provider-safety.test.ts",
      "src/lib/use-room-online-counts.test.ts",
      "src/lib/dm-utils.test.ts",
      "src/lib/mini-dm.ts",
      "src/lib/mini-dm-messages.test.tsx",
      "src/lib/message-list-model.ts",
      "src/lib/dm-url-mask.tsx",
    ],
    tests: [
      "src/lib/desktop-app-layout.test.ts",
      "src/lib/guest-chat.test.ts",
      "src/lib/chat-provider-safety.test.ts",
      "src/lib/chat-optimistic.test.ts",
      "src/lib/use-room-online-counts.test.ts",
      "src/lib/mini-dm-messages.test.tsx",
    ],
  },
  communities: {
    id: "communities",
    label: "COMMUNITIES",
    paths: [
      "src/routes/communities.tsx",
      "src/routes/community.$slug.tsx",
      "src/lib/community.functions.ts",
      "src/lib/communities-module-gating.test.ts",
    ],
    tests: ["src/lib/communities-module-gating.test.ts", "src/lib/public-guest-browse.test.ts"],
  },
  poetry: {
    id: "poetry",
    label: "POETRY",
    paths: ["src/routes/poetry.index.tsx", "src/routes/poetry.", "src/components/mehfil/", "src/lib/mehfil"],
    tests: [],
  },
  auth: {
    id: "auth",
    label: "AUTH",
    paths: [
      "src/routes/login.tsx",
      "src/lib/auth-gate.tsx",
      "src/lib/auth-store.tsx",
      "src/lib/stored-auth.test.ts",
      "src/lib/public-guest-browse.test.ts",
    ],
    tests: ["src/lib/stored-auth.test.ts", "src/lib/public-guest-browse.test.ts", "src/lib/public-routes.test.ts"],
  },
  global_seo: {
    id: "global_seo",
    label: "GLOBAL_SEO",
    paths: [
      "src/lib/seo/",
      "src/routes/sitemap[.]xml.ts",
      "src/routes/robots[.]txt.ts",
      "src/lib/seo.functions.ts",
    ],
    tests: [
      "src/lib/seo/not-found.test.ts",
      "src/lib/seo/sitemap.test.ts",
      "src/lib/seo/static-public-head.test.ts",
      "src/lib/page-slug-sitemap.test.ts",
    ],
  },
  guardrails: {
    id: "guardrails",
    label: "GUARDRAILS",
    paths: [
      ".cursor/rules/",
      "docs/DEVELOPMENT-GUARDRAILS.md",
      "docs/CURSOR-TASK-TEMPLATE.md",
      "scripts/guard/",
    ],
    tests: [],
  },
  global_shell: {
    id: "global_shell",
    label: "GLOBAL_SHELL",
    paths: [
      "src/routes/__root.tsx",
      "src/routes/$.tsx",
      "src/routeTree.gen.ts",
      "src/styles.css",
      "src/styles/",
      "src/components/app/",
      "src/lib/app-settings.tsx",
      "src/lib/app-surface-css.ts",
      "src/lib/desktop-app-layout.test.ts",
    ],
    tests: ["src/lib/desktop-app-layout.test.ts", "src/lib/guest-home-bundle.test.ts"],
  },
};

export const SHARED_REGRESSION_TESTS = [
  "src/lib/public-routes.test.ts",
  "src/lib/seo/not-found.test.ts",
  "src/lib/supabase-client-boot.test.ts",
];

/** High-risk files. Editable only with justification + cross-module smoke tests. */
export const PROTECTED_FILES = [
  "src/routes/__root.tsx",
  "src/routes/$slug.tsx",
  "src/routes/$.tsx",
  "src/lib/public-routes.ts",
  "src/lib/auth-gate.tsx",
  "src/lib/app-settings.tsx",
  "src/lib/app-surface-css.ts",
  "src/routeTree.gen.ts",
  "src/styles.css",
  "src/styles/app-surfaces.css",
  "src/integrations/supabase/client.ts",
  "src/integrations/supabase/client.server.ts",
  "src/integrations/supabase/env.server.ts",
  "src/integrations/supabase/client-eager.ts",
];

export const PROTECTED_PREFIXES = ["src/lib/seo/"];

/** Short aliases for `npm run check:scope -- --module …`. */
export const ALIASES = {
  custom_pages: "cms",
  custom: "cms",
  "custom-pages": "cms",
  home: "homepage",
  chat: "chatroom",
  seo: "global_seo",
  shell: "global_shell",
  guard: "guardrails",
  rules: "guardrails",
};

export function resolveModuleId(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (MODULES[key]) return key;
  if (ALIASES[key]) return ALIASES[key];
  return null;
}

export function isProtectedPath(file) {
  const n = file.replace(/\\/g, "/");
  if (PROTECTED_FILES.includes(n)) return true;
  return PROTECTED_PREFIXES.some((p) => n === p.slice(0, -1) || n.startsWith(p));
}

export function fileMatchesPathRule(file, rule) {
  const n = file.replace(/\\/g, "/");
  const r = rule.replace(/\\/g, "/");
  if (n === r) return true;
  if (r.endsWith("/")) return n.startsWith(r);
  if (r.endsWith(".")) return n.startsWith(r);
  return n.startsWith(`${r}/`);
}

export function owningModules(file) {
  const hits = [];
  for (const [id, mod] of Object.entries(MODULES)) {
    if (mod.paths.some((p) => fileMatchesPathRule(file, p))) hits.push(id);
  }
  return hits;
}

export function unique(list) {
  return [...new Set(list)];
}

export function testsForModule(id) {
  if (id === "guardrails") return [];
  if (id === "all") {
    return unique([
      ...SHARED_REGRESSION_TESTS,
      ...Object.values(MODULES).flatMap((m) => m.tests),
    ]);
  }
  const mod = MODULES[id];
  if (!mod) return [...SHARED_REGRESSION_TESTS];
  return unique([...SHARED_REGRESSION_TESTS, ...mod.tests]);
}
