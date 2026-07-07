# Arrow Flow — New Game Room Game

A new original path-connection puzzle plugged into the existing Game Room framework. No changes to Game Rooms, Wallet, XP, Gamification, Notifications, Leaderboards, Admin panel, Game Registry or Spectator plumbing — Arrow Flow is one new registry entry + one lazy-loaded game module + one admin sub-page + one migration for levels/scores.

## Scope

In scope for this ship:
- New game key `arrow-flow` in the games registry, lazy-loaded.
- Original BooBubble UI: rounded / glass, dark+light, smooth 60fps.
- Story + Practice + Daily Challenge modes wired end-to-end.
- Level system stored in DB (unlimited levels, admin-managed, no code redeploy).
- Scoring, 1–3 stars, timer, moves, hints (Wallet-paid), restart, leave.
- Leaderboards: fastest time, least moves, highest score, today / week / friends / room / global.
- System-event feed messages (auto only, no chat).
- Spectator view reusing existing spectator infra.
- Replay of finished puzzle (move-sequence replay, no video).
- Anti-cheat validation server-side before any leaderboard write.
- Admin → Games → Arrow Flow page: levels CRUD + tournament + daily + hints config.
- Gamification events emitted through existing `gamify()`.

Deferred (future-ready, not built now): Weekly Challenge scheduling UI, Tournament bracket UI, Endless Mode, Ghost racing (schema+replay data will support it, UI ships later), Season Pass hooks (events fire, no new pass logic).

## Gameplay

Grid of square tiles. Each tile holds a path piece with 2–4 arrow endpoints:
- Straight (2 opposite endpoints)
- Curve (2 adjacent endpoints)
- T-junction (3 endpoints)
- Cross (4 endpoints)
- Source (1 endpoint, glowing "start")
- Sink (1 endpoint, glowing "goal")

Tap / click a tile → rotates 90° clockwise. Long-press / right-click → 90° counter-clockwise. Keyboard: arrow keys move a focus cursor, `Space`/`Enter` rotates, `Shift+Space` reverse-rotates, `R` restart, `H` hint. Solved when every endpoint of every piece connects to a matching endpoint of a neighbor AND the graph forms one continuous path from Source to Sink covering every non-empty tile.

Each level ships with a canonical solution (rotation for every tile). Puzzle generator (used only inside the admin builder) guarantees unique solvability.

## Difficulty Presets

| Difficulty | Grid  | Piece Types              | Move Limit | Reward multiplier |
| ---------- | ----- | ------------------------ | ---------- | ----------------- |
| Easy       | 4×4   | straight, curve          | ∞          | 1.0×              |
| Normal     | 5×5   | + T                      | 40         | 1.5×              |
| Hard       | 6×6   | + cross                  | 60         | 2.0×              |
| Expert     | 7×7   | + multi-branch obstacles | 80         | 3.0×              |
| Master     | 8×8   | + locked tiles           | 100        | 5.0×              |

Difficulty stored per level (admin can override any preset per level).

## Data Model (new tables)

`arrowflow_levels` — one row per authored level. Columns: `id uuid`, `level_number int`, `difficulty text`, `grid_size int`, `layout jsonb` (piece grid + scrambled rotations), `solution jsonb` (canonical rotations), `par_moves int`, `par_time_ms int`, `coin_reward int`, `xp_reward int`, `is_featured bool`, `is_enabled bool`, `version int`, `created_by uuid`, `created_at`, `updated_at`. RLS: SELECT to authenticated, write to admins only.

`arrowflow_scores` — best-per-user per level for leaderboards. Columns: `id`, `user_id`, `level_id`, `room_id text nullable`, `time_ms int`, `moves int`, `hints_used int`, `score int`, `stars smallint`, `perfect bool`, `mode text` (story|daily|practice|tournament), `move_log jsonb` (compact rotation sequence for replay + anti-cheat), `client_signature text`, `created_at`. Unique on `(user_id, level_id, mode)` — updated only when new score beats existing. RLS: SELECT to authenticated, INSERT/UPDATE via server function only.

`arrowflow_daily` — one row per day picking a level and reward bonus. Columns: `date`, `level_id`, `bonus_coins`, `bonus_xp`. Read-all-auth, write admin.

Admin config lives in existing `app_settings` under key `arrowflow` (hint cost, max hints, free daily hints, featured level ids, tournament active).

