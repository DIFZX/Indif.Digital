import nextEnv from "@next/env";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "ADMIN_USERNAME", "ADMIN_AUTH_EMAIL", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"];
const missing = required.filter((key) => !process.env[key]);
if (!(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) missing.push("SUPABASE_SECRET_KEY");
if (missing.length) {
  console.error(`CMS belum siap. Environment belum diisi: ${missing.join(", ")}`);
  process.exit(1);
}
const options = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(8_000) }) },
};
const publicClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
const secretClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const checks = await Promise.all([
  publicClient.from("templates").select("id, catalog_status").limit(1),
  secretClient.from("admin_profiles").select("id, role").eq("username", process.env.ADMIN_USERNAME).eq("role", "sales").maybeSingle(),
  publicClient.auth.signInWithPassword({ email: `captcha-probe-${randomUUID()}@example.invalid`, password: randomUUID(), options: { captchaToken: "invalid-admin-captcha-probe" } }),
  secretClient.from("admin_login_limits").select("bucket").limit(0),
]);
const results = [
  ["Migrasi katalog", !checks[0].error],
  ["Profil admin penjualan", !checks[1].error && Boolean(checks[1].data)],
  ["Supabase menolak CAPTCHA palsu", checks[2].error?.code === "captcha_failed"],
  ["Tabel pembatas login", !checks[3].error],
  ["Site key produksi", !/^[123]x0{20}/.test(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)],
];
for (const [label, passed] of results) console.log(`${passed ? "OK" : "BELUM SIAP"}: ${label}`);
if (results.some(([, passed]) => !passed)) process.exitCode = 1;
