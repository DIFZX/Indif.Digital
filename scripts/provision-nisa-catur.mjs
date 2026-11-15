import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const publish = process.argv.includes("--publish");
const content = JSON.parse(await readFile("data/invitations/nisa-dan-catur.json", "utf8"));
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(key && process.env.NEXT_PUBLIC_SUPABASE_URL, "Konfigurasi Supabase server belum tersedia.");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const media = [...new Set([
  content.cover_path, content.profile_path, content.bride_photo_path,
  content.groom_photo_path, content.story_image_path, ...content.gallery_paths,
])];
for (const file of media) {
  assert.ok(file.startsWith("/media/client/Nisa & Catur/"), "Media harus berada di folder client.");
  await access(path.join(process.cwd(), "public", file));
  if (publish) {
    const response = await fetch(new URL(file, "https://inv.indifdigital.my.id"), {
      method: "HEAD", signal: AbortSignal.timeout(20_000),
    });
    assert.equal(response.status, 200, "Media belum tersedia pada domain undangan.");
    assert.ok(response.headers.get("content-type")?.startsWith("image/"));
  }
}

const { data: template, error: templateError } = await client.from("templates")
  .select("id").eq("slug", "mustard-black").single();
assert.equal(templateError, null);
const expected = { ...content, template_id: template.id };
const { data: existing, error: lookupError } = await client.from("invitations")
  .select("*").eq("slug", content.slug).maybeSingle();
assert.equal(lookupError, null);
let invitation = existing;
if (existing) {
  assert.deepEqual(Object.fromEntries(Object.keys(expected).map((field) => [field, existing[field]])), expected,
    "Data undangan sudah diubah. Hentikan agar perubahan client tidak tertimpa.");
} else {
  const result = await client.from("invitations").insert({ ...expected, status: "draft" }).select("*").single();
  assert.equal(result.error, null);
  invitation = result.data;
}
assert.ok(invitation?.id);

// Preserve the trigger-generated private key, including on repeat runs.
const { data: dashboard, error: dashboardError } = await client.from("invitation_dashboard_access")
  .select("access_token").eq("invitation_id", invitation.id).single();
assert.equal(dashboardError, null, "Dashboard pribadi belum tersedia; periksa migrasi dashboard.");
assert.ok(dashboard?.access_token);

if (publish && invitation.status === "draft") {
  const { error } = await client.from("invitations").update({ status: "published" })
    .eq("id", invitation.id).eq("status", "draft");
  assert.equal(error, null);
  invitation.status = "published";
}
assert.ok(["draft", "published"].includes(invitation.status));

const localDirectory = "scratch/nisa-catur";
await mkdir(localDirectory, { recursive: true });
await writeFile(`${localDirectory}/dashboard-access.txt`,
  `Dashboard pribadi Nisa & Catur. Hanya untuk pemilik undangan.\n\nhttps://inv.indifdigital.my.id/${content.slug}/dashboard/access?key=${encodeURIComponent(dashboard.access_token)}\n`,
  { mode: 0o600 });
console.log(JSON.stringify({ slug: content.slug, id: invitation.id, status: invitation.status,
  template: "mustard-black", mediaFiles: media.length, privateDashboardFile: `${localDirectory}/dashboard-access.txt`,
  existingInvitationsUnchanged: true }, null, 2));
