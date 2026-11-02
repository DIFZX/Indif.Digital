import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

nextEnv.loadEnvConfig(process.cwd());

const username = process.env.ADMIN_SETUP_USERNAME || process.env.ADMIN_USERNAME;
const email = process.env.ADMIN_SETUP_EMAIL || process.env.ADMIN_AUTH_EMAIL;
const password = process.env.ADMIN_SETUP_PASSWORD;

if (!username || !/^[a-zA-Z0-9_.-]{3,40}$/.test(username) || !z.email().safeParse(email).success || !password || password.length < 16 || password.length > 256) {
  throw new Error("Isi username valid (3–40 karakter), email valid, dan ADMIN_SETUP_PASSWORD minimal 16 karakter.");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secretKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY wajib tersedia di server.");
const supabase = createClient(
  url,
  secretKey,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// Provision locally with the server secret; never expose a public signup form.
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error || !data.user) throw new Error("Akun gagal dibuat. Periksa email duplikat dan konfigurasi Supabase.");
const { error: profileError } = await supabase.from("admin_profiles").insert({ id: data.user.id, username, role: "sales" });
if (profileError) {
  const { error: rollbackError } = await supabase.auth.admin.deleteUser(data.user.id);
  throw new Error(rollbackError ? "Profil gagal dibuat dan rollback gagal. Periksa akun baru di Supabase Dashboard." : "Profil gagal dibuat. Akun baru sudah dibatalkan; periksa migrasi dan username duplikat.");
}
console.log("Akun admin penjualan berhasil dibuat. Password tidak disimpan oleh script.");
