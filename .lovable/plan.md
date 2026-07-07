## Wallet-First Refactor

Centralize all coin mutations behind `wallet_apply`. No behavior changes — same prices, same reasons, same UX. Only the plumbing moves.

### 1. Harden `wallet_apply` (single source of truth)

Update the RPC so every gated debit auto-checks `coin_feature_flags`:

```text
kind → feature
  wallpaper, premium_theme, frame, gift, bubble, username_effect → cosmetics/<kind>
  competition_entry                                                → competitions
  trio_create_room, trio_join_room                                 → trio_rooms
  profile_unlock                                                    → profile_unlock
  fish_reward, dig_reward, wine_reward, game_reward                → games
```

If the feature row exists and `enabled = false`, `wallet_apply` raises `feature disabled`. Missing rows default to enabled (backward compatible). All other validation (frozen wallet, insufficient balance, dedupe by `(provider, reference_id)`, atomic profile + ledger update, lifetime counters) stays as-is.

Seed `coin_feature_flags` with the new feature keys (default enabled) so admins can toggle them from `/admin/wallet`.

### 2. Migrate existing coin-spending RPCs to delegate

Rewrite the bodies of these functions to call `wallet_apply(...)` instead of `UPDATE profiles SET coins = coins - N` + manual `INSERT INTO coin_transactions`. Prices, permissions, side-effects, and return shapes are unchanged.

| Function | New `_kind` | `_reference` |
|---|---|---|
| `create_trio_room` | `trio_create_room` | `trio_create:<new_room_id>` |
| `accept_trio_invite` | `trio_join_room` | `trio_join:<room>:<uid>` |
| `unlock_chat_theme` | `premium_theme` | `chat_theme:<uid>:<key>` |
| `unlock_feed_theme` | `premium_theme` | `feed_theme:<uid>:<key>` |
| `unlock_profile_visitor_history` | `profile_unlock` | `profile_visitors:<uid>` |

`purchase_dm_wallpaper` already routes through `wallet_apply` — no change.

### 3. No client changes

Every feature already calls its RPC (`unlock_chat_theme`, `accept_trio_invite`, etc.) — the wallet integration happens inside those functions, so `src/` code stays untouched. New/future features simply call `wallet_apply` directly with a new `_kind`.

### 4. Out of scope (already correct or non-existent today)

- Games (fish/dig/wine), profile frames, gifts, chat bubbles, username effects, competitions — no coin-spending RPCs exist yet in the codebase. When they're built, they'll call `wallet_apply` directly per the pattern above.
- Daily rewards, admin credit/debit, coin purchases, subscription bonuses — already route through `wallet_apply` (`claim_daily_reward`, `admin_adjust_coins`, `admin_approve_coin_order`).

### Deliverable

One SQL migration:
- `CREATE OR REPLACE FUNCTION wallet_apply(...)` with feature-flag gate.
- `CREATE OR REPLACE FUNCTION` for the 5 RPCs above, delegating to `wallet_apply`.
- `INSERT ... ON CONFLICT DO NOTHING` seeds for new feature flags.

No table changes. No client code changes. No behavior changes.
