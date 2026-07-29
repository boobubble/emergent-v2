import { a as createMiddleware, d as getRequest } from "./server-DxoLgaf4.mjs";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
import { getSupabasePublicEnv } from "./env.server-Bcmcot3M.mjs";
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { url: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY } = getSupabasePublicEnv();
    const request = getRequest();
    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Unauthorized: No authorization header provided");
    }
    if (!authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: Only Bearer tokens are supported");
    }
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          storage: void 0,
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      throw new Error("Unauthorized: Invalid token");
    }
    if (!data.claims.sub) {
      throw new Error("Unauthorized: No user ID found in token");
    }
    return next({
      context: {
        supabase,
        userId: data.claims.sub,
        claims: data.claims
      }
    });
  }
);
export {
  requireSupabaseAuth as r
};
