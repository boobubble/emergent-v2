import { createFileRoute } from "@tanstack/react-router";
import { makeGamesApiHandler } from "@/lib/games-api/games-api.routes";
import { SaveWriteSchema, SaveReadSchema } from "@/lib/games-api/games-api.validators";
import { apiSaveWrite, apiSaveRead } from "@/lib/games-api/games-api.service";

const postHandler = makeGamesApiHandler({
  action: "save.write",
  rateKey: "cloudsave.write",
  schema: SaveWriteSchema,
  run: (ctx, input) =>
    apiSaveWrite(ctx, { slot: input.slot, data: input.data, expectedVersion: input.expectedVersion }),
});

const getHandler = makeGamesApiHandler({
  action: "save.read",
  rateKey: "cloudsave.read",
  schema: SaveReadSchema,
  run: (ctx, input) => apiSaveRead(ctx, { slot: input.slot, list: input.list }),
});

export const Route = createFileRoute("/api/games/save")({
  server: {
    handlers: { POST: postHandler, GET: getHandler, OPTIONS: postHandler },
  },
});
