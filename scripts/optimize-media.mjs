#!/usr/bin/env node
/**
 * InDif Digital — Reusable Media Optimization & Validation Tool
 *
 * Safe-by-default media optimizer for templates and new customer invitations:
 * - Dry-run by default (pass --apply to write changes)
 * - Refuses to touch public/media/client/ or public/media/invitations/ unless --allow-client is passed
 * - Uses SHA-256 manifest (data/media-manifest.json) to avoid re-processing optimal assets
 * - Stages outputs to OS temp dir, validates playability/integrity before replacing
 * - Saves verified SHA-256 backups OUTSIDE the repository (--backup-dir)
 *
 * Usage examples:
 *   node scripts/optimize-media.mjs --scope public/media/blue-garden
 *   node scripts/optimize-media.mjs --scope public/media/blue-garden --apply --convert-webp --strip-audio --preserve-files blue-garden-paper-v1.png --backup-dir "../Undangan-Digital-Backup"
 */

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

// Prevent libvips from holding file locks on Windows during temp cleanup/replacement
sharp.cache(false);

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data", "media-manifest.json");

const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const AUDIO_EXTS = new Set([".mp3", ".m4a", ".wav", ".ogg"]);

function fmt(bytes) {
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function parseArgs(argv) {
  const opts = {
    scope: "public/media",
    apply: false,
    allowClient: false,
    convertWebp: false,
    stripAudio: false,
    keepAudio: false,
    force: false,
    crf: 24,
    preset: "slow",
    maxVideoShortSide: 720,
    maxImageDim: 1920,
    webpQuality: 84,
    webpAlphaQuality: 92,
    jpegQuality: 82,
    audioBitrateKbps: 112,
    backupDir: path.resolve(ROOT, "..", "Undangan-Digital-Media-Backup"),
    preserveFiles: new Set(),
    reportJson: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") opts.apply = true;
    else if (a === "--dry-run") opts.apply = false;
    else if (a === "--allow-client") opts.allowClient = true;
    else if (a === "--convert-webp") opts.convertWebp = true;
    else if (a === "--strip-audio") opts.stripAudio = true;
    else if (a === "--keep-audio") opts.keepAudio = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--scope" && argv[i + 1]) opts.scope = argv[++i];
    else if (a === "--crf" && argv[i + 1]) opts.crf = Number(argv[++i]);
    else if (a === "--preset" && argv[i + 1]) opts.preset = argv[++i];
    else if (a === "--max-video-res" && argv[i + 1]) opts.maxVideoShortSide = Number(argv[++i]);
    else if (a === "--max-image-dim" && argv[i + 1]) opts.maxImageDim = Number(argv[++i]);
    else if (a === "--webp-quality" && argv[i + 1]) opts.webpQuality = Number(argv[++i]);
    else if (a === "--audio-bitrate" && argv[i + 1]) opts.audioBitrateKbps = Number(argv[++i]);
    else if (a === "--backup-dir" && argv[i + 1]) opts.backupDir = path.resolve(argv[++i]);
    else if (a === "--report-json" && argv[i + 1]) opts.reportJson = path.resolve(argv[++i]);
    else if (a === "--preserve-files" && argv[i + 1]) {
      for (const item of argv[++i].split(",")) {
        const clean = item.trim();
        if (clean) opts.preserveFiles.add(clean);
      }
    } else if (a === "--help" || a === "-h") {
      console.log(`Usage: node scripts/optimize-media.mjs [options]
  --scope <dir|file>         Target directory or file (default: public/media)
  --dry-run                  Analyze only, no file writes (default)
  --apply                    Execute optimization (requires verified backup)
  --allow-client             Allow processing public/media/client/ or public/media/invitations/
  --convert-webp             Convert oversized PNG/JPG to WebP (preserves alpha)
  --preserve-files a,b       Keep original file extension for comma-separated basenames (optimize in-place)
  --strip-audio              Strip audio track from muted opening/background videos
  --keep-audio               Force keep AAC audio on videos
  --crf <n>                  H.264 CRF quality (default: 24, recommended 23-26)
  --preset <name>            x264 preset (default: slow)
  --max-video-res <px>       Max short-side resolution for videos (default: 720; never upscales)
  --max-image-dim <px>       Max longest-side resolution for images (default: 1920; never upscales)
  --webp-quality <n>         WebP quality (default: 84)
  --audio-bitrate <kbps>     Target MP3 bitrate (default: 112)
  --backup-dir <path>        External backup directory outside repo
  --force                    Re-evaluate even if SHA-256 is in manifest
  --report-json <path>       Write detailed JSON report to path`);
      process.exit(0);
    }
  }
  return opts;
}

function findFfmpeg() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  // Check PATH
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return "ffmpeg";
  } catch {}
  // Check local npm-cache _npx ffmpeg-static on Windows/Unix
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
  let off = 0;
  let moov = -1;
  let mdat = -1;
  while (off + 8 <= buf.length) {
    let size = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    let hdr = 8;
    if (size === 1 && off + 16 <= buf.length) {
      size = Number(buf.readBigUInt64BE(off + 8));
      hdr = 16;
    } else if (size === 0) {
      size = buf.length - off;
    }
    if (size < hdr || off + size > buf.length) break;
    if (type === "moov" && moov === -1) moov = off;
    if (type === "mdat" && mdat === -1) mdat = off;
    off += size;
  }
  return moov !== -1 && mdat !== -1 ? moov < mdat : null;
}

