import { motion } from "framer-motion";
import { sound } from "../game/sounds";
import type { Screen } from "../game/types";

interface Props {
  onAllow: () => void;
  onCancel: () => void;
  onNavigate: (s: Screen) => void;
}

export default function PermissionNotice({ onAllow, onCancel, onNavigate }: Props) {
  return (
    <div className="grain scanlines relative flex min-h-full items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative z-10 w-full max-w-md px-7 py-8"
      >
        <div className="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] text-warn">
          <span className="anim-blink inline-block h-2 w-2 rounded-full bg-warn" />
          PERMISSION REQUIRED
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-bone">
          CAMERA ACCESS
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-dim">
          Desi Vision uses your camera for the game's visual scanning
          experience. Camera processing stays on-device whenever possible.
          Nothing is uploaded, stored, or shared.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sound.click();
              onAllow();
            }}
            className="bg-acid px-6 py-3.5 font-mono text-sm font-bold tracking-[0.2em] text-ink shadow-[0_0_30px_rgba(182,255,0,0.3)]"
          >
            ALLOW CAMERA
          </motion.button>
          <button
            onClick={() => {
              sound.click();
              onCancel();
            }}
            className="tech-border px-6 py-3 font-mono text-sm tracking-[0.2em] text-dim transition-colors hover:border-bone hover:text-bone"
          >
            CANCEL
          </button>
        </div>

        <button
          onClick={() => onNavigate("privacy")}
          className="mt-5 font-mono text-[11px] tracking-widest text-acid-dim underline underline-offset-4 hover:text-acid"
        >
          PRIVACY POLICY
        </button>
      </motion.div>
    </div>
  );
}
