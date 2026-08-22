import { demoGreetings, demoInvitation, demoInvitations } from "@/lib/demo";
import { getSupabase } from "@/lib/supabase";
import type { Greeting, Invitation } from "@/lib/types";

const invitationSelect = `
  id, slug, status, bride_name, bride_short_name, bride_parents, bride_photo_path,
  groom_name, groom_short_name, groom_parents, groom_photo_path, event_date,
  ceremony_time, reception_time, venue_name, venue_address, maps_url,
  opening_text, quote_text, quote_source, story, story_image_path, cover_path, profile_path,
  gallery_paths, music_path, gift_info, theme_overrides, closing_text, closing_greeting,
  template:templates(id, slug, name, theme)
`;

export async function getInvitation(slug: string): Promise<Invitation | null> {
  const supabase = getSupabase();
  if (!supabase) return demoInvitations.find((invitation) => invitation.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("invitations")
    .select(invitationSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data as unknown as Invitation;
}

export async function getGreetings(invitationId: string): Promise<Greeting[]> {
  const supabase = getSupabase();
  if (!supabase) return invitationId === demoInvitation.id ? demoGreetings : [];

  const { data } = await supabase
    .from("greetings")
    .select("id, guest_name, message, attendance, created_at")
    .eq("invitation_id", invitationId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []) as Greeting[];
}
