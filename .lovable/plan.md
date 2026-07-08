# Path Flow — Build Plan

Original path-connection puzzle (inspired by the reference video, no copied assets), plugged into the existing Game Room system. **All existing infra reused**: Game Rooms, Wallet, XP, Gamification, Leaderboards, Notifications, Spectator, Admin Panel.

## Scope for this build (MVP that feels complete)

**In**
- Gameplay: grid board, draggable path-piece groups, snap-to-grid, no-overlap, one-solution validation, smooth motion (Framer Motion).
- HUD: level #, difficulty, timer, moves, 3-star rating, hint, restart, pause, leave.
- Level system: fully data-driven table `pathflow_levels` (no hardcoded levels). Admin CRUD + JSON import/export + preview.
- Star + progression: per-user `pathflow_progress` (highest level, stars, best time, best moves, perfect solves) + `pathflow_scores` for leaderboards.
- Hint system: consumes coins via existing `wallet_apply` RPC; hint cost + free daily hints stored in `app_settings`.
- Daily Challenge: one deterministic level per day (chosen server-side from featured pool), shared across all users, own leaderboard.
- Leaderboards: global / daily / room (fastest time, least moves) via existing leaderboard patterns.
- System event feed: post `system` messages ("Rahul completed Level 12", "⭐ Perfect Solve", "🔥 New room record").
- Gamification events: `pathflow.started/completed/perfect/record.broken/daily.completed`.
- Registry entry + lazy-loaded module (only loads inside Game Rooms).
- Admin page: `/admin/pathflow` — levels CRUD, difficulty, rewards, hint economy, daily-challenge picker, enable/disable, JSON I/O.
- Original BooBubble UI: glassmorphism cards, dark/light, mobile-first, 60fps drag.
- Server-side anti-cheat: min-time floor, min-moves floor, dedupe per (user, level, day), reject impossible submits.

**Deferred (called out, not built now)** — noted in `.lovable/plan.md`:
- Replay recording, Ghost Mode races, Weekly Tournaments, Friend leaderboards tab, Rotate-enabled levels, Haptics, Badges/Frames unlocks. All can plug into the same tables later.

## Data model (new tables, all with GRANTs + RLS)

```text
pathflow_levels           admin-writable, public-readable when enabled=true
  number, difficulty, grid_w, grid_h, layout(jsonb), solution(jsonb),
  par_moves, par_time, coin_reward, xp_reward, enabled, version, featured

pathflow_progress         one row per user
  user_id PK, highest_level, stars_total, perfect_solves,
  best_times(jsonb), best_moves(jsonb), completion_pct

pathflow_scores           one row per (user, level, kind='level'|'daily')
  user_id, level_id, kind, day_key, time_ms, moves, hints_used,
  stars, perfect, created_at

pathflow_daily            one row per day
  day_key PK, level_id, participants, fastest_time_ms, least_moves
```

Plus RPCs: `pathflow_submit_score(...)` (validates + writes score + progress + emits gamification), `pathflow_buy_hint(...)` (calls `wallet_apply`), `pathflow_daily_current()`.

## Files

```text
src/components/games/rooms/PathFlowGame.tsx         entry, lazy-loaded
src/components/games/rooms/path-flow/
  Board.tsx           grid + pieces + drag
  Piece.tsx           SVG arrow-piece renderer
  HUD.tsx             timer/moves/stars/hint/restart
  ResultDialog.tsx    win screen with stars + rewards
  LeaderboardPanel.tsx
  useEngine.ts        game state machine
  logic.ts            pure grid math + solution validation + star calc
src/lib/pathflow.functions.ts   server fns (list levels, submit, buy hint, daily)
src/routes/admin.pathflow.tsx   admin CRUD page
supabase migration              tables + RLS + GRANTs + RPCs
```

Registry: add one entry in `src/lib/games-registry.tsx`. Chat-store: seed one "Path Flow" game room. AdminNav: add `/admin/pathflow` under Community → Games.

## Technical notes

- Levels stored as `layout: { pieces: [{id, cells:[{r,c,dir}]}] }` and `solution: { pieces: [{id, r, c}] }` — piece = connected group of directional cells; solution stores each piece's top-left offset in the final grid.
- Solved-check: place all pieces at their current positions → the union of arrows must exactly equal the solution's arrow map, no overlaps, no cell left uncovered by an arrow of the target path.
- Drag uses pointer events + Framer Motion `useMotionValue`, snap on release.
- Hints reveal one correct piece placement (animates it home); each hint costs coins via `wallet_apply` (`_kind: 'pathflow_hint'`, `_direction: 'debit'`).
- Anti-cheat in `pathflow_submit_score`: reject `time_ms < par_time * 0.25`, `moves < solution_pieces`, and dedupe same (user, level, day).
- Star formula: 3 = perfect (0 hints, ≤ par_moves, ≤ par_time); 2 = ≤ par_time OR ≤ par_moves; 1 = completed.

## Delivery order

1. Migration (tables + RLS + GRANTs + RPCs) → wait for approval.
2. Registry + chat-store seed + AdminNav entry.
3. Engine + Board + HUD + ResultDialog + logic.
4. Server fns + hint flow + score submit + daily fetch.
5. Admin CRUD page with JSON import/export + preview.
6. Update `.lovable/plan.md` with what's shipped + what's deferred.

Reply **approve** to proceed, or tell me what to add/cut.
