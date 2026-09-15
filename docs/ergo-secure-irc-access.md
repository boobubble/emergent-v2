# Ergo secure IRC access (production reference)

## Goals

- Normal Yaarzo users chat only via https://yaarzo.com/chatroom (gateway WebSocket).
- Direct IRC / Kiwi is **admin-only** with manually provisioned accounts.
- Gateway bot (`YaarzoGateway`) keeps working from the Docker network.

## Recommended `ircd.yaml` changes

Apply to `/opt/yaarzo/ergo/data/ircd.yaml` after timestamped backup.

```yaml
accounts:
  authentication-enabled: true
  registration:
    enabled: false
  nick-reservation:
    enabled: true

# Require SASL for clients connecting from the public internet.
# Exempt the Docker bridge so the gateway container can still NICK/USER without SASL.
server:
  # ... existing listeners ...

data:
  ip-limits:
    exempted:
      - "172.18.0.0/16"   # yaarzo-gateway Docker network — adjust if compose network changes
```

If your Ergo build uses `require-sasl` under `accounts`:

```yaml
accounts:
  require-sasl:
    enabled: true
    exempted:
      - "172.18.0.0/16"
```

**Important:** verify the live compose network CIDR (`docker network inspect`) before applying. Do not exempt `0.0.0.0/0`.

## Admin IRC accounts

Create accounts manually (not self-registration):

```bash
docker exec -it yaarzo-ergo ergo mkaccount <admin-nick>
```

Grant channel operator on `#yaarzo-global` and new channels (e.g. `#games`) via Kiwi or:

```
/MODE #yaarzo-global +o <admin-nick>
```

Gateway service account `YaarzoGateway` should remain op/halfop on public channels so moderation relay works.

## Kiwi (https://irc.yaarzo.com/)

- Point Kiwi at `wss://irc.yaarzo.com` with SASL required.
- Show a landing message for unauthenticated visitors: **Chat on Yaarzo** → https://yaarzo.com/chatroom
- Only admins receive IRC account credentials.

Example `config.json` snippet (see `deploy/kiwi/config.json.example`):

```json
{
  "startupScreen": "custom",
  "kiwiServer": "wss://irc.yaarzo.com/webirc",
  "restricted": true,
  "customStartupText": "IRC console is restricted to Yaarzo staff. Chat at https://yaarzo.com/chatroom"
}
```

Server-side SASL enforcement is mandatory; Kiwi UI restriction alone is not sufficient.

## Channel discovery

When an admin creates `#games` (or any public channel) in Kiwi:

1. Ergo exposes it on `LIST`
2. Gateway LIST refresh (after admin JOIN or periodic) updates `/rooms`
3. Yaarzo chatroom sidebar picks it up via existing IRC reconciliation — **no frontend deploy required**

Removed channels are pruned by `pruneStaleIrcSidebarRooms` on the next `/rooms` sync.

## Ergo mute (not +q)

Ergo `+q` is **founder**, not quiet. Mute uses extban:

```
MODE #channel +b m:nick!*@*
```

Unmute:

```
MODE #channel -b m:nick!*@*
```

The gateway implements this in `lib/irc-moderation.cjs`.
