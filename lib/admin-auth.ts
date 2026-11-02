import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminLoginConfiguration, hasFreshAdminSession } from "@/lib/admin-security";

export async function getAdmin() {
  if (!getAdminLoginConfiguration()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!(await hasFreshAdminSession(user.id))) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, username, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "sales") return null;
  return { supabase, user, profile };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
