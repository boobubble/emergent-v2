# Running this project independently

This project is a TanStack Start app backed by Supabase. After the cleanup,
it no longer depends on any Lovable runtime services. You can run it on any
host that supports Node 20+ / Cloudflare Workers / Vercel / Netlify.

## 1. Environment variables

Create a `.env` at the project root:

```bash
# Public (safe to expose to the browser)
VITE_SUPABASE_URL=https://zemkntcobnppphxiptkn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
VITE_SUPABASE_PROJECT_ID=zemkntcobnppphxiptkn

# Server-only (NEVER ship to the browser)
SUPABASE_URL=https://zemkntcobnppphxiptkn.supabase.co
SUPABASE_PUBLISHABLE_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
SUPABASE_DB_URL=postgresql://postgres:<password>@db.zemkntcobnppphxiptkn.supabase.co:5432/postgres
```

Get the values from the Supabase dashboard:
- anon + service_role: Settings → API
- DB URL: Settings → Database → Connection string (URI)

## 2. Enable Google sign-in (native Supabase)

1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth Client ID** (Web).
2. Authorized redirect URI: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → **Google** → paste Client ID + Secret, enable.
4. Add your production domain to Authentication → URL Configuration → Site URL / Redirect URLs.

The code already calls native Supabase OAuth (`supabase.auth.signInWithOAuth({ provider: "google" })`),
so no further code changes are needed.

## 3. Install & run

```bash
bun install
bun run dev        # local dev on http://localhost:3000
bun run build      # production build
bun run start      # serve the build
```

## 4. Deploy

- **Cloudflare Workers** — `wrangler.jsonc` is already configured. Run `bunx wrangler deploy`.
- **Vercel / Netlify** — add the env vars above to the project settings and deploy as a normal Vite + TanStack Start app.

## What was removed for independence

- `@lovable.dev/cloud-auth-js` package and `src/integrations/lovable/`
  (Google login now uses Supabase directly).
- Dormant AI scaffolding (`ai-providers-config.ts`, `ai-providers-flags.ts`,
  `services/ai-providers.service.ts`, `routes/admin.ai-settings.tsx`).
  Nothing in the app actually called these — chat bots and trivia are
  hard-coded scripts, not AI calls.

## What was kept

- `@lovable.dev/vite-tanstack-config` — this is just a Vite plugin published
  to npm. It works fine off-platform; no Lovable account or services required.
- `LOVABLE_API_KEY` secret — unused after this cleanup. Safe to delete from
  your env if you don't reintroduce AI features.
