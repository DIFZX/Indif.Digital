"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo, type FormEvent, type ReactNode } from "react";
import type { Greeting, Invitation } from "@/lib/types";
import { BRAND } from "@/lib/brand";
import { Reveal } from "@/components/reveal";
import {
  ThemedSectionDivider,
  WatermarkCrest,
  SectionFloralHeader,
  CardFloralAccent,
} from "./prewedding-ornaments";
import styles from "./prewedding.module.css";

type Props = {
  themeClass: string;
  dividerIcon: string;
  flowerPath: string;
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

export function PreweddingClientApp({
  themeClass,
  dividerIcon,
  flowerPath,
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
  musicPath,
  calendarUrl,
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

  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (lightboxIndex === null) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    lightboxCloseRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "Tab") {
        event.preventDefault();
        lightboxCloseRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [lightboxIndex]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const displayGuestName = guestName || "Tamu Undangan";

  // Left desktop showcase slideshow
  const showcaseImages = useMemo(() => {
    return galleryPaths.length > 0 ? galleryPaths.slice(0, 4) : [coverPath];
  }, [galleryPaths, coverPath]);

  // Countdown timer
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

  // Lock body scroll when cover modal is closed
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

  // Scrollspy for navigation
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
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (copied) onSuccess();
    } catch {
      setCopiedKey(null);
    }
  }

  async function handleSubmitRsvp(e: FormEvent) {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setSubmitting(true);
    setStatusMessage(null);

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

      const data = (await res.json()) as { message?: string; greeting?: Greeting | null };
      if (!res.ok || res.status === 207) {
        setStatusMessage({ type: "error", text: data.message || "Respons belum tersimpan. Silakan coba lagi." });
        return;
      }
      const savedGreeting = data.greeting;
      if (savedGreeting) {
        setGreetings((prev) => [savedGreeting, ...prev.filter((g) => g.id !== savedGreeting.id)]);
      }
      setStatusMessage({ type: "success", text: data.message || "Terima kasih, konfirmasi kehadiran Anda sudah tersimpan." });
      setRsvpMessage("");
    } catch {
      setStatusMessage({ type: "error", text: "Koneksi terputus. Periksa internet Anda, lalu coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  const giftInfo = invitation.gift_info;
  const giftAccounts = (giftInfo.accounts ?? [giftInfo]).filter((account) => account.account_number);
  const giftAddress = giftInfo.shipping_address || invitation.venue_address;

  const bride = {
    name: invitation.bride_name,
    parents: invitation.bride_parents,
    photo: bridePhotoPath,
    role: "The Bride",
    instagram: invitation.theme_overrides.bride_instagram,
  };
  const groom = {
    name: invitation.groom_name,
    parents: invitation.groom_parents,
    photo: groomPhotoPath,
    role: "The Groom",
    instagram: invitation.theme_overrides.groom_instagram,
  };

  return (
    <div className={`${styles.experience} ${themeClass}`}>
      {/* ─── BACKGROUND AUDIO ─── */}
      {musicPath && (
        <audio ref={audioRef} loop preload="auto">
          <source src={musicPath} type="audio/mp4" />
          <source src={musicPath} type="audio/mpeg" />
        </audio>
      )}

      {/* Floating Music Button */}
      {musicPath && opened && (
        <button
          type="button"
          className={`${styles.musicFab} ${playing ? styles.musicFabPlaying : ""}`}
          onClick={toggleMusic}
          aria-label={playing ? "Jeda musik latar" : "Putar musik latar"}
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
        {/* LEFT COLUMN: DESKTOP SHOWCASE */}
        <aside className={styles.showcase} aria-label="Visual showcase">
          <div className={styles.showcaseSlides}>
            {showcaseImages.map((path, index) => (
              <div
                key={`${path}-${index}`}
                className={styles.showcaseSlide}
                style={{ animationDelay: `${index * 7}s` }}
              >
                <Image
                  src={path}
                  alt=""
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="65vw"
                  style={{ objectFit: "cover", objectPosition: "center 30%" }}
                />
              </div>
            ))}
          </div>

          <div className={styles.showcaseShade} />

          <div className={styles.showcaseFlower}>
            <Image
              src={flowerPath}
              alt=""
              width={150}
              height={185}
              style={{ objectFit: "contain", pointerEvents: "none" }}
            />
          </div>

          <div className={styles.showcaseFrame}>
            <p className={styles.showcaseSub}>The Wedding of</p>
            <h1 className={styles.showcaseCoupleTitle}>
              {invitation.bride_short_name}
              <span className={styles.titleAmpersand}>&amp;</span>
              {invitation.groom_short_name}
            </h1>
            <div className={styles.showcaseDivider} />
            <small className={styles.showcaseDate}>{formatEventDate(invitation.event_date)}</small>
          </div>

          <small className={styles.showcaseBrand}>
            {BRAND.name} · Digital Invitation
          </small>
        </aside>

        {/* RIGHT COLUMN: MAIN PANEL */}
        <div className={styles.panel}>
          {/* COVER SCREEN (MODAL BUKA UNDANGAN) */}
          <div className={`${styles.coverModal} ${opened ? styles.coverModalOpened : ""}`}>
            <div className={styles.coverBackdrop}>
              <Image
                src={coverPath}
                alt={coupleNames}
                fill
                sizes="(max-width: 900px) 100vw, 480px"
                style={{ objectFit: "cover", objectPosition: "center 20%" }}
                loading="eager"
                priority
              />
            </div>
            <div className={styles.coverGradient} />

            <div className={styles.coverContent}>
              <div className={styles.coverArchFrame}>
                <div className={styles.coverArchInner}>
                  <Image
                    src={profilePath}
                    alt={coupleNames}
                    fill
                    sizes="180px"
                    style={{ objectFit: "cover", objectPosition: "center 20%" }}
                    loading="eager"
                    priority
                  />
                </div>
                <div className={styles.coverArchFlower}>
                  <Image
                    src={flowerPath}
                    alt=""
                    width={64}
                    height={82}
                    style={{ objectFit: "contain", pointerEvents: "none" }}
                    priority
                  />
                </div>
              </div>

              <span className={styles.coverKicker}>The Wedding of</span>
              <h1 className={styles.coverCoupleTitle}>
                {invitation.bride_short_name}
                <span className={styles.titleAmpersand}>&amp;</span>
                {invitation.groom_short_name}
              </h1>
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

          {/* MAIN EXPERIENCE CONTENT */}
          <main className={styles.mainExperience}>
            {/* Mobile Bottom Floating Navigation */}
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

            {/* ─── 1. HERO OPENING BANNER (Seamless Gradient to Bottom) ─── */}
            <section className={styles.heroSection} id="hero">
              <div className={styles.heroBackdrop}>
                <Image
                  src={coverPath}
                  alt={coupleNames}
                  fill
                  sizes="(max-width: 900px) 100vw, 480px"
                  loading="eager"
                  priority
                />
              </div>
              <div className={styles.heroGradient} />

              <div className={styles.heroContent}>
                <div className={styles.heroArchWrapper}>
                  <div className={styles.heroArchInner}>
                    <Image
                      src={profilePath}
                      alt={coupleNames}
                      fill
                      sizes="170px"
                      style={{ objectFit: "cover", objectPosition: "center 20%" }}
                      loading="eager"
                      priority
                    />
                  </div>
                  <div className={styles.heroArchLily}>
                    <Image
                      src={flowerPath}
                      alt=""
                      width={64}
                      height={82}
                      style={{ objectFit: "contain", pointerEvents: "none" }}
                      priority
                    />
                  </div>
                </div>

                <span className={styles.heroKicker}>The Wedding of</span>
                <h1 className={styles.heroCoupleTitle}>
                  {invitation.bride_short_name}
                  <span className={styles.titleAmpersand}>&amp;</span>
                  {invitation.groom_short_name}
                </h1>
                <span className={styles.heroDateBadge}>
                  {formatEventDate(invitation.event_date)}
                </span>

                <div className={styles.heroScrollIndicator}>
                  <span className={styles.heroScrollText}>Scroll Down</span>
                  <div className={styles.heroScrollChevron}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── 2. AYAT / QUOTE SECTION ─── */}
            <section className={`${styles.sectionRow} ${styles.quoteSection}`}>
              <WatermarkCrest />
              <Reveal direction="up">
                <div className={styles.quoteCard}>
                  <CardFloralAccent
                    flowerPath={flowerPath}
                    position="top-right"
                    size={58}
                    style={{ top: "-22px", right: "-16px" }}
                  />
                  <p className={styles.quoteText}>&ldquo;{invitation.quote_text}&rdquo;</p>
                  <span className={styles.quoteSurah}>{invitation.quote_source}</span>
                </div>
              </Reveal>
            </section>

            {/* ─── 3. MEMPELAI (GROOM & BRIDE) SECTION ─── */}
            <section className={styles.sectionRow} id="mempelai">
              <WatermarkCrest />

              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <SectionFloralHeader flowerPath={flowerPath} />
                  <span className={styles.sectionTag}>Mempelai</span>
                  <h2 className={styles.sectionTitle}>Groom <span className={styles.titleAmpersand}>&amp;</span> Bride</h2>
                  <ThemedSectionDivider icon={dividerIcon} />
                </div>
              </Reveal>

              <Reveal direction="up">
                <div className={styles.coupleIntro}>
                  <h3 className={styles.greetingArabic}>Assalamu&apos;alaikum Wr. Wb.</h3>
                  <p className={styles.greetingText}>{invitation.opening_text}</p>
                </div>
              </Reveal>

              <div className={styles.coupleCardsWrapper}>
                {/* Bride Card */}
                <Reveal direction="left" delay={100}>
                  <div className={styles.personCard}>
                    <div className={styles.personArchContainer}>
                      <div className={styles.personArchPhoto}>
                        <Image
                          src={bride.photo}
                          alt={bride.name}
                          fill
                          sizes="150px"
                          style={{ objectFit: "cover", objectPosition: "center 20%" }}
                        />
                      </div>
                      <div className={styles.personArchLilyLeft}>
                        <Image
                          src={flowerPath}
                          alt=""
                          width={62}
                          height={78}
                          style={{ objectFit: "contain", pointerEvents: "none" }}
                        />
                      </div>
                    </div>

                    <span className={styles.personRoleBadge}>{bride.role}</span>
                    <h3 className={styles.personFullName}>{bride.name}</h3>
                    <p className={styles.personParents}>{bride.parents}</p>

                    {bride.instagram && (
                      <a
                        href={`https://www.instagram.com/${encodeURIComponent(bride.instagram)}/`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.instagramBtn}
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span>@{bride.instagram}</span>
                      </a>
                    )}
                  </div>
                </Reveal>

                {/* Classical Serif Italic Ampersand Divider */}
                <div className={styles.coupleDividerAmpersand}>
                  <span className={styles.ampersandDecoLeft} />
                  <span className={styles.ampersandGlyph}>&amp;</span>
                  <span className={styles.ampersandDecoRight} />
                </div>

                {/* Groom Card */}
                <Reveal direction="right" delay={200}>
                  <div className={styles.personCard}>
                    <div className={styles.personArchContainer}>
                      <div className={styles.personArchPhoto}>
                        <Image
                          src={groom.photo}
                          alt={groom.name}
                          fill
                          sizes="150px"
                          style={{ objectFit: "cover", objectPosition: "center 20%" }}
                        />
                      </div>
                      <div className={styles.personArchLily}>
                        <Image
                          src={flowerPath}
                          alt=""
                          width={62}
                          height={78}
                          style={{ objectFit: "contain", pointerEvents: "none" }}
                        />
                      </div>
                    </div>

                    <span className={styles.personRoleBadge}>{groom.role}</span>
                    <h3 className={styles.personFullName}>{groom.name}</h3>
                    <p className={styles.personParents}>{groom.parents}</p>

                    {groom.instagram && (
                      <a
                        href={`https://www.instagram.com/${encodeURIComponent(groom.instagram)}/`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.instagramBtn}
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span>@{groom.instagram}</span>
                      </a>
                    )}
                  </div>
                </Reveal>
              </div>
            </section>

            {/* ─── 4. ACARA / TIMELINE SECTION ─── */}
            <section className={styles.sectionRow} id="acara">
              <WatermarkCrest />
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <SectionFloralHeader flowerPath={flowerPath} />
                  <span className={styles.sectionTag}>Rangkaian Acara</span>
                  <h2 className={styles.sectionTitle}>Wedding Event</h2>
                  <ThemedSectionDivider icon={dividerIcon} />
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
                      <span>Pukul {invitation.ceremony_time}</span>
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

                {/* Resepsi */}
                <Reveal direction="right" delay={200}>
                  <div className={styles.eventCard}>
                    <span className={styles.eventCardBadge}>Resepsi</span>
                    <h3 className={styles.eventTitle}>Resepsi Pernikahan</h3>
                    <p className={styles.eventDate}>{formatEventDate(invitation.event_date)}</p>
                    <p className={styles.eventTime}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      <span>Pukul {invitation.reception_time}</span>
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

              {/* Save to Calendar Button */}
              <div className={styles.calendarWrapper}>
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.calendarButton}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                  </svg>
                  <span>Simpan ke Kalender</span>
                </a>
              </div>
            </section>

            {/* ─── 5. COUNTDOWN SECTION ─── */}
            <section className={styles.countdownSection}>
              <Reveal direction="up">
                <div className={styles.sectionHeader} style={{ marginBottom: "24px" }}>
                  <span className={styles.sectionTag}>Menuju Hari Bahagia</span>
                  <h3 className={styles.sectionTitle} style={{ fontSize: "1.7rem" }}>
                    Countdown
                  </h3>
                </div>

                <div className={styles.countdownGrid}>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownNum}>{timeLeft.days}</span>
                    <span className={styles.countdownLabel}>Hari</span>
                  </div>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownNum}>
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className={styles.countdownLabel}>Jam</span>
                  </div>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownNum}>
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className={styles.countdownLabel}>Menit</span>
                  </div>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownNum}>
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className={styles.countdownLabel}>Detik</span>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* ─── 6. CERITA CINTA (LOVE STORY) ─── */}
            {invitation.story && invitation.story.length > 0 && (
              <section className={styles.sectionRow} id="cerita">
                <WatermarkCrest />
                <Reveal direction="up">
                  <div className={styles.sectionHeader}>
                    <SectionFloralHeader flowerPath={flowerPath} />
                    <span className={styles.sectionTag}>Kisah Cinta</span>
                    <h2 className={styles.sectionTitle}>Love Story</h2>
                    <ThemedSectionDivider icon={dividerIcon} />
                  </div>
                </Reveal>

                <div className={styles.storyTimeline}>
                  {invitation.story.map((item, idx) => (
                    <Reveal key={`${item.year}-${idx}`} direction="up" delay={idx * 100}>
                      <div className={styles.storyItem}>
                        <div className={styles.storyDot} />
                        <p className={styles.storyYear}>{item.year}</p>
                        <h4 className={styles.storyTitle}>{item.title}</h4>
                        <p className={styles.storyText}>{item.text}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {/* ─── 7. GALERI FOTO ─── */}
            {galleryPaths.length > 0 && (
              <section className={styles.sectionRow} id="galeri">
                <WatermarkCrest />
                <Reveal direction="up">
                  <div className={styles.sectionHeader}>
                    <SectionFloralHeader flowerPath={flowerPath} />
                    <span className={styles.sectionTag}>Momen Bahagia</span>
                    <h2 className={styles.sectionTitle}>Our Gallery</h2>
                    <ThemedSectionDivider icon={dividerIcon} />
                  </div>
                </Reveal>

                <div className={styles.galleryGrid}>
                  {galleryPaths.map((path, idx) => (
                    <Reveal key={`${path}-${idx}`} direction="up" delay={(idx % 2) * 100}>
                      <div
                        className={styles.galleryItem}
                        onClick={() => setLightboxIndex(idx)}
                      >
                        <Image
                          src={path}
                          alt={`Foto galeri ${idx + 1}`}
                          fill
                          sizes="(max-width: 900px) 50vw, 220px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </Reveal>
                  ))}
                </div>

                {/* Lightbox Modal */}
                {lightboxIndex !== null && (
                  <div
                    className={styles.lightboxOverlay}
                    onClick={() => setLightboxIndex(null)}
                  >
                    <button
                      ref={lightboxCloseRef}
                      type="button"
                      className={styles.lightboxClose}
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
                        src={galleryPaths[lightboxIndex]}
                        alt={`Tampilan besar foto ${lightboxIndex + 1}`}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ─── 8. HADIAH / AMPLOP DIGITAL ─── */}
            <section className={styles.sectionRow} id="hadiah">
              <WatermarkCrest />
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <SectionFloralHeader flowerPath={flowerPath} />
                  <span className={styles.sectionTag}>Tanda Kasih</span>
                  <h2 className={styles.sectionTitle}>Wedding Gift</h2>
                  <ThemedSectionDivider icon={dividerIcon} />
                  <p className={styles.sectionSubtitle}>
                    Doa restu Anda merupakan karunia terindah bagi kami. Bagi yang berkenan memberikan tanda kasih:
                  </p>
                </div>
              </Reveal>

              <div className={styles.giftList}>
                {giftAccounts.map((account, idx) => {
                  const key = `gift-${idx}`;
                  const isCopied = copiedKey === key;
                  return (
                    <Reveal key={key} direction="up" delay={idx * 100}>
                      <div className={styles.giftCard}>
                        <span className={styles.bankBadge}>{account.bank || "BANK"}</span>
                        <h4 className={styles.accountNumber}>{account.account_number}</h4>
                        <p className={styles.accountHolder}>a.n {account.account_name}</p>
                        <button
                          type="button"
                          className={`${styles.copyButton} ${isCopied ? styles.copySuccess : ""}`}
                          onClick={() => copyToClipboard(account.account_number || "", key)}
                        >
                          {isCopied ? (
                            <>
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                              </svg>
                              <span>Salin Rekening</span>
                            </>
                          )}
                        </button>
                      </div>
                    </Reveal>
                  );
                })}

                {giftAddress && (
                  <Reveal direction="up" delay={200}>
                    <div className={styles.giftAddressCard}>
                      <h4 className={styles.giftAddressTitle}>Kirim Kado Fisik</h4>
                      <p className={styles.giftAddressText}>{giftAddress}</p>
                      <button
                        type="button"
                        className={`${styles.copyButton} ${copiedKey === "address" ? styles.copySuccess : ""}`}
                        onClick={() => copyToClipboard(giftAddress, "address")}
                      >
                        {copiedKey === "address" ? (
                          <>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Alamat Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                            </svg>
                            <span>Salin Alamat</span>
                          </>
                        )}
                      </button>
                    </div>
                  </Reveal>
                )}
              </div>
            </section>

            {/* ─── 9. RSVP & BUKU UCAPAN ─── */}
            <section className={styles.sectionRow} id="ucapan">
              <WatermarkCrest />
              <Reveal direction="up">
                <div className={styles.sectionHeader}>
                  <SectionFloralHeader flowerPath={flowerPath} />
                  <span className={styles.sectionTag}>Konfirmasi Kehadiran</span>
                  <h2 className={styles.sectionTitle}>RSVP <span className={styles.titleAmpersand}>&amp;</span> Wishes</h2>
                  <ThemedSectionDivider icon={dividerIcon} />
                  <p className={styles.sectionSubtitle}>
                    Berikan konfirmasi kehadiran serta doa restu terbaik Anda untuk kedua mempelai
                  </p>
                </div>
              </Reveal>

              {/* RSVP Form */}
              <Reveal direction="up">
                <form className={styles.rsvpForm} onSubmit={handleSubmitRsvp}>
                  {statusMessage && (
                    <div
                      className={
                        statusMessage.type === "success"
                          ? styles.statusSuccess
                          : styles.statusError
                      }
                    >
                      {statusMessage.text}
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="rsvp-name" className={styles.formLabel}>
                      Nama Lengkap *
                    </label>
                    <input
                      id="rsvp-name"
                      type="text"
                      className={styles.formInput}
                      placeholder="Masukkan nama Anda"
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="rsvp-attendance" className={styles.formLabel}>
                      Konfirmasi Kehadiran *
                    </label>
                    <select
                      id="rsvp-attendance"
                      className={styles.formSelect}
                      value={rsvpAttendance}
                      onChange={(e) =>
                        setRsvpAttendance(e.target.value as "attending" | "not_attending")
                      }
                    >
                      <option value="attending">Hadir</option>
                      <option value="not_attending">Maaf, Tidak Bisa Hadir</option>
                    </select>
                  </div>

                  {rsvpAttendance === "attending" && (
                    <div className={styles.formGroup}>
                      <label htmlFor="rsvp-count" className={styles.formLabel}>
                        Jumlah Tamu
                      </label>
                      <select
                        id="rsvp-count"
                        className={styles.formSelect}
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
                    <label htmlFor="rsvp-message" className={styles.formLabel}>
                      Ucapan &amp; Doa Restu
                    </label>
                    <textarea
                      id="rsvp-message"
                      className={styles.formTextarea}
                      placeholder="Tuliskan ucapan dan doa untuk kedua mempelai..."
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? "Mengirim Konfirmasi..." : "Kirim Konfirmasi & Ucapan"}
                  </button>
                </form>
              </Reveal>

              {/* Greetings List */}
              {greetings.length > 0 && (
                <div className={styles.greetingsStream}>
                  {greetings.map((item) => (
                    <div key={item.id} className={styles.greetingItem}>
                      <div className={styles.greetingTop}>
                        <span className={styles.greetingName}>{item.guest_name}</span>
                        <span
                          className={
                            item.attendance === "attending"
                              ? styles.greetingBadgeAttending
                              : styles.greetingBadgeNotAttending
                          }
                        >
                          {item.attendance === "attending" ? "Hadir" : "Berhalangan"}
                        </span>
                      </div>
                      <p className={styles.greetingMsg}>{item.message}</p>
                      <span className={styles.greetingTime}>
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ─── 10. CLOSING / FOOTER ─── */}
            <footer className={styles.closingSection}>
              <WatermarkCrest />
              <Reveal direction="up">
                <p className={styles.closingDoa}>{invitation.closing_text}</p>
                <p className={styles.closingSalam}>{invitation.closing_greeting}</p>
                <div className={styles.closingFloralCrest}>
                  <Image
                    src={flowerPath}
                    alt=""
                    width={110}
                    height={140}
                    style={{ objectFit: "contain", pointerEvents: "none" }}
                  />
                </div>
                <h2 className={styles.closingCoupleNames}>{coupleNames}</h2>
                <p className={styles.brandWatermark}>
                  Created with love by {BRAND.name}
                </p>
              </Reveal>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
