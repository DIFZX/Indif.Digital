"use client";

/* eslint-disable @next/next/no-img-element -- Invitation photos already use the configured media CDN. */
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import { LOCATIONS, type Section } from "./world";
import styles from "./pixel.module.css";

export function PixelIcon({ name }: { name: Section | "music" | "help" | "close" | "map" | "heart" }) {
  const paths: Record<typeof name, ReactNode> = {
    couple: <><path d="M4 3h5v6H4zM15 3h5v6h-5zM2 11h9v8H2zM13 11h9v8h-9zM4 19h3v3H4zM17 19h3v3h-3z" /><path d="M10 5h4v3h-4z" fill="currentColor" /></>,
    events: <><path d="M3 6h18v15H3zM6 2v7M18 2v7M3 11h18" /><path d="M7 14h3v3H7zM14 14h3v3h-3z" fill="currentColor" /></>,
    gallery: <><path d="M2 4h20v16H2zM3 18l6-7 4 5 4-4 4 6" /><path d="M15 7h3v3h-3z" fill="currentColor" /></>,
    rsvp: <><path d="M3 3h18v14H10l-5 5v-5H3zM7 8h10M7 12h7" /></>,
    gift: <><path d="M3 9h18v5H3zM5 14v7h14v-7M12 9v12M12 9H6V3h3l3 6ZM12 9h6V3h-3l-3 6Z" /></>,
    music: <><path d="M9 17V4l11-2v13M9 8l11-2" /><path d="M3 16h6v5H3zM14 14h6v5h-6z" fill="currentColor" /></>,
    help: <><path d="M7 7V3h10v7l-5 3v3M11 20h2M3 2v20M21 2v20" /></>,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    map: <><path d="m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3V5ZM9 2v17M15 5v17" /></>,
    heart: <path d="M2 5h4V2h4v3h4V2h4v3h4v8l-10 9L2 13V5Z" fill="currentColor" stroke="none" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">{paths[name]}</svg>;
}

export function formatWeddingDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(`${date}T12:00:00+07:00`));
}

function calendarUrl(invitation: Invitation) {
  const end = new Date(`${invitation.event_date}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: `Pernikahan ${invitation.bride_short_name} & ${invitation.groom_short_name}`, dates: `${invitation.event_date.replaceAll("-", "")}/${end.toISOString().slice(0, 10).replaceAll("-", "")}`, details: invitation.opening_text, location: `${invitation.venue_name}, ${invitation.venue_address}` })}`;
}

function EventCountdown({ invitation, active }: { invitation: Invitation; active: boolean }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const time = invitation.ceremony_time.match(/(\d{1,2})[.:](\d{2})/);
    const target = new Date(`${invitation.event_date}T${time ? `${time[1].padStart(2, "0")}:${time[2]}` : "00:00"}:00+07:00`).getTime();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [active, invitation.event_date, invitation.ceremony_time]);
  if (remaining === 0) return <p className={styles.eventNote}>Hari bahagia telah tiba. Terima kasih untuk doa dan kehadiranmu.</p>;
  const seconds = Math.floor((remaining ?? 0) / 1000);
  return <div className={styles.countdown} aria-label="Hitung mundur menuju akad">
    {[{ label: "hari", value: Math.floor(seconds / 86400) }, { label: "jam", value: Math.floor(seconds / 3600) % 24 }, { label: "menit", value: Math.floor(seconds / 60) % 60 }, { label: "detik", value: seconds % 60 }].map(item => <div key={item.label}><strong>{remaining === null ? "--" : String(item.value).padStart(2, "0")}</strong><span>{item.label}</span></div>)}
  </div>;
}

