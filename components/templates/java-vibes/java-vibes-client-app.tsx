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
  const [isClosingCover, setIsClosingCover] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("pembuka");

  // Greetings & RSVP state
  const [greetings, setGreetings] = useState<Greeting[]>(initialGreetings);
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpAttendance, setRsvpAttendance] = useState<"attending" | "not_attending">("attending");
  const [rsvpGuestCount, setRsvpGuestCount] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const displayGuestName = guestName || "Tamu Undangan";

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

  // ----------------------------------------------------
  // TWO-WAY SCROLL OBSERVER (ANIMATES WHEN SCROLLING DOWN & UP!)
  // ----------------------------------------------------
  useEffect(() => {
    if (!opened) return;

    // Small delay to ensure all DOM elements are rendered
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(".jv-reveal");
      if (!elements.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("jv-in-view");
            } else {
              // Element exited viewport in either direction - reset so it replays!
              entry.target.classList.remove("jv-in-view");
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [opened]);

  // Scrollspy for floating bottom nav
  useEffect(() => {
    if (!opened) return;
    const handleScroll = () => {
      const sections = ["pembuka", "mempelai", "acara", "kisah", "galeri", "hadiah", "ucapan"];
      const scrollPos = window.scrollY + 250;
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
    setIsClosingCover(true);
    setTimeout(() => {
      setOpened(true);
      setIsClosingCover(false);
    }, 750);

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
      message:
        rsvpMessage.trim() ||
        `Selamat menempuh hidup baru ${coupleNames}, semoga sakinah mawaddah warahmah!`,
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
            localStorage.setItem(
              `java_vibes_wishes_${invitation.id}`,
              JSON.stringify(next.slice(0, 50))
            );
          } catch {}
          return next;
        });
        setStatusMessage({
          type: "success",
          text: "Matur nuwun, doa restu & konfirmasi kehadiran panjenengan sampun katampi.",
        });
      } else {
        setGreetings((prev) => {
          const next = [newGreeting, ...prev.filter((g) => g.id !== newGreeting.id)];
          try {
            localStorage.setItem(
              `java_vibes_wishes_${invitation.id}`,
              JSON.stringify(next.slice(0, 50))
            );
          } catch {}
          return next;
        });
        setStatusMessage({
          type: "success",
          text: "Doa restu Anda berhasil dikirim.",
        });
      }
      setRsvpMessage("");
    } catch {
      setGreetings((prev) => {
        const next = [newGreeting, ...prev.filter((g) => g.id !== newGreeting.id)];
        try {
          localStorage.setItem(
            `java_vibes_wishes_${invitation.id}`,
            JSON.stringify(next.slice(0, 50))
          );
        } catch {}
        return next;
      });
      setStatusMessage({
        type: "success",
        text: "Doa restu Anda berhasil dikirim.",
      });
      setRsvpMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className={`${styles.experience} ${themeClassName}`}>
      {/* Background Audio Player */}
      <audio ref={audioRef} src={musicPath} loop preload="auto" />

      {/* ----------------------------------------------------
          COVER SCREEN MODAL (BEFORE OPENING)
          ---------------------------------------------------- */}
      {!opened && (
        <div className={`${styles.coverModal} ${isClosingCover ? styles.closing : ""}`}>
          <div className={styles.coverInner}>
            {/* Authentic 3D Border Ornaments */}
            <div className={styles.decorTopMiddle}>
              <Image src="/media/java-vibes/decor/tm.webp" alt="" width={520} height={180} priority style={{ width: "100%", height: "auto" }} />
            </div>
            <div className={styles.decorTopLeft}>
              <Image src="/media/java-vibes/decor/tl-2.webp" alt="" width={150} height={200} priority style={{ width: "100%", height: "auto" }} />
            </div>
            <div className={styles.decorTopRight}>
              <Image src="/media/java-vibes/decor/tr-2.webp" alt="" width={150} height={200} priority style={{ width: "100%", height: "auto" }} />
            </div>
            <div className={styles.decorBottomLeft}>
              <Image src="/media/java-vibes/decor/bl.webp" alt="" width={160} height={200} priority style={{ width: "100%", height: "auto" }} />
            </div>
            <div className={styles.decorBottomRight}>
              <Image src="/media/java-vibes/decor/br.webp" alt="" width={160} height={200} priority style={{ width: "100%", height: "auto" }} />
            </div>
            <div className={styles.decorBottomMiddle}>
              <Image src="/media/java-vibes/decor/bm-1.webp" alt="" width={520} height={200} priority style={{ width: "100%", height: "auto" }} />
            </div>

            {/* 3D Gunungan Wayang Center Background */}
            <div className={styles.coverGununganCenter}>
              <Image src="/media/java-vibes/decor/gunungan-3d.webp" alt="" width={420} height={560} priority style={{ width: "85%", height: "auto" }} />
            </div>

            {/* Cover Content */}
            <div className={styles.coverCard}>
              <div className={styles.coverSubtitle}>The Wedding Of</div>
              <div className={styles.coverPortrait}>
                <Image src={coverPath} alt={coupleNames} fill priority style={{ objectFit: "cover" }} sizes="220px" />
              </div>
              <h1 className={styles.coverCoupleTitle}>
                {invitation.bride_short_name} &amp; {invitation.groom_short_name}
              </h1>

              <div className={styles.coverGuestBox}>
                <span className={styles.coverGuestYth}>Kepada Yth. Bapak/Ibu/Saudara/i:</span>
                <span className={styles.coverGuestBadge}>{displayGuestName}</span>
              </div>

              <button type="button" onClick={openInvitation} className={styles.btnOpenInvitation}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Buka Undangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MAIN INVITATION CONTAINER (480PX MOBILE FRAME)
          ---------------------------------------------------- */}
      <div className={styles.containerMobile}>
        {/* SLIDE 1: PEMBUKA & AYAT AR-RUM 21 */}
        <section id="pembuka" className={styles.sectionBlock}>
          {/* Top & Bottom Ornaments for Slide 1 */}
          <div className={styles.decorTopMiddle}>
            <Image src="/media/java-vibes/decor/tm.webp" alt="" width={520} height={180} style={{ width: "100%", height: "auto" }} />
          </div>
          <div className={styles.decorBottomLeft}>
            <Image src="/media/java-vibes/decor/bl.webp" alt="" width={150} height={180} style={{ width: "100%", height: "auto" }} />
          </div>
          <div className={styles.decorBottomRight}>
            <Image src="/media/java-vibes/decor/br.webp" alt="" width={150} height={180} style={{ width: "100%", height: "auto" }} />
          </div>

          <div className={`${styles.archCard} jv-reveal jv-reveal-zoom`}>
            <div className={styles.archCardTopImage}>
              <Image src={profilePath} alt={coupleNames} fill style={{ objectFit: "cover" }} sizes="400px" />
            </div>
            <div className={styles.archCardBody}>
              <div className={`${styles.cursiveCoupleName} jv-reveal jv-reveal-up`}>
                {invitation.bride_short_name} &amp; {invitation.groom_short_name}
              </div>
              <div className={`${styles.arabicBismillah} jv-reveal jv-reveal-up`}>
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
              </div>
              <p className={`${styles.quoteText} jv-reveal jv-reveal-up`}>
                &ldquo;{invitation.quote_text}&rdquo;
              </p>
              <span className={`${styles.quoteSource} jv-reveal jv-reveal-up`}>
                {invitation.quote_source}
              </span>
            </div>
          </div>
        </section>

        {/* SLIDE 2: MEMPELAI (BRIDE & GROOM) */}
        <section id="mempelai" className={styles.sectionBlock}>
          <div className={`${styles.mempelaiCard} jv-reveal jv-reveal-up`}>
            {/* 3D Candi Stone Pillars Flanking the Mempelai Card */}
            <div className={styles.pillarLeft}>
              <Image src="/media/java-vibes/decor/pillar-left.webp" alt="" width={120} height={380} style={{ width: "100%", height: "auto" }} />
            </div>
            <div className={styles.pillarRight}>
              <Image src="/media/java-vibes/decor/pillar-right.webp" alt="" width={120} height={380} style={{ width: "100%", height: "auto" }} />
            </div>

            <div className={`${styles.sectionTitleCursive} jv-reveal jv-reveal-down`}>Bride &amp; Groom</div>
            <div className={`${styles.salamText} jv-reveal jv-reveal-up`}>Assalamu&apos;alaikum Wr. Wb.</div>
            <p className={`${styles.introDesc} jv-reveal jv-reveal-up`}>
              {invitation.opening_text}
            </p>

            {/* THE BRIDE (Dita Maharani Putri) */}
            <div className={`${styles.personBlock} jv-reveal jv-reveal-left`}>
              <div className={styles.photoFrameMelati}>
                {/* Waving Ronce Melati Left */}
                <div className={styles.melatiSwayLeft}>
                  <Image src="/media/java-vibes/decor/melati-sway-left.webp" alt="" width={120} height={160} style={{ width: "100%", height: "auto" }} />
                </div>
                {/* Waving Ronce Melati Right */}
                <div className={styles.melatiSwayRight}>
                  <Image src="/media/java-vibes/decor/melati-sway-right.webp" alt="" width={105} height={145} style={{ width: "100%", height: "auto" }} />
                </div>
                <div className={styles.photoArchInner}>
                  <Image src={bridePhotoPath} alt={invitation.bride_name} fill style={{ objectFit: "cover" }} sizes="220px" />
                </div>
              </div>
              <div className={styles.personShortName}>{invitation.bride_short_name}</div>
              <div className={styles.personFullName}>{invitation.bride_name}</div>
              <div className={styles.personParents}>{invitation.bride_parents}</div>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.instagramPill}>
                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram
              </a>
            </div>

            <div className={`${styles.coupleAmpersand} jv-reveal jv-reveal-zoom`}>&amp;</div>

            {/* THE GROOM (Fajar Sidik) */}
            <div className={`${styles.personBlock} jv-reveal jv-reveal-right`}>
              <div className={styles.photoFrameMelati}>
                <div className={styles.melatiSwayLeft}>
                  <Image src="/media/java-vibes/decor/melati-sway-left.webp" alt="" width={120} height={160} style={{ width: "100%", height: "auto" }} />
                </div>
                <div className={styles.melatiSwayRight}>
                  <Image src="/media/java-vibes/decor/melati-sway-right.webp" alt="" width={105} height={145} style={{ width: "100%", height: "auto" }} />
                </div>
                <div className={styles.photoArchInner}>
                  <Image src={groomPhotoPath} alt={invitation.groom_name} fill style={{ objectFit: "cover" }} sizes="220px" />
                </div>
              </div>
              <div className={styles.personShortName}>{invitation.groom_short_name}</div>
              <div className={styles.personFullName}>{invitation.groom_name}</div>
              <div className={styles.personParents}>{invitation.groom_parents}</div>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.instagramPill}>
                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram
              </a>
            </div>
          </div>
        </section>

        {/* SLIDE 3: SAVE THE DATE & ACARA (AKAD & RESEPSI) */}
        <section id="acara" className={styles.sectionSaveTheDate}>
          <div className={styles.saveDateBackdrop} />

          <div className={styles.saveDateContent}>
            {/* 3D Arch Top Canopy */}
            <div className={`${styles.archTopCanopy} jv-reveal jv-reveal-down`}>
              <Image src="/media/java-vibes/decor/arch-top.webp" alt="" width={380} height={120} style={{ width: "100%", height: "auto" }} />
            </div>

            <div className={`${styles.saveTheDateTitle} jv-reveal jv-reveal-up`}>Save The Date</div>

            {/* Countdown Grid */}
            <div className={`${styles.countdownGrid} jv-reveal jv-reveal-zoom`}>
              <div className={styles.countdownBox}>
                <span className={styles.countdownNumber}>{String(timeLeft.days).padStart(2, "0")}</span>
                <span className={styles.countdownLabel}>Hari</span>
              </div>
              <div className={styles.countdownBox}>
                <span className={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className={styles.countdownLabel}>Jam</span>
              </div>
              <div className={styles.countdownBox}>
                <span className={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className={styles.countdownLabel}>Menit</span>
              </div>
              <div className={styles.countdownBox}>
                <span className={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className={styles.countdownLabel}>Detik</span>
              </div>
            </div>

            <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={`${styles.btnCalendar} jv-reveal jv-reveal-up`}>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>
              Simpan ke Google Calendar
            </a>

            {/* Gold Divider */}
            <div className={`${styles.goldDividerImg} jv-reveal jv-reveal-zoom`}>
              <Image src="/media/java-vibes/decor/gold-divider.webp" alt="" width={240} height={40} style={{ width: "100%", height: "auto" }} />
            </div>

            {/* AKAD NIKAH CARD */}
            <div className={`${styles.eventCard} jv-reveal jv-reveal-left`}>
              <div className={styles.eventTitle}>Akad Nikah</div>
              <div className={styles.eventDay}>Sabtu</div>
              <div className={styles.eventBigDate}>12</div>
              <div className={styles.eventMonthYear}>Desember 2026</div>
              <div className={styles.eventTime}>{invitation.ceremony_time}</div>

              <div className={styles.eventLocationPin}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div className={styles.eventVenueName}>{invitation.venue_name}</div>
              <div className={styles.eventVenueAddress}>{invitation.venue_address}</div>

              <a href={invitation.maps_url || "#"} target="_blank" rel="noopener noreferrer" className={styles.btnLocation}>
                Petunjuk ke Lokasi
              </a>
            </div>

            {/* RESEPSI CARD */}
            <div className={`${styles.eventCard} jv-reveal jv-reveal-right`}>
              <div className={styles.eventTitle}>Resepsi</div>
              <div className={styles.eventDay}>Sabtu</div>
              <div className={styles.eventBigDate}>12</div>
              <div className={styles.eventMonthYear}>Desember 2026</div>
              <div className={styles.eventTime}>{invitation.reception_time}</div>

              <div className={styles.eventLocationPin}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div className={styles.eventVenueName}>{invitation.venue_name}</div>
              <div className={styles.eventVenueAddress}>{invitation.venue_address}</div>

              <a href={invitation.maps_url || "#"} target="_blank" rel="noopener noreferrer" className={styles.btnLocation}>
                Petunjuk ke Lokasi
              </a>
            </div>
          </div>
        </section>

        {/* SLIDE 4: KISAH CINTA (OUR LOVE STORY) */}
        <section id="kisah" className={styles.sectionBlock}>
          <div className={`${styles.storyCard} jv-reveal jv-reveal-up`}>
            <div className={`${styles.sectionTitleCursive} jv-reveal jv-reveal-down`}>Our Love Story</div>
            <div className={styles.timelineWrap}>
              {invitation.story && invitation.story.length > 0 ? (
                invitation.story.map((item, idx) => (
                  <div key={idx} className={`${styles.timelineItem} jv-reveal jv-reveal-left`} style={{ transitionDelay: `${idx * 150}ms` }}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineTitle}>{item.title} ({item.year})</div>
                    <div className={styles.timelineText}>{item.text}</div>
                  </div>
                ))
              ) : (
                <>
                  <div className={`${styles.timelineItem} jv-reveal jv-reveal-left`}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineTitle}>Pertemuan Pertama (2018)</div>
                    <div className={styles.timelineText}>
                      Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita.
                    </div>
                  </div>
                  <div className={`${styles.timelineItem} jv-reveal jv-reveal-left`}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineTitle}>Momen Lamaran (2024)</div>
                    <div className={styles.timelineText}>
                      Dengan niat yang tulus dan restu kedua orang tua, kami melangkah ke jenjang yang lebih serius.
                    </div>
                  </div>
                  <div className={`${styles.timelineItem} jv-reveal jv-reveal-left`}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineTitle}>Ikatan Suci Pernikahan (2026)</div>
                    <div className={styles.timelineText}>
                      Kini kami bersiap mengikat janji suci pernikahan, memulai babak baru penuh berkah dan cinta.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* SLIDE 5: GALERI (OUR MOMENTS) */}
        <section id="galeri" className={styles.sectionBlock}>
          <div className={`${styles.galleryCard} jv-reveal jv-reveal-up`}>
            <div className={`${styles.sectionTitleCursive} jv-reveal jv-reveal-down`}>Our Moments</div>
            <p className={`${styles.introDesc} jv-reveal jv-reveal-up`}>
              Potret kebersamaan yang terpatri dalam kenangan indah menuju ikatan suci.
            </p>

            <div className={styles.galleryGrid}>
              {galleryPaths.map((path, idx) => (
                <div
                  key={idx}
                  className={`${styles.galleryThumb} jv-reveal jv-reveal-zoom`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                  onClick={() => setLightboxIndex(idx)}
                >
                  <Image src={path} alt={`Galeri ${idx + 1}`} fill style={{ objectFit: "cover" }} sizes="(max-width: 480px) 50vw, 240px" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 6: TANDA KASIH (WEDDING GIFT) */}
        <section id="hadiah" className={styles.sectionBlock}>
          <div className={`${styles.giftCard} jv-reveal jv-reveal-up`}>
            <div className={`${styles.sectionTitleCursive} jv-reveal jv-reveal-down`}>Tanda Kasih</div>
            <p className={`${styles.giftDesc} jv-reveal jv-reveal-up`}>
              Doa restu Anda merupakan karunia terindah bagi kami. Bagi yang berkenan memberikan tanda kasih, dapat mengirimkan melalui:
            </p>

            {/* Bank Card */}
            <div className={`${styles.bankBox} jv-reveal jv-reveal-zoom`}>
              <div className={styles.bankLogo}>{invitation.gift_info.bank || "BCA"}</div>
              <div className={styles.bankAccountNo}>{invitation.gift_info.account_number || "7125091428"}</div>
              <div className={styles.bankHolder}>a.n. {invitation.gift_info.account_name || "Fajar Sidik"}</div>
              <button
                type="button"
                onClick={() => copyToClipboard(invitation.gift_info.account_number || "7125091428", "rekening")}
                className={styles.btnCopy}
              >
                {copiedKey === "rekening" ? "Tersalin!" : "Salin No. Rekening"}
              </button>
            </div>

            {/* Kado Fisik / Alamat */}
            <div className={`${styles.addressBox} jv-reveal jv-reveal-zoom`}>
              <div className={styles.addressTitle}>Kirim Kado</div>
              <div className={styles.addressText}>
                {invitation.venue_name}, {invitation.venue_address}
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`${invitation.venue_name}, ${invitation.venue_address}`, "alamat")}
                className={styles.btnCopy}
              >
                {copiedKey === "alamat" ? "Tersalin!" : "Salin Alamat"}
              </button>
            </div>
          </div>
        </section>

        {/* SLIDE 7: DOA RESTU & RSVP (CONNECTED TO SUPABASE) */}
        <section id="ucapan" className={styles.sectionBlock}>
          <div className={`${styles.rsvpCard} jv-reveal jv-reveal-up`}>
            <div className={`${styles.sectionTitleCursive} jv-reveal jv-reveal-down`}>Kirim Ucapan</div>
            <p className={`${styles.introDesc} jv-reveal jv-reveal-up`}>
              Tinggalkan doa restu dan konfirmasi kehadiran panjenengan untuk kedua mempelai.
            </p>

            <form onSubmit={handleSubmitRsvp} className={styles.rsvpForm}>
              <div className={styles.inputGroup}>
                <label>Nama Tamu</label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Tulis nama Anda"
                  className={styles.textInput}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Konfirmasi Kehadiran</label>
                <select
                  value={rsvpAttendance}
                  onChange={(e) => setRsvpAttendance(e.target.value as "attending" | "not_attending")}
                  className={styles.selectInput}
                >
                  <option value="attending">Hadir</option>
                  <option value="not_attending">Tidak Hadir</option>
                </select>
              </div>

              {rsvpAttendance === "attending" && (
                <div className={styles.inputGroup}>
                  <label>Jumlah Tamu</label>
                  <select
                    value={rsvpGuestCount}
                    onChange={(e) => setRsvpGuestCount(Number(e.target.value))}
                    className={styles.selectInput}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} Orang</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>Pesan &amp; Doa Restu</label>
                <textarea
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  placeholder="Tuliskan ucapan dan doa terbaik Anda..."
                  className={styles.textareaInput}
                />
              </div>

              {statusMessage && (
                <div className={styles.formStatusSuccess}>
                  {statusMessage.text}
                </div>
              )}

              <button type="submit" disabled={submitting} className={styles.btnSubmitRsvp}>
                {submitting ? "Mengirim Doa Restu..." : "Kirim Doa Restu"}
              </button>
            </form>

            {/* LIVE SUPABASE GREETINGS FEED */}
            <div className={styles.greetingsFeed}>
              {greetings.map((g) => (
                <div key={g.id || g.message} className={styles.greetingItem}>
                  <div className={styles.greetingHeader}>
                    <span className={styles.greetingAuthor}>{g.guest_name}</span>
                    <span
                      className={`${styles.attendanceBadge} ${
                        g.attendance === "attending" ? styles.badgeHadir : styles.badgeTidakHadir
                      }`}
                    >
                      {g.attendance === "attending" ? "Hadir" : "Tidak Hadir"}
                    </span>
                  </div>
                  <div className={styles.greetingMessage}>{g.message}</div>
                  <div className={styles.greetingTime}>{formatRelativeTime(g.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 8: PENUTUP & TERIMA KASIH */}
        <section className={styles.closingSection}>
          <div className={`${styles.closingEmblem} jv-reveal jv-reveal-zoom`}>
            <Image src="/media/java-vibes/decor/gunungan-emblem.webp" alt="" width={90} height={120} style={{ width: "100%", height: "auto" }} />
          </div>

          <div className={`${styles.closingTitle} jv-reveal jv-reveal-up`}>Matur Nuwun</div>

          <p className={`${styles.closingDesc} jv-reveal jv-reveal-up`}>
            {invitation.closing_text}
          </p>

          <div className={`${styles.closingGreeting} jv-reveal jv-reveal-up`}>
            {invitation.closing_greeting}
          </div>

          <div className={styles.watermarkBrand}>
            Powered by {BRAND.name} &bull; Digital Wedding Invitation
          </div>
        </section>
      </div>

      {/* ----------------------------------------------------
          FLOATING MUSIC CONTROLLER
          ---------------------------------------------------- */}
      {opened && (
        <button
          type="button"
          onClick={toggleMusic}
          className={`${styles.floatingMusicBtn} ${playing ? styles.playing : ""}`}
          aria-label={playing ? "Jeda Musik" : "Putar Musik"}
        >
          {playing ? (
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          ) : (
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73L19.73 21 21 19.73 4.27 3zM14 7h4V3h-6v5.18l2 2z"/></svg>
          )}
        </button>
      )}

      {/* ----------------------------------------------------
          FLOATING BOTTOM NAVIGATION
          ---------------------------------------------------- */}
      {opened && (
        <nav className={styles.floatingBottomNav}>
          <button
            type="button"
            onClick={() => scrollToSection("pembuka")}
            className={`${styles.navBtn} ${activeSection === "pembuka" ? styles.navActive : ""}`}
            title="Pembuka"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("mempelai")}
            className={`${styles.navBtn} ${activeSection === "mempelai" ? styles.navActive : ""}`}
            title="Mempelai"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("acara")}
            className={`${styles.navBtn} ${activeSection === "acara" ? styles.navActive : ""}`}
            title="Acara"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("kisah")}
            className={`${styles.navBtn} ${activeSection === "kisah" ? styles.navActive : ""}`}
            title="Kisah"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("galeri")}
            className={`${styles.navBtn} ${activeSection === "galeri" ? styles.navActive : ""}`}
            title="Galeri"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("hadiah")}
            className={`${styles.navBtn} ${activeSection === "hadiah" ? styles.navActive : ""}`}
            title="Hadiah"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("ucapan")}
            className={`${styles.navBtn} ${activeSection === "ucapan" ? styles.navActive : ""}`}
            title="Ucapan"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
          </button>
        </nav>
      )}

      {/* ----------------------------------------------------
          LIGHTBOX MODAL
          ---------------------------------------------------- */}
      {lightboxIndex !== null && (
        <div className={styles.lightboxModal} onClick={() => setLightboxIndex(null)}>
          <button
            type="button"
            className={styles.lightboxCloseBtn}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <button
            type="button"
            className={styles.lightboxNavPrev}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev !== null ? (prev - 1 + galleryPaths.length) % galleryPaths.length : null));
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>

          <div className={styles.lightboxImageWrapper} onClick={(e) => e.stopPropagation()}>
            <Image
              src={galleryPaths[lightboxIndex]}
              alt={`Galeri ${lightboxIndex + 1}`}
              fill
              style={{ objectFit: "contain" }}
              sizes="90vw"
            />
          </div>

          <button
            type="button"
            className={styles.lightboxNavNext}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryPaths.length : null));
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
