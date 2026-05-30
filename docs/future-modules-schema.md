# Future Modules — Database Schema Blueprint

This file documents the **planned** tables for upcoming modules. None of
these tables exist yet. Each future implementation should create its own
migration following the patterns in `<public-schema-grants>` and
`<user-roles>` (RLS + GRANTs in the same migration).

Use this as a north star — keep table names stable so feature flags and
service stubs in `src/services/` keep working.

---

## Coin Gifting — `future_flags.coin_gifting`
- `coin_gifts(id, sender_id, receiver_id, amount, message, created_at)`

## Coin Bombs — `future_flags.coin_bombs`
- `coin_bombs(id, channel_id, dropper_id, total_coins, winners, expires_at, created_at)`
- `coin_bomb_claims(id, bomb_id, user_id, amount, claimed_at)`

## Creator Tipping — `future_flags.creator_tipping`
- `creator_tips(id, sender_id, creator_id, post_id, amount, message, created_at)`

## Momentum — `future_flags.momentum`
- `user_momentum(user_id, score, tier, updated_at)`

## Energy — `future_flags.energy`
- `user_energy(user_id, current, max, regen_per_min, next_tick_at, updated_at)`
- `energy_transactions(id, user_id, delta, reason, created_at)`

## Marketplace — `future_flags.marketplace`
- `market_listings(id, seller_id, title, category, price_coins, payload jsonb, status, created_at)`
- `market_orders(id, listing_id, buyer_id, price_coins, status, created_at)`

## Cosmetics Shop — `future_flags.cosmetics_shop`
- `shop_products(id, name, category, price_coins, payload jsonb, active, created_at)`
- `shop_purchases(id, product_id, user_id, price_coins, created_at)`

## Avatar Frames — `future_flags.avatar_frames`
- `avatar_frames(id, name, image_url, rarity, source)`
  - Inventory reuses existing `user_inventory(category='avatar_frame')`.

## Username Effects — `future_flags.username_effects`
- `username_effects(id, name, css_class, rarity, source)`
  - Inventory reuses existing `user_inventory(category='username_effect')`.

## Clans / Groups — `future_flags.clans`
- `clans(id, name, tag, description, owner_id, created_at)`
- `clan_members(clan_id, user_id, role, joined_at)`

## Voice Rooms — `future_flags.voice_rooms`
- `voice_rooms(id, channel_id, host_id, provider, room_token, started_at, ended_at)`
- `voice_participants(room_id, user_id, joined_at, left_at)`

## Stories — `future_flags.stories`
- `stories(id, author_id, media_url, expires_at, created_at)`
- `story_views(story_id, viewer_id, viewed_at)`

## Tournaments — `future_flags.tournaments`
- `tournaments(id, name, game_type, starts_at, ends_at, status, max_players, created_at)`
- `tournament_entries(tournament_id, user_id, seed, eliminated_at)`
- `tournament_matches(id, tournament_id, round, a_user_id, b_user_id, winner_id, played_at)`

## Seasonal Events — `future_flags.seasonal_events`
- `seasonal_events(id, key, name, starts_at, ends_at, payload jsonb, active)`
- `event_progress(event_id, user_id, progress jsonb, claimed text[], updated_at)`

## Premium Memberships — `future_flags.premium`
- `premium_plans(id, name, price_cents, interval_months, perks jsonb, active)`
- `premium_subscriptions(id, user_id, plan_id, status, started_at, renews_at, canceled_at)`

## Room Boosts — `future_flags.room_boosts`
- `room_boosts(id, channel_id, booster_id, coins_spent, expires_at, created_at)`

## Creator Support — `future_flags.creator_support`
- `creator_support_subscriptions(id, supporter_id, creator_id, monthly_coins, status, started_at, canceled_at)`

## AI Features — `future_flags.ai_features`
- `ai_jobs(id, user_id, kind, input jsonb, output jsonb, status, error, created_at, completed_at)`

---

## Conventions

- Always add `created_at timestamptz not null default now()`.
- For tables a user owns, scope policies via `auth.uid()`.
- For admin-managed catalogs (products, plans, frames, effects) use
  `is_admin(auth.uid())` for write policies and grant `SELECT` to
  `authenticated`.
- Reuse `user_inventory` whenever the module is "buy + equip cosmetic".
- Reuse `coin_transactions` for any coin debit/credit instead of inventing
  a per-module ledger.
