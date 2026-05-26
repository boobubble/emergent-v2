## Goal

Replace the current chat-only `!ludo` text command with a real realtime multiplayer Ludo system inside a dedicated `/games` route, fully wired to the existing auth, profiles, XP/streaks, and notifications.

This is a large feature. I'll ship it in 3 phases so you can sanity-check after each one, instead of one giant unreviewable change.

---

## Phase 1 — Foundation (DB + /games route + Quick Match 1v1)

### Database (migration)

New tables, all with RLS:

- `games` — `id, game_type ('ludo_1v1' | 'ludo_4p'), status ('waiting'|'active'|'finished'|'cancelled'), visibility ('public'|'private'), created_by, winner_id, current_turn_seat (int), turn_started_at, state (jsonb — board/tokens/dice), created_at, started_at, finished_at`
- `game_players` — `id, game_id, user_id, seat (0..3), color, score, joined_at` (unique `game_id+seat` and `game_id+user_id`)
- `game_invites` — `id, sender_id, receiver_id, game_id, status ('pending'|'accepted'|'rejected'|'cancelled'|'expired'), created_at, responded_at`
- `game_rewards` — `id, user_id, game_id, reward_type ('win'|'participation'|'daily_first'|'streak_bonus'), xp, coins, created_at`

RLS:
- `games` / `game_players`: any authenticated user can read; only players in the match (or `created_by` for waiting) can update; insert via server functions only (or `created_by = auth.uid()`).
- `game_invites`: sender or receiver can read; sender can insert; receiver can update status.
- `game_rewards`: user can read own; insert via server function only.

Realtime: enable `supabase_realtime` publication for `games`, `game_players`, `game_invites`.

Anti-abuse server-side checks:
- Max 1 reward of type `win` per `game_id`.
- Daily XP cap from Ludo (e.g. 200 XP / day) enforced in the award server fn.
- A match must have ≥2 distinct users with ≥10 real turns before paying `win` XP (fake-match guard).
- 60s cooldown between match creations per user.

### Server functions (`src/lib/games.functions.ts`, `requireSupabaseAuth`)

- `createLudoMatch({ type, visibility })` → returns `gameId`
- `joinQuickMatch({ type })` → joins oldest `waiting` public match or creates new
- `inviteToGame({ gameId, friendId })`
- `respondToInvite({ inviteId, accept })`
- `setReady({ gameId })` + auto-start when all seats ready
- `rollDice({ gameId })` — server-authoritative (server rolls, validates turn, advances)
- `moveToken({ gameId, tokenIndex })` — server validates legal move, updates state, hands over turn, detects win
- `leaveGame({ gameId })`
- `awardMatchRewards({ gameId })` — called once on win; writes `game_rewards` + `profiles.xp/coins/streak`

All mutations server-authoritative; clients never write to `games.state` directly.

### Route: `src/routes/games.tsx`

Mobile-first layout (matches existing dark theme + tokens in `styles.css`):
- Header: "Games" + quick-match buttons (1v1, 4P)
- "Start Ludo" → invite popup (friends list pulled from existing `friendships`)
- Active matches panel (your in-progress games)
- Online friends strip (avatars, click to invite)
- Pending invites toast list (realtime)

Sidebar entry: add **Games** link in the existing chat sidebar.

### Quick Match Ludo board (2P)

- Lightweight SVG board (no canvas/3D), ~52-square track, 2 tokens per player (short variant — keeps it fast and mobile-friendly; full 4-token version comes in Phase 2).
- Realtime channel `game:{id}` subscribed to `games` + `game_players`.
- Dice button only enabled on your turn; tap → calls `rollDice` server fn → server pushes new state via realtime.
- Tap a movable token → `moveToken`.
- Animated token slide using framer-motion (already idiomatic in the codebase via CSS).

### Notifications

Reuse existing `notifications` table:
- `kind: 'game_invite'` (target_type 'game', target_id = game_id, payload {from, game_type})
- `kind: 'game_started'`
- `kind: 'game_won'`

Existing realtime listener on `notifications` will surface them automatically.

---

## Phase 2 — 4-Player + Full Ludo Rules + Leaderboard

- Add proper 4-token Ludo: home yard, safe squares, capture (send to base), exact-roll-to-home, 6 grants extra turn.
- 4-player matches with team-less free-for-all.
- `/games/leaderboard` panel: top winners (weekly/all-time) from `game_rewards` aggregation.
- "Recent winners" + "Daily rewards" widgets on `/games`.
- Win share to feed (post auto-composed with badge image).

## Phase 3 — Polish & Abuse Hardening

- Reconnect handling: if a player drops, 30s grace then auto-forfeit.
- Turn timer (20s) with auto-skip after timeout to prevent stale games.
- Achievement badges: `ludo_first_win`, `ludo_streak_5`, `ludo_champion` (10 wins).
- Mobile polish: haptic on dice roll, larger tap targets, board rotates to face current player on phones.
- Daily-game-bonus, winning-streak detection, and farming protection refined with telemetry.

---

## What gets removed / changed in the current app

- The old chat `!ludo` / `!join` / `!lr` text commands stay as a quick fallback in the **Games** chat room only — they will be marked "legacy text mode" and the UI will steer users to `/games`.
- The "games" chat room (added earlier) becomes the social companion to `/games` — wins post a system message there.

---

## What I need from you before starting

1. **Confirm scope of Phase 1** — happy with quick-match 1v1 first, then 4P in Phase 2? Or do you want 4P shipped immediately (Phase 1 ~doubles in size)?
2. **Reward magnitudes** — propose: win = 25 XP + 10 coins, participation = 5 XP, daily first win = +15 XP bonus, daily cap = 200 XP. OK or different numbers?
3. **Match access** — only friends can invite, or any user can invite anyone? (I'll default to: friends OR anyone-in-same-chat-room.)
4. **Anonymous/guest users** — they currently chat. Should guests be allowed to play Ludo, or signed-in users only? (Recommend signed-in only to avoid reward farming via throwaway guest accounts.)

Once you confirm, I'll run the Phase 1 migration first (you'll see the approve prompt), then build the route + server fns + board in the same turn.