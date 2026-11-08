"use client";

import { useEffect, useRef, type RefObject } from "react";
import { advancePlayer, drawCharacter, LOCATIONS, nearestLocation, updateAnimalContacts, SPAWN, walkingFrame, WORLD, type AnimalId, type Character, type Section, type Point } from "./world";
import { drawWildlife } from "./wildlife";
import { drawGreeting, greetingFrame } from "./couple-animation";
import { drawCanopyShadows, drawFallingLeaves } from "./cinematic";

type Props = {
  active: boolean;
  character: Character;
  input: RefObject<Point>;
  position: RefObject<Point>;
  onAnimalTouch: (animal: AnimalId) => void;
  onNear: (section: Section | null) => void;
  onInteract: () => void;
  onReady: (ready: boolean) => void;
  onError: () => void;
};

export function PixelWorld({ active, character, input, position, onAnimalTouch, onNear, onInteract, onReady, onError }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const touching = useRef(new Set<AnimalId>());
  const callbacks = useRef({ onAnimalTouch, onNear, onInteract, onReady, onError });
  useEffect(() => { callbacks.current = { onAnimalTouch, onNear, onInteract, onReady, onError }; });

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ctx = element.getContext("2d", { alpha: false });
    if (!ctx) { callbacks.current.onError(); return; }
    let frame = 0;
    let previous = 0;
    let width = 390;
    let height = 844;
    let dirty = true;
    let disposed = false;
    let nearest: Section | null | undefined;
    let elapsed = 0, lastAmbientFrame = 0;
    const reactions = new Map<AnimalId, number>();
    let vignette: CanvasGradient;
    let steps = 0;
    let facing = 1;
    let direction = 0;
    let wasMoving = false;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionPreference.matches;
    const updateMotion = () => { reducedMotion = motionPreference.matches; dirty = true; };
    motionPreference.addEventListener("change", updateMotion);
    const keys = new Set<string>();
    const art = new window.Image();
    const sprites = new window.Image();
    const walkSprites = new window.Image();
    const greeting = new window.Image();
    greeting.src = "/media/adventure-wedding-pixel/greeting.webp";
    greeting.onload = () => { dirty = true; };
    walkSprites.src = "/media/adventure-wedding-pixel/walking.webp";
    walkSprites.onload = () => { dirty = true; };
    sprites.src = "/media/adventure-wedding-pixel/characters.webp";
    sprites.onload = () => { dirty = true; };
    art.src = "/media/adventure-wedding-pixel/garden.webp";
    art.onload = () => { if (!disposed) { dirty = true; callbacks.current.onReady(true); } };
    art.onerror = () => { if (!disposed) callbacks.current.onError(); };
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.imageSmoothingEnabled = false;
      vignette = ctx.createRadialGradient(width / 2, height * .45, Math.min(width, height) * .28, width / 2, height * .45, Math.max(width, height) * .74);
      vignette.addColorStop(0, "#11261900"); vignette.addColorStop(.55, "#11261900"); vignette.addColorStop(1, "#11261938");
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const release = () => { keys.clear(); input.current = { x: 0, y: 0 }; };
    const keyDown = (event: KeyboardEvent) => {
      if (!active || event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof HTMLElement && event.target.closest("input,textarea,select,dialog"))) return;
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) { event.preventDefault(); keys.add(key); }
      if ((key === "e" || key === " ") && !event.repeat && !(event.target instanceof HTMLElement && event.target.closest("button,a"))) { event.preventDefault(); callbacks.current.onInteract(); }
    };
    const keyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);
    const render = (time: number) => {
      const seconds = Math.min((time - (previous || time)) / 1000, .04);
      previous = time;
      if (active && !document.hidden) elapsed += seconds;
      for (const [id, started] of reactions) if (elapsed - started >= 3.2) { reactions.delete(id); dirty = true; }
      if (active && !reducedMotion && time - lastAmbientFrame > 50) { dirty = true; lastAmbientFrame = time; }
      const vector = active && !document.hidden ? {
        x: input.current.x + Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft")),
        y: input.current.y + Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup")),
      } : { x: 0, y: 0 };
      let moving = false;
      if (Math.hypot(vector.x, vector.y) > .08) {
        const next = advancePlayer(position.current, vector, seconds);
        const distance = Math.hypot(next.x - position.current.x, next.y - position.current.y);
        moving = distance > .01;
        position.current = next;
        steps += distance;
        if (Math.abs(vector.x) > .1) facing = vector.x < 0 ? -1 : 1;
        direction = Math.abs(vector.x) > Math.abs(vector.y) ? (vector.x < 0 ? 1 : 2) : (vector.y < 0 ? 3 : 0);
        dirty = true;
      }
      if (wasMoving !== moving) dirty = true;
      if (!moving) steps = 0;
      wasMoving = moving;
      if (active && !document.hidden) for (const id of updateAnimalContacts(position.current, touching.current)) {
        reactions.set(id, elapsed); dirty = true; callbacks.current.onAnimalTouch(id);
      }
      const nearby = nearestLocation(position.current)?.id ?? null;
      if (nearby !== nearest) { nearest = nearby; callbacks.current.onNear(nearby); dirty = true; }
      if (dirty && !document.hidden && width > 0 && height > 0) {
        const zoom = Math.max(1, Math.min(width / 345, 1.65));
        const viewWidth = width / zoom, viewHeight = height / zoom;
        const cameraX = Math.max(0, Math.min(WORLD.width - viewWidth, position.current.x - viewWidth / 2));
        const cameraY = Math.max(0, Math.min(WORLD.height - viewHeight, position.current.y - viewHeight * .52));
        ctx.fillStyle = "#425c32"; ctx.fillRect(0, 0, width, height);
        ctx.save(); ctx.scale(zoom, zoom); ctx.translate(-cameraX, -cameraY);
        if (art.complete && art.naturalWidth) ctx.drawImage(art, 0, 0, WORLD.width, WORLD.height);
        drawCanopyShadows(ctx, elapsed, reducedMotion);
        if (greeting.complete && greeting.naturalWidth) {
          drawGreeting(ctx, greeting, 363, 240, "groom", elapsed, 81, reducedMotion);
          drawGreeting(ctx, greeting, 405, 240, "bride", elapsed, 81, reducedMotion);
        } else {
          drawCharacter(ctx, 363, 239, "groom", 0, 1, 2, sprites);
          drawCharacter(ctx, 405, 239, "bride", 0, 1, 2, sprites);
        }
        LOCATIONS.forEach(location => {
          const selected = nearby === location.id;
          const phase = reducedMotion ? .35 : (elapsed / 2.2 + LOCATIONS.indexOf(location) * .16) % 1;
          ctx.save();
          ctx.strokeStyle = "#293f2e99"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(location.x, location.y + 23, 31, 18, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = selected ? "#fff7ce" : "#f5d783"; ctx.lineWidth = 1.3; ctx.stroke();
          ctx.globalAlpha = (1 - phase) * .75;
          ctx.beginPath(); ctx.ellipse(location.x, location.y + 23, 32 + phase * 24, 19 + phase * 14, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
          ctx.fillStyle = "#543622"; ctx.fillRect(location.x - 3, location.y - 2, 6, 16);
          ctx.font = "600 12px 'Adventure Pixel', monospace";
          const signWidth = Math.max(66, ctx.measureText(location.label.toUpperCase()).width + 21);
          ctx.fillStyle = "#35271f"; ctx.fillRect(location.x - signWidth / 2 - 2, location.y - 24, signWidth + 4, 27);
          ctx.fillStyle = selected ? "#f3ce76" : "#fff0d1"; ctx.fillRect(location.x - signWidth / 2, location.y - 22, signWidth, 23);
          ctx.fillStyle = "#b28b54"; ctx.fillRect(location.x - signWidth / 2 + 2, location.y - 20, signWidth - 4, 1);
          ctx.fillStyle = "#412b20"; ctx.textAlign = "center"; ctx.fillText(location.label.toUpperCase(), location.x, location.y - 6);
        });
        drawWildlife(ctx, elapsed, position.current, reactions, reducedMotion);
        drawCharacter(ctx, position.current.x, position.current.y, character, moving && !reducedMotion ? steps : 0, facing, 1.8, sprites, direction, walkSprites);
        drawFallingLeaves(ctx, elapsed, reducedMotion);
        ctx.restore();
        ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);
        element.dataset.playerX = position.current.x.toFixed(1);
        element.dataset.playerY = position.current.y.toFixed(1);
        element.dataset.walkFrame = String(walkingFrame(moving && !reducedMotion ? steps : 0));
        element.dataset.direction = String(direction);
        element.dataset.near = nearby ?? "";
        element.dataset.animalReaction = [...reactions.keys()].join(",");
        element.dataset.animalContactCount = String(touching.current.size);
        element.dataset.groomFrame = String(greetingFrame("groom", elapsed, reducedMotion));
        element.dataset.brideFrame = String(greetingFrame("bride", elapsed, reducedMotion));
        element.dataset.cinematicPhase = reducedMotion ? "static" : elapsed.toFixed(2);
        element.dataset.checkpointPhase = reducedMotion ? "static" : (elapsed % 2.2).toFixed(2);
        dirty = false;
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    void document.fonts.ready.then(() => { dirty = true; });
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); release();
      motionPreference.removeEventListener("change", updateMotion);
      window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", release); document.removeEventListener("visibilitychange", release);
    };
  }, [active, character, input, position]);

  return <canvas ref={canvas} aria-label="Taman pernikahan pixel. Rumput boleh dilewati. Lingkaran berdenyut menandai tujuan undangan. Sentuh kucing, kelinci, atau kupu-kupu dengan karaktermu agar mereka bereaksi. Tekan A atau E di dekat papan untuk membuka undangan. Semua isi undangan juga tersedia di menu bawah." role="img" data-player-x={SPAWN.x} data-player-y={SPAWN.y} />;
}

