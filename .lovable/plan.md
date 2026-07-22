# Competition Engine 2.0 — Smart Auto Qualification

Extends the existing competition module (Manual flow untouched). Adds Smart Automatic + Hybrid entry modes, a generic qualification engine that plugs into Feed / Poetry / Reels / Voice / etc., and admin rules with multiple qualification methods (Fixed Threshold, Top N Week/Month, Top %, Admin Approval) combinable with AND-style eligibility gates.

Fully backward compatible: existing `competition_competitors`, `competition_awards`, Hall of Fame, and Battle Hub all keep working.

## 1. Data model (one migration)

Extend `competitions`:
- `entry_mode text default 'manual'` — `manual` | `smart` | `hybrid`
- `qualification_method text` — `fixed` | `top_n_week` | `top_n_month` | `top_percent` | `approval`
- `qualification_config jsonb default '{}'` — method params + gates + score weights + source content type
- `auto_approve boolean default true`

Extend `competition_competitors`:
- `origin text default 'manual'` — `manual` | `auto`
- `qualification_reason jsonb` — snapshot of metrics at qualification time (`{likes, views, comments, score, method}`)
- `status text default 'active'` — adds `pending_approval` | `rejected`
- `post_id uuid` nullable — link back to the source content (Feed post, poem, reel)
- `poem_id uuid` nullable — Poetry Hub source

Extend `posts` and `mehfil_poems`:
- `eligible_for_competitions boolean default true`

New table `competition_qualification_log` (audit + de-dupe):
- `competition_id`, `content_type` (`post`|`poem`), `content_id`, `user_id`, `qualified_at`, `score`, `method`, `snapshot jsonb`
- Unique `(competition_id, content_type, content_id)` prevents double-entry.

New table `competition_qualification_events` (lightweight queue):
- `content_type`, `content_id`, `enqueued_at`, `processed_at`. Written by triggers on engagement changes; drained by the qualifier server fn.

Standard GRANTs + RLS: users read own log rows; admins read all; only service_role writes to log/events.

## 2. Engagement score (shared)

Single SQL function `public.engagement_score(_type text, _id uuid, _weights jsonb)` returning numeric. Reads:
- Feed post: `posts.reaction_count`, `comment_count`, `trending_score`, plus optional `shares`/`views` from existing counters.
- Poem: `mehfil_poems.upvote_count`, `read_count`, comments (from `comments`), `bookmark_count`, plus `reactions` where `target_type='mehfil_poem'`.

Weights come from `qualification_config.weights` with sane defaults (`likes:1, comments:3, shares:2, views:0.01, reads:0.05, bookmarks:2`). One function, all modules — no per-module scoring.

## 3. Qualifier server fn (`src/lib/competition-qualifier.functions.ts`)

`runQualification({ competitionId })` — service_role, invoked by:
- DB trigger enqueue → cron drain (every 1 min, via existing `pg_cron` pattern used in retention).
- Live: Supabase Realtime subscription on `competition_qualification_events` in the competition page triggers re-fetch of competitors — creator also gets a notification.

Logic per method:
- **fixed** — evaluate every content item published within window; qualify when all thresholds met AND gates pass (min account age, min followers, min content age, `eligible_for_competitions=true`).
- **top_n_week / top_n_month** — rank window content by engagement score, take top N. Anything falling out of top-N is soft-removed (status `disqualified` — keeps history in log).
- **top_percent** — same, but N = ceil(percent * pool_size).
- **approval** — same match logic as fixed, but insert with `status='pending_approval'`; admin action in Admin panel flips to `active`/`rejected`.

Combinable AND gates read from `qualification_config.gates`: `min_likes`, `min_account_age_days`, `min_followers`, `min_content_age_hours`, `require_eligible_flag`. All applied on top of the primary method.

Per-competition source filter: `qualification_config.source = { module: 'feed'|'poetry'|'reels'|..., category?: 'meme'|'fan_art'|... }` — reuses the existing `posts.category` values plus new `voice`/`reel`/`video`/`photo`/`status`/`profile_picture` (data-only additions, no schema change beyond documented values).

