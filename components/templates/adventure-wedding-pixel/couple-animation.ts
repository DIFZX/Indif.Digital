import type { Character } from "./world";

export function greetingFrame(character: Character, seconds: number, reducedMotion = false) {
  if (reducedMotion) return 0;
  const blink = (seconds + (character === "bride" ? 1.6 : 0)) % 4.7 > 4.52;
  if (character === "bride") return blink ? 5 : 0;
  const waving = seconds % 6 < 3.8;
  if (blink) return waving ? 4 : 5;
  return waving ? [1, 2, 3, 2][Math.floor(seconds * 3.5) % 4] : 0;
}

export function drawGreeting(ctx: CanvasRenderingContext2D, atlas: HTMLImageElement, x: number, y: number, character: Character, seconds: number, size: number, reducedMotion: boolean) {
  if (!atlas.complete || !atlas.naturalWidth) return;
  const cellWidth = atlas.naturalWidth / 6, cellHeight = atlas.naturalHeight / 2;
  const column = greetingFrame(character, seconds, reducedMotion);
  ctx.drawImage(atlas, column * cellWidth, character === "bride" ? cellHeight : 0, cellWidth, cellHeight, Math.round(x - size / 2), Math.round(y - size * .95), size, size);
}
