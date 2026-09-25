import { motion } from "framer-motion";
import { sound } from "../game/sounds";
import type { CameraErrorKind } from "../game/types";

interface Props {
  kind: CameraErrorKind;
  onRetry: () => void;
  onBack: () => void;
}

const COPY: Record<CameraErrorKind, { title: string; body: string }> = {
  denied: {
    title: "CAMERA BLOCKED",
    body: "Camera permission was denied. Re-enable camera access for this site in your browser settings, then hit retry. The scanner cannot see without eyes.",
  },
  none: {
    title: "NO CAMERA FOUND",
    body: "We could not find a camera on this device. Connect one, or switch to a device with a camera, then retry.",
  },
  unsupported: {
    title: "BROWSER NOT SUPPORTED",
    body: "This browser does not support camera access. Try the latest Chrome, Edge, Firefox, or Safari and come back.",
  },
  failed: {
    title: "CAMERA FAILED TO START",
    body: "Something went wrong while starting the camera. It might be in use by another app. Close other camera apps and retry.",
  },
};

export default function CameraError({ kind, onRetry, onBack }: Props) {
  const copy = COPY[kind];
  return (
    <div className="grain scanlines relative flex min-h-full items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass relative z-10 w-full max-w-md px-7 py-8 text-center"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-danger/60">
          <span className="font-mono text-2xl text-danger">!</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-bone">
          {copy.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-dim">{copy.body}</p>
        <div className="mt-7 flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sound.click();
              onRetry();
            }}
            className="bg-acid px-6 py-3 font-mono text-sm font-bold tracking-[0.2em] text-ink"
          >
            RETRY
          </motion.button>
          <button
            onClick={() => {
              sound.click();
              onBack();
            }}
            className="tech-border px-6 py-3 font-mono text-sm tracking-[0.2em] text-dim transition-colors hover:border-bone hover:text-bone"
          >
            BACK TO BASE
          </button>
        </div>
      </motion.div>
    </div>
  );
}
