import Image from "next/image";
import { Cormorant_Garamond, Great_Vibes, Montserrat } from "next/font/google";
import type { CSSProperties } from "react";
import { Countdown } from "@/components/countdown";
import { Gallery } from "@/components/gallery";
import { GiftCard } from "@/components/gift-card";
import { Guestbook } from "@/components/guestbook";
import { InvitationExperience } from "@/components/invitation-experience";
import { Reveal } from "@/components/reveal";
import { BRAND } from "@/lib/brand";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import { BlueOpeningHero } from "./blue-opening-hero";
import styles from "./blue-garden.module.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-blue-serif",
  display: "swap",
});

const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-blue-script",
  display: "swap",
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-blue-sans",
  display: "swap",
});

const PAPER_BACKGROUND_PATH = "/media/blue-garden/backgrounds/blue-garden-paper-v1.png";
const ORCHID_DECOR_PATH = "/media/blue-garden/decor/blue-orchid-gold-v1.png";
const HYDRANGEA_DECOR_PATH = "/media/blue-garden/decor/blue-hydrangea-ivory-v1.png";
const BLUE_IVORY_DECOR_PATH = "/media/blue-garden/decor/blue-ivory-bouquet-v1.png";
const IVORY_PEONY_DECOR_PATH = "/media/blue-garden/decor/ivory-peony-blue-v1.png";
const BLUE_ROSE_DECOR_PATH = "/media/blue-garden/decor/blue-rose-orchid-v1.png";
const MAP_PIN_PATH = "/media/elegant/icons/map-pin-gold-v1.png";
const OPENING_VIDEO_PATH = "/media/blue-garden/decor/Video-Opening.mp4";
const LIVE_STREAM_URL = "https://www.youtube.com/";

