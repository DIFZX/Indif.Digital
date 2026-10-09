"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";
import type { Greeting, Invitation } from "@/lib/types";
import { BRAND } from "@/lib/brand";
import { Reveal } from "@/components/reveal";
import styles from "./netflix.module.css";

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
  musicPath: string | null;
  calendarUrl: string;
  themeClassName: string;
};

function formatEventDate(value: string) {
  try {
    const formatted = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date(`${value}T12:00:00+07:00`));
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return value;
  }
}

export function NetflixClientApp({
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
  themeClassName,
}: Props) {
  const [opened, setOpened] = useState(initiallyOpened);
  const [playing, setPlaying] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [amplopOpen, setAmplopOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("hero");

  // Greetings & RSVP state
  const [greetings, setGreetings] = useState<Greeting[]>(initialGreetings);
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpAttendance, setRsvpAttendance] = useState<"attending" | "not_attending">("attending");
  const [rsvpGuestCount, setRsvpGuestCount] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Restore any wishes saved locally across page refreshes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`nikahfix_wishes_${invitation.id}`);
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

  // Images for left desktop showcase slideshow
  const showcaseImages = useMemo(() => {
    return galleryPaths.length > 0 ? galleryPaths.slice(0, 4) : [coverPath];
  }, [galleryPaths, coverPath]);

  // Countdown calculations
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculateCountdown() {
      const target = new Date(`${invitation.event_date}T08:00:00+07:00`).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [invitation.event_date]);

  // Lock body scroll only when cover modal is closed
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

  // Scrollspy for active navigation item
  useEffect(() => {
    if (!opened) return;
    const handleScroll = () => {
      const sections = ["hero", "pemeran", "jadwal", "cerita", "galeri", "hadiah", "ucapan"];
      const scrollPos = window.scrollY + 180;
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
        .catch(() => {
          fallbackCopy(text, markCopied);
        });
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
      message: rsvpMessage.trim() || "Selamat menempuh hidup baru Dita & Fajar, semoga bahagia selalu!",
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
            localStorage.setItem(`nikahfix_wishes_${invitation.id}`, JSON.stringify(next.slice(0, 50)));
          } catch {}
          return next;
        });
        setStatusMessage({ type: "success", text: "Terima kasih! Konfirmasi & ucapan Anda telah tersimpan." });
      } else {
        setGreetings((prev) => {
          const next = [newGreeting, ...prev.filter((g) => g.id !== newGreeting.id)];
          try {
            localStorage.setItem(`nikahfix_wishes_${invitation.id}`, JSON.stringify(next.slice(0, 50)));
          } catch {}
          return next;
        });
        setStatusMessage({ type: "success", text: "Ucapan Anda berhasil dikirim." });
      }
      setRsvpMessage("");
    } catch {
      setGreetings((prev) => {
        const next = [newGreeting, ...prev.filter((g) => g.id !== newGreeting.id)];
        try {
          localStorage.setItem(`nikahfix_wishes_${invitation.id}`, JSON.stringify(next.slice(0, 50)));
        } catch {}
        return next;
      });
      setStatusMessage({ type: "success", text: "Ucapan Anda berhasil ditampilkan." });
      setRsvpMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSendWhatsApp() {
    const groomBride = `${invitation.bride_short_name} & ${invitation.groom_short_name}`;
    const statusText = rsvpAttendance === "attending" ? "Hadir" : "Belum bisa hadir";
    const text = `Halo ${groomBride},\n\nSaya *${rsvpName || displayGuestName}* ingin mengonfirmasi kehadiran:\n- Status: *${statusText}*\n- Jumlah: *${rsvpGuestCount} orang*\n\nUcapan & Doa:\n"${rsvpMessage || "Selamat menempuh hidup baru, semoga bahagia selalu!"}"\n\nTerima kasih!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // Attendance statistics
  const attendingCount = useMemo(() => greetings.filter((g) => g.attendance === "attending").length, [greetings]);
  const notAttendingCount = useMemo(
    () => greetings.filter((g) => g.attendance === "not_attending").length,
    [greetings]
  );
  const totalWishes = greetings.length;
  const eventYear = new Date(invitation.event_date).getFullYear();

  return (
    <div className={themeClassName}>
      {/* Background Audio */}
      {musicPath && (
        <audio
          ref={audioRef}
          src={musicPath}
          loop
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}

      {/* Floating Music Button */}
      {musicPath && opened && (
        <button
          type="button"
          className={`${styles.floatingMusicBtn} ${playing ? styles.floatingMusicPlaying : ""}`}
          onClick={toggleMusic}
          title={playing ? "Matikan Musik" : "Putar Musik"}
          aria-label={playing ? "Matikan Musik" : "Putar Musik"}
        >
          {playing ? (
            <span className={styles.equalizerBars}>
              <span />
              <span />
              <span />
            </span>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4zm4.5 8c0-.62-.15-1.21-.4-1.74l1.52-1.52C18.42 9.58 19 10.73 19 12c0 2.99-1.82 5.56-4.41 6.64l-1.48-1.48C14.86 16.51 16.5 14.48 16.5 12z" />
            </svg>
          )}
        </button>
      )}

      {/* ─── SPLIT LAYOUT (DESKTOP SHOWCASE + MOBILE PANEL) ─── */}
      <div className={styles.layout}>
        {/* LEFT COLUMN: DESKTOP SHOWCASE (Sticky 100vh, hidden on mobile) */}
        <aside className={styles.showcase} aria-label="Visual serial Netflix Dita & Fajar">
          <div className={styles.showcaseSlides}>
            {showcaseImages.map((path, index) => (
              <div
                key={`${path}-${index}`}
                className={styles.showcaseSlide}
                style={{
                  animationDelay: `${index * 7}s`,
                }}
              >
                <Image
                  src={path}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="65vw"
                  style={{ objectFit: "cover", objectPosition: "center 30%" }}
                />
              </div>
            ))}
          </div>

          <div className={styles.showcaseShade} />

          {/* Centered Showcase Frame ala Blue Garden */}
          <div className={styles.showcaseFrame}>
            <span className={styles.showcaseBadgePill}>A NETFLIX ORIGINAL WEDDING</span>
            <h2 className={styles.showcaseLogo}>NIKAHFIX</h2>
            <p className={styles.showcaseSub}>THE WEDDING OF</p>
            <h1 className={styles.showcaseCoupleTitle}>{coupleNames}</h1>
            <div className={styles.showcaseDivider} />
            <small className={styles.showcaseDate}>{formatEventDate(invitation.event_date)}</small>
            <div className={styles.showcaseMetaSpecs}>
              <span className={styles.matchScore}>99% Match</span>
              <span>•</span>
              <span className={styles.ageBadge}>SU</span>
              <span>•</span>
              <span>Ultra HD 4K</span>
              <span>•</span>
              <span>Dolby Atmos</span>
            </div>
          </div>

          <small className={styles.showcaseBrand}>
            {BRAND.name} · Digital Invitation
          </small>
        </aside>

        {/* RIGHT COLUMN: MOBILE FOCUSED PANEL (Always mobile width on desktop, 100% on phones) */}
        <div className={styles.panel}>
          {/* COVER SCREEN (BUKA UNDANGAN) INSIDE PANEL */}
          <div className={`${styles.coverModal} ${opened ? styles.coverModalOpened : ""}`}>
            <div className={styles.coverBackdrop}>
              <Image
                src={coverPath}
                alt={coupleNames}
                fill
                sizes="(max-width: 900px) 100vw, 480px"
                style={{ objectFit: "cover", objectPosition: "center 20%" }}
                priority
              />
            </div>
            <div className={styles.coverGradient} />

            <div className={styles.coverContent}>
              <div className={styles.coverBrandWrapper}>
                <div className={styles.netflixBadgePill}>A NETFLIX ORIGINAL WEDDING</div>
                <h2 className={styles.coverNetflixLogo}>NIKAHFIX</h2>
              </div>

              <p className={styles.coverSubTitle}>THE WEDDING OF</p>
              <h1 className={styles.coverCoupleTitle}>{coupleNames}</h1>

              <div className={styles.coverMetaRow}>
                <span className={styles.matchBadge}>99% Match</span>
                <span className={styles.metaDivider}>•</span>
                <span>{eventYear}</span>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.ageBadge}>SU</span>
                <span className={styles.metaDivider}>•</span>
                <span>Dokumenter</span>
              </div>

              {/* Guest Recipient Box */}
              <div className={styles.guestCard}>
                <p className={styles.guestDearLabel}>Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                <div className={styles.guestNameWrapper}>
                  <div className={styles.guestAvatar}>
                    <Image src={profilePath} alt={displayGuestName} fill style={{ objectFit: "cover" }} />
                  </div>
                  <h3 className={styles.guestNameText}>{displayGuestName}</h3>
                </div>
                <p className={styles.guestApology}>*Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
              </div>

              {/* Primary CTA Button */}
              <div className={styles.coverButtonWrapper}>
                <button
                  type="button"
                  className={styles.openInvitationButton}
                  onClick={openInvitation}
                  id="btn-buka-undangan"
                >
                  <span className={styles.openButtonIcon}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </span>
                  <span className={styles.openButtonText}>Buka Undangan</span>
                </button>
                <span className={styles.audioHint}>♫ Dilengkapi dengan Audio</span>
              </div>
            </div>
          </div>

          {/* MAIN INVITATION (MOBILE FOCUSED CONTENT) */}
          <main className={styles.mainExperience}>
            {/* Sticky Header Inside Panel */}
            <header className={styles.topNavbar}>
              <div className={styles.navContainer}>
                <a href="#hero" className={styles.navLogo}>
                  NIKAHFIX
                </a>
                <span className={styles.navSeriesTag}>WEDDING SPECIAL</span>
              </div>
            </header>

            {/* Floating Bottom Nav for Mobile Screens */}
            <nav className={styles.bottomNavMobile}>
              <a href="#hero" className={activeSection === "hero" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <span>Beranda</span>
              </a>
              <a href="#pemeran" className={activeSection === "pemeran" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                <span>Pemeran</span>
              </a>
              <a href="#jadwal" className={activeSection === "jadwal" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                </svg>
                <span>Jadwal</span>
              </a>
              <a href="#cerita" className={activeSection === "cerita" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                </svg>
                <span>Cerita</span>
              </a>
              <a href="#galeri" className={activeSection === "galeri" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                <span>Galeri</span>
              </a>
              <a href="#hadiah" className={activeSection === "hadiah" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1Z" />
                </svg>
                <span>Hadiah</span>
              </a>
              <a href="#ucapan" className={activeSection === "ucapan" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
                <span>Ucapan</span>
              </a>
            </nav>

            {/* ─── 1. HERO BANNER ─── */}
            <section className={styles.heroSection} id="hero">
              <div className={styles.heroBackdrop}>
                <Image
                  src={coverPath}
                  alt={coupleNames}
                  fill
                  sizes="(max-width: 900px) 100vw, 480px"
                  style={{ objectFit: "cover", objectPosition: "center 15%" }}
                  priority
                />
              </div>
              <div className={styles.heroShadeBottom} />

              <div className={styles.heroContent}>
                <Reveal direction="up" delay={60}>
                  <div className={styles.heroBadgeRow}>
                    <span className={styles.redBadge}>DOCUMENTER</span>
                    <span className={styles.topTenBadge}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      TOP 1 DI HATI KAMI
                    </span>
                  </div>
                </Reveal>

                <Reveal direction="up" delay={120}>
                  <h1 className={styles.heroTitle}>{coupleNames}</h1>
                </Reveal>

                {/* Match & Specs */}
                <Reveal direction="up" delay={180}>
                  <div className={styles.heroMetaSpecs}>
                    <span className={styles.matchScore}>99% Match</span>
                    <span className={styles.specYear}>{eventYear}</span>
                    <span className={styles.ratingBadge}>SU</span>
                    <span className={styles.specDuration}>1 Season</span>
                    <span className={styles.qualityBadge}>Ultra HD 4K</span>
                  </div>

                  {/* Coming Soon Highlight */}
                  <div className={styles.comingSoonBanner}>
                    <span className={styles.comingSoonPulse} />
                    <span>Coming Soon on {formatEventDate(invitation.event_date)}</span>
                  </div>
                </Reveal>

                {/* Synopsis */}
                <Reveal direction="up" delay={240}>
                  <p className={styles.heroSynopsis}>
                    {invitation.opening_text ||
                      `Setelah ${coupleNames} dipertemukan dalam situasi yang tepat, di mana keduanya telah siap untuk memulai hubungan bersama, tibalah mereka di awal perjalanan baru menuju pernikahan.`}
                  </p>

                  {/* Holy Verse / Quote */}
                  <div className={styles.heroQuoteBox}>
                    <p className={styles.heroQuoteText}>
                      &ldquo;{invitation.quote_text}&rdquo;
                    </p>
                    <span className={styles.heroQuoteSource}>{invitation.quote_source}</span>
                  </div>
                </Reveal>

                {/* Countdown Timer */}
                <Reveal direction="scale" delay={300}>
                  <div className={styles.countdownContainer}>
                    <div className={styles.countdownItem}>
                      <span className={styles.countdownNumber}>
                        {String(timeLeft.days).padStart(2, "0")}
                      </span>
                      <span className={styles.countdownLabel}>Days</span>
                    </div>
                    <div className={styles.countdownColon}>:</div>
                    <div className={styles.countdownItem}>
                      <span className={styles.countdownNumber}>
                        {String(timeLeft.hours).padStart(2, "0")}
                      </span>
                      <span className={styles.countdownLabel}>Hours</span>
                    </div>
                    <div className={styles.countdownColon}>:</div>
                    <div className={styles.countdownItem}>
                      <span className={styles.countdownNumber}>
                        {String(timeLeft.minutes).padStart(2, "0")}
                      </span>
                      <span className={styles.countdownLabel}>Min</span>
                    </div>
                    <div className={styles.countdownColon}>:</div>
                    <div className={styles.countdownItem}>
                      <span className={styles.countdownNumber}>
                        {String(timeLeft.seconds).padStart(2, "0")}
                      </span>
                      <span className={styles.countdownLabel}>Sec</span>
                    </div>
                  </div>
                </Reveal>

                {/* Action Buttons */}
                <Reveal direction="up" delay={360}>
                  <div className={styles.heroActionButtons}>
                    <a href="#jadwal" className={styles.heroPlayButton}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Putar Acara
                    </a>
                    <a href="#pemeran" className={styles.heroInfoButton}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      </svg>
                      Info Detail
                    </a>
                    <a
                      href={calendarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.heroMyListButton}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                      Simpan Kalender
                    </a>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* ─── 2. LEAD ACTOR (GROOM & BRIDE) ─── */}
            <section className={styles.sectionRow} id="pemeran">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionCategoryTag}>LEAD ACTOR</span>
                  <h2 className={styles.sectionTitle}>Groom &amp; Bride</h2>
                  <p className={styles.sectionSubtitle}>Kenali siapa yang akan menikah</p>
                </div>
              </Reveal>

              <div className={styles.castGrid}>
                {/* The Groom: Fajar */}
                <Reveal direction="left" delay={100}>
                  <div className={styles.castCard}>
                    <div className={styles.castImageContainer}>
                      <Image
                        src={groomPhotoPath}
                        alt={invitation.groom_name}
                        fill
                        sizes="(max-width: 900px) 100vw, 440px"
                        style={{ objectFit: "cover", objectPosition: "center 20%" }}
                      />
                      <div className={styles.castImageOverlay} />
                      <span className={styles.castRolePill}>THE GROOM</span>
                    </div>
                    <div className={styles.castDetails}>
                      <h3 className={styles.castActorName}>{invitation.groom_name}</h3>
                      <p className={styles.castParents}>{invitation.groom_parents}</p>
                      <div className={styles.castSocialAction}>
                        <a
                          href="https://instagram.com/fajarsidik"
                          target="_blank"
                          rel="noreferrer"
                          className={styles.instagramButton}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          @fajarsidik
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* The Bride: Dita */}
                <Reveal direction="right" delay={200}>
                  <div className={styles.castCard}>
                    <div className={styles.castImageContainer}>
                      <Image
                        src={bridePhotoPath}
                        alt={invitation.bride_name}
                        fill
                        sizes="(max-width: 900px) 100vw, 440px"
                        style={{ objectFit: "cover", objectPosition: "center 20%" }}
                      />
                      <div className={styles.castImageOverlay} />
                      <span className={styles.castRolePill}>THE BRIDE</span>
                    </div>
                    <div className={styles.castDetails}>
                      <h3 className={styles.castActorName}>{invitation.bride_name}</h3>
                      <p className={styles.castParents}>{invitation.bride_parents}</p>
                      <div className={styles.castSocialAction}>
                        <a
                          href="https://instagram.com/ditamaharani"
                          target="_blank"
                          rel="noreferrer"
                          className={styles.instagramButton}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          @ditamaharani
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* ─── 3. ON SCHEDULE (EPISODES) ─── */}
            <section className={styles.sectionRow} id="jadwal">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionCategoryTag}>ON SCHEDULE</span>
                  <h2 className={styles.sectionTitle}>Timeline &amp; Location</h2>
                  <p className={styles.sectionSubtitle}>Acara yang akan tayang</p>
                </div>
              </Reveal>

              <div className={styles.episodesList}>
                {/* Episode 1: AKAD NIKAH */}
                <Reveal direction="left" delay={100}>
                  <div className={styles.episodeCard}>
                    <div className={styles.episodeThumbnailWrapper}>
                      <Image
                        src={galleryPaths[1] || coverPath}
                        alt="Akad Nikah"
                        fill
                        sizes="(max-width: 900px) 100vw, 440px"
                        style={{ objectFit: "cover" }}
                      />
                      <div className={styles.episodeProgressBar}>
                        <div className={styles.episodeProgressFill} style={{ width: "100%" }} />
                      </div>
                      <span className={styles.episodeNumberBadge}>EP 01</span>
                    </div>
                    <div className={styles.episodeInfo}>
                      <div className={styles.episodeTopBadgeRow}>
                        <span className={styles.episodeBadge}>THE SACRED CEREMONY</span>
                        <span className={styles.episodeTimeTag}>{invitation.ceremony_time}</span>
                      </div>
                      <h3 className={styles.episodeMainTitle}>AKAD NIKAH</h3>
                      <p className={styles.episodeDate}>{formatEventDate(invitation.event_date)}</p>
                      <p className={styles.episodeVenue}>
                        <strong>{invitation.venue_name}</strong>
                        <br />
                        {invitation.venue_address}
                      </p>
                      <div className={styles.episodeButtonRow}>
                        {invitation.maps_url && (
                          <a
                            href={invitation.maps_url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.episodeMapButton}
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            Lihat Lokasi
                          </a>
                        )}
                        <a
                          href={calendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.episodeCalendarButton}
                        >
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" />
                          </svg>
                          Simpan Acara
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Episode 2: RESEPSI */}
                <Reveal direction="right" delay={200}>
                  <div className={styles.episodeCard}>
                    <div className={styles.episodeThumbnailWrapper}>
                      <Image
                        src={galleryPaths[4] || storyImagePath}
                        alt="Resepsi"
                        fill
                        sizes="(max-width: 900px) 100vw, 440px"
                        style={{ objectFit: "cover" }}
                      />
                      <div className={styles.episodeProgressBar}>
                        <div className={styles.episodeProgressFill} style={{ width: "70%" }} />
                      </div>
                      <span className={styles.episodeNumberBadge}>EP 02</span>
                    </div>
                    <div className={styles.episodeInfo}>
                      <div className={styles.episodeTopBadgeRow}>
                        <span className={styles.episodeBadge}>THE CELEBRATION</span>
                        <span className={styles.episodeTimeTag}>{invitation.reception_time}</span>
                      </div>
                      <h3 className={styles.episodeMainTitle}>RESEPSI</h3>
                      <p className={styles.episodeDate}>{formatEventDate(invitation.event_date)}</p>
                      <p className={styles.episodeVenue}>
                        <strong>{invitation.venue_name}</strong>
                        <br />
                        {invitation.venue_address}
                      </p>
                      <div className={styles.episodeButtonRow}>
                        {invitation.maps_url && (
                          <a
                            href={invitation.maps_url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.episodeMapButton}
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            Lihat Lokasi
                          </a>
                        )}
                        <a
                          href={calendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.episodeCalendarButton}
                        >
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" />
                          </svg>
                          Simpan Acara
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Bonus: Live Streaming */}
                <Reveal direction="scale" delay={300}>
                  <div className={styles.liveStreamCard}>
                    <div className={styles.liveStreamThumbnail}>
                      <Image
                        src={coverPath}
                        alt="Live Streaming"
                        fill
                        sizes="(max-width: 900px) 100vw, 440px"
                        style={{ objectFit: "cover" }}
                      />
                      <div className={styles.liveStreamBadgeRow}>
                        <span className={styles.liveRedPill}>LIVE</span>
                      </div>
                      <div className={styles.centerPlayCircle}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className={styles.liveStreamInfo}>
                      <span className={styles.episodeBadge}>STREAMING</span>
                      <h3 className={styles.liveStreamTitle}>Wedding Live Streaming</h3>
                      <p className={styles.liveStreamSub}>tayangan akad nikah melalui siaran live</p>
                      <p className={styles.liveStreamDesc}>
                        Temui kami secara virtual untuk menyaksikan serangkaian acara akad nikah kami yang
                        disiarkan secara langsung melalui tautan di bawah ini:
                      </p>
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        className={styles.liveStreamWatchButton}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                        </svg>
                        Tonton Live Streaming
                      </a>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* ─── 4. ORIGINAL SERIES (CERITA KAMI) ─── */}
            <section className={styles.sectionRow} id="cerita">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionCategoryTag}>ORIGINAL SERIES</span>
                  <h2 className={styles.sectionTitle}>CERITA KAMI</h2>
                  <p className={styles.sectionSubtitle}>Season 1 &ndash; Permulaan</p>
                </div>
              </Reveal>

              <div className={styles.storyEpisodesGrid}>
                {(() => {
                  const storyList =
                    invitation.story && invitation.story.length > 0
                      ? invitation.story
                      : [
                          {
                            title: "Awal Perkenalan",
                            year: "2022",
                            text: "Bukan karena bertemu lalu berjodoh, karena berjodohlah maka kita berdua dipertemukan. Berawal dari tidak sengaja berkenalan di instagram, karena ternyata kita berdua tinggal di kota yang sama, Ehime Japan. Selang beberapa waktu kita memutuskan untuk bertemu dan menjalin hubungan.",
                          },
                          {
                            title: "Lamaran",
                            year: "2024",
                            text: "Singkat cerita setelah pertemuan dan perkenalan di tahun 2022. Akhirnya kita berdua memutuskan untuk berkomitmen melanjutkan hubungan ini ke jenjang yang lebih serius, dengan melangkah satu langkah lebih dekat. Fajar datang bersama keluarga besarnya untuk melamar Dita. Lamaran diterima dengan baik oleh keluarga Dita dan di hari itu kami sekeluarga menentukan tanggal pernikahan kita berdua.",
                          },
                          {
                            title: "Menikah",
                            year: String(eventYear),
                            text: "Bismillah tepat pada 12 Desember 2026 kita berdua akan membuka cerita baru dengan status yang baru juga yaitu sepasang Suami Istri. Perjalanan cerita kita akhirnya bermuara di jenjang pernikahan semoga Allah memberikan kelancaran dan menjadikan kami keluarga yang Sakinah Mawaddah Warahmah. Aamiin.",
                          },
                        ];
                  const thumbnails = [
                    galleryPaths[1] || coverPath,
                    galleryPaths[4] || storyImagePath,
                    galleryPaths[0] || coverPath,
                  ];

                  return storyList.map((item, idx) => (
                    <Reveal
                      key={idx}
                      direction={idx % 2 === 0 ? "left" : "right"}
                      delay={(idx % 3) * 120}
                    >
                      <div className={styles.storyCard}>
                        <div className={styles.storyThumbnailWrapper}>
                          <Image
                            src={thumbnails[idx % thumbnails.length]}
                            alt={item.title}
                            fill
                            sizes="(max-width: 900px) 100vw, 440px"
                            style={{ objectFit: "cover" }}
                          />
                          <div className={styles.storyPlayIconCircle}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <span className={styles.storyEpBadge}>EP 0{idx + 1}</span>
                        </div>
                        <div className={styles.storyCardBody}>
                          <div className={styles.storyHeader}>
                            <span className={styles.storyEpNum}>0{idx + 1}</span>
                            <div className={styles.storyTitleBlock}>
                              <h3 className={styles.storyCardTitle}>{item.title}</h3>
                              <span className={styles.storyYearBadge}>{item.year}</span>
                            </div>
                          </div>
                          <p className={styles.storyText}>{item.text}</p>
                        </div>
                      </div>
                    </Reveal>
                  ));
                })()}
              </div>
            </section>

            {/* ─── 5. CINEMATIC GALLERY ─── */}
            <section className={styles.sectionRow} id="galeri">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionCategoryTag}>CINEMATIC GALLERY</span>
                  <h2 className={styles.sectionTitle}>PILIHAN UNTUK KAMU</h2>
                  <p className={styles.sectionSubtitle}>Momen prewedding yang dipilih secara khusus</p>
                </div>
              </Reveal>

              <div className={styles.galleryGrid}>
                {galleryPaths.map((path, idx) => (
                  <Reveal key={idx} direction="scale" delay={(idx % 4) * 80}>
                    <div
                      className={styles.galleryCard}
                      onClick={() => setLightboxIndex(idx)}
                    >
                      <div className={styles.galleryImageInner}>
                        <Image
                          src={path}
                          alt={`Prewedding ${idx + 1}`}
                          fill
                          sizes="(max-width: 900px) 50vw, 220px"
                          style={{ objectFit: "cover" }}
                        />
                        <div className={styles.galleryCardHover}>
                          <span className={styles.galleryPlayIcon}>
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                          <span className={styles.galleryCardTag}>Foto {idx + 1}</span>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Lightbox Modal */}
              {lightboxIndex !== null && (
                <div className={styles.lightboxModal} onClick={() => setLightboxIndex(null)}>
                  <div
                    className={styles.lightboxDialog}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={styles.lightboxCloseBtn}
                      onClick={() => setLightboxIndex(null)}
                    >
                      ✕
                    </button>
                    <div className={styles.lightboxImageWrapper}>
                      <Image
                        src={galleryPaths[lightboxIndex]}
                        alt="Lightbox"
                        fill
                        sizes="90vw"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div className={styles.lightboxFooter}>
                      <span>
                        Foto {lightboxIndex + 1} dari {galleryPaths.length}
                      </span>
                      <div className={styles.lightboxNavButtons}>
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxIndex((prev) =>
                              prev! > 0 ? prev! - 1 : galleryPaths.length - 1
                            )
                          }
                        >
                          ‹ Sebelumnya
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxIndex((prev) =>
                              prev! < galleryPaths.length - 1 ? prev! + 1 : 0
                            )
                          }
                        >
                          Selanjutnya ›
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ─── 6. DIGITAL ENVELOPE (WEDDING GIFT) ─── */}
            <section className={styles.sectionRow} id="hadiah">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionCategoryTag}>DIGITAL ENVELOPE</span>
                  <h2 className={styles.sectionTitle}>Wedding Gift</h2>
                  <p className={styles.sectionSubtitle}>
                    Tanda kasih yang paling berharga untuk kami
                  </p>
                </div>
              </Reveal>

              <Reveal direction="scale" delay={100}>
                <div className={styles.giftToggleWrapper}>
                  <button
                    type="button"
                    className={styles.giftToggleBtn}
                    onClick={() => setAmplopOpen(!amplopOpen)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                    {amplopOpen ? "Tutup Amplop Digital ▲" : "Klik Disini Amplop Digital ▼"}
                  </button>
                </div>
              </Reveal>

              {amplopOpen && (
                <div className={styles.giftCardsContainer}>
                  {/* Bank Card 1: BCA (Fajar) */}
                  <Reveal direction="left" delay={100}>
                    <div className={styles.bankAtmCard}>
                      <div className={styles.bankCardHeader}>
                        <span className={styles.bankBrandName}>
                          {invitation.gift_info.bank || "BCA"}
                        </span>
                        <span className={styles.chipSim}>💳 CHIP</span>
                      </div>
                      <div className={styles.bankCardNumber}>
                        {invitation.gift_info.account_number || "7125091428"}
                      </div>
                      <div className={styles.bankCardFooter}>
                        <div>
                          <span className={styles.bankHolderLabel}>ATAS NAMA</span>
                          <p className={styles.bankHolderName}>
                            {invitation.gift_info.account_name || "Fajar Sidik"}
                          </p>
                        </div>
                        <button
                          type="button"
                          className={styles.copyBtn}
                          onClick={() =>
                            copyToClipboard(
                              invitation.gift_info.account_number || "7125091428",
                              "bca"
                            )
                          }
                        >
                          {copiedKey === "bca" ? "✓ Tersalin!" : "Salin Rekening"}
                        </button>
                      </div>
                    </div>
                  </Reveal>

                  {/* Bank Card 2: MANDIRI (Dita) */}
                  <Reveal direction="right" delay={200}>
                    <div className={styles.bankAtmCard}>
                      <div className={styles.bankCardHeader}>
                        <span className={styles.bankBrandName}>MANDIRI</span>
                        <span className={styles.chipSim}>💳 CHIP</span>
                      </div>
                      <div className={styles.bankCardNumber}>1370019283741</div>
                      <div className={styles.bankCardFooter}>
                        <div>
                          <span className={styles.bankHolderLabel}>ATAS NAMA</span>
                          <p className={styles.bankHolderName}>{invitation.bride_name}</p>
                        </div>
                        <button
                          type="button"
                          className={styles.copyBtn}
                          onClick={() => copyToClipboard("1370019283741", "mandiri")}
                        >
                          {copiedKey === "mandiri" ? "✓ Tersalin!" : "Salin Rekening"}
                        </button>
                      </div>
                    </div>
                  </Reveal>

                  {/* Physical Gift Card */}
                  <Reveal direction="scale" delay={300}>
                    <div className={styles.physicalGiftCard}>
                      <div className={styles.physicalGiftIcon}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1Z" />
                        </svg>
                      </div>
                      <h3 className={styles.physicalGiftTitle}>Kirim Kado Fisik</h3>
                      <p className={styles.physicalGiftText}>
                        <strong>Penerima:</strong> {invitation.bride_short_name} &amp; {invitation.groom_short_name}
                        <br />
                        <strong>No. HP:</strong> 0812-3456-7890
                        <br />
                        <strong>Alamat:</strong> {invitation.venue_address || "Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat"}
                      </p>
                      <button
                        type="button"
                        className={styles.copyAddressBtn}
                        onClick={() =>
                          copyToClipboard(
                            `${invitation.venue_address || "Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat"} (Penerima: ${invitation.bride_short_name} & ${invitation.groom_short_name})`,
                            "alamat"
                          )
                        }
                      >
                        {copiedKey === "alamat" ? "✓ Alamat Tersalin!" : "Salin Alamat Lengkap"}
                      </button>
                    </div>
                  </Reveal>
                </div>
              )}
            </section>

            {/* ─── 7. JOIN OUR CELEBRATION (RSVP & WISHES) ─── */}
            <section className={styles.sectionRow} id="ucapan">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionCategoryTag}>JOIN OUR CELEBRATION</span>
                  <h2 className={styles.sectionTitle}>Wishes For The Couple</h2>
                  <p className={styles.sectionSubtitle}>
                    Berikan ucapan dan do&apos;a terbaik untuk kedua mempelai
                  </p>
                </div>
              </Reveal>

              {/* Attendance Statistics */}
              <Reveal direction="scale" delay={100}>
                <div className={styles.rsvpStatsRow}>
                  <div className={styles.rsvpStatItem}>
                    <span className={styles.rsvpStatNum}>{totalWishes}</span>
                    <span className={styles.rsvpStatLabel}>Wishes</span>
                  </div>
                  <div className={`${styles.rsvpStatItem} ${styles.statHadir}`}>
                    <span className={styles.rsvpStatNum}>{attendingCount}</span>
                    <span className={styles.rsvpStatLabel}>Hadir</span>
                  </div>
                  <div className={`${styles.rsvpStatItem} ${styles.statTidakHadir}`}>
                    <span className={styles.rsvpStatNum}>{notAttendingCount}</span>
                    <span className={styles.rsvpStatLabel}>Tidak Hadir</span>
                  </div>
                </div>
              </Reveal>

              {/* RSVP Form */}
              <Reveal direction="up" delay={160}>
                <div className={styles.rsvpFormCard}>
                  <form onSubmit={handleSubmitRsvp} className={styles.rsvpForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="rsvp-name">Nama Tamu</label>
                      <input
                        id="rsvp-name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="Nama Lengkap Anda"
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Konfirmasi Kehadiran</label>
                      <div className={styles.radioPills}>
                        <button
                          type="button"
                          className={`${styles.radioPill} ${
                            rsvpAttendance === "attending" ? styles.radioPillActiveGreen : ""
                          }`}
                          onClick={() => setRsvpAttendance("attending")}
                        >
                          ✓ Datang
                        </button>
                        <button
                          type="button"
                          className={`${styles.radioPill} ${
                            rsvpAttendance === "not_attending" ? styles.radioPillActiveRed : ""
                          }`}
                          onClick={() => setRsvpAttendance("not_attending")}
                        >
                          ✕ Absen
                        </button>
                      </div>
                    </div>

                    {rsvpAttendance === "attending" && (
                      <div className={styles.formGroup}>
                        <label htmlFor="rsvp-count">Jumlah Tamu</label>
                        <select
                          id="rsvp-count"
                          value={rsvpGuestCount}
                          onChange={(e) => setRsvpGuestCount(Number(e.target.value))}
                          className={styles.formSelect}
                        >
                          <option value={1}>1 Orang</option>
                          <option value={2}>2 Orang</option>
                          <option value={3}>3 Orang</option>
                          <option value={4}>4 Orang</option>
                          <option value={5}>5 Orang</option>
                        </select>
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label htmlFor="rsvp-msg">Ucapan &amp; Do&apos;a</label>
                      <textarea
                        id="rsvp-msg"
                        rows={3}
                        maxLength={500}
                        value={rsvpMessage}
                        onChange={(e) => setRsvpMessage(e.target.value)}
                        placeholder="Tuliskan ucapan dan doa tulus Anda..."
                        className={styles.formTextarea}
                      />
                    </div>

                    <div className={styles.formButtonRow}>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={styles.submitWishBtn}
                      >
                        {submitting ? "Mengirim..." : "Kirim Ucapan"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        className={styles.sendWaBtn}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.35.06-.53.27-.18.2-.7.69-.7 1.68s.72 1.95.82 2.08c.1.14 1.38 2.18 3.39 3.01.48.2.85.32 1.14.41.48.15.92.13 1.26.08.39-.06 1.18-.48 1.35-.95.16-.47.16-.88.11-.96-.05-.08-.18-.13-.37-.23s-1.18-.58-1.36-.65c-.18-.07-.31-.11-.44.11s-.51.65-.63.79c-.11.14-.23.16-.42.06s-.8-.3-1.53-.95c-.57-.51-.95-1.13-1.06-1.32-.11-.2-.01-.3.08-.4.09-.09.18-.23.27-.35.09-.11.13-.19.19-.32.06-.13.03-.25-.01-.35s-.44-1.07-.61-1.47c-.16-.39-.33-.33-.45-.34-.11-.01-.24-.01-.37-.01z" />
                        </svg>
                        Kirim via WhatsApp
                      </button>
                    </div>

                    {statusMessage && (
                      <p
                        className={`${styles.formStatusMessage} ${
                          statusMessage.type === "success"
                            ? styles.statusSuccess
                            : styles.statusError
                        }`}
                      >
                        {statusMessage.text}
                      </p>
                    )}
                  </form>
                </div>
              </Reveal>

              {/* Wishes Feed */}
              <div className={styles.wishesFeedContainer}>
                <Reveal direction="up" delay={200}>
                  <h3 className={styles.wishesFeedTitle}>Review &amp; Do&apos;a Tamu ({greetings.length})</h3>
                </Reveal>
                <div className={styles.wishesList}>
                  {greetings.length === 0 ? (
                    <div className={styles.emptyWishes}>
                      <p>Belum ada ucapan. Jadilah yang pertama memberikan do&apos;a!</p>
                    </div>
                  ) : (
                    greetings.map((g, idx) => (
                      <Reveal key={g.id || idx} direction="up" delay={(idx % 3) * 80}>
                        <div className={styles.wishItemCard}>
                          <div className={styles.wishCardHeader}>
                            <div className={styles.wishAvatarBox}>
                              <span
                                className={styles.wishAvatarEmoji}
                                style={{
                                  backgroundColor: [
                                    "#e50914",
                                    "#0071eb",
                                    "#46d369",
                                    "#e6b71e",
                                    "#b81d24",
                                  ][idx % 5],
                                }}
                              >
                                {g.guest_name.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <h4 className={styles.wishGuestName}>{g.guest_name}</h4>
                                <span className={styles.wishTime}>
                                  {g.created_at
                                    ? new Date(g.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "Baru saja"}
                                </span>
                              </div>
                            </div>
                            {g.attendance === "attending" ? (
                              <span className={styles.wishBadgeHadir}>✓ Hadir</span>
                            ) : (
                              <span className={styles.wishBadgeTidakHadir}>✕ Absen</span>
                            )}
                          </div>
                          <p className={styles.wishMessageText}>&ldquo;{g.message}&rdquo;</p>
                        </div>
                      </Reveal>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ─── 8. DO'A UNTUK PENGANTIN ─── */}
            <section className={styles.sectionRow}>
              <Reveal direction="scale">
                <div className={styles.prayerCard}>
                  <span className={styles.sectionCategoryTag}>DO&apos;A UNTUK PENGANTIN</span>
                  <p className={styles.prayerArabic}>
                    بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
                  </p>
                  <p className={styles.prayerLatin}>
                    &ldquo;Baarakallaahu laka, wa baaraka &apos;alaika, wa jama&apos;a bainakumaa fii
                    khairin&rdquo;
                  </p>
                  <p className={styles.prayerTranslation}>
                    &ldquo;Semoga Allah memberkahimu dan memberkahi pernikahanmu, serta mempersatukan kalian
                    berdua dalam kebaikan&rdquo;
                  </p>
                </div>
              </Reveal>
            </section>

            {/* ─── 9. FOOTER ─── */}
            <footer className={styles.footerSection}>
              <Reveal direction="up">
                <div className={styles.footerInner}>
                  <h2 className={styles.footerThanksTitle}>TERIMA KASIH</h2>
                  <p className={styles.footerThanksSub}>Atas do&apos;a &amp; restu anda</p>
                  <p className={styles.footerClosing}>
                    {invitation.closing_text ||
                      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu."}
                  </p>
                  <p className={styles.footerWithLove}>With Love,</p>
                  <h3 className={styles.footerCoupleSignature}>{coupleNames}</h3>

                  <div className={styles.footerBrandRow}>
                    <span className={styles.footerNetflixLogo}>NIKAHFIX</span>
                    <p className={styles.footerCopyright}>
                      &copy; {eventYear} Nikahfix &ndash; {coupleNames}.
                    </p>
                    <p className={styles.footerSupported}>
                      Supported by <strong>{BRAND.name}</strong>
                    </p>
                  </div>
                </div>
              </Reveal>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
