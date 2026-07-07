# Wallet & Coins Store

Builds on the existing `coin_transactions` + profile coin balance. No second currency. Everything routes through one atomic RPC so future features (wallpapers, gifts, games, competitions) just call it.

## 1. Database

### Extend `profiles`
- `coins_balance` (already exists) — kept as the source of truth.
- `coins_lifetime_earned`, `coins_lifetime_spent`, `coins_purchased_total`, `coins_bonus_total` (int, default 0).
- `wallet_frozen` (bool, default false).

### Extend `coin_transactions`
Add columns (backfill-safe):
- `kind` enum: `purchase | reward | competition | gift_in | gift_out | wallpaper | premium_theme | game_reward | admin_bonus | refund | transfer_in | transfer_out | daily_login | streak_bonus | subscription_grant | spend_other`
- `direction` (`credit` | `debit`)
- `status` (`pending | completed | failed | refunded`)
- `reference_id` text (unique, nullable) — dedupes payment callbacks
- `provider` (`manual | razorpay | stripe | system`)
- `metadata` jsonb

### New tables (all with GRANTs + RLS)
- `coin_packages` — id, name, coins, bonus_coins, price_inr, price_usd_cents, sort_order, is_active, badge (e.g. "Best value"). Admin CRUD; anon SELECT active.
- `coin_payment_orders` — id, user_id, package_id, provider, provider_order_id, provider_payment_id, amount, currency, coins, bonus_coins, status (`created|awaiting_review|paid|failed|refunded`), receipt_url, admin_note, created_at. RLS: user reads own; admin all.
- `payment_providers` — key (`manual|razorpay|stripe`), enabled bool, config jsonb. Admin only.
- `daily_reward_config` — day_number (1..30+), coins. Admin editable.
- `user_daily_claims` — user_id, claim_date (unique per user/date), streak, coins.
- `coin_feature_flags` — feature key (`wallpaper|gift|game|competition|username_fx|profile_frame|bubble|emoji|room_decor` …), enabled.
- `subscription_coin_grants` — plan_id, monthly_coins. On renewal, credit.

### Atomic RPC
`public.wallet_apply(_user uuid, _amount int, _direction text, _kind text, _status text, _provider text, _reference text, _metadata jsonb) returns coin_transactions`
- SECURITY DEFINER, single transaction
- Rejects if `wallet_frozen`
- Rejects if debit would push balance negative
- Unique on `reference_id` per provider → dedupe fake/duplicate callbacks
- Updates lifetime + purchased/bonus counters based on `kind`

All spends across the app must call `wallet_apply` — no direct balance updates.

## 2. Server functions (`src/lib/wallet.functions.ts`)
- `getWallet` — balance + lifetime + last N transactions
- `listPackages` (public)
- `createOrder({ packageId, provider })` — creates `coin_payment_orders`, returns provider payload (Razorpay order / Stripe checkout URL / manual instructions)
- `submitManualPayment({ orderId, receiptUrl, note })` → `awaiting_review`
- `claimDaily` — computes streak, calls `wallet_apply`
- `listTransactions({ range, kind })`
- Admin: `adminAdjustCoins`, `adminFreeze`, `adminRefund`, `adminGift`, `adminApproveManualOrder`, `adminUpsertPackage`, `adminSetProvider`, `adminSetFeatureFlag`, `adminSetDailyConfig`, `adminReport`

Razorpay/Stripe webhook routes under `src/routes/api/public/webhooks/{razorpay,stripe}.tsx` — verify signature, load order by `provider_order_id`, call `wallet_apply` with `reference_id = provider_payment_id`.

## 3. Client

### `/wallet` (authenticated)
- Balance card, lifetime earned/spent, purchased vs bonus split
- Daily claim button + streak visual
- Tabs: Store · Transactions · Daily
- Transactions filterable (Today/Week/Month/All, by kind)

### `/wallet/store`
- Package grid, provider chooser (only enabled providers), manual flow uploads receipt via existing storage
- Razorpay: load checkout.js, use returned order
- Stripe: redirect to Checkout session URL

### `/admin/wallet`
- Packages CRUD
- Providers enable/disable + keys form (secrets stored via `add_secret`)
- Manual orders queue (approve/reject)
- User lookup: adjust / freeze / refund / gift
- Daily reward config
- Feature flags
- Reports (CSV)

### Subscription hook
On subscription renewal (existing subscription logic), call `wallet_apply` with `kind='subscription_grant'` for the plan's monthly coins.

### Cosmetic integration
Refactor existing DM wallpaper purchase to call `wallet_apply` (kind `wallpaper`) instead of touching balance directly, so it flows through the wallet. Same pattern reserved for gifts/games/etc via feature flags.

## 4. Security
- Webhooks verify HMAC (Razorpay `x-razorpay-signature`, Stripe signing secret) before RPC
- `reference_id` UNIQUE prevents replay
- `wallet_apply` is the only path that mutates balance; direct table UPDATE denied by RLS (no update policy for `authenticated`)
- Admin ops gated by `has_role(auth.uid(),'admin')`

## 5. Out of scope this pass
- Actual Razorpay/Stripe key entry (added when user provides them; scaffolding + webhook routes ready)
- CSV export UI polish beyond a basic download
- Peer-to-peer coin transfers (schema supports it via `transfer_in/out`, UI later)

## Files
- migration: `supabase/migrations/*_wallet_store.sql`
- `src/lib/wallet.functions.ts`, `src/lib/wallet.ts` (types + client helpers)
- `src/routes/wallet.tsx`, `src/routes/wallet.store.tsx`
- `src/routes/admin.wallet.tsx`
- `src/routes/api/public/webhooks/razorpay.tsx`, `.../stripe.tsx`
- Refactor: `src/lib/dm-wallpapers.ts` `purchase_dm_wallpaper` → delegate to `wallet_apply`
