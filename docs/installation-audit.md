# Installation Audit — Release Checklist

Goal: a CodeCanyon buyer creates a new Supabase project, fills in the
environment variables, opens `/installer`, and either installs fresh **or**
restores a backup — with **zero manual SQL**.

Last audited against `main` on the release branch.

---

## 1. Required environment variables

All variables live in `.env` (copy from `.env.example`). Nothing else is
required for a fresh install.

| Variable | Where used | Required | Notes |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Browser client | ✅ | Public. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser client | ✅ | Public (anon) key. |
| `VITE_SUPABASE_PROJECT_ID` | Browser client | ✅ | Public. |
| `SUPABASE_URL` | Server fns / SSR | ✅ | Same as above. |
| `SUPABASE_PUBLISHABLE_KEY` | Server fns / SSR | ✅ | Same as above. |
| `SUPABASE_PROJECT_ID` | Server fns / SSR | ✅ | Same as above. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server fns / admin ops | ✅ | Secret — never bundle in the client. |
| `LOVABLE_API_KEY` | AI Gateway (optional) | ⚪️ | Only needed for self-hosted AI features. |

---

## 2. What the installer creates automatically

Everything below runs without any manual SQL:

| Layer | Item | How it's created |
|---|---|---|
| Schema | 70+ tables (profiles, posts, messages, chatrooms, safety_events, subscription_plans, …) | `supabase db push` (139 migrations) |
| Schema | Indexes, foreign keys, `updated_at` triggers | Migrations |
| Security | RLS enabled on every `public.*` table | Migrations |
| Security | Column & row policies, `has_role` / `is_admin` helpers, safety triggers, word-filter triggers | Migrations |
| Security | `GRANT`s to `anon` / `authenticated` / `service_role` | Migrations |
| Functions | 60+ SECURITY DEFINER functions (`bootstrap_first_admin`, `enforce_safety_moderation`, `unlock_chat_theme`, …) | Migrations |
| Auth | `handle_new_user` trigger creates the `profiles` row on sign-up | Migrations |
| Storage | Policies for `avatars`, `feed-media`, `brand-assets`, `stickers` | Migrations |
| **Storage buckets** | `avatars`, `feed-media`, `brand-assets`, `stickers` | **Installer step 7 → `ensureRequiredBuckets` server fn** |
| Seed data | Default chat themes, feed themes, subscription plans, safety keywords | Migrations |
| Roles | First admin promoted to `super_admin` | Installer → `bootstrap_first_admin()` |
| Installer lock | `app_settings.installer = { installed: true, … }` | Installer → `complete_installation()` |

**No manual action is required after the wizard completes.**

---

## 3. Restore-backup coverage

`/admin/backup` produces a portable ZIP:

```
backup_YYYY_MM_DD_full.zip
├── manifest.json          ← archive metadata
├── database.json          ← every table snapshot (rows + counts)
├── media-manifest.json    ← bucket list + file metadata (mime, size, path)
└── media/
    ├── avatars/<uid>/…
    ├── feed-media/<uid>/…
    ├── brand-assets/…
    └── stickers/…
```

On upload to `/admin/backup` → **Restore Backup**:

1. `database.json` is parsed and verified (row/table summary logged).
2. Every bucket in `media-manifest.json` is recreated on the target project
   via `ensureStorageBucket` (public/private flag preserved).
3. Every file under `media/<bucket>/<path>` is re-uploaded to the **new**
   Supabase Storage with `upsert=true`. Old project URLs are never
   referenced — files are stored fresh under the same bucket + path.
4. Progress bar shows per-phase counts.

Portable across: different Supabase projects, localhost, and new domains.

---

## 4. Fresh-install smoke test

```bash
# 1. Create a brand-new Supabase project.
# 2. Copy the anon + service-role keys into .env
cp .env.example .env
$EDITOR .env

# 3. Push every migration into the empty project.
bunx supabase db push

# 4. Start the app.
bun install
bun dev
```

Then in the browser:

1. Open `/installer`.
2. Enter licence → run compatibility check → create the first admin →
   set the site name → **Finish**.
3. The finish step provisions all storage buckets automatically.
4. Sign out and back in — you land on the homepage with a working
   community. No SQL, no dashboard clicks.

Alternate path — restore instead of install:

1. Open `/installer`, create the first admin only, finish.
2. Navigate to `/admin/backup` → **Restore Backup** → upload your ZIP.
3. Media buckets recreate and files upload into the new project.

---

## 5. Manual actions still required (documented, not automated)

These are provider-side configuration choices, not app data:

- **Supabase Auth providers** — enable Google / Apple / etc. in the Supabase
  dashboard if you want social sign-in. Email/password works out of the box.
- **SMTP** — configure a real SMTP provider under Admin → Email if you want
  password-reset / notification emails from your own domain.
- **Cron jobs** — daily rewards + demo/guest cleanup ship as
  `/api/public/*` endpoints. Point pg_cron (or any external scheduler) at
  them. Optional; the app runs fine without them.

Everything else — schema, policies, functions, buckets, first admin, seed
data, install lock — is fully automated.
