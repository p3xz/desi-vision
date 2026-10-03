import type { BoundingBox, Detection } from "./detector";

/**
 * Temporal filtering for detection boxes. Raw model output flickers between
 * scan ticks: boxes jitter, vanish for a tick, then pop back. This keeps a
 * short-lived track per detection and smooths the rendered result with an
 * exponential moving average on the box, while tolerating a couple of
 * consecutive misses before dropping a box entirely.
 *
 * Only display code should consume smoothed tracks. Game logic (catch
 * thresholds, near-miss feeds) keeps using raw detections so gameplay stays
 * honest.
 */

export interface TrackedDetection extends Detection {
  /** consecutive scan ticks with no matching model detection */
  misses: number;
}

const BOX_ALPHA = 0.45; // weight of the newest box in the EMA blend
const SCORE_ALPHA = 0.5; // weight of the newest score in the EMA blend
const MATCH_IOU = 0.3; // minimum overlap to consider two boxes the same object
const MAX_MISSES = 2; // drop a track after this many consecutive misses

function iou(a: BoundingBox, b: BoundingBox): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.width * a.height + b.width * b.height - inter;
  return union > 0 ? inter / union : 0;
}

function blendBox(prev: BoundingBox, next: BoundingBox): BoundingBox {
  const b = (p: number, n: number) => p + (n - p) * BOX_ALPHA;
  return {
    x: b(prev.x, next.x),
    y: b(prev.y, next.y),
    width: b(prev.width, next.width),
    height: b(prev.height, next.height),
  };
}

/**
 * Fold the newest tick of raw detections into the running tracks.
 * Call once per scan tick with the previous return value.
 */
export function smoothDetections(
  prev: TrackedDetection[],
  next: Detection[],
): TrackedDetection[] {
  const used = new Array(next.length).fill(false);
  const out: TrackedDetection[] = [];

  for (const track of prev) {
    /* find the best unmatched same-label detection overlapping this track */
    let best = -1;
    let bestIoU = MATCH_IOU;
    for (let i = 0; i < next.length; i++) {
      if (used[i] || next[i].label !== track.label) continue;
      const v = iou(track.box, next[i].box);
      if (v > bestIoU) {
        bestIoU = v;
        best = i;
      }
    }
    if (best >= 0) {
      used[best] = true;
      const d = next[best];
      out.push({
        label: d.label,
        score: track.score + (d.score - track.score) * SCORE_ALPHA,
        box: blendBox(track.box, d.box),
        misses: 0,
      });
    } else if (track.misses + 1 < MAX_MISSES) {
      /* tolerate the gap: keep the last known box so it stops blinking */
      out.push({ ...track, misses: track.misses + 1 });
    }
  }

  /* fresh detections start new tracks */
  for (let i = 0; i < next.length; i++) {
    if (!used[i]) {
      const d = next[i];
      out.push({ label: d.label, score: d.score, box: { ...d.box }, misses: 0 });
    }
  }

  return out;
}

/** Reset all tracks, e.g. when the camera session restarts. */
export function emptyTracks(): TrackedDetection[] {
  return [];
}
