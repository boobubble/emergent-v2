# Yaarzo.com — Prioritized action plan (refresh)

**Health score today: 58** (was 28). P0 5xx recovery (`82bdd7fe`) restored eligibility. Next work is trust, uniqueness, and brand — not more 500 debugging unless a new 5xx appears.

---

## Phase 1 — Critical / this week

### 1. Resolve teen age vs Terms (YMYL)

- `/teen-chat-room` promises 13–16; Terms require 16+; Privacy has `[INSERT MINIMUM AGE]`.
- **Failed if:** those three still disagree after the next recrawl.
- Options: raise the page to 16+, or noindex/remove the teen URL until legal copy matches.

### 2. Request recrawl in GSC

- Sitemap previously trained Google on 5xx. All 35 locs are 200 now.
- **Failed if:** GSC “Server error (5xx)” is unchanged 7 days after resubmit.

---

## Phase 2 — High (this week)

### 3. Remove BooBubble from public titles

- Live: `/communities` = `Discover Communities — BooBubble`. `/feed` HTML still contains `boobubble`.
- **Failed if:** view-source `/communities` still contains BooBubble.

### 4. Homepage proof vs empty modules

- Hero “15,240+ members” vs 0 Members / 0 Online / 0 Chatrooms / 0 Feed Posts.
- **Failed if:** zeros still sit next to the claim.

### 5. Blog hygiene

- Add `/blog` to sitemap only if it is a real index.
- Noindex or unpublish `/blog/yahoo` (and other test posts).
- Add canonical + robots on `/blog`.

### 6. DNS `www` → apex + security headers

- `www.yaarzo.com` still does not resolve.
- Add `X-Content-Type-Options: nosniff`, Referrer-Policy, frame-ancestors or X-Frame-Options.

### 7. Unique titles + H1 on app routes

- `/feed`, `/chatroom`, `/poetry` are chrome labels; several lack SSR H1.

---

## Phase 3 — Medium (weeks 2–3)

### 8. Thin lander uniqueness

- Enrich or consolidate India / Pakistan / Friendship / Dating / Girls / Hyderabad / Bengaluru / Karachi / Rawalpindi / Kolkata.
- **Do not add more city URLs.**

### 9. Schema quality

- Organization `logo` + `sameAs`.
- CMS fallback `Article` → `WebPage` + `BreadcrumbList`; About → `AboutPage`.
- Do **not** add FAQPage for Google SERP.

### 10. Legal placeholders

- `[INSERT LEGAL ENTITY NAME]`, `[INSERT JURISDICTION]` on Terms.

---

## Phase 4 — Ongoing

- Compress OG PNG (~1.5 MB).
- Connect GSC + CrUX.
- Re-audit in 14 days; keep `npm run verify:sitemap` / `verify:golden` as the 5xx gate.
- Do **not** invent `/llms.txt`.
