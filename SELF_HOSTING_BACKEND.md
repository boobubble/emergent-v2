# Self-Host the Backend (Docker)

This project's backend is a stack of open-source services (Postgres, auth, REST, realtime, storage). Run it all on your own server with Docker — no code changes to the app.

## What you get

- **Postgres 15** — your database
- **GoTrue** (Node.js) — auth: email/password, Google OAuth, JWT
- **PostgREST** — auto-generated REST API from your schema (respects RLS)
- **Realtime server** — WebSocket pub/sub for chat, DMs, typing, presence
- **Storage API** (Node.js) — file uploads for avatars + feed media
- **Kong** — API gateway (single URL for everything)
- **Studio** — admin dashboard UI (like the hosted Supabase dashboard)

All open source. All running on your box. You own the data.

---

## 1. Server requirements

- Linux server (Ubuntu 22.04+ recommended) with **4 GB RAM minimum**, 2 vCPU
- Docker + Docker Compose installed
- A domain name pointing to your server (e.g. `api.yourdomain.com`)
- Ports 80 + 443 open (for HTTPS via Caddy/Nginx) and 5432 if you want external DB access

```bash
# Install Docker on Ubuntu
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out and back in
```

---

## 2. Clone the official self-hosted stack

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

> The Supabase repo ships a production-ready `docker-compose.yml`. You will not modify it — only the `.env`.

---

## 3. Generate secrets

Edit `.env` and replace every placeholder. **Critical fields:**

```bash
############
# Secrets - GENERATE NEW VALUES, do NOT use defaults
############
POSTGRES_PASSWORD=<long random string>
JWT_SECRET=<at least 32 chars, generate with: openssl rand -base64 48>
ANON_KEY=<generate at https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys>
SERVICE_ROLE_KEY=<same site, with role=service_role>
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=<strong password>

############
# Public URLs (change to your domain)
############
SITE_URL=https://yourdomain.com
API_EXTERNAL_URL=https://api.yourdomain.com
SUPABASE_PUBLIC_URL=https://api.yourdomain.com

############
# SMTP (for password reset emails, signup confirmation)
############
SMTP_ADMIN_EMAIL=you@yourdomain.com
SMTP_HOST=smtp.resend.com   # or sendgrid, postmark, mailgun, etc.
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=<your smtp password>
SMTP_SENDER_NAME=YourApp

############
# Google OAuth (optional — for "Sign in with Google")
############
ENABLE_GOOGLE_SIGNUP=true
GOOGLE_CLIENT_ID=<from console.cloud.google.com>
GOOGLE_SECRET=<from console.cloud.google.com>
```

**Generate ANON_KEY and SERVICE_ROLE_KEY:**
Visit https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys, paste your `JWT_SECRET`, and copy the two generated JWTs into `.env`.

---

## 4. Start the stack

```bash
docker compose up -d
```

Wait ~30 seconds, then check:

```bash
docker compose ps
```

All services should show `healthy`. The admin dashboard is now at `http://your-server-ip:8000` (login with `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD`).

---

## 5. Apply your database schema

This project's schema (40+ tables, RLS, triggers, helper functions) needs to be loaded into your fresh Postgres.

```bash
# From your project root (where supabase/ lives)
cd ~/path/to/your/lovable-project

# Install the Supabase CLI
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/

# Connect directly to your self-hosted Postgres and push migrations
psql "postgresql://postgres:<POSTGRES_PASSWORD>@your-server-ip:5432/postgres" -f supabase/migrations/*.sql
```

Or, if you prefer one file at a time:

```bash
for f in supabase/migrations/*.sql; do
  psql "postgresql://postgres:<PASSWORD>@your-server-ip:5432/postgres" -f "$f"
done
```

---

## 6. Enable realtime on the chat tables

```bash
psql "postgresql://postgres:<PASSWORD>@your-server-ip:5432/postgres" <<'SQL'
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.messages,
  public.reactions,
  public.dm_reads,
  public.profiles,
  public.notifications,
  public.posts,
  public.comments,
  public.friendships,
  public.game_invites,
  public.game_players,
  public.games,
  public.feedback_reports,
  public.feedback_comments,
  public.feedback_votes;
SQL
```

---

## 7. Create storage buckets

In the dashboard (`http://your-server:8000` → Storage), create:
- `avatars` — public
- `feed-media` — public

---

## 8. Make yourself admin

```bash
# After signing up via the app, find your user id:
psql "..." -c "SELECT id, username FROM public.profiles ORDER BY created_at DESC LIMIT 5;"

# Grant super_admin:
psql "..." -c "INSERT INTO public.user_roles (user_id, role) VALUES ('<your-uuid>', 'super_admin');"
```

---

## 9. Point your app at your new backend

In your project's `.env`:

```bash
VITE_SUPABASE_URL=https://api.yourdomain.com
VITE_SUPABASE_PUBLISHABLE_KEY=<the ANON_KEY you generated>
SUPABASE_URL=https://api.yourdomain.com
SUPABASE_PUBLISHABLE_KEY=<the ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<the SERVICE_ROLE_KEY>
```

Then:

```bash
bun install
bun run dev
```

Sign up — your data lands in your Postgres.

---

## 10. Put HTTPS in front (production)

Use **Caddy** for automatic Let's Encrypt:

```caddy
# /etc/caddy/Caddyfile
api.yourdomain.com {
  reverse_proxy localhost:8000
}
```

```bash
sudo systemctl reload caddy
```

Done. Your backend is now fully self-hosted, fully open source, and 100% under your control.

---

## Backups

```bash
# Daily backup cron
docker exec supabase-db pg_dump -U postgres postgres | gzip > /backups/db-$(date +%F).sql.gz
```

---

## Why not a from-scratch Node.js/Express backend?

Rewriting this app's backend in plain Express would mean:
- ~150 REST endpoints to replace every `supabase.from(...)` call
- Custom JWT auth + Google OAuth + password reset emails
- Socket.io server replicating realtime pub/sub semantics
- S3 + signed URL layer
- Re-implementing 40+ RLS policies as Express middleware
- Rewriting every file in `src/lib/*.functions.ts`, `src/services/*.ts`, and every component

**Estimated: 4–6 weeks of work.** The self-hosted Docker stack above gives you the same result (Node.js services on your server, full data ownership) in **under an hour** with zero app-code changes.

If you have a *specific* piece of logic you want in custom Node.js (e.g. a payment webhook, a third-party API integration, an ML inference endpoint), tell me which feature and I'll add it as a standalone Node service that talks to the same Postgres.
