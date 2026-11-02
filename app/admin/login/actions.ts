"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { consumeAdminLoginAttempt, getAdminLoginConfiguration, isAuthCaptchaEnforced, startAdminSession } from "@/lib/admin-security";

const loginSchema = z.object({
  username: z.string().trim().min(3).max(40),
  password: z.string().min(1).max(256),
  captchaToken: z.string().min(1).max(2048),
});

export async function loginAdmin(formData: FormData) {
  const config = getAdminLoginConfiguration();
  if (!config) redirect("/admin/login?error=unavailable");
  const attempt = await consumeAdminLoginAttempt();
  if (attempt !== "allowed") redirect(`/admin/login?error=${attempt}`);

  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    captchaToken: formData.get("captchaToken"),
  });
  if (!parsed.success) redirect("/admin/login?error=invalid");
  if (!(await isAuthCaptchaEnforced())) redirect("/admin/login?error=unavailable");
  const { username, password, captchaToken } = parsed.data;

  const supabase = await createClient();
  // Both unknown usernames and wrong passwords follow the provider's CAPTCHA
  // verification and use the same error response (no username enumeration).
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username.toLowerCase() === config.username.toLowerCase() ? config.email : "invalid-admin@example.invalid",
    password,
    options: { captchaToken },
  });
  if (error || !data.user) redirect("/admin/login?error=invalid");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, username, role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "sales" || profile.username.toLowerCase() !== config.username.toLowerCase()) {
    await supabase.auth.signOut({ scope: "local" });
    redirect("/admin/login?error=invalid");
  }

  await startAdminSession(data.user.id);
  redirect("/admin");
}
