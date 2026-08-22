import Image from "next/image";
import { Countdown } from "@/components/countdown";
import { FloatingNav } from "@/components/floating-nav";
import { Gallery } from "@/components/gallery";
import { GiftCard } from "@/components/gift-card";
import { Guestbook } from "@/components/guestbook";
import { InvitationExperience } from "@/components/invitation-experience";
import { Reveal } from "@/components/reveal";
import { PinkVibesInvitationView } from "@/components/templates/pink-vibes/pink-vibes-invitation";
import { BRAND } from "@/lib/brand";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";

type InvitationViewProps = {
  invitation: Invitation;
  greetings: Greeting[];
  guestName: string | null;
  initiallyOpened?: boolean;
};

const BRIDE_FLOWER_PATH = "/media/elegant/decor/flower-bride-right-v1.png";
const GROOM_FLOWER_PATH = "/media/elegant/decor/flower-groom-left-v1.png";
const ORNAMENT_PATH = "/media/elegant/decor/ornament-gold-v1.png";
const MAP_PIN_PATH = "/media/elegant/icons/map-pin-gold-v1.png";
const INTRO_BACKGROUND_PATH = "/media/elegant/backgrounds/couple-profile-forest-floral-v1.png";

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T12:00:00+07:00`));
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

function Wave({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`wave-divider ${flip ? "is-flipped" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none"><path d="M0,96L60,90.7C120,85,240,75,360,80C480,85,600,107,720,112C840,117,960,107,1080,90.7C1200,75,1320,53,1380,42.7L1440,32L1440,160L0,160Z" /></svg>
    </div>
  );
}

function BirdSilhouette({ className }: { className: string }) {
  return (
    <span className={`flock-bird ${className}`}>
      <svg viewBox="0 0 34 20" focusable="false">
        <path className="bird-wing bird-wing-left" d="M16 11.3C12.4 6.2 7.2 3.8 1.4 5.1c4.1 1.9 7.1 4.8 9.7 8.6Z" />
        <path className="bird-wing bird-wing-right" d="M17.3 11.3c3.6-5.1 8.8-7.5 14.6-6.2-4.1 1.9-7.1 4.8-9.7 8.6Z" />
        <path d="M10.8 12.1c3.7-2.3 8.3-2.3 12 0l-2.1 2.5h-7.8Z" />
        <circle cx="23.1" cy="11.1" r="1.45" />
        <path d="m10.9 13.2-4 2.3 5.5.2Z" />
      </svg>
    </span>
  );
}

function FlyingBirds() {
  return (
    <span className="flying-flock" aria-hidden="true">
      <BirdSilhouette className="flock-leader" />
      <BirdSilhouette className="flock-left" />
      <BirdSilhouette className="flock-right" />
    </span>
  );
}