## Server Functions

All under `src/lib/arrowflow.functions.ts` (client-safe module, handlers use `requireSupabaseAuth`).

- `getLevels({ difficulty?, page? })` → list enabled levels (id/number/difficulty/grid/par/rewards). No `solution` sent to client.
- `getLevel({ id })` → single level with `layout` + `par` + `rewards`. Still no `solution`.
- `getDailyChallenge()` → today's level id + bonuses.
- `submitScore({ levelId, mode, timeMs, moves, hintsUsed, moveLog, roomId? })` → server:
  1. Loads level + solution.
  2. Replays `moveLog` from `layout` and verifies final state matches `solution`.
  3. Rejects if: replay fails, `timeMs < moves * 120ms` (impossible speed), `moves > moveLimit * 2`, duplicate submission within 3s, `moveLog.length !== moves`.
  4. Computes score = `base(difficulty) + timeBonus + moveBonus - hintPenalty` and stars from thresholds.
  5. Upserts into `arrowflow_scores` only if better than existing row for `(user, level, mode)`.
  6. Calls `wallet_apply()` for coin reward (base × difficulty multiplier, + daily bonus if daily mode).
  7. Calls existing `gamify()` with events `arrowflow.started` (on start via separate fn) / `arrowflow.completed` / `arrowflow.perfect` (par-or-better + zero hints) / `arrowflow.record.broken` (beat previous room best) / `arrowflow.daily.completed` / `arrowflow.tournament.completed`.
  8. Pushes a `SystemEventFeed` message via existing `pushSystem()` on the room (`🏆 …`, `🔥 …`, `⭐ …`, `💎 …`).
  9. Returns `{ score, stars, coinsAwarded, xpAwarded, newRecord, personalBest }`.
- `buyHint({ levelId })` → checks free-daily-hint counter in `user_inventory` (`arrowflow_hint_free_used`), else `wallet_apply({ type: "spend", reason: "arrowflow.hint", amount: hintCost })`. Returns one hint reveal (which piece needs rotation and to which orientation). Persists count of hints used for the run in an in-flight session (server fn `startRun` returns `runId`, `buyHint` writes against it; `submitScore` reads it to prevent client-side hint under-reporting).
- `getLeaderboard({ levelId, scope: "global"|"today"|"week"|"friends"|"room", roomId? })` → top 50 with user_id, display name, score, time, moves, stars.
- `getReplay({ scoreId })` → `moveLog` + level `layout` (client re-plays step by step). Owner or friends only.

Rate limiting: `submitScore` and `buyHint` protected by an in-memory + DB throttle (existing wallet rate limiter).

## Client Structure

New files:
```
src/components/games/rooms/ArrowFlowGame.tsx     — main game view
src/components/games/rooms/arrow-flow/
  Board.tsx              — SVG grid renderer, framer-motion rotate
  Tile.tsx               — one piece, glassmorphism, glow when powered
  HUD.tsx                — timer, moves, score, stars preview
  ControlsBar.tsx        — restart, hint, leave
  ResultDialog.tsx       — win screen: stars, rewards, next level
  LeaderboardPanel.tsx   — scoped leaderboard tabs
  ReplayViewer.tsx       — step-through replay
  Spectator.tsx          — read-only view for spectators (uses existing presence)
  useArrowFlowEngine.ts  — pure client engine (rotate, validate, score preview)
  logic.ts               — piece geometry, connection graph, solved-check
src/lib/arrowflow.functions.ts                   — server RPC
src/routes/admin.arrowflow.tsx                   — admin CRUD page
```

Registry entry (existing `src/lib/games-registry.tsx`):
```ts
"arrow-flow": {
  key: "arrow-flow",
  label: "Arrow Flow",
  description: "Rotate the pieces so the path connects source to sink.",
  icon: Route,   // lucide "Route" icon
  Component: lazy(() => import("@/components/games/rooms/ArrowFlowGame")),
}
```

`ArrowFlowGame` is the game component the registry passes into `GameRoomCanvas`. It reads the current room's `game.difficulty` for level selection, mounts `HUD` + `Board` + `ControlsBar`, opens `ResultDialog` on solve, and shows `LeaderboardPanel` in a drawer (bottom sheet on mobile, side sheet on desktop). Spectator vs player is decided from existing `MembersPanel` role — non-owner spectators mount `Spectator.tsx` instead of the interactive board.

