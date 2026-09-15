# Gateway IRC moderation

## WebSocket contracts (authenticated)

All moderation messages require a valid Supabase JWT (`auth` frame first). The gateway verifies permissions server-side via `is_admin`, `has_role`, `room_moderators`, and `staff_permissions` — **never** client role flags.

### Request

```json
{ "type": "moderation.kick", "room": "yaarzo-global", "targetNick": "username", "reason": "optional" }
{ "type": "moderation.ban", "room": "yaarzo-global", "targetNick": "username" }
{ "type": "moderation.unban", "room": "yaarzo-global", "targetNick": "username" }
{ "type": "moderation.mute", "room": "yaarzo-global", "targetNick": "username" }
{ "type": "moderation.unmute", "room": "yaarzo-global", "targetNick": "username" }
```

Also accepts `{ "type": "moderation", "action": "kick", ... }`.

### Response

```json
{ "type": "moderation.ok", "action": "kick", "room": "yaarzo-global", "targetNick": "username", "source": "admin" }
{ "type": "moderation.error", "code": "FORBIDDEN", "message": "Not authorized for this moderation action" }
```

### IRC commands issued (Ergo)

| Action | IRC |
|--------|-----|
| kick | `KICK #room nick :reason` |
| ban | `MODE #room +b nick!*@*` |
| unban | `MODE #room -b nick!*@*` |
| mute | `MODE #room +b m:nick!*@*` (Ergo extban — **not** `+q`) |
| unmute | `MODE #room -b m:nick!*@*` |

## Authorization model

1. **super_admin / admin** (`is_admin` RPC) — all IRC moderation actions on any public room.
2. **global moderator** — gated by `staff_permissions` (`mod_can_kick`, `mod_can_mute`, `mod_can_ban`).
3. **room_moderators** row — per-room `can_kick` / `can_mute`.

## Frontend

- `lobbyIrcTransport.moderate()` sends WS frames.
- `StaffActionsMenu` / `ProfilePopup` call IRC relay for kick/mute/channel-ban in public IRC rooms only.
- DMs: channel kick/mute hidden; ignore + account-level actions remain.

## Deployment

Repo reference: `gateway-index-vps.js` → `/opt/yaarzo/gateway/index.js`

Lib modules:

- `scripts/gateway/irc-room-discovery.cjs` → `lib/irc-room-discovery.cjs`
- `scripts/gateway/irc-moderation.cjs` → `lib/irc-moderation.cjs`

Sync script: `scripts/deploy/sync-gateway-vps.sh` (creates timestamped backup before restart).