## 4. Triggers → event queue

Postgres triggers on:
- `reactions` insert/delete
- `comments` insert/delete
- `posts` update (counter columns)
- `mehfil_poems` update (`upvote_count`, `read_count`, `bookmark_count`)

Each trigger inserts a row into `competition_qualification_events` (deduped per minute). Cheap, no full scans. Drain fn recalculates only affected content against live/upcoming smart competitions.

## 5. Composer changes (minimal)

Add one checkbox — **"Eligible for competitions"**, default checked — to:
- `src/components/feed/Composer.tsx`
- Poetry composer (`src/routes/poetry.compose.tsx`)
- Voice/Reels composers if present (reuse same field name).

Value writes to `eligible_for_competitions`. No new upload flows.

## 6. Admin: Competition Editor

Extend `CompetitionEditorDialog` with an "Entry & Qualification" tab:
- Entry Mode radio.
- When Smart/Hybrid: Qualification Method dropdown → method-specific config panel.
- Source module + optional category dropdown.
- Engagement score weight editor (advanced/collapsible).
- Gates editor (checkboxes with numeric inputs).
- Auto-approve toggle (defaults on; controls whether qualified content enters directly or `pending_approval`).

New page `src/routes/admin.competition-qualifier.tsx` — shows the qualification event queue, pending-approval competitors, and manual Approve/Reject/Note actions. Reuses admin patterns from `admin.competitions.tsx`.

Module flags in `app-settings.tsx` + admin toggle registry:
- `smartQualification` (master)
- `smartQualificationApproval`
- `smartQualificationLive`

## 7. Competition page

`src/routes/competitions.$slug.tsx`:
- Competitors list already renders `competition_competitors`. Add badge chips based on `origin`: 👑 Official Nominee / ⭐ Auto Qualified.
- Under each auto competitor: "Qualified by: 520 Likes · 7.4K Views · 120 Comments" from `qualification_reason`.
- Realtime channel on `competition_competitors` filtered by `competition_id` — reuses the existing Fun Zone pattern; no new subscriptions.
- Hybrid: two subtly-separated groups (Official / Auto) with sticky sort.

Hall of Fame + Recap: read `origin` on the winners row, render the same badge. `competition_awards` gets no schema change; badge is derived by joining back to `competition_competitors`.

## 8. Notifications

Reuse `notifications` table. New `kind`s:
- `competition_auto_qualified`
- `competition_lost_qualification`
- `competition_pending_approval`
- `competition_approved`
- `competition_rejected`

Emitted from the qualifier fn.

## 9. Backward compatibility

- All existing competitions default to `entry_mode='manual'`, `qualification_method=null` → qualifier is a no-op for them.
- Existing `competition_competitors` rows get `origin='manual'` via default.
- Manual add/remove flow in the admin manage dialog is untouched.
- `posts.eligible_for_competitions` defaults `true`, so historical content remains eligible when a smart competition is created.

## 10. Performance

- Trigger-driven; no full-table scans.
- Event queue de-dupes per minute per content id.
- Qualifier recalculates only queued content against live/upcoming smart competitions where the source filter matches — small set.
- Top-N/Top-% ranking uses a single windowed query per competition, cached for 60 s in an app-level LRU (in server fn module).

## Files touched

Migration; `src/lib/app-settings.tsx`; `src/lib/admin-modules.ts`; `src/lib/competition-qualifier.functions.ts` (new); `src/lib/competitions.functions.ts` (extend admin save + finalize + list to include origin); `src/components/competitions/CompetitionEditorDialog.tsx`; `src/components/competitions/AdminCompetitionManageDialog.tsx` (approval actions); `src/routes/admin.competition-qualifier.tsx` (new); `src/routes/admin.modules.tsx` (auto via registry); `src/routes/competitions.$slug.tsx` (badges + reason + realtime); `src/routes/competitions.$slug.recap.tsx` and `competitions.hall-of-fame.tsx` (origin badge); `src/components/feed/Composer.tsx` + poetry/voice/reels composers (eligibility checkbox); cron entry to drain the event queue every minute.

Ready to implement on approval.