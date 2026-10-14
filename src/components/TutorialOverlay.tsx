import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { sound } from "../game/sounds";
import { markTutorialSeen } from "../game/tutorial";

interface Card {
  step: string;
  title: string;
  body: string;
}

const CARDS: Card[] = [
  {
    step: "STEP 1 / CATCH",
    title: "POINT AND CATCH",
    body: "The AI watches through your camera. Point it at the target named on the reticle and hold the scanner steady until the ring fills and the catch locks in. Chain catches fast to build a combo multiplier.",
  },
  {
    step: "STEP 2 / TAG",
    title: "TAP TO TAG",
    body: "Some things are too desi for the AI to classify. HOOKAH, GAMCHA, JUTTI, DIYA, TABLA and KULHAD never auto-detect, so tap their cards to tag them yourself. 500 XP each, no scanning required.",
  },
  {
    step: "STEP 3 / MODES",
    title: "PICK YOUR MODE",
    body: "QUICK CATCH is 60 seconds of pure hunting. CHAOS MODE throws two targets at once, rotated every 6 seconds, for 45 seconds of no mercy. FREE SCAN has no timer, so explore what the AI actually sees.",
  },
];

interface Props {
  onClose: () => void;
}

export default function TutorialOverlay({ onClose }: Props) {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);
  /* static per mount: OS reduced-motion setting disables the slide */
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const paginate = (dir: 1 | -1) => {
    setIndex(([i]) => {
      const next = i + dir;
      if (next < 0 || next >= CARDS.length) return [i, 0];
      sound.click();
      return [next, dir];
    });
  };

  const close = () => {
    markTutorialSeen();
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = CARDS[index];
  const last = index === CARDS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="How to play"
    >
      <div className="glass relative w-full max-w-md overflow-hidden px-6 py-8">
        {/* header */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-[0.3em] text-acid">
            {card.step}
          </span>
          <button
            onClick={close}
            className="font-mono text-[11px] tracking-[0.25em] text-dim transition-colors hover:text-bone"
            aria-label="Skip tutorial"
          >
            SKIP
          </button>
        </div>

        {/* swipeable card */}
        <div className="relative mt-6 min-h-56">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              initial={{ x: reducedMotion ? 0 : direction >= 0 ? 160 : -160, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reducedMotion ? 0 : direction >= 0 ? -160 : 160, opacity: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 32 }
              }
              drag={reducedMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.x < -80 || velocity.x < -600) paginate(1);
                else if (offset.x > 80 || velocity.x > 600) paginate(-1);
              }}
              className="touch-pan-y"
            >
              <h2 className="text-glow-acid text-3xl font-bold tracking-tight text-bone">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-dim">{card.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* dots */}
        <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
          {CARDS.map((c, i) => (
            <span
              key={c.title}
              className={`h-1.5 w-6 transition-colors ${
                i === index ? "bg-acid" : "bg-line"
              }`}
            />
          ))}
        </div>

        {/* controls */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => paginate(-1)}
            disabled={index === 0}
            className="font-mono text-xs tracking-[0.25em] text-dim transition-colors hover:text-bone disabled:opacity-30"
          >
            [ PREV ]
          </button>
          <span className="font-mono text-[11px] tracking-[0.3em] text-dim">
            {String(index + 1).padStart(2, "0")} / {String(CARDS.length).padStart(2, "0")}
          </span>
          {last ? (
            <button
              onClick={close}
              className="bg-acid px-5 py-2 font-mono text-xs font-bold tracking-[0.25em] text-ink"
            >
              START SCANNING
            </button>
          ) : (
            <button
              onClick={() => paginate(1)}
              className="font-mono text-xs tracking-[0.25em] text-acid transition-colors hover:text-bone"
            >
              [ NEXT ]
            </button>
          )}
        </div>

        <p className="mt-5 text-center font-mono text-[10px] tracking-[0.2em] text-dim">
          SWIPE OR USE ARROW KEYS
        </p>
      </div>
    </motion.div>
  );
}
