import type { CSSProperties } from "react";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import { jadeBodyFont, jadeDisplayFont } from "./fonts";
import { JadePavilionClientApp } from "./jade-pavilion-client-app";

type JadePavilionInvitationProps = {
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
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Pernikahan ${invitation.bride_short_name} & ${invitation.groom_short_name}`,
    dates: `${start}/${end}`,
    details: invitation.opening_text || "Undangan Pernikahan Digital",
    location: `${invitation.venue_name}, ${invitation.venue_address}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function JadePavilionInvitationView({
  invitation,
  greetings,
  guestName,
  initiallyOpened = false,
}: JadePavilionInvitationProps) {
  const coupleNames = `${invitation.bride_short_name} & ${invitation.groom_short_name}`;

  const coverPath = resolveMediaUrl(invitation.cover_path) || "/media/sunda-vibes/1.jpg";
  const profilePath = resolveMediaUrl(invitation.profile_path) || "/media/sunda-vibes/2.jpg";
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
    "--jp-primary": theme.primary || "#2e4a3e",
    "--jp-gold": theme.accent || "#a98f5c",
    "--jp-paper": theme.background || "#f7f6f1",
  } as CSSProperties;

  return (
    <JadePavilionClientApp
      invitation={invitation}
      greetings={greetings}
      guestName={guestName}
      initiallyOpened={initiallyOpened}
      coupleNames={coupleNames}
      coverPath={coverPath}
      profilePath={profilePath}
      bridePhotoPath={bridePhotoPath}
      groomPhotoPath={groomPhotoPath}
      galleryPaths={galleryPaths}
      storyImagePath={storyImagePath}
      musicPath={musicPath}
      calendarUrl={calendarUrl(invitation)}
      themeClassName={[jadeDisplayFont.variable, jadeBodyFont.variable].join(" ")}
      themeStyle={themeStyle}
    />
  );
}
