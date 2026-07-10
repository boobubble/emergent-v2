# BooBubble — Self-Hosting Release

Production deployment package. Contains the full application source only —
**no database dumps, no media, no backup manifests**. Those live in the
separate Full Backup ZIP and are for disaster recovery, not deployment.

## What's inside

```
boobubble-release/
├── source/            # complete application source (see source/README below)
├── README.md          # this file
├── INSTALLATION.md    # step-by-step install on a fresh VPS
├── CHANGELOG.md       # release notes
└── LICENSE.txt
```

## Deploy in three commands

```bash
cd source
npm install
npm run build
node .output/server/index.mjs
```

The Nitro `node-server` preset emits a standalone Node HTTP server at
`.output/server/index.mjs` that listens on `process.env.PORT || 3000`.
Works with PM2 + Nginx on any VPS (Ubuntu, Contabo, Hetzner, DigitalOcean,
AWS EC2, Azure VM, …).

See `INSTALLATION.md` for the full walkthrough and `source/SELF_HOSTING.md`
for PM2 / Nginx / TLS configuration.

## What this ZIP is NOT

This is **not** a backup. It does not contain `database.sql`, `media/`,
`restore/`, `backup-info.json`, or `validation.json`. To restore data,
use the Full Backup ZIP produced from the admin backup screen.
