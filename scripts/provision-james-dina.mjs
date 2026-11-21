import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const publish = process.argv.includes("--publish");
const check = process.argv.includes("--check");
const domain = "https://inv.indifdigital.my.id";
const templateSlug = "greeny-flowers";
const content = JSON.parse(await readFile("data/invitations/james-dan-dina.json", "utf8"));
const prefix = `/media/invitations/${content.slug}/`;
const media = new Set([
  content.cover_path, content.profile_path, content.bride_photo_path, content.groom_photo_path,
  content.story_image_path, ...content.gallery_paths, content.music_path,
].filter(Boolean));

for (const file of media) {
  assert.ok(file.startsWith(prefix) && !file.split("/").includes(".."), "Path media di luar folder klien.");
  await access(resolve("public", file.slice(1))).catch(() => {
    throw new Error(`Media James & Dina belum tersedia: ${file}`);
  });
}
assert.ok(content.gallery_paths.length > 0, "Galeri James & Dina belum diisi.");

if (check) {
  console.log(`${media.size} file media siap.`);
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(url && key, "Konfigurasi Supabase untuk provisioning belum tersedia.");
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

if (publish) {
  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim() || domain;
  for (const file of media) {
    const remoteUrl = new URL(file.slice(1), `${mediaBase.replace(/\/+$/, "")}/`);
    const response = await fetch(remoteUrl, { method: "HEAD", signal: AbortSignal.timeout(20_000) });
    const mediaType = file.endsWith(".mp3") ? "audio/" : "image/";
    assert.ok(response.ok && response.headers.get("content-type")?.startsWith(mediaType),
      `Media belum tersedia di deployment: ${file}`);
  }
}

const { data: template, error: templateError } = await client.from("templates")
  .select("id").eq("slug", templateSlug).single();
assert.ok(!templateError && template, `Template ${templateSlug} tidak tersedia di proyek Supabase.`);
const expected = { ...content, template_id: template.id };

let { data: invitation, error } = await client.from("invitations").select("*").eq("slug", content.slug).maybeSingle();
assert.ok(!error, "Gagal memeriksa slug undangan.");
if (invitation) {
  assert.deepEqual(Object.fromEntries(Object.keys(expected).map((field) => [field, invitation[field]])), expected,
    "Slug sudah berisi data berbeda. Perubahan dihentikan agar data yang ada tetap aman.");
} else {
  ({ data: invitation, error } = await client.from("invitations")
    .insert({ ...expected, status: "draft" }).select("*").single());
  assert.ok(!error && invitation, "Gagal membuat draft. Periksa izin provisioning dan ketersediaan slug.");
}
assert.ok(["draft", "published"].includes(invitation.status), "Undangan berstatus arsip.");

const { data: dashboard, error: dashboardError } = await client.from("invitation_dashboard_access")
  .select("access_token").eq("invitation_id", invitation.id).single();
assert.ok(!dashboardError && dashboard?.access_token, "Token dashboard tidak tersedia. Periksa migrasi akses dashboard.");

if (publish && invitation.status === "draft") {
  const result = await client.from("invitations").update({ status: "published" })
    .eq("id", invitation.id).eq("status", "draft").eq("updated_at", invitation.updated_at)
    .select("status").single();
  assert.ok(!result.error && result.data, "Gagal publish atau draft berubah selama pemeriksaan.");
  invitation.status = result.data.status;
}

const privateDirectory = "scratch/james-dan-dina";
const privateLinkFile = `${privateDirectory}/dashboard-access.txt`;
await mkdir(privateDirectory, { recursive: true, mode: 0o700 });
await writeFile(privateLinkFile,
  `${domain}/${content.slug}/dashboard/access?key=${encodeURIComponent(dashboard.access_token)}\n`,
  { mode: 0o600 });
console.log(JSON.stringify({ slug: content.slug, status: invitation.status, privateLinkFile }));
