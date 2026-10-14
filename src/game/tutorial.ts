const KEY = "desi-vision-tutorial-seen";

/** True once the player has dismissed the first-run tutorial overlay. */
export function hasSeenTutorial(): boolean {
  try {
    return localStorage.getItem(KEY) === "seen";
  } catch {
    /* storage unavailable: assume seen so we never nag in a loop */
    return true;
  }
}

export function markTutorialSeen(): void {
  try {
    localStorage.setItem(KEY, "seen");
  } catch {
    /* storage unavailable, keep going */
  }
}
