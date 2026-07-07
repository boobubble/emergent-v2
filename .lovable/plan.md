# Game Rooms — Plan

Extend the current chatroom system with a new **Game Room** type. Nothing about auth, routing, presence, moderation, wallet, XP or gamification is rebuilt — only the center panel content and a small amount of admin configuration are added.

## 1. Data model

Extend the admin channel entry (already stored in `app_settings.chat_channels.list` from the previous step):

```ts
type AdminChannel = {
  id: string;
  name: string;
  topic?: string;
  kind?: "chat" | "game";      // NEW — default "chat"
  game?: {
    type: "arrow-puzzle";       // registry key (first game)
    difficulty?: "easy" | "normal" | "hard";
    dailyChallenge?: boolean;
    tournament?: boolean;
    spectators?: boolean;
    entryFeeCoins?: number;
    coinReward?: number;
    xpReward?: number;
    featured?: boolean;
  };
};
```

Chat-store `Room` gets an optional `kind` and `game` field, populated by `syncAdminChannels`.

## 2. Game registry (pluggable)

New file `src/lib/games-registry.tsx`:

```ts
type GameRuntimeProps = { room: Room; config: NonNullable<AdminChannel["game"]> };
type GameDef = {
  key: string;
  label: string;
  icon: LucideIcon;
  // Lazy loader — game code never touches normal chatroom bundles
  load: () => Promise<{ default: React.ComponentType<GameRuntimeProps> }>;
};
export const GAMES: Record<string, GameDef> = {
  "arrow-puzzle": { key: "arrow-puzzle", label: "Arrow Puzzle", icon: Puzzle,
    load: () => import("@/components/games/rooms/ArrowPuzzleGame") },
};
```

Adding future games (Chess, Sudoku, 2048…) = adding one entry here.

## 3. Center panel swap

In `ChatApp` (or `MessageList`'s parent), when `room.kind === "game"`:
- Render `<GameRoomCanvas room={room} />` instead of `<MessageList /> + <MessageInput />`.
- `MessageInput` is hidden — no user chat allowed in Game Rooms.

`GameRoomCanvas` layout:
```
┌─ GameHeader (game name, room name, players, spectators, difficulty, timer, room record, world record, Leave)
├─ <React.Suspense><LazyGameComponent /></Suspense>   ← full-height game area
└─ SystemEventFeed (auto-generated events only, virtualized list)
```

`SystemEventFeed` reads from `state.messages[roomId]` filtered to `kind === "system"`. Regular messages are blocked by short-circuiting `chat.send()` when `room.kind === "game"`.

## 4. First game — Arrow Puzzle

`src/components/games/rooms/ArrowPuzzleGame.tsx` — self-contained:
- Grid of arrow tiles, click to rotate neighbors, goal: all point up.
- Timer, moves, score, restart, hint, mini leaderboard (local + room).
- Emits gamification events via existing `gamification-emit.ts`:
  `arrow.level.completed`, `arrow.perfect.solve`, `game.room.joined/left`, `daily.challenge.completed`.
- Coin/XP rewards flow through existing wallet + gamification engine — no new reward code.

## 5. Sidebars

**Left sidebar** — reuse existing `Sidebar`. Split channels by kind: "Chat Rooms" and "Game Rooms" sections. Add link tiles inside the Game Rooms section:
- My Statistics → existing `/gamification` route
- Leaderboards → existing `/leaderboard`
- Daily Challenge / Weekly Tournament → filter chips inside the Game Rooms list

**Right sidebar** — reuse `MembersPanel`. When `room.kind === "game"`, show additional cards: Players Online (existing), Friends Playing, Current Rankings (from gamification), Daily Winners, Achievements, Active Challenges. These read from existing services; no new tables.

## 6. Admin

Extend `/admin/chatrooms` `ChannelsManager` (already exists):
- Add "Room type" select: Chat / Game.
- If Game selected, reveal: game type, difficulty, daily challenge toggle, tournament toggle, spectators toggle, entry fee (coins), coin reward, xp reward, featured.
- Existing add / remove / persist flow unchanged.

## 7. Responsive

- Desktop: game centered with header + event feed rail at bottom.
- Mobile: game fills viewport, event feed collapses into a bottom drawer, left/right sidebars collapse via existing chatroom mobile behavior. Header shrinks (icon-only controls) using the responsive header pattern (grid+min-w-0+shrink-0).

## 8. Performance

- `React.lazy` + `Suspense` inside `GameRoomCanvas` — game module only loads when a Game Room is active.
- Normal chatrooms import nothing from `games/rooms/*`.
- `games-registry` uses dynamic `import()` per game.

## 9. Files touched

New:
- `src/lib/games-registry.tsx`
- `src/components/chat/GameRoomCanvas.tsx`
- `src/components/chat/GameHeader.tsx`
- `src/components/chat/SystemEventFeed.tsx`
- `src/components/games/rooms/ArrowPuzzleGame.tsx`

Edited (small, additive):
- `src/lib/chat-types.ts` — add `kind` + `game` to `Room`.
- `src/lib/chat-store.tsx` — `syncAdminChannels` copies kind/game; `send()` no-ops for game rooms; `pushSystem` unchanged.
- `src/components/chat/ChatApp.tsx` — center-panel swap.
- `src/components/chat/Sidebar.tsx` — group chat vs game rooms, add game shortcuts.
- `src/components/chat/MembersPanel.tsx` — extra cards when `room.kind === "game"`.
- `src/routes/admin.chatrooms.tsx` — extend `ChannelsManager` form.

No migrations, no new tables, no changes to wallet/XP/gamification services.

## Out of scope for this pass

- Full Chess / Sudoku / 2048 implementations (only Arrow Puzzle ships; others plug in later via the registry).
- Server-authoritative multiplayer for real-time games — first game is single-player-per-user with shared leaderboard/events.

Confirm and I'll build it.
