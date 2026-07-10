# Self-hosting this project (Node.js standalone)

This project is a TanStack Start app backed by Supabase. It builds to a
standalone Nitro **Node.js** server — no Cloudflare Worker, no serverless
platform required. Deploy it on any VPS (Ubuntu, Contabo, DigitalOcean,
Hetzner, AWS EC2, Azure VM, …) with Node 20+.

## 1. Requirements

- Node.js **20 or newer** (22 LTS recommended)
- npm (or bun/pnpm — examples below use npm)
- A Supabase project (URL, anon key, service_role key, DB URL)

## 2. Environment variables

Create a `.env` at the project root (or export them in your process manager):

```bash
# Public (safe to expose to the browser)
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
VITE_SUPABASE_PROJECT_ID=<ref>

# Server-only (NEVER ship to the browser)
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres

# Optional
PORT=3000            # HTTP port the Node server binds to (default 3000)
HOST=0.0.0.0         # Interface to bind to (default 0.0.0.0)
```

Get the values from your Supabase dashboard:
- anon + service_role: Settings → API
- DB URL: Settings → Database → Connection string (URI)

## 3. Enable Google sign-in (native Supabase)

1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth Client ID** (Web).
2. Authorized redirect URI: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → **Google** → paste Client ID + Secret, enable.
4. Add your production domain to Authentication → URL Configuration → Site URL / Redirect URLs.

## 4. Build & run

```bash
npm install
npm run build
node .output/server/index.mjs
```

The build emits a standalone Node server at `.output/server/index.mjs` that
starts an HTTP listener on `process.env.PORT || 3000`. SSR, API routes,
middleware and every TanStack Start server function keep working exactly as
in development.

`npm start` is a shortcut for `node .output/server/index.mjs`.

## 5. Run as a service with PM2

```bash
npm install -g pm2

# From the project root, after `npm run build`
PORT=3000 pm2 start .output/server/index.mjs --name myapp

pm2 save
pm2 startup   # follow the printed command to enable auto-start on boot
```

Useful commands: `pm2 logs myapp`, `pm2 restart myapp`, `pm2 reload myapp`
(zero-downtime), `pm2 stop myapp`.

## 6. Reverse proxy with Nginx

Example server block terminating TLS at Nginx and proxying to the Node
process on `127.0.0.1:3000`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    client_max_body_size 25m;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 60s;
    }
}
```

Reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`.

## 7. Deploy checklist for a fresh VPS (Ubuntu example)

```bash
# Node 22 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git

# Get the code
git clone <your-repo> /var/www/myapp
cd /var/www/myapp
cp .env.example .env         # then edit with real values

# Build & run
npm install
npm run build
sudo npm install -g pm2
PORT=3000 pm2 start .output/server/index.mjs --name myapp
pm2 save && pm2 startup

# Nginx + TLS
sudo cp deploy/nginx.conf /etc/nginx/sites-available/myapp   # your file
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

## 8. Optional: Cloudflare Workers

Node standalone is the default self-hosting target. If you want to deploy to
Cloudflare Workers instead, switch the Nitro preset in `vite.config.ts` back
to `cloudflare-module` (or delete the `nitro` block to fall back to the
Lovable preset default) and add a `wrangler.jsonc`. Everything else in the
app stays the same.

## What was removed vs kept

- **Removed:** `wrangler.jsonc` and the Cloudflare-first build defaults.
- **Kept:** `@lovable.dev/vite-tanstack-config` (a normal Vite plugin, works
  off-platform), `src/server.ts` (fetch-shaped SSR entry — Nitro's
  node-server preset wraps it in an `http.createServer` listener), all
  Supabase integrations, all server functions, all API routes.
