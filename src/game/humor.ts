/** Scanner flavor lines. Shown sparingly so they feel like game feedback. */
export const HUMOR_LINES = [
  "DESI SIGNAL DETECTED",
  "VILLAGE FREQUENCY LOCKED",
  "UNCLE DETECTED",
  "MAXIMUM DESI ENERGY",
  "OBJECT TOO DESI TO CLASSIFY",
  "AI CONFUSED",
  "BHAI CAMERA IDHAR",
  "TARGET ESCAPED",
  "ABSOLUTE CINEMA",
];

/**
 * Rare bonus lines. Kept in a separate pool so they only show up
 * occasionally and never dilute the rotation of the common lines.
 */
export const RARE_HUMOR_LINES = [
  "SHARMA JI KA BETA APPROVED",
  "PAKODA THERMAL SIGNATURE RISING",
  "MONSOON VIBES DETECTED",
  "AUNTY NETWORK ACTIVATED",
  "CHAI BREAK RECOMMENDED",
  "OBJECT PASSES VIBE CHECK",
  "JUGAAD LEVEL MAXIMUM",
  "NAZAR DETECTED, WARDING OFF",
  "DESI METER OFF THE CHARTS",
  "MITHAS LEVELS CRITICAL",
];

/** Chance that a rare line is picked over a common one. */
const RARE_LINE_CHANCE = 0.18;

export function randomHumor(exclude?: string): string {
  const source =
    Math.random() < RARE_LINE_CHANCE ? RARE_HUMOR_LINES : HUMOR_LINES;
  const pool = source.filter((l) => l !== exclude);
  const lines = pool.length > 0 ? pool : HUMOR_LINES;
  return lines[Math.floor(Math.random() * lines.length)];
}
