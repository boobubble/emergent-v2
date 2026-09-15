# Gateway IRC moderation — repo reference (not deployed)

## Classification (current frontend)

| Action | Type | IRC room | DM | Current behavior |
|--------|------|----------|-----|------------------|
| Kick from room | A — channel IRC | Shown when `isPublicIrcRoomChannel` | Hidden | `staffKick` updates **local** moderation state only |
| Mute in room | A + B | Shown in IRC rooms | Hidden for room mute | `muteUser` Supabase + `staffLocalMute` local |
| Ban user | B — account | Shown | Shown | `banUser` Supabase (valid in DM context) |
| Delete message | B/C | IRC + DM | Yes | Supabase mod delete |
| Ignore user | C — local UI | Profile popup | Yes | `palrgo:ignore:v1` localStorage |
| Ignore bots | C — global | Chat settings | N/A | `ignoreAllBots` in ignore-store |

## Missing for real IRC channel moderation

`staffKick` / room mute do **not** send IRC `KICK` / `MODE +q` via the gateway today.

### Proposed minimal gateway patch (awaiting VPS approval)

Add authenticated WebSocket message type (staff JWT + room mod check on frontend; gateway trusts signed staff token or relays only from gateway service account):

```javascript
// WS payload from staff client (future)
{ "type": "moderation.kick", "room": "yaarzo-global", "targetNick": "username" }
// Gateway → IRC: KICK #yaarzo-global :reason

{ "type": "moderation.mode", "room": "yaarzo-global", "mode": "+q", "targetNick": "username" }
// Gateway → IRC: MODE #yaarzo-global +q username
```

Gateway must verify the sender is an IRC operator or channel halfop on that channel before relaying.

Ergo-side: channel ops must be granted to `YaarzoGateway` or per-user IRC connections required for mod actions.

## Frontend repo status

- Channel kick/mute UI hidden in DMs and non-IRC channels.
- Account ban/delete unchanged (Supabase).
- Ignore uses existing `ignore-store` localStorage — no schema change.
