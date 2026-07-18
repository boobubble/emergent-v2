import { createFileRoute } from "@tanstack/react-router";
import { makeGamesApiHandler } from "@/lib/games-api/games-api.routes";
import { FinishSchema } from "@/lib/games-api/games-api.validators";
import { apiFinish } from "@/lib/games-api/games-api.service";

const handler = makeGamesApiHandler({
  action: "finish",
  rateKey: "api",
  schema: FinishSchema,
  run: (ctx, input) => apiFinish(ctx, input),
});

export const Route = createFileRoute("/api/games/finish")({
  server: { handlers: { POST: handler, OPTIONS: handler } },
});
