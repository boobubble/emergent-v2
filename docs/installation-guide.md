# Installation Guide

This guide walks a buyer from a fresh download to a running community in
about 15 minutes. It covers local install, backend setup, first admin
account, and where to configure each module.

> Need a 1-minute overview? Watch the video walkthrough included in the
> package (`/docs/video/install.mp4`).

---

## 1. Requirements

- **Node 20+** and **Bun 1.1+** (or pnpm 9 / npm 10).
- A free **Supabase** project (Postgres + Auth + Storage).
- Any host that runs Node/Edge functions (Cloudflare, Vercel, Netlify, VPS).

## 2. Unpack & install dependencies

```bash
unzip community-platform.zip
cd community-platform
bun install        # or: npm install
```

## 3. Connect your backend

1. Create a Supabase project at https://supabase.com.
2. Copy `.env.example` to `.env` and fill in the six `SUPABASE_*` /
   `VITE_SUPABASE_*` values (see `.env.example` — every variable is
   documented inline).
3. Apply migrations:
   ```bash
   bunx supabase db push
   ```
   This creates every table, index, RLS policy, function, trigger and seed
   row the app uses.

## 4. Start the dev server

```bash
bun dev
```

Open http://localhost:5173.

## 5. Run the installer (`/installer`)

Visit `/installer` and follow the 7-step wizard:

1. **Welcome** → **License** → **Requirements** — health check for DB,
   storage, realtime, SMTP, env vars.
2. **Admin Account** — creates the first user AND automatically promotes
   them to `super_admin` (no manual SQL required).
3. **Site Branding** — site name, logo.
4. **Finish** — writes the install lock, provisions the four required
   storage buckets (`avatars`, `feed-media`, `brand-assets`, `stickers`)
   automatically, and reports post-install stats.

That's it — the app is ready to use. `/admin` is now reachable.

> Alternative path: after step 5 (Admin Account), skip the wizard and go
> straight to `/admin/backup` → **Restore Backup** to restore a portable
> ZIP from another install. Buckets and media files are recreated on the
> new project automatically.

## 6. Configure the essentials


| Area | Where | Notes |
|------|-------|-------|
| Homepage feature cards | `/admin/homepage` | Each card supports an optional link. |
| Login background | `/admin/auth-background` | Toggle the live chatroom blur effect. |
| Staff permissions | `/admin/staff-permissions` | Allow moderators to kick/mute/ban. |
| SEO defaults | `/admin/seo` | Per-page title, description, OG image. |
| Email / SMTP | `/admin/email` | Outgoing email and templates. |
| Announcements & Popups | `/admin/announcements`, `/admin/popups` | Site-wide messages. |
| Maintenance mode | `/admin/maintenance` | Take the site offline for non-admins. |

## 8. Deploy

The app runs anywhere that supports Node/Edge runtimes. The recommended
target is **Cloudflare Pages + Workers**:

```bash
bun run build
bunx wrangler deploy
```

Vercel and Netlify work out of the box with the included `vite.config.ts`.

## 9. Day-2 operations

- **Audit Logs**: `/admin/audit-logs` — every staff action.
- **User Activity**: `/admin/activity-logs` — logins, devices, IPs.
- **Cache & Maintenance**: `/admin/cache` — clear caches, prune sessions.
- **Export**: `/admin/export` — CSV / Excel snapshots of core tables.

## 10. Updating

Each update ships as a zip. To apply:

1. Back up your `.env` and any custom files in `src/`.
2. Replace the codebase with the new zip.
3. Re-run `bun install` and `bunx supabase db push`.
4. Restart your host.

Migrations are additive — your data is preserved.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank page on first load | Confirm all 4 `SUPABASE_*` env vars are set. |
| "Admin" entry missing | Run the role insert in step 5. |
| Email not sending | Configure SMTP in `/admin/email` and send a test. |
| Realtime feels slow | Check `/admin/realtime` and your Supabase plan limits. |

Need more? See `SELF_HOSTING.md` and `SELF_HOSTING_BACKEND.md` in the
repository root.
