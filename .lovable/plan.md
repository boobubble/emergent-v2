# Poetry Hub · Phase 3 — Premium Reading & Writer Ecosystem

Scope is large. To stay safe (no regressions to battles / leaderboard / HoF / AI / feed) I'll ship in 4 sequential sub-phases, each independently testable and backward-compatible. Confirm the phasing (or reorder) before I start.

---

## Sub-phase 3A — Premium Reading Page (highest visible ROI)
Route: `src/routes/poetry.$slug.tsx` — enhance in place, no schema changes.

Adds to the existing page:
- Reading progress bar (scroll-linked), estimated reading time (words/200).
- Font size controls (A− / A+) with `localStorage` persistence, applied to poem body only.
- Sticky action bar (mobile) + inline actions (desktop): Copy, Bookmark, Share, Report, Follow Writer.
- Header chips: Category, Trending (if in trending set), Battle badge (if `competition_id`), Published date, country flag from author profile.
- Below-poem sections (lazy-loaded via existing server fns):
  - More from this Writer, Related (same category), Trending, Live Battles, Comments, Prev/Next (by `published_at` within category).
- Typography pass on `.poem-body` (serif display, generous leading, drop-cap optional).

Reuses: existing reactions, bookmark, share, report, comments, `PoemCard`, `getPoetryBattlesLive`.

Backward compat: all new UI is additive; if data missing → hidden.

## Sub-phase 3B — Writer Profile + Category Polish
- `ProfileMehfilSection.tsx` already renders most stats. Add: Writing Streak (derived from `mehfil_writer_stats` if present else compute from `published_at` gaps), Writer Since (min published_at), Followers/Following (reuse existing `friendships` follow relation).
- `src/routes/poetry.category.$slug.tsx` — add banner strip, top writers (aggregate from listing), Trending / Newest tabs, Live Battle callout, mini leaderboard (reuse writer_stats filtered by category).

No schema changes.

## Sub-phase 3C — Drafts, Scheduled Publishing, Collections, Follow
Requires small additive schema (all additive, no destructive changes):
- Reuse existing `mehfil_poems.status` (`draft`, `pending`, `published`, `scheduled`) — add `scheduled` to enum + `scheduled_for timestamptz`.
- Autosave on compose route every 8s → upserts a `draft` row.
- Publish modal: Now / Schedule → sets `status=scheduled, scheduled_for`. A cron route `/api/public/hooks/poetry-publish` (pg_cron every 5 min) flips due drafts to `published`.
- New table `poetry_collections(id, user_id, title, slug, description, cover_url, is_public)` + `poetry_collection_items(collection_id, poem_id, position)`.
- Follow writer: reuse existing `friendships` (or introduce `writer_follows` if friendships is bidirectional — check first). Feed already has "following" — add a "Following Writers" filter in `/poetry`.

Compose page (`poetry.compose.tsx`) gets: Draft list drawer, Save Draft, Schedule picker.

## Sub-phase 3D — Prompts, Notifications, Premium Share Cards, Admin
- New table `poetry_prompts(id, prompt, category_id, scheduled_for, is_active)`. Admin CRUD at `/admin/mehfil` (extend existing page — no new admin route).
- Today's Prompt card mounted on `/poetry` hero.
- Notifications: reuse existing `notifications` table + inserters. Add triggers (or server-fn hooks in reaction/comment/battle flows) for: new follower, trending threshold (100/500 likes, 1000 reads), battle start/end/won, editor's pick.
- Share cards: canvas/SVG generator (client-side) producing 1080×1080 (Instagram) / 1080×1920 (Story) branded images from poem + author + category. Downloadable + Web Share API when available.
- Admin toggles under `/admin/mehfil`: daily_prompt, scheduled_publishing, collections, writer_following, share_images, reading_progress, font_controls (all default on; each independently gated in UI).

---

## Technical Details

New tables (Sub-phase 3C/3D):
```text
poetry_collections            id, user_id, title, slug, description, cover_url, is_public, timestamps
poetry_collection_items       collection_id, poem_id, position, added_at
poetry_prompts                id, prompt, category_id, scheduled_for, is_active, timestamps
```
Each with GRANTs (authenticated CRUD own rows; anon SELECT for public collections + active prompts), RLS enabled, policies scoped to `auth.uid()`.

Poem status enum: add `scheduled` value + nullable `scheduled_for timestamptz`; keep existing `PoemStatus` union in `mehfil-types.ts` in sync.

Cron route: `src/routes/api/public/hooks/poetry-publish.ts` (verifies `apikey` = anon key, flips due poems, idempotent).

Admin settings extend `mehfil_settings` in `app_settings` (no schema change) with the new boolean toggles + defaults in `MEHFIL_SETTINGS_DEFAULTS`.

Realtime: keep existing `useMehfilPoemRealtime`; extend to invalidate reader-page bookmark/follow counts.

---

## Deliverables per sub-phase
- 3A: 1 route edited, 1 small `ReadingControls` component, 1 `PrevNext` helper. Zero schema.
- 3B: 2 routes edited. Zero schema.
- 3C: 1 migration (enum + `scheduled_for` + collections tables), compose route edits, 1 cron route, 2 new server-fn files.
- 3D: 1 migration (prompts table), notification hooks, share-card component, admin toggles.

## What I need from you
1. Approve the 4-sub-phase order (or reorder).
2. Confirm follow relation: reuse `friendships` or add dedicated `writer_follows`?
3. Confirm share cards can be **client-side canvas** (fast, free) rather than server-rendered OG images.

Reply "go" to start Sub-phase 3A. I'll pause between sub-phases for review.
