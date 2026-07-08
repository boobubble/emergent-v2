# BooBubble Product Roadmap

BooBubble is a social chat platform with embedded Game Rooms. The core platform is live: real-time chat rooms, presence, wallet, XP, gamification, notifications, leaderboards and an admin panel. The Game Room system is intentionally plugin-ready — new games can be added through the Game Registry, migrations and admin tooling without rebuilding the platform.

## Current State

- Real-time chat rooms with public/private channels, bots and member roles.
- Game Rooms infrastructure: `GameRoomCanvas`, spectator support, system event feeds and room-scoped leaderboards.
- Wallet, XP and Gamification engines wired into the room lifecycle.
- Notifications, achievements and leaderboards.
- Admin panel for rooms, settings and platform management.
- Game Registry pattern for lazy-loading new games.

## Near-Term Goals

1. **Game Room Plugin (Next Game)**
   - Add one original, premium-quality puzzle or arcade game through the existing Game Registry.
   - Reuse Game Rooms, Wallet Rules, XP, Gamification, Notifications, Leaderboards, Admin and Spectator infrastructure.
   - Provide Story, Practice and Daily Challenge modes.
   - Server-side anti-cheat validation before any leaderboard or reward write.
   - Original BooBubble UI only: glassmorphism, clean typography, smooth motion, dark and light modes, responsive layout.

2. **Monetization & Economy**
   - Hint purchases, entry fees and reward tuning through the Wallet Rules Engine.
   - Daily bonuses and streak rewards via the Gamification Engine.
   - Admin-configurable economy values stored in `app_settings`.

3. **Social & Discovery**
   - Featured rooms and trending games surfaced in the chat sidebar.
   - Room invites, friend leaderboards and spectation improvements.

4. **Admin Polish**
   - Per-game admin page under Admin → Games.
   - Level CRUD, daily challenge picker, economy config and tournament toggles.

## Technical Principles

- One game = one registry entry + one lazy-loaded module + one admin sub-page + one migration set.
- Never rebuild platform systems for a single game.
- All public-schema tables require `GRANT`s and RLS before shipping.
- Server functions live in client-safe modules (`*.functions.ts`) and use `requireSupabaseAuth` where needed.
- Migration history is immutable. Drop or alter tables only through new migrations; never edit old migration files.

## Out of Scope / Future

- Multi-game tournaments, bracket UI, ghost racing and season passes are deferred until the first game is live and validated.
- No new backend services outside the existing TanStack Start + Lovable Cloud stack.
