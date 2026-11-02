"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { TEMPLATE_STATUSES } from "@/lib/template-status";
import { MAX_TEMPLATE_PRICE, TEMPLATE_CATEGORY_IDS } from "@/lib/catalog-settings";
import { clearAdminSession } from "@/lib/admin-security";

export type CatalogActionState = { error?: string; message?: string; success?: boolean };
const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

const priceSchema = z.string().regex(/^\d{1,10}$/).transform(Number).pipe(z.number().int().min(0).max(MAX_TEMPLATE_PRICE));
const settingsSchema = z.object({
  templateId: z.string().regex(UUID_PATTERN),
  updatedAt: z.string().min(1).max(64).refine((value) => Number.isFinite(Date.parse(value))),
  category: z.enum(TEMPLATE_CATEGORY_IDS),
  price: priceSchema,
  promoPrice: z.union([z.literal("").transform(() => null), priceSchema]),
  catalogStatus: z.enum(TEMPLATE_STATUSES),
  intent: z.enum(["save", "archive", "restore"]),
}).refine((value) => value.promoPrice === null || value.promoPrice <= value.price, {
  path: ["promoPrice"], message: "Harga promo tidak boleh melebihi harga normal.",
});

export async function saveTemplateSettings(_state: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse({
    templateId: formData.get("templateId"), updatedAt: formData.get("updatedAt"),
    category: formData.get("category"), price: formData.get("price"),
    promoPrice: formData.get("promoPrice"), catalogStatus: formData.get("catalogStatus"),
    intent: formData.get("intent"),
  });
  if (!parsed.success) {
    const priceError = parsed.error.issues.find((issue) => issue.path[0] === "promoPrice" && issue.code === "custom");
    return { error: priceError?.message ?? "Periksa kategori, status, dan harga. Gunakan angka rupiah antara 0 dan 1.000.000.000." };
  }
  const settings = parsed.data;
  const patch = {
    category: settings.category, price: settings.price, promo_price: settings.promoPrice,
    catalog_status: settings.catalogStatus,
    ...(settings.intent === "archive" ? { is_active: false } : settings.intent === "restore" ? { is_active: true } : {}),
  };
  const { data, error } = await supabase.from("templates").update(patch)
    .eq("id", settings.templateId).eq("updated_at", settings.updatedAt).select("id").maybeSingle();
  if (error) return { error: "Perubahan belum berhasil disimpan. Silakan coba kembali." };
  if (!data) {
    revalidatePath("/admin");
    return { error: "Template sudah diubah oleh admin lain. Tutup popup dan buka lagi sebelum menyimpan." };
  }
  revalidatePath("/admin");
  revalidatePath("/");
  const messages = { save: "Pengaturan template berhasil disimpan.", archive: "Template dihapus dari katalog penjualan.", restore: "Template dipulihkan ke katalog penjualan." };
  return { success: true, message: messages[settings.intent] };
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  await clearAdminSession();
  redirect("/admin/login");
}