type BlueGardenInvitationProps = {
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

function DecorativeImage({
  className,
  src,
  sizes,
}: {
  className: string;
  src: string;
  sizes: string;
}) {
  return (
    <Image
      className={className}
      src={src}
      alt=""
      width={1254}
      height={1254}
      sizes={sizes}
      aria-hidden="true"
    />
  );
}

function BirdFlock() {
  return (
    <span className={styles.birdFlock} aria-hidden="true">
      {[0, 1, 2].map((bird) => (
        <span className={styles.bird} key={bird}>
          <svg viewBox="0 0 32 18" focusable="false">
            <path d="M1 10.2C6.5 3.8 11.7 4 16 8.9 20.3 4 25.5 3.8 31 10.2c-5.8-2.1-10.4-.6-15 3.3-4.6-3.9-9.2-5.4-15-3.3Z" />
          </svg>
        </span>
      ))}
    </span>
  );
}

export function BlueGardenInvitationView({
  invitation,
  greetings,
  guestName,
  initiallyOpened = false,
}: BlueGardenInvitationProps) {
  const theme = { ...invitation.template.theme, ...invitation.theme_overrides };
  const themeStyle = {
    "--primary": theme.primary ?? "#456482",
    "--accent": theme.accent ?? "#b89c7a",
    "--paper": theme.background ?? "#f7f3e9",
    "--blue-deep": theme.deep ?? "#304b66",
    "--blue-soft": theme.soft ?? "#d9e5ef",
    "--blue-paper-image": `url("${resolveMediaUrl(PAPER_BACKGROUND_PATH)}")`,
  } as CSSProperties;
  const coupleNames = `${invitation.bride_short_name} & ${invitation.groom_short_name}`;
  const coverPath = resolveMediaUrl(invitation.cover_path);
  const profilePath = resolveMediaUrl(invitation.profile_path ?? invitation.cover_path);
  const bridePhotoPath = resolveMediaUrl(invitation.bride_photo_path ?? invitation.cover_path);
  const groomPhotoPath = resolveMediaUrl(invitation.groom_photo_path ?? invitation.cover_path);
  const galleryPaths = invitation.gallery_paths.map((path) => resolveMediaUrl(path));
  const storyImagePath =
    resolveMediaUrl(invitation.story_image_path) ?? galleryPaths[0] ?? coverPath;
  const musicPath = resolveMediaUrl(invitation.music_path);
  const orchidDecorPath = resolveMediaUrl(ORCHID_DECOR_PATH);
  const hydrangeaDecorPath = resolveMediaUrl(HYDRANGEA_DECOR_PATH);
  const blueIvoryDecorPath = resolveMediaUrl(BLUE_IVORY_DECOR_PATH);
  const ivoryPeonyDecorPath = resolveMediaUrl(IVORY_PEONY_DECOR_PATH);
  const blueRoseDecorPath = resolveMediaUrl(BLUE_ROSE_DECOR_PATH);
  const mapPinPath = resolveMediaUrl(MAP_PIN_PATH);
  const openingVideoPath = resolveMediaUrl(OPENING_VIDEO_PATH);
  const showcaseImages = galleryPaths.length > 0 ? galleryPaths.slice(0, 4) : [coverPath];

  return (
    <InvitationExperience
      coupleNames={coupleNames}
      coverPath={coverPath}
      profilePath={profilePath}
      guestName={guestName}
      musicPath={musicPath}
      initiallyOpened={initiallyOpened}
      themeClassName={`${styles.experience} ${serif.variable} ${script.variable} ${sans.variable}`}
      themeStyle={themeStyle}
    >
      <div className={styles.layout}>
        <aside className={styles.showcase} aria-label="Foto pasangan">
          <div className={styles.showcaseSlides}>
            {showcaseImages.map((path, index) => (
              <div
                className={styles.showcaseSlide}
                key={`${path}-${index}`}
                style={{ "--slide-index": index } as CSSProperties}
              >
                <Image src={path} alt="" fill priority={index === 0} sizes="65vw" />
              </div>
            ))}
          </div>
          <div className={styles.showcaseShade} />
          <DecorativeImage
            className={styles.showcaseFlower}
            src={blueRoseDecorPath}
            sizes="min(38vw, 520px)"
          />
          <div className={styles.showcaseFrame}>
            <span>BG</span>
            <p>The Wedding of</p>
            <h2>{coupleNames}</h2>
            <i />
            <small>{formatEventDate(invitation.event_date)}</small>
          </div>
          <small className={styles.showcaseBrand}>{BRAND.name} · Digital Invitation</small>
        </aside>

        <div className={styles.panel}>
          <main className={styles.invitation}>
            <BlueOpeningHero
              videoPath={openingVideoPath}
              brideName={invitation.bride_short_name}
              groomName={invitation.groom_short_name}
              eventDateLabel={formatEventDate(invitation.event_date)}
              guestName={guestName}
            />

            <section className={styles.quoteSection} id="quote">
              <DecorativeImage
                className={styles.quoteFlower}
                src={orchidDecorPath}
                sizes="250px"
              />
              <Reveal direction="scale">
                <span className={styles.smallKicker}>Ar-Rum · 21</span>
                <p>“{invitation.quote_text}”</p>
                {invitation.quote_source && <cite>{invitation.quote_source}</cite>}
              </Reveal>
            </section>

            <section className={styles.coupleSection} id="mempelai">
              <DecorativeImage
                className={styles.coupleFlowerLeft}
                src={ivoryPeonyDecorPath}
                sizes="260px"
              />
              <DecorativeImage
                className={styles.coupleFlowerRight}
                src={blueIvoryDecorPath}
                sizes="260px"
              />
              <Reveal>
                <span className={styles.smallKicker}>With love</span>
                <p className={styles.scriptHeading}>Assalamualaikum Warahmatullahi Wabarakatuh</p>
                <p className={styles.openingCopy}>
                  Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i serta
                  kerabat sekalian untuk menghadiri acara pernikahan kami.
                </p>
              </Reveal>

              <div className={styles.coupleGrid}>
                <Reveal direction="left">
                  <article className={`${styles.personCard} ${styles.groomCard}`}>
                    <div className={styles.personDetails}>
                      <p className={styles.personRole}>The Groom</p>
                      <h2>{invitation.groom_name}</h2>
                      <p>{invitation.groom_parents}</p>
                    </div>
                    <div className={styles.portraitFrame}>
                      <div className={`${styles.portraitInset} ${styles.groomPortrait}`}>
                        <Image
                          src={groomPhotoPath}
                          alt={invitation.groom_name}
                          fill
                          sizes="210px"
                        />
                      </div>
                      <DecorativeImage
                        className={`${styles.personFlower} ${styles.groomFlower}`}
                        src={blueRoseDecorPath}
                        sizes="130px"
                      />
                    </div>
                  </article>
                </Reveal>

                <div className={styles.coupleDivider} aria-hidden="true">
                  <span className={styles.ampersand}>&</span>
                  <BirdFlock />
                </div>

                <Reveal direction="right">
                  <article className={`${styles.personCard} ${styles.brideCard}`}>
                    <div className={styles.portraitFrame}>
                      <div className={styles.portraitInset}>
                        <Image
                          src={bridePhotoPath}
                          alt={invitation.bride_name}
                          fill
                          sizes="210px"
                        />
                      </div>
                      <DecorativeImage
                        className={`${styles.personFlower} ${styles.brideFlower}`}
                        src={orchidDecorPath}
                        sizes="130px"
                      />
                    </div>
                    <div className={styles.personDetails}>
                      <p className={styles.personRole}>The Bride</p>
                      <h2>{invitation.bride_name}</h2>
                      <p>{invitation.bride_parents}</p>
                    </div>
                  </article>
                </Reveal>
              </div>
            </section>

            <section className={styles.dateSection} id="acara">
              <Image
                className={styles.dateBackground}
                src={coverPath}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 510px"
                aria-hidden="true"
              />
              <div className={styles.dateShade} aria-hidden="true" />
              <DecorativeImage
                className={styles.dateFlower}
                src={hydrangeaDecorPath}
                sizes="280px"
              />
              <Reveal>
                <span className={styles.lightKicker}>Save the date</span>
                <h2>{formatEventDate(invitation.event_date)}</h2>
                <Countdown eventDate={invitation.event_date} />
                <p className={styles.dateCopy}>
                  Dan kami bersyukur, dipertemukan Allah di waktu terbaik, Kini kami menanti
                  hari istimewa kami.
                </p>
                <a
                  className={styles.calendarButton}
                  href={calendarUrl(invitation)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Simpan ke Google Calendar
                </a>
              </Reveal>

              <Reveal direction="scale">
                <article className={styles.eventCard}>
                  <span className={styles.eventCardKicker}>Rangkaian acara</span>
                  <div className={styles.eventRows}>
                    <div>
                      <span>Akad Nikah</span>
                      <strong>{invitation.ceremony_time}</strong>
                    </div>
                    <div>
                      <span>Resepsi</span>
                      <strong>{invitation.reception_time}</strong>
                    </div>
                  </div>
                  <Image
                    className={styles.mapPin}
                    src={mapPinPath}
                    alt=""
                    width={64}
                    height={64}
                    sizes="64px"
                    aria-hidden="true"
                  />
                  <p>Lokasi acara</p>
                  <h3>{invitation.venue_name}</h3>
                  <address>{invitation.venue_address}</address>
                  {invitation.maps_url && (
                    <a href={invitation.maps_url} target="_blank" rel="noreferrer">
                      Lihat Google Maps
                    </a>
                  )}
                </article>
              </Reveal>
            </section>

            <section className={styles.storySection}>
              <DecorativeImage
                className={styles.storyFlower}
                src={blueIvoryDecorPath}
                sizes="250px"
              />
              <Reveal>
                <span className={styles.smallKicker}>Love story</span>
                <h2>Perjalanan cinta kami</h2>
              </Reveal>
              <Reveal direction="scale" delay={100}>
                <div className={styles.storyPhotoFrame}>
                  <Image
                    src={storyImagePath}
                    alt={`Kisah ${coupleNames}`}
                    fill
                    sizes="(max-width: 900px) 92vw, 470px"
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
                <DecorativeImage
                  className={styles.galleryFlower}
                  src={orchidDecorPath}
                  sizes="280px"
                />
                <Reveal>
                  <span className={styles.smallKicker}>Galeri foto</span>
                  <h2>Momen bahagia kami</h2>
                  <p>Kenangan indah yang akan selalu kami simpan dalam satu bingkai.</p>
                </Reveal>
                <Reveal delay={100}>
                  <Gallery paths={galleryPaths} lightboxClassName={styles.blueLightbox} />
                </Reveal>
              </section>
            )}

            <section className={styles.streamingSection}>
              <DecorativeImage
                className={styles.streamingFlower}
                src={ivoryPeonyDecorPath}
                sizes="220px"
              />
              <Reveal direction="scale">
                <span className={styles.lightKicker}>Live streaming</span>
                <h2>Saksikan hari bahagia kami</h2>
                <p>
                  Kami mengundang Bapak/Ibu/Saudara/i untuk menyaksikan pernikahan kami
                  secara virtual yang disiarkan langsung melalui media sosial di bawah ini.
                </p>
                <a href={LIVE_STREAM_URL} target="_blank" rel="noreferrer">
                  Saksikan di YouTube
                </a>
              </Reveal>
            </section>

            <section className={styles.giftWrapper}>
              <DecorativeImage
                className={styles.giftFlower}
                src={blueRoseDecorPath}
                sizes="260px"
              />
              <Reveal>
                <span className={styles.smallKicker}>Amplop digital</span>
                <h2>Tanda kasih</h2>
                <p>
                  Doa restu Anda merupakan karunia yang sangat berarti bagi kami, dan jika
                  memberi adalah ungkapan tanda kasih, Anda dapat memberi kado secara cashless.
                </p>
              </Reveal>
              <Reveal className={styles.giftFeature} direction="scale" delay={80}>
                <GiftCard gift={invitation.gift_info} />
              </Reveal>
            </section>

            <Reveal className={styles.guestFeature} direction="scale">
              <Guestbook invitationId={invitation.id} initialGreetings={greetings} />
            </Reveal>

            <footer className={styles.footer}>
              <DecorativeImage
                className={styles.footerFlower}
                src={blueIvoryDecorPath}
                sizes="290px"
              />
              <Reveal>
                <span className={styles.smallKicker}>Terima kasih</span>
                <p>{invitation.closing_text}</p>
                {invitation.closing_greeting && <strong>{invitation.closing_greeting}</strong>}
                <h2>{coupleNames}</h2>
                <div className={styles.brandSignature} aria-label={`Dibuat oleh ${BRAND.name}`}>
                  <span>BY</span>
                  <Image
                    src={BRAND.logoPath}
                    alt={BRAND.name}
                    width={400}
                    height={150}
                    sizes="150px"
                  />
                </div>
              </Reveal>
            </footer>
          </main>
        </div>
      </div>
    </InvitationExperience>
  );
}