function PixelRSVP({ invitationId, guestName, initialGreetings }: { invitationId: string; guestName: string | null; initialGreetings: Greeting[] }) {
  const [attendance, setAttendance] = useState("attending");
  const [greetings, setGreetings] = useState(initialGreetings);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "partial"; text: string } | null>(null);
  const pending = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; setBusy(true); setStatus(null);
    const form = event.currentTarget;
    const values = new FormData(form);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/guest-response", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ invitationId, guestName: values.get("guestName"), attendance, guestCount: values.get("guestCount") || 1, message: values.get("message") }),
      });
      const data = await response.json().catch(() => null);
      if (!data || typeof data.message !== "string") throw new Error("Jawaban server belum terbaca. Silakan coba lagi.");
      if (!response.ok) throw new Error(data.message);
      if (data.greeting) setGreetings(current => [data.greeting, ...current.filter(greeting => greeting.id !== data.greeting.id)]);
      setStatus({ type: response.status === 207 ? "partial" : "success", text: data.message });
      if (response.status !== 207) (form.elements.namedItem("message") as HTMLTextAreaElement).value = "";
    } catch (error) {
      setStatus({ type: "error", text: error instanceof DOMException && error.name === "AbortError" ? "Koneksi terlalu lama. Periksa ucapan sebelum mencoba kembali." : error instanceof TypeError ? "Koneksi terputus. Isianmu tetap ada, silakan coba lagi." : error instanceof Error ? error.message : "Respons belum tersimpan. Silakan coba lagi." });
    } finally { window.clearTimeout(timeout); pending.current = false; setBusy(false); }
  }
  return <>
    <p className={styles.panelIntro}>Petualangan ini lebih indah kalau kamu ikut hadir. Tinggalkan kabar dan doa untuk kami.</p>
    <form className={styles.form} onSubmit={submit} aria-busy={busy}>
      <label htmlFor="pixel-guest">Nama kamu<input id="pixel-guest" name="guestName" defaultValue={guestName || ""} minLength={2} maxLength={80} required autoComplete="name" placeholder="Tulis nama lengkap" /></label>
      <label htmlFor="pixel-attendance">Konfirmasi kehadiran<select id="pixel-attendance" name="attendance" value={attendance} onChange={event => setAttendance(event.target.value)}><option value="attending">Akan hadir</option><option value="not_attending">Belum dapat hadir</option></select></label>
      <label htmlFor="pixel-count"><span id="pixel-count-label">Jumlah tamu</span><input id="pixel-count" name="guestCount" aria-labelledby="pixel-count-label" aria-describedby="pixel-count-note" type="number" inputMode="numeric" min={1} max={10} defaultValue={1} required disabled={attendance !== "attending"} /><small id="pixel-count-note">{attendance === "attending" ? "Termasuk kamu, maksimal 10 orang." : "Dicatat sebagai 0 tamu karena berhalangan hadir."}</small></label>
      <label htmlFor="pixel-wish">Ucapan & doa<textarea id="pixel-wish" name="message" maxLength={500} rows={4} placeholder="Doa terbaik untuk petualangan baru kami…" /></label>
      <button className={styles.primaryButton} disabled={busy} type="submit"><PixelIcon name="rsvp" />{busy ? "Sedang mengirim…" : "Kirim ucapan & RSVP"}</button>
      {status && <p className={styles.formStatus} data-type={status.type} role="status">{status.text}</p>}
    </form>
    <div className={styles.wishes} aria-label="Ucapan tamu"><h3>Pesan dari para sahabat <span>{greetings.length}</span></h3>
      {greetings.length === 0 && <p>Belum ada ucapan. Jadilah yang pertama menitipkan doa untuk kami.</p>}
      {greetings.map(greeting => <article key={greeting.id}><div className={styles.wishAuthor}><strong>{greeting.guest_name}</strong>{greeting.attendance && <span>{greeting.attendance === "attending" ? "Hadir" : greeting.attendance === "not_attending" ? "Berhalangan" : "Belum pasti"}</span>}</div><p>{greeting.message}</p><time dateTime={greeting.created_at}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(greeting.created_at))}</time></article>)}
    </div>
  </>;
}

