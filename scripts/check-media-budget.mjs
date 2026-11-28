#!/usr/bin/env node
/**
 * InDif Digital — Automated Media Budget & Hygiene Guard
 *
 * Used by .githooks/pre-commit (--staged), .githooks/pre-push (--push), and manual/CI checks (--scope <path>).
 * Blocks accidental commits/pushes of unoptimized videos, raw DSLR photos, uncompressed audio,
 * or local cache/backup artifacts while keeping grandfathered manifest assets unblocked.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, execSync } from "node:child_process";
import sharp from "sharp";

sharp.cache(false);

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data", "media-manifest.json");

const FORBIDDEN_PATH_PATTERNS = [
  /^scratch\//i,
  /^\.dev-logs\//i,
  /^\.npm-cache\//i,
  /^\.tools\//i,
  /^Contoh Website\//i,
  /^media\//i,
  /backup/i,
];
const FORBIDDEN_EXTS = new Set([".zip", ".rar", ".7z", ".exe", ".dll", ".psd", ".ai", ".mov", ".avi", ".mkv", ".wav", ".flac", ".bmp", ".tiff"]);
const VIDEO_EXTS = new Set([".mp4", ".webm", ".m4v"]);
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const AUDIO_EXTS = new Set([".mp3", ".m4a", ".ogg"]);

const MAX_VIDEO_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_DIM = 2560;
const MAX_NEW_PNG_BYTES = 600 * 1024;
const MAX_AUDIO_BYTES = 6 * 1024 * 1024;
const MAX_AUDIO_KBPS = 160;

function fmt(bytes) {
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function findFfmpeg() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return "ffmpeg";
  } catch {}
  const cacheRoots = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "npm-cache", "_npx"),
    process.env.APPDATA && path.join(process.env.APPDATA, "npm-cache", "_npx"),
    path.join(os.homedir(), ".npm", "_npx"),
  ].filter(Boolean);
  const exeName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  for (const root of cacheRoots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root)) {
      const candidate = path.join(root, entry, "node_modules", "ffmpeg-static", exeName);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function checkMp4Faststart(filePath) {
  const buf = fs.readFileSync(filePath);
  let off = 0, moov = -1, mdat = -1;
  while (off + 8 <= buf.length) {
    let size = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    let hdr = 8;
    if (size === 1 && off + 16 <= buf.length) { size = Number(buf.readBigUInt64BE(off + 8)); hdr = 16; }
    else if (size === 0) size = buf.length - off;
    if (size < hdr || off + size > buf.length) break;
    if (type === "moov" && moov === -1) moov = off;
    if (type === "mdat" && mdat === -1) mdat = off;
    off += size;
  }
  return moov !== -1 && mdat !== -1 ? moov < mdat : null;
}

function probeFfmpeg(ffmpegBin, filePath) {
  let stderr = "";
  try {
    execFileSync(ffmpegBin, ["-hide_banner", "-i", filePath], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    stderr = String(err.stderr || err.stdout || "");
  }
  const videoLine = stderr.split(/\r?\n/).find((l) => /Stream #\d+:\d+.*Video:/.test(l) && !/attached pic/i.test(l)) || null;
  const audioLine = stderr.split(/\r?\n/).find((l) => /Stream #\d+:\d+.*Audio:/.test(l)) || null;
  const hasAttachedPic = /Video:.*attached pic/i.test(stderr);
  const brMatch = stderr.match(/bitrate:\s*(\d+)\s*kb\/s/);
  const video = videoLine ? {
    codec: (videoLine.match(/Video:\s*([a-zA-Z0-9_]+)/) || [])[1] || null,
    pixFmt: (videoLine.match(/\b(yuvj?420p|yuv422p|yuv444p|rgb24|nv12|gbrp)\b/) || [])[1] || null,
  } : null;
  const audio = audioLine ? {
    bitrateKbps: Number((audioLine.match(/(\d+)\s*kb\/s/) || [])[1] || (brMatch ? brMatch[1] : 0)),
  } : null;
  return { video, audio, hasAttachedPic };
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return { files: {} };
  try { return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")); } catch { return { files: {} }; }
}

function getTargetFiles(argv) {
  if (argv.includes("--staged")) {
    const out = execSync("git diff --cached --name-only --diff-filter=ACM -z", { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    return out.split("\0").filter(Boolean);
  }
  if (argv.includes("--push")) {
    let baseRef = "origin/main";
    try {
      baseRef = execSync("git rev-parse --abbrev-ref --symbolic-full-name @{u}", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {}
    try {
      const out = execSync(`git diff --name-only --diff-filter=ACM -z ${baseRef}...HEAD`, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
      return out.split("\0").filter(Boolean);
    } catch {
      const out = execSync("git diff --name-only --diff-filter=ACM -z HEAD~1..HEAD", { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
      return out.split("\0").filter(Boolean);
    }
  }
  const scopeIdx = argv.indexOf("--scope");
  const scope = scopeIdx !== -1 && argv[scopeIdx + 1] ? argv[scopeIdx + 1] : "public/media";
  const abs = path.resolve(ROOT, scope);
  if (!fs.existsSync(abs)) return [];
  const list = [];
  const walk = (d) => {
    const st = fs.statSync(d);
    if (st.isFile()) { list.push(path.relative(ROOT, d).replace(/\\/g, "/")); return; }
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (e.isFile()) list.push(path.relative(ROOT, f).replace(/\\/g, "/"));
    }
  };
  walk(abs);
  return list;
}

async function main() {
  const argv = process.argv.slice(2);
  const mode = argv.includes("--staged") ? "pre-commit (staged)" : argv.includes("--push") ? "pre-push (diff)" : "scope";
  const files = getTargetFiles(argv);
  const manifest = loadManifest();
  const ffmpegBin = findFfmpeg();
  const violations = [];
  let checkedMedia = 0;

  for (const rel of files) {
    const normRel = rel.replace(/\\/g, "/");
    const full = path.join(ROOT, normRel);
    if (!fs.existsSync(full)) continue;
    const ext = path.extname(normRel).toLowerCase();
    const size = fs.statSync(full).size;

    // 1. Forbidden paths / raw artifacts
    for (const pat of FORBIDDEN_PATH_PATTERNS) {
      if (pat.test(normRel) && !normRel.startsWith("scripts/") && !normRel.startsWith("docs/")) {
        violations.push({ rel: normRel, reason: `Path terlarang untuk Git/Vercel (${pat})` });
        break;
      }
    }
    if (FORBIDDEN_EXTS.has(ext) && normRel.startsWith("public/")) {
      violations.push({ rel: normRel, reason: `Ekstensi mentah/tidak diizinkan di public/: ${ext} (${fmt(size)})` });
      continue;
    }

    if (!normRel.startsWith("public/")) continue;

    // Check if file matches manifest SHA-256 (verified optimal / approved exception)
    const isManifestApproved = manifest.files?.[normRel]?.sha256 === sha256File(full);

    if (VIDEO_EXTS.has(ext)) {
      checkedMedia++;
      if (size > MAX_VIDEO_BYTES) {
        violations.push({ rel: normRel, reason: `Video melebihi batas ${fmt(MAX_VIDEO_BYTES)}: ${fmt(size)}` });
      }
      if (ext === ".mp4" || ext === ".m4v") {
        const faststart = checkMp4Faststart(full);
        if (faststart === false && !isManifestApproved) {
          violations.push({ rel: normRel, reason: `MP4 belum +faststart (moov atom di akhir file)` });
        }
      }
      if (ffmpegBin) {
        const p = probeFfmpeg(ffmpegBin, full);
        if (p.video) {
          if (p.video.codec !== "h264" && ext === ".mp4") {
            violations.push({ rel: normRel, reason: `Codec video MP4 bukan H.264 (${p.video.codec})` });
          }
          if (p.video.pixFmt && p.video.pixFmt !== "yuv420p") {
            violations.push({ rel: normRel, reason: `Pixel format ${p.video.pixFmt} tidak kompatibel optimal iOS/Apple (wajib yuv420p)` });
          }
        }
      }
    } else if (IMAGE_EXTS.has(ext)) {
      checkedMedia++;
      if (size > MAX_IMAGE_BYTES) {
        violations.push({ rel: normRel, reason: `Gambar mentah/terlalu besar (> ${fmt(MAX_IMAGE_BYTES)}): ${fmt(size)}` });
      }
      try {
        const meta = await sharp(full).metadata();
        const maxDim = Math.max(meta.width || 0, meta.height || 0);
        if (maxDim > MAX_IMAGE_DIM) {
          violations.push({ rel: normRel, reason: `Resolusi gambar terlalu besar (${meta.width}x${meta.height}, maks ${MAX_IMAGE_DIM}px)` });
        }
      } catch (e) {
        violations.push({ rel: normRel, reason: `Gambar tidak valid/rusak: ${e.message}` });
      }
      if (ext === ".png" && size > MAX_NEW_PNG_BYTES && !isManifestApproved) {
        violations.push({ rel: normRel, reason: `PNG baru > ${fmt(MAX_NEW_PNG_BYTES)} (${fmt(size)}) — optimalkan ke WebP terlebih dahulu` });
      }
    } else if (AUDIO_EXTS.has(ext)) {
      checkedMedia++;
      if (size > MAX_AUDIO_BYTES) {
        violations.push({ rel: normRel, reason: `Audio terlalu besar (> ${fmt(MAX_AUDIO_BYTES)}): ${fmt(size)}` });
      }
      if (ffmpegBin && !isManifestApproved) {
        const p = probeFfmpeg(ffmpegBin, full);
        if (p.hasAttachedPic) {
          violations.push({ rel: normRel, reason: `Audio masih membawa embedded cover art PNG/JPG — bersihkan dengan optimize-media.mjs` });
        }
        if (p.audio?.bitrateKbps && p.audio.bitrateKbps > MAX_AUDIO_KBPS) {
          violations.push({ rel: normRel, reason: `Bitrate audio terlalu tinggi (${p.audio.bitrateKbps} kbps > ${MAX_AUDIO_KBPS} kbps)` });
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`\n[MEDIA BUDGET GUARD FAILED - ${mode}] Ditemukan ${violations.length} pelanggaran:\n`);
    for (const v of violations) {
      console.error(`  ✗ ${v.rel}\n    -> ${v.reason}`);
    }
    console.error(`\nJalankan optimasi terlebih dahulu:\n  npm run optimize:media -- --scope <folder-baru> --apply --convert-webp --strip-audio --backup-dir "../Undangan-Digital-Media-Backup"\n`);
    process.exit(1);
  }

  console.log(`[MEDIA BUDGET GUARD OK - ${mode}] ${files.length} file diperiksa (${checkedMedia} media) — 0 pelanggaran.`);
}

main().catch((err) => {
  console.error("[MEDIA BUDGET GUARD ERROR]", err);
  process.exit(1);
});
