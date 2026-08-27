# Yaarzo development guardrails

When work targets one feature, unrelated systems must not change by accident.
This is **not** a file lock. Shared/core files may be required; treat them as
**PROTECTED**: justify the edit, list affected modules, run cross-module smoke
tests, and report the change.

Machine-readable copy: `scripts/guard/config.mjs`.

## Baseline lock (do not regress)

| Item | Value |
|---|---|
| Production commit | `82bdd7fe` |
| Captured | 2026-08-27 |
| Sitemap | 35/35 HTTP 200 |
| Sitemap 5xx | 0 |
| Sitemap 404 | 0 |
| Unexpected sitemap redirects | 0 |
| `/` `/feed` `/chatroom` `/communities` `/competitions` `/poetry` | 200 |
| `/blog` `/blog/yahoo` | 200 |
| Unknown root slug | **404** (never 500) |
| `/llms.txt` | **404** |

**Any 5xx on a known public URL blocks deployment.**

## Module ownership

| Module | Routes / surfaces | Typical files |
|---|---|---|
| **HOMEPAGE** | `/` | `HomeGuestShell`, `HomeSeoContent`, `/api/public/landing`, `src/lib/landing-*` |
| **CUSTOM_PAGES** | `/$slug` | `fetch-published-page`, `public-cms-route`, `pages-cms/`, `PublicCmsPageView` |
| **BLOG** | `/blog`, `/blog/$slug` | `blog.public.ts`, `blog.index.tsx`, `blog.$slug.tsx` |
| **FEED** | `/feed` | `feed.index.tsx`, `src/components/feed/` |
| **CHATROOM** | `/chatroom` | `chatroom.tsx`, `src/components/chat/` |
| **COMMUNITIES** | `/communities`, `/community/$slug` | `communities.tsx`, `community.functions.ts` |
| **POETRY** | `/poetry` | `poetry*.tsx`, mehfil components |
| **AUTH** | login / signup | `login.tsx`, `auth-gate.tsx`, `auth-store.tsx` |
| **GLOBAL_SEO** | sitemap, robots, canonicals | `src/lib/seo/*`, `sitemap[.]xml.ts`, `robots[.]txt.ts` |
| **GLOBAL_SHELL** | app chrome | `__root.tsx`, providers, `src/styles.css`, `app-surfaces.css`, `routeTree.gen.ts` |

**Isolation**

- Homepage / blog tasks must not edit CUSTOM_PAGES (`$slug`, CMS fetch).
- Feed / chatroom tasks must not edit HOMEPAGE.
- SEO/content tasks must not change AuthGate or `public-routes.ts`.
- Do not regenerate `routeTree.gen.ts` unless a route file was added, removed, or renamed.

## Protected files

A normal module task must **not** edit these unless required for that task:

- `src/routes/__root.tsx`
- `src/routes/$slug.tsx`
- `src/routes/$.tsx`
- `src/lib/public-routes.ts`
- `src/lib/auth-gate.tsx`
- `src/lib/app-settings.tsx`
- `src/lib/app-surface-css.ts`
- `src/lib/seo/*`
- `src/routeTree.gen.ts`
- `src/styles.css`
- `src/styles/app-surfaces.css`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/client.server.ts`
- `src/integrations/supabase/env.server.ts`
- `src/integrations/supabase/client-eager.ts`

If a protected file must change:

1. Explain why (one short paragraph).
2. List affected modules.
3. Run cross-module smoke (homepage, CMS page, blog, invalid slug, feed, chatroom).
4. Include the protected-file change in the final report.

Do not convert infrastructure/query errors into HTTP 404. Missing rows → 404; unexpected DB/server failure may remain 500 and must be logged.

## CSS safety

Recent regressions: global CSS order broke unrelated routes.

- Route-local UI → route-local CSS/components.
- Global utility / `@source` / layer order changes require Feed + Chatroom + Homepage checks (desktop and mobile).
- **Do not** reintroduce `app-surfaces.css` on the guest homepage unless the task explicitly requires it.

## Routing safety

Changes to `__root.tsx`, `$slug.tsx`, `$.tsx`, `public-routes.ts`, `routeTree.gen.ts`, or `auth-gate.tsx` must HTTP-smoke:

| Path | Expect |
|---|---|
| `/` | 200 |
| Published CMS slug | 200 |
| `/blog` | 200 |
| Unknown slug | **404** |
| `/feed` | 200 |
| `/chatroom` | 200 |

## Golden routes

Known public URLs (HTTP 200 unless a redirect is listed in `KNOWN_REDIRECTS`):

- `/` `/feed` `/chatroom` `/communities` `/competitions` `/poetry`
- `/india-chat-room` `/pakistan-chat-room` `/lahore-chat-room` `/teen-chat-room` `/chat-rooms-without-registration-2026`
- `/about-us` `/contact-us` `/privacy-policy` `/terms-conditions`
- `/blog` `/blog/yahoo`

Negative: `/__yaarzo-nonexistent-route-test__` → **404**. Hard fail: **any 5xx**.

Documented redirect: `/blog/` → 307 `/blog` (canonical URL is `/blog`).

## Commands

```bash
npm run test:guard:homepage   # module tests + shared regression + golden HTTP subset
npm run test:guard:blog
npm run test:guard:cms
npm run test:guard:feed
npm run test:guard:chatroom
npm run test:guard:all
# Skip live HTTP: npm run test:guard:cms -- --skip-http

npm run verify:golden         # HTTP smoke (default https://yaarzo.com)
npm run verify:sitemap        # every sitemap loc; 5xx = fail
npm run check:scope -- --module homepage
# Optional: --tracked-only  (skip untracked). tmp-/audit junk is always ignored.

npm run verify:predeploy      # tests + production build + golden + sitemap
```

`verify:predeploy` flags: `--skip-build` (unsafe), `--skip-http` / `--offline`, `--base <origin>`, `--live`.

Old unrelated `tsc` debt must **not** block this gate unless `npm run build` already fails.

Local HTTP: `GUARD_BASE=http://127.0.0.1:3000 npm run verify:golden`

## Task template

Copy `docs/CURSOR-TASK-TEMPLATE.md` into the prompt. If a shared file is required: **stop and explain** before broad changes.