function PixelGift({ invitation }: { invitation: Invitation }) {
  const [status, setStatus] = useState("");
  const gift = invitation.gift_info;
  async function copy() {
    try { await navigator.clipboard.writeText(gift.account_number!); setStatus("Nomor rekening berhasil disalin."); }
    catch { setStatus("Tekan lama nomor rekening untuk menyalinnya."); }
  }
  return <div className={styles.giftPanel}>
    <div className={styles.giftIllustration}><PixelIcon name="gift" /></div>
    <h3>Kehadiranmu adalah hadiah.</h3><p>Jika ingin mengirim tanda kasih, kami menerimanya dengan penuh terima kasih.</p>
    {gift.account_number ? <div className={styles.bankCard}><span>Transfer bank</span><h4>{gift.bank || "Rekening hadiah"}</h4><dl className={styles.accountDetails}><div><dt>Nomor rekening</dt><dd className={styles.accountNumber}>{gift.account_number}</dd></div><div><dt>Atas nama</dt><dd className={styles.accountOwner}>{gift.account_name}</dd></div></dl><button type="button" className={styles.primaryButton} onClick={copy}>Salin nomor rekening</button><p role="status">{status}</p></div> : <p>Doa baikmu sudah menjadi hadiah yang berarti bagi kami.</p>}
    <p className={styles.closing}>{invitation.closing_text}</p>
  </div>;
}

