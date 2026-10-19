import {
  demoGreetings,
  demoInvitations,
  javaVibesDemoGreetings,
} from "@/lib/demo";
import { getSupabase } from "@/lib/supabase";
import type { Greeting, GuestRSVP, Invitation } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

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


type DashboardGreetingRow = {
  id: string;
  guest_name: string;
  message: string | null;
  attendance: GuestRSVP["attendance"] | null;
  created_at: string;
};

type DashboardRSVPRow = {
  id: string;
  guest_name: string;
  attendance: GuestRSVP["attendance"] | null;
  guest_count: number | null;
  created_at: string;
};

type DashboardPayload = {
  greetings: DashboardGreetingRow[];
  rsvps: DashboardRSVPRow[];
  view_count: number;
};

export async function getInvitationDashboardData(
  invitationId: string,
  dashboardToken: string,
  supabase: SupabaseClient,
): Promise<{ initialRSVPs: GuestRSVP[]; viewCount: number } | null> {
  const { data, error } = await supabase.rpc("get_invitation_dashboard_data", {
    target_invitation_id: invitationId,
    dashboard_token: dashboardToken,
  });

  if (error || !data || typeof data !== "object") return null;

  const payload = data as unknown as DashboardPayload;
  const greetings = Array.isArray(payload.greetings) ? payload.greetings : [];
  const rsvps = Array.isArray(payload.rsvps) ? payload.rsvps : [];
  const greetingMap = new Map(
    greetings.map((greeting) => [greeting.guest_name?.trim().toLowerCase(), greeting]),
  );
  const initialRSVPs: GuestRSVP[] = [];
  const processedNames = new Set<string>();

  for (const rsvp of rsvps) {
    const key = rsvp.guest_name?.trim().toLowerCase();
    if (!key) continue;

    processedNames.add(key);
    const matchedGreeting = greetingMap.get(key);
    initialRSVPs.push({
      id: rsvp.id,
      invitation_id: invitationId,
      guest_name: rsvp.guest_name,
      attendance: rsvp.attendance || matchedGreeting?.attendance || "attending",
      guest_count: rsvp.guest_count ?? (rsvp.attendance === "not_attending" ? 0 : 1),
      message: matchedGreeting?.message || "",
      created_at: rsvp.created_at,
    });
  }

  for (const greeting of greetings) {
    const key = greeting.guest_name?.trim().toLowerCase();
    if (!key || processedNames.has(key)) continue;

    initialRSVPs.push({
      id: greeting.id,
      invitation_id: invitationId,
      guest_name: greeting.guest_name,
      attendance:
        greeting.attendance === "not_attending" || greeting.attendance === "unsure"
          ? greeting.attendance
          : "attending",
      guest_count: greeting.attendance === "not_attending" ? 0 : 1,
      message: greeting.message || "",
      created_at: greeting.created_at,
    });
  }

  const parsedViewCount = Number(payload.view_count);
  return {
    initialRSVPs,
    viewCount: Number.isFinite(parsedViewCount) ? parsedViewCount : 0,
  };
}

