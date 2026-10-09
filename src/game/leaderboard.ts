export interface LeaderboardEntry {
  name: string;
  score: number;
  catches: number;
  mode: string;
  date: string;
}

const KEY = "desi-vision-leaderboard";
const MAX_ENTRIES = 10;

const DEFAULTS: LeaderboardEntry[] = [
  { name: "CHAUDHARY", score: 5200, catches: 14, mode: "QUICK CATCH", date: "2026-09-20" },
  { name: "TRACTOR KING", score: 3600, catches: 10, mode: "QUICK CATCH", date: "2026-09-21" },
  { name: "HOOKAH MASTER", score: 2400, catches: 7, mode: "CHAOS MODE", date: "2026-09-22" },
  { name: "DESI LEGEND", score: 1500, catches: 5, mode: "QUICK CATCH", date: "2026-09-23" },
];

function cloneDefaults(): LeaderboardEntry[] {
  return DEFAULTS.map((d) => ({ ...d }));
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const d = cloneDefaults();
      localStorage.setItem(KEY, JSON.stringify(d));
      return d;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return cloneDefaults();
    return parsed as LeaderboardEntry[];
  } catch {
    return cloneDefaults();
  }
}

export function saveScore(entry: LeaderboardEntry): LeaderboardEntry[] {
  const next = [...loadLeaderboard(), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable, keep going */
  }
  return next;
}

export function qualifiesForBoard(score: number): boolean {
  if (score <= 0) return false;
  const list = loadLeaderboard();
  return list.length < MAX_ENTRIES || score > list[list.length - 1].score;
}

/** Reset the board back to its seeded defaults. */
export function resetLeaderboard(): LeaderboardEntry[] {
  const d = cloneDefaults();
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable, keep going */
  }
  return d;
}
