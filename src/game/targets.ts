export interface Target {
  id: string;
  /** Display name, e.g. "HOOKAH" */
  name: string;
  /** COCO-SSD class names that count as a catch. null = manual tag only. */
  cocoClasses: string[] | null;
  /** True when the AI cannot classify this and the player must tap to tag. */
  manual: boolean;
  /** Base XP awarded for a catch. */
  xp: number;
  /** Flavor line shown on the target card. */
  hint: string;
  /** Optional per-target catch threshold; defaults to CATCH_THRESHOLD. */
  threshold?: number;
  /** ASCII art shown on the target card for tap-to-tag targets. */
  art?: string;
}

export const TARGETS: Target[] = [
  {
    id: "plastic-chair",
    name: "PLASTIC CHAIR",
    cocoClasses: ["chair"],
    manual: false,
    xp: 200,
    hint: "The backbone of every village gathering.",
    threshold: 0.65, // chairs catch too easily at the default threshold
  },
  {
    id: "steel-glass",
    name: "STEEL GLASS",
    cocoClasses: ["cup"],
    manual: false,
    xp: 250,
    hint: "Unbreakable. Like family bonds.",
    threshold: 0.6, // cups are detected at high confidence very often
  },
  {
    id: "lassi-glass",
    name: "LASSI GLASS",
    cocoClasses: ["cup"],
    manual: false,
    xp: 250,
    hint: "Thick, creamy, legendary.",
    threshold: 0.6, // cups are detected at high confidence very often
  },
  {
    id: "milk-can",
    name: "MILK CAN",
    cocoClasses: ["bottle"],
    manual: false,
    xp: 300,
    hint: "Fresh from the morning round.",
  },
  {
    id: "buffalo",
    name: "BUFFALO",
    cocoClasses: ["cow"],
    manual: false,
    xp: 400,
    hint: "AI says cow. Close enough, it is learning our ways.",
  },
  {
    id: "tractor",
    name: "TRACTOR",
    cocoClasses: ["truck"],
    manual: false,
    xp: 350,
    hint: "The undisputed king of the fields.",
    threshold: 0.45, // tractor bodies confuse the model; be forgiving
  },
  {
    id: "tractor-trolley",
    name: "TRACTOR TROLLEY",
    cocoClasses: ["truck"],
    manual: false,
    xp: 350,
    hint: "Hauls everything. Including pride.",
    threshold: 0.45, // tractor bodies confuse the model; be forgiving
  },
  {
    id: "charpai",
    name: "CHARPAI",
    cocoClasses: ["bed"],
    manual: false,
    xp: 300,
    hint: "Woven comfort, outdoor edition.",
  },
  {
    id: "hookah",
    name: "HOOKAH",
    cocoClasses: null,
    manual: true,
    xp: 500,
    hint: "Too desi for the AI to classify. Tag it yourself.",
  },
  {
    id: "gamcha",
    name: "GAMCHA",
    cocoClasses: null,
    manual: true,
    xp: 500,
    hint: "Towel, headwrap, tablecloth. Certified multitool.",
  },
  {
    id: "jutti",
    name: "JUTTI",
    cocoClasses: null,
    manual: true,
    xp: 500,
    hint: "Handcrafted footwear, maximum swag.",
  },
  {
    id: "diya",
    name: "DIYA",
    cocoClasses: null,
    manual: true,
    xp: 500,
    hint: "Festival-grade flame. Handle with pride.",
    art: "   ( )\n  (   )\n   \\_/",
  },
  {
    id: "tabla",
    name: "TABLA",
    cocoClasses: null,
    manual: true,
    xp: 500,
    hint: "Rhythm section of every family function.",
    art: "  ___   ___\n (   ) (   )\n  \\_/   \\_/",
  },
  {
    id: "kulhad",
    name: "KULHAD",
    cocoClasses: null,
    manual: true,
    xp: 500,
    hint: "Chai tastes better in clay. Science.",
    art: " \\     /\n  \\   /\n   \\_/",
  },
];

/** Minimum COCO-SSD confidence that counts as a catch. */
export const CATCH_THRESHOLD = 0.55;
/** Below catch threshold but worth an "IS THAT IT?" nudge. */
export const NEAR_THRESHOLD = 0.3;

/** Effective catch threshold for a target, falling back to CATCH_THRESHOLD. */
export function catchThresholdFor(target: Target): number {
  return target.threshold ?? CATCH_THRESHOLD;
}

export function randomTarget(excludeId?: string): Target {
  const pool = TARGETS.filter((t) => t.id !== excludeId);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick ?? TARGETS[0];
}
