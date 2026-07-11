# Unified Licensing System

BooBubble's licensing is a provider-based system with one orchestrator
(`LicenseManager`), pluggable providers (`self`, `envato`, `codester`, ...),
a signed local cache, and a public REST server that lets *this* deployment
act as the license authority for other installations issuing `self` keys.

## Architecture

```
installer / admin / runtime guard / REST endpoints
                    │
                    ▼
             LicenseManager
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
    self         envato        codester      (+ future: gumroad, paddle, ...)
      │             │             │
      ▼             ▼             ▼
LICENSE_SERVER  Envato API   Codester API
```

State lives in three tables (`licenses`, `license_activations`,
`license_logs`), plus a signed cache in `app_settings.license_cache`.

## Configuration

Runtime secrets (add via `add_secret`):

| Secret                       | Purpose                                                        |
|------------------------------|----------------------------------------------------------------|
| `LICENSE_HMAC_SECRET`        | Signs the local cache (`app_settings.license_cache`).          |
| `LICENSE_SERVER_URL`         | Base URL of the license authority (used by `SelfLicenseProvider`). |
| `LICENSE_SERVER_HMAC_SECRET` | Shared secret between client installs and this REST server.    |
| `ENVATO_PERSONAL_TOKEN`      | Envato v3 personal token, sale verification.                   |
| `CODESTER_API_KEY`           | Codester verification API key.                                 |

When `LICENSE_SERVER_URL` is the placeholder `https://licenses.yourdomain.com`
or `LICENSE_SERVER_HMAC_SECRET` is unset, `SelfLicenseProvider` falls back
to a local format-only check so installations can boot before the vendor
infra is wired up.

## Public REST endpoints

All under `/api/public/license/*`, all `POST`, all require an
`x-license-signature` header equal to
`HMAC_SHA256(canonicalize(payload), LICENSE_SERVER_HMAC_SECRET)`.
Canonicalization sorts object keys — do not rely on insertion order.
Per-IP rate limit: 30 requests / 60 s / route. Bypass on published site is
controlled by the `api/public/` prefix.

| Endpoint     | Payload                                                                                                  | Returns                                                    |
|--------------|----------------------------------------------------------------------------------------------------------|------------------------------------------------------------|
| `/verify`    | `{ key, email, domain, product_version? }`                                                               | `{ ok, status, ...license }`                               |
| `/activate`  | `{ key, email, domain, server_ip?, installation_id?, runtime?, product_version? }`                       | `{ ok, status, ...license }` — enforces domain lock + max  |
| `/deactivate`| `{ key, email, domain }`                                                                                 | `{ ok }`                                                   |
| `/check`     | `{ key, email, domain, product_version? }` — heartbeat, updates `last_seen_at` / `last_validation_at`.   | `{ ok, status, ...license }`                               |
| `/reset`     | `{ key, email }` — wipes all activations + current_domain.                                               | `{ ok }`                                                   |

Errors: `400` invalid payload, `401` signature mismatch or missing,
`403` license `suspended`/`revoked`/`expired`, `404` no matching license,
`409` domain lock violation, `429` rate limited, `503` server not configured.

## Runtime guard

`LicenseGuard` (mounted in `__root.tsx`) reads the signed cache, revalidates
via the active provider on mount and every 24h, and shows a banner when the
provider reports failure. Within the grace period (default 7 days) the app
stays usable and the banner is amber; past grace it turns destructive.

Background revalidation is handled by `pg_cron` job
`license-revalidate-daily` (03:17 UTC) hitting
`/api/public/hooks/license-revalidate`.

## Adding a new provider

1. Create `src/lib/licensing/providers/<name>.server.ts` exporting a class
   that implements `LicenseProvider` from `./base.ts`. Return a normalized
   `LicenseVerificationResult` — never leak raw HTTP payloads that contain
   secrets.
2. Register it in the `PROVIDERS` map in
   `src/lib/licensing/manager.server.ts`.
3. Add a matching row in the `license_sources` table (`id`, `label`,
   `active`) via a migration — the installer picker and admin dashboard
   read from there.
4. If the provider needs a new secret, request it with `add_secret`; read
   it inside the `verify()` method, never at module scope.

No other file needs to change — installer, admin panel, runtime guard, and
REST endpoints all route through `LicenseManager`.

## Domain lock semantics

On successful `activate`, the license row records `current_domain`,
`server_ip`, `installation_id`, and `current_activations`. Further
activations are rejected when both:

- the domain differs from `current_domain`, and
- `current_activations >= max_activations`.

`reset` (admin or REST) clears the lock; `deactivate` frees one slot.

## Local cache signing

`writeCache` writes a canonical JSON body plus an
`HMAC_SHA256(canonicalize(body), LICENSE_HMAC_SECRET)` signature into
`app_settings.license_cache`. `LicenseGuard` verifies the signature before
trusting the cached status — tampering with the row directly is detected
and treated as a fresh install.
