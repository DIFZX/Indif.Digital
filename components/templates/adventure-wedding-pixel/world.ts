export const WORLD = { width: 768, height: 1152 };
export const SPAWN = { x: 384, y: 646 };
export type Character = "groom" | "bride";
export type Section = "couple" | "events" | "gallery" | "rsvp" | "gift";
export type Point = { x: number; y: number };
export type AnimalId = "cat" | "rabbit" | "butterfly" | "butterfly-rose" | "butterfly-gold";
export type Animal = { id: AnimalId; kind: "cat" | "rabbit" | "butterfly"; label: string; response: string; x: number; y: number; touchRadius: number };

export const ANIMALS: Animal[] = [
  { id: "cat", kind: "cat", label: "Milo", response: "Milo: Purrr… Senang bertemu kamu!", x: 384, y: 735, touchRadius: 29 },
  { id: "rabbit", kind: "rabbit", label: "Mochi", response: "Mochi: Hop hop! Selamat datang di taman kami.", x: 480, y: 789, touchRadius: 28 },
  { id: "butterfly", kind: "butterfly", label: "Kupu-kupu biru", response: "Kupu-kupunya menari menyambutmu.", x: 500, y: 385, touchRadius: 31 },
  { id: "butterfly-rose", kind: "butterfly", label: "Kupu-kupu merah muda", response: "Sepasang sayap kecil, satu doa baik untukmu.", x: 217, y: 492, touchRadius: 31 },
  { id: "butterfly-gold", kind: "butterfly", label: "Kupu-kupu emas", response: "Semoga langkahmu selalu dipenuhi kabar bahagia.", x: 486, y: 953, touchRadius: 31 },
];

export function updateAnimalContacts(point: Point, touching: Set<AnimalId>): AnimalId[] {
  const entered: AnimalId[] = [];
  for (const animal of ANIMALS) {
    const distance = Math.hypot(point.x - animal.x, point.y - animal.y);
    if (distance < animal.touchRadius && !touching.has(animal.id)) { touching.add(animal.id); entered.push(animal.id); }
    else if (distance > animal.touchRadius + 14) touching.delete(animal.id);
  }
  return entered;
}

export const LOCATIONS: { id: Section; label: string; title: string; x: number; y: number }[] = [
  { id: "couple", label: "Pasangan", title: "Dua pemain, satu cerita", x: 384, y: 282 },
  { id: "events", label: "Acara", title: "Hari yang kita nantikan", x: 310, y: 616 },
  { id: "gallery", label: "Galeri", title: "Album perjalanan", x: 590, y: 758 },
  { id: "rsvp", label: "RSVP", title: "Titip doa & kabar hadir", x: 166, y: 760 },
  { id: "gift", label: "Hadiah", title: "Kotak tanda kasih", x: 440, y: 822 },
];

export function nearestLocation(point: Point) {
  return LOCATIONS.reduce<(typeof LOCATIONS)[number] | null>((nearest, location) => {
    const distance = Math.hypot(point.x - location.x, point.y - location.y);
    return distance < 92 && (!nearest || distance < Math.hypot(point.x - nearest.x, point.y - nearest.y)) ? location : nearest;
  }, null);
}

type Polygon = [number, number][];
function inPolygon(x: number, y: number, points: Polygon) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const GARDEN_BOUNDARY: Polygon = [[64, 232], [232, 220], [536, 220], [710, 247], [739, 620], [716, 1037], [680, 1080], [426, 1091], [426, 1152], [342, 1152], [342, 1090], [100, 1062], [61, 940], [55, 498]];
const POND: Polygon = [[768, 242], [649, 248], [572, 286], [546, 340], [541, 393], [561, 450], [550, 500], [575, 566], [636, 599], [768, 613]];
const FOOTPRINT = [[0, 0], [5, 0], [-5, 0], [0, 5], [0, -5], [3.5, 3.5], [-3.5, 3.5], [3.5, -3.5], [-3.5, -3.5]];
// Collisions use the objects' ground footprints; grass and paths share the same walkable ground.
const SOLIDS = [
  [264, 24, 506, 265], [125, 166, 233, 218], [536, 162, 638, 218],
  [99, 392, 175, 440], [198, 392, 270, 440],
  [83, 602, 225, 751], [525, 608, 673, 718],
  [275, 839, 410, 984], [290, 612, 310, 627], [459, 613, 478, 628],
  [308, 415, 337, 435], [431, 415, 457, 435],
  [300, 1060, 331, 1110], [438, 1060, 468, 1110],
];
const PLANTERS = [
  [384, 530, 73], [245, 574, 30], [476, 350, 27], [297, 803, 27], [449, 872, 25],
  [264, 257, 20], [502, 255, 20], [554, 932, 20], [670, 933, 18], [254, 966, 20],
  [65, 330, 83], [62, 579, 72], [74, 879, 91], [704, 836, 62],
  [194, 1057, 49], [562, 1051, 53], [645, 1035, 33], [608, 885, 50],
];

function clearGround(x: number, y: number) {
  if (!inPolygon(x, y, GARDEN_BOUNDARY)) return false;
  const onBridge = x >= 530 && x <= 734 && y >= 414 && y <= 447;
  if (!onBridge && inPolygon(x, y, POND)) return false;
  return !SOLIDS.some(([l, t, r, b]) => x > l && x < r && y > t && y < b) &&
    !PLANTERS.some(([cx, cy, radius]) => Math.hypot(x - cx, y - cy) < radius);
}

