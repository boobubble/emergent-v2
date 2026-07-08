# Path Escape — Phased Build Plan

Original puzzle game (arrow-path connection genre) plugged into existing BooBubble systems. No existing feature (Wallet, XP, Gamification, Achievements, Notifications, Leaderboards, Game Rooms, Admin, Tournaments) is rebuilt — Path Escape only registers with them.

Because the previous Path Flow attempt was rolled back after being built end-to-end, this build is split into shippable phases. Each phase is independently testable and leaves the app in a working state. We stop after each phase for your OK.

---

## Design principles (apply to every phase)

- Original code, art, sounds, level data. No copied assets or names.
- SVG-only board rendering, mobile-first, board fills viewport (fix from Path Flow).
- All Coins/XP go through `wallet_apply()` and the existing gamification engine — no reward code inside the game.
- Server-authoritative scoring. Client never grants rewards.
- Emits only the `pathescape.*` event keys — engine handles achievements/quests/missions.
- Deterministic level format + solver-based validation → guarantees single-solution.
- Lazy-loaded from the game registry; nothing loads outside a Game Room hosting it.

---

## Phase 1 — Foundation (DB + engine + minimal playable)

- Migration: `pathescape_levels`, `pathescape_progress`, `pathescape_scores` (with GRANTs + RLS).
- Level format: JSON (`grid_w`, `grid_h`, `pieces[{id,cells[{r,c,dir}],startR,startC}]`, `solution[]`, `par_moves`, `par_time`).
- Pure engine module (`logic.ts`, `useEngine.ts`) — reused later by validator, solver, replay.
- Auto-fitting SVG board (camera math, no CSS scale) — the correct version of the Path Flow board.
- Register `path-escape` in `games-registry`, add "Path Escape" seed game room.
- RPC `pathescape_submit_score` calls `wallet_apply()` + emits `pathescape.*` events.
- Playable Story mode with 3 hand-authored seed levels for smoke testing.

Deliverable: a working game inside a Game Room, coins/XP credited via wallet, no admin UI yet.

---

## Phase 2 — Admin Level Builder

- Route `/admin/pathescape` with tabs: **Levels**, **Settings**, **Analytics** (empty tab), **Daily/Weekly** (empty tab).
- Visual grid editor (place pieces, set arrows, mark solution).
- Actions: Create, Duplicate, Preview, Test Play, Import/Export JSON, Bulk enable/disable/delete, Draft/Publish, Schedule release, Version history (row per save).
- **Solver-based validation** on save: rejects unsolvable, multi-solution, or disconnected levels. This is what guarantees "only one correct answer".
- Difficulty enum + filter/search.

Deliverable: unlimited admin-authored levels, no code deploys.

---

## Phase 3 — Modes: Daily Challenge + Weekly Tournament

- `pathescape_daily` table + `pathescape_current_daily()` RPC (seeded from published level pool by date).
- Weekly tournament: reuse existing tournament engine — Path Escape only registers an event source and submits scores. No new tournament engine.
- Countdown, per-mode leaderboards (Daily, Weekly, All-time) via existing leaderboard reads scoped by `mode`.
- Practice + Endless flags on the mode selector (Endless behind a feature flag, no gameplay yet).

Deliverable: three live modes, all wired to existing leaderboard/tournament infra.

---

## Phase 4 — Lives, Hints, Ghosts, Replay

- Lives system (Admin: Unlimited / 3 / 5 / Energy regen / Coin refill). Regen job via existing scheduler.
- Hint flow calls existing `wallet_apply()` with configurable cost, cooldown, free-daily.
- Replay: store move log (`[{pieceId, from, to, t}]`) on score submission; deterministic playback from log + level id (no video).
- Ghost mode: overlay best replay (Personal / Friend / Room / World) — reuses same replay format.

Deliverable: full single-player loop feature-complete.

---

## Phase 5 — Room + Spectator + System Events

- Path Escape rooms: hide chat composer, center = game, bottom = system-event feed (already-existing `pushSystem`).
- Spectator view: read-only board + live moves/timer/progress via existing realtime channel used by other games.
- System event templates for start / complete / perfect / record / coins earned.

Deliverable: full multiplayer-shell parity with other Game Room games.

---

## Phase 6 — Anti-cheat + Analytics + Polish

- Server validators: min-time-per-move floor, replay ↔ final-state check, per-user submit rate limit, idempotency key on submit, HMAC on move log.
- Admin Analytics tab: Players Online, Started/Finished, Avg Time/Moves, Completion %, Hint Usage, Most Failed/Played/Abandoned Level, Retention hooks (feeds existing analytics tables).
- Sound + music + haptics toggles (assets: original short SFX only; no music track by default — user can upload one).
- Achievements: seed the listed set as rows in the existing achievements table (no new engine).
- Save/Resume: `pathescape_progress` persists in-flight state; auto-resume on reopen.

Deliverable: production-ready game.

---

## Technical notes (for the technical reader)

- **Import protection**: server logic in `*.functions.ts` under `src/lib/`; admin/service-role reads inside handler bodies via `await import('@/integrations/supabase/client.server')`.
- **Solver**: DFS with pruning over piece placements; used both for admin validation and daily-level generation from a template pool.
- **RLS**: `pathescape_levels` — public SELECT on `enabled=true` only; admin write via `has_role('admin')`. `pathescape_scores`/`pathescape_progress` scoped to `auth.uid()`.
- **Board rendering**: bounding-box camera → cell size = `min(availW/cols, availH/rows)`; SVG viewport; no CSS scale.
- **Event keys reserved**: `pathescape.started|completed|failed|perfect|record|daily|weekly|tournament`.
- **No new schemas** in `auth`, `storage`, `realtime`, `supabase_functions`, `vault`.

---

## What I need from you before I start Phase 1

1. Confirm the working name **Path Escape** and the URL slug **`/admin/pathescape`** (both admin-renameable later).
2. Confirm phased delivery — I will stop after each phase for your review, not build all six in one go.
3. Confirm you're OK with the DB migration in Phase 1 creating three new tables + one RPC (all Path-Escape-prefixed, no touches to shared tables).

Reply "go phase 1" and I'll start.
