/**
 * Server-side Supabase public credentials (project URL + anon/publishable key).
 *
 * TanStack Start / Vite inject `VITE_*` vars into server bundles via
 * `import.meta.env`, while Nitro production runtimes read `process.env`.
 * Hosts often set only one naming convention (e.g. `.env.local` with VITE_*,
 * or Vercel with legacy SUPABASE_ANON_KEY), so we resolve all aliases to keep
 * browser and server on the same project.
 */

/** Boolean presence only — never log values. */
export function getSupabaseEnvPresence(): Record<string, boolean> {
  return {
    SUPABASE_URL: hasEnv("SUPABASE_URL"),
    SUPABASE_ANON_KEY: hasEnv("SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: hasEnv("SUPABASE_SERVICE_ROLE_KEY"),
    VITE_SUPABASE_URL: hasEnv("VITE_SUPABASE_URL") || hasImportMeta("VITE_SUPABASE_URL"),
    VITE_SUPABASE_ANON_KEY:
      hasEnv("VITE_SUPABASE_ANON_KEY") || hasImportMeta("VITE_SUPABASE_ANON_KEY"),
  };
}

export function logSupabaseEnvPresence(context: string): void {
  console.error(`[Supabase env] ${context}`, getSupabaseEnvPresence());
}

export function getSupabasePublicEnv(): { url: string; publishableKey: string } {
  const url = firstNonEmpty(
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_URL,
  );

  const publishableKey = firstNonEmpty(
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.VITE_SUPABASE_ANON_KEY,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  if (!url || !publishableKey) {
    logSupabaseEnvPresence("getSupabasePublicEnv missing required vars");
    const missing = [
      ...(!url ? ["SUPABASE_URL or VITE_SUPABASE_URL"] : []),
      ...(!publishableKey
        ? [
            "SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, or VITE_SUPABASE_ANON_KEY",
          ]
        : []),
    ];
    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}. ` +
        "Add them to .env / .env.local (see .env.example).",
    );
  }

  return { url, publishableKey };
}

function hasEnv(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function hasImportMeta(name: string): boolean {
  const value = (import.meta.env as Record<string, string | undefined>)[name];
  return Boolean(value?.trim());
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}
