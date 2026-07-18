/**
 * Games API — internal server-function surface.
 *
 * The Games API is primarily consumed by external games over HTTP under
 * `/api/games/*` (see `games-api.routes.ts`). These `createServerFn`
 * wrappers expose the same operations to trusted in-app callers (e.g.
 * admin tools, tests) — every function delegates to the same service
 * layer, so there is exactly one code path per action.
 *
 * Auth here is the standard Supabase session (requireSupabaseAuth); the
 * external HTTP layer uses the signed launch token instead. Neither adds
 * new business logic.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "@/lib/rate-limit-middleware";
import {
  apiStart,
  apiFinish,
  apiSubmitScore,
  apiAddXP,
  apiAddCoins,
  apiSaveWrite,
  apiSaveRead,
  apiUnlockAchievement,
  apiTrackEvent,
  type SessionCtx,
} from "./games-api.service";
import {
  StartSchema,
  FinishSchema,
  ScoreSchema,
  XpSchema,
  CoinsSchema,
  SaveWriteSchema,
  SaveReadSchema,
  AchievementSchema,
  EventSchema,
} from "./games-api.validators";

function ctx(userId: string, gameId: string): SessionCtx {
  return { userId, gameId };
}

export const gamesApiStart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((i: unknown) => StartSchema.parse(i))
  .handler(async ({ data, context }) =>
    apiStart(ctx(context.userId, data.gameId ?? "internal"), data.metadata),
  );

export const gamesApiFinish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((i: unknown) => FinishSchema.parse(i))
  .handler(async ({ data, context }) =>
    apiFinish(ctx(context.userId, data.gameId ?? "internal"), data),
  );

export const gamesApiScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((i: unknown) => ScoreSchema.parse(i))
  .handler(async ({ data, context }) =>
    apiSubmitScore(ctx(context.userId, data.gameId ?? "internal"), data),
  );

export const gamesApiXp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((i: unknown) => XpSchema.parse(i))
  .handler(async ({ data, context }) =>
    apiAddXP(ctx(context.userId, data.gameId ?? "internal"), data),
  );

export const gamesApiCoins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((i: unknown) => CoinsSchema.parse(i))
  .handler(async ({ data, context }) =>
    apiAddCoins(ctx(context.userId, data.gameId ?? "internal"), data),
  );

export const gamesApiSaveWrite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((i: unknown) => SaveWriteSchema.parse(i))
  .handler(async ({ data, context }) =>
    apiSaveWrite(ctx(context.userId, data.gameId ?? "internal"), data),
  );

export const gamesApiSaveRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((i: unknown) => SaveReadSchema.parse(i))
  .handler(async ({ data, context }) =>
    apiSaveRead(ctx(context.userId, data.gameId ?? "internal"), data),
  );

export const gamesApiAchievement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((i: unknown) => AchievementSchema.parse(i))
  .handler(async ({ data, context }) =>
    apiUnlockAchievement(ctx(context.userId, "internal"), data),
  );

export const gamesApiEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((i: unknown) => EventSchema.parse(i))
  .handler(async ({ data, context }) =>
    apiTrackEvent(ctx(context.userId, data.gameId ?? "internal"), data),
  );
