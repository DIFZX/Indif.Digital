export function drawCanopyShadows(ctx: CanvasRenderingContext2D, seconds: number, reducedMotion: boolean) {
  ctx.save(); ctx.fillStyle = "#10291d"; ctx.globalAlpha = .075;
  const sway = reducedMotion ? 0 : Math.sin(seconds * .3) * 7;
  for (let i = 0; i < 18; i++) {
    const x = (i * 173) % 740 + sway, y = (i * 227) % 1120;
    ctx.beginPath(); ctx.moveTo(x - 25, y + 30); ctx.lineTo(x + 36, y - 32); ctx.lineTo(x + 65, y - 28); ctx.lineTo(x + 6, y + 43); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 12, y + 5); ctx.lineTo(x + 77, y - 13); ctx.lineTo(x + 94, y + 3); ctx.lineTo(x + 25, y + 24); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function drawFallingLeaves(ctx: CanvasRenderingContext2D, seconds: number, reducedMotion: boolean) {
  if (reducedMotion) return;
  ctx.save();
  for (let i = 0; i < 19; i++) {
    const x = 55 + (i * 163) % 660 + Math.sin(seconds * .7 + i) * 24;
    const y = ((i * 179 + seconds * (10 + i % 4 * 2)) % 1260) - 60;
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(Math.sin(seconds + i) * .7 + .5);
    ctx.globalAlpha = .45 + i % 3 * .09;
    ctx.fillStyle = ["#c89a45", "#c6ab63", "#9e6738", "#dfba72"][i % 4];
    ctx.fillRect(-2, -4, 4, 7); ctx.fillRect(-3, -2, 6, 3);
    ctx.fillStyle = "#f0d191"; ctx.fillRect(0, -2, 1, 4); ctx.restore();
  }
  ctx.restore();
}
