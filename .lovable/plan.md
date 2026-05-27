# Rewards Economy — Build Plan

A lot of this already exists in the project. The plan focuses on filling the gaps without rebuilding what works.

## What's already shipped (keep as-is)
- XP, level, coins, streak, longest_streak on `profiles`
- `gamification.functions.ts` — `awardXp`, `pingDailyStreak` (server-only, trigger-protected)
- Badges/achievements (`src/lib/achievements.ts`, `AchievementsPanel`, `/achievements`)
- Leaderboard with XP + Streak tabs (`LeaderboardPanel`)
- Daily Challenges widget
- Games + `game_rewards` table with XP/coins payouts
- Ludo with start/stop commands

## What we'll add

### 1. Transactions ledger (audit + UI history)
New table `coin_transactions` (user_id, amount, reason, ref_type, ref_id, created_at). All coin/XP awards routed through a single server fn `awardReward({ kind: 'xp'|'coins', amount, reason, refType?, refId? })` that writes the ledger + updates profile atomically (admin client). Existing `awardXp` becomes a thin wrapper.

### 2. Daily login chest + spin
- Extend `pingDailyStreak` server fn to also award coins on the day's first login: Day 1=+20, Day 2=+25, Day 3=+30, Day 4=+40, Day 5=+50, Day 6=+75, **Day 7=+150 chest** (cycle resets).
- New `DailyChestWidget` on the feed sidebar showing today's reward, 7-day calendar, and a single "Claim" button (only enabled once per day — idempotent server-side via `last_active_day`).
- "Daily Spin" — one free spin per day (anti-farm same-day guard server-side) with weighted prizes: 10/20/50/100 coins, 25 XP, 50 XP. Lightweight wheel using framer-motion rotate; no gambling copy.

### 3. Coins leaderboard tab
Add a third tab to `LeaderboardPanel` ("Top Coins") sorting by `profiles.coins` desc.

### 4. Rank titles
Pure function `rankTitle(level)` → Newcomer (1–4), Regular (5–9), Veteran (10–19), Elite (20–34), Legend (35+). Surface in `ProfilePanel`, leaderboard rows, message author tooltip. Tiny coloured chip.

### 5. Shop (cosmetics only — no gambling)
New table `user_inventory` (user_id, item_id, equipped, acquired_at). Static item catalog in `src/lib/shop-catalog.ts`:
- Profile frames (4 designs)
- Username colors / gradient text effects (5)
- Animated emoji reaction packs (3)
- Profile themes (3 accent palettes)

New `ShopPanel` reachable from feed sidebar. Server fn `purchaseItem(itemId)` validates price ≤ coins, debits via ledger, inserts inventory. Equipped items applied in `Avatar`, profile header, message author name. No resale, no trading.

### 6. Game anti-farming
- Server-side cooldown: `game_rewards` insert only allowed if previous reward for same `(user_id, game_type, reward_type)` is older than 60s.
- Min duration: Ludo `finished_at - started_at >= 60s` for full reward, otherwise 25% payout.
- Max 10 game rewards per user per day per game_type → excess clamped to 25%.
- All enforced in a new `awardGameReward` server fn (replaces direct client writes; `game_rewards` already blocks client INSERT).

### 7. UI polish (mobile-first, lightweight)
- Compact `RewardsWidget` on the feed sidebar: XP bar + level chip + coin balance + "Claim daily" pill.
- Toast (sonner) on every reward: `+50 🪙 Ludo win`, `+100 ⭐ Daily chest`.
- All new panels lazy-loaded like the existing feed panels.

## Technical notes

```text
DB migrations:
  - coin_transactions (id, user_id, kind, amount, reason, ref_type, ref_id, created_at)
    GRANT SELECT TO authenticated (own rows only via RLS); INSERT blocked to clients
  - user_inventory (user_id, item_id, equipped, acquired_at)
    RLS: read own + read others' equipped items for display
  - extend prevent_gamification_field_changes trigger to ignore coin writes from service_role (already does)

Server fns (src/lib/rewards.functions.ts):
  - awardReward (admin, logged, idempotency-key optional)
  - claimDailyChest (calls pingDailyStreak + awardReward day-bonus)
  - spinDailyWheel (cooldown 24h via last spin in ledger)
  - awardGameReward (cooldown + duration + daily cap)
  - purchaseItem (atomic: check balance → debit → insert inventory)
  - getInventory / getTransactions (auth-middleware, own rows)

Client:
  - src/components/feed/RewardsWidget.tsx (sidebar)
  - src/components/feed/DailyChestPanel.tsx (modal/panel)
  - src/components/feed/SpinWheel.tsx
  - src/components/feed/ShopPanel.tsx
  - extend LeaderboardPanel with "Coins" tab
  - extend Avatar / ProfilePanel to render equipped frame + username effect
  - src/lib/ranks.ts (rankTitle)
  - src/lib/shop-catalog.ts (static items)
```

No new dependencies. All animations via existing framer-motion + tailwind. Mobile widgets reuse rounded-2xl/bg-card patterns already in `AchievementsPanel`/`LeaderboardPanel`.
