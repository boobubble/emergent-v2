import { createFileRoute } from "@tanstack/react-router";
import { makeGamesApiHandler } from "@/lib/games-api/games-api.routes";
import { EventSchema } from "@/lib/games-api/games-api.validators";
import { apiTrackEvent } from "@/lib/games-api/games-api.service";

const handler = makeGamesApiHandler({
  action: "event",
  rateKey: "api",
  schema: EventSchema,
  run: (ctx, input) => apiTrackEvent(ctx, input),
});

export const Route = createFileRoute("/api/games/event")({
  server: { handlers: { POST: handler, OPTIONS: handler } },
});
