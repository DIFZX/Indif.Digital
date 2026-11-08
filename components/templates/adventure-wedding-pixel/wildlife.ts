import { ANIMALS, type AnimalId, type Point } from "./world";

const CAT = [
  "  oo      oo       ",
  "  oco    oco       ",
  "  ocwoooowco       ",
  "  owwwwwwwwo       ",
  "  owgwwwgwwo       ",
  "  owwwpwwwwo       ",
  "   owwwwwwo        ",
  "    occcco         ",
  "   ocwwwwco        ",
  "  ocwwwwwwco       ",
  "  ocwwcwwwco       ",
  "  ocwwccwwco       ",
  "  ocwwccwwco       ",
  "  owwwoowwwo       ",
  "   ooo  ooo        ",
];
const PALETTE: Record<string, string> = { o: "#513a2b", c: "#d68e43", w: "#ffedc5", g: "#344f37", p: "#bc6070" };
const RABBIT = [
  "    oo   oo     ", "   owpo owpo    ", "   owpo owpo    ", "   owpo owpo    ",
  "   owwo owwo    ", "   owwwwwwwo    ", "  owwwwwwwwwo   ", "  owgwwwwgwwo   ",
  "  owwwwpwwwwo   ", "   owwwwwwwo    ", "    owwwwwo     ", "   owwwwwwwo    ",
  "  owwwwwwwwwwo  ", "  owwwwwwwwwwo  ", " owwwwwwwwwwwwo ", " owwwwwwwwwwwwo ",
  "  owwwoooowwwo  ", "   ooo    ooo   ",
];
const animalSprites = new Map<string, HTMLCanvasElement>();

function animalSprite(kind: "cat" | "rabbit", reacting: boolean) {
  const key = `${kind}-${reacting}`;
  const cached = animalSprites.get(key);
  if (cached) return cached;
  const sprite = document.createElement("canvas");
  sprite.width = 22; sprite.height = 20;
  const context = sprite.getContext("2d");
  if (!context) return null;
  (kind === "cat" ? CAT : RABBIT).forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel === " ") return;
    if (reacting && pixel === "g") { context.fillStyle = PALETTE.o; context.fillRect(x, y + .5, 1, .5); }
    else { context.fillStyle = PALETTE[pixel]; context.fillRect(x, y, 1, 1); }
  }));
  animalSprites.set(key, sprite);
  return sprite;
}

function heart(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#cf6077";
  ctx.fillRect(x, y, 4, 3); ctx.fillRect(x + 6, y, 4, 3);
  ctx.fillRect(x, y + 3, 10, 3); ctx.fillRect(x + 2, y + 6, 6, 2); ctx.fillRect(x + 4, y + 8, 2, 2);
}

export function drawWildlife(ctx: CanvasRenderingContext2D, seconds: number, player: Point, reactions: ReadonlyMap<AnimalId, number>, reducedMotion: boolean) {
  for (const animal of ANIMALS) {
    const selected = Math.hypot(player.x - animal.x, player.y - animal.y) < 62;
    const started = reactions.get(animal.id);
    const reacting = started !== undefined && seconds - started < 3.2;
    if (animal.kind === "cat" || animal.kind === "rabbit") {
      const hop = animal.kind === "rabbit" && reacting && !reducedMotion ? Math.max(0, Math.sin((seconds - started!) * 9)) * 13 : 0;
      ctx.fillStyle = "#263a2544"; ctx.beginPath(); ctx.ellipse(animal.x, animal.y, 13, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(animal.x - 15, animal.y - 27 - hop); ctx.scale(1.7, animal.kind === "rabbit" ? 1.5 : 1.7);
      if (animal.kind === "cat") {
        const wag = reducedMotion ? 0 : Math.round(Math.sin(seconds * (reacting ? 7 : 2)) * 2);
        ctx.fillStyle = PALETTE.o; ctx.fillRect(13, 8, 6, 3); ctx.fillRect(17, 5 + wag, 3, 6 - wag);
        ctx.fillStyle = PALETTE.c; ctx.fillRect(14, 9, 4, 1); ctx.fillRect(18, 6 + wag, 1, 4 - wag);
      }
      const sprite = animalSprite(animal.kind, reacting);
      if (sprite) ctx.drawImage(sprite, 0, 0);
      ctx.restore();
      if (reacting) for (let i = 0; i < 3; i++) {
        const phase = reducedMotion ? .4 : ((seconds - started!) / 1.4 + i * .28) % 1;
        ctx.save(); ctx.globalAlpha = 1 - phase; heart(ctx, animal.x - 16 + i * 11, animal.y - 40 - phase * 30); ctx.restore();
      }
    } else {
      const t = (reducedMotion ? 0 : seconds) + ANIMALS.indexOf(animal);
      const radius = reacting && !reducedMotion ? 23 : 8;
      const x = animal.x + Math.cos(t * 2.5) * radius;
      const y = animal.y - 15 + Math.sin(t * 3) * (reacting ? 15 : 5);
      const wing = reducedMotion ? 8 : 3 + Math.round(Math.abs(Math.sin(t * 10)) * 6);
      ctx.fillStyle = "#4a3246";
      ctx.fillRect(Math.round(x - wing - 2), Math.round(y - 5), wing, 9);
      ctx.fillRect(Math.round(x + 2), Math.round(y - 5), wing, 9);
      ctx.fillStyle = animal.id === "butterfly" ? "#86c8dd" : animal.id === "butterfly-gold" ? "#e8bd60" : "#e894b2";
      ctx.fillRect(Math.round(x - wing - 1), Math.round(y - 4), wing - 1, 6);
      ctx.fillRect(Math.round(x + 3), Math.round(y - 4), wing - 1, 6);
      ctx.fillStyle = "#f8d587";
      ctx.fillRect(Math.round(x - wing + 1), Math.round(y - 2), 2, 2);
      ctx.fillRect(Math.round(x + 4), Math.round(y - 2), 2, 2);
      ctx.fillStyle = "#433227"; ctx.fillRect(Math.round(x), Math.round(y - 5), 2, 12);
    }
    if (selected || reacting) {
      const text = animal.kind === "cat" ? reacting ? "Milo · Purrr…" : "Milo" : animal.kind === "rabbit" ? reacting ? "Mochi · Hop hop!" : "Mochi" : reacting ? "Menari untukmu!" : "Kupu-kupu";
      ctx.font = "600 11px Arial, sans-serif";
      const width = ctx.measureText(text).width + 16;
      const bubbleX = animal.x;
      ctx.fillStyle = "#503a29"; ctx.fillRect(bubbleX - width / 2 - 1, animal.y - 62, width + 2, 23);
      ctx.fillStyle = "#fff3d9"; ctx.fillRect(bubbleX - width / 2, animal.y - 61, width, 21);
      ctx.fillStyle = "#503a29"; ctx.textAlign = "center"; ctx.fillText(text, bubbleX, animal.y - 46);
    }
  }
}
