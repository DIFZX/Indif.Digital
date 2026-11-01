import Image from "next/image";
import type { CSSProperties } from "react";
import { Gallery } from "@/components/gallery";
import { Reveal } from "@/components/reveal";
import { BRAND } from "@/lib/brand";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import { localizeSundaInvitation } from "../sunda-vibes/indonesian-copy";
import { BlushRoseCountdown, BlushRoseExperience, BlushRoseGift, BlushRoseGuestbook } from "./blush-rose-interactions";
import { BlushRoseIcon } from "./blush-rose-icons";
import styles from "./blush-rose.module.css";

type Props = { invitation: Invitation; greetings: Greeting[]; guestName: string | null; initiallyOpened?: boolean };

export function FloralCorner({ className = "" }: { className?: string }) {
  return <div className={`${styles.floralCorner} ${className}`} aria-hidden="true">
    <Image className={styles.spray} src="/media/blush-rose/rose-pink-red-v1.webp" alt="" width={250} height={237} sizes="200px" />
  </div>;
}

function calendarUrl(invitation: Invitation) {
  const date = new Date(`${invitation.event_date}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  const params = new URLSearchParams({ action: "TEMPLATE", text: `Pernikahan ${invitation.bride_short_name} & ${invitation.groom_short_name}`, dates: `${invitation.event_date.replaceAll("-", "")}/${date.toISOString().slice(0, 10).replaceAll("-", "")}`, details: invitation.opening_text, location: `${invitation.venue_name}, ${invitation.venue_address}` });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function BlushRoseInvitationView({ invitation: source, greetings, guestName, initiallyOpened = false }: Props) {
  const invitation = localizeSundaInvitation(source);
  const couple = `${invitation.bride_short_name} & ${invitation.groom_short_name}`;
  const cover = resolveMediaUrl(invitation.cover_path);
  const profile = resolveMediaUrl(invitation.profile_path) || cover;
  const date = new Date(`${invitation.event_date}T12:00:00+07:00`);
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { ...options, timeZone: "Asia/Jakarta" }).format(date);
  const longDate = format({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const theme = { ...invitation.template.theme, ...invitation.theme_overrides };
  const themeStyle = { "--br-wine": theme.primary || "#b51e40", "--br-blush": theme.accent || "#f4aec7", "--br-paper": theme.background || "#fff0f6" } as CSSProperties;
  const people = [
    { label: "The Bride", name: invitation.bride_name, short: invitation.bride_short_name, parents: invitation.bride_parents, photo: resolveMediaUrl(invitation.bride_photo_path) || profile },
    { label: "The Groom", name: invitation.groom_name, short: invitation.groom_short_name, parents: invitation.groom_parents, photo: resolveMediaUrl(invitation.groom_photo_path) || profile },
  ];

  return <BlushRoseExperience couple={couple} coverPath={cover} guestName={guestName} musicPath={resolveMediaUrl(invitation.music_path)} initiallyOpened={initiallyOpened} themeStyle={themeStyle}>
    <aside className={styles.showcase} aria-label={`Pernikahan ${couple}`}>
      <Image src={cover} alt={`Foto ${couple}`} fill sizes="(min-width: 901px) 65vw, 1px" priority />
      <div className={styles.showcaseShade} />
      <div className={styles.showcaseCopy}><p className={styles.eyebrow}>Together, in full bloom</p><h2>{couple}</h2><p>{longDate}</p></div>
      <span className={styles.showcaseBrand}>{BRAND.name} · Digital Invitation</span>
    </aside>
    <main className={styles.panel}>
      <section className={styles.hero} id="pembuka">
        <FloralCorner className={styles.heroFlowers} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>The Wedding of</p>
          <div className={styles.heroPortrait}><Image src={profile} alt={`Potret ${couple}`} fill sizes="250px" priority /><FloralCorner className={styles.portraitFlowers} /></div>
          <h2 className={styles.coupleName}>{couple}</h2>
          <Image className={styles.petalDivider} src="/media/blush-rose/petal-divider.svg" alt="" width={280} height={44} aria-hidden="true" />
          <p className={styles.heroIntro}>Kami berharap Anda menjadi bagian dari hari istimewa kami.</p>
          <BlushRoseCountdown eventDate={invitation.event_date} ceremonyTime={invitation.ceremony_time} />
          <p className={styles.heroDate}>{longDate}</p>
          <a className={styles.button} href={calendarUrl(invitation)} target="_blank" rel="noreferrer"><BlushRoseIcon name="calendar" />Simpan tanggal</a>
          <a className={styles.scrollCue} href="#mempelai" aria-label="Gulir ke mempelai"><span>Gulir ke bawah</span><span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className={`${styles.section} ${styles.coupleSection}`} id="mempelai">
        <Reveal><p className={styles.salutation}>Assalamu&apos;alaikum Wr. Wb.</p><p className={styles.opening}>{invitation.opening_text}</p></Reveal>
        {people.map((person, index) => <div key={person.label}>
          {index > 0 && <Reveal><span className={styles.ampersand} aria-hidden="true">&amp;</span></Reveal>}
          <Reveal direction={index === 0 ? "right" : "left"}><article className={styles.person}>
            <div className={styles.personPhoto}><Image src={person.photo} alt={person.name} fill sizes="(max-width: 520px) 55vw, 230px" /></div>
            <Image className={styles.personFloral} src="/media/blush-rose/rose-pink-red-v1.webp" alt="" width={140} height={133} sizes="110px" aria-hidden="true" />
            <p className={styles.personLabel}>{person.label}</p><h3>{person.name}</h3><p>{person.parents}</p>
            <Image className={styles.personRose} src="/media/blush-rose/portrait-flower.webp" alt="" width={80} height={78} aria-hidden="true" />
          </article></Reveal>
        </div>)}
        {invitation.quote_text && <Reveal><blockquote className={styles.quote}><Image src="/media/blush-rose/love-seal.svg" alt="" width={65} height={65} aria-hidden="true" /><p>“{invitation.quote_text}”</p>{invitation.quote_source && <cite>{invitation.quote_source}</cite>}</blockquote></Reveal>}
      </section>

      {invitation.story.length > 0 && <section className={`${styles.section} ${styles.storySection}`} id="kisah">
        <Reveal><p className={styles.eyebrow}>Our love story</p><h2 className={styles.sectionTitle}>Perjalanan Cerita Kami</h2></Reveal>
        {invitation.story_image_path && <Reveal direction="scale"><div className={styles.storyPhoto}><Image src={resolveMediaUrl(invitation.story_image_path)} alt={`Perjalanan cinta ${couple}`} fill sizes="(max-width: 520px) 90vw, 450px" /></div></Reveal>}
        <div className={styles.timeline}>{invitation.story.map((item, index) => <Reveal key={`${item.year}-${item.title}`} delay={index * 50}><article><span className={styles.storyIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className={styles.storyYear}>{item.year}</span><h3>{item.title}</h3><p>{item.text}</p></article></Reveal>)}</div>
      </section>}

      <section className={`${styles.section} ${styles.eventsSection}`} id="acara">
        <Reveal><p className={styles.eyebrow}>A day to remember</p><h2 className={styles.sectionTitle}>Hari Bahagia Kami</h2><p className={styles.sectionIntro}>Dengan penuh rasa syukur dan bahagia, kami mengundang Anda untuk hadir dalam pernikahan kami.</p></Reveal>
        {[{ title: "Akad Nikah", time: invitation.ceremony_time, icon: "couple" as const }, { title: "Resepsi", time: invitation.reception_time, icon: "calendar" as const }].map(event => <Reveal key={event.title}><article className={styles.eventCard}>
          <Image className={styles.eventFloral} src="/media/blush-rose/rose-pink-red-v1.webp" alt="" width={160} height={152} sizes="135px" aria-hidden="true" />
          <div className={styles.eventIcon}><BlushRoseIcon name={event.icon} /></div><h3>{event.title}</h3><p className={styles.eventDate}>{longDate}</p><p className={styles.eventTime}>Pukul {event.time}</p><div className={styles.fineLine} /><p className={styles.venue}>{invitation.venue_name}</p><p className={styles.address}>{invitation.venue_address}</p>
          {invitation.maps_url && <a className={styles.button} href={invitation.maps_url} target="_blank" rel="noreferrer"><BlushRoseIcon name="pin" />Lihat lokasi</a>}
        </article></Reveal>)}
      </section>

      <section className={`${styles.section} ${styles.gallerySection}`} id="galeri">
        <Reveal><p className={styles.eyebrow}>The moments we cherish</p><h2 className={styles.sectionTitle}>Galeri Foto</h2></Reveal>
        {invitation.gallery_paths.length > 0 ? <Reveal direction="scale"><Gallery paths={invitation.gallery_paths.map(path => resolveMediaUrl(path))} /></Reveal> : <p>Galeri akan segera hadir.</p>}
      </section>

      {invitation.gift_info.account_number && <section className={`${styles.section} ${styles.giftSection}`} id="hadiah">
        <Reveal><p className={styles.eyebrow}>A little token of love</p><h2 className={styles.sectionTitle}>Wedding Gift</h2><p className={styles.sectionIntro}>Doa restu Anda merupakan hadiah terindah bagi kami. Jika berkenan memberikan tanda kasih, Anda dapat mengirimkannya melalui:</p></Reveal>
        <Reveal><BlushRoseGift gift={invitation.gift_info} /></Reveal>
      </section>}

      <section className={`${styles.section} ${styles.wishesSection}`} id="ucapan">
        <Reveal><p className={styles.eyebrow}>Wishes &amp; blessings</p><h2 className={styles.sectionTitle}>Ucapkan Sesuatu</h2><p className={styles.sectionIntro}>Berikan ucapan, doa restu, dan konfirmasi kehadiran Anda.</p></Reveal>
        <BlushRoseGuestbook invitationId={invitation.id} guestName={guestName} initialGreetings={greetings} />
      </section>

      <footer className={styles.footer}>
        <Image className={styles.footerFloral} src="/media/blush-rose/rose-pink-red-v1.webp" alt="" width={280} height={266} sizes="240px" aria-hidden="true" />
        <Reveal><div className={styles.closingPortrait}><Image src={cover} alt={`Kebahagiaan ${couple}`} fill sizes="200px" /></div><p>{invitation.closing_text}</p>{invitation.closing_greeting && <p className={styles.closingGreeting}>{invitation.closing_greeting}</p>}<h2 className={styles.coupleName}>{couple}</h2><div className={styles.brand}><span>Made with love by</span><a href={BRAND.websiteUrl || "/"} aria-label={`Kunjungi ${BRAND.name}`}><Image src={BRAND.logoPath} alt={BRAND.name} width={200} height={75} /></a></div></Reveal>
      </footer>
    </main>
  </BlushRoseExperience>;
}
