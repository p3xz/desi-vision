export type Screen =
  | "start"
  | "permission"
  | "game"
  | "gameover"
  | "privacy"
  | "terms"
  | "credits";

export type GameMode = "quick" | "chaos" | "free";

export interface GameStats {
  score: number;
  catches: number;
  bestCombo: number;
  mode: GameMode;
}

export const MODE_META: Record<
  GameMode,
  { title: string; tagline: string; duration: number | null }
> = {
  quick: {
    title: "QUICK CATCH",
    tagline: "60 second round. Catch as many targets as possible.",
    duration: 60,
  },
  chaos: {
    title: "CHAOS MODE",
    tagline: "Targets rotate every 6 seconds. No mercy.",
    duration: 45,
  },
  free: {
    title: "FREE SCAN",
    tagline: "No timer. Explore what the AI actually sees.",
    duration: null,
  },
};

export type CameraErrorKind = "denied" | "none" | "unsupported" | "failed";
