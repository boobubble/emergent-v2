export interface Rank {
  title: string;
  minLevel: number;
  color: string; // tailwind text color
  chip: string;  // tailwind bg+text classes
}

export const RANKS: Rank[] = [
  { title: "Newcomer", minLevel: 1,  color: "text-slate-500",   chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { title: "Regular",  minLevel: 5,  color: "text-sky-500",     chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  { title: "Veteran",  minLevel: 10, color: "text-emerald-500", chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { title: "Elite",    minLevel: 20, color: "text-amber-500",   chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { title: "Legend",   minLevel: 35, color: "text-fuchsia-500", chip: "bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-fuchsia-700 dark:text-fuchsia-200" },
];

export function rankFor(level: number): Rank {
  let r = RANKS[0];
  for (const x of RANKS) if (level >= x.minLevel) r = x;
  return r;
}

/** XP needed to reach a given level. Matches xpToLevel: level = floor(xp/50)+1 */
export function xpForLevel(level: number): number {
  return Math.max(0, (level - 1) * 50);
}

export function levelProgress(xp: number): { level: number; intoLevel: number; toNext: number; pct: number } {
  const level = Math.floor(xp / 50) + 1;
  const intoLevel = xp - (level - 1) * 50;
  const toNext = 50;
  return { level, intoLevel, toNext, pct: Math.round((intoLevel / toNext) * 100) };
}
