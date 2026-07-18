import { createFileRoute } from "@tanstack/react-router";
import { makeGamesApiHandler } from "@/lib/games-api/games-api.routes";
import { AchievementSchema } from "@/lib/games-api/games-api.validators";
import { apiUnlockAchievement } from "@/lib/games-api/games-api.service";

const handler = makeGamesApiHandler({
  action: "achievement",
  rateKey: "xp.write",
  schema: AchievementSchema,
  run: (ctx, input) => apiUnlockAchievement(ctx, input),
});

export const Route = createFileRoute("/api/games/achievement")({
  server: { handlers: { POST: handler, OPTIONS: handler } },
});
