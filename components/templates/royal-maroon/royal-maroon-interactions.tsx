"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { GiftInfo, Greeting } from "@/lib/types";
import styles from "./royal-maroon.module.css";
import { RoyalMaroonIcon } from "./royal-maroon-icons";

const NAV_ITEMS = [
  { id: "pembuka", label: "Beranda", icon: "home" },
  { id: "mempelai", label: "Mempelai", icon: "couple" },
  { id: "acara", label: "Acara", icon: "calendar" },
  { id: "galeri", label: "Galeri", icon: "gallery" },
  { id: "ucapan", label: "RSVP", icon: "wishes" },
] as const;

export function Monogram({ bride, groom }: { bride: string; groom: string }) {
  return <div className={styles.monogram} aria-hidden="true"><span>{bride.charAt(0)}</span><span>{groom.charAt(0)}</span></div>;
}

type ExperienceProps = {
  bride: string;
  groom: string;
  guestName: string | null;
  musicPath: string | null;
  initiallyOpened: boolean;
  themeStyle: CSSProperties;
  children: ReactNode;
};

export function RoyalMaroonExperience({ bride, groom, guestName, musicPath, initiallyOpened, themeStyle, children }: ExperienceProps) {
  const [opened, setOpened] = useState(initiallyOpened);
  const [playing, setPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState("pembuka");
  const audioRef = useRef<HTMLAudioElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (opened) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    openRef.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previousOverflow; };
  }, [opened]);

  useEffect(() => {
    if (!opened) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      }
    }, { rootMargin: "-15% 0px -55% 0px", threshold: 0 });
    NAV_ITEMS.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [opened]);

  async function openInvitation() {
    setOpened(true);
    window.scrollTo({ top: 0, behavior: "instant" });
    window.requestAnimationFrame(() => stageRef.current?.focus({ preventScroll: true }));
    if (audioRef.current) {
      try { await audioRef.current.play(); } catch { setPlaying(false); }
    }
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) { audio.pause(); return; }
    try { await audio.play(); } catch { setPlaying(false); }
  }

  return (
    <div className={styles.experience} style={themeStyle} data-opened={opened}>
      <div className={styles.cover} role="dialog" aria-modal={!opened} aria-label={`Undangan ${bride} & ${groom}`} aria-hidden={opened} inert={opened}>
        <div className={styles.coverContent}>
          <Monogram bride={bride} groom={groom} />
          <p className={styles.eyebrow}>The Wedding of</p>
          <h1>{bride} &amp; {groom}</h1>
          <p className={styles.guestSalutation}>Kepada Bapak/Ibu/Saudara/i</p>
          <p className={styles.guestName}>{guestName || "Tamu Undangan"}</p>
          <button ref={openRef} className={styles.button} type="button" onClick={openInvitation}>Buka Undangan <span aria-hidden="true">↗</span></button>
        </div>
      </div>
      {musicPath && <audio ref={audioRef} src={musicPath} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setPlaying(false)} />}
      <div ref={stageRef} tabIndex={-1} inert={!opened} aria-hidden={!opened} className={styles.stage}>{children}</div>
      {opened && <>
        {musicPath && <button className={styles.musicToggle} type="button" onClick={toggleMusic} aria-label={playing ? "Matikan musik" : "Putar musik"} aria-pressed={playing}>
          <RoyalMaroonIcon name={playing ? "music" : "muted"} /><span>Musik {playing ? "On" : "Off"}</span>
        </button>}
        <nav className={styles.navigation} aria-label="Navigasi undangan">
          {NAV_ITEMS.map(({ id, label, icon }) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined}>
            <RoyalMaroonIcon name={icon} /><span>{label}</span>
          </a>)}
        </nav>
      </>}
    </div>
  );
}

