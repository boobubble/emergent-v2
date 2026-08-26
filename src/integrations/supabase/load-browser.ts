/**
 * Dynamic entry for the browser Supabase client.
 * Static imports of this file do not pull `@supabase/supabase-js` into the
 * guest homepage graph; the library loads only when this function runs.
 */
export { loadBrowserSupabase } from "./client";
