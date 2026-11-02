"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { isTemplateStatus } from "@/lib/template-status";
import { clearAdminSession } from "@/lib/admin-security";

export type CatalogActionState = { error?: string; message?: string };
const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function setTemplateStatus(_state: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  const { supabase } = await requireAdmin();
  const templateId = formData.get("templateId");
  const status = formData.get("status");
  if (typeof templateId !== "string" || !UUID_PATTERN.test(templateId) || !isTemplateStatus(status)) {
    return { error: "Template atau status tidak valid." };
  }
  const { data, error } = await supabase.from("templates")
    .update({ catalog_status: status }).eq("id", templateId).eq("is_active", true).select("id").maybeSingle();
  if (error || !data) return { error: "Status gagal disimpan. Muat ulang lalu coba kembali." };
  revalidatePath("/admin");
  revalidatePath("/");
  return { message: "Status template tersimpan." };
}

export async function setTemplateVisibility(_state: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  const { supabase } = await requireAdmin();
  const templateId = formData.get("templateId");
  const nextState = formData.get("nextState");

  if (typeof templateId !== "string" || !UUID_PATTERN.test(templateId) || (nextState !== "active" && nextState !== "hidden")) {
    return { error: "Template atau tindakan tidak valid." };
  }

  const isActive = nextState === "active";
  const { data, error } = await supabase
    .from("templates")
    .update({ is_active: isActive })
    .eq("id", templateId).eq("is_active", !isActive).select("id").maybeSingle();

  if (error || !data) return { error: "Katalog gagal diperbarui. Muat ulang lalu coba kembali." };

  revalidatePath("/admin");
  revalidatePath("/");
  return { message: isActive ? "Template dipulihkan ke katalog." : "Template dihapus dari katalog penjualan." };
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  await clearAdminSession();
  redirect("/admin/login");
}
