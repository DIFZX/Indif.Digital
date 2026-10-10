import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import styles from "./java-vibes.module.css";
import { JavaVibesClientApp } from "./java-vibes-client-app";

type JavaVibesInvitationProps = {
  invitation: Invitation;
  greetings: Greeting[];
  guestName: string | null;
  initiallyOpened?: boolean;
};

function calendarUrl(invitation: Invitation) {
  const start = invitation.event_date.replaceAll("-", "");
  const endDate = new Date(`${invitation.event_date}T12:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replaceAll("-", "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Pernikahan ${invitation.bride_short_name} & ${invitation.groom_short_name}`,
    dates: `${start}/${end}`,
    details: invitation.opening_text,
    location: `${invitation.venue_name}, ${invitation.venue_address}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function JavaVibesInvitationView({
  invitation,
  greetings,
  guestName,
  initiallyOpened = false,
}: JavaVibesInvitationProps) {
  const coupleNames = `${invitation.bride_short_name} & ${invitation.groom_short_name}`;

  // Default to photos in /media/java-vibes/
  const coverPath = resolveMediaUrl(invitation.cover_path) || "/media/java-vibes/1.jpg";
  const profilePath = resolveMediaUrl(invitation.profile_path) || "/media/java-vibes/2.jpg";
  const bridePhotoPath = resolveMediaUrl(invitation.bride_photo_path) || "/media/java-vibes/2.jpg";
  const groomPhotoPath = resolveMediaUrl(invitation.groom_photo_path) || "/media/java-vibes/3.jpg";
  const storyImagePath = resolveMediaUrl(invitation.story_image_path) || "/media/java-vibes/4.jpg";

  const rawGallery =
    invitation.gallery_paths && invitation.gallery_paths.length > 0
      ? invitation.gallery_paths.map((path) => resolveMediaUrl(path))
      : [];
  const galleryPaths =
    rawGallery.length > 0
      ? rawGallery
      : [
          "/media/java-vibes/1.jpg",
          "/media/java-vibes/2.jpg",
          "/media/java-vibes/3.jpg",
          "/media/java-vibes/4.jpg",
          "/media/java-vibes/5.jpg",
        ];

  const musicPath = resolveMediaUrl(invitation.music_path) || "/media/elegant/Bergema Selamanya.mp4";

  return (
    <JavaVibesClientApp
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
      themeClassName={`${styles.experience}`}
    />
  );
}
