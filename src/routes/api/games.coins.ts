import { createFileRoute } from "@tanstack/react-router";
import { makeGamesApiHandler } from "@/lib/games-api/games-api.routes";
import { CoinsSchema } from "@/lib/games-api/games-api.validators";
import { apiAddCoins } from "@/lib/games-api/games-api.service";

const handler = makeGamesApiHandler({
  action: "coins",
  rateKey: "wallet.write",
  schema: CoinsSchema,
  run: (ctx, input) => apiAddCoins(ctx, input),
});

export const Route = createFileRoute("/api/games/coins")({
  server: { handlers: { POST: handler, OPTIONS: handler } },
});
