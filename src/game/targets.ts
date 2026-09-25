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
}

export const TARGETS: Target[] = [
  {
    id: "plastic-chair",
    name: "PLASTIC CHAIR",
    cocoClasses: ["chair"],
    manual: false,
    xp: 200,
    hint: "The backbone of every village gathering.",
  },
  {
    id: "steel-glass",
    name: "STEEL GLASS",
    cocoClasses: ["cup"],
    manual: false,
    xp: 250,
    hint: "Unbreakable. Like family bonds.",
  },
  {
    id: "lassi-glass",
    name: "LASSI GLASS",
    cocoClasses: ["cup"],
    manual: false,
    xp: 250,
    hint: "Thick, creamy, legendary.",
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
  },
  {
    id: "tractor-trolley",
    name: "TRACTOR TROLLEY",
    cocoClasses: ["truck"],
    manual: false,
    xp: 350,
    hint: "Hauls everything. Including pride.",
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
];

/** Minimum COCO-SSD confidence that counts as a catch. */
export const CATCH_THRESHOLD = 0.55;
/** Below catch threshold but worth an "IS THAT IT?" nudge. */
export const NEAR_THRESHOLD = 0.3;

export function randomTarget(excludeId?: string): Target {
  const pool = TARGETS.filter((t) => t.id !== excludeId);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick ?? TARGETS[0];
}
