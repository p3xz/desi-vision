import { sound } from "../game/sounds";
import type { Screen } from "../game/types";

interface Props {
  onNavigate: (s: Screen) => void;
}

export default function Footer({ onNavigate }: Props) {
  const link = (s: Screen, label: string) => (
    <button
      key={s}
      onClick={() => {
        sound.click();
        onNavigate(s);
      }}
      className="font-mono text-[11px] tracking-[0.25em] text-dim transition-colors hover:text-acid"
    >
      {label}
    </button>
  );

  return (
    <footer className="border-t border-line bg-ink/90 px-5 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center">
        <div className="text-xl font-bold tracking-tight text-bone">
          DESI VISION<span className="text-acid">™</span>
        </div>
        <p className="text-xs text-dim">A fictional parody game made for fun.</p>
        <div className="flex items-center gap-6">
          {link("privacy", "PRIVACY")}
          {link("terms", "TERMS")}
          {link("credits", "CREDITS")}
        </div>
        <div className="font-mono text-[11px] tracking-widest text-dim">
          © 2026 Desi Vision
        </div>
        <div className="text-xs text-dim">
          Created by{" "}
          <a
            href="https://insidcode.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="text-acid-dim underline underline-offset-4 hover:text-acid"
          >
            Namish Yadav
          </a>
        </div>
      </div>
    </footer>
  );
}
