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

/**
 * Hinglish flavor lines. Same rotation shape as the English pool, but with
 * full BHAI CAMERA IDHAR energy for when the toggle is on.
 */
export const HINGLISH_HUMOR_LINES = [
  "DESI SIGNAL PAKDA",
  "GAON FREQUENCY LOCK",
  "UNCLE MIL GAYE",
  "FULL DESI ENERGY",
  "OBJECT BAHUT DESI",
  "AI CONFUSE HO GAYA",
  "BHAI CAMERA IDHAR",
  "TARGET HAATH SE NIKLA",
  "ABSOLUTE CINEMA",
];

export const HINGLISH_RARE_HUMOR_LINES = [
  "SHARMA JI KE BETE NE OK KIYA",
  "PAKODA SIGNAL BADH RAHA",
  "BARISH WALI VIBES",
  "AUNTY NETWORK ON",
  "CHAI BREAK TIME",
  "VIBE CHECK PAAS",
  "JUGAAD FULL POWER",
  "NAZAR LAG GAYI, UTAAR DE",
  "DESI METER FULL",
  "MITHAS FULL CHARGE",
];

/**
 * Hinglish equivalents of the fixed (non-humor) scanner messages.
 * Only keys present here get swapped when the toggle is on.
 */
export const HINGLISH_SCANNER: Record<string, string> = {
  "SCANNER READY": "SCANNER TAIYAAR",
  "TARGET ESCAPED": "TARGET BHAAG GAYA",
  "IS THAT IT?": "YEH HAI KYA?",
  "ASSISTED TAG ACCEPTED": "TAG LAG GAYA",
  "CAMERA FLIPPED": "CAMERA PALAT GAYA",
  "CAMERA SWITCH FAILED": "CAMERA SWITCH FAIL HO GAYA",
  "NO SECOND CAMERA": "DOOSRA CAMERA NAHI",
};

export function randomHumor(exclude?: string, hinglish = false): string {
  const common = hinglish ? HINGLISH_HUMOR_LINES : HUMOR_LINES;
  const rare = hinglish ? HINGLISH_RARE_HUMOR_LINES : RARE_HUMOR_LINES;
  const source = Math.random() < RARE_LINE_CHANCE ? rare : common;
  const pool = source.filter((l) => l !== exclude);
  const lines = pool.length > 0 ? pool : common;
  return lines[Math.floor(Math.random() * lines.length)];
}
