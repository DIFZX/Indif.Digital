import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  return { supabase, user, profile };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
