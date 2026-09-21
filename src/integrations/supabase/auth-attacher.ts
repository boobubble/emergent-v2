// Must be registered as a global `functionMiddleware` in `src/start.ts`; otherwise
// the browser never attaches the bearer token to serverFn RPCs.
import { createMiddleware } from "@tanstack/react-start";
import { loadBrowserSupabase } from "./load-browser";

export async function resolveBrowserAuthHeaders(): Promise<Record<string, string>> {
  try {
    const supabase = await loadBrowserSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn("[auth-attacher] getSession error:", error.message);
      return {};
    }
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (e) {
    const message = e instanceof Error ? e.message : "Supabase client unavailable";
    console.warn("[auth-attacher] initialization failed:", message);
    return {};
  }
}

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => next({ headers: await resolveBrowserAuthHeaders() }),
);
