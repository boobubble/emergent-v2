# Changelog

## v2.0.0 — 2026-07-10

- Switched production runtime from Cloudflare Workers to a standalone
  Nitro **Node.js** server (`.output/server/index.mjs`, listens on
  `process.env.PORT || 3000`).
- Added `SELF_HOSTING.md` with PM2 + Nginx deployment guide.
- New Self-Hosting Release ZIP that ships **only** application source —
  separate from the disaster-recovery Full Backup ZIP.
- Security hardening: removed self-completion path on `coin_payment_orders`
  and self-activation path on `user_subscriptions`.
- SQL exporter is now dependency-aware (topological sort of tables →
  functions → policies → triggers, including signature-based function
  dependencies) and stops at the first error with a precise root cause.

## v1.x

- Initial CodeCanyon release. See `docs/codecanyon-handoff.md`.
