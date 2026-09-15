# Proposed live gateway patch — IRC LIST timing fix

**Target file:** `/opt/yaarzo/gateway/index.js`  
**Do NOT apply without approval. Do NOT restart gateway without approval.**

## Problem (confirmed on live VPS)

Current `secureConnect` sends `LIST` before startup `JOIN` confirmations complete. Ergo returns `LIST complete (0 rooms)`; `/rooms` is empty and `primaryRoom` is null.

## Fix summary

| Phase | Action |
|-------|--------|
| TLS `secureConnect` | `NICK` + `USER` only — **no LIST, no JOIN** |
| Numeric `001` | Mark registered; `JOIN` each `IRC_ROOMS` channel |
| Self-`JOIN` / join error | Track startup resolution via `joinedIrcRooms` + startup tracker |
| Startup complete | Send **one** `LIST` |
| Numeric `322` | Upsert into `ircRoomList` |
| Numeric `323` | Finalize LIST; serve `/rooms` from `ircRoomList` only |
| Dynamic JOIN/PART later | Refresh LIST once (coalesced if LIST already in flight) |

`IRC_ROOMS` remains **startup JOIN config only**. Public discovery = `ircRoomList` from LIST.

`primaryRoom` (`IRC_PRIMARY_ROOM` / default `yaarzo-global`) is returned only when that id exists in `ircRoomList`.

## Repository reference

- `gateway-index-vps.js` — full reference implementation
- `scripts/gateway/irc-room-discovery.cjs` — testable helpers
- `scripts/gateway/irc-room-discovery.test.mjs` — unit tests (`node --test`)

## Minimal surgical diff for live (conceptual)

Replace the block that sends `LIST` and/or `JOIN` inside `secureConnect` with:

```javascript
ircSocket.on("secureConnect", () => {
  console.log("IRC TLS connected");
  ircSocket.write(`NICK ${IRC_NICK}\r\n`);
  ircSocket.write(`USER yaarzogateway 0 * :Yaarzo Chat Gateway\r\n`);
});
```

Add IRC line handler logic (or merge into existing `data` handler):

```javascript
// On 001 → JOIN IRC_ROOMS channels (startupJoinPhase = true)
// On self-JOIN / 473|403|… → startupJoinTracker.noteJoinAttemptResolved(channel)
// When startupJoinTracker.isStartupComplete() → LIST once
// On 322 → ircRoomList.set(room, { room, channel, users, topic })
// On 323 → listInProgress = false; log count
// On dynamic self-JOIN/PART (after startup) → requestIrcList (coalesced)
```

Replace `/rooms` payload builder:

```javascript
// BEFORE (wrong): filter IRC_ROOMS through partial join state
// AFTER: Array.from(ircRoomList.values()) with primaryRoom guard
```

Remove any `recordIrcRoom(channel)` calls on JOIN **send** — rooms appear only after LIST 322.

## Expected live behavior after patch + restart

```
IRC TLS connected
IRC: JOIN #yaarzo-global sent
IRC: JOIN #lobby sent
(self-JOIN confirmations)
IRC: LIST sent (startup-joins-complete)
IRC: LIST complete (N rooms)
GET /rooms → { primaryRoom: "yaarzo-global", rooms: [...] }
```

If `#lobby` join fails (473), startup still completes and LIST runs with remaining channels.
