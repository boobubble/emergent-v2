import type { Level } from "./logic";

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
        { id: "A", startR: 0, startC: 0, cells: [{ r: 0, c: 0, dir: "R" }] },
        { id: "B", startR: 2, startC: 0, cells: [{ r: 0, c: 0, dir: "R" }] },
        { id: "C", startR: 4, startC: 4, cells: [{ r: 0, c: 0, dir: "L" }] },
      ],
    },
    solution: {
      pieces: [
        { id: "A", r: 0, c: 4 },
        { id: "B", r: 2, c: 4 },
        { id: "C", r: 4, c: 0 },
      ],
    },
    par_moves: 3,
    par_time: 45,
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
      pieces: [
        { id: "A", startR: 0, startC: 1, cells: [{ r: 0, c: 0, dir: "D" }] },
        { id: "B", startR: 5, startC: 4, cells: [{ r: 0, c: 0, dir: "U" }] },
        { id: "C", startR: 2, startC: 0, cells: [{ r: 0, c: 0, dir: "R" }] },
        { id: "D", startR: 3, startC: 5, cells: [{ r: 0, c: 0, dir: "L" }] },
      ],
    },
    solution: {
      pieces: [
        { id: "A", r: 5, c: 1 },
        { id: "B", r: 0, c: 4 },
        { id: "C", r: 2, c: 5 },
        { id: "D", r: 3, c: 0 },
      ],
    },
    par_moves: 4,
    par_time: 60,
    coin_reward: 15,
    xp_reward: 30,
  },
];

export function fallbackLevel(after = 0): Level {
  return DEMO_PATH_ESCAPE_LEVELS.find(level => level.number >= after) ?? DEMO_PATH_ESCAPE_LEVELS[0];
}

export function randomFallbackLevel(): Level {
  return DEMO_PATH_ESCAPE_LEVELS[Math.floor(Math.random() * DEMO_PATH_ESCAPE_LEVELS.length)];
}