/**
 * Server-side Supabase public credentials (project URL + anon/publishable key).
 *
 * TanStack Start / Vite inject `VITE_*` vars into server bundles via
 * `import.meta.env`, while Nitro production runtimes read `process.env`.
 * Hosts often set only one naming convention (e.g. `.env.local` with VITE_*),
 * so we resolve both to keep browser and server on the same project.
 */
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
  );

  if (!url || !publishableKey) {
    const missing = [
      ...(!url ? ["SUPABASE_URL or VITE_SUPABASE_URL"] : []),
      ...(!publishableKey ? ["SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}. ` +
        "Add them to .env / .env.local (see .env.example).",
    );
  }

  return { url, publishableKey };
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}