export function RoyalMaroonCountdown({ eventDate, ceremonyTime }: { eventDate: string; ceremonyTime: string }) {
  const [remaining, setRemaining] = useState([0, 0, 0, 0]);
  useEffect(() => {
    const time = ceremonyTime.match(/(\d{1,2})[.:](\d{2})/);
    const hour = time && Number(time[1]) < 24 ? time[1].padStart(2, "0") : "08";
    const minute = time && Number(time[2]) < 60 ? time[2] : "00";
    const target = new Date(`${eventDate}T${hour}:${minute}:00+07:00`).getTime();
    function tick() {
      const diff = Math.max(0, target - Date.now());
      setRemaining([Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60]);
    }
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [eventDate, ceremonyTime]);
  return <div className={styles.countdown} aria-label="Hitung mundur pernikahan">{["Hari", "Jam", "Menit", "Detik"].map((label, i) => <div key={label}><strong>{String(remaining[i]).padStart(2, "0")}</strong><span>{label}</span></div>)}</div>;
}

export function RoyalMaroonGift({ gift }: { gift: GiftInfo }) {
  const [copyStatus, setCopyStatus] = useState("");
  if (!gift.account_number) return null;
  async function copy() {
    try {
      await navigator.clipboard.writeText(gift.account_number!);
      setCopyStatus("Nomor rekening tersalin.");
    } catch { setCopyStatus("Silakan pilih dan salin nomor rekening di atas."); }
  }
  return <div className={styles.bankCard}>
    <span className={styles.bankName}>{gift.bank || "Bank"}</span>
    <span className={styles.bankChip} aria-hidden="true"><RoyalMaroonIcon name="chip" /></span>
    <strong>{gift.account_number}</strong>
    {gift.account_name && <p>a.n. {gift.account_name}</p>}
    <button type="button" className={styles.button} onClick={copy}>Salin nomor rekening</button>
    <p className={styles.copyStatus} role="status">{copyStatus}</p>
  </div>;
}

export function RoyalMaroonGuestbook({ invitationId, initialGreetings, guestName }: { invitationId: string; initialGreetings: Greeting[]; guestName: string | null }) {
  const [greetings, setGreetings] = useState(initialGreetings);
  const [attendance, setAttendance] = useState("attending");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "partial"; message: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setSubmitting(true);
    setStatus(null);
    try {
      const response = await fetch("/api/guest-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, guestName: values.get("guestName"), attendance, guestCount: values.get("guestCount") || 1, message: values.get("message") }),
      });
      const data = await response.json().catch(() => null);
      if (!data || typeof data.message !== "string") {
        throw new Error("Respons server belum dapat dibaca. Silakan coba lagi.");
      }
      if (!response.ok) throw new Error(data.message || "Respons belum berhasil disimpan. Silakan coba lagi.");
      if (data.greeting) setGreetings((current) => [data.greeting, ...current]);
      setStatus({ type: response.status === 207 ? "partial" : "success", message: data.message });
      if (response.status !== 207) {
        const message = form.elements.namedItem("message") as HTMLTextAreaElement;
        message.value = "";
      }
    } catch (error) {
      setStatus({ type: "error", message: error instanceof TypeError ? "Koneksi terputus. Silakan coba lagi." : error instanceof Error ? error.message : "Respons belum berhasil dikirim. Silakan coba lagi." });
    } finally { setSubmitting(false); }
  }

  return <div className={styles.guestbook}>
    <form onSubmit={submit} className={styles.form}>
      <label htmlFor="royal-guest-name">Nama<input id="royal-guest-name" name="guestName" defaultValue={guestName || ""} minLength={2} maxLength={80} autoComplete="name" required placeholder="Nama Anda" /></label>
      <label htmlFor="royal-attendance">Konfirmasi kehadiran<select id="royal-attendance" name="attendance" value={attendance} onChange={(e) => setAttendance(e.target.value)} required><option value="attending">Hadir</option><option value="not_attending">Tidak dapat hadir</option></select></label>
      <label htmlFor="royal-guest-count">Jumlah tamu<input id="royal-guest-count" name="guestCount" type="number" min={1} max={10} defaultValue={1} disabled={attendance === "not_attending"} required /></label>
      <label htmlFor="royal-message">Ucapan &amp; doa<textarea id="royal-message" name="message" rows={4} maxLength={500} placeholder="Tuliskan doa terbaik untuk kedua mempelai…" /></label>
      <button className={styles.button} disabled={submitting} type="submit">{submitting ? "Mengirim…" : "Kirim ucapan & RSVP"} <span aria-hidden="true">↗</span></button>
      {status && <p className={styles.formStatus} data-type={status.type} role="status" aria-live="polite">{status.message}</p>}
    </form>
    <div className={styles.greetings} aria-label="Ucapan tamu">
      <p className={styles.greetingsCount}>{greetings.length} ucapan penuh kasih</p>
      {greetings.length === 0 && <p>Jadilah yang pertama memberikan ucapan dan doa restu.</p>}
      {greetings.map((greeting) => <article key={greeting.id} className={styles.greeting}>
        <div><strong>{greeting.guest_name}</strong>{greeting.attendance && <span className={styles.attendance} data-attending={greeting.attendance === "attending"}>{greeting.attendance === "attending" ? "Hadir" : greeting.attendance === "not_attending" ? "Berhalangan" : "Belum pasti"}</span>}</div>
        <p>{greeting.message}</p>
        <time dateTime={greeting.created_at}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(greeting.created_at))}</time>
      </article>)}
    </div>
  </div>;
}
