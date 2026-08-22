import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { copyFile, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";

const { loadEnvConfig } = nextEnv;
const projectDir = process.cwd();
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function showHelp() {
  console.log([
    "",
    "Membuat undangan pelanggan baru dari undangan yang sudah ada.",
    "",
    "Pemakaian:",
    "  npm run create-invitation",
    "",
    "Perintah ini login sebagai admin, menyalin data undangan sumber,",
    "menyalin media lokal ke folder slug baru, lalu membuat data draft.",
    "",
  ].join("\n"));
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function readSecret(label) {
  const input = process.stdin;
  const output = process.stdout;

  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== "function") {
    throw new Error("Jalankan perintah dari terminal interaktif agar password tetap tersembunyi.");
  }

  output.write(label);

  return new Promise((resolve, reject) => {
    let value = "";
    const previousRawMode = input.isRaw;

    const cleanup = () => {
      input.off("data", onData);
      input.setRawMode(Boolean(previousRawMode));
      input.pause();
    };

    const onData = (buffer) => {
      const chunk = buffer.toString("utf8");

      if (chunk === "\u0003") {
        cleanup();
        output.write("\n");
        reject(new Error("Dibatalkan."));
        return;
      }

      if (chunk === "\r" || chunk === "\n") {
        cleanup();
        output.write("\n");
        resolve(value);
        return;
      }

      if (chunk === "\u0008" || chunk === "\u007f") {
        if (value.length > 0) {
          value = value.slice(0, -1);
          output.write("\b \b");
        }
        return;
      }

      const printable = [...chunk]
        .filter((character) => character >= " " && character !== "\u007f")
        .join("");
      if (!printable) return;

      value += printable;
      output.write("*".repeat([...printable].length));
    };

    input.resume();
    input.setRawMode(true);
    input.on("data", onData);
  });
}

async function ask(readline, label, options = {}) {
  const {
    defaultValue = "",
    optional = false,
    validate,
    normalize = (value) => value.trim(),
  } = options;

  while (true) {
    const suffix = defaultValue ? " [" + defaultValue + "]" : "";
    const answer = normalize(await readline.question(label + suffix + ": "));
    const value = answer || defaultValue;

    if (!value && !optional) {
      console.log("Nilai ini wajib diisi.");
      continue;
    }

    const validationMessage = validate?.(value);
    if (validationMessage) {
      console.log(validationMessage);
      continue;
    }

    return value;
  }
}

function localMediaPath(mediaPath) {
  if (typeof mediaPath !== "string" || !mediaPath.startsWith("/media/")) return null;
  return path.join(projectDir, "public", ...mediaPath.slice(1).split("/"));
}

function targetMediaPath(slug, relativePath) {
  return "/media/invitations/" + slug + "/" + relativePath.split(path.sep).join("/");
}

async function copyInvitationMedia(invitation, slug) {
  const mediaBase = path.resolve(projectDir, "public", "media", "invitations");
  const targetRoot = path.resolve(mediaBase, slug);
  const expectedPrefix = mediaBase + path.sep;

  if (!targetRoot.startsWith(expectedPrefix)) {
    throw new Error("Target media berada di luar folder invitations.");
  }

  if (await exists(targetRoot)) {
    throw new Error("Folder media sudah ada: " + path.relative(projectDir, targetRoot));
  }

  const result = { ...invitation };
  const copiedFiles = [];
  const warnings = [];

  const copyOne = async (sourceMediaPath, relativeStem) => {
    const sourcePath = localMediaPath(sourceMediaPath);
    if (!sourcePath || !(await exists(sourcePath))) {
      if (sourceMediaPath) {
        warnings.push("Media tidak ditemukan dan tetap memakai path lama: " + sourceMediaPath);
      }
      return sourceMediaPath;
    }

    const extension = path.extname(sourcePath).toLowerCase();
    const relativePath = relativeStem + extension;
    const destinationPath = path.join(targetRoot, relativePath);
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
    copiedFiles.push(path.relative(projectDir, destinationPath));
    return targetMediaPath(slug, relativePath);
  };

  try {
    result.cover_path = await copyOne(result.cover_path, path.join("cover", "cover"));
    result.profile_path = await copyOne(result.profile_path, path.join("profile", "profile"));
    result.bride_photo_path = await copyOne(
      result.bride_photo_path,
      path.join("members", "bride"),
    );
    result.groom_photo_path = await copyOne(
      result.groom_photo_path,
      path.join("members", "groom"),
    );
    result.story_image_path = await copyOne(
      result.story_image_path,
      path.join("story", "story"),
    );
    result.music_path = await copyOne(result.music_path, path.join("music", "background"));

    result.gallery_paths = [];
    for (const [index, galleryPath] of (invitation.gallery_paths ?? []).entries()) {
      const number = String(index + 1).padStart(2, "0");
      result.gallery_paths.push(
        await copyOne(galleryPath, path.join("gallery", "gallery-" + number)),
      );
    }

    return { invitation: result, targetRoot, copiedFiles, warnings };
  } catch (error) {
    if (targetRoot.startsWith(expectedPrefix)) {
      await rm(targetRoot, { recursive: true, force: true });
    }
    throw error;
  }
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showHelp();
    return;
  }

  loadEnvConfig(projectDir);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_AUTH_EMAIL;

  if (!supabaseUrl || !publishableKey || !adminEmail) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dan ADMIN_AUTH_EMAIL wajib tersedia di .env.local.",
    );
  }

  console.log("\nBuat undangan pelanggan baru — InDif Digital\n");
  const password = await readSecret("Password admin Supabase: ");
  if (!password) throw new Error("Password admin wajib diisi.");

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password,
  });

  if (authError || !authData.user) {
    throw new Error("Login admin gagal. Periksa password Supabase Auth.");
  }

  let readline;
  let createdMediaRoot;

  try {
    const { data: adminProfile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, username")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError || !adminProfile) {
      throw new Error("Akun ini bukan admin InDif Digital.");
    }

    console.log("Login berhasil sebagai " + adminProfile.username + ".\n");
    readline = createInterface({ input: process.stdin, output: process.stdout });

    const sourceSlug = await ask(readline, "Slug undangan sumber", {
      defaultValue: "intan-dan-difa",
    });
    const { data: source, error: sourceError } = await supabase
      .from("invitations")
      .select("*")
      .eq("slug", sourceSlug)
      .maybeSingle();

    if (sourceError || !source) {
      throw new Error('Undangan sumber "' + sourceSlug + '" tidak ditemukan.');
    }

    const slug = await ask(readline, "Slug pelanggan baru", {
      validate: (value) =>
        slugPattern.test(value)
          ? ""
          : "Gunakan huruf kecil, angka, dan tanda hubung; contoh: nanda-dan-raka.",
      normalize: (value) => value.trim().toLowerCase(),
    });

    if (slug === sourceSlug) throw new Error("Slug baru harus berbeda dari undangan sumber.");

    const { data: existingInvitation, error: existingError } = await supabase
      .from("invitations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingInvitation) throw new Error('Slug "' + slug + '" sudah digunakan.');

    const brideName = await ask(readline, "Nama lengkap mempelai wanita", {
      defaultValue: source.bride_name,
    });
    const brideShortName = await ask(readline, "Nama panggilan mempelai wanita", {
      defaultValue: brideName.split(/\s+/)[0],
    });
    const brideParents = await ask(readline, "Keterangan orang tua mempelai wanita", {
      defaultValue: source.bride_parents,
    });
    const groomName = await ask(readline, "Nama lengkap mempelai pria", {
      defaultValue: source.groom_name,
    });
    const groomShortName = await ask(readline, "Nama panggilan mempelai pria", {
      defaultValue: groomName.split(/\s+/)[0],
    });
    const groomParents = await ask(readline, "Keterangan orang tua mempelai pria", {
      defaultValue: source.groom_parents,
    });
    const eventDate = await ask(readline, "Tanggal acara (YYYY-MM-DD)", {
      defaultValue: source.event_date,
      validate: (value) =>
        isValidDate(value) ? "" : "Gunakan tanggal valid dengan format YYYY-MM-DD.",
    });
    const ceremonyTime = await ask(readline, "Waktu akad", {
      defaultValue: source.ceremony_time,
    });
    const receptionTime = await ask(readline, "Waktu resepsi", {
      defaultValue: source.reception_time,
    });
    const venueName = await ask(readline, "Nama lokasi", {
      defaultValue: source.venue_name,
    });
    const venueAddress = await ask(readline, "Alamat lokasi", {
      defaultValue: source.venue_address,
    });
    const mapsUrl = await ask(readline, "Link Google Maps", {
      defaultValue: source.maps_url ?? "",
      optional: true,
      validate: (value) =>
        !value || /^https:\/\//i.test(value) ? "" : "Link Maps harus diawali https://.",
    });

    console.log("\nRingkasan:");
    console.log("  Template sumber : " + sourceSlug);
    console.log("  URL baru         : /" + slug + "?to=Tamu%20Undangan");
    console.log("  Mempelai         : " + brideShortName + " & " + groomShortName);
    console.log("  Tanggal          : " + eventDate);
    console.log("  Lokasi           : " + venueName);
    console.log("  Status           : draft");
    console.log("  Media            : disalin ke folder pelanggan baru");

    const confirmation = await ask(readline, "Buat undangan ini? Ketik YA", {
      validate: (value) =>
        value === "YA" ? "" : "Ketik YA dengan huruf besar untuk melanjutkan.",
      normalize: (value) => value.trim(),
    });

    if (confirmation !== "YA") return;
    readline.close();
    readline = undefined;

    const {
      id: _sourceId,
      slug: _sourceSlug,
      status: _sourceStatus,
      created_at: _sourceCreatedAt,
      updated_at: _sourceUpdatedAt,
      ...clonedFields
    } = source;

    const baseInvitation = {
      ...clonedFields,
      slug,
      status: "draft",
      bride_name: brideName,
      bride_short_name: brideShortName,
      bride_parents: brideParents,
      groom_name: groomName,
      groom_short_name: groomShortName,
      groom_parents: groomParents,
      event_date: eventDate,
      ceremony_time: ceremonyTime,
      reception_time: receptionTime,
      venue_name: venueName,
      venue_address: venueAddress,
      maps_url: mapsUrl || null,
    };

    const mediaResult = await copyInvitationMedia(baseInvitation, slug);
    createdMediaRoot = mediaResult.targetRoot;

    const { data: createdInvitation, error: insertError } = await supabase
      .from("invitations")
      .insert(mediaResult.invitation)
      .select("id, slug, status")
      .single();

    if (insertError || !createdInvitation) {
      if (createdMediaRoot && (await exists(createdMediaRoot))) {
        await rm(createdMediaRoot, { recursive: true, force: true });
      }
      throw insertError ?? new Error("Undangan gagal dibuat.");
    }

    console.log("\nUndangan berhasil dibuat sebagai draft.");
    console.log("Folder media: " + path.relative(projectDir, createdMediaRoot));
    console.log("File tersalin: " + mediaResult.copiedFiles.length);
    for (const warning of mediaResult.warnings) console.warn("Peringatan: " + warning);
    console.log("\nLangkah berikutnya:");
    console.log("  1. Ganti file foto, galeri, dan musik di folder media pelanggan.");
    console.log("  2. Commit dan push perubahan media ke GitHub.");
    console.log("  3. Setelah deployment selesai, ubah status menjadi published di Supabase.");
  } finally {
    readline?.close();
    await supabase.auth.signOut();
  }
}

main().catch((error) => {
  console.error("\nGagal: " + (error?.message ?? error));
  process.exitCode = 1;
});
