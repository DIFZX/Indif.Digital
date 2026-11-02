import Image from "next/image";
import type { CSSProperties } from "react";
import { Gallery } from "@/components/gallery";
import { Reveal } from "@/components/reveal";
import { BRAND } from "@/lib/brand";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import { Monogram, RoyalMaroonCountdown, RoyalMaroonExperience, RoyalMaroonGift, RoyalMaroonGuestbook } from "./royal-maroon-interactions";
import styles from "./royal-maroon.module.css";

type Props = { invitation: Invitation; greetings: Greeting[]; guestName: string | null; initiallyOpened?: boolean };

function calendarUrl(invitation: Invitation) {
  const start = invitation.event_date.replaceAll("-", "");
  const endDate = new Date(`${invitation.event_date}T12:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const params = new URLSearchParams({ action: "TEMPLATE", text: `Pernikahan ${invitation.bride_short_name} & ${invitation.groom_short_name}`, dates: `${start}/${endDate.toISOString().slice(0, 10).replaceAll("-", "")}`, details: invitation.opening_text, location: `${invitation.venue_name}, ${invitation.venue_address}` });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function RoyalMaroonInvitationView({ invitation, greetings, guestName, initiallyOpened = false }: Props) {
  const bride = invitation.bride_short_name;
  const groom = invitation.groom_short_name;
  const coupleNames = `${bride} & ${groom}`;
  const date = new Date(`${invitation.event_date}T12:00:00+07:00`);
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { ...options, timeZone: "Asia/Jakarta" }).format(date);
  const dateLabel = format({ day: "2-digit", month: "2-digit", year: "numeric" }).replaceAll("/", ". ");
  const longDate = format({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const cover = resolveMediaUrl(invitation.cover_path);
  const profile = resolveMediaUrl(invitation.profile_path) || cover;
  const theme = { ...invitation.template.theme, ...invitation.theme_overrides };
  const themeStyle = { "--rm-primary": theme.primary || "#7c2527", "--rm-paper": theme.background || "#fff0e5", "--rm-accent": theme.accent || "#ceb172" } as CSSProperties;
  const people = [
    { label: "The Bride", short: bride, name: invitation.bride_name, parents: invitation.bride_parents, photo: resolveMediaUrl(invitation.bride_photo_path) || profile },
    { label: "The Groom", short: groom, name: invitation.groom_name, parents: invitation.groom_parents, photo: resolveMediaUrl(invitation.groom_photo_path) || profile },
  ];

  return <RoyalMaroonExperience bride={bride} groom={groom} guestName={guestName} musicPath={resolveMediaUrl(invitation.music_path)} initiallyOpened={initiallyOpened} themeStyle={themeStyle}>
    <div className={styles.layout}>
      <aside className={styles.showcase} aria-label={`Pernikahan ${coupleNames}`}>
        <Image src={cover} alt={`Foto ${coupleNames}`} fill sizes="(min-width: 901px) 65vw, 1px" priority />
        <div className={styles.showcaseShade} />
        <div className={styles.showcaseCopy}><p className={styles.weddingLabel}>The Wedding Of</p><h2>{coupleNames}</h2><p>{longDate}</p></div>
        <small className={styles.showcaseBrand}>{BRAND.name} · Digital Invitation</small>
      </aside>
      <main className={styles.panel}>
        <section className={styles.hero} id="pembuka">
          <video className={styles.heroVideo} data-royal-opening src="/media/royal-maroon/Royal Maroon - Web 720p Compressed.mp4" poster="/media/royal-maroon/hero.webp" muted playsInline preload="auto" tabIndex={-1} aria-hidden="true" />
          <div className={styles.heroContent}><p className={styles.weddingLabel}>The Wedding Of</p><h2><span>{bride}</span><span className={styles.heroAmpersand}>&amp;</span><span>{groom}</span></h2><p className={styles.heroDate}>{dateLabel}</p><a className={styles.scrollCue} href="#with-love"><span aria-hidden="true">↓</span><small>Scroll untuk membuka cerita</small></a></div>
        </section>
        <section className={`${styles.section} ${styles.quote}`} id="with-love">
          <Reveal><div className={styles.quotePortrait}><Image src={profile} alt={`Potret ${coupleNames}`} fill sizes="180px" /></div><p className={styles.eyebrow}>With Love</p><blockquote><p>“{invitation.quote_text}”</p>{invitation.quote_source && <cite>{invitation.quote_source}</cite>}</blockquote></Reveal>
        </section>
        <section className={`${styles.section} ${styles.couple}`} id="mempelai">
          <Reveal className={styles.introCard}><h2>Bride &amp; Groom</h2><p className={styles.opening}>{invitation.opening_text}</p></Reveal>
          {people.map((person, index) => <div key={person.label}>
            {index > 0 && <span className={styles.ampersand} aria-hidden="true">&amp;</span>}
            <Reveal direction={index === 0 ? "right" : "left"}><article className={styles.person}>
              <div className={styles.personPortrait}><Image src={person.photo} alt={person.name} fill sizes="(max-width: 480px) 65vw, 280px" /><Image className={styles.portraitFlower} src="/media/royal-maroon/floral.webp" alt="" aria-hidden="true" width={160} height={205} /></div>
              <div className={styles.personDetails}><p className={styles.personLabel}>{person.label}</p><p className={styles.scriptName}>{person.short}</p><h3>{person.name}</h3><p className={styles.parents}>{person.parents}</p></div>
            </article></Reveal>
          </div>)}
        </section>
        <section className={`${styles.section} ${styles.events}`} id="acara">
          <Reveal className={styles.introCard}><p className={styles.eyebrow}>Menuju hari bahagia</p><h2>Save The Date</h2><RoyalMaroonCountdown eventDate={invitation.event_date} ceremonyTime={invitation.ceremony_time} /><a href={calendarUrl(invitation)} className={styles.button} target="_blank" rel="noreferrer">Simpan tanggal <span aria-hidden="true">↗</span></a></Reveal>
          <div className={styles.eventCards}>{[{ name: "Akad Nikah", time: invitation.ceremony_time }, { name: "Resepsi", time: invitation.reception_time }].map((event) => <Reveal key={event.name}><article className={styles.eventCard}>
            <h3>{event.name}</h3><div className={styles.eventDate}><span>{format({ weekday: "long" })}</span><strong>{format({ day: "2-digit" })}</strong><span>{format({ month: "long", year: "numeric" })}</span></div><p>Pukul {event.time}</p><div className={styles.eventDivider} /><p className={styles.venue}>{invitation.venue_name}</p><p className={styles.address}>{invitation.venue_address}</p>{invitation.maps_url && <a className={styles.button} href={invitation.maps_url} target="_blank" rel="noreferrer">Lihat lokasi <span aria-hidden="true">↗</span></a>}
          </article></Reveal>)}</div>
        </section>
        {invitation.story.length > 0 && <section className={`${styles.section} ${styles.story}`} id="kisah">
          <Reveal><p className={styles.eyebrow}>Setiap langkah, bersamamu</p><h2>Love Story</h2></Reveal>
          {invitation.story_image_path && <Reveal><div className={styles.storyPhoto}><Image src={resolveMediaUrl(invitation.story_image_path)} alt={`Kisah cinta ${coupleNames}`} fill sizes="(max-width: 520px) 85vw, 400px" /></div></Reveal>}
          <div className={styles.timeline}>{invitation.story.map((item) => <Reveal key={`${item.year}-${item.title}`}><article><span className={styles.storyYear}>{item.year}</span><h3>{item.title}</h3><p>{item.text}</p></article></Reveal>)}</div>
        </section>}
        <section className={`${styles.section} ${styles.gallery}`} id="galeri"><Reveal className={styles.introCard}><p className={styles.eyebrow}>Our precious moments</p><h2>Galeri Foto</h2></Reveal>{invitation.gallery_paths.length > 0 ? <Reveal direction="scale"><Gallery paths={invitation.gallery_paths.map((path) => resolveMediaUrl(path))} /></Reveal> : <p>Galeri akan segera hadir.</p>}</section>
        {invitation.gift_info.account_number && <section className={`${styles.section} ${styles.gift}`} id="hadiah"><Reveal className={styles.introCard}><p className={styles.eyebrow}>Tanda kasih</p><h2>Amplop Digital</h2><p>Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Jika berkenan memberikan tanda kasih, Anda dapat mengirimkannya melalui:</p></Reveal><Reveal><RoyalMaroonGift gift={invitation.gift_info} /></Reveal></section>}
        <section className={`${styles.section} ${styles.wishes}`} id="ucapan"><Reveal className={styles.introCard}><p className={styles.eyebrow}>Wishes &amp; blessings</p><h2>Ucapkan Sesuatu</h2><p>Berikan ucapan, doa restu, dan konfirmasi kehadiran Anda.</p></Reveal><RoyalMaroonGuestbook invitationId={invitation.id} initialGreetings={greetings} guestName={guestName} /></section>
        <footer className={styles.footer}><Reveal className={styles.closingCard}><p>{invitation.closing_text}</p>{invitation.closing_greeting && <p className={styles.closingGreeting}>{invitation.closing_greeting}</p>}<Monogram bride={bride} groom={groom} /><h2>{coupleNames}</h2><div className={styles.brand}><span>Made with love by</span><Image src={BRAND.logoPath} alt={BRAND.name} width={200} height={75} /></div></Reveal></footer>
      </main>
    </div>
  </RoyalMaroonExperience>;
}
