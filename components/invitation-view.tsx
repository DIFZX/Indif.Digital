import Image from "next/image";
import { Fragment } from "react";
import { Countdown } from "@/components/countdown";
import { FloatingNav } from "@/components/floating-nav";
import { Gallery } from "@/components/gallery";
import { GiftCard } from "@/components/gift-card";
import { Guestbook } from "@/components/guestbook";
import { InvitationExperience } from "@/components/invitation-experience";
import { Reveal } from "@/components/reveal";
import { BlueGardenInvitationView } from "@/components/templates/blue-garden/blue-garden-invitation";
import { PinkVibesInvitationView } from "@/components/templates/pink-vibes/pink-vibes-invitation";
import { NetflixInvitationView } from "@/components/templates/netflix/netflix-invitation";
import { MustardBlackInvitationView } from "@/components/templates/mustard-black/mustard-black-invitation";
import { JavaVibesInvitationView } from "@/components/templates/java-vibes/java-vibes-invitation";
import { SundaVibesInvitationView } from "@/components/templates/sunda-vibes/sunda-vibes-invitation";
import { RoyalMaroonInvitationView } from "@/components/templates/royal-maroon/royal-maroon-invitation";
import { BlushRoseInvitationView } from "@/components/templates/blush-rose/blush-rose-invitation";
import { AdventureWeddingPixelInvitation } from "@/components/templates/adventure-wedding-pixel/adventure-wedding-pixel-invitation";
import { BRAND } from "@/lib/brand";
import { formatCoupleNames, getInvitationEvents } from "@/lib/invitation-display";
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