function probeWithFfmpeg(ffmpegBin, filePath) {
  let stderr = "";
  try {
    execFileSync(ffmpegBin, ["-hide_banner", "-i", filePath], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    stderr = String(err.stderr || err.stdout || "");
  }
  const durMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const durationSec = durMatch
    ? Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3])
    : null;
  const brMatch = stderr.match(/bitrate:\s*(\d+)\s*kb\/s/);
  const totalBitrateKbps = brMatch ? Number(brMatch[1]) : null;

  const videoLine = stderr.split(/\r?\n/).find((l) => /Stream #\d+:\d+.*Video:/.test(l) && !/attached pic/i.test(l)) || null;
  const audioLine = stderr.split(/\r?\n/).find((l) => /Stream #\d+:\d+.*Audio:/.test(l)) || null;
  const hasAttachedPic = /Video:.*attached pic/i.test(stderr);

  let video = null;
  if (videoLine) {
    const codecMatch = videoLine.match(/Video:\s*([a-zA-Z0-9_]+)/);
    const pixMatch = videoLine.match(/\b(yuvj?420p|yuv422p|yuv444p|rgb24|nv12|gbrp)\b/);
    const resMatch = videoLine.match(/\b(\d{2,5})x(\d{2,5})\b/);
    const fpsMatch = videoLine.match(/(\d+(?:\.\d+)?)\s*fps/);
    const vbrMatch = videoLine.match(/(\d+)\s*kb\/s/);
    video = {
      codec: codecMatch ? codecMatch[1] : null,
      pixFmt: pixMatch ? pixMatch[1] : null,
      width: resMatch ? Number(resMatch[1]) : null,
      height: resMatch ? Number(resMatch[2]) : null,
      fps: fpsMatch ? Number(fpsMatch[1]) : null,
      bitrateKbps: vbrMatch ? Number(vbrMatch[1]) : null,
    };
  }

  let audio = null;
  if (audioLine) {
    const codecMatch = audioLine.match(/Audio:\s*([a-zA-Z0-9_]+)/);
    const srMatch = audioLine.match(/(\d+)\s*Hz/);
    const abrMatch = audioLine.match(/(\d+)\s*kb\/s/);
    audio = {
      codec: codecMatch ? codecMatch[1] : null,
      sampleRate: srMatch ? Number(srMatch[1]) : null,
      bitrateKbps: abrMatch ? Number(abrMatch[1]) : null,
    };
  }

  const ext = path.extname(filePath).toLowerCase();
  const faststart = ext === ".mp4" || ext === ".m4v" || ext === ".mov" ? checkMp4Faststart(filePath) : null;

  return { durationSec, totalBitrateKbps, faststart, video, audio, hasAttachedPic };
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return { version: 1, files: {} };
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    return { version: 1, files: {} };
  }
}

function saveManifest(manifest) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

function ensureExternalBackup(backupDir, relPath, srcFullPath) {
  // Refuse if backupDir is inside the repository
  const relBackup = path.relative(ROOT, backupDir);
  if (!relBackup.startsWith("..") && !path.isAbsolute(relBackup)) {
    throw new Error(`Backup dir MUST be outside repository! Got: ${backupDir}`);
  }
  const dest = path.join(backupDir, relPath);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(srcFullPath, dest);
  }
  const hSrc = sha256File(srcFullPath);
  const hBak = sha256File(dest);
  if (hSrc !== hBak) {
    // Only overwrite if original backup doesn't match and destination wasn't already an earlier backup
    throw new Error(`Backup checksum mismatch for ${relPath} (existing backup differs from current file — refusing to overwrite backup)`);
  }
  return { dest, sha256: hBak };
}

