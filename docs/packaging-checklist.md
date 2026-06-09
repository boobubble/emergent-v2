# Packaging Checklist (CodeCanyon)

Use this when preparing a release zip for the CodeCanyon marketplace.

## Files to include

- `src/`, `public/`, `supabase/`
- `package.json`, `bun.lock`, `vite.config.ts`, `tsconfig.json`, `wrangler.jsonc`
- `.env.example` (NEVER ship a real `.env`)
- `README.md`, `SELF_HOSTING.md`, `SELF_HOSTING_BACKEND.md`
- `docs/` (handoff, installation guide, schema docs)
- `LICENSE.txt`

## Files to exclude

- `node_modules/`, `.lovable/`, `.git/`, `dist/`, `.wrangler/`
- Any `.env`, `.env.local`, `.env.production`
- Editor folders: `.vscode/`, `.idea/`
- OS junk: `.DS_Store`, `Thumbs.db`

## Pre-flight QA

1. Fresh clone → `bun install` → `bun dev` → loads without errors.
2. `bunx supabase db push` against a blank project succeeds.
3. Create super-admin → `/admin` reachable, every nav entry opens.
4. Demo import → demo reset round-trip works.
5. Build + deploy: `bun run build` produces a clean Worker bundle.
6. Run `bun run lint` and ensure zero warnings.

## Documentation bundle

The `docs/` folder ships with:

- `installation-guide.md` — buyer-facing setup walkthrough.
- `codecanyon-handoff.md` — developer architecture overview.
- `future-modules-schema.md` — planned tables for roadmap modules.
- `ai-providers-schema.md` — chatbot/AI provider contract.
- `qa/theme-switching-checklist.md` — pre-release QA list.
- `video/install.mp4` *(add before publishing)* — 1-minute install screencast.

## Listing copy hints

Highlight these admin capabilities (all included):

- Setup Wizard · Demo Import · Demo Reset · Role & Permission Builder
- Admin Audit Logs · User Activity Logs · Analytics Dashboard
- Announcement Manager · Popup Manager · SMTP + Email Templates
- Maintenance Mode · Cache Manager · Referral System
- CSV / Excel Export · Feature Toggle / Module Manager
- Staff Permissions matrix · Login Background customization
- Linked Welcome-page feature cards · Admin-editable usernames

## Versioning

Tag releases as `vMAJOR.MINOR.PATCH`. Bump:

- **MAJOR** for breaking schema changes (rare).
- **MINOR** for new admin modules or tables.
- **PATCH** for fixes and UI polish.

Each release zip filename: `community-platform-vX.Y.Z.zip`.
