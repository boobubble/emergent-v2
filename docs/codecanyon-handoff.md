# CodeCanyon Handoff & Future-Ready Architecture

This document describes the modular foundations layered on top of the existing
community platform. **No existing module has been rewritten.** Chatrooms, Feed,
Friends, Rewards, Notifications and the Admin Panel work as before.

## 1. Roles & Permissions

- Registry: `src/lib/roles-registry.ts`
  - `ROLES` — 9 tiers from `guest` → `owner`
  - `PERMISSIONS` — scoped permission keys (feed.*, chat.*, mod.*, admin.*, ...)
  - `defaultPermissionsForRole(role)` — advisory mapping by role rank
- DB enum (`public.app_role`) currently has `super_admin | admin | moderator` —
  the `dbRole` field on each registry entry maps the wider role set to the
  existing enum without altering it.
- Existing admin page: `/admin/roles` (`src/routes/admin.roles.tsx`).

## 2. Economy Rules Engine

- Tuning constants (existing, authoritative): `EARN`, `SPEND`, `DAILY_MISSIONS`,
  `CREATOR_RANKS`, `ROOM_LOYALTY_LEVELS`, `VIRAL_JACKPOT`, `SCORE_WEIGHTS` in
  `src/lib/economy-config.ts`.
- Centralized future-tunable config: `EconomyConfig` + `ECONOMY_DEFAULTS` in
  the same file. Persisted under `app_settings.economy`. Read by the admin
  Economy page and future server fns.

## 3. Moderation Framework

- Pages: `/admin/moderation`, `/admin/reports`, `/admin/filters`.
- DB: `word_filters`, `user_bans`, `user_mutes`, security-definer helpers
  `is_user_banned`, `is_user_muted`, trigger `apply_word_filters`.
- Future: auto warn/mute/ban thresholds and spam/link controls plug into
  `app_settings.moderation.*` without new tables.

## 4. Realtime Monitoring

- New page: `/admin/realtime` (`src/routes/admin.realtime.tsx`).
- Status placeholders for chat, DM, presence, feed and notifications.
- Hook into Supabase Realtime metrics when available — current realtime
  pipelines are untouched.

## 5. Module Registry

- `src/lib/module-registry.ts` exports `CURRENT_MODULES` + `ALL_MODULES`.
- Future modules live in `src/lib/future-modules.ts` and are gated by
  `useFutureFlag(key)` reading `app_settings.future_flags`.
- Stubs in `src/services/*.service.ts` define typed interfaces with
  `notImplemented()` runtime guards.

## 6. Admin Panel Modes

- Basic vs Advanced toggle: `src/lib/admin-mode.ts` (existing). Advanced
  entries (System, API, Realtime, Performance) only render in advanced mode.
- Search + collapsible groups are already wired in `AdminNav`.

## 7. Future Database Foundation

See `docs/future-modules-schema.md` for the planned tables (gifting, momentum,
energy, marketplace, cosmetics, clans, voice rooms, stories, creator support).
Each follows the same pattern:

```
CREATE TABLE public.<table> ( ... );
GRANT SELECT ON public.<table> TO anon;          -- only if public reads
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;
GRANT ALL ON public.<table> TO service_role;
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY ... ;
```

## 8. Developer Handoff Checklist

For a new developer adding a future module (e.g. gifting):

1. Flip the flag in `app_settings.future_flags.coin_gifting = true`.
2. Run the migration documented in `docs/future-modules-schema.md`.
3. Implement `src/services/coin-gifting.service.ts` (replace
   `notImplemented()` stubs).
4. Create the route (`src/routes/gifts.tsx`) and admin page if needed.
5. No changes required to chat, feed, rewards or admin core.

## 9. What NOT to touch

- `src/integrations/supabase/*` (auto-generated)
- existing economy constants (`EARN`, `SPEND`, mission defs)
- existing admin routes for chatrooms / feed / rewards / users
- existing realtime subscriptions