function walkTarget(targetPath, out = []) {
  const st = fs.statSync(targetPath);
  if (st.isFile()) {
    out.push(targetPath);
    return out;
  }
  for (const e of fs.readdirSync(targetPath, { withFileTypes: true })) {
    const full = path.join(targetPath, e.name);
    if (e.isDirectory()) walkTarget(full, out);
    else if (e.isFile()) out.push(full);
  }
  return out;
}

async function processVideo(filePath, relPath, opts, ffmpegBin) {
  const sizeBefore = fs.statSync(filePath).size;
  if (!ffmpegBin) {
    return { relPath, type: "video", status: "skipped_no_ffmpeg", sizeBefore, sizeAfter: sizeBefore };
  }
  const probe = probeWithFfmpeg(ffmpegBin, filePath);
  if (!probe.video) {
    // Audio-only MP4 (e.g. Bergema Selamanya.mp4)
    return { relPath, type: "audio_mp4", status: "skipped_optimal", reason: "Audio-only MP4", sizeBefore, sizeAfter: sizeBefore, probe };
  }

  const shortSide = Math.min(probe.video.width || 9999, probe.video.height || 9999);
  const needsResize = shortSide > opts.maxVideoShortSide;
  const needsPixFmt = probe.video.pixFmt !== "yuv420p";
  const needsFaststart = probe.faststart !== true;
  const needsBitrateCut = (probe.totalBitrateKbps || 0) > 3200 || sizeBefore > 5 * 1024 * 1024;
  const hasUnusedAudio = Boolean(probe.audio) && (opts.stripAudio || (probe.audio.bitrateKbps !== null && probe.audio.bitrateKbps <= 8));
  const needsFpsCap = (probe.video.fps || 30) > 30.5;

  if (!needsResize && !needsPixFmt && !needsFaststart && !needsBitrateCut && !hasUnusedAudio && !needsFpsCap) {
    return {
      relPath,
      type: "video",
      status: "skipped_optimal",
      reason: `${probe.video.width}x${probe.video.height} ${probe.video.codec} ${probe.video.pixFmt} ${probe.totalBitrateKbps}kbps faststart=true`,
      sizeBefore,
      sizeAfter: sizeBefore,
      probe,
    };
  }

  const reasons = [];
  if (needsResize) reasons.push(`resize ${probe.video.width}x${probe.video.height} -> short-side ${opts.maxVideoShortSide}px`);
  if (needsPixFmt) reasons.push(`pix_fmt ${probe.video.pixFmt} -> yuv420p`);
  if (needsFaststart) reasons.push("add +faststart");
  if (needsBitrateCut) reasons.push(`bitrate ${probe.totalBitrateKbps}kbps -> CRF ${opts.crf}`);
  if (hasUnusedAudio && !opts.keepAudio) reasons.push("strip unused audio");

  if (!opts.apply) {
    return {
      relPath,
      type: "video",
      status: "would_optimize",
      reasons,
      sizeBefore,
      sizeAfter: null,
      probe,
    };
  }

  // Stage to OS temp file
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "indif-media-"));
  const tmpOut = path.join(tmpDir, path.basename(filePath, path.extname(filePath)) + ".mp4");
  try {
    const args = ["-y", "-hide_banner", "-loglevel", "error", "-i", filePath];
    const remuxOnly = !needsResize && !needsPixFmt && !needsBitrateCut && !needsFpsCap;

    if (remuxOnly) {
      args.push("-c:v", "copy");
    } else {
      const vfParts = [];
      if (needsResize) {
        // Never upscale; keep even dimensions & exact orientation
        if ((probe.video.width || 0) <= (probe.video.height || 0)) {
          vfParts.push(`scale=${opts.maxVideoShortSide}:-2:flags=lanczos`);
        } else {
          vfParts.push(`scale=-2:${opts.maxVideoShortSide}:flags=lanczos`);
        }
      }
      if (vfParts.length) args.push("-vf", vfParts.join(","));
      if (needsFpsCap) args.push("-r", "30");
      args.push(
        "-c:v", "libx264",
        "-preset", opts.preset,
        "-crf", String(opts.crf),
        "-profile:v", "main",
        "-level:v", "3.1",
        "-pix_fmt", "yuv420p",
        "-color_primaries", "bt709",
        "-color_trc", "bt709",
        "-colorspace", "bt709",
      );
    }

    if (hasUnusedAudio && !opts.keepAudio) {
      args.push("-an");
    } else if (probe.audio) {
      args.push("-c:a", "aac", "-b:a", "128k");
    } else {
      args.push("-an");
    }

    args.push("-movflags", "+faststart", tmpOut);
    execFileSync(ffmpegBin, args, { stdio: "inherit" });

    // Validate output playability & specs
    const afterProbe = probeWithFfmpeg(ffmpegBin, tmpOut);
    const sizeAfter = fs.statSync(tmpOut).size;
    if (!afterProbe.video || afterProbe.video.codec !== "h264" || afterProbe.video.pixFmt !== "yuv420p") {
      throw new Error(`Invalid video output: ${JSON.stringify(afterProbe.video)}`);
    }
    if (afterProbe.faststart !== true) {
      throw new Error("Output MP4 failed +faststart validation");
    }
    if (probe.durationSec && afterProbe.durationSec && Math.abs(probe.durationSec - afterProbe.durationSec) > 0.25) {
      throw new Error(`Duration drift too large: before=${probe.durationSec}s after=${afterProbe.durationSec}s`);
    }
    // Verify ffmpeg can actually decode every frame cleanly
    execFileSync(ffmpegBin, ["-v", "error", "-i", tmpOut, "-f", "null", "-"], { stdio: "pipe" });

    if (sizeAfter >= sizeBefore && !needsFaststart && !needsPixFmt) {
      return { relPath, type: "video", status: "skipped_no_gain", sizeBefore, sizeAfter: sizeBefore, probe };
    }

    ensureExternalBackup(opts.backupDir, relPath, filePath);
    fs.copyFileSync(tmpOut, filePath);
    return {
      relPath,
      outputRelPath: relPath,
      type: "video",
      status: "optimized",
      reasons,
      sizeBefore,
      sizeAfter,
      savedBytes: sizeBefore - sizeAfter,
      probeBefore: probe,
      probeAfter: afterProbe,
      newSha256: sha256File(filePath),
    };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

async function processImage(filePath, relPath, opts) {
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath);
  const sizeBefore = fs.statSync(filePath).size;
  const meta = await sharp(filePath).metadata();

  // Never convert animated images to static
  if ((meta.pages || 1) > 1) {
    return { relPath, type: "image", status: "skipped_animated", sizeBefore, sizeAfter: sizeBefore };
  }

  const maxDim = Math.max(meta.width || 0, meta.height || 0);
  const needsResize = maxDim > opts.maxImageDim;
  const preserveExt = opts.preserveFiles.has(baseName) || !opts.convertWebp;
  const targetExt = (!preserveExt && (ext === ".png" || ext === ".jpg" || ext === ".jpeg")) ? ".webp" : ext;

  const isAlreadyOptimal =
    !needsResize &&
    targetExt === ext &&
    ((ext === ".webp" && sizeBefore < 350 * 1024) ||
      ((ext === ".jpg" || ext === ".jpeg") && sizeBefore < 200 * 1024) ||
      (ext === ".png" && sizeBefore < 100 * 1024));

  if (isAlreadyOptimal) {
    return { relPath, type: "image", status: "skipped_optimal", sizeBefore, sizeAfter: sizeBefore, width: meta.width, height: meta.height };
  }

  const reasons = [];
  if (needsResize) reasons.push(`resize ${meta.width}x${meta.height} -> max ${opts.maxImageDim}px`);
  if (targetExt !== ext) reasons.push(`convert ${ext} -> ${targetExt}`);
  else reasons.push(`optimize ${ext} in-place`);

  const outputRelPath = targetExt === ext
    ? relPath
    : relPath.slice(0, -ext.length) + targetExt;

  if (!opts.apply) {
    return {
      relPath,
      outputRelPath,
      type: "image",
      status: "would_optimize",
      reasons,
      sizeBefore,
      sizeAfter: null,
      width: meta.width,
      height: meta.height,
      hasAlpha: Boolean(meta.hasAlpha),
    };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "indif-img-"));
  const tmpOut = path.join(tmpDir, path.basename(outputRelPath));
  try {
    let pipeline = sharp(filePath).rotate();
    if (needsResize) {
      pipeline = pipeline.resize({ width: opts.maxImageDim, height: opts.maxImageDim, fit: "inside", withoutEnlargement: true });
    }
    if (targetExt === ".webp") {
      pipeline = pipeline.webp({
        quality: opts.webpQuality,
        alphaQuality: opts.webpAlphaQuality,
        effort: 6,
      });
    } else if (targetExt === ".png") {
      // High-quality quantized PNG preserving exact extension & alpha when needed
      pipeline = pipeline.png({
        compressionLevel: 9,
        palette: true,
        quality: 85,
        effort: 10,
      });
    } else {
      pipeline = pipeline.jpeg({ quality: opts.jpegQuality, mozjpeg: true });
    }

    await pipeline.toFile(tmpOut);
    const outMeta = await sharp(tmpOut).metadata();
    const sizeAfter = fs.statSync(tmpOut).size;

    if (!outMeta.width || !outMeta.height) {
      throw new Error("Invalid output image metadata");
    }
    if (meta.hasAlpha && !outMeta.hasAlpha && targetExt !== ".jpg" && targetExt !== ".jpeg") {
      throw new Error("Alpha channel unexpectedly lost");
    }
    if (sizeAfter >= sizeBefore * 0.95) {
      return { relPath, type: "image", status: "skipped_no_gain", sizeBefore, sizeAfter: sizeBefore };
    }

    ensureExternalBackup(opts.backupDir, relPath, filePath);
    const finalPath = path.join(ROOT, outputRelPath);
    fs.copyFileSync(tmpOut, finalPath);
    if (finalPath !== filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      relPath,
      outputRelPath,
      type: "image",
      status: "optimized",
      reasons,
      sizeBefore,
      sizeAfter,
      savedBytes: sizeBefore - sizeAfter,
      width: outMeta.width,
      height: outMeta.height,
      hasAlpha: Boolean(outMeta.hasAlpha),
      newSha256: sha256File(finalPath),
    };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

async function processAudio(filePath, relPath, opts, ffmpegBin) {
  const sizeBefore = fs.statSync(filePath).size;
  if (!ffmpegBin) {
    return { relPath, type: "audio", status: "skipped_no_ffmpeg", sizeBefore, sizeAfter: sizeBefore };
  }
  const probe = probeWithFfmpeg(ffmpegBin, filePath);
  const br = probe.audio?.bitrateKbps || probe.totalBitrateKbps || 0;
  const needsOptimize = br > opts.audioBitrateKbps + 16 || probe.hasAttachedPic;

  if (!needsOptimize) {
    return { relPath, type: "audio", status: "skipped_optimal", reason: `${br}kbps, no cover art`, sizeBefore, sizeAfter: sizeBefore };
  }

  const reasons = [];
  if (probe.hasAttachedPic) reasons.push("strip embedded cover art");
  if (br > opts.audioBitrateKbps + 16) reasons.push(`bitrate ${br}kbps -> ${opts.audioBitrateKbps}kbps`);

  if (!opts.apply) {
    return { relPath, type: "audio", status: "would_optimize", reasons, sizeBefore, sizeAfter: null, probe };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "indif-aud-"));
  const tmpOut = path.join(tmpDir, path.basename(filePath));
  try {
    const args = [
      "-y", "-hide_banner", "-loglevel", "error",
      "-i", filePath,
      "-map", "0:a:0", "-vn",
      "-c:a", "libmp3lame",
      "-b:a", `${opts.audioBitrateKbps}k`,
      "-ar", "44100",
      tmpOut,
    ];
    execFileSync(ffmpegBin, args, { stdio: "inherit" });
    const afterProbe = probeWithFfmpeg(ffmpegBin, tmpOut);
    const sizeAfter = fs.statSync(tmpOut).size;
    if (!afterProbe.audio) throw new Error("Invalid output audio stream");
    if (probe.durationSec && afterProbe.durationSec && Math.abs(probe.durationSec - afterProbe.durationSec) > 0.5) {
      throw new Error(`Audio duration drift: before=${probe.durationSec}s after=${afterProbe.durationSec}s`);
    }
    if (sizeAfter >= sizeBefore * 0.95) {
      return { relPath, type: "audio", status: "skipped_no_gain", sizeBefore, sizeAfter: sizeBefore };
    }
    ensureExternalBackup(opts.backupDir, relPath, filePath);
    fs.copyFileSync(tmpOut, filePath);
    return {
      relPath,
      outputRelPath: relPath,
      type: "audio",
      status: "optimized",
      reasons,
      sizeBefore,
      sizeAfter,
      savedBytes: sizeBefore - sizeAfter,
      probeBefore: probe,
      probeAfter: afterProbe,
      newSha256: sha256File(filePath),
    };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const targetAbs = path.resolve(ROOT, opts.scope);
  if (!fs.existsSync(targetAbs)) {
    console.error(`Scope not found: ${opts.scope}`);
    process.exit(1);
  }

  const ffmpegBin = findFfmpeg();
  const manifest = loadManifest();
  const files = walkTarget(targetAbs);
  const results = [];

  for (const full of files) {
    const rel = path.relative(ROOT, full).replace(/\\/g, "/");
    const ext = path.extname(full).toLowerCase();
    const isMedia = VIDEO_EXTS.has(ext) || IMAGE_EXTS.has(ext) || AUDIO_EXTS.has(ext);
    if (!isMedia) continue;

    // Client protection guard (PROJECT_RULES.md §9)
    if (!opts.allowClient && (rel.startsWith("public/media/client/") || rel.startsWith("public/media/invitations/"))) {
      results.push({ relPath: rel, type: "protected_client", status: "skipped_client_protected", sizeBefore: fs.statSync(full).size, sizeAfter: fs.statSync(full).size });
      continue;
    }

    const currentHash = sha256File(full);
    if (!opts.force && manifest.files[rel]?.sha256 === currentHash) {
      const sz = fs.statSync(full).size;
      results.push({ relPath: rel, type: manifest.files[rel].type, status: "skipped_manifest", sizeBefore: sz, sizeAfter: sz });
      continue;
    }

    let res;
    if (VIDEO_EXTS.has(ext)) res = await processVideo(full, rel, opts, ffmpegBin);
    else if (IMAGE_EXTS.has(ext)) res = await processImage(full, rel, opts);
    else if (AUDIO_EXTS.has(ext)) res = await processAudio(full, rel, opts, ffmpegBin);

    results.push(res);

    if (opts.apply && (res.status === "optimized" || res.status === "skipped_optimal" || res.status === "skipped_no_gain")) {
      const finalRel = res.outputRelPath || rel;
      if (finalRel !== rel) delete manifest.files[rel];
      manifest.files[finalRel] = {
        sha256: res.newSha256 || currentHash,
        type: res.type,
        sizeBytes: res.sizeAfter,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  if (opts.apply) {
    saveManifest(manifest);
  }

  const totalBefore = results.reduce((a, r) => a + (r.sizeBefore || 0), 0);
  const totalAfter = results.reduce((a, r) => a + (r.sizeAfter ?? r.sizeBefore ?? 0), 0);
  const totalSaved = totalBefore - totalAfter;
  const pct = totalBefore > 0 ? ((totalSaved / totalBefore) * 100).toFixed(1) : "0.0";

  console.log(`\n=== InDif Digital Media Optimizer (${opts.apply ? "APPLY" : "DRY-RUN"}) ===`);
  console.log(`Scope: ${opts.scope} | FFmpeg: ${ffmpegBin || "NOT FOUND"}`);
  console.log("-".repeat(96));
  for (const r of results) {
    const afterStr = r.sizeAfter != null ? fmt(r.sizeAfter) : "pending";
    const arrow = r.outputRelPath && r.outputRelPath !== r.relPath ? ` -> ${path.basename(r.outputRelPath)}` : "";
    const detail = r.reasons ? ` [${r.reasons.join("; ")}]` : r.reason ? ` (${r.reason})` : "";
    console.log(`${r.status.padEnd(22)} | ${fmt(r.sizeBefore).padStart(9)} -> ${afterStr.padStart(9)} | ${r.relPath}${arrow}${detail}`);
  }
  console.log("-".repeat(96));
  console.log(`Total scanned: ${results.length} files | Before: ${fmt(totalBefore)} | After: ${fmt(totalAfter)} | Saved: ${fmt(totalSaved)} (${pct}%)`);

  if (opts.reportJson) {
    fs.mkdirSync(path.dirname(opts.reportJson), { recursive: true });
    fs.writeFileSync(opts.reportJson, JSON.stringify({ mode: opts.apply ? "apply" : "dry-run", scope: opts.scope, totalBefore, totalAfter, totalSaved, pct: Number(pct), results }, null, 2));
  }
}

main().catch((err) => {
  console.error("Optimization failed:", err);
  process.exit(1);
});
