import { motion } from "framer-motion";
import { useState } from "react";
import {
  loadLeaderboard,
  qualifiesForBoard,
  saveScore,
  type LeaderboardEntry,
} from "../game/leaderboard";
import { sound } from "../game/sounds";
import { MODE_META, type GameStats } from "../game/types";

interface Props {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export default function GameOverScreen({ stats, onRestart, onHome }: Props) {
  const [board, setBoard] = useState<LeaderboardEntry[]>(() => loadLeaderboard());
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const canSave = !saved && qualifiesForBoard(stats.score);

  const handleSave = () => {
    const entry: LeaderboardEntry = {
      name: (name.trim() || "PLAYER").toUpperCase().slice(0, 16),
      score: stats.score,
      catches: stats.catches,
      mode: MODE_META[stats.mode].title,
      date: new Date().toISOString().slice(0, 10),
    };
    setBoard(saveScore(entry));
    setSaved(true);
    sound.tag();
  };

  return (
    <div className="grain scanlines relative flex min-h-full flex-col items-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl text-center"
      >
        <div className="font-mono text-[11px] tracking-[0.35em] text-acid">
          {MODE_META[stats.mode].title} // COMPLETE
        </div>
        <h1 className="mt-2 text-5xl font-bold tracking-tight text-bone">
          ROUND OVER
        </h1>

        <div className="glass mt-8 px-6 py-6">
          <div className="font-mono text-[11px] tracking-[0.3em] text-dim">
            FINAL SCORE
          </div>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.2 }}
            className="text-glow-acid text-6xl font-bold text-acid"
          >
            {stats.score}
          </motion.div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="tech-border bg-panel/60 px-4 py-3">
              <div className="font-mono text-[10px] tracking-[0.25em] text-dim">CATCHES</div>
              <div className="mt-1 font-mono text-2xl font-bold text-bone">
                {stats.catches}
              </div>
            </div>
            <div className="tech-border bg-panel/60 px-4 py-3">
              <div className="font-mono text-[10px] tracking-[0.25em] text-dim">BEST COMBO</div>
              <div className="mt-1 font-mono text-2xl font-bold text-bone">
                ×{stats.bestCombo}
              </div>
            </div>
          </div>

          {canSave && (
            <div className="mt-6 border-t border-line pt-6">
              <div className="font-mono text-[11px] tracking-[0.3em] text-acid">
                YOU MADE THE LEADERBOARD
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={16}
                  placeholder="YOUR NAME"
                  aria-label="Your name for the leaderboard"
                  className="tech-border min-w-0 flex-1 bg-ink px-4 py-3 font-mono text-sm tracking-[0.2em] text-bone placeholder:text-dim/60 focus:border-acid focus:outline-none"
                />
                <button
                  onClick={handleSave}
                  className="bg-acid px-5 py-3 font-mono text-sm font-bold tracking-[0.15em] text-ink"
                >
                  SAVE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* leaderboard */}
        <div className="glass mt-6 px-6 py-6 text-left">
          <div className="mb-4 font-mono text-[11px] tracking-[0.3em] text-acid">
            VILLAGE LEADERBOARD
          </div>
          <ol className="space-y-2">
            {board.map((e, i) => (
              <motion.li
                key={`${e.name}-${e.score}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className={`flex items-center justify-between px-3 py-2 font-mono text-sm ${
                  i === 0 ? "bg-acid/10 text-acid" : "text-dim"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 text-dim/70">{i + 1}.</span>
                  <span className="font-bold tracking-widest">{e.name}</span>
                </span>
                <span className="tracking-widest">{e.score}</span>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sound.click();
              onRestart();
            }}
            className="bg-acid px-8 py-3.5 font-mono text-sm font-bold tracking-[0.2em] text-ink shadow-[0_0_30px_rgba(182,255,0,0.3)]"
          >
            SCAN AGAIN
          </motion.button>
          <button
            onClick={() => {
              sound.click();
              onHome();
            }}
            className="tech-border px-8 py-3.5 font-mono text-sm tracking-[0.2em] text-dim transition-colors hover:border-bone hover:text-bone"
          >
            BACK TO BASE
          </button>
        </div>
      </motion.div>
    </div>
  );
}
