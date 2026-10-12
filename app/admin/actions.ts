"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function setTemplateVisibility(formData: FormData) {
  const templateId = formData.get("templateId");
  const nextState = formData.get("nextState");

  if (typeof templateId !== "string" || !UUID_PATTERN.test(templateId)) {
    redirect("/admin?error=template-invalid");
  }

  const isActive = nextState === "active";
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("templates")
    .update({ is_active: isActive })
    .eq("id", templateId);

  if (error) redirect("/admin?error=template-update");

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect(`/admin?status=${isActive ? "template-restored" : "template-removed"}`);
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
