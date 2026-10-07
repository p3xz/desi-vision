/**
 * Shareable score card. Renders the final score to a 1200x630 canvas in the
 * game's acid-green scanner style and offers it as a PNG download so players
 * can post their score wherever they like.
 */

import { MODE_META, type GameStats } from "./types";

const CARD_W = 1200;
const CARD_H = 630;
const SITE_URL = "https://desi-vision.vercel.app/";

function drawReticleCorner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dx: number,
  dy: number,
): void {
  const len = 64;
  ctx.strokeStyle = "#b6ff00";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + len * dx, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + len * dy);
  ctx.stroke();
}

function drawScanlines(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "rgba(242, 241, 232, 0.03)";
  for (let y = 0; y < CARD_H; y += 6) {
    ctx.fillRect(0, y, CARD_W, 2);
  }
}

function renderCard(stats: GameStats): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // background
  ctx.fillStyle = "#0a0b08";
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  drawScanlines(ctx);

  // acid edge glow
  ctx.strokeStyle = "rgba(182, 255, 0, 0.5)";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, CARD_W - 16, CARD_H - 16);

  // reticle corners
  drawReticleCorner(ctx, 40, 40, 1, 1);
  drawReticleCorner(ctx, CARD_W - 40, 40, -1, 1);
  drawReticleCorner(ctx, 40, CARD_H - 40, 1, -1);
  drawReticleCorner(ctx, CARD_W - 40, CARD_H - 40, -1, -1);

  // header
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#b6ff00";
  ctx.font = "600 34px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("DESI VISION", 150, 120);

  ctx.fillStyle = "#9a9c8c";
  ctx.font = "400 26px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(`${MODE_META[stats.mode].title} // ROUND COMPLETE`, 150, 165);

  // big score
  ctx.fillStyle = "#f2f1e8";
  ctx.font = "400 30px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("FINAL SCORE", 150, 250);

  ctx.fillStyle = "#b6ff00";
  ctx.font = "800 150px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(String(stats.score), 150, 400);

  // side stats
  ctx.fillStyle = "#9a9c8c";
  ctx.font = "400 26px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("CATCHES", 760, 250);
  ctx.fillStyle = "#f2f1e8";
  ctx.font = "800 84px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(String(stats.catches), 760, 340);

  ctx.fillStyle = "#9a9c8c";
  ctx.font = "400 26px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("BEST COMBO", 760, 430);
  ctx.fillStyle = "#f2f1e8";
  ctx.font = "800 84px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(`x${stats.bestCombo}`, 760, 520);

  // footer
  ctx.fillStyle = "#9a9c8c";
  ctx.font = "400 24px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(new Date().toISOString().slice(0, 10), 150, 545);
  ctx.fillStyle = "#b6ff00";
  ctx.fillText(SITE_URL, 150, 585);

  return canvas;
}

/**
 * Renders the score card for the given stats and triggers a PNG download.
 * Returns false when the browser cannot render the card.
 */
export function downloadScoreCard(stats: GameStats): boolean {
  try {
    const canvas = renderCard(stats);
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `desi-vision-${stats.mode}-${stats.score}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch {
    return false;
  }
}