export function PixelPanels({ section, invitation, greetings, guestName, onClose }: { section: Section | "help" | null; invitation: Invitation; greetings: Greeting[]; guestName: string | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const photos = invitation.gallery_paths.map(path => resolveMediaUrl(path));
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (section && !element.open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      element.showModal();
      element.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    } else if (!section && element.open) {
      element.close();
      if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
    }
    if (section) scroller.current?.scrollTo({ top: 0 });
  }, [section]);
  const close = () => { setPhotoIndex(null); onClose(); };
  function keepFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')).filter(element => element.getClientRects().length > 0 && !element.closest("[hidden]"));
    event.preventDefault();
    if (!controls.length) return;
    const current = controls.indexOf(document.activeElement as HTMLElement);
    const next = current < 0 ? (event.shiftKey ? controls.length - 1 : 0) : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
    controls[next].focus();
  }
  const title = section === "help" ? "Petunjuk petualangan" : LOCATIONS.find(location => location.id === section)?.title;
  return <dialog ref={dialog} className={styles.sheet} aria-labelledby="pixel-sheet-title" onKeyDown={keepFocus} onCancel={event => { event.preventDefault(); if (photoIndex !== null) setPhotoIndex(null); else close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className={styles.sheetInner}>
      <header className={styles.sheetHeader}><span><PixelIcon name={section === "help" || !section ? "help" : section} /><h2 id="pixel-sheet-title">{photoIndex !== null ? "Album kenangan" : title}</h2></span><button type="button" aria-label={photoIndex !== null ? "Kembali ke galeri" : "Tutup panel"} onClick={() => photoIndex !== null ? setPhotoIndex(null) : close()}><PixelIcon name="close" /></button></header>
      <div ref={scroller} className={styles.sheetContent}>
        <div hidden={section !== "help"}><p className={styles.panelEyebrow}>Selamat datang, petualang</p><h3 className={styles.helpTitle}>Lima tempat.<br />Satu cerita bahagia.</h3><p>Jalan dan rumput bisa dijelajahi. Bangunan, pohon, bunga, pagar, dan kolam menjadi batasnya. Datangi ikon di dekat papan, lalu tekan tombol <strong>A</strong> untuk membuka ceritanya.</p><div className={styles.helpKeys}><kbd>W A S D</kbd><span>atau tombol panah</span><kbd>E / Spasi</kbd><span>untuk berinteraksi</span></div><p>Milo si kucing, Mochi si kelinci, dan tiga kupu-kupu juga menunggumu. Sentuh mereka dengan karaktermu untuk mendapat sapaan otomatis. Ingin langsung melihat undangan? Semua bagian bisa dibuka dari menu di bawah layar.</p><img className={styles.helpMap} src="/media/adventure-wedding-pixel/garden.webp" alt="Peta taman dengan pelaminan di utara, album dan RSVP di tengah, hadiah di selatan" width={768} height={1152} loading="lazy" /><button type="button" className={styles.primaryButton} onClick={close}>Kembali ke taman</button></div>
        <div hidden={section !== "couple"}>
          <p className={styles.panelEyebrow}>Dengan cinta & restu keluarga</p><p className={styles.panelIntro}>{invitation.opening_text}</p>
          <div className={styles.people}>{[{ role: "Mempelai wanita", name: invitation.bride_name, parents: invitation.bride_parents, photo: invitation.bride_photo_path }, { role: "Mempelai pria", name: invitation.groom_name, parents: invitation.groom_parents, photo: invitation.groom_photo_path }].map(person => <article key={person.role}><img src={resolveMediaUrl(person.photo || invitation.cover_path)} alt={person.name} width={240} height={300} loading="lazy" /><span className={styles.panelEyebrow}>{person.role}</span><h3>{person.name}</h3><p>{person.parents}</p></article>)}</div>
          {invitation.quote_text && <blockquote className={styles.quote}><PixelIcon name="heart" /><p>{invitation.quote_text}</p><cite>{invitation.quote_source}</cite></blockquote>}
          {invitation.story.length > 0 && <div className={styles.story}><h3>Level demi level,<br />kita sampai di sini.</h3>{invitation.story.map((item, index) => <article key={`${item.year}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{item.year}</small><h4>{item.title}</h4><p>{item.text}</p></div></article>)}</div>}
        </div>
        <div hidden={section !== "events"}>
          <p className={styles.panelEyebrow}>Simpan tanggalnya</p><h3 className={styles.dateHeading}>{formatWeddingDate(invitation.event_date)}</h3><EventCountdown invitation={invitation} active={section === "events"} />
          <a className={styles.secondaryButton} href={calendarUrl(invitation)} target="_blank" rel="noopener noreferrer"><PixelIcon name="events" />Simpan ke kalender</a>
          {[{ title: "Akad nikah", time: invitation.ceremony_time }, { title: "Resepsi", time: invitation.reception_time }].map((event, index) => <article className={styles.eventCard} key={event.title}><span className={styles.eventNumber}>0{index + 1}</span><p className={styles.panelEyebrow}>{event.title}</p><h3>{event.time}</h3><h4>{invitation.venue_name}</h4><p>{invitation.venue_address}</p>{invitation.maps_url && <a className={styles.primaryButton} href={invitation.maps_url} target="_blank" rel="noopener noreferrer"><PixelIcon name="map" />Buka lokasi di Maps</a>}</article>)}
        </div>
        <div hidden={section !== "gallery"}>
          {photoIndex === null ? <><p className={styles.panelIntro}>Potongan kecil dari perjalanan yang membawa kami ke hari ini. Sentuh foto untuk melihat lebih dekat.</p><div className={styles.gallery}>{photos.map((photo, index) => <button type="button" key={`${photo}-${index}`} onClick={() => setPhotoIndex(index)} aria-label={`Perbesar foto ${index + 1}`}><img src={photo} alt={`Kenangan ${invitation.bride_short_name} dan ${invitation.groom_short_name}, foto ${index + 1}`} width={320} height={400} loading="lazy" /><span>0{index + 1}</span></button>)}</div>{!photos.length && <p>Album foto belum ditambahkan.</p>}</> : <div className={styles.lightbox}><img src={photos[photoIndex]} alt={`Foto kenangan ${photoIndex + 1}`} width={700} height={900} /><div><button type="button" className={styles.secondaryButton} aria-label="Foto sebelumnya" onClick={() => setPhotoIndex((photoIndex + photos.length - 1) % photos.length)}>←</button><span>{photoIndex + 1} / {photos.length}</span><button type="button" className={styles.secondaryButton} aria-label="Foto berikutnya" onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}>→</button></div></div>}
        </div>
        <div hidden={section !== "rsvp"}><PixelRSVP invitationId={invitation.id} guestName={guestName} initialGreetings={greetings} /></div>
        <div hidden={section !== "gift"}><PixelGift invitation={invitation} /></div>
      </div>
      <footer className={styles.sheetFooter}>Adventure Wedding Pixel <span>♥</span> {invitation.bride_short_name} & {invitation.groom_short_name}</footer>
    </div>
  </dialog>;
}
