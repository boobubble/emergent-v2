import { createFileRoute } from "@tanstack/react-router";
import { makeGamesApiHandler } from "@/lib/games-api/games-api.routes";
import { StartSchema } from "@/lib/games-api/games-api.validators";
import { apiStart } from "@/lib/games-api/games-api.service";

const handler = makeGamesApiHandler({
  action: "start",
  rateKey: "api",
  schema: StartSchema,
  run: (ctx, input) => apiStart(ctx, input.metadata),
});

export const Route = createFileRoute("/api/games/start")({
  server: {
    handlers: { POST: handler, OPTIONS: handler },
  },
});
