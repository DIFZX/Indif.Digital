import type { Invitation } from "@/lib/types";

type Couple = Pick<Invitation, "bride_name" | "groom_name" | "bride_short_name" | "groom_short_name">
  & Partial<Pick<Invitation, "theme_overrides">>;

export function formatCoupleNames(invitation: Couple, full = false) {
  const bride = full ? invitation.bride_name?.replace(/\s*\n\s*/g, " ") : invitation.bride_short_name;
  const groom = full ? invitation.groom_name?.replace(/\s*\n\s*/g, " ") : invitation.groom_short_name;
  return invitation.theme_overrides?.name_order === "groom-first" ? `${groom} & ${bride}` : `${bride} & ${groom}`;
}

export function getCeremonyStartsAt(invitation: Invitation) {
  return readTimestamp(invitation.theme_overrides.ceremony_starts_at) ?? `${invitation.event_date}T08:00:00+07:00`;
}

function readTimestamp(value: string | undefined) {
  return value && Number.isFinite(Date.parse(value)) ? value : undefined;
}

export function getInvitationEvents(invitation: Invitation, defaultCeremonyLabel = "Akad") {
  const options = invitation.theme_overrides;
  return [
    {
      id: "ceremony",
      label: options.ceremony_label ?? defaultCeremonyLabel,
      time: invitation.ceremony_time,
      venue: invitation.venue_name,
      address: invitation.venue_address,
      mapsUrl: invitation.maps_url,
      startsAt: readTimestamp(options.ceremony_starts_at),
      endsAt: readTimestamp(options.ceremony_ends_at),
    },
    {
      id: "reception",
      label: "Resepsi",
      time: invitation.reception_time,
      venue: options.reception_venue_name ?? invitation.venue_name,
      address: options.reception_venue_address ?? invitation.venue_address,
      mapsUrl: options.reception_venue_name ? options.reception_maps_url : invitation.maps_url,
      startsAt: readTimestamp(options.reception_starts_at),
      endsAt: readTimestamp(options.reception_ends_at),
    },
  ] as const;
}
