import type { CSSProperties } from "react";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import { blueGardenV2BodyFont, blueGardenV2DisplayFont } from "./fonts";
import { BlueGardenV2ClientApp } from "./blue-garden-v2-client-app";

type BlueGardenV2InvitationProps = {
  invitation: Invitation;
  greetings: Greeting[];
  guestName: string | null;
  initiallyOpened?: boolean;
};

function calendarUrl(invitation: Invitation) {
  const start = (invitation.event_date || "2026-12-12").replaceAll("-", "");
  const endDate = new Date(`${invitation.event_date || "2026-12-12"}T12:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replaceAll("-", "");
  const startsAt = typeof invitation.theme_overrides?.ceremony_starts_at === "string"
    ? invitation.theme_overrides.ceremony_starts_at
    : null;
  const endsAt = typeof invitation.theme_overrides?.ceremony_ends_at === "string"
    ? invitation.theme_overrides.ceremony_ends_at
    : null;
  const formatStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d+/g, "");
  const dates = startsAt && endsAt ? `${formatStamp(startsAt)}/${formatStamp(endsAt)}` : `${start}/${end}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Pernikahan ${invitation.bride_short_name} & ${invitation.groom_short_name}`,
    dates,
    details: invitation.opening_text || "Undangan Pernikahan Digital",
    location: `${invitation.venue_name}, ${invitation.venue_address}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function BlueGardenV2InvitationView({
  invitation,
  greetings,
  guestName,
  initiallyOpened = false,
}: BlueGardenV2InvitationProps) {
  const coupleNames = `${invitation.bride_short_name} & ${invitation.groom_short_name}`;

  const coverPath = resolveMediaUrl(invitation.cover_path) || "/media/sunda-vibes/1.jpg";
  const bridePhotoPath = resolveMediaUrl(invitation.bride_photo_path) || "/media/sunda-vibes/The Bride.jpg";
  const groomPhotoPath = resolveMediaUrl(invitation.groom_photo_path) || "/media/sunda-vibes/The Groom.jpg";
  const storyImagePath = resolveMediaUrl(invitation.story_image_path) || "/media/sunda-vibes/5.jpg";

  const rawGallery =
    invitation.gallery_paths && invitation.gallery_paths.length > 0
      ? invitation.gallery_paths.map((path) => resolveMediaUrl(path))
      : [];
  const galleryPaths =
    rawGallery.length > 0
      ? rawGallery
      : [
          "/media/sunda-vibes/1.jpg",
          "/media/sunda-vibes/2.jpg",
          "/media/sunda-vibes/3.jpg",
          "/media/sunda-vibes/4.jpg",
          "/media/sunda-vibes/5.jpg",
        ];

  const musicPath = resolveMediaUrl(invitation.music_path) || "/media/elegant/Bergema Selamanya.mp4";
  const theme = { ...invitation.template.theme, ...invitation.theme_overrides };
  const themeStyle = {
    "--bgv2-navy": theme.deep || "#253D58",
    "--bgv2-primary": theme.primary || "#44688E",
    "--bgv2-gold": theme.accent || "#BE9B54",
    "--bgv2-paper": theme.background || "#F4F7FA",
  } as CSSProperties;

  return (
    <BlueGardenV2ClientApp
      invitation={invitation}
      greetings={greetings}
      guestName={guestName}
      initiallyOpened={initiallyOpened}
      coupleNames={coupleNames}
      coverPath={coverPath}
      bridePhotoPath={bridePhotoPath}
      groomPhotoPath={groomPhotoPath}
      galleryPaths={galleryPaths}
      storyImagePath={storyImagePath}
      musicPath={musicPath}
      calendarUrl={calendarUrl(invitation)}
      themeClassName={[blueGardenV2DisplayFont.variable, blueGardenV2BodyFont.variable].join(" ")}
      themeStyle={themeStyle}
    />
  );
}
