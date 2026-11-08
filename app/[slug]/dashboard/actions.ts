"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDashboardCookieName, isDashboardToken } from "@/lib/client-dashboard-access";
import { MAX_SHARE_MESSAGE_LENGTH } from "@/lib/invitation-share-message";
import { createClient } from "@/lib/supabase/server";

const shareMessageSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  message: z.string().min(1).max(MAX_SHARE_MESSAGE_LENGTH).refine(value => value.trim().length > 0),
});

export async function saveInvitationShareMessage(slug: string, message: string) {
  const parsed = shareMessageSchema.safeParse({ slug, message });
  if (!parsed.success) return { success: false as const, error: "Isi pesan terlebih dahulu, maksimal 6.000 karakter." };

  const cookieStore = await cookies();
  const token = cookieStore.get(getDashboardCookieName(parsed.data.slug))?.value;
  if (!isDashboardToken(token)) return { success: false as const, error: "Akses dashboard belum aktif. Buka lagi link dashboard pribadi Anda." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_invitation_share_message", {
    target_slug: parsed.data.slug,
    dashboard_token: token,
    message_template: parsed.data.message,
  });
  if (error || data !== true) return { success: false as const, error: "Pesan belum tersimpan. Periksa akses dashboard dan coba lagi." };

  revalidatePath(`/${parsed.data.slug}/dashboard`, "layout");
  return { success: true as const, message: parsed.data.message };
}
