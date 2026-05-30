# AI Providers — Architecture & DB-Ready Schema

The AI module is **architecture-only** today. Configuration is persisted in
`app_settings.ai` (jsonb). No live provider calls are wired yet.

## Storage

Today: `public.app_settings` row with `key = 'ai'`, `value jsonb` matching
`AIConfig` (see `src/lib/ai-providers-config.ts`).

Future migration (when implementing real calls):

```sql
-- Per-provider credentials (move from app_settings.ai.providers.*.apiKey)
create table public.ai_provider_credentials (
  provider text primary key,         -- 'openai' | 'gemini' | 'anthropic' | 'openrouter' | 'deepseek' | 'custom'
  enabled boolean not null default false,
  base_url text not null default '',
  default_model text not null default '',
  -- store encrypted (pgsodium / vault) — never expose to client
  api_key_encrypted bytea,
  organization text,
  updated_at timestamptz not null default now()
);

-- Per-feature routing overrides
create table public.ai_feature_routing (
  feature text primary key,          -- 'chatbot' | 'moderation' | ...
  enabled boolean not null default false,
  provider text,
  model text,
  prompt_template text,
  updated_at timestamptz not null default now()
);

-- Usage ledger (for quotas + spend caps)
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  feature text not null,
  provider text not null,
  model text not null,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  cost_usd numeric(10,6) not null default 0,
  created_at timestamptz not null default now()
);
create index on public.ai_usage (user_id, created_at desc);
create index on public.ai_usage (created_at desc);
```

All three tables are admin/service-only — no `anon` or `authenticated`
grants. The service layer in `src/services/ai-providers.service.ts` reads
credentials server-side and never returns them to the client.

## Service architecture

| Layer | File | Status |
|---|---|---|
| Provider registry | `src/lib/ai-providers-config.ts` | ✅ scaffolded |
| Feature flags / routing | `src/lib/ai-providers-flags.ts` | ✅ scaffolded |
| Service interface | `src/services/ai-providers.service.ts` | ✅ interface only — throws |
| Admin UI | `src/routes/admin.ai-settings.tsx` | ✅ full settings UI |
| Per-feature integrations | (per consumer) | ⏳ future |

## Feature flag usage

```ts
import { useAIFeature } from "@/lib/ai-providers-flags";

function ChatComposer() {
  const ai = useAIFeature("chatbot");
  if (!ai.allowed) return null; // or <Locked reason={ai.reason} />
  // future: call aiProviders.complete({ feature: "chatbot", ... })
}
```

## Providers

- `openai` — api.openai.com (GPT-5 family)
- `gemini` — Google AI Studio (Gemini 2.5 / 3.x)
- `anthropic` — Claude 3.5 / 4
- `openrouter` — unified gateway, OpenAI-compatible
- `deepseek` — DeepSeek chat/reasoner, OpenAI-compatible
- `custom` — any OpenAI-compatible endpoint (self-hosted, third-party)

## Features

- `chatbot` — in-room/DM AI assistants
- `moderation` — auto-classify abuse / NSFW / spam
- `contentSuggestions` — draft posts, replies, room names
- `feedAssistant` — summaries, recommendations
- `seoTools` — meta titles, descriptions, hashtags

## Security notes

- API keys live in `app_settings.ai.providers.*.apiKey` today. The admin
  settings JSON is read by trusted server functions; never expose this
  setting key to the client. Migrate to encrypted storage before going live.
- Always run provider calls server-side via `createServerFn` — never call
  provider APIs directly from the browser bundle.
- Enforce `AILimitsConfig` in the service layer; the admin UI captures
  intent only.
