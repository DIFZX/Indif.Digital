import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());

const publish = process.argv.includes("--publish");
const domain = "https://inv.indifdigital.my.id";
const templateSlug = "java-vibes";
const content = JSON.parse(await readFile("data/invitations/sari-dan-andi.json", "utf8"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(url && key, "Konfigurasi Supabase server belum tersedia di .env.local.");

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1. Verify all client photos and music exist locally in public/
const media = [...new Set([
  content.cover_path,
  content.profile_path,
  content.bride_photo_path,
  content.groom_photo_path,
  content.story_image_path,
  ...(content.gallery_paths ?? []),
  content.music_path,
  content.theme_overrides?.opening_video_webm,
  content.theme_overrides?.opening_video_mp4,
  content.theme_overrides?.opening_poster_path,
].filter(Boolean))];

for (const file of media) {
  assert.ok(!file.split("/").includes(".."), `Path tidak valid: ${file}`);
  await access(path.join(process.cwd(), "public", file.replace(/^\/+/, "")));
}
assert.ok(content.gallery_paths.length === 4, "Galeri Sari & Andi harus memuat keempat foto.");

// 2. Look up java-vibes template ID
const { data: template, error: templateError } = await client
  .from("templates")
  .select("id, slug")
  .eq("slug", templateSlug)
  .single();
assert.ok(!templateError && template, `Template ${templateSlug} tidak tersedia di Supabase.`);

// 3. Provision isolated invitation row for Sari & Andi (never touches java-vibes demo row)
const expected = { ...content, template_id: template.id };
const { data: existing, error: lookupError } = await client
  .from("invitations")
  .select("*")
  .eq("slug", content.slug)
  .maybeSingle();
assert.equal(lookupError, null, "Gagal memeriksa slug undangan.");

let invitation = existing;
if (!existing) {
  const { data: created, error: insertError } = await client
    .from("invitations")
    .insert({ ...expected, status: publish ? "published" : "draft" })
    .select("*")
    .single();
  assert.equal(insertError, null, `Gagal membuat undangan ${content.slug}: ${insertError?.message}`);
  invitation = created;
} else {
  const { data: updated, error: updateError } = await client
    .from("invitations")
    .update({ ...expected, status: publish ? "published" : existing.status })
    .eq("id", existing.id)
    .select("*")
    .single();
  assert.equal(updateError, null, `Gagal memperbarui ${content.slug}: ${updateError?.message}`);
  invitation = updated;
}

assert.ok(invitation?.id, "ID undangan Sari & Andi tidak tersedia.");
assert.notEqual(invitation.slug, "java-vibes", "Slug client tidak boleh menimpa template demo java-vibes.");

// 4. Verify isolated private dashboard access token (auto-created by DB trigger or ensured here)
let { data: dashboard } = await client
  .from("invitation_dashboard_access")
  .select("access_token")
  .eq("invitation_id", invitation.id)
  .maybeSingle();

if (!dashboard?.access_token) {
  const { data: createdDash, error: dashError } = await client
    .from("invitation_dashboard_access")
    .insert({ invitation_id: invitation.id })
    .select("access_token")
    .single();
  assert.equal(dashError, null, `Gagal membuat token dashboard: ${dashError?.message}`);
  dashboard = createdDash;
}
assert.ok(dashboard?.access_token, "Token dashboard pribadi tidak tersedia.");

// 5. Confirm isolation from java-vibes demo invitation
const { data: demoInv } = await client
  .from("invitations")
  .select("id")
  .eq("slug", "java-vibes")
  .maybeSingle();
assert.ok(!demoInv || demoInv.id !== invitation.id, "ID undangan Sari & Andi harus terpisah dari demo java-vibes.");

const invitationUrl = `${domain}/${content.slug}?to=Tamu%20Undangan`;
const dashboardUrl = `${domain}/${content.slug}/dashboard/access?key=${encodeURIComponent(dashboard.access_token)}`;

const localDir = "scratch/sari-dan-andi";
await mkdir(localDir, { recursive: true });
await writeFile(
  `${localDir}/dashboard-access.txt`,
  `Undangan & Dashboard Pribadi Sari & Andi (Fransiska Novitasari & Andi Kurniawan)\n\nLink Undangan:\n${invitationUrl}\n\nLink Dashboard RSVP Pribadi (Rahasia untuk Pemilik Undangan):\n${dashboardUrl}\n`,
  { mode: 0o600 },
);

console.log(
  JSON.stringify(
    {
      slug: invitation.slug,
      invitationId: invitation.id,
      javaVibesDemoId: demoInv?.id ?? null,
      isolatedFromJavaVibes: !demoInv || demoInv.id !== invitation.id,
      status: invitation.status,
      invitationUrl,
      dashboardUrl,
      mediaFilesChecked: media.length,
    },
    null,
    2,
  ),
);
