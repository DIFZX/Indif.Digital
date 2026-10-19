import {
  demoGreetings,
  demoInvitation,
  demoInvitations,
  javaVibesDemoGreetings,
  javaVibesDemoRSVPs,
} from "@/lib/demo";
import { getSupabase } from "@/lib/supabase";
import type { Greeting, GuestRSVP, Invitation } from "@/lib/types";

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

  if (error || !data) {
    return demoInvitations.find((invitation) => invitation.slug === slug) ?? null;
  }
  return data as unknown as Invitation;
}

export async function getGreetings(invitationId: string): Promise<Greeting[]> {
  const isJavaVibes = invitationId === "00000000-0000-0000-0000-000000000106";
  const supabase = getSupabase();
  if (!supabase) {
    if (isJavaVibes) return javaVibesDemoGreetings;
    const isDemo = demoInvitations.some((inv) => inv.id === invitationId);
    return isDemo ? demoGreetings : [];
  }

  const { data } = await supabase
    .from("greetings")
    .select("id, guest_name, message, attendance, created_at")
    .eq("invitation_id", invitationId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if ((!data || data.length === 0) && isJavaVibes) {
    return javaVibesDemoGreetings;
  }

  return (data ?? []) as Greeting[];
}


export async function getInvitationRSVPs(invitationId: string, slug?: string): Promise<GuestRSVP[]> {
  const isJavaVibes = slug === "java-vibes" || invitationId === "00000000-0000-0000-0000-000000000106";
  const supabase = getSupabase();

  if (!supabase) {
    if (isJavaVibes) return javaVibesDemoRSVPs;
    return [];
  }

  const { data: greetings } = await supabase
    .from("greetings")
    .select("id, guest_name, message, attendance, created_at")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("id, guest_name, attendance, guest_count, created_at")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  const greetingMap = new Map((greetings ?? []).map((g) => [g.guest_name?.trim().toLowerCase(), g]));
  const list: GuestRSVP[] = [];
  const processedNames = new Set<string>();

  if (rsvps && rsvps.length > 0) {
    for (const r of rsvps) {
      const key = r.guest_name?.trim().toLowerCase();
      processedNames.add(key);
      const matchedGreeting = greetingMap.get(key);
      list.push({
        id: r.id,
        invitation_id: invitationId,
        guest_name: r.guest_name,
        attendance: r.attendance || matchedGreeting?.attendance || "attending",
        guest_count: r.guest_count ?? (r.attendance === "not_attending" ? 0 : 1),
        message: matchedGreeting?.message || "",
        created_at: r.created_at,
      });
    }
  }

  if (greetings && greetings.length > 0) {
    for (const g of greetings) {
      const key = g.guest_name?.trim().toLowerCase();
      if (!processedNames.has(key)) {
        list.push({
          id: g.id,
          invitation_id: invitationId,
          guest_name: g.guest_name,
          attendance: (g.attendance as any) || "attending",
          guest_count: g.attendance === "not_attending" ? 0 : 1,
          message: g.message || "",
          created_at: g.created_at,
        });
      }
    }
  }

  if (list.length === 0 && isJavaVibes) {
    return javaVibesDemoRSVPs;
  }

  return list;
}