export function canWalk(x: number, y: number) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  return FOOTPRINT.every(([dx, dy]) => clearGround(x + dx, y + dy)) &&
    !ANIMALS.some(animal => animal.kind !== "butterfly" && Math.hypot(x - animal.x, y - animal.y) < 14) &&
    !LOCATIONS.some(location => Math.hypot(x - location.x, y - location.y - 10) < 10);
}

export function advancePlayer(point: Point, input: Point, seconds: number): Point {
  const length = Math.hypot(input.x, input.y);
  if (!length) return point;
  if (!Number.isFinite(length) || !Number.isFinite(seconds)) return point;
  const speed = 132 * Math.max(0, Math.min(seconds, 0.04)) / Math.max(1, length);
  const nextX = point.x + input.x * speed;
  const x = canWalk(nextX, point.y) ? nextX : point.x;
  const nextY = point.y + input.y * speed;
  return { x, y: canWalk(x, nextY) ? nextY : point.y };
}

export function walkingFrame(distance: number) {
  return distance > 0 ? [1, 0, 2, 0][Math.floor(distance / 9) % 4] : 0;
}

export function drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, character: Character, step = 0, facing = 1, scale = 2, sprites?: HTMLImageElement, direction = 0, walkSprites?: HTMLImageElement) {
  if (walkSprites?.complete && walkSprites.naturalWidth) {
    const cellWidth = walkSprites.naturalWidth / 6, cellHeight = walkSprites.naturalHeight / 4;
    const size = scale * 36;
    ctx.fillStyle = "#24392144";
    ctx.beginPath(); ctx.ellipse(x, y, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
    const column = (character === "bride" ? 3 : 0) + walkingFrame(step);
    ctx.drawImage(walkSprites, column * cellWidth, direction * cellHeight, cellWidth, cellHeight, Math.round(x - size / 2), Math.round(y - size * .95), size, size);
    return;
  }
  if (sprites?.complete && sprites.naturalWidth) {
    const cellWidth = sprites.naturalWidth / 2, cellHeight = sprites.naturalHeight / 4;
    const cropWidth = cellWidth / 2;
    const height = scale * 32, width = height * cropWidth / cellHeight;
    ctx.fillStyle = "#24392144";
    ctx.beginPath(); ctx.ellipse(x, y, width * .31, 3, 0, 0, Math.PI * 2); ctx.fill();
    const bob = step ? Math.round(Math.abs(Math.sin(step)) * 2) : 0;
    ctx.drawImage(sprites, (character === "bride" ? cellWidth : 0) + cellWidth / 4, direction * cellHeight, cropWidth, cellHeight, Math.round(x - width / 2), Math.round(y - height - bob), width, height);
    return;
  }
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale * facing, scale);
  const box = (color: string, left: number, top: number, width: number, height: number) => { ctx.fillStyle = color; ctx.fillRect(left, top, width, height); };
  box("#29372055", -8, -1, 17, 3);
  const stride = Math.sin(step) > 0 ? 1 : -1;
  box("#35291f", -5, -4 + stride, 4, 4); box("#35291f", 2, -4 - stride, 4, 4);
  if (character === "bride") {
    box("#cfbda0", -7, -24, 15, 21); box("#fff3d2", -6, -23, 13, 17);
    box("#d5a879", -4, -13, 9, 4); box("#fff8e6", -5, -12, 11, 5);
    box("#edcfad", -7, -8, 15, 5); box("#fff2d5", -9, -5, 19, 4);
    box("#fff9ec", -4, -8, 9, 6); box("#c59479", -8, -13, 3, 8); box("#c59479", 6, -13, 3, 8);
  } else {
    box("#182a35", -6, -14, 13, 11); box("#315066", -5, -13, 11, 8);
    box("#fff4d9", -2, -14, 5, 7); box("#b55255", -1, -12, 3, 3);
    box("#243b4d", -8, -13, 3, 8); box("#243b4d", 7, -13, 3, 8);
    box("#bd8e69", -8, -5, 3, 3); box("#bd8e69", 7, -5, 3, 3);
    box("#243b4d", -4, -5, 4, 3); box("#243b4d", 2, -5, 4, 3);
    box("#e4b860", 5, -12, 2, 2);
  }
  box("#38291e", -6, -25, 13, 11); box("#e2ac7b", -5, -22, 11, 9);
  box("#f0c693", -4, -22, 9, 8); box("#2d261f", -5, -26, 11, 5);
  box("#4c3527", -3, -27, 7, 3); box("#6b4a30", -2, -26, 5, 1);
  box("#322c25", -6, -23, 3, 4); box("#322c25", 4, -23, 3, 4);
  box("#2b2a22", -3, -19, 2, 2); box("#2b2a22", 3, -19, 2, 2);
  box("#fff3da", -3, -19, 1, 1); box("#fff3da", 3, -19, 1, 1);
  box("#bd805f", 0, -15, 2, 1);
  if (character === "bride") {
    box("#ac5564", -7, -23, 3, 3); box("#fff5d5", -6, -24, 2, 2);
    box("#4f703b", 1, -8, 4, 7); box("#c86a79", -1, -10, 7, 5);
    box("#f5b9a6", 1, -11, 3, 3); box("#fff4d4", 4, -8, 3, 3);
  }
  ctx.restore();
}