function calendarUrl(invitation: Invitation, event: ReturnType<typeof getInvitationEvents>[number]) {
  const start = invitation.event_date.replaceAll("-", "");
  const endDate = new Date(`${invitation.event_date}T12:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replaceAll("-", "");
  const timed = event.startsAt && event.endsAt;
  const calendarTimestamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d+/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${timed ? event.label : "Pernikahan"} ${formatCoupleNames(invitation)}`,
    dates: timed ? `${calendarTimestamp(event.startsAt)}/${calendarTimestamp(event.endsAt)}` : `${start}/${end}`,
    details: invitation.opening_text,
    location: `${event.venue}, ${event.address}`,
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
  const coupleNames = formatCoupleNames(invitation);
  const coverPath = resolveMediaUrl(invitation.cover_path);
  const profilePath = resolveMediaUrl(invitation.profile_path ?? invitation.cover_path);
  const bridePhotoPath = resolveMediaUrl(invitation.bride_photo_path ?? invitation.cover_path);
  const groomPhotoPath = resolveMediaUrl(invitation.groom_photo_path ?? invitation.cover_path);
  const galleryPaths = invitation.gallery_paths.map((path) => resolveMediaUrl(path));
  const showcaseImages = galleryPaths.length > 0 ? galleryPaths : [coverPath];
  const storyImagePath = resolveMediaUrl(invitation.story_image_path) ?? showcaseImages[1] ?? coverPath;
  const musicPath = resolveMediaUrl(invitation.music_path);
  const events = getInvitationEvents(invitation);
  const independentVenues = Boolean(invitation.theme_overrides.reception_venue_name);
  const namesOnly = invitation.theme_overrides.portrait_layout === "names-only";
  const scheduleCards = independentVenues && invitation.theme_overrides.event_layout === "cards";
  const openingMark = theme.opening_mark ?? "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ";
  const greeting = theme.opening_greeting ?? "Assalamualaikum Warahmatullahi Wabarakatuh";
  const people = [
    { role: "bride", label: "The Bride", name: invitation.bride_name, parents: invitation.bride_parents, photo: bridePhotoPath, flower: BRIDE_FLOWER_PATH, flowerSize: 112 },
    { role: "groom", label: "The Groom", name: invitation.groom_name, parents: invitation.groom_parents, photo: groomPhotoPath, flower: GROOM_FLOWER_PATH, flowerSize: 108 },
  ];
  if (invitation.theme_overrides.name_order === "groom-first") people.reverse();

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
                {!scheduleCards && <a className="calendar-link" href={calendarUrl(invitation, events[0])} target="_blank" rel="noreferrer">＋ Simpan ke Google Calendar</a>}
                {guestName && <div className="guest-name"><small>Kepada Yth.</small><strong>{guestName}</strong></div>}
                <a className="scroll-cue" href="#mempelai" aria-label="Lihat isi undangan"><i /></a>
                <small className="scroll-label">Scroll down</small>
              </div>
            </section>

            <section className="section intro" id="mempelai">
              <FlyingBirds />
              <Reveal>
                {openingMark && <p className="arabic-mark">{openingMark}</p>}
                {greeting && <p className="script greeting-script">{greeting}</p>}
                <p className="intro-copy">{invitation.opening_text}</p>
              </Reveal>

              <div className={namesOnly ? "couple-stack couple-stack--names" : "couple-stack"}>
                {people.map((person, index) => (
                  <Fragment key={person.role}>
                    {index > 0 && <span className="ampersand">&</span>}
                    <Reveal direction={index ? "left" : "right"}>
                      <article className={`person-card ${person.role}-card`}>
                        {!namesOnly && <div className="person-photo-wrap">
                          <div className="person-photo"><Image src={person.photo} alt={person.name} fill sizes="210px" /></div>
                          <Image className={`person-flower ${person.role}-flower`} src={resolveMediaUrl(person.flower)} alt="" width={person.flowerSize} height={person.flowerSize} aria-hidden="true" />
                        </div>}
                        {!namesOnly && <p className="eyebrow">{person.label}</p>}
                        <h2>{person.name}</h2>
                        <small>{person.parents}</small>
                      </article>
                    </Reveal>
                  </Fragment>
                ))}
              </div>
            </section>

            {invitation.quote_text && <section className="quote-section">
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
            </section>}

            {invitation.story.length > 0 && <section className="section story-section">
              <Reveal><p className="eyebrow">Kisah cinta</p><h2>Tumbuh dalam satu cerita</h2></Reveal>
              <Reveal direction="scale" delay={120}><div className="story-image"><Image src={storyImagePath} alt={`Foto ${coupleNames}`} fill sizes="(max-width: 900px) 100vw, 520px" /></div></Reveal>
              <div className="timeline">
                {invitation.story.map((item, index) => (
                  <Reveal key={`${item.year}-${item.title}`} direction={index % 2 ? "left" : "right"} delay={index * 80}>
                    <article><span>{item.year}</span><h3>{item.title}</h3><p>{item.text}</p></article>
                  </Reveal>
                ))}
              </div>
            </section>}

            <Wave flip />

            <section className={scheduleCards ? "section event-section event-section--cards" : "section event-section"} id="acara">
              <Reveal>
                <p className="eyebrow light">{scheduleCards ? "Jadwal Pernikahan" : "Moment bahagia"}</p>
                <h2>{formatEventDate(invitation.event_date)}</h2>
                <Countdown eventDate={invitation.event_date} startsAt={events[0].startsAt} locale={scheduleCards ? "id" : "en"} />
              </Reveal>
              <div className={`event-grid${independentVenues ? " event-grid-with-venues" : ""}`}>
                {events.map((event, index) => (
                  <Reveal key={event.id} direction={index ? "left" : "right"}>
                    <article className="event-card">
                      {scheduleCards ? <h3>{event.label}</h3> : <span>{event.label}</span>}
                      <strong>{event.time}</strong>
                      {independentVenues && (
                        <div className="venue-card">
                          {scheduleCards ? <h4>{event.venue}</h4> : <h3>{event.venue}</h3>}
                          <p>{event.address}</p>
                          <div className={scheduleCards ? "event-actions" : undefined}>
                            {event.mapsUrl && <a className="button outline" href={event.mapsUrl} target="_blank" rel="noreferrer" aria-label={`Lihat Google Maps untuk ${event.label}`}>Lihat Google Maps</a>}
                            {event.startsAt && event.endsAt && <a className="calendar-link" href={calendarUrl(invitation, event)} target="_blank" rel="noreferrer" aria-label={`Simpan ${event.label} ke Google Calendar`}>{scheduleCards ? "Simpan Kalender" : "Simpan ke Google Calendar"}</a>}
                          </div>
                        </div>
                      )}
                    </article>
                  </Reveal>
                ))}
              </div>
              {!independentVenues && <Reveal>
                <div className="venue-card">
                  <Image className="venue-map-pin" src={resolveMediaUrl(MAP_PIN_PATH)} alt="" width={64} height={64} sizes="64px" aria-hidden="true" />
                  <h3>{invitation.venue_name}</h3>
                  <p>{invitation.venue_address}</p>
                </div>
                {invitation.maps_url && <a className="button outline" href={invitation.maps_url} target="_blank" rel="noreferrer">Lihat Google Maps</a>}
              </Reveal>}
            </section>

            <Wave />

            {galleryPaths.length > 0 && (
              <section className="section gallery-section" id="galeri">
                <Reveal><p className="eyebrow">Galeri</p><h2>Sepenggal kisah kami</h2></Reveal>
                <Reveal delay={100}><Gallery paths={galleryPaths} featuredTop={invitation.theme_overrides.gallery_layout === "featured-top"} /></Reveal>
              </section>
            )}

            {invitation.gift_info?.account_number && <Reveal className="reveal-feature"><GiftCard gift={invitation.gift_info} /></Reveal>}
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
          <FloatingNav hasGallery={galleryPaths.length > 0} />
        </div>
      </div>
    </InvitationExperience>
  );
}

export function InvitationView(props: InvitationViewProps) {
  if (props.invitation.template.slug === "adventure-wedding-pixel") {
    return <AdventureWeddingPixelInvitation {...props} />;
  }

  if (props.invitation.template.slug === "blush-rose") {
    return <BlushRoseInvitationView {...props} />;
  }

  if (props.invitation.template.slug === "royal-maroon") {
    return <RoyalMaroonInvitationView {...props} />;
  }

  if (props.invitation.template.slug === "blue-garden") {
    return <BlueGardenInvitationView {...props} />;
  }

  if (props.invitation.template.slug === "pink-vibes") {
    return <PinkVibesInvitationView {...props} />;
  }

  if (props.invitation.template.slug === "netflix") {
    return <NetflixInvitationView {...props} />;
  }

  if (props.invitation.template.slug === "mustard-black") {
    return <MustardBlackInvitationView {...props} />;
  }

  if (props.invitation.template.slug === "java-vibes") {
    return <JavaVibesInvitationView {...props} />;
  }

  if (props.invitation.template.slug === "sunda-vibes") {
    return <SundaVibesInvitationView {...props} />;
  }

  return <GreenyInvitationView {...props} />;
}
