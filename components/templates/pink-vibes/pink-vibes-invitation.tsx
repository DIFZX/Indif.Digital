import Image from "next/image";
import { Countdown } from "@/components/countdown";
import { Gallery } from "@/components/gallery";
import { GiftCard } from "@/components/gift-card";
import { Guestbook } from "@/components/guestbook";
import { InvitationExperience } from "@/components/invitation-experience";
import { Reveal } from "@/components/reveal";
import { BRAND } from "@/lib/brand";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import { PinkOpeningHero } from "./pink-opening-hero";
import styles from "./pink-vibes.module.css";

const OPENING_VIDEO_PATH = "/media/pink-vibes/decor/Video-Opening.mp4";
const FLORAL_SPRAY_PATH = "/media/pink-vibes/decor/floral-spray-blush-v1.png";
const FLORAL_CRESCENT_PATH = "/media/pink-vibes/decor/floral-crescent-blush-v1.png";
const FLORAL_CRESCENT_MIRRORED_PATH =
  "/media/pink-vibes/decor/floral-crescent-blush-mirrored-v1.png";

type PinkVibesInvitationProps = {
  invitation: Invitation;
  greetings: Greeting[];
  guestName: string | null;
  initiallyOpened?: boolean;
};

function formatEventDate(value: string) {
  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T12:00:00+07:00`));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

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

export function PinkVibesInvitationView({
  invitation,
  greetings,
  guestName,
  initiallyOpened = false,
}: PinkVibesInvitationProps) {
  const theme = { ...invitation.template.theme, ...invitation.theme_overrides };
  const themeStyle = {
    "--primary": theme.primary ?? "#6f334c",
    "--accent": theme.accent ?? "#d986a5",
    "--paper": theme.background ?? "#fff7f8",
    "--pink-deep": theme.deep ?? "#59283e",
    "--pink-soft": theme.soft ?? "#f2c4d2",
  } as React.CSSProperties;
  const coupleNames = `${invitation.bride_short_name} & ${invitation.groom_short_name}`;
  const coverPath = resolveMediaUrl(invitation.cover_path);
  const profilePath = resolveMediaUrl(invitation.profile_path ?? invitation.cover_path);
  const bridePhotoPath = resolveMediaUrl(invitation.bride_photo_path ?? invitation.cover_path);
  const groomPhotoPath = resolveMediaUrl(invitation.groom_photo_path ?? invitation.cover_path);
  const galleryPaths = invitation.gallery_paths.map((path) => resolveMediaUrl(path));
  const storyImagePath =
    resolveMediaUrl(invitation.story_image_path) ?? galleryPaths[0] ?? coverPath;
  const musicPath = resolveMediaUrl(invitation.music_path);
  const openingVideoPath = resolveMediaUrl(OPENING_VIDEO_PATH);
  const floralSprayPath = resolveMediaUrl(FLORAL_SPRAY_PATH);
  const floralCrescentPath = resolveMediaUrl(FLORAL_CRESCENT_PATH);
  const floralCrescentMirroredPath = resolveMediaUrl(FLORAL_CRESCENT_MIRRORED_PATH);
  const showcaseImages = [coverPath, ...galleryPaths].slice(0, 4);

  return (
    <InvitationExperience
      coupleNames={coupleNames}
      coverPath={coverPath}
      profilePath={profilePath}
      guestName={guestName}
      musicPath={musicPath}
      initiallyOpened={initiallyOpened}
      themeClassName={styles.experience}
      themeStyle={themeStyle}
    >
      <div className={styles.layout}>
        <aside className={styles.showcase} aria-label="Foto pasangan">
          <div className={styles.showcaseSlides}>
            {showcaseImages.map((path, index) => (
              <div
                className={styles.showcaseSlide}
                key={`${path}-${index}`}
                style={{ "--slide-index": index } as React.CSSProperties}
              >
                <Image
                  src={path}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="65vw"
                />
              </div>
            ))}
          </div>
          <div className={styles.showcaseShade} />
          <Image
            className={styles.showcaseFlowers}
            src={floralSprayPath}
            alt=""
            width={1224}
            height={1285}
            sizes="420px"
            aria-hidden="true"
          />
          <div className={styles.showcaseCopy}>
            <p>The Wedding of</p>
            <h2>{coupleNames}</h2>
            <span>{formatEventDate(invitation.event_date)}</span>
          </div>
          <small className={styles.showcaseBrand}>{BRAND.name} · Digital Invitation</small>
        </aside>

        <div className={styles.panel}>
          <main className={styles.invitation}>
            <PinkOpeningHero
              videoPath={openingVideoPath}
              posterPath={coverPath}
              brideName={invitation.bride_short_name}
              groomName={invitation.groom_short_name}
              eventDateLabel={formatEventDate(invitation.event_date)}
              guestName={guestName}
            />

            <section className={styles.verseSection}>
              <Reveal className={styles.decorReveal} direction="scale">
                <Image
                  className={styles.verseFlowers}
                  src={floralCrescentPath}
                  alt=""
                  width={1224}
                  height={1285}
                  sizes="360px"
                  aria-hidden="true"
                />
              </Reveal>
              <Reveal direction="scale">
                <span className={styles.sparkle} aria-hidden="true">✦</span>
                <p className={styles.verse}>“{invitation.quote_text}”</p>
                {invitation.quote_source && <cite>{invitation.quote_source}</cite>}
              </Reveal>
            </section>

            <section className={styles.coupleSection} id="mempelai">
              <Reveal>
                <p className={styles.arabic}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                <p className={styles.scriptHeading}>Assalamualaikum Warahmatullahi Wabarakatuh</p>
                <p className={styles.openingText}>{invitation.opening_text}</p>
                <span className={styles.sectionKicker}>Bride & Groom</span>
                <h2>Dengan cinta, kami mengundang Anda</h2>
              </Reveal>

              <div className={styles.coupleStack}>
                <Reveal direction="right">
                  <article className={styles.personCard}>
                    <div className={styles.portraitWrap}>
                      <div className={styles.portrait}>
                        <Image
                          src={bridePhotoPath}
                          alt={invitation.bride_name}
                          fill
                          sizes="230px"
                        />
                      </div>
                      <Image
                        className={styles.portraitFlowers}
                        src={floralCrescentPath}
                        alt=""
                        width={1224}
                        height={1285}
                        sizes="270px"
                        aria-hidden="true"
                      />
                    </div>
                    <p className={styles.personRole}>The Bride</p>
                    <h3>{invitation.bride_name}</h3>
                    <p>{invitation.bride_parents}</p>
                  </article>
                </Reveal>

                <span className={styles.ampersand} aria-hidden="true">&</span>

                <Reveal direction="left">
                  <article className={`${styles.personCard} ${styles.groomCard}`}>
                    <div className={styles.portraitWrap}>
                      <div className={styles.portrait}>
                        <Image
                          src={groomPhotoPath}
                          alt={invitation.groom_name}
                          fill
                          sizes="230px"
                        />
                      </div>
                      <Image
                        className={styles.portraitFlowers}
                        src={floralCrescentMirroredPath}
                        alt=""
                        width={1224}
                        height={1285}
                        sizes="270px"
                        aria-hidden="true"
                      />
                    </div>
                    <p className={styles.personRole}>The Groom</p>
                    <h3>{invitation.groom_name}</h3>
                    <p>{invitation.groom_parents}</p>
                  </article>
                </Reveal>
              </div>
            </section>

            <section className={styles.eventSection} id="acara">
              <Reveal>
                <p className={styles.lightKicker}>Save the date</p>
                <h2>{formatEventDate(invitation.event_date)}</h2>
                <Countdown eventDate={invitation.event_date} />
                <a
                  className={styles.calendarButton}
                  href={calendarUrl(invitation)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Simpan tanggal
                </a>
              </Reveal>

              <div className={styles.scheduleGrid}>
                <Reveal direction="right">
                  <article>
                    <span>Akad Nikah</span>
                    <strong>{invitation.ceremony_time}</strong>
                  </article>
                </Reveal>
                <Reveal direction="left">
                  <article>
                    <span>Resepsi</span>
                    <strong>{invitation.reception_time}</strong>
                  </article>
                </Reveal>
              </div>

              <Reveal direction="scale">
                <div className={styles.venueCard}>
                  <span className={styles.mapPin} aria-hidden="true">⌖</span>
                  <p>Lokasi acara</p>
                  <h3>{invitation.venue_name}</h3>
                  <address>{invitation.venue_address}</address>
                  {invitation.maps_url && (
                    <a href={invitation.maps_url} target="_blank" rel="noreferrer">
                      Buka Google Maps
                    </a>
                  )}
                </div>
              </Reveal>
            </section>

            <section className={styles.storySection}>
              <Reveal>
                <p className={styles.sectionKicker}>Love story</p>
                <h2>Cerita yang membawa kami ke sini</h2>
              </Reveal>
              <Reveal direction="scale" delay={120}>
                <div className={styles.storyImage}>
                  <Image
                    src={storyImagePath}
                    alt={`Kisah ${coupleNames}`}
                    fill
                    sizes="(max-width: 900px) 100vw, 500px"
                  />
                </div>
              </Reveal>
              <div className={styles.timeline}>
                {invitation.story.map((item, index) => (
                  <Reveal
                    key={`${item.year}-${item.title}`}
                    direction={index % 2 === 0 ? "right" : "left"}
                    delay={index * 90}
                  >
                    <article>
                      <span>{item.year}</span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>

            {galleryPaths.length > 0 && (
              <section className={styles.gallerySection} id="galeri">
                <Reveal className={styles.decorReveal} direction="right">
                  <Image
                    className={styles.galleryFlowers}
                    src={floralSprayPath}
                    alt=""
                    width={1224}
                    height={1285}
                    sizes="300px"
                    aria-hidden="true"
                  />
                </Reveal>
                <Reveal>
                  <p className={styles.sectionKicker}>Our moments</p>
                  <h2>Kenangan dalam bingkai</h2>
                </Reveal>
                <Reveal delay={120}>
                  <Gallery paths={galleryPaths} lightboxClassName={styles.pinkLightbox} />
                </Reveal>
              </section>
            )}

            <Reveal className={styles.featureReveal}>
              <GiftCard gift={invitation.gift_info} />
            </Reveal>

            <Reveal className={styles.featureReveal} direction="scale">
              <Guestbook invitationId={invitation.id} initialGreetings={greetings} />
            </Reveal>

            <footer className={styles.footer}>
              <Reveal className={styles.decorReveal} direction="left">
                <Image
                  className={styles.footerFlowers}
                  src={floralCrescentPath}
                  alt=""
                  width={1224}
                  height={1285}
                  sizes="420px"
                  aria-hidden="true"
                />
              </Reveal>
              <Reveal>
                <p className={styles.sectionKicker}>Terima kasih</p>
                <div className={styles.closingCopy}>
                  <p>{invitation.closing_text}</p>
                  {invitation.closing_greeting && <strong>{invitation.closing_greeting}</strong>}
                </div>
                <h2>{coupleNames}</h2>
                <div className={styles.brandSignature} aria-label={`Dibuat oleh ${BRAND.name}`}>
                  <span>BY</span>
                  <Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} sizes="150px" />
                </div>
              </Reveal>
            </footer>
          </main>
        </div>
      </div>
    </InvitationExperience>
  );
}
