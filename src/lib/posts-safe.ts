import { supabase } from "@/integrations/supabase/client";

/**
 * Browser-side helper to read from the `posts_safe` view, which masks
 * `owner_id` for anonymous posts (returns NULL unless the viewer is the
 * owner or an admin). The base `posts` table no longer grants SELECT on
 * `owner_id` to the authenticated/anon roles.
 *
 * Use this for any client read that needs `owner_id`. Inserts/updates/
 * deletes still target the base `posts` table.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const postsSafe = () => (supabase as any).from("posts_safe");

/** Calls the server-side `my_coin_balance` function and returns the
 *  signed-in user's own coin balance. Returns 0 when unauthenticated. */
export async function fetchMyCoinBalance(): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).rpc("my_coin_balance");
  return typeof data === "number" ? data : 0;
}
