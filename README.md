# DESI VISION™

A satirical Indian village-themed camera detection game. Grant camera access,
and the most advanced desi detection system ever built will ask you to catch
targets like HOOKAH, TRACTOR, CHARPAI, and STEEL GLASS by pointing your camera
at the real world.

This is a fictional parody created for entertainment and humor. It does not
represent, endorse, promote, or make claims about any real community, culture,
person, or behavior.

## Play

```bash
npm install
npm run dev
```

Then open the printed local URL (use HTTPS or localhost, camera requires a
secure context). Press **START SCAN**, allow the camera, and start catching.

Production build:

```bash
npm run build
```

## How it works

- **Camera**: `getUserMedia` with the rear camera preferred on mobile. The
  stream never leaves your device.
- **Detection**: TensorFlow.js with the COCO-SSD model, lazy-loaded only after
  you grant camera access so the start screen stays fast. Model weights are
  fetched from a CDN at runtime.
- **Game loop**: every ~700ms the current video frame is checked against the
  active target. A COCO-SSD label matching the target's class list at 55%+
  confidence triggers a catch.
- **Sounds**: all synthesized with the Web Audio API. Zero audio files.

## Controls

| Action | How |
|---|---|
| Catch a target | Point the camera so the object is clearly visible |
| Manual-tag targets (HOOKAH, GAMCHA, JUTTI) | Tap the object on screen to place an assisted tag |
| Pause / quit | EXIT button in the top bar |
| Mute | SOUND toggle in the top bar or start screen |

### Modes

- **QUICK CATCH**: 60 second round, catch as many targets as possible.
- **CHAOS MODE**: 45 seconds, targets rotate every 6 seconds and your combo
  resets when one escapes.
- **FREE SCAN**: no timer, no scoring. Explore what the AI actually recognizes.

Scoring: each target has a base XP value, plus 50 bonus XP per combo level.
Combos grow with consecutive catches.

## Honest note on detection limits

COCO-SSD was trained on 80 everyday object classes (chair, cup, bottle, cow,
truck, bed, and friends). It has never seen a hookah, a gamcha, or a jutti,
and this game never pretends otherwise:

- Mappable targets use the closest real COCO class (buffalo → cow, tractor →
  truck, charpai → bed) and the mapping is shown on the target card.
- Unmappable targets (HOOKAH, GAMCHA, JUTTI) switch to an honest fallback: the
  game says **OBJECT TOO DESI TO CLASSIFY** and asks you to tap the object to
  place an **ASSISTED TAG**. A tap is a tap, not a detection, and the game
  never claims the AI saw it.
- In FREE SCAN you can watch the raw model output: every label shown is a real
  model prediction with its real confidence score.

The detection code lives behind a small interface (`src/vision/detector.ts`),
so a better model can be plugged in later without touching game logic.

## Tech

React 19, TypeScript, Tailwind CSS v4, Framer Motion, TensorFlow.js,
@tensorflow-models/coco-ssd, Vite.

## Privacy

Camera footage is processed on-device and never uploaded, stored, sold, or
shared. Scores and settings live in your browser's localStorage. See the
in-game Privacy page for the full policy, including the runtime CDN fetch of
the COCO-SSD model files.

## Credits

Created by [Namish Yadav](https://insidcode.vercel.app). © 2026 Desi Vision.
