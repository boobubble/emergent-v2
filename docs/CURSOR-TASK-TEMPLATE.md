# Cursor task header (copy into the prompt)

```
TASK MODULE: <HOMEPAGE | CUSTOM_PAGES | BLOG | FEED | CHATROOM | COMMUNITIES | POETRY | AUTH | GLOBAL_SEO | GLOBAL_SHELL>
ALLOWED FILES: <paths for this module only>
PROTECTED FILES: treat as read-only unless this task cannot ship without them
  - src/routes/__root.tsx
  - src/routes/$slug.tsx
  - src/routes/$.tsx
  - src/lib/public-routes.ts
  - src/lib/auth-gate.tsx
  - src/lib/app-settings.tsx
  - src/lib/seo/*
  - src/routeTree.gen.ts
  - src/styles.css
  - src/styles/app-surfaces.css
  - src/integrations/supabase/client.ts
  - src/integrations/supabase/client.server.ts
  - src/integrations/supabase/env.server.ts
DO NOT TOUCH: <every module that is not TASK MODULE>
REQUIRED REGRESSION TESTS:
  - npm run test:guard:<module>
  - If any PROTECTED file changes: homepage, CMS page, /blog, invalid slug, /feed, /chatroom HTTP smoke
DEPLOYMENT BLOCKERS:
  - npm run build fails
  - any golden/sitemap URL returns 5xx
  - published CMS page not 200
  - unknown slug returns 500 instead of 404
BASELINE (do not regress): commit 82bdd7fe — sitemap 35/35 = 200, 5xx = 0
```

## Example: homepage-only

```
TASK MODULE: HOMEPAGE
ALLOWED FILES:
  - src/routes/index.tsx
  - src/components/home/**
  - src/routes/api/public/landing.ts
  - src/lib/landing-*.ts
DO NOT TOUCH:
  - Custom Pages ($slug, CMS fetch, pages-cms)
  - Blog
  - Feed
  - Chatroom
  - Communities
  - Poetry
PROTECTED FILES: do not edit unless strictly required. If required: STOP and explain before broad changes.
REQUIRED REGRESSION TESTS:
  - npm run test:guard:homepage
  - / → 200
  - /feed and /chatroom still 200 if CSS/shell changed
DEPLOYMENT BLOCKERS: any 5xx; guest homepage must not load app-surfaces.css
```

## Example: protected file required

```
A shared file is required: src/lib/public-routes.ts
WHY: <one paragraph>
AFFECTED MODULES: <list>
SMOKE: npm run test:guard:all && npm run verify:golden -- --base <origin>
I will not expand the diff into unrelated modules.
```