function GreenyInvitationView({ invitation, greetings, guestName, initiallyOpened = false }: InvitationViewProps) {
  const theme = { ...invitation.template.theme, ...invitation.theme_overrides };
  const style = {
    "--primary": theme.primary ?? "#30493b",
    "--accent": theme.accent ?? "#b8915d",
    "--paper": theme.background ?? "#f5f1e8",
    "--intro-background-image": `url("${resolveMediaUrl(INTRO_BACKGROUND_PATH)}")`,
  } as React.CSSProperties;
  const coupleNames = `${invitation.bride_short_name} & ${invitation.groom_short_name}`;
  const coverPath = resolveMediaUrl(invitation.cover_path);
  const profilePath = resolveMediaUrl(invitation.profile_path ?? invitation.cover_path);
  const bridePhotoPath = resolveMediaUrl(invitation.bride_photo_path ?? invitation.cover_path);
  const groomPhotoPath = resolveMediaUrl(invitation.groom_photo_path ?? invitation.cover_path);
  const galleryPaths = invitation.gallery_paths.map((path) => resolveMediaUrl(path));
  const showcaseImages = galleryPaths.length > 0 ? galleryPaths : [coverPath];
  const storyImagePath = resolveMediaUrl(invitation.story_image_path) ?? showcaseImages[1] ?? coverPath;
  const musicPath = resolveMediaUrl(invitation.music_path);

  return (
    <InvitationExperience coupleNames={coupleNames} coverPath={coverPath} profilePath={profilePath} guestName={guestName} musicPath={musicPath} initiallyOpened={initiallyOpened}>
      <div className="invitation-layout" style={style}>
        <aside className="desktop-showcase" aria-label="Foto pasangan">
          <div className="showcase-slides">
            {showcaseImages.map((path, index) => (
              <div className="showcase-slide" key={path} style={{ animationDelay: `${index * 6}s` }}>
                <Image src={path} alt="" fill priority={index === 0} sizes="70vw" />
              </div>
            ))}
          </div>
          <div className="showcase-shade" />
          <div className="showcase-copy">
            <p>The Wedding of</p>
            <h2>{coupleNames}</h2>
            <span>{formatEventDate(invitation.event_date)}</span>
          </div>
          <small className="showcase-mark">{BRAND.name} · Digital Invitation</small>
        </aside>

        <div className="invitation-panel">
          <main className="invitation">
            <section className="hero" id="home">
              <Image className="hero-image" src={coverPath} alt={`Pernikahan ${coupleNames}`} fill priority sizes="(max-width: 900px) 100vw, 520px" />
              <div className="hero-shade" />
              <div className="hero-content">
                <span className="eyebrow light">Undangan Pernikahan</span>
                <div className="hero-medallion"><Image src={profilePath} alt="Foto pasangan" fill priority sizes="174px" /></div>
                <h1>{coupleNames}</h1>
                <p>{formatEventDate(invitation.event_date)}</p>
                <a className="calendar-link" href={calendarUrl(invitation)} target="_blank" rel="noreferrer">＋ Simpan ke Google Calendar</a>
                {guestName && <div className="guest-name"><small>Kepada Yth.</small><strong>{guestName}</strong></div>}
                <a className="scroll-cue" href="#mempelai" aria-label="Lihat isi undangan"><i /></a>
                <small className="scroll-label">Scroll down</small>
              </div>
            </section>

            <section className="section intro" id="mempelai">
              <FlyingBirds />
              <Reveal>
                <p className="arabic-mark">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                <p className="script greeting-script">Assalamualaikum Warahmatullahi Wabarakatuh</p>
                <p className="intro-copy">{invitation.opening_text}</p>
              </Reveal>

              <div className="couple-stack">
                <Reveal direction="right">
                  <article className="person-card bride-card">
                    <div className="person-photo-wrap">
                      <div className="person-photo"><Image src={bridePhotoPath} alt={invitation.bride_name} fill sizes="210px" /></div>
                      <Image className="person-flower bride-flower" src={resolveMediaUrl(BRIDE_FLOWER_PATH)} alt="" width={112} height={112} aria-hidden="true" />
                    </div>
                    <p className="eyebrow">The Bride</p>
                    <h2>{invitation.bride_name}</h2>
                    <small>{invitation.bride_parents}</small>
                  </article>
                </Reveal>
                <span className="ampersand">&</span>
                <Reveal direction="left">
                  <article className="person-card groom-card">
                    <div className="person-photo-wrap">
                      <div className="person-photo"><Image src={groomPhotoPath} alt={invitation.groom_name} fill sizes="210px" /></div>
                      <Image className="person-flower groom-flower" src={resolveMediaUrl(GROOM_FLOWER_PATH)} alt="" width={108} height={108} aria-hidden="true" />
                    </div>
                    <p className="eyebrow">The Groom</p>
                    <h2>{invitation.groom_name}</h2>
                    <small>{invitation.groom_parents}</small>
                  </article>
                </Reveal>
              </div>
            </section>

            <section className="quote-section">
              <Reveal>
                <Image
                  className="decorative-ornament quote-ornament"
                  src={resolveMediaUrl(ORNAMENT_PATH)}
                  alt=""
                  width={220}
                  height={110}
                  sizes="128px"
                  aria-hidden="true"
                />
                <p>“{invitation.quote_text}”</p>
                {invitation.quote_source && <cite>{invitation.quote_source}</cite>}
              </Reveal>
            </section>

            <section className="section story-section">
              <Reveal><p className="eyebrow">Kisah cinta</p><h2>Tumbuh dalam satu cerita</h2></Reveal>
              <Reveal direction="scale" delay={120}><div className="story-image"><Image src={storyImagePath} alt="Intan dan Difa berlari bersama di taman" fill sizes="(max-width: 900px) 100vw, 520px" /></div></Reveal>
              <div className="timeline">
                {invitation.story.map((item, index) => (
                  <Reveal key={`${item.year}-${item.title}`} direction={index % 2 ? "left" : "right"} delay={index * 80}>
                    <article><span>{item.year}</span><h3>{item.title}</h3><p>{item.text}</p></article>
                  </Reveal>
                ))}
              </div>
            </section>

            <Wave flip />

            <section className="section event-section" id="acara">
              <Reveal><p className="eyebrow light">Moment bahagia</p><h2>{formatEventDate(invitation.event_date)}</h2><Countdown eventDate={invitation.event_date} /></Reveal>
              <div className="event-grid">
                <Reveal direction="right"><article className="event-card"><span>Akad</span><strong>{invitation.ceremony_time}</strong></article></Reveal>
                <Reveal direction="left"><article className="event-card"><span>Resepsi</span><strong>{invitation.reception_time}</strong></article></Reveal>
              </div>
              <Reveal>
                <div className="venue-card">
                  <Image className="venue-map-pin" src={resolveMediaUrl(MAP_PIN_PATH)} alt="" width={64} height={64} sizes="64px" aria-hidden="true" />
                  <h3>{invitation.venue_name}</h3>
                  <p>{invitation.venue_address}</p>
                </div>
                {invitation.maps_url && <a className="button outline" href={invitation.maps_url} target="_blank" rel="noreferrer">Lihat Google Maps</a>}
              </Reveal>
            </section>

            <Wave />

            {galleryPaths.length > 0 && (
              <section className="section gallery-section" id="galeri">
                <Reveal><p className="eyebrow">Galeri</p><h2>Sepenggal kisah kami</h2></Reveal>
                <Reveal delay={100}><Gallery paths={galleryPaths} /></Reveal>
              </section>
            )}

            <Reveal className="reveal-feature"><GiftCard gift={invitation.gift_info} /></Reveal>
            <Reveal className="reveal-feature" direction="scale"><Guestbook invitationId={invitation.id} initialGreetings={greetings} /></Reveal>

            <footer>
              <Reveal>
                <Image
                  className="decorative-ornament footer-ornament"
                  src={resolveMediaUrl(ORNAMENT_PATH)}
                  alt=""
                  width={220}
                  height={110}
                  sizes="112px"
                  aria-hidden="true"
                />
                <div className="closing-message">
                  <p>{invitation.closing_text}</p>
                  {invitation.closing_greeting && <p className="closing-greeting">{invitation.closing_greeting}</p>}
                </div>
                <h2>{coupleNames}</h2>
                <div className="brand-signature" aria-label={`Dibuat oleh ${BRAND.name}`}>
                  <span>BY</span>
                  <Image
                    src={BRAND.logoPath}
                    alt={BRAND.name}
                    width={400}
                    height={150}
                    sizes="160px"
                  />
                </div>
              </Reveal>
            </footer>
          </main>
          <FloatingNav />
        </div>
      </div>
    </InvitationExperience>
  );
}

export function InvitationView(props: InvitationViewProps) {
  if (props.invitation.template.slug === "pink-vibes") {
    return <PinkVibesInvitationView {...props} />;
  }

  return <GreenyInvitationView {...props} />;
}
