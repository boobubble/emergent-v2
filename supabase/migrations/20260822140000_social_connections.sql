-- Connected social accounts for one-click publishing of existing welcome feed posts.
-- Tokens are stored encrypted server-side. Clients must never SELECT this table.
-- Does NOT change Buffer / Instagram / X / TikTok automation.

-- ---------------------------------------------------------------------------
-- 1) Extra distribution fields (status model unchanged)
-- ---------------------------------------------------------------------------
ALTER TABLE public.social_manual_distribution
  ADD COLUMN IF NOT EXISTS external_post_id text,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.social_manual_distribution.external_post_id IS
  'Platform post id / URI returned by a successful API publish. Null for manual-only YouTube.';

-- ---------------------------------------------------------------------------
-- 2) Yaarzo social connections (one per platform)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected'
    CHECK (status = ANY (ARRAY[
      'connected'::text,
      'disconnected'::text,
      'expired'::text,
      'error'::text,
      'pending'::text
    ])),
  account_id text,
  account_name text,
  page_id text,
  page_name text,
  default_board_id text,
  default_board_name text,
  handle text,
  token_ciphertext text,
  scopes text[] NOT NULL DEFAULT '{}',
  health text NOT NULL DEFAULT 'unknown'
    CHECK (health = ANY (ARRAY[
      'healthy'::text,
      'degraded'::text,
      'error'::text,
      'unknown'::text
    ])),
  last_error text,
  last_checked_at timestamptz,
  connected_at timestamptz,
  connected_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_connections_platform_check CHECK (
    platform = ANY (ARRAY[
      'facebook'::text,
      'pinterest'::text,
      'bluesky'::text,
      'youtube'::text
    ])
  ),
  CONSTRAINT social_connections_platform_unique UNIQUE (platform)
);

COMMENT ON TABLE public.social_connections IS
  'Yaarzo-owned social accounts for manual API publishing. token_ciphertext is AES-GCM and must never be returned to clients.';

CREATE INDEX IF NOT EXISTS social_connections_status_idx
  ON public.social_connections (platform, status);

ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- No authenticated/anon policies: only service_role (server fns) may read tokens.
REVOKE ALL ON TABLE public.social_connections FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.social_connections TO service_role;

-- ---------------------------------------------------------------------------
-- 3) Short-lived OAuth CSRF/PKCE state
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  state text NOT NULL UNIQUE,
  code_verifier_ciphertext text,
  admin_user_id uuid NOT NULL,
  return_path text NOT NULL DEFAULT '/admin/social-automation?tab=connections',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_oauth_states_platform_check CHECK (
    platform = ANY (ARRAY['facebook'::text, 'pinterest'::text, 'bluesky'::text])
  )
);

CREATE INDEX IF NOT EXISTS social_oauth_states_expires_idx
  ON public.social_oauth_states (expires_at);

ALTER TABLE public.social_oauth_states ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.social_oauth_states FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.social_oauth_states TO service_role;
