import type { Level } from "./logic";

// Arrow Escape demos — single-cell arrows that fly off the board when tapped.
// Levels are hand-crafted so blockers force a solve order.

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
        // C must go right first (clear), then B up, then A left.
        { id: "A", r: 2, c: 4, dir: "L" },
        { id: "B", r: 4, c: 2, dir: "U" },
        { id: "C", r: 2, c: 2, dir: "R" },
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
      walls: [{ r: 2, c: 2 }, { r: 3, c: 3 }],
      pieces: [
        { id: "A", r: 0, c: 1, dir: "D" }, // blocked by C until C leaves right
        { id: "B", r: 5, c: 4, dir: "U" }, // blocked by D until D leaves left
        { id: "C", r: 1, c: 0, dir: "R" },
        { id: "D", r: 4, c: 5, dir: "L" },
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
    name: "Gridlock",
    difficulty: "hard",
    grid_w: 6,
    grid_h: 6,
    layout: {
      walls: [{ r: 0, c: 3 }, { r: 5, c: 2 }],
      pieces: [
        { id: "A", r: 2, c: 1, dir: "R" },
        { id: "B", r: 2, c: 4, dir: "D" },
        { id: "C", r: 4, c: 4, dir: "L" },
        { id: "D", r: 4, c: 1, dir: "U" },
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
