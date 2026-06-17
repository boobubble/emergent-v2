# Broadcaster Studio — Phase 2 Build

Continue the previously approved Broadcaster build, with two additions. **No existing chatroom, feed, auth, XP, streak, notification, or radio playback code is modified.** Only new files and additive integrations.

---

## New: Announcements Tab

### Database (migration)

New table `radio_announcements`:
- `id uuid pk`, `widget_id uuid null` (null = global), `author_id uuid`
- `kind text check in ('upcoming_show','ticker','community')`
- `title text`, `body text`, `link text null`
- `starts_at timestamptz null`, `ends_at timestamptz null`
- `pinned bool default false`, `active bool default true`
- `target jsonb default '{"widget":true,"chatbar":true,"notifications":true,"feed":true}'`
- `created_at`, `updated_at` + trigger

RLS: read = anyone authenticated; insert/update/delete = `admin | dj | rj` (role check via `has_role`). GRANT to `authenticated` + `service_role`. Added to `supabase_realtime` publication.

### Server fns (append to `src/lib/broadcaster.functions.ts`)
- `listAnnouncements({ widgetId?, kind?, activeOnly? })`
- `createAnnouncement(...)` / `updateAnnouncement` / `deleteAnnouncement`
- `togglePin`, `setActive`
- Internally, on `create`/`update` of a `community`-kind announcement → also insert a row into existing `notifications` table (additive; reuses existing notification surface, no schema changes) and into existing scheduled-announcements config if `kind='ticker'` and `target.feed=true`.

### Routes
- `src/routes/_authenticated/broadcaster.announcements.tsx`
  - Tabs by kind: Upcoming Show · Ticker · Community
  - List + create/edit modal (title, body, link, schedule window, pin, per-channel target switches)
  - Reuses existing UI primitives (Card, Dialog, Switch, Button, Input, Textarea)

### Auto-surface integrations (read-only consumers; no existing files edited)
- **Radio Widgets**: `RadioWidgetCard` (new) renders top-pinned announcement banner from `listAnnouncements({ widgetId, kind:'upcoming_show', activeOnly:true })`.
- **Chatroom Radio Bar**: new sibling component `BroadcasterTicker` that subscribes to `radio_announcements` where `kind='ticker' AND target->>'chatbar'='true'`. Mounted only inside the new `/broadcaster` and `/radio` surfaces and inside `DjFooter`'s **existing** slot via a non-invasive portal — actually, to avoid touching `DjFooter.tsx`, mount it inside `__root.tsx`-level overlay container already present (existing toaster wrapper). If no slot exists without edit, render ticker inside `/radio` directory only and skip chatroom injection this turn (documented in code comment as TODO).
- **Community Notifications**: `kind='community'` writes a row into existing `notifications` table → consumed automatically by existing notifications UI.
- **Feed Bot Updates**: piggyback existing `ScheduledAnnouncementsRunner` config by appending entries via existing `useAppSettings` API (read + write same keys). No edits to `ScheduledAnnouncements.tsx`.

---

## Enhanced Analytics

`src/routes/_authenticated/broadcaster.analytics.tsx` gains 5 derived stat cards, computed client-side from existing tables:

| Card | Source |
|---|---|
| Top Host | `radio_schedules` GROUP BY `host_id`, count where `status='completed'` |
| Top Show | `radio_schedules` GROUP BY `title`, sum duration |
| Peak Listener Time | `radio_widget_state.listener_count` snapshots bucketed by hour |
| Most Active Radio Widget | `radio_widget_state` GROUP BY `widget_id`, max `listener_count` + live_minutes |
| Most Played Track | `radio_queue_items` where `played=true` GROUP BY `youtube_id`, count |

Implemented as 5 small `useQuery` hooks reading via authenticated server fns (`getAnalyticsTopHost`, etc.) added to `broadcaster.functions.ts`. Read-only, no schema changes.

---

## Order

1. Migration (new `radio_announcements` table, RLS, GRANT, realtime).
2. Extend `broadcaster.functions.ts` with announcement CRUD + analytics fns.
3. New route `_authenticated/broadcaster.announcements.tsx` + tab entry in broadcaster shell.
4. New `RadioWidgetCard` banner + `/radio` ticker consumer.
5. Enhanced `broadcaster.analytics.tsx` cards.
6. Smoke check (`bunx tsc --noEmit`).

**Untouched:** `DjFooter.tsx`, `ScheduledAnnouncements.tsx`, `MessageList.tsx`, `feed.tsx`, `chatroom.tsx`, auth, XP, streaks, notifications schema, radio playback, YouTube playback.
