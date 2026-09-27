# DESI VISION Backlog

Small, committable tasks for future daily work. Each item should be one
focused commit.

## Targets and content

1. [x] Add 3 more manual-tag targets (DIYA, TABLA, KULHAD) with tap-to-tag art
   and flavor hints.
2. [x] Add 10 new scanner humor lines, keep them rare in the feed rotation.
3. Add a Hinglish toggle for scanner messages (BHAI CAMERA IDHAR energy).
4. Per-target difficulty tuning: raise CATCH_THRESHOLD for easy classes like
   chair, lower it slightly for truck.
5. Multi-target chaos rounds: two active targets at once in CHAOS MODE.

## Game feel

6. Haptics: `navigator.vibrate` pulse on catch for mobile devices.
7. Catch jingle variations: pick from 3 arpeggios so repeats feel fresh.
8. Detection smoothing: temporal filtering so boxes stop flickering between
   scan ticks.
9. Front/back camera switch button in the top bar.
10. Respect `prefers-reduced-motion`: disable screen shake and particles.

## Meta and sharing

11. PWA manifest + icons so the game is installable from mobile browsers.
12. Shareable score card: render final score to canvas and offer download.
13. Persist best score per mode and show it on the start screen mode cards.
14. Leaderboard reset button with a confirm step.
15. "Beat CHAUDHARY" progress hint on the game over screen.

## Polish and hygiene

16. Custom favicon: acid-green scanner reticle SVG.
17. OG meta image and description for link previews.
18. README screenshots: add start screen and gameplay captures.
19. First-run tutorial overlay: 3 swipeable cards explaining catch, tap-to-tag,
   and modes.
20. E2E smoke test: Playwright with Chrome's fake camera device flag, assert
   boot stages and FREE SCAN label rendering.
21. Trim the TF.js bundle: evaluate importing only the needed backend to cut
   the lazy chunk size.
22. Camera resolution selector (720p / 1080p) in a small settings panel.