export function PixelCharacter({ character, className }: { character: Character; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let disposed = false;
    let animation = 0, lastFrame = -1;
    const started = performance.now();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new window.Image();
    const render = (time: number) => {
      if (disposed) return;
      const seconds = (time - started) / 1000;
      const frame = greetingFrame(character, seconds, motion.matches);
      const ctx = canvas.current?.getContext("2d");
      if (!document.hidden && ctx && image.complete && image.naturalWidth && frame !== lastFrame) {
        ctx.clearRect(0, 0, 64, 88); ctx.imageSmoothingEnabled = false;
        drawGreeting(ctx, image, 31, 84, character, seconds, 90, motion.matches);
        if (canvas.current) canvas.current.dataset.greetingFrame = String(frame);
        lastFrame = frame;
      }
      if (!motion.matches) animation = requestAnimationFrame(render);
    };
    const updateMotion = () => { cancelAnimationFrame(animation); lastFrame = -1; render(performance.now()); };
    motion.addEventListener("change", updateMotion);
    image.onload = () => render(performance.now());
    image.src = "/media/adventure-wedding-pixel/greeting.webp";
    return () => { disposed = true; cancelAnimationFrame(animation); motion.removeEventListener("change", updateMotion); };
  }, [character]);
  return <canvas className={className} ref={canvas} width={64} height={88} aria-hidden="true" />;
}
