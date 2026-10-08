import { motion } from "framer-motion";
import { useState } from "react";
import { loadBestScores, type BestScores } from "../game/bestScores";
import { sound } from "../game/sounds";
import { MODE_META, type GameMode, type Screen } from "../game/types";

interface Props {
  onStart: (mode: GameMode) => void;
  onNavigate: (s: Screen) => void;
}

const DIAGNOSTICS = [
  "AI CORE ........ ONLINE",
  "DESI DATABASE ... LOADED",
  "SCANNER .......... READY",
];

const MODES: GameMode[] = ["quick", "chaos", "free"];

export default function StartScreen({ onStart, onNavigate }: Props) {
  const [mode, setMode] = useState<GameMode>("quick");
  const [muted, setMuted] = useState(sound.isMuted());
  const [bests] = useState<BestScores>(() => loadBestScores());

  const toggleMute = () => {
    const next = !muted;
    sound.setMuted(next);
    setMuted(next);
    if (!next) sound.click();
  };

  return (
    <div className="grain scanlines relative flex min-h-full flex-col items-center overflow-hidden px-5 py-8">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #b6ff00, transparent)" }}
      />

      {/* mute toggle */}
      <button
        onClick={toggleMute}
        className="glass absolute top-4 right-4 z-20 px-3 py-2 font-mono text-[11px] tracking-widest text-dim transition-colors hover:text-bone"
        aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      >
        {muted ? "SOUND: OFF" : "SOUND: ON"}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center"
      >
        <div className="mb-5 flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] text-acid">
          <span className="anim-blink inline-block h-2 w-2 rounded-full bg-acid" />
          CAMERA ONLINE
        </div>

        <h1 className="text-glow-acid text-6xl leading-none font-bold tracking-tight text-bone sm:text-7xl">
          DESI
          <br />
          VISION<span className="text-acid">™</span>
        </h1>

        <p className="mt-4 font-mono text-xs tracking-[0.35em] text-dim sm:text-sm">
          THE MOST ADVANCED DESI DETECTION SYSTEM
        </p>

        {/* fake diagnostics */}
        <div className="glass mt-8 w-full max-w-md px-5 py-4 text-left">
          {DIAGNOSTICS.map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.35, duration: 0.4 }}
              className="font-mono text-xs tracking-widest text-acid-dim"
            >
              {line}
            </motion.div>
          ))}
        </div>

        {/* mode select */}
        <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
          {MODES.map((m) => {
            const meta = MODE_META[m];
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  sound.click();
                }}
                className={`tech-border px-4 py-4 text-left transition-all duration-200 ${
                  active
                    ? "border-acid bg-acid/10 shadow-[0_0_24px_rgba(182,255,0,0.15)]"
                    : "bg-panel/60 hover:border-dim"
                }`}
              >
                <div
                  className={`font-mono text-sm font-bold tracking-widest ${
                    active ? "text-acid" : "text-bone"
                  }`}
                >
                  {meta.title}
                </div>
                <div className="mt-2 text-xs leading-relaxed text-dim">
                  {meta.tagline}
                </div>
                <div className="mt-3 font-mono text-[11px] tracking-[0.25em] text-acid-dim">
                  {bests[m] > 0 ? `BEST ${bests[m]}` : "NO RECORD YET"}
                </div>
              </button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sound.start();
            onStart(mode);
          }}
          className="mt-8 bg-acid px-12 py-4 font-mono text-lg font-bold tracking-[0.25em] text-ink shadow-[0_0_40px_rgba(182,255,0,0.35)] transition-shadow hover:shadow-[0_0_60px_rgba(182,255,0,0.5)]"
        >
          [ START SCAN ]
        </motion.button>

        <p className="mt-3 font-mono text-[11px] tracking-widest text-dim">
          Camera access is required for the game.
        </p>

        {/* parody disclaimer, short version */}
        <p className="mt-8 max-w-xl text-xs leading-relaxed text-dim">
          DESI VISION is a fictional parody created for entertainment and humor.
          It does not represent, endorse, promote, or make claims about any real
          community, culture, person, or behavior.{" "}
          <button
            onClick={() => onNavigate("privacy")}
            className="text-acid-dim underline underline-offset-2 hover:text-acid"
          >
            Privacy
          </button>{" "}
          <button
            onClick={() => onNavigate("terms")}
            className="text-acid-dim underline underline-offset-2 hover:text-acid"
          >
            Terms
          </button>
        </p>
      </motion.div>
    </div>
  );
}
