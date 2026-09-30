import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { HINGLISH_SCANNER, randomHumor } from "../game/humor";
import { sound } from "../game/sounds";
import {
  catchThresholdFor,
  NEAR_THRESHOLD,
  randomTarget,
  type Target,
} from "../game/targets";
import {
  MODE_META,
  type CameraErrorKind,
  type GameMode,
  type GameStats,
} from "../game/types";
import {
  createDetector,
  type Detection,
  type Detector,
} from "../vision/detector";
import CameraError from "./CameraError";

interface Props {
  mode: GameMode;
  onExit: () => void;
  onGameOver: (stats: GameStats) => void;
}

interface CatchFx {
  title: string;
  sub: string;
  xp: number;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.max(0, sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function GameScreen({ mode, onExit, onGameOver }: Props) {
  const meta = MODE_META[mode];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<Detector | null>(null);
  const targetRef = useRef<Target>(randomTarget());
  const lockRef = useRef(false);
  const statsRef = useRef({ score: 0, combo: 0, best: 0, catches: 0 });
  const timeRef = useRef<number | null>(meta.duration);
  const feedTimer = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const [attempt, setAttempt] = useState(0);
  const [boot, setBoot] = useState("REQUESTING CAMERA");
  const [booted, setBooted] = useState(false);
  const [camError, setCamError] = useState<CameraErrorKind | null>(null);
  const [target, setTarget] = useState<Target>(targetRef.current);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(meta.duration);
  const [catchFx, setCatchFx] = useState<CatchFx | null>(null);
  const [feed, setFeed] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [tapBox, setTapBox] = useState<{ x: number; y: number } | null>(null);
  const [muted, setMuted] = useState(sound.isMuted());
  const [hinglish, setHinglish] = useState(
    () => localStorage.getItem("dv-hinglish") === "1",
  );
  /* effects with locked deps also call feed helpers, so mirror the toggle */
  const hinglishRef = useRef(hinglish);
  hinglishRef.current = hinglish;

  /* ---------------- helpers ---------------- */

  /** Swap a fixed scanner message for its Hinglish version when toggled on. */
  const line = (en: string) =>
    hinglishRef.current ? (HINGLISH_SCANNER[en] ?? en) : en;
  const feedHumor = (exclude?: string) =>
    randomHumor(exclude, hinglishRef.current);

  const showFeed = (msg: string, ms = 2400) => {
    setFeed(msg);
    if (feedTimer.current) window.clearTimeout(feedTimer.current);
    feedTimer.current = window.setTimeout(() => {
      if (mountedRef.current) setFeed(null);
    }, ms);
  };

  const nextTarget = () => {
    const nt = randomTarget(targetRef.current.id);
    targetRef.current = nt;
    setTarget(nt);
    setTapBox(null);
  };

  const doCatch = (label: string, sub: string, baseXp: number) => {
    if (lockRef.current || !mountedRef.current) return;
    lockRef.current = true;
    const s = statsRef.current;
    s.combo += 1;
    s.best = Math.max(s.best, s.combo);
    s.catches += 1;
    const gained = baseXp + (s.combo - 1) * 50;
    s.score += gained;
    setScore(s.score);
    setCombo(s.combo);
    setCatchFx({ title: label, sub, xp: gained });
    setShake((k) => k + 1);
    sound.catch();
    const comboLevel = s.combo;
    /* haptic pulse on catch for mobile devices */
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(comboLevel > 1 ? [25, 40, 25] : 25);
    }
    if (comboLevel >= 2) window.setTimeout(() => sound.combo(comboLevel), 260);
    if (Math.random() < 0.35) showFeed(feedHumor());
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      setCatchFx(null);
      nextTarget();
      lockRef.current = false;
    }, 1400);
  };

  const handleDetections = (ds: Detection[]) => {
    const t = targetRef.current;
    const classes = t.cocoClasses;
    if (t.manual || mode === "free" || !classes) return;
    const match = ds.find(
      (d) => classes.includes(d.label) && d.score >= catchThresholdFor(t),
    );
    if (match) {
      doCatch(t.name, `${Math.round(match.score * 100)}%`, t.xp);
      return;
    }
    const near = ds.find(
      (d) => classes.includes(d.label) && d.score >= NEAR_THRESHOLD,
    );
    if (near) showFeed(line("IS THAT IT?"), 1400);
  };

  /* ---------------- camera + model boot ---------------- */

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const init = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamError("unsupported");
        return;
      }
      setBoot("REQUESTING CAMERA");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => undefined);
        }
      } catch (e) {
        if (cancelled) return;
        const name = e instanceof Error ? e.name : "";
        if (name === "NotAllowedError" || name === "SecurityError")
          setCamError("denied");
        else if (
          name === "NotFoundError" ||
          name === "OverconstrainedError" ||
          name === "NotReadableError"
        )
          setCamError("none");
        else setCamError("failed");
        return;
      }

      setBoot("LOADING AI MODEL");
      try {
        const det = await createDetector((stage) => {
          if (!cancelled) setBoot(stage);
        });
        if (cancelled) return;
        detectorRef.current = det;
      } catch {
        if (!cancelled) setCamError("failed");
        return;
      }
      if (!cancelled && mountedRef.current) {
        setBooted(true);
        sound.start();
        showFeed(line("SCANNER READY"), 1800);
      }
    };

    void init();
    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (feedTimer.current) window.clearTimeout(feedTimer.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  /* ---------------- detection loop ---------------- */

  useEffect(() => {
    if (!booted) return;
    const id = window.setInterval(async () => {
      const det = detectorRef.current;
      const v = videoRef.current;
      if (!det || !v || lockRef.current || !mountedRef.current) return;
      try {
        const ds = await det.detect(v);
        if (!mountedRef.current) return;
        setDetections(ds.filter((d) => d.score >= 0.3));
        handleDetections(ds);
      } catch {
        /* transient model hiccup, keep scanning */
      }
    }, 700);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  /* ---------------- round timer ---------------- */

  useEffect(() => {
    if (!booted || meta.duration == null) return;
    const id = window.setInterval(() => {
      const left = (timeRef.current ?? 0) - 1;
      timeRef.current = left;
      setTimeLeft(left);
      if (left <= 10 && left > 0) sound.tick();
      if (left <= 0) {
        window.clearInterval(id);
        const s = statsRef.current;
        onGameOver({ score: s.score, catches: s.catches, bestCombo: s.best, mode });
      }
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  /* ---------------- chaos rotation ---------------- */

  useEffect(() => {
    if (!booted || mode !== "chaos") return;
    const id = window.setInterval(() => {
      if (lockRef.current || !mountedRef.current) return;
      const s = statsRef.current;
      if (s.combo > 0) {
        s.combo = 0;
        setCombo(0);
      }
      showFeed(Math.random() < 0.5 ? line("TARGET ESCAPED") : feedHumor());
      sound.fail();
      nextTarget();
    }, 6000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, mode]);

  /* ---------------- manual tap-to-tag ---------------- */

  const onVideoTap = (e: React.MouseEvent) => {
    const t = targetRef.current;
    if (!t.manual || lockRef.current || mode === "free") return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTapBox({ x, y });
    sound.tag();
    showFeed(line("ASSISTED TAG ACCEPTED"), 1200);
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      doCatch(t.name, "ASSISTED TAG", t.xp);
    }, 650);
  };

  /* map a video-pixel box onto the displayed overlay */
  const mapBox = (d: Detection) => {
    const v = videoRef.current;
    const wrap = wrapRef.current;
    if (!v || !wrap || !v.videoWidth) return null;
    const r = wrap.getBoundingClientRect();
    const scale = Math.max(r.width / v.videoWidth, r.height / v.videoHeight);
    const offX = (r.width - v.videoWidth * scale) / 2;
    const offY = (r.height - v.videoHeight * scale) / 2;
    return {
      left: d.box.x * scale + offX,
      top: d.box.y * scale + offY,
      width: d.box.width * scale,
      height: d.box.height * scale,
    };
  };

  const particles = useMemo(() => {
    if (!catchFx) return [];
    return Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      return {
        x: Math.cos(angle) * 130,
        y: Math.sin(angle) * 130,
        delay: Math.random() * 0.08,
      };
    });
  }, [catchFx]);

  const toggleMute = () => {
    const next = !muted;
    sound.setMuted(next);
    setMuted(next);
  };

  const toggleHinglish = () => {
    setHinglish((h) => {
      const next = !h;
      localStorage.setItem("dv-hinglish", next ? "1" : "0");
      return next;
    });
  };

  /* ---------------- render ---------------- */

  if (camError) {
    return (
      <CameraError
        kind={camError}
        onRetry={() => {
          setCamError(null);
          setAttempt((a) => a + 1);
        }}
        onBack={onExit}
      />
    );
  }

  const progress =
    meta.duration != null && timeLeft != null
      ? Math.max(0, timeLeft / meta.duration)
      : 1;

  return (
    <div
      ref={wrapRef}
      onClick={onVideoTap}
      className="grain scanlines relative h-dvh w-full cursor-crosshair overflow-hidden bg-ink select-none"
    >
      <div key={shake} className={shake > 0 ? "anim-shake h-full w-full" : "h-full w-full"}>
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 h-full w-full"
        />

        {/* scanline sweep */}
        {booted && (
          <div className="anim-scanline pointer-events-none absolute left-0 h-16 w-full bg-gradient-to-b from-transparent via-acid/25 to-transparent" />
        )}

        {/* corner brackets */}
        {booted && (
          <>
            {["top-24 left-5", "top-24 right-5", "bottom-44 left-5", "bottom-44 right-5"].map(
              (pos) => (
                <div key={pos} className={`pointer-events-none absolute ${pos} z-10 h-10 w-10`}>
                  <div className="absolute top-0 left-0 h-full w-[3px] bg-acid/80" />
                  <div className="absolute top-0 left-0 h-[3px] w-full bg-acid/80" />
                </div>
              ),
            )}
          </>
        )}

        {/* center reticle */}
        {booted && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-60">
            <div className="anim-reticle h-28 w-28 rounded-full border border-dashed border-acid/70" />
            <div className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid" />
          </div>
        )}

        {/* detection boxes */}
        {booted &&
          detections.map((d, i) => {
            const b = mapBox(d);
            if (!b) return null;
            const isTarget =
              !target.manual &&
              target.cocoClasses?.includes(d.label);
            return (
              <div
                key={`${d.label}-${i}`}
                className={`pointer-events-none absolute z-10 border-2 ${
                  isTarget
                    ? "border-acid shadow-[0_0_18px_rgba(182,255,0,0.5)]"
                    : "border-bone/40"
                }`}
                style={{
                  left: b.left,
                  top: b.top,
                  width: b.width,
                  height: b.height,
                }}
              >
                <div
                  className={`absolute -top-6 left-0 px-1.5 py-0.5 font-mono text-[10px] tracking-widest whitespace-nowrap ${
                    isTarget ? "bg-acid text-ink" : "bg-ink/80 text-dim"
                  }`}
                >
                  AI SEES: {d.label} {Math.round(d.score * 100)}%
                </div>
              </div>
            );
          })}

        {/* manual tap box */}
        {tapBox && (
          <div
            className="pointer-events-none absolute z-10 border-2 border-acid shadow-[0_0_18px_rgba(182,255,0,0.5)]"
            style={{
              left: `${tapBox.x * 100}%`,
              top: `${tapBox.y * 100}%`,
              width: "34%",
              aspectRatio: "4 / 3",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="absolute -top-6 left-0 bg-acid px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-ink">
              ASSISTED TAG
            </div>
          </div>
        )}

        {/* top bar */}
        <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="glass px-3 py-2">
            <div className="text-sm font-bold tracking-tight text-bone">
              DESI VISION<span className="text-acid">™</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.25em] text-acid">
              <span className="anim-blink inline-block h-1.5 w-1.5 rounded-full bg-acid" />
              CAMERA ONLINE
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass px-3 py-2 text-center">
              <div className="font-mono text-[10px] tracking-[0.25em] text-dim">SCORE</div>
              <motion.div
                key={score}
                initial={{ scale: 1.35, color: "#b6ff00" }}
                animate={{ scale: 1, color: "#f2f1e8" }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="font-mono text-lg font-bold"
              >
                {score}
              </motion.div>
            </div>
            <div className="glass px-3 py-2 text-center">
              <div className="font-mono text-[10px] tracking-[0.25em] text-dim">COMBO</div>
              <div className={`font-mono text-lg font-bold ${combo >= 2 ? "text-acid" : "text-bone"}`}>
                ×{combo}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
                sound.click();
              }}
              className="glass px-3 py-2 font-mono text-[10px] tracking-widest text-dim hover:text-bone"
              aria-label="Toggle sound"
            >
              {muted ? "MUTED" : "SOUND"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleHinglish();
                sound.click();
              }}
              className="glass px-3 py-2 font-mono text-[10px] tracking-widest text-dim hover:text-bone"
              aria-label="Toggle Hinglish scanner messages"
            >
              {hinglish ? "HINGLISH" : "ENGLISH"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.click();
                onExit();
              }}
              className="glass px-3 py-2 font-mono text-[10px] tracking-widest text-dim hover:text-danger"
            >
              EXIT
            </button>
          </div>
        </div>

        {/* scanner feed message */}
        <div className="pointer-events-none absolute top-24 right-0 left-0 z-20 flex justify-center px-4">
          <AnimatePresence>
            {feed && (
              <motion.div
                key={feed}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="glass px-4 py-2 font-mono text-xs tracking-[0.2em] text-acid"
              >
                {feed}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* manual tag banner */}
        {booted && target.manual && mode !== "free" && (
          <div className="pointer-events-none absolute top-36 right-0 left-0 z-20 flex justify-center px-4">
            <div className="border border-warn/60 bg-ink/80 px-4 py-2 text-center font-mono text-[11px] tracking-[0.18em] text-warn">
              OBJECT TOO DESI TO CLASSIFY. TAP THE OBJECT TO TAG IT.
            </div>
          </div>
        )}

        {/* bottom target card */}
        {booted && (
          <div className="absolute right-0 bottom-0 left-0 z-20 px-4 pb-5 sm:px-6">
            <div className="glass mx-auto max-w-xl px-5 py-4">
              {mode === "free" ? (
                <div className="text-center">
                  <div className="font-mono text-[11px] tracking-[0.3em] text-dim">FREE SCAN</div>
                  <div className="mt-1 text-lg font-bold text-bone">
                    Point at anything. The AI reports what it sees.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      {target.art && (
                        <pre className="mb-2 font-mono text-[11px] leading-tight text-acid/70">
                          {target.art}
                        </pre>
                      )}
                      <div className="font-mono text-[11px] tracking-[0.3em] text-dim">CATCH</div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={target.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className="text-glow-acid text-3xl font-bold tracking-tight text-acid"
                        >
                          {target.name}
                        </motion.div>
                      </AnimatePresence>
                      <div className="mt-1 text-xs text-dim">{target.hint}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-2xl font-bold text-bone">
                        {timeLeft != null ? formatTime(timeLeft) : "--:--"}
                      </div>
                      <div className="font-mono text-[11px] tracking-[0.25em] text-acid">
                        COMBO ×{combo}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full bg-bone/10">
                    <div
                      className="h-full bg-acid transition-all duration-1000 ease-linear"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* catch overlay */}
        <AnimatePresence>
          {catchFx && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-acid/10" />
              <div className="anim-pulse-ring absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-acid" />
              {particles.map((p, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.7, delay: p.delay, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 h-2 w-2 bg-acid"
                />
              ))}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
                className="relative text-center"
              >
                <div className="font-mono text-sm tracking-[0.4em] text-acid">TARGET LOCKED</div>
                <div className="text-glow-acid mt-2 text-5xl font-bold tracking-tight text-bone">
                  {catchFx.title}
                </div>
                <div className="mt-1 font-mono text-lg text-dim">{catchFx.sub}</div>
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.15 }}
                  className="mt-3 font-mono text-3xl font-bold text-acid"
                >
                  +{catchFx.xp} XP
                </motion.div>
                {statsRef.current.combo >= 2 && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="mt-2 font-mono text-xl font-bold text-warn"
                  >
                    COMBO ×{statsRef.current.combo}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* boot / loading overlay */}
        {!booted && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink px-6 text-center">
            <div className="text-3xl font-bold tracking-tight text-bone">
              DESI VISION<span className="text-acid">™</span>
            </div>
            <div className="glass mt-8 w-full max-w-sm px-5 py-4 text-left">
              {["AI CORE ........ ONLINE", "DESI DATABASE ... LOADED"].map((l) => (
                <div key={l} className="font-mono text-xs tracking-widest text-acid-dim">
                  {l}
                </div>
              ))}
              <div className="anim-blink font-mono text-xs tracking-widest text-acid">
                {boot} ...
              </div>
            </div>
            <div className="mt-6 h-1 w-full max-w-sm overflow-hidden bg-bone/10">
              <div className="anim-marquee h-full w-1/2 bg-acid/70" />
            </div>
            <p className="mt-4 max-w-xs font-mono text-[11px] leading-relaxed tracking-widest text-dim">
              The AI model downloads on first run. Camera stays on this device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
