"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import styles from "./java-vibes.module.css";

type Props = {
  invitation: Invitation;
  greetings: Greeting[];
  guestName: string | null;
  initiallyOpened?: boolean;
  coupleNames: string;
  coverPath: string;
  profilePath: string;
  bridePhotoPath: string;
  groomPhotoPath: string;
  galleryPaths: string[];
  storyImagePath: string;
  musicPath: string;
  calendarUrl: string;
  themeClassName?: string;
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T12:00:00+07:00`));
}

function formatRelativeTime(dateString: string) {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari yang lalu`;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return "";
  }
}

export function JavaVibesClientApp({
  invitation,
  greetings: initialGreetings,
  guestName,
  initiallyOpened = false,
  coupleNames,
  coverPath,
  profilePath,
  bridePhotoPath,
  groomPhotoPath,
  galleryPaths,
  storyImagePath,
  musicPath,
  calendarUrl,
  themeClassName = "",
}: Props) {
  const [opened, setOpened] = useState(initiallyOpened);
  const [playing, setPlaying] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("cover");

  // Greetings & RSVP state
  const [greetings, setGreetings] = useState<Greeting[]>(initialGreetings);
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpAttendance, setRsvpAttendance] = useState<"attending" | "not_attending">("attending");
  const [rsvpGuestCount, setRsvpGuestCount] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Restore wishes saved locally across page refreshes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`java_vibes_wishes_${invitation.id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Greeting[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGreetings((prev) => {
            const map = new Map<string, Greeting>();
            prev.forEach((g) => map.set(g.id || g.message, g));
            parsed.forEach((g) => {
              if (!map.has(g.id || g.message)) {
                map.set(g.id || g.message, g);
              }
            });
            return Array.from(map.values());
          });
        }
      }
    } catch {}
  }, [invitation.id]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const displayGuestName = guestName || "Tamu Undangan";

  // Slideshow images for desktop showcase
  const showcaseImages = useMemo(() => {
    return galleryPaths.length > 0 ? galleryPaths.slice(0, 5) : [coverPath];
  }, [galleryPaths, coverPath]);

  // Live countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculateCountdown() {
      const target = new Date(`${invitation.event_date}T08:00:00+07:00`).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [invitation.event_date]);

  // Lock body scroll only when modal cover is closed
  useEffect(() => {
    if (!opened) {
      document.body.style.overflow = "hidden";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  // Scrollspy for floating bottom nav
  useEffect(() => {
    if (!opened) return;
    const handleScroll = () => {
      const sections = ["pembuka", "mempelai", "acara", "kisah", "galeri", "hadiah", "ucapan"];
      const scrollPos = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [opened]);

  async function openInvitation() {
    setOpened(true);
    if (!audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function toggleMusic() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  }

  function copyToClipboard(text: string, key: string) {
    const markCopied = () => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    };

    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(markCopied)
        .catch(() => fallbackCopy(text, markCopied));
    } else {
      fallbackCopy(text, markCopied);
    }
  }

  function fallbackCopy(text: string, onSuccess: () => void) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      onSuccess();
    } catch {
      onSuccess();
    }
  }

  async function handleSubmitRsvp(e: FormEvent) {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setSubmitting(true);
    setStatusMessage(null);

    const newGreeting: Greeting = {
      id: "greeting-" + Date.now(),
      guest_name: rsvpName.trim(),
      attendance: rsvpAttendance,
      message: rsvpMessage.trim() || `Selamat menempuh hidup baru ${coupleNames}, semoga sakinah mawaddah warahmah!`,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/guest-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitation.id,
          guestName: rsvpName.trim(),
          attendance: rsvpAttendance,
          guestCount: rsvpGuestCount,
          message: rsvpMessage.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const greetingToAdd: Greeting = data.greeting || newGreeting;
        setGreetings((prev) => {
          const next = [greetingToAdd, ...prev.filter((g) => g.id !== greetingToAdd.id)];
          try {
            localStorage.setItem(`java_vibes_wishes_${invitation.id}`, JSON.stringify(next.slice(0, 50)));
          } catch {}
          return next;
        });
        setStatusMessage({ type: "success", text: "Matur nuwun, doa restu & konfirmasi kehadiran panjenengan sampun katampi." });
      } else {
        setGreetings((prev) => {
          const next = [newGreeting, ...prev.filter((g) => g.id !== newGreeting.id)];
          try {
            localStorage.setItem(`java_vibes_wishes_${invitation.id}`, JSON.stringify(next.slice(0, 50)));
          } catch {}
          return next;
        });
        setStatusMessage({ type: "success", text: "Doa restu Anda berhasil dikirim." });
      }
      setRsvpMessage("");
    } catch {
      setGreetings((prev) => {
        const next = [newGreeting, ...prev.filter((g) => g.id !== newGreeting.id)];
        try {
          localStorage.setItem(`java_vibes_wishes_${invitation.id}`, JSON.stringify(next.slice(0, 50)));
        } catch {}
        return next;
      });
      setStatusMessage({ type: "success", text: "Doa restu Anda berhasil dikirim." });
      setRsvpMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${styles.javaVibesContainer} ${themeClassName}`}>
      <audio ref={audioRef} src={musicPath} loop preload="auto" />

      {/* Floating Music Button */}
      <button
        type="button"
        className={`${styles.floatingMusicBtn} ${playing ? styles.musicPlaying : ""}`}
        onClick={toggleMusic}
        aria-label={playing ? "Jeda musik" : "Putar musik"}
      >
        <span className={styles.musicDisc}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
          </svg>
        </span>
        <span className={styles.musicStatusIcon}>
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
      </button>

      {/* Floating Bottom Navigation Bar */}
      {opened && (
        <nav className={styles.floatingNav} aria-label="Navigasi bagian undangan">
          <a
            href="#pembuka"
            className={`${styles.navItem} ${activeSection === "pembuka" ? styles.navItemActive : ""}`}
            aria-label="Pembuka"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Home</span>
          </a>
          <a
            href="#mempelai"
            className={`${styles.navItem} ${activeSection === "mempelai" ? styles.navItemActive : ""}`}
            aria-label="Mempelai"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Mempelai</span>
          </a>
          <a
            href="#acara"
            className={`${styles.navItem} ${activeSection === "acara" ? styles.navItemActive : ""}`}
            aria-label="Acara"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
            </svg>
            <span>Acara</span>
          </a>
          <a
            href="#kisah"
            className={`${styles.navItem} ${activeSection === "kisah" ? styles.navItemActive : ""}`}
            aria-label="Kisah Cinta"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
            </svg>
            <span>Cerita</span>
          </a>
          <a
            href="#galeri"
            className={`${styles.navItem} ${activeSection === "galeri" ? styles.navItemActive : ""}`}
            aria-label="Galeri"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            <span>Galeri</span>
          </a>
          <a
            href="#ucapan"
            className={`${styles.navItem} ${activeSection === "ucapan" ? styles.navItemActive : ""}`}
            aria-label="Ucapan dan Doa"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
            <span>Ucapan</span>
          </a>
        </nav>
      )}

      {/* Main Split Layout: Desktop Showcase Left + Mobile Experience Right */}
      <div className={styles.splitLayout}>
        {/* Left Desktop Showcase Panel */}
        <aside className={styles.desktopShowcase} aria-label="Foto Pasangan">
          <div className={styles.showcaseSlideshow}>
            {showcaseImages.map((src, i) => (
              <div
                key={src}
                className={styles.showcaseSlide}
                style={{ animationDelay: `${i * 6}s` }}
              >
                <Image src={src} alt="" fill priority={i === 0} sizes="55vw" />
              </div>
            ))}
          </div>
          <div className={styles.showcaseOverlay} />
          <div className={styles.showcaseText}>
            <Image
              src="/media/java-vibes/decor/gunungan.svg"
              alt=""
              width={140}
              height={200}
              className={styles.showcaseGunungan}
            />
            <p className={styles.showcaseKicker}>Pawiwahan Ageng Adat Jawi</p>
            <h1 className={styles.showcaseTitle}>{coupleNames}</h1>
            <p className={styles.showcaseDate}>{formatEventDate(invitation.event_date)}</p>
            <span className={styles.showcaseBadge}>{BRAND.name} · Digital Invitation</span>
          </div>
        </aside>

        {/* Right Mobile / Interactive Invitation Panel */}
        <div className={styles.invitationPanel}>
          {/* COVER SCREEN MODAL OVERLAY */}
          {!opened && (
            <div className={styles.coverScreen}>
              <div className={styles.coverBackground} />
              <div className={styles.coverGlow} />

              <div className={styles.coverContent}>
                <div className={styles.coverGununganWrap}>
                  <Image
                    src="/media/java-vibes/decor/gunungan.svg"
                    alt="Gunungan Wayang"
                    width={180}
                    height={260}
                    priority
                    className={styles.coverGunungan}
                  />
                </div>

                <div className={styles.coverFrameMedallion}>
                  <div className={styles.coverMedallionRing}>
                    <Image
                      src={coverPath}
                      alt={`Pernikahan ${coupleNames}`}
                      fill
                      priority
                      sizes="220px"
                      className={styles.coverPortrait}
                    />
                  </div>
                  {/* Ronce Melati Garland Accents */}
                  <div className={`${styles.ronceMelati} ${styles.ronceLeft}`}>
                    <Image
                      src="/media/java-vibes/decor/ronce-melati.svg"
                      alt=""
                      width={70}
                      height={160}
                    />
                  </div>
                  <div className={`${styles.ronceMelati} ${styles.ronceRight}`}>
                    <Image
                      src="/media/java-vibes/decor/ronce-melati.svg"
                      alt=""
                      width={70}
                      height={160}
                    />
                  </div>
                </div>

                <p className={styles.coverEyebrow}>The Wedding of</p>
                <h1 className={styles.coverNames}>{coupleNames}</h1>
                <p className={styles.coverDate}>{formatEventDate(invitation.event_date)}</p>

                <div className={styles.coverGuestCard}>
                  <small>Katur dhumateng Panjenengan:</small>
                  <strong>{displayGuestName}</strong>
                </div>

                <button
                  type="button"
                  className={styles.btnOpenInvitation}
                  onClick={openInvitation}
                >
                  <span className={styles.btnOpenGlow} />
                  <span className={styles.btnOpenText}>Buka Undangan</span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* MAIN INVITATION CONTENT (Scrollable Experience) */}
          <main className={styles.mainExperience}>
            {/* SECTION 1: PEMBUKA & AYAT SUCI */}
            <section className={styles.section} id="pembuka">
              <div className={styles.sectionOrnamentTop}>
                <Image
                  src="/media/java-vibes/decor/gunungan.svg"
                  alt=""
                  width={90}
                  height={130}
                />
              </div>

              <div className={styles.cardContainer}>
                <p className={styles.bismillahArabic}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                <p className={styles.salamScript}>Assalamu&apos;alaikum Warahmatullahi Wabarakatuh</p>
                <p className={styles.introParagraph}>{invitation.opening_text}</p>

                <div className={styles.archedQuoteCard}>
                  <Image
                    src="/media/java-vibes/decor/corner-gold.svg"
                    alt=""
                    width={40}
                    height={40}
                    className={`${styles.cornerFloret} ${styles.cornerTopLeft}`}
                  />
                  <Image
                    src="/media/java-vibes/decor/corner-gold.svg"
                    alt=""
                    width={40}
                    height={40}
                    className={`${styles.cornerFloret} ${styles.cornerTopRight}`}
                  />
                  <p className={styles.quoteText}>“{invitation.quote_text}”</p>
                  <cite className={styles.quoteSource}>{invitation.quote_source}</cite>
                </div>
              </div>
            </section>

            {/* SECTION 2: MEMPELAI (THE BRIDE & THE GROOM) */}
            <section className={styles.section} id="mempelai">
              <div className={styles.sectionTitleBlock}>
                <p className={styles.sectionKicker}>Pengantin</p>
                <h2 className={styles.sectionTitle}>Mempelai Bahagia</h2>
              </div>

              <div className={styles.coupleCardsGrid}>
                {/* Mempelai Wanita */}
                <article className={styles.personCard}>
                  <div className={styles.personArchWrap}>
                    <div className={styles.personPhotoInner}>
                      <Image
                        src={bridePhotoPath}
                        alt={invitation.bride_name}
                        fill
                        sizes="240px"
                      />
                    </div>
                    <div className={`${styles.personMelati} ${styles.melatiLeft}`}>
                      <Image
                        src="/media/java-vibes/decor/ronce-melati.svg"
                        alt=""
                        width={65}
                        height={150}
                      />
                    </div>
                  </div>
                  <p className={styles.personRole}>The Bride</p>
                  <h3 className={styles.personName}>{invitation.bride_name}</h3>
                  <p className={styles.personParents}>{invitation.bride_parents}</p>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.personIgBtn}
                  >
                    <span>@{invitation.bride_short_name.toLowerCase()}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </article>

                {/* Symmetrical Divider Gunungan & Ampersand */}
                <div className={styles.coupleDivider}>
                  <Image
                    src="/media/java-vibes/decor/gunungan.svg"
                    alt=""
                    width={60}
                    height={90}
                  />
                  <span className={styles.ampersand}>&</span>
                </div>

                {/* Mempelai Pria */}
                <article className={styles.personCard}>
                  <div className={styles.personArchWrap}>
                    <div className={styles.personPhotoInner}>
                      <Image
                        src={groomPhotoPath}
                        alt={invitation.groom_name}
                        fill
                        sizes="240px"
                      />
                    </div>
                    <div className={`${styles.personMelati} ${styles.melatiRight}`}>
                      <Image
                        src="/media/java-vibes/decor/ronce-melati.svg"
                        alt=""
                        width={65}
                        height={150}
                      />
                    </div>
                  </div>
                  <p className={styles.personRole}>The Groom</p>
                  <h3 className={styles.personName}>{invitation.groom_name}</h3>
                  <p className={styles.personParents}>{invitation.groom_parents}</p>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.personIgBtn}
                  >
                    <span>@{invitation.groom_short_name.toLowerCase()}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </article>
              </div>
            </section>

            {/* SECTION 3: ACARA & COUNTDOWN */}
            <section className={styles.section} id="acara">
              <div className={styles.sectionTitleBlock}>
                <p className={styles.sectionKicker}>Save The Date</p>
                <h2 className={styles.sectionTitle}>Moment Bahagia</h2>
              </div>

              {/* Countdown Timer */}
              <div className={styles.countdownContainer}>
                <div className={styles.countdownGrid}>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownValue}>
                      {String(timeLeft.days).padStart(2, "0")}
                    </span>
                    <span className={styles.countdownLabel}>Hari</span>
                  </div>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownValue}>
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className={styles.countdownLabel}>Jam</span>
                  </div>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownValue}>
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className={styles.countdownLabel}>Menit</span>
                  </div>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownValue}>
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className={styles.countdownLabel}>Detik</span>
                  </div>
                </div>

                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.btnCalendar}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                  </svg>
                  <span>Simpan ke Google Calendar</span>
                </a>
              </div>

              {/* Event Cards (Akad & Resepsi) */}
              <div className={styles.eventsGrid}>
                {/* Akad Nikah */}
                <article className={styles.eventCard}>
                  <Image
                    src="/media/java-vibes/decor/corner-gold.svg"
                    alt=""
                    width={36}
                    height={36}
                    className={`${styles.cornerFloret} ${styles.cornerTopLeft}`}
                  />
                  <Image
                    src="/media/java-vibes/decor/corner-gold.svg"
                    alt=""
                    width={36}
                    height={36}
                    className={`${styles.cornerFloret} ${styles.cornerTopRight}`}
                  />
                  <span className={styles.eventBadge}>Akad Nikah</span>
                  <h3 className={styles.eventDateText}>Sabtu, 12 Desember 2026</h3>
                  <p className={styles.eventTimeText}>{invitation.ceremony_time}</p>

                  <div className={styles.eventLocationBlock}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className={styles.locationPinIcon}>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <h4>{invitation.venue_name}</h4>
                    <p>{invitation.venue_address}</p>
                  </div>

                  {invitation.maps_url && (
                    <a
                      href={invitation.maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.btnEventMaps}
                    >
                      <span>Petunjuk ke Lokasi</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </article>

                {/* Resepsi Pernikahan */}
                <article className={styles.eventCard}>
                  <Image
                    src="/media/java-vibes/decor/corner-gold.svg"
                    alt=""
                    width={36}
                    height={36}
                    className={`${styles.cornerFloret} ${styles.cornerTopLeft}`}
                  />
                  <Image
                    src="/media/java-vibes/decor/corner-gold.svg"
                    alt=""
                    width={36}
                    height={36}
                    className={`${styles.cornerFloret} ${styles.cornerTopRight}`}
                  />
                  <span className={styles.eventBadge}>Resepsi Pernikahan</span>
                  <h3 className={styles.eventDateText}>Sabtu, 12 Desember 2026</h3>
                  <p className={styles.eventTimeText}>{invitation.reception_time}</p>

                  <div className={styles.eventLocationBlock}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className={styles.locationPinIcon}>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <h4>{invitation.venue_name}</h4>
                    <p>{invitation.venue_address}</p>
                  </div>

                  {invitation.maps_url && (
                    <a
                      href={invitation.maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.btnEventMaps}
                    >
                      <span>Petunjuk ke Lokasi</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </article>
              </div>
            </section>

            {/* SECTION 4: KISAH CINTA (OUR LOVE STORY) */}
            <section className={styles.section} id="kisah">
              <div className={styles.sectionTitleBlock}>
                <p className={styles.sectionKicker}>Perjalanan Cinta</p>
                <h2 className={styles.sectionTitle}>Our Love Story</h2>
              </div>

              {storyImagePath && (
                <div className={styles.storyHeroImageWrap}>
                  <Image
                    src={storyImagePath}
                    alt="Kisah cinta Intan & Difa"
                    fill
                    sizes="(max-width: 900px) 100vw, 540px"
                    className={styles.storyHeroImage}
                  />
                  <div className={styles.storyHeroOverlay} />
                </div>
              )}

              <div className={styles.storyTimeline}>
                {invitation.story.map((item, index) => (
                  <div className={styles.storyItem} key={item.year + index}>
                    <div className={styles.storyBullet}>
                      <Image
                        src="/media/java-vibes/decor/gunungan.svg"
                        alt=""
                        width={24}
                        height={34}
                      />
                    </div>
                    <div className={styles.storyCard}>
                      <span className={styles.storyYear}>{item.year}</span>
                      <h3 className={styles.storyTitle}>{item.title}</h3>
                      <p className={styles.storyText}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 5: GALERI PREWEDDING */}
            {galleryPaths.length > 0 && (
              <section className={styles.section} id="galeri">
                <div className={styles.sectionTitleBlock}>
                  <p className={styles.sectionKicker}>Dokumentasi</p>
                  <h2 className={styles.sectionTitle}>Galeri Bahagia</h2>
                </div>

                <div className={styles.galleryGrid}>
                  {galleryPaths.map((path, idx) => (
                    <button
                      type="button"
                      key={path + idx}
                      className={`${styles.galleryItem} ${idx === 0 ? styles.galleryItemLarge : ""}`}
                      onClick={() => setLightboxIndex(idx)}
                      aria-label={`Lihat foto ${idx + 1}`}
                    >
                      <Image
                        src={path}
                        alt={`Galeri ${idx + 1}`}
                        fill
                        sizes="(max-width: 600px) 50vw, 300px"
                      />
                      <div className={styles.galleryHover}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 6: TANDA KASIH (AMPLOP DIGITAL & KADO) */}
            <section className={styles.section} id="hadiah">
              <div className={styles.sectionTitleBlock}>
                <p className={styles.sectionKicker}>Tanda Kasih</p>
                <h2 className={styles.sectionTitle}>Wedding Gift</h2>
                <p className={styles.giftLead}>
                  Doa restu Anda merupakan karunia terindah bagi kami. Bagi keluarga dan sahabat yang hendak memberikan tanda kasih, dapat melalui:
                </p>
              </div>

              <div className={styles.giftCardsWrap}>
                {/* Kartu Bank BCA */}
                <div className={styles.giftCard}>
                  <div className={styles.giftCardHeader}>
                    <span className={styles.bankNameBadge}>BCA</span>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                  </div>
                  <p className={styles.giftCardOwner}>Atas Nama: {invitation.gift_info.account_name || "Intan Permatasari"}</p>
                  <p className={styles.giftCardNumber}>{invitation.gift_info.account_number || "1234567890"}</p>

                  <button
                    type="button"
                    className={styles.btnCopy}
                    onClick={() =>
                      copyToClipboard(
                        invitation.gift_info.account_number || "1234567890",
                        "bca"
                      )
                    }
                  >
                    {copiedKey === "bca" ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                        <span>Salin No. Rekening</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Kirim Hadiah Fisik */}
                <div className={styles.giftCard}>
                  <div className={styles.giftCardHeader}>
                    <span className={styles.bankNameBadge}>Kirim Kado</span>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36 2.38 3.24L17 10.83 14.92 8H20v6z" />
                    </svg>
                  </div>
                  <p className={styles.giftCardOwner}>Penerima: Intan &amp; Difa</p>
                  <p className={styles.giftCardAddress}>
                    Jl. Ahmad Yani No.22, Marga Jaya, Kec. Bekasi Selatan, Kota Bekasi 17141
                  </p>

                  <button
                    type="button"
                    className={styles.btnCopy}
                    onClick={() =>
                      copyToClipboard(
                        "Jl. Ahmad Yani No.22, Marga Jaya, Kec. Bekasi Selatan, Kota Bekasi 17141",
                        "alamat"
                      )
                    }
                  >
                    {copiedKey === "alamat" ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                        <span>Salin Alamat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 7: UCAPAN & DOA (GUESTBOOK & RSVP) - TERHUBUNG KE SUPABASE */}
            <section className={styles.section} id="ucapan">
              <div className={styles.sectionTitleBlock}>
                <p className={styles.sectionKicker}>Doa Restu</p>
                <h2 className={styles.sectionTitle}>Kirim Ucapan</h2>
                <p className={styles.giftLead}>
                  Untaian doa dan ucapan selamat dari Bapak/Ibu/Saudara/i sangat berarti bagi langkah baru kami.
                </p>
              </div>

              <div className={styles.rsvpCard}>
                <Image
                  src="/media/java-vibes/decor/corner-gold.svg"
                  alt=""
                  width={36}
                  height={36}
                  className={`${styles.cornerFloret} ${styles.cornerTopLeft}`}
                />
                <Image
                  src="/media/java-vibes/decor/corner-gold.svg"
                  alt=""
                  width={36}
                  height={36}
                  className={`${styles.cornerFloret} ${styles.cornerTopRight}`}
                />

                <form onSubmit={handleSubmitRsvp} className={styles.rsvpForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="rsvpName">Nama Tamu</label>
                    <input
                      id="rsvpName"
                      type="text"
                      required
                      placeholder="Masukkan nama Anda"
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Konfirmasi Kehadiran</label>
                    <div className={styles.attendanceRadioGroup}>
                      <label className={`${styles.radioCard} ${rsvpAttendance === "attending" ? styles.radioCardActive : ""}`}>
                        <input
                          type="radio"
                          name="attendance"
                          value="attending"
                          checked={rsvpAttendance === "attending"}
                          onChange={() => setRsvpAttendance("attending")}
                        />
                        <span>Hadir</span>
                      </label>
                      <label className={`${styles.radioCard} ${rsvpAttendance === "not_attending" ? styles.radioCardActive : ""}`}>
                        <input
                          type="radio"
                          name="attendance"
                          value="not_attending"
                          checked={rsvpAttendance === "not_attending"}
                          onChange={() => setRsvpAttendance("not_attending")}
                        />
                        <span>Berhalangan</span>
                      </label>
                    </div>
                  </div>

                  {rsvpAttendance === "attending" && (
                    <div className={styles.formGroup}>
                      <label htmlFor="rsvpCount">Jumlah Tamu Hadir</label>
                      <select
                        id="rsvpCount"
                        value={rsvpGuestCount}
                        onChange={(e) => setRsvpGuestCount(Number(e.target.value))}
                      >
                        <option value={1}>1 Orang</option>
                        <option value={2}>2 Orang</option>
                        <option value={3}>3 Orang</option>
                        <option value={4}>4 Orang</option>
                      </select>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="rsvpMessage">Pesan Ucapan &amp; Doa Restu</label>
                    <textarea
                      id="rsvpMessage"
                      rows={4}
                      placeholder="Tuliskan doa restu panjenengan untuk kedua mempelai..."
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                    />
                  </div>

                  {statusMessage && (
                    <div
                      className={`${styles.formStatusAlert} ${
                        statusMessage.type === "success" ? styles.statusSuccess : styles.statusError
                      }`}
                    >
                      {statusMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={styles.btnSubmitRsvp}
                  >
                    {submitting ? "Mengirim Doa Restu..." : "Kirim Ucapan & Doa"}
                  </button>
                </form>

                {/* Realtime Wishes Feed */}
                <div className={styles.wishesFeedContainer}>
                  <div className={styles.wishesHeader}>
                    <h4>Doa Restu Sahabat &amp; Kerabat</h4>
                    <span className={styles.wishesCountBadge}>{greetings.length} Ucapan</span>
                  </div>

                  <div className={styles.wishesList}>
                    {greetings.map((item, idx) => (
                      <article className={styles.wishItem} key={item.id || idx}>
                        <div className={styles.wishAvatar}>
                          {item.guest_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className={styles.wishContent}>
                          <div className={styles.wishMeta}>
                            <strong>{item.guest_name}</strong>
                            {item.attendance === "attending" && (
                              <span className={styles.badgeHadir}>Hadir</span>
                            )}
                            {item.attendance === "not_attending" && (
                              <span className={styles.badgeTidakHadir}>Berhalangan</span>
                            )}
                          </div>
                          <p className={styles.wishText}>{item.message}</p>
                          <small className={styles.wishTime}>
                            {formatRelativeTime(item.created_at)}
                          </small>
                        </div>
                      </article>
                    ))}

                    {greetings.length === 0 && (
                      <p className={styles.noWishesText}>
                        Jadilah yang pertama mengirimkan ucapan &amp; doa restu!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 8: PENUTUP & FOOTER */}
            <footer className={styles.closingSection}>
              <div className={styles.closingGunungan}>
                <Image
                  src="/media/java-vibes/decor/gunungan.svg"
                  alt=""
                  width={110}
                  height={160}
                />
              </div>

              <p className={styles.closingText}>
                {invitation.closing_text ||
                  "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu."}
              </p>
              <p className={styles.closingGreeting}>
                {invitation.closing_greeting || "Wassalamu'alaikum Warahmatullahi Wabarakatuh"}
              </p>

              <h2 className={styles.closingCoupleNames}>{coupleNames}</h2>

              <div className={styles.brandFooter}>
                <small>DIGITAL INVITATION BY</small>
                <Image
                  src={BRAND.logoPath}
                  alt={BRAND.name}
                  width={300}
                  height={110}
                  className={styles.brandLogo}
                />
                <span>© 2026 {BRAND.name}. All Rights Reserved.</span>
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={styles.lightboxCloseBtn}
            onClick={() => setLightboxIndex(null)}
            aria-label="Tutup foto"
          >
            ✕
          </button>
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lightboxImageWrap}>
              <Image
                src={galleryPaths[lightboxIndex]}
                alt={`Foto galeri ${lightboxIndex + 1}`}
                fill
                sizes="95vw"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className={styles.lightboxControls}>
              <button
                type="button"
                className={styles.lightboxArrow}
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev === 0 ? galleryPaths.length - 1 : prev - 1) : null
                  )
                }
                aria-label="Foto sebelumnya"
              >
                ‹
              </button>
              <span>
                {lightboxIndex + 1} / {galleryPaths.length}
              </span>
              <button
                type="button"
                className={styles.lightboxArrow}
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev === galleryPaths.length - 1 ? 0 : prev + 1) : null
                  )
                }
                aria-label="Foto selanjutnya"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
