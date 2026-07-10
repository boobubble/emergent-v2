# Installation Guide

Deploy the BooBubble release on a fresh Linux VPS in ~15 minutes.

## 1. Requirements

- Ubuntu 22.04+ (or any modern Linux with systemd)
- Node.js **20 or newer** (22 LTS recommended)
- A Supabase project — URL, anon key, service_role key, DB URL
- A domain pointing to your server (for TLS)

## 2. Install Node + Nginx

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

## 3. Unpack the release

```bash
unzip boobubble-release-v*.zip -d /var/www
cd /var/www/boobubble-release/source
cp .env.example .env
# edit .env with your Supabase credentials
```

Required environment variables (see `.env.example`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_DB_URL=postgresql://...
PORT=3000
```

## 4. Build and start

```bash
npm install
npm run build
PORT=3000 pm2 start .output/server/index.mjs --name boobubble
pm2 save && pm2 startup
```

Verify: `curl http://127.0.0.1:3000` should return HTML.

## 5. Nginx + TLS

```nginx
server {
    listen 443 ssl http2;
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
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

## 6. Load database schema (fresh install only)

If your Supabase project is empty, apply the migrations bundled in
`source/supabase/migrations/`:

```bash
for f in source/supabase/migrations/*.sql; do
  psql "$SUPABASE_DB_URL" -f "$f"
done
```

## 7. Updating

```bash
cd /var/www/boobubble-release/source
git pull        # or unzip a newer release
npm install
npm run build
pm2 reload boobubble    # zero-downtime restart
```

For deeper PM2 / Nginx / provider-specific tips see `source/SELF_HOSTING.md`.
