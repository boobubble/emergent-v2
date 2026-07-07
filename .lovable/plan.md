# Premium Private Chat Personalization

Scope is DM-only (`channel_id` starting with `dm:`). Lobbies, trio rooms, and community chats stay untouched. Reuses the existing Coins economy — no new currency.

## What ships

### 1. Wallpaper library (admin-managed catalog)
- New table `dm_wallpapers` with: `key`, `name`, `category`, `kind` (`solid|gradient|image|animated`), `preview_url`, `asset_url`, `price_coins`, `is_premium`, `is_featured`, `is_limited`, `enabled`, `sort_order`, timestamps.
- Categories: Romantic, Space, Nature, Gaming, Neon, Cute, Dark, Seasonal, Trending, Premium Exclusive.
- Public `TO anon/authenticated` SELECT on enabled rows; admin writes only.
- Admin CRUD screen at `/admin/wallpapers` (list, upload asset, set price, toggle featured/limited, delete).
- Assets stored in a new public `dm-wallpapers` storage bucket.

### 2. Ownership + purchases (Coins-integrated)
- `user_dm_wallpapers (user_id, wallpaper_key, acquired_at)` — permanent unlock; one row per user per wallpaper.
- `dm_wallpaper_purchases (id, user_id, wallpaper_key, coins_spent, purchase_type, dm_channel_id, created_at)` — history log.
- DB function `purchase_dm_wallpaper(_key, _type, _channel)`:
  - Validates DM channel + membership.
  - If already owned and `_type='self'`: no-op, returns owned=true.
  - Deducts coins from purchaser only (via `profiles.coins` + `coin_transactions`).
  - Inserts ownership row (if new) and history row.
  - For `_type='shared'`: writes the applied theme to the shared DM state (see #3) and inserts a system message announcing the change.
- Insufficient coins raises a clear error surfaced to the client.

### 3. Applied themes per conversation
- `dm_chat_themes (channel_id, user_id, wallpaper_key, opacity, blur, brightness, overlay, bubble_accent, updated_at)` — one row per (channel, user) for "My View Only".
- `dm_shared_themes (channel_id, wallpaper_key, applied_by, opacity, blur, brightness, overlay, bubble_accent, updated_at)` — one row per channel for "Shared".
- Resolution order in the client: shared theme (if set) → user's personal theme → default.
- RLS: users can read/write their own personal row; shared row is readable by both DM participants, writable only via the purchase function.
- Realtime enabled on `dm_shared_themes` so the other participant sees the change instantly.

### 4. Premium gating
- Reads `my_active_plan()` — buying/applying paid or animated wallpapers requires an active paid plan. Free solid/gradient wallpapers stay available to all.

### 5. Chat UI
- New "Wallpaper" button in DM header (only visible when `channel_id` starts with `dm:`).
- Sheet with:
  - Category tabs + grid of wallpapers (thumbnail, name, price, Owned/Premium badges).
  - Live preview overlay on the actual chat.
  - Opacity / blur / brightness / dark-overlay sliders.
  - Bottom bar: **Apply** (self), **Apply for both** (shared, shows coin cost + balance + balance-after), **Cancel**, **Reset to default**.
  - "Insufficient coins" state with Earn Coins CTA.
  - Custom upload tile (Premium) → uploads to `dm-wallpapers/custom/<user>/…`, validates size/dims/mime, registers as a personal wallpaper.
- Background layer rendered behind the message list only; bubbles keep existing readability tokens; overlay/blur applied via CSS variables per DM.
- Animated wallpapers (GIF/WebP) pause via `IntersectionObserver` + `document.visibilitychange`.

### 6. System message on shared apply
- On `_type='shared'`, insert a system message into the DM channel: `🎨 {applier} applied the "{name}" conversation theme.` Uses existing message pipeline; no schema changes.

## Explicit non-goals (to keep scope tight this pass)
- Lottie playback — deferred; ship image + GIF/WebP only.
- "Buy Coins" storefront — button links to existing coins earn page; no new payment flow.
- Per-message emoji reaction recolor — bubble/accent color changes only; reaction colors stay default.

## Technical notes
- All Supabase writes for purchases go through the `SECURITY DEFINER` function so RLS stays strict and coin deductions are atomic.
- GRANT statements included in the same migration as every new table (per `public-schema-grants` rule).
- Two migrations: (a) tables + RLS + grants + function, (b) `ALTER PUBLICATION supabase_realtime ADD TABLE dm_shared_themes;`.
- Storage bucket created via `supabase--storage_create_bucket` tool.
- Seed 12–15 starter wallpapers (solids, gradients, a few licensed-free images) in the same migration so the library isn't empty at launch.

## Files touched (approximate)
- `supabase/migrations/*_dm_wallpapers.sql` (new)
- `src/lib/dm-wallpapers.ts` — types + fetch/purchase helpers
- `src/lib/use-dm-theme.ts` — resolves active theme per channel, subscribes to shared changes
- `src/components/chat/DMWallpaperSheet.tsx` — picker + preview + purchase flow
- `src/components/chat/DMChatBackground.tsx` — background layer
- `src/components/chat/ChatHeader.tsx` — add Wallpaper button (DM-only)
- `src/components/chat/ChatApp.tsx` — mount background layer inside DM channels only
- `src/routes/admin/wallpapers.tsx` — admin catalog CRUD
- `src/styles.css` — CSS vars for wallpaper overlay/blur/brightness/accent

Approve and I'll build it end-to-end, or tell me which parts to trim/expand (e.g. skip admin UI, skip custom upload, ship free-only first).
