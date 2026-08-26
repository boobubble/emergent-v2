// Browser Supabase entry. `@supabase/supabase-js` is loaded only when
// loadBrowserSupabase() runs.

type BrowserClient = ReturnType<typeof import("./client-eager").createRawBrowserClient>;

let _supabase: BrowserClient | undefined;
let _loading: Promise<BrowserClient> | undefined;

export async function loadBrowserSupabase(): Promise<BrowserClient> {
  if (_supabase) return _supabase;
  if (!_loading) {
    _loading = (async () => {
      const [{ createRawBrowserClient }, { attachSupabaseMonitoring }] = await Promise.all([
        import("./client-eager"),
        import("@/lib/supabase-monitor"),
      ]);
      _supabase = attachSupabaseMonitoring(await createRawBrowserClient());
      return _supabase;
    })();
  }
  return _loading;
}

export const supabase = new Proxy({} as BrowserClient, {
  get(_, prop, receiver) {
    if (!_supabase) {
      throw new Error("Supabase client used before loadBrowserSupabase()");
    }
    return Reflect.get(_supabase, prop, receiver);
  },
});
