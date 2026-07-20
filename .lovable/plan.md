# Poetry Hub — Phase 3B Plan

Phase 3B is large (12 sections). To stay backward compatible and reviewable, I'll ship it in **three sub-phases**, each self-contained. Everything reuses existing components (`PoemCard`, `MehfilShell`, `ProfileMehfilSection`, `WriterRankBadge`, notifications, competitions).

---

## Sub-phase 3B.1 — Data foundations (schema + server fns)

One migration, purely additive. No UI regressions possible.

**New tables** (all with GRANTs + RLS + policies):
- `poetry_writer_follows` — dedicated one-way follow graph (`follower_id`, `writer_id`, unique pair). Kept separate from `friendships` so following ≠ friend requests.
- `poetry_prompts` — admin-authored daily prompts (`title`, `body`, `category_id`, `scheduled_for`, `active_from`, `active_until`, `is_active`).
- `poetry_collections` — user-owned collections (`user_id`, `name`, `slug`, `description`, `cover_url`, `is_public`).
- `poetry_collection_items` — poem-in-collection join (`collection_id`, `poem_id`, unique).

**Column adds (existing tables, nullable):**
- `mehfil_poems.scheduled_at TIMESTAMPTZ` — scheduled publish target.
- `mehfil_writer_stats.followers_count`, `.following_count`, `.streak_days`, `.member_since` — populated by a lightweight `poetry_refresh_writer_stats(uuid)` function; existing counts remain the source of truth.

**Server fns (new file `src/lib/poetry-social.functions.ts`):**
- `followWriter({ writerId })`, `unfollowWriter({ writerId })`, `isFollowing({ writerId })`, `listFollowers({ userId })`, `listFollowing({ userId })`.
- `createCollection`, `deleteCollection`, `addToCollection`, `removeFromCollection`, `listMyCollections`, `getCollection({ slug })`.

**Server fns (new file `src/lib/poetry-prompts.functions.ts`):**
- `getTodayPrompt()` — public, returns the current-day prompt.
- Admin CRUD: `listPromptsAdmin`, `upsertPromptAdmin`, `deletePromptAdmin`, `togglePromptAdmin`.

**Server fns (append to `src/lib/mehfil.functions.ts`):**
- `listMyDrafts()` — poems with `status='draft'` for the caller (already partially covered by `listMyPoems`, add filter helper).
- `schedulePoem({ poemId, scheduledAt })` — sets `scheduled_at` + keeps `status='draft'`.
- `deleteDraft({ poemId })`.
- Extend `publishPoem` to accept `scheduledAt` (nullable) — if set, insert as `draft` with `scheduled_at`.

**Cron job** (SQL, via insert tool after tables land): every 5 min, promote drafts whose `scheduled_at <= now()` to `published`.

**Admin settings** — extend `MehfilSettings` with toggles: `following_enabled`, `drafts_enabled`, `scheduled_publishing_enabled`, `collections_enabled`, `daily_prompt_enabled`, `writer_stats_enabled`, `reading_progress_enabled`. Defaults `true`. No UI regression when off — features just hide.

---

## Sub-phase 3B.2 — Writer social & profile

Uses the schema from 3B.1. Purely UI + wiring.

- **Writer Dashboard**: extend `ProfileMehfilSection.tsx` with follower/following counts, streak, member-since, shares, bookmarks, XP, coins (read from existing `profiles`/`gam_*` tables). Beautiful stat card grid.
- **Follow button**: new small `FollowWriterButton` component. Replaces the friendship-based follow shortcut in `poetry.$slug.tsx`. Uses `poetry_writer_follows`.
- **Followers / Following lists**: modal opened from the profile stats.
- **Notifications**: DB trigger inserts a `notifications` row on `poetry_writer_follows` INSERT (`kind='writer_follow'`). Reuses the existing notification bell / list.
- **Recommendations tweak**: `getMehfilDiscovery` gets an optional `followed_writers` section when a user is logged in.

---

## Sub-phase 3B.3 — Discovery, prompts, category polish, empty states

- **Category page (`poetry.category.$slug.tsx`)**: banner (from `category.color`), description, poem count, tabs for Trending / Newest, top-writers strip, live-battle callout (if any active `poetry_battle` competition tagged to that category), category leaderboard (top writers by upvotes in that category).
- **Daily Prompt hero**: shown on `/poetry` above discovery. Countdown to end-of-UTC-day. "Write this prompt" CTA links to `/poetry/compose?prompt=<id>` which prefills.
- **Admin Daily Prompt UI**: new tab in `/admin/mehfil` — list, create, schedule, toggle, delete.
- **Compose page upgrades** (`poetry.compose.tsx`):
  - Draft autosave to `mehfil_poems` (status=draft) every 8s + on blur.
  - "Save draft", "Continue editing", "Delete draft" actions.
  - "Publish now" vs "Schedule" toggle with datetime picker.
  - Unsaved-changes warning (`beforeunload` + router `blocker` when dirty).
  - Prefill from `?prompt=` query.
- **Drafts panel**: on `poetry.compose.tsx` sidebar, list current user's drafts + scheduled.
- **Collections**: minimal UI — collections tab on `u.$username.tsx`, "Add to collection" popover on `PoemCard` action bar (only when logged in).
- **Premium empty states**: shared `<PoetryEmpty />` component with icon + copy + CTA for: no poems, no drafts, no collections, no followers, no battles.

---

## Deferred (call out for scope, not shipping this turn)

- Trending / 100-likes / 500-likes / 1000-reads notification triggers (belongs in a metrics job — non-trivial).
- Full mobile redesign — reader page already has the sticky bar from 3A; other pages will get compact spacing in 3B.3 but no full mobile overhaul.
- Collection cover-image upload UI (cover_url column ships, upload flow is deferred).

---

## Order of execution

1. Create the 3B.1 migration (single SQL file). Await approval.
2. After it runs, write server fns + admin toggle plumbing.
3. Ship 3B.2 UI.
4. Ship 3B.3 UI + cron job insert.

Reply "approve" to proceed with sub-phase 3B.1 (the migration). I'll pause after each sub-phase so you can review before I move on.
