# FeedBot — Community Announcement Bot

Add a single official system bot ("FeedBot") that automatically posts community activity updates into selected chatrooms, with admin controls, spam protection, and a nightly AI summary.

Nothing existing changes behaviorally. Feed, Radio, XP, Streak, Competitions, Auth stay untouched — FeedBot only *reads* their events and *writes* messages.

---

## What the user gets

1. A verified bot profile ("FeedBot") visible in Chatrooms with an official avatar, bot badge, and bio.
2. Automatic announcements in admin-selected chatrooms when these events happen:
   - Feed: new post, image post, poll, trending post, shared post
   - Profile: avatar / cover / bio / username updated
   - Competitions: started, new vote, leader changed, milestone, ending soon, winners
   - Community: new member, level up, XP milestone, streak milestone, achievement, badge
   - Radio: live started, RJ changed, live show, special event
   - Chatrooms: new premium room created, room featured, event started
3. Rich messages with avatar, preview text, image thumbnail, and clickable action buttons (View Feed, View Profile, Vote Now, Join Radio, Open Competition).
4. Admin panel at `/admin/feedbot` to enable/disable, pick event categories, pick target chatrooms, set cooldown, and toggle "combine into digest".
5. Spam protection: per-category cooldown + optional bundling into a single "Community Update" post.
6. Daily AI summary post at 21:00 IST with top highlights.

---

## Data model (single new bot, single settings row)

New tables:
- `feedbot_settings` (single row): `enabled`, `event_flags jsonb`, `target_chatrooms uuid[]`, `min_interval_seconds`, `digest_mode`, `daily_summary_enabled`, `daily_summary_time`.
- `feedbot_events`: durable queue of pending announcements — `id, kind, payload jsonb, actor_id, target_url, image_url, created_at, dispatched_at, dedupe_key`.
- `feedbot_dispatch_log`: last-post-per-(chatroom, category) timestamp for cooldown checks.

The FeedBot user itself is one seeded row in `profiles` with `is_bot=true`, `is_verified=true`, fixed `id` (constant UUID). Existing `messages` table already supports `sender_id` + jsonb metadata — reused as-is.

Add columns to `profiles` if missing: `is_bot boolean default false`, `is_verified boolean default false`.

Add column to `messages`: `bot_payload jsonb` (buttons, preview card). Rendered by a new `<BotMessageCard>` chat bubble.

---

## Event sources → queue

Each event type is captured via a Postgres trigger that inserts into `feedbot_events` with a `dedupe_key`:

| Event | Source table | Trigger |
|---|---|---|
| new_post, image_post, poll | `posts` | AFTER INSERT |
| trending_post | scheduled scan | cron |
| profile_avatar / cover / bio | `profiles` | AFTER UPDATE (column-diff) |
| competition_started / ended / winner | `competitions` | AFTER UPDATE of status |
| new_vote / leader_changed | `competition_votes` | AFTER INSERT (compute rank delta) |
| level_up / xp_milestone / streak / achievement | existing XP/streak functions | append INSERT into queue |
| radio_live | `radio_widget_state` | AFTER UPDATE of is_live |
| new_member | `profiles` | AFTER INSERT |
| chatroom_created (premium) / featured | `chatrooms` | AFTER INSERT/UPDATE |

Triggers only enqueue — they never post directly, so failures never block user actions.

---

## Dispatcher

A pg_cron job every minute calls a public server route `/api/public/hooks/feedbot-dispatch` that:
1. Loads `feedbot_settings`; exits if disabled.
2. Pulls undispatched `feedbot_events`.
3. For each event: check category flag, check per-(chatroom, category) cooldown, either post immediately or accumulate into a digest bucket.
4. Insert one row into `messages` per target chatroom with `sender_id = feedbot`, `bot_payload = { kind, preview, image_url, buttons: [...] }`.
5. Mark events dispatched.

A second daily job at 21:00 IST calls `/api/public/hooks/feedbot-summary` which uses Lovable AI (`google/gemini-3-flash-preview`) to produce the highlight text from the last 24h of activity counts, then posts one digest message.

Both routes verify a shared secret header.

---

## UI changes

- **Chatroom message renderer**: new `BotMessageCard` component. When `sender.is_bot && message.bot_payload`, render preview card + action buttons instead of plain text. Falls back to plain text otherwise. Existing message flow untouched for regular users.
- **Profile page**: show verified bot badge next to FeedBot's name; hide send-DM and add-friend buttons for bot accounts.
- **New admin page** `/admin/feedbot`:
  - Master enable toggle
  - Grid of event category toggles
  - Multi-select for target chatrooms
  - Cooldown slider (30s – 1h)
  - Digest mode toggle
  - Daily AI summary toggle + time picker
  - "Send test announcement" button
- Add link in `AdminNav.ts` under Community.

---

## Files to create

- `supabase/migrations/<ts>_feedbot.sql` — profile flags, tables, triggers, RLS, GRANTs, seed FeedBot profile, seed settings row, enable pg_cron jobs.
- `src/routes/api/public/hooks/feedbot-dispatch.ts` — queue drainer.
- `src/routes/api/public/hooks/feedbot-summary.ts` — nightly AI summary.
- `src/lib/feedbot.functions.ts` — admin CRUD, test-post, fetch settings.
- `src/lib/feedbot-format.ts` — payload builders per event kind.
- `src/routes/admin.feedbot.tsx` — admin panel.
- `src/components/chat/BotMessageCard.tsx` — rich bot bubble with buttons.

## Files to edit

- Chatroom message list component — branch on `sender.is_bot` to render `BotMessageCard`.
- `src/components/admin/AdminNav.ts` — add FeedBot link.
- `AGENT`/profile card components — show verified bot badge when `profile.is_bot`.

## Out of scope

- No changes to Auth, Feed logic, Competitions logic, XP/Streak, Radio, Notifications.
- No new payment surface.
- Bot cannot receive DMs or friend requests (blocked at UI + RLS).

---

## Technical details

- Bot user id is a fixed UUID stored as a constant `FEEDBOT_ID` in `src/lib/feedbot-format.ts` and inserted via migration.
- All triggers use `SECURITY DEFINER` and only INSERT into `feedbot_events` — no cross-table reads that could break RLS.
- Dispatcher runs as `service_role` inside the server route (verified secret), so it can post into any chatroom.
- Cooldown key = `(chatroom_id, category)`; digest mode groups events per chatroom into a single "📢 Community Update" message when >1 event fires inside the cooldown window.
- AI summary uses Lovable AI Gateway; no user secret required.
- All new tables get RLS + GRANTs following project rules; `feedbot_events` and `feedbot_dispatch_log` are service_role-only, `feedbot_settings` is admin read/write via `has_role('admin')`.
