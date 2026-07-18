import { createFileRoute } from "@tanstack/react-router";
import { makeGamesApiHandler } from "@/lib/games-api/games-api.routes";
import { XpSchema } from "@/lib/games-api/games-api.validators";
import { apiAddXP } from "@/lib/games-api/games-api.service";

const handler = makeGamesApiHandler({
  action: "xp",
  rateKey: "xp.write",
  schema: XpSchema,
  run: (ctx, input) => apiAddXP(ctx, input),
});

export const Route = createFileRoute("/api/games/xp")({
  server: { handlers: { POST: handler, OPTIONS: handler } },
});
