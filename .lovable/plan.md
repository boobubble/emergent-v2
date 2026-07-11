
# Unified License System — Implementation Plan

Built as an **extension** of BooBubble. Existing installer, auth, admin panel, RPC layer, and UI components are reused as-is. Backward compatible with the current `envato`/`offline` license fields in `app_settings.installation`.

## Architecture

```text
                      ┌────────────────────────┐
   installer ─────────▶                        │
   admin panel  ──────▶      LicenseManager    │──▶ providers registry
   runtime guard  ────▶                        │       ├─ self
   REST /api/license/*▶                        │       ├─ envato
                      └───────────┬────────────┘       └─ codester
                                  │
                        ┌─────────▼──────────┐
                        │ licenses (+activations, logs, sources, stats)
                        │ encrypted local cache in app_settings.license_cache
                        └────────────────────┘
```

- `LicenseManager` is the only entry point. Providers implement `verify / activate / check / deactivate` against the same TS interface, so Gumroad / Paddle / LemonSqueezy / Sellix / WooCommerce / Shopify plug in later without touching core.
- Runtime validation: encrypted signed cache, revalidated every 24h by a background scheduler (`pg_cron` → `/api/public/hooks/license-revalidate`), 7-day configurable grace period, offline-tolerant. Domain + server IP + installation ID locked on first activation.

## Milestones (executed sequentially, each self-consistent)

### M1 — Data layer & LicenseManager core
- Migration: `licenses`, `license_activations`, `license_logs`, `license_sources` (seeded self/envato/codester), `license_statistics` view. Full RLS + GRANTs. `has_role('admin')` gates writes.
- `src/lib/licensing/types.ts`, `provider.ts` (interface), `manager.ts` (registry + orchestration), `cache.ts` (HMAC-signed local cache in `app_settings.license_cache`), `crypto.ts` (HMAC helpers using `LICENSE_HMAC_SECRET`).
- Providers: `self` (calls `LICENSE_SERVER_URL`), `envato` (`ENVATO_PERSONAL_TOKEN` → `api.envato.com/v3/market/author/sale`), `codester` (`CODESTER_API_KEY` → Codester verification endpoint). Each returns normalized `LicenseVerificationResult`.
- Secrets requested via `add_secret`: `LICENSE_SERVER_URL`, `LICENSE_SERVER_HMAC_SECRET`, `ENVATO_PERSONAL_TOKEN`, `CODESTER_API_KEY`, `LICENSE_HMAC_SECRET` (generated).

### M2 — Installer integration
- Extend `src/routes/installer.tsx` license step: replace the Envato/offline picker with a 3-source picker (Self / CodeCanyon / Codester). Existing `offline` keys map to `self` for backward compatibility. Reuse existing step UI, buttons, toast, and progression.
- Auto-detects domain, server IP (server fn), runtime version, product version (`APP_VERSION`).
- On verify success → `LicenseManager.activate()` inserts `licenses` + `license_activations` rows, writes signed cache, then hands control back to the untouched `complete_installation` RPC.

### M3 — Runtime guard & background scheduler
- `src/lib/licensing/runtime.functions.ts`: `checkLicense()` reads cache, refreshes if `>24h`, honours grace period, records `license_logs`.
- `src/components/LicenseGuard.tsx` mounted in `__root.tsx` — non-blocking during grace, blocking banner past grace, admins see admin actions.
- `src/routes/api/public/hooks/license-revalidate.ts` — HMAC-verified endpoint invoked by `pg_cron` every 6h to revalidate all active licenses server-side.

### M4 — Admin License Management
- New route `src/routes/admin.licenses.tsx` (reuses existing admin layout + tabs registry).
- Dashboard cards (active/expired/suspended/by source/by version), searchable/filterable list, detail drawer with actions: Generate Self license, Import, Suspend, Revoke, Reset activation, Change domain, Extend expiry. Activation history + logs tabs. CSV export via existing download helper.
- All actions are `createServerFn` + `requireSupabaseAuth` + `has_role('admin')` gate.

### M5 — REST Licensing Server + tests + docs
- Server routes under `src/routes/api/public/license/`: `verify`, `activate`, `check`, `deactivate`, `reset`, `validate`. Each requires HMAC signature (`X-License-Signature` over raw body with `LICENSE_SERVER_HMAC_SECRET`), returns signed JSON. Ad-hoc in-memory rate limiter per IP+route (documented tradeoff — no standard primitive).
- Unit tests: `src/lib/licensing/__tests__/{manager,cache,providers}.test.ts` with mocked fetch. Feature tests for REST endpoints via `bunx vitest`.
- `docs/licensing.md` — architecture, adding a new provider, upgrade path from existing installer, endpoint reference, security notes.

## Non-goals / preserved as-is
- Installer flow, DB installer, auth, admin panel shell, wallet, XP, feed, chat, radio, notifications, existing RPCs (`complete_installation`, `get_install_status`, `bootstrap_first_admin`) — untouched. The setup wizard flow already extended in prior turns is untouched.
- Existing `envato`/`offline` license reads keep working; a one-time backfill inside M1 mirrors the current `app_settings.installation.license_*` into the new `licenses` table so nothing regresses.

## Rollout inside this build
I'll execute M1 → M5 in order across turns. After each milestone I'll typecheck and verify integration before starting the next. First response after approval will implement M1 (migration + core LicenseManager + providers + secret requests).
