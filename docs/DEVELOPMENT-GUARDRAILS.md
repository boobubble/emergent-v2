# Yaarzo development guardrails

When work targets one feature, unrelated systems must not change by accident.
This is **not** a file lock. Shared/core files may be required; treat them as
**PROTECTED**: justify the edit, list affected modules, run cross-module smoke
tests, and report the change.

Machine-readable copy: `scripts/guard/config.mjs`.
Always-apply Cursor memory: `.cursor/rules/yaarzo-module-guardrails.mdc`.

Agents **auto-detect** TASK MODULE from the request. Do not ask the user to
specify it when the module is clear. Explicit `TASK MODULE:` remains a supported
override. If the request is ambiguous: name the ambiguity, do not start broad
edits, ask **or** choose the smallest safe scope.

## Baseline (behavior reference, not a git reset)

These commits and HTTP results are the known-good behavior to preserve. Do **not**
reset the repo to these commits unless a task explicitly asks for that.

| Item | Value |
|---|---|
| Production commit | `82bdd7fe` |
| Guardrails commit | `b0809284` |
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
| **GUARDRAILS** | Cursor rules / docs / guard scripts | `.cursor/rules/`, `docs/DEVELOPMENT-GUARDRAILS.md`, `scripts/guard/` |

**Isolation**

- Homepage / blog / feed / chatroom / perf must not edit CUSTOM_PAGES (`$slug`, CMS fetch, footer, sitemap eligibility) unless the task is CUSTOM_PAGES or a proven shared regression. Sitemap published pages stay 200.
- BLOG is separate from Custom Pages. Homepage Community Blog uses the real Blog system (`/blog`).
- Feed / chatroom / other non-homepage tasks must not edit HOMEPAGE. Preserve SSR crawlable `/`, one H1, SEO, real-data, Latest Signups, approved avatars, CMS footer, guest performance. Do not put app-surfaces CSS or heavy app providers on guest `/`.
- FEED: desktop 3-col grid + mobile bottom nav. CHATROOM: sidebar closed on mobile, always open on desktop.
- SEO/content tasks must not change AuthGate or `public-routes.ts`.
- Do not regenerate `routeTree.gen.ts` unless a route file was added, removed, or renamed.
- Change only files for the detected module. No unrelated refactors, cleanup, renames, CSS, architecture, package updates, or generated files.

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

1. Explain why (one short paragraph). Prefer a module-local fix first.
2. List affected modules.
3. Run cross-module smoke (homepage, CMS page, blog, invalid slug, feed, chatroom).
4. Include the protected-file change in the final report.

Do not convert infrastructure/query errors into HTTP 404. Missing rows → 404; unexpected DB/server failure may remain 500 and must be logged.

## CSS safety

Recent regressions: global CSS order broke unrelated routes.

- Route-local UI → route-local CSS/components. Do not patch another route via global CSS.
- If `styles.css`, `app-surfaces.css`, Tailwind `@source` / layer order, or shared theme changes: smoke `/`, `/feed`, and `/chatroom` on desktop and mobile.
- Guest `/` must **not** load `app-surfaces.css` to fix another route. `shouldLoadAppSurfaceStyles("/")` stays `false`.

## Routing safety

Changes to `__root.tsx`, `$slug.tsx`, `$.tsx`, `public-routes.ts`, `routeTree.gen.ts`, `auth-gate.tsx`, or shared Supabase loader/client/server routing must HTTP-smoke:

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
npm run guard:selfcheck       # rules + config self-check (GUARDRAILS gate)
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
npm run check:scope -- --module guardrails
# Optional: --tracked-only  (skip untracked). tmp-/audit junk is always ignored.

npm run verify:predeploy      # tests + production build + golden + sitemap
```

Pre-commit: `npm run check:scope -- --module <detected-module>`; review/remove accidental protected or cross-module edits.

Pre-deploy: `npm run test:guard:<module>` (GUARDRAILS: `npm run guard:selfcheck`). If a protected/shared file changed: `npm run verify:predeploy`.

Blockers: build fail, golden 5xx, sitemap 5xx/404, unknown slug 500, serious cross-module layout regression.

`verify:predeploy` flags: `--skip-build` (unsafe), `--skip-http` / `--offline`, `--base <origin>`, `--live`.

Old unrelated `tsc` debt must **not** block this gate unless `npm run build` already fails.

Local HTTP: `GUARD_BASE=http://127.0.0.1:3000 npm run verify:golden`

## Final report

Every coding task should end with a short report:

- TASK MODULE
- files changed
- protected files changed: yes/no
- cross-module edits: yes/no
- guard tests run
- build (if relevant)
- deployment (safe / blocked / not requested)
- known regressions

## Task template

Copy `docs/CURSOR-TASK-TEMPLATE.md` into the prompt when you want a manual override. If a shared file is required: **stop and explain** before broad changes.
