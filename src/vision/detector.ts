import type { ObjectDetection } from "@tensorflow-models/coco-ssd";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  /** COCO-SSD class label, e.g. "chair", "cup", "person" */
  label: string;
  /** 0..1 confidence */
  score: number;
  /** Box in video pixel coordinates */
  box: BoundingBox;
}

/**
 * Detection abstraction. The game only ever talks to this interface, so a
 * real ML model can be swapped in later without touching game code.
 * Implementations must never fabricate detections.
 */
export interface Detector {
  name: string;
  ready(): boolean;
  detect(video: HTMLVideoElement): Promise<Detection[]>;
}

export class CocoSsdDetector implements Detector {
  readonly name = "COCO-SSD (TF.js, on-device)";
  private model: ObjectDetection;

  constructor(model: ObjectDetection) {
    this.model = model;
  }

  ready(): boolean {
    return true;
  }

  async detect(video: HTMLVideoElement): Promise<Detection[]> {
    if (video.readyState < 2 || video.videoWidth === 0) return [];
    const preds = await this.model.detect(video);
    return preds.map((p) => ({
      label: p.class,
      score: p.score,
      box: {
        x: p.bbox[0],
        y: p.bbox[1],
        width: p.bbox[2],
        height: p.bbox[3],
      },
    }));
  }
}

export type DetectorProgress = (stage: string) => void;

/**
 * Lazy-loads TF.js and the COCO-SSD model. The model weights are fetched
 * from a CDN at runtime (disclosed in the Privacy page). Only call this
 * after the player has granted camera access, so the start screen stays fast.
 */
export async function createDetector(
  onProgress?: DetectorProgress,
): Promise<Detector> {
  onProgress?.("LOADING TF.JS RUNTIME");
  const tf = await import("@tensorflow/tfjs");
  await tf.ready();
  onProgress?.("FETCHING COCO-SSD MODEL");
  const cocoSsd = await import("@tensorflow-models/coco-ssd");
  const model = await cocoSsd.load();
  onProgress?.("AI CORE ONLINE");
  return new CocoSsdDetector(model);
}
