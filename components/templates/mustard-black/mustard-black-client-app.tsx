"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";
import type { Greeting, Invitation } from "@/lib/types";
import { BRAND } from "@/lib/brand";
import { Reveal } from "@/components/reveal";
import styles from "./mustard-black.module.css";

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

export function MustardBlackClientApp({
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
      const stored = localStorage.getItem(`mustard_black_wishes_${invitation.id}`);
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

  // Prevent iOS Safari gesture/pinch zoom glitches
  useEffect(() => {
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };
    document.addEventListener("gesturestart", handleGesture);
    document.addEventListener("gesturechange", handleGesture);
    return () => {
      document.removeEventListener("gesturestart", handleGesture);
      document.removeEventListener("gesturechange", handleGesture);
    };
  }, []);

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
      const sections = ["hero", "mempelai", "acara", "cerita", "galeri", "hadiah", "ucapan"];
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
            localStorage.setItem(`mustard_black_wishes_${invitation.id}`, JSON.stringify(next.slice(0, 50)));
          } catch {}
          return next;
        });
        setStatusMessage({ type: "success", text: "Terima kasih! Konfirmasi & ucapan Anda telah tersimpan." });
      } else {
        setGreetings((prev) => {
          const next = [newGreeting, ...prev.filter((g) => g.id !== newGreeting.id)];
          try {
            localStorage.setItem(`mustard_black_wishes_${invitation.id}`, JSON.stringify(next.slice(0, 50)));
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
          localStorage.setItem(`mustard_black_wishes_${invitation.id}`, JSON.stringify(next.slice(0, 50)));
        } catch {}
        return next;
      });
      setStatusMessage({ type: "success", text: "Ucapan Anda berhasil ditampilkan." });
      setRsvpMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  const giftInfo = (invitation.gift_info as { bank?: string; account_number?: string; account_name?: string }) || {
    bank: "BCA",
    account_number: "7125091428",
    account_name: "Fajar Sidik",
  };

  const stories = [
    {
      year: "Awal Cerita",
      title: "Pertemuan Pertama",
      text: "Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Tanpa disadari, kebersamaan itu tumbuh menjadi rasa nyaman yang semakin kuat dari hari ke hari.",
    },
    {
      year: "Lamaran",
      title: "Momen Sakral Lamaran",
      text: "Dengan niat yang tulus dan restu keluarga, kami memutuskan untuk melangkah ke tahap yang lebih serius. Momen lamaran menjadi awal dari perjalanan baru yang penuh harapan dan doa baik.",
    },
    {
      year: "Pernikahan",
      title: "Ikatan Suci Pernikahan",
      text: "Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh cinta, kebahagiaan, dan keberkahan.",
    },
  ];

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
          className={styles.floatingMusicBtn}
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
        {/* LEFT COLUMN: DESKTOP SHOWCASE (Sticky 100vh) */}
        <aside className={styles.showcase} aria-label="Visual showcase Mustard Black">
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

          <div className={styles.showcaseFlower}>
            <Image
              src="/media/mustard-black/lily-flower.png"
              alt=""
              width={280}
              height={380}
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Centered Showcase Frame */}
          <div className={styles.showcaseFrame}>
            <p className={styles.showcaseSub}>The Wedding of</p>
            <h1 className={styles.showcaseCoupleTitle}>
              {invitation.bride_short_name}
              <span>&amp;</span>
              {invitation.groom_short_name}
            </h1>
            <div className={styles.showcaseDivider} />
            <small className={styles.showcaseDate}>{formatEventDate(invitation.event_date)}</small>
          </div>

          <small className={styles.showcaseBrand}>
            {BRAND.name} · Digital Invitation
          </small>
        </aside>

        {/* RIGHT COLUMN: MOBILE FOCUSED PANEL */}
        <div className={styles.panel}>
          {/* COVER SCREEN (BUKA UNDANGAN) */}
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
              {/* Arch Framed Photo with Lily */}
              <div className={styles.coverArchFrame}>
                <div className={styles.coverArchInner}>
                  <Image
                    src={profilePath}
                    alt={coupleNames}
                    fill
                    sizes="180px"
                    style={{ objectFit: "cover", objectPosition: "center 20%" }}
                    priority
                  />
                </div>
                <div className={styles.coverArchFlower}>
                  <Image
                    src="/media/mustard-black/lily-flower.png"
                    alt=""
                    width={110}
                    height={140}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>

              <span className={styles.coverKicker}>The Wedding of</span>
              <h1 className={styles.coverCoupleTitle}>{coupleNames}</h1>
              <p className={styles.coverDate}>{formatEventDate(invitation.event_date)}</p>

              <div className={styles.coverGuestCard}>
                <p className={styles.coverGuestPrefix}>Kepada Yth. Bapak/Ibu/Saudara/i</p>
                <h2 className={styles.coverGuestName}>{displayGuestName}</h2>
              </div>

              <button
                type="button"
                className={styles.openInvitationButton}
                onClick={openInvitation}
              >
                <span className={styles.openButtonIcon}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <span>Buka Undangan</span>
              </button>
            </div>
          </div>

          {/* MAIN EXPERIENCE INSIDE PANEL */}
          <main className={styles.mainExperience}>
            {/* Floating Bottom Nav for Mobile Screens */}
            <nav className={styles.bottomNavMobile}>
              <a href="#hero" className={activeSection === "hero" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <span>Home</span>
              </a>
              <a href="#mempelai" className={activeSection === "mempelai" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span>Mempelai</span>
              </a>
              <a href="#acara" className={activeSection === "acara" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                </svg>
                <span>Acara</span>
              </a>
              <a href="#cerita" className={activeSection === "cerita" ? styles.bottomNavActive : ""}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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

            {/* ─── 1. HERO OPENING BANNER (Staggered Entrance Animation on Open) ─── */}
            <section
              className={`${styles.heroSection} ${opened ? styles.heroOpened : ""}`}
              id="hero"
            >
              <div className={styles.heroBackdrop}>
                <Image
                  src={coverPath}
                  alt={coupleNames}
                  fill
                  sizes="(max-width: 900px) 100vw, 480px"
                  priority
                />
              </div>
              <div className={styles.heroGradient} />

              <div className={styles.heroContent}>
                {/* Arch Framed Center Visual */}
                <div className={styles.heroArchWrapper}>
                  <div className={styles.heroArchInner}>
                    <Image
                      src={profilePath}
                      alt={coupleNames}
                      fill
                      sizes="170px"
                      style={{ objectFit: "cover", objectPosition: "center 20%" }}
                      priority
                    />
                  </div>
                  <div className={styles.heroArchLily}>
                    <Image
                      src="/media/mustard-black/lily-flower.png"
                      alt=""
                      width={100}
                      height={130}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>

                <span className={styles.heroKicker}>The Wedding of</span>
                <h1 className={styles.heroCoupleTitle}>
                  {invitation.bride_short_name}
                  <span>&amp;</span>
                  {invitation.groom_short_name}
                </h1>
                <span className={styles.heroDateBadge}>
                  {formatEventDate(invitation.event_date)}
                </span>

                <div className={styles.heroScrollIndicator}>
                  <span className={styles.heroScrollText}>Scroll Down</span>
                  <div className={styles.heroScrollChevron}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── 2. AYAT / QUOTE SECTION ─── */}
            <section className={`${styles.sectionRow} ${styles.quoteSection}`}>
              <Reveal direction="up">
                <div className={styles.quoteCard}>
                  <p className={styles.quoteText}>
                    &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.&rdquo;
                  </p>
                  <span className={styles.quoteSurah}>(QS. Ar-Rum : 21)</span>
                </div>
              </Reveal>
            </section>

            {/* ─── 3. MEMPELAI (GROOM & BRIDE) SECTION ─── */}
            <section className={styles.sectionRow} id="mempelai">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTag}>Mempelai</span>
                  <h2 className={styles.sectionTitle}>Groom &amp; Bride</h2>
                  <div className={styles.mustardDivider}>
                    <span />
                    <i>✦</i>
                    <span />
                  </div>
                </div>
              </Reveal>

              <Reveal direction="up">
                <div className={styles.coupleIntro}>
                  <h3 className={styles.greetingArabic}>Assalamu&apos;alaikum Wr. Wb.</h3>
                  <p className={styles.greetingText}>
                    Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i serta kerabat sekalian untuk menghadiri acara pernikahan kami.
                  </p>
                </div>
              </Reveal>

              <div className={styles.coupleCardsWrapper}>
                {/* The Groom: Fajar Sidik */}
                <Reveal direction="left" delay={100}>
                  <div className={styles.personCard}>
                    <div className={styles.personArchContainer}>
                      <div className={styles.personArchPhoto}>
                        <Image
                          src={groomPhotoPath}
                          alt={invitation.groom_name}
                          fill
                          sizes="160px"
                          style={{ objectFit: "cover", objectPosition: "center 20%" }}
                        />
                      </div>
                      <div className={styles.personArchLily}>
                        <Image
                          src="/media/mustard-black/lily-flower.png"
                          alt=""
                          width={85}
                          height={110}
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    </div>

                    <span className={styles.personRoleBadge}>The Groom</span>
                    <h3 className={styles.personFullName}>{invitation.groom_name}</h3>
                    <p className={styles.personParents}>
                      Putra Kedua dari Bapak M. Dawam &amp; (Almh) Ibu Dewi Sudarwati
                    </p>

                    <a
                      href="https://instagram.com/fajarsidik"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.instagramBtn}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span>@fajarsidik</span>
                    </a>
                  </div>
                </Reveal>

                <div className={styles.coupleDividerAmpersand}>&amp;</div>

                {/* The Bride: Dita Maharani Putri */}
                <Reveal direction="right" delay={200}>
                  <div className={styles.personCard}>
                    <div className={styles.personArchContainer}>
                      <div className={styles.personArchPhoto}>
                        <Image
                          src={bridePhotoPath}
                          alt={invitation.bride_name}
                          fill
                          sizes="160px"
                          style={{ objectFit: "cover", objectPosition: "center 20%" }}
                        />
                      </div>
                      <div className={styles.personArchLily}>
                        <Image
                          src="/media/mustard-black/lily-flower.png"
                          alt=""
                          width={85}
                          height={110}
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    </div>

                    <span className={styles.personRoleBadge}>The Bride</span>
                    <h3 className={styles.personFullName}>{invitation.bride_name}</h3>
                    <p className={styles.personParents}>
                      Putri Pertama dari Bapak Anas Rifai &amp; Ibu Kholifah
                    </p>

                    <a
                      href="https://instagram.com/ditamaharani"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.instagramBtn}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span>@ditamaharani</span>
                    </a>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* ─── 4. ACARA / TIMELINE SECTION ─── */}
            <section className={styles.sectionRow} id="acara">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTag}>Rangkaian Acara</span>
                  <h2 className={styles.sectionTitle}>Wedding Event</h2>
                  <div className={styles.mustardDivider}>
                    <span />
                    <i>✦</i>
                    <span />
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Dengan penuh rasa syukur, kami mengundang Anda untuk hadir pada acara kami
                  </p>
                </div>
              </Reveal>

              <div className={styles.eventsList}>
                {/* Akad Nikah */}
                <Reveal direction="left" delay={100}>
                  <div className={styles.eventCard}>
                    <span className={styles.eventCardBadge}>Akad Nikah</span>
                    <h3 className={styles.eventTitle}>Akad Nikah</h3>
                    <p className={styles.eventDate}>{formatEventDate(invitation.event_date)}</p>
                    <p className={styles.eventTime}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      <span>Pukul 08.00 WIB - Selesai</span>
                    </p>

                    <p className={styles.eventVenueLabel}>Tempat Acara</p>
                    <h4 className={styles.eventVenueName}>Kediaman Mempelai Wanita</h4>
                    <p className={styles.eventVenueAddress}>{invitation.venue_address}</p>

                    <a
                      href={invitation.maps_url || "https://maps.google.com"}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.mapsButton}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span>Lihat Lokasi</span>
                    </a>
                  </div>
                </Reveal>

                {/* Resepsi Pernikahan */}
                <Reveal direction="right" delay={200}>
                  <div className={styles.eventCard}>
                    <span className={styles.eventCardBadge}>Resepsi</span>
                    <h3 className={styles.eventTitle}>Resepsi Pernikahan</h3>
                    <p className={styles.eventDate}>{formatEventDate(invitation.event_date)}</p>
                    <p className={styles.eventTime}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      <span>Pukul 11.00 WIB - Selesai</span>
                    </p>

                    <p className={styles.eventVenueLabel}>Tempat Acara</p>
                    <h4 className={styles.eventVenueName}>{invitation.venue_name}</h4>
                    <p className={styles.eventVenueAddress}>{invitation.venue_address}</p>

                    <a
                      href={invitation.maps_url || "https://maps.google.com"}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.mapsButton}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span>Lihat Lokasi</span>
                    </a>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* ─── 5. SAVE THE DATE & COUNTDOWN ─── */}
            <section className={`${styles.sectionRow} ${styles.countdownSection}`}>
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTag}>Save The Date</span>
                  <h2 className={styles.sectionTitle}>Menghitung Hari</h2>
                  <div className={styles.mustardDivider}>
                    <span />
                    <i>✦</i>
                    <span />
                  </div>
                </div>

                <div className={styles.countdownGrid}>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownDigit}>{String(timeLeft.days).padStart(2, "0")}</span>
                    <span className={styles.countdownLabel}>Hari</span>
                  </div>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownDigit}>{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span className={styles.countdownLabel}>Jam</span>
                  </div>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownDigit}>{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span className={styles.countdownLabel}>Menit</span>
                  </div>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownDigit}>{String(timeLeft.seconds).padStart(2, "0")}</span>
                    <span className={styles.countdownLabel}>Detik</span>
                  </div>
                </div>

                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.calendarActionBtn}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  <span>Simpan ke Kalender</span>
                </a>
              </Reveal>
            </section>

            {/* ─── 6. LOVE STORY SECTION ─── */}
            <section className={styles.sectionRow} id="cerita">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTag}>Kisah Cinta</span>
                  <h2 className={styles.sectionTitle}>Love Story</h2>
                  <div className={styles.mustardDivider}>
                    <span />
                    <i>✦</i>
                    <span />
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Setiap babak perjalanan membawa kami semakin dekat hingga janji suci terukir
                  </p>
                </div>
              </Reveal>

              <div className={styles.storyTimeline}>
                {stories.map((st, i) => (
                  <Reveal key={st.year} direction="up" delay={i * 120} className={styles.storyReveal}>
                    <div className={styles.storyItem}>
                      <div className={styles.storyDot} />
                      <div className={styles.storyCard}>
                        <div className={styles.storyHeader}>
                          <h3 className={styles.storyTitle}>{st.title}</h3>
                          <span className={styles.storyYearBadge}>{st.year}</span>
                        </div>
                        <p className={styles.storyText}>{st.text}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* ─── 7. GALERI FOTO ─── */}
            <section className={styles.sectionRow} id="galeri">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTag}>Dokumentasi</span>
                  <h2 className={styles.sectionTitle}>Galeri Foto</h2>
                  <div className={styles.mustardDivider}>
                    <span />
                    <i>✦</i>
                    <span />
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Dan kami bersyukur, dipertemukan Allah di waktu terbaik, kini kami menanti hari istimewa kami.
                  </p>
                </div>
              </Reveal>

              <div className={styles.galleryGrid}>
                {galleryPaths.slice(0, 5).map((path, idx) => (
                  <Reveal key={path} direction="up" delay={idx * 80}>
                    <div
                      className={styles.galleryCard}
                      onClick={() => setLightboxIndex(idx)}
                    >
                      <Image
                        src={path}
                        alt={`Galeri Dita & Fajar ${idx + 1}`}
                        fill
                        sizes="(max-width: 900px) 50vw, 240px"
                      />
                      <div className={styles.galleryOverlay} />
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* ─── 8. LIVE STREAMING ─── */}
            <section className={styles.sectionRow}>
              <Reveal direction="up">
                <div className={styles.streamingCard}>
                  <span className={styles.streamingTimeBadge}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                    </svg>
                    <span>Sabtu, 12 Desember 2026 · 08.00 WIB</span>
                  </span>

                  <h3 className={styles.streamingTitle}>Live Streaming</h3>
                  <p className={styles.streamingDesc}>
                    Kami mengundang Bapak/Ibu/Saudara/i untuk menyaksikan pernikahan kami secara virtual yang disiarkan langsung melalui media sosial di bawah ini.
                  </p>

                  <div className={styles.streamingButtonRow}>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.streamBtn}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span>Instagram Live</span>
                    </a>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.streamBtn}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
                      </svg>
                      <span>YouTube Live</span>
                    </a>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* ─── 9. AMPLOP DIGITAL & HADIAH ─── */}
            <section className={styles.sectionRow} id="hadiah">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTag}>Tanda Kasih</span>
                  <h2 className={styles.sectionTitle}>Amplop Digital</h2>
                  <div className={styles.mustardDivider}>
                    <span />
                    <i>✦</i>
                    <span />
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Doa restu Anda merupakan karunia yang sangat berarti bagi kami, dan jika memberi adalah ungkapan tanda kasih, Anda dapat memberi kado secara cashless.
                  </p>
                </div>
              </Reveal>

              <Reveal direction="up">
                {/* ATM Card Replica */}
                <div className={styles.giftCard}>
                  <div className={styles.giftCardHeader}>
                    <div className={styles.bankLogoWrapper}>
                      <Image
                        src="/media/mustard-black/bca.webp"
                        alt="BCA"
                        fill
                        style={{ objectFit: "contain", objectPosition: "left center" }}
                      />
                    </div>
                    <div className={styles.bankChipWrapper}>
                      <Image
                        src="/media/mustard-black/chip-atm.png"
                        alt="Chip"
                        fill
                        style={{ objectFit: "contain", objectPosition: "right center" }}
                      />
                    </div>
                  </div>

                  <div className={styles.giftCardNumberRow}>
                    <p className={styles.giftCardNumberLabel}>Nomor Rekening</p>
                    <p className={styles.giftCardNumber}>{giftInfo.account_number}</p>
                  </div>

                  <p className={styles.giftCardHolder}>A.N {giftInfo.account_name}</p>

                  <button
                    type="button"
                    className={styles.copyAccountButton}
                    onClick={() => copyToClipboard(giftInfo.account_number || "7125091428", "rekening")}
                  >
                    {copiedKey === "rekening" ? (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                        <span>Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                        <span>Salin No. Rekening</span>
                      </>
                    )}
                  </button>
                </div>
              </Reveal>

              <Reveal direction="up" delay={100}>
                {/* Physical Gift Box */}
                <div className={styles.giftAddressBox}>
                  <h3 className={styles.giftAddressTitle}>Kirim Kado Fisik</h3>
                  <p className={styles.giftAddressText}>
                    Penerima: {invitation.groom_name} ({giftInfo.account_name})<br />
                    Alamat: {invitation.venue_address}
                  </p>
                  <button
                    type="button"
                    className={styles.copyAccountButton}
                    onClick={() => copyToClipboard(invitation.venue_address, "alamat")}
                  >
                    {copiedKey === "alamat" ? (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                        <span>Alamat Disalin!</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                        <span>Salin Alamat Pengiriman</span>
                      </>
                    )}
                  </button>
                </div>
              </Reveal>
            </section>

            {/* ─── 10. RSVP & UCAPAN DO'A ─── */}
            <section className={styles.sectionRow} id="ucapan">
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTag}>Buku Tamu</span>
                  <h2 className={styles.sectionTitle}>Ucapan &amp; Doa Restu</h2>
                  <div className={styles.mustardDivider}>
                    <span />
                    <i>✦</i>
                    <span />
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Berikan ucapan terbaik dan konfirmasi kehadiran Anda untuk hari bahagia kami
                  </p>
                </div>
              </Reveal>

              <Reveal direction="up">
                <div className={styles.rsvpCard}>
                  <form onSubmit={handleSubmitRsvp} className={styles.rsvpForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="mb-name">Nama Tamu</label>
                      <input
                        id="mb-name"
                        type="text"
                        required
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Konfirmasi Kehadiran</label>
                      <div className={styles.radioRow}>
                        <button
                          type="button"
                          className={`${styles.radioBtn} ${rsvpAttendance === "attending" ? styles.radioBtnActive : ""}`}
                          onClick={() => setRsvpAttendance("attending")}
                        >
                          Hadir
                        </button>
                        <button
                          type="button"
                          className={`${styles.radioBtn} ${rsvpAttendance === "not_attending" ? styles.radioBtnActive : ""}`}
                          onClick={() => setRsvpAttendance("not_attending")}
                        >
                          Tidak Hadir
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="mb-count">Jumlah Tamu</label>
                      <select
                        id="mb-count"
                        value={rsvpGuestCount}
                        onChange={(e) => setRsvpGuestCount(Number(e.target.value))}
                        className={styles.formSelect}
                      >
                        <option value={1}>1 Orang</option>
                        <option value={2}>2 Orang</option>
                        <option value={3}>3 Orang</option>
                        <option value={4}>4 Orang</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="mb-msg">Ucapan &amp; Doa</label>
                      <textarea
                        id="mb-msg"
                        rows={3}
                        value={rsvpMessage}
                        onChange={(e) => setRsvpMessage(e.target.value)}
                        placeholder="Tuliskan ucapan dan doa restu Anda..."
                        className={styles.formTextarea}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={styles.submitBtn}
                    >
                      {submitting ? "Mengirim Ucapan..." : "Kirim Ucapan"}
                    </button>

                    {statusMessage && (
                      <div
                        className={`${styles.statusToast} ${
                          statusMessage.type === "success"
                            ? styles.statusToastSuccess
                            : styles.statusToastError
                        }`}
                      >
                        {statusMessage.text}
                      </div>
                    )}
                  </form>
                </div>
              </Reveal>

              {/* Wishes list */}
              <div className={styles.wishesContainer}>
                {greetings.map((g, idx) => (
                  <Reveal key={g.id || idx} direction="up" delay={(idx % 3) * 60}>
                    <div className={styles.wishCard}>
                      <div className={styles.wishHeader}>
                        <span className={styles.wishAuthor}>{g.guest_name}</span>
                        <span
                          className={`${styles.attendanceBadge} ${
                            g.attendance === "attending"
                              ? styles.attendanceBadgeHadir
                              : styles.attendanceBadgeTidakHadir
                          }`}
                        >
                          {g.attendance === "attending" ? "Hadir" : "Tidak Hadir"}
                        </span>
                      </div>
                      <p className={styles.wishMessage}>{g.message}</p>
                      <small className={styles.wishTime}>
                        {new Date(g.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </small>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* ─── 11. CLOSING SECTION ─── */}
            <section className={styles.closingSection}>
              <Reveal direction="up">
                <div className={styles.closingCard}>
                  <p className={styles.closingText}>
                    Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.
                  </p>
                  <p className={styles.closingGreeting}>Kami yang berbahagia,</p>
                  <h3 className={styles.closingCoupleNames}>{coupleNames}</h3>

                  <div className={styles.mustardDivider}>
                    <span />
                    <i>✦</i>
                    <span />
                  </div>

                  <div className={styles.brandSignature}>
                    <span>Digital Invitation by</span>
                    <strong>{BRAND.name}</strong>
                  </div>
                </div>
              </Reveal>
            </section>
          </main>
        </div>
      </div>

      {/* ─── LIGHTBOX MODAL ─── */}
      {lightboxIndex !== null && (
        <div
          className={styles.lightboxModal}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className={styles.lightboxCloseButton}
            onClick={() => setLightboxIndex(null)}
            aria-label="Tutup foto"
          >
            ✕
          </button>
          <div
            className={styles.lightboxImageWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryPaths[lightboxIndex] || coverPath}
              alt="Galeri foto"
              fill
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
