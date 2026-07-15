// Rate-limit middleware factory for TanStack server functions.
// Wraps the existing enforceRateLimit() helper as a chainable middleware so it
// can be composed with requireSupabaseAuth without changing handler bodies.
//
// Usage:
//   export const doThing = createServerFn({ method: "POST" })
//     .middleware([requireSupabaseAuth, withRateLimit("feed.post")])
//     .handler(async ({ context }) => { ... });
//
// For anonymous endpoints, omit requireSupabaseAuth; the middleware falls back
// to IP-based keying via getClientIp() inside enforceRateLimit.
//
// Admins bypass automatically because check_and_consume_rate_limit checks
// has_role(auth.uid(), 'admin') server-side.

import { createMiddleware } from "@tanstack/react-start";
import { enforceRateLimit, RateLimitError } from "./rate-limit.server";

export function withRateLimit(action: string) {
  return createMiddleware({ type: "function" }).server(async ({ next, context }) => {
    const userId = (context as { userId?: string | null } | undefined)?.userId ?? null;
    try {
      await enforceRateLimit({ action, userId });
    } catch (e) {
      if (e instanceof RateLimitError) {
        throw new Error(
          `Too many requests. Please wait ${e.retryAfter}s before trying again.`,
        );
      }
      throw e;
    }
    return next();
  });
}
