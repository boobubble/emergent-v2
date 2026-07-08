import type { Level } from "./logic";

// Arrow Escape demos — every level is hand-verified solvable (see isSolvable()).
// A tapped arrow flies off the board in its pointing direction when its path
// is clear of walls and other arrows.

export const DEMO_PATH_ESCAPE_LEVELS: Level[] = [
  {
    id: "demo-pathescape-1",
    number: 1,
    name: "First Escape",
    difficulty: "easy",
    grid_w: 5,
    grid_h: 5,
    layout: {
      pieces: [
        // A → R is blocked by B. Tap B (down, clear) first, then A, then C.
        { id: "A", r: 0, c: 0, dir: "R" },
        { id: "B", r: 0, c: 3, dir: "D" },
        { id: "C", r: 3, c: 0, dir: "R" },
      ],
    },
    par_moves: 3,
    par_time: 30,
    coin_reward: 10,
    xp_reward: 20,
  },
  {
    id: "demo-pathescape-2",
    number: 2,
    name: "Cross Traffic",
    difficulty: "normal",
    grid_w: 6,
    grid_h: 6,
    layout: {
      walls: [{ r: 2, c: 2 }],
      pieces: [
        // A → R blocked by B. B → D clear. C → U blocked by A until A leaves.
        { id: "A", r: 1, c: 1, dir: "R" },
        { id: "B", r: 1, c: 4, dir: "D" },
        { id: "C", r: 4, c: 1, dir: "U" },
        { id: "D", r: 4, c: 4, dir: "R" }, // independent
      ],
    },
    par_moves: 4,
    par_time: 45,
    coin_reward: 15,
    xp_reward: 30,
  },
  {
    id: "demo-pathescape-3",
    number: 3,
    name: "Chain Reaction",
    difficulty: "hard",
    grid_w: 6,
    grid_h: 6,
    layout: {
      walls: [{ r: 0, c: 5 }, { r: 5, c: 0 }],
      pieces: [
        // D → D is clear (goes down and off). Then B → D, then A → R, then C → R.
        { id: "A", r: 0, c: 0, dir: "R" },
        { id: "B", r: 0, c: 3, dir: "D" },
        { id: "C", r: 3, c: 0, dir: "R" },
        { id: "D", r: 3, c: 3, dir: "D" },
      ],
    },
    par_moves: 4,
    par_time: 60,
    coin_reward: 20,
    xp_reward: 40,
  },
];

export function fallbackLevel(after = 0): Level {
  return DEMO_PATH_ESCAPE_LEVELS.find(level => level.number >= after) ?? DEMO_PATH_ESCAPE_LEVELS[0];
}

export function randomFallbackLevel(): Level {
  return DEMO_PATH_ESCAPE_LEVELS[Math.floor(Math.random() * DEMO_PATH_ESCAPE_LEVELS.length)];
}
