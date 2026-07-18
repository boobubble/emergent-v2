# @boobubble/games-sdk

Interface-only foundation for external games embedded in BooBubble.

This package exposes typed adapters for auth, profile, wallet, XP,
leaderboards, achievements, cloud saves, analytics, feed, notifications
and competitions. Nothing is wired to the platform backend yet — every
method returns `{ ok: false, error: { code: "NOT_IMPLEMENTED" } }` until
real adapters are injected in a follow-up phase.

## Usage

```ts
import { createGamesSDK } from "@/packages/games-sdk";

const sdk = createGamesSDK({ context: { gameId: "my-game", version: "1.0.0" } });

await sdk.addXP(10, "level-clear");
await sdk.addCoins(5, "daily-bonus");
await sdk.submitScore({ gameId: "my-game", score: 1234 });
await sdk.unlockAchievement("first_win");
await sdk.publishFeed({ text: "New high score!" });
await sdk.saveGame("slot1", { progress: 42 });
await sdk.loadGame("slot1");
await sdk.trackEvent({ name: "level_complete", properties: { level: 3 } });
await sdk.sendNotification({ title: "Your turn!" });
await sdk.joinCompetition("weekly-cup");
await sdk.leaveCompetition("weekly-cup");
```

## Guarantees

- Does **not** modify existing auth, wallet, XP, achievements, or competitions.
- Does **not** modify any database schema.
- Compiles cleanly and is safe to import from any part of the app.
