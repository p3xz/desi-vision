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

export function randomHumor(exclude?: string): string {
  const pool = HUMOR_LINES.filter((l) => l !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? HUMOR_LINES[0];
}
