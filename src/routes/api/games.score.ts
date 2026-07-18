import { createFileRoute } from "@tanstack/react-router";
import { makeGamesApiHandler } from "@/lib/games-api/games-api.routes";
import { ScoreSchema } from "@/lib/games-api/games-api.validators";
import { apiSubmitScore } from "@/lib/games-api/games-api.service";

const handler = makeGamesApiHandler({
  action: "score",
  rateKey: "game.write",
  schema: ScoreSchema,
  run: (ctx, input) => apiSubmitScore(ctx, input),
});

export const Route = createFileRoute("/api/games/score")({
  server: { handlers: { POST: handler, OPTIONS: handler } },
});
