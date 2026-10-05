import { motion } from "framer-motion";
import { sound } from "../game/sounds";

interface PageProps {
  onBack: () => void;
}

function Shell({
  onBack,
  kicker,
  title,
  children,
}: PageProps & { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grain relative min-h-full px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-2xl"
      >
        <button
          onClick={() => {
            sound.click();
            onBack();
          }}
          className="mb-6 font-mono text-[11px] tracking-[0.3em] text-acid-dim hover:text-acid"
        >
          ← BACK
        </button>
        <div className="font-mono text-[11px] tracking-[0.3em] text-acid">
          {kicker}
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-bone">
          {title}
        </h1>
        <div className="mt-8 space-y-8">{children}</div>
      </motion.div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="tech-border bg-panel/50 px-5 py-5">
      <h2 className="font-mono text-sm font-bold tracking-[0.2em] text-acid">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-dim">
        {children}
      </div>
    </section>
  );
}

export function PrivacyPage({ onBack }: PageProps) {
  return (
    <Shell onBack={onBack} kicker="LEGAL // 01" title="Privacy Policy">
      <p className="text-sm leading-relaxed text-dim">
        Last updated: September 2026. This page explains what DESI VISION does
        with your camera, your data, and your device storage. Plain language,
        no legal fog. The policy describes what this build actually does.
      </p>
      <Section title="CAMERA ACCESS">
        <p>
          The game asks for camera permission only when you press START SCAN and
          confirm on the permission notice. The camera feed is used for the
          game's visual scanning experience: showing the live preview and
          running on-device object detection.
        </p>
        <p>
          Camera footage is processed locally in your browser. We do not
          upload, store, sell, or share your camera footage or captured images.
        </p>
      </Section>
      <Section title="ON-DEVICE AI, EXTERNAL MODEL FILES">
        <p>
          When the camera starts, the game downloads the COCO-SSD object
          detection model files from a public CDN (an external model provider)
          so detection can run inside your browser with TensorFlow.js. This
          involves a network request to fetch model weights.
        </p>
        <p>
          Your camera footage is not sent to the model provider or anywhere
          else. Detection happens on your device after the model files arrive.
        </p>
      </Section>
      <Section title="WHAT WE DO NOT COLLECT">
        <p>
          No biometric information. No facial recognition. No account data. This
          build has no user accounts, no analytics beacons, and no third-party
          trackers.
        </p>
      </Section>
      <Section title="LOCAL STORAGE">
        <p>
          Scores, leaderboard entries, and settings such as the sound toggle are
          saved in your browser's localStorage (keys include
          desi-vision-leaderboard and desi-vision-muted). This data never leaves
          your device, and you can clear it anytime through your browser
          settings.
        </p>
      </Section>
      <Section title="PERMISSION CONTROL">
        <p>
          You can revoke camera permission at any time through your browser's
          site settings. The game cannot access the camera without your
          permission, and stopping the game releases the camera immediately.
        </p>
      </Section>
      <Section title="HONEST LIMITS">
        <p>
          We do not claim your data is anonymous. Local data lives on your
          device under your control, and this game runs with no servers of its
          own. If analytics, cookies, or external AI APIs are added in the
          future, this policy will be updated to disclose them.
        </p>
      </Section>
    </Shell>
  );
}

export function TermsPage({ onBack }: PageProps) {
  return (
    <Shell onBack={onBack} kicker="LEGAL // 02" title="Terms and Responsible Use">
      <p className="text-sm leading-relaxed text-dim">
        Short version: this is a game. Play it like one.
      </p>
      <Section title="ENTERTAINMENT ONLY">
        <p>
          DESI VISION is provided for entertainment. It is a fictional parody
          game, and nothing in it should be treated as a factual claim about any
          community, culture, person, or behavior.
        </p>
      </Section>
      <Section title="CAMERA ETIQUETTE">
        <p>
          Only point your camera at people or property when you have appropriate
          permission to do so. Be aware of your surroundings while playing.
        </p>
      </Section>
      <Section title="NO HARASSMENT OR TARGETING">
        <p>
          Do not use the game to harass, identify, target, stalk, or
          discriminate against any person. Scanner labels are game feedback, not
          judgments about real people.
        </p>
      </Section>
      <Section title="MISUSE">
        <p>
          The creators are not responsible for misuse of the application. If you
          use the game in a way that harms others or breaks the law, that is on
          you.
        </p>
      </Section>
      <Section title="CHANGES">
        <p>
          These terms may be updated as the game evolves. Continued play after
          an update means you accept the updated terms.
        </p>
      </Section>
    </Shell>
  );
}

export function CreditsPage({ onBack }: PageProps) {
  return (
    <Shell onBack={onBack} kicker="LEGAL // 03" title="Credits">
      <Section title="CREATOR">
        <p>
          Created by{" "}
          <a
            href="https://insidcode.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="text-acid underline underline-offset-4 hover:text-bone"
          >
            Namish Yadav
          </a>
        </p>
      </Section>
      <Section title="FIND NAMISH">
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.25em]">
          <a
            href="https://github.com/p3xz"
            target="_blank"
            rel="noreferrer"
            className="text-acid-dim underline underline-offset-4 hover:text-acid"
          >
            GITHUB
          </a>
          <a
            href="https://linkedin.com/in/namish-yadav-639769408"
            target="_blank"
            rel="noreferrer"
            className="text-acid-dim underline underline-offset-4 hover:text-acid"
          >
            LINKEDIN
          </a>
          <a
            href="https://instagram.com/nam7sh"
            target="_blank"
            rel="noreferrer"
            className="text-acid-dim underline underline-offset-4 hover:text-acid"
          >
            INSTAGRAM
          </a>
          <a
            href="https://namishhh.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="text-acid-dim underline underline-offset-4 hover:text-acid"
          >
            PORTFOLIO
          </a>
        </div>
      </Section>
      <Section title="BUILT WITH">
        <p>
          React, TypeScript, Tailwind CSS, Framer Motion, and TensorFlow.js with
          the COCO-SSD object detection model. All sound effects are synthesized
          live with the Web Audio API. No audio files were harmed.
        </p>
      </Section>
      <Section title="FICTIONAL RIVALS">
        <p>
          Leaderboard rivals CHAUDHARY, TRACTOR KING, HOOKAH MASTER, and DESI
          LEGEND are fictional characters. Any resemblance to real village
          legends is purely coincidental and frankly impressive.
        </p>
      </Section>
      <Section title="NATURE OF THE PROJECT">
        <p>
          DESI VISION is a fictional parody created for entertainment and
          humor. It does not promote discrimination, harassment, substance use,
          or harmful behavior.
        </p>
      </Section>
    </Shell>
  );
}
