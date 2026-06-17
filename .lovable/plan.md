# Broadcaster Studio — Implementation Plan

A new, additive system at `/broadcaster`. **No existing chatroom, feed, auth, XP, streak, notification, radio playback, or YouTube playback code will be modified.** New features integrate by *reading from* and *appending to* the existing DJ/RJ infrastructure already in `src/lib/dj-store.tsx`, `src/lib/dj-config.ts`, and `src/components/chat/DjFooter.tsx`.

---

## 1. Permissions (reuse existing)

- Read roles from existing `user_roles` table via `has_role(_user_id, _role)`.
- Treat `admin`, `dj`, `rj` (and the existing staff role used by `DjFooter`) as broadcaster-capable. Admin has full management; RJ/DJ manages own widgets/schedules/queue/mic.
- `/broadcaster` route guard: signed-in + has any broadcaster role; otherwise redirect to `/` with a toast. No new auth.

---

## 2. Database (new tables only, additive)

Migration adds 4 tables under `public`, each with GRANTs + RLS + policies:

1. `radio_widgets` — id, name, slug, description, cover_url, accent_color, enabled, owner_id, created_at, updated_at. Admin CRUD; RJ/DJ read all; owner can edit own.
2. `radio_widget_state` — widget_id PK, is_live, current_host_id, current_show_title, current_track_title, current_track_artist, current_track_artwork, listener_count, queue_size, mic_active, started_at, updated_at. Anyone can read; only widget owner + admin write.
3. `radio_schedules` — id, widget_id, host_id, title, description, starts_at, ends_at, status (`scheduled|live|completed|cancelled`), created_at, updated_at. Overlap prevented by exclusion constraint `EXCLUDE USING gist (widget_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&) WHERE (status <> 'cancelled')`. Host or admin can edit own; everyone reads.
4. `radio_queue_items` — id, widget_id, added_by, position, youtube_url, youtube_id, title, channel, thumbnail, duration_seconds, played, created_at. Host of widget + admin write; public read.
5. `broadcaster_settings` (single-row, key/value JSON) — for the editable disclaimer + ticker template. Admin write, public read.

Enable realtime publication on the 4 dynamic tables so the existing chat-room widget & ticker can subscribe without polling.

Trigger keeps `radio_widget_state.is_live` synced when a schedule crosses `starts_at`/`ends_at` boundaries (set by the auto-live tick described in §6).

---

## 3. New files (no edits to existing app surfaces)

```
src/lib/broadcaster.functions.ts        # createServerFn CRUD + go-live/end-live
src/lib/broadcaster-store.tsx           # client subscriptions, derived "live now / next"
src/routes/_authenticated/broadcaster.tsx        # gate + shell
src/routes/_authenticated/broadcaster.index.tsx  # Dashboard
src/routes/_authenticated/broadcaster.widgets.tsx
src/routes/_authenticated/broadcaster.schedule.tsx
src/routes/_authenticated/broadcaster.queue.tsx
src/routes/_authenticated/broadcaster.mic.tsx
src/routes/_authenticated/broadcaster.analytics.tsx
src/routes/radio.tsx                    # public Radio Directory (read-only)
src/components/broadcaster/*            # cards, modals, ticker, queue, mic panel
```

Notes:
- The `_authenticated` parent gate already exists; we add a `beforeLoad` in the new `broadcaster.tsx` layout to also require a broadcaster role. Existing protected routes are untouched.
- `radio.tsx` is public, read-only listing of live/upcoming widgets. It does **not** replace any chatroom widget — it links into the room that already plays audio.

---

## 4. Dashboard UI (matches uploaded reference)

Glassmorphism + dark + neon-purple, mobile-first. Sections:

- Header: page title, "Create Radio Widget" CTA, user chip with role badge.
- Welcome strip + editable disclaimer card.
- "Your Radio Widgets" grid of premium cards (live status, host, now playing, listeners, queue, Go Live / End Live, Manage).
- Right rail: Live Overview tiles (Live Widgets, Total Listeners, Active Hosts, Total Queue), Listener Analytics sparkline (from existing presence + new state table), Active Widgets list.
- Bottom dock: the *existing* `DjFooter` is **not** modified. We render a lightweight "now playing" recap that reads the same store the footer reads.

Tokenized colors only (no hard-coded hex) — extend `src/styles.css` with a few neon-purple tokens (`--accent-neon`, `--surface-glass`, gradients, shadows).

---

## 5. Dynamic Widgets, Queue, Mic

- Widgets: full CRUD via server fns (`createWidget`, `updateWidget`, `deleteWidget`, `setWidgetEnabled`). No hard limit.
- Queue: paste YouTube URL → parse ID client-side (no change to existing YouTube playback code; we only persist URLs into `radio_queue_items` and expose a "Send to player" action that calls the *existing* dj-store API). Reorder via drag handle, skip/remove/clear.
- Mic: simple toggle that flips `mic_active` in `radio_widget_state` and shows the 🎙 indicator. Actual WebRTC voice transport is **not** in scope for this turn — surfaced as a clearly-labelled "Mic Live" presence signal that pairs with the existing audio stream. (Real voice transport would be a separate feature request.)

---

## 6. Auto Live + Ticker

- `radio_schedules` rows are evaluated by a client-side tick (every 30s) inside `broadcaster-store.tsx`: when `now ∈ [starts_at, ends_at]` and status was `scheduled`, the host's client flips it to `live` and updates `radio_widget_state`. When `now > ends_at` and status was `live`, it flips to `completed` and clears live state (unless the host hit "Extend").
- Ticker component subscribes to widget_state + next 3 upcoming schedules; renders a marquee: `🎙 LIVE NOW: … | NEXT: … | UPCOMING: …`. Mounted on `/broadcaster` and `/radio`. **Not** injected into existing chat/feed pages.

---

## 7. Notifications

Reuse the existing notification toast surface — emit `toast()` events from `broadcaster-store` when a watched widget goes live or "starts in 10 min". No changes to the notification table or feed notifications.

---

## 8. Analytics

Compute from `radio_widget_state` + presence already tracked by `use-presence-heartbeat`. No new tracking pipelines this turn — peak/avg computed from a small rolling buffer in `radio_widget_state` (`peak_listeners_24h`, `last_24h_samples jsonb`) updated by the same auto-live tick.

---

## 9. Out of scope (explicit)

- Real WebRTC voice transport between host browser and listener browsers.
- Server-side cron (would require pg_cron); we use a client tick from the host's open Broadcaster page + a fallback "refresh" RPC for listeners.
- Modifying any existing chatroom radio widget, DjFooter, YouTube player, feed, auth, XP, streak, or notification code.

---

## 10. Order of execution

1. Migration (tables, grants, RLS, exclusion constraint, realtime).
2. `broadcaster.functions.ts` + `broadcaster-store.tsx`.
3. Route shell + gate + dashboard.
4. Widgets CRUD modal, schedule manager (with overlap check), queue manager, mic panel, analytics tab.
5. Public `/radio` directory + ticker component.
6. Disclaimer admin edit (inline on dashboard for admins).
7. Smoke check via preview + tsc.

Once approved I'll start with the migration call so the schema is in place before any code references it.
