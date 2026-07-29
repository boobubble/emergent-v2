function getSupabasePublicEnv() {
  const url = firstNonEmpty(
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    "https://aofjhfsecwsrcvvvcfcy.supabase.co"
  );
  const publishableKey = firstNonEmpty(
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    "sb_publishable_R6cvebYP3NIBStd_txk04Q_a5agjzs_"
  );
  if (!url || !publishableKey) {
    const missing = [
      ...!url ? ["SUPABASE_URL or VITE_SUPABASE_URL"] : [],
      ...!publishableKey ? ["SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY"] : []
    ];
    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}. Add them to .env / .env.local (see .env.example).`
    );
  }
  return { url, publishableKey };
}
function firstNonEmpty(...values) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return void 0;
}
export {
  getSupabasePublicEnv
};
