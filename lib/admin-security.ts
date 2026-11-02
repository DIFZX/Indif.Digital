import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { createClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { adminCookieOptions } from "@/lib/supabase/admin-cookie-options";

export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;
const SESSION_BOUNDARY_COOKIE = "indif-sales-session";

export async function startAdminSession(userId: string) {
  const config = getAdminLoginConfiguration();
  if (!config) throw new Error("Admin login is not configured");
  const startedAt = String(Date.now());
  const signature = createHmac("sha256", config.secretKey).update(`${userId}:${startedAt}`).digest("hex");
  const { name: _name, ...options } = adminCookieOptions;
  (await cookies()).set(SESSION_BOUNDARY_COOKIE, `${startedAt}.${signature}`, options);
}

export async function hasFreshAdminSession(userId: string) {
  const config = getAdminLoginConfiguration();
  if (!config) return false;
  const value = (await cookies()).get(SESSION_BOUNDARY_COOKIE)?.value ?? "";
  const parts = /^(\d{13})\.([a-f0-9]{64})$/.exec(value);
  if (!parts) return false;
  const age = Date.now() - Number(parts[1]);
  if (age < 0 || age >= ADMIN_SESSION_SECONDS * 1_000) return false;
  const expected = createHmac("sha256", config.secretKey).update(`${userId}:${parts[1]}`).digest();
  return timingSafeEqual(expected, Buffer.from(parts[2], "hex"));
}

export async function clearAdminSession() {
  (await cookies()).set(SESSION_BOUNDARY_COOKIE, "", { path: "/admin", maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
}

export function getAdminLoginConfiguration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!url || !anonKey || !secretKey || !siteKey) return null;
  // Cloudflare test widgets must never be usable on the production login.
  if (process.env.NODE_ENV === "production" && /^[123]x0{20}/.test(siteKey)) return null;
  return { url, anonKey, secretKey, siteKey };
}

function createAdminServiceClient(config: NonNullable<ReturnType<typeof getAdminLoginConfiguration>>) {
  return createClient(config.url, config.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(8_000), cache: "no-store" }) },
  });
}

type AdminLoginIdentity =
  | { status: "found"; userId: string; email: string }
  | { status: "not-found" | "unavailable" };

export async function resolveAdminLogin(username: string): Promise<AdminLoginIdentity> {
  const config = getAdminLoginConfiguration();
  if (!config) return { status: "unavailable" };
  try {
    const { data, error } = await createAdminServiceClient(config).rpc("resolve_sales_admin_login", { login_username: username });
    if (error || !Array.isArray(data) || data.length > 1) return { status: "unavailable" };
    if (data.length === 0) return { status: "not-found" };
    if (typeof data[0].user_id !== "string" || typeof data[0].email !== "string") return { status: "unavailable" };
    return { status: "found", userId: data[0].user_id, email: data[0].email };
  } catch {
    return { status: "unavailable" };
  }
}

export async function consumeAdminLoginAttempt() {
  const config = getAdminLoginConfiguration();
  if (!config) return "unavailable" as const;

  const requestHeaders = await headers();
  // Vercel overwrites this header. Never trust client-supplied X-Forwarded-For.
  const forwarded = process.env.VERCEL === "1" ? requestHeaders.get("x-vercel-forwarded-for")?.trim() : null;
  const ip = forwarded && isIP(forwarded) ? forwarded : "shared-untrusted-network";
  const ipHash = createHmac("sha256", config.secretKey).update(ip).digest("hex");
  const service = createAdminServiceClient(config);

  try {
    const { data, error } = await service.rpc("consume_admin_login_attempt", { ip_hash: ipHash });
    if (error || typeof data !== "boolean") return "unavailable" as const;
    return data ? "allowed" as const : "rate-limited" as const;
  } catch {
    return "unavailable" as const;
  }
}

export async function isAuthCaptchaEnforced() {
  const config = getAdminLoginConfiguration();
  if (!config) return false;
  // Fail closed if CAPTCHA was accidentally disabled in Supabase. No real
  // account or password is used, and the probe never creates a session.
  const probe = createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(8_000), cache: "no-store" }) },
  });
  try {
    const { error } = await probe.auth.signInWithPassword({
      email: `captcha-probe-${randomUUID()}@example.invalid`,
      password: randomUUID(),
      options: { captchaToken: "invalid-admin-captcha-probe" },
    });
    return error?.code === "captcha_failed";
  } catch {
    return false;
  }
}
