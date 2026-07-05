# Community Competitions System

A new engagement hub at `/competitions` with admin-managed categories, unlimited competitions, live voting, countdowns, rankings, rewards, and integrations into Feed, Chatrooms, Notifications, and Profiles. Existing Feed / Chatrooms / Radio / XP / Streak / Friends / Notifications logic stays untouched — this is purely additive.

## Scope

### New user-facing surfaces
- `/competitions` — browse Live / Upcoming / Ended competitions (glassmorphism cards, mobile-first).
- `/competitions/$id` — detail page: banner, rules, countdown, participants grid, Top-3 live ranking, Vote / Join buttons.
- `/competitions/leaderboard` — Most Wins / Most Votes / Most Joined, with Weekly / Monthly / All-Time tabs.
- Feed nav: add a **Competitions** tab/button linking to `/competitions` (nav config only — no Feed logic changes).
- Profile: new "Competition Achievements" section showing winner badges, total wins, joined count, live entries.

### New admin surfaces (under existing Admin panel)
- `/admin/competitions` — analytics + list, create/edit/delete competitions, manage participants (approve/remove/disqualify), announce winners, configure per-competition rewards, choose chatrooms for announcements.
- `/admin/competition-categories` — unlimited categories: create/edit/delete, enable/disable, icon, banner, color. Seeds the default set on first migration.
- AdminNav: add both entries under the **Community** group.

### Behavior
- **Voting**: 1 vote per user per competition; login required; admin toggle to allow vote-change before deadline; auto-close after end time; admin toggle to hide/show live counts.
- **Countdown**: computed client-side from `end_at`; server enforces close via RLS + status transition.
- **Live rankings**: Supabase Realtime on `competition_votes` + `competition_participants` to refresh Top-3.
- **Rewards**: coins / XP / winner badge / premium days / custom text — applied by admin "Finalize winners" server fn (uses existing coin & subscription tables; no changes to XP engine core).
- **Feed integration**: on competition create / start / ending-soon / winner announced, insert a system post via existing posts table (author = boobubble system account) — read-only side effect, no Feed code changes.
- **Chatroom integration**: admin-selected chatrooms receive system messages via existing `messages` table.
- **Notifications**: insert into existing `notifications` table for join / vote-received / ending-soon / winner.

## Data model (new tables only)

```text
competition_categories   id, slug, name, description, icon_url, banner_url, color, enabled, sort_order, is_default
competitions             id, category_id, name, slug, description, banner_url, rules,
                         start_at, end_at, max_participants, winner_count,
                         status ('draft'|'upcoming'|'live'|'completed'),
                         allow_vote_change, show_live_counts,
                         rewards jsonb, announce_channels text[], created_by
competition_participants id, competition_id, user_id, status ('pending'|'approved'|'removed'|'disqualified'),
                         vote_count (denorm), rank (denorm), joined_at
competition_votes        id, competition_id, participant_id, voter_id, created_at
                         UNIQUE (competition_id, voter_id)
competition_awards       id, competition_id, participant_id, user_id, place, badge_label, rewards jsonb, awarded_at
```

All tables: full GRANTs, RLS on, indexes on hot paths. Triggers keep `vote_count` / `rank` in sync and enforce voting window + one-vote rule. Realtime enabled on `competition_votes`, `competition_participants`, `competitions`.

## Server functions (`src/lib/competitions.functions.ts`)

Public (server publishable client): `listCompetitions`, `getCompetition`, `getLeaderboard`, `getUserAchievements`.
Authenticated (`requireSupabaseAuth`): `joinCompetition`, `castVote`, `changeVote`, `leaveCompetition`.
Admin-only (auth + `has_role('admin')`): category CRUD, competition CRUD, `approveParticipant`, `disqualifyParticipant`, `finalizeWinners` (writes awards, grants rewards, posts to Feed + selected chatrooms + notifications).

## Files

**Created**
- `supabase/migrations/<ts>_competitions.sql` — tables, RLS, GRANTs, triggers, seed defaults, realtime publication.
- `src/lib/competitions.functions.ts` — all server fns.
- `src/lib/use-competitions.ts` — query hooks + realtime subscription.
- `src/components/competitions/CompetitionCard.tsx`
- `src/components/competitions/Countdown.tsx`
- `src/components/competitions/TopThree.tsx`
- `src/components/competitions/VoteButton.tsx`
- `src/components/competitions/ParticipantGrid.tsx`
- `src/components/profile/CompetitionAchievements.tsx`
- `src/routes/competitions.tsx` (list) + `competitions.$id.tsx` (detail) + `competitions.leaderboard.tsx`
- `src/routes/admin.competitions.tsx`
- `src/routes/admin.competition-categories.tsx`

**Edited (nav only, no logic changes)**
- `src/components/admin/AdminNav.ts` — add Competitions + Categories under Community.
- The Feed navigation component — add a Competitions tab link. (I'll locate the exact file when implementing; it's a nav-only tweak.)
- Profile route — mount `<CompetitionAchievements userId={...} />` in an existing section.

## Notes / constraints

- All defaults seed in the migration; admins can add unlimited categories + competitions with zero code changes.
- No changes to existing auth, chat message pipeline internals, feed composer, XP engine, streaks, or notifications transport — we only insert rows into the existing tables through admin-triggered server fns.
- Manual finalization by admin (also supports a future cron via `/api/public/competitions-cron` — not built in v1).
- Payment / premium-days rewards reuse the existing subscription tables added in the Subscription System.

Confirm and I'll ship it.