## UI / Visual Direction (original)

- Palette: BooBubble primary + accent, path glow uses `--primary` with `hsl(... / 0.6)` outer glow.
- Pieces are thick rounded strokes on frosted-glass tiles (`bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl`).
- Rotation uses `motion.div animate={{ rotate: r * 90 }}` with spring `{ stiffness: 220, damping: 22 }`.
- Powered path animates a slow moving gradient dash along the SVG stroke (`stroke-dashoffset` keyframe).
- Source tile has a soft pulsing ring, sink tile has an unlit ring that lights up when the puzzle solves.
- Solve moment: confetti burst reusing existing `Sonner` toast + a one-off `palrgo:buzz` event so the achievement toast in `ChatApp` fires.
- Dark and light both driven by existing tokens — no hardcoded colors.
- All copy uses BooBubble brand voice.
- No asset, sprite, icon, sound, or level from any reference game — all art is CSS/SVG.

## Controls Detail

- Click / tap tile → +90°.
- Right-click / long-press (400ms) → -90°.
- Keyboard: arrows move focus ring, Space rotates, Shift+Space reverse, R restart, H hint, L leaderboard.
- Focus ring is a `outline-2 outline-primary/70 offset-2` on the focused tile, fully keyboard accessible.
- All buttons have `aria-label`; timer announced via polite live region every 10s only.

## Scoring Formula

```
base       = { easy:100, normal:200, hard:400, expert:800, master:1600 }[difficulty]
timeBonus  = max(0, (par_time_ms - time_ms) / par_time_ms) * base
moveBonus  = max(0, (par_moves - moves) / par_moves) * base * 0.5
hintPenalty= hintsUsed * (base * 0.1)
score      = round(base + timeBonus + moveBonus - hintPenalty)
stars      = score >= base*1.8 ? 3 : score >= base*1.2 ? 2 : 1
perfect    = moves <= par_moves && hintsUsed === 0 && time_ms <= par_time_ms
```

Formula lives server-side inside `submitScore` — client shows a preview only.

## System Events

`SystemEventFeed` already renders `state.messages[roomId]` where `kind === "system"`. `submitScore` calls `pushSystem(roomId, { text, icon })` for:
- `🏆 {name} completed Level {n}.`
- `🔥 {name} broke the room record.`
- `⭐ {name} achieved a Perfect Solve.`
- `💎 {name} earned {coins} Coins.`
- `🚀 Daily Challenge completed.`

## Admin Page

`/admin/arrowflow` (linked from Admin → Games):
- Level list table (number, difficulty, grid, par time/moves, rewards, enabled toggle, featured toggle, actions).
- New/Edit dialog: generator (pick difficulty → generates a valid puzzle → previews board → author tweaks par values + rewards → save). Generator lives client-side in `logic.ts`, run under a Web Worker so it doesn't block UI on 8×8 Master.
- Daily challenge picker (calendar → level).
- Tournament toggle + entry-fee/prize (writes to `app_settings.arrowflow.tournament`).
- Hint economy: cost per hint, max hints per level, free daily hints.

## Performance

- Registry `Component` stays `React.lazy(() => import(...))` so the chunk only loads inside a game room. `logic.ts` and `Board.tsx` are imported only by `ArrowFlowGame`, so normal chatrooms load zero Arrow Flow code.
- Board renders as a single SVG with per-tile `<g>` groups; motion uses transform-only (no layout thrash).
- Web Worker for admin generator; client-side solver runs on the main thread only for the tiny "is-solved?" check (O(gridSize²)).

## Migration Order

1. Create tables + grants + RLS (per public-schema-grants rules) + policies.
2. Seed 15 starter levels (3 per difficulty) via `insert` tool.
3. Add default `app_settings.arrowflow` config.

## Out of Scope / Not Touching

- Existing `ArrowPuzzleGame`, `GameRoomCanvas`, `GameHeader`, `SystemEventFeed`, `Sidebar`, `MembersPanel`, `ChatApp`, wallet, XP, gamification engine, notifications infra, spectator plumbing. All reused as-is.

---

Approve to build. First-turn deliverable will be: migration + server functions + game module + registry entry + admin page + 15 seed levels + registration under Admin → Games. Weekly/Tournament UIs, Endless mode, Ghost racing, Season Pass hooks are future-ready via existing events but not implemented in this pass.
