export type CameraResolution = "720p" | "1080p";

export const CAMERA_RESOLUTIONS: Record<
  CameraResolution,
  { width: number; height: number; label: string }
> = {
  "720p": { width: 1280, height: 720, label: "720P" },
  "1080p": { width: 1920, height: 1080, label: "1080P" },
};

const KEY = "dv-resolution";

/** Persisted camera resolution; defaults to 720p for cheaper detection. */
export function loadCameraResolution(): CameraResolution {
  try {
    const raw = localStorage.getItem(KEY);
    return raw === "1080p" ? "1080p" : "720p";
  } catch {
    return "720p";
  }
}

export function saveCameraResolution(res: CameraResolution): void {
  try {
    localStorage.setItem(KEY, res);
  } catch {
    /* storage unavailable, keep going */
  }
}
