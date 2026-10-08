import type { GameMode } from "./types";

export type BestScores = Record<GameMode, number>;

const KEY = "desi-vision-best-scores";

const EMPTY: BestScores = { quick: 0, chaos: 0, free: 0 };

function toNonNegative(n: unknown): number {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

export function loadBestScores(): BestScores {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<BestScores>;
    return {
      quick: toNonNegative(parsed.quick),
      chaos: toNonNegative(parsed.chaos),
      free: toNonNegative(parsed.free),
    };
  } catch {
    return { ...EMPTY };
  }
}

/** Records a score for a mode. Returns true when it sets a new best. */
export function recordBestScore(mode: GameMode, score: number): boolean {
  if (score <= 0) return false;
  const bests = loadBestScores();
  if (score <= bests[mode]) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...bests, [mode]: score }));
  } catch {
    /* storage unavailable, keep going */
  }
  return true;
}
