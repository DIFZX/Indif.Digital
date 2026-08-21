"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const expectedUsername = process.env.ADMIN_USERNAME;
  const adminEmail = process.env.ADMIN_AUTH_EMAIL;

  if (!username || !password) redirect("/admin/login?error=required");
  if (!expectedUsername || !adminEmail) redirect("/admin/login?error=unavailable");
  if (username.toLowerCase() !== expectedUsername.toLowerCase()) redirect("/admin/login?error=invalid");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: adminEmail, password });
  if (error || !data.user) redirect("/admin/login?error=invalid");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  redirect("/admin");
}
