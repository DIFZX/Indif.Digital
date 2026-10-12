"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import styles from "./sunda-vibes.module.css";

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
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date(`${value}T12:00:00+07:00`));
  } catch {
    return "Sabtu, 12 Desember 2026";
  }
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

export function SundaVibesClientApp({
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
      const stored = localStorage.getItem(`sunda_vibes_wishes_${invitation.id}`);
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
      const target = new Date(`${invitation.event_date || "2026-12-12"}T08:00:00+07:00`).getTime();
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

  // Lock body scroll only when cover modal is visible
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
  // TWO-WAY SCROLL OBSERVER (ANIMATES BOTH DOWN & UP)
  // ----------------------------------------------------
  useEffect(() => {
    if (!opened) return;

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(
        `.${styles.svReveal}, .${styles.svRevealLeft}, .${styles.svRevealRight}, .${styles.svRevealScale}`
      );
      if (!elements.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(styles.svInView);
            } else {
              // Element leaves viewport either scrolling down or up -> reset so it replays!
              entry.target.classList.remove(styles.svInView);
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
    }, 120);

    return () => clearTimeout(timer);
  }, [opened]);

  // Scrollspy for floating bottom navigation
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

  function openInvitation() {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }

    setIsClosingCover(true);
    setTimeout(() => {
      setOpened(true);
      setIsClosingCover(false);
    }, 400);
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
        `Wilujeng nikah kagem ${coupleNames}, mugi janten kulawarga anu sakinah mawaddah warahmah!`,
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
              `sunda_vibes_wishes_${invitation.id}`,
              JSON.stringify(next.slice(0, 50))
            );
          } catch {}
          return next;
        });
        setStatusMessage({
          type: "success",
          text: "Hatur nuhun! Doa restu sareng konfirmasi kehadiran anjeun parantos katampi.",
        });
        setRsvpMessage("");
      } else {
        throw new Error("Gagal ngirim ucapan");
      }
    } catch {
      // Optimistic fallback
      setGreetings((prev) => {
        const next = [newGreeting, ...prev];
        try {
          localStorage.setItem(
            `sunda_vibes_wishes_${invitation.id}`,
            JSON.stringify(next.slice(0, 50))
          );
        } catch {}
        return next;
      });
      setStatusMessage({
        type: "success",
        text: "Hatur nuhun! Doa restu anjeun parantos kacatet.",
      });
      setRsvpMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const formattedDate = useMemo(
    () => formatEventDate(invitation.event_date || "2026-12-12"),
    [invitation.event_date]
  );

  return (
    <div className={`${styles.experience} ${themeClassName}`}>
      {/* Background Audio */}
      <audio ref={audioRef} src={musicPath} loop preload="auto" />

      {/* ====================================================
          COVER SCREEN MODAL (BEFORE OPENING)
          ==================================================== */}
      {!opened && (
        <div className={`${styles.coverModal} ${isClosingCover ? styles.closing : ""}`}>
          <div className={styles.coverInner}>
            {/* Top Siger Crown & Title */}
            <div>
              <div className={styles.coverSigerWrap}>
                <Image
                  src="/media/sunda-vibes/decor/siger.webp"
                  alt="Siger Sunda"
                  width={90}
                  height={85}
                  priority
                  className={styles.coverSigerImg}
                />
              </div>
              <div className={styles.coverSubheader}>The Wedding of</div>
              <h1 className={styles.coverCoupleTitle}>
                {invitation.bride_short_name} &amp; {invitation.groom_short_name}
              </h1>
              <div className={styles.coverDateBadge}>{formattedDate}</div>
            </div>

            {/* Arched Photo Frame */}
            <div className={styles.coverPhotoFrame}>
              <Image
                src={coverPath}
                alt={coupleNames}
                fill
                priority
                className={styles.coverPhotoImg}
              />
            </div>

            {/* Guest Name & Open Button */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className={styles.coverGuestCard}>
                <div className={styles.coverGuestLabel}>Kepada Yth. Bapak/Ibu/Saudara/i:</div>
                <div className={styles.coverGuestName}>{displayGuestName}</div>
              </div>

              <button
                type="button"
                onClick={openInvitation}
                className={styles.btnOpenInvitation}
                id="btn-open-invitation"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                </svg>
                <span>Buka Undangan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MAIN INVITATION CONTENT (MOBILE FRAME 480PX)
          ==================================================== */}
      <div className={styles.containerMobile}>
        {/* SECTION 1: HERO / PEMBUKA */}
        <section id="pembuka" className={styles.heroSection}>
          <div className={`${styles.svRevealScale} ${styles.coverSigerWrap}`}>
            <Image
              src="/media/sunda-vibes/decor/siger.webp"
              alt="Siger Sunda Mahkota"
              width={80}
              height={75}
              priority
              className={styles.coverSigerImg}
            />
          </div>

          <div className={`${styles.svReveal} ${styles.heroTagline}`}>
            THE WEDDING OF
          </div>

          <h1 className={`${styles.svReveal} ${styles.heroCoupleName}`}>
            {invitation.bride_short_name} &amp; {invitation.groom_short_name}
          </h1>

          <div className={`${styles.svReveal} ${styles.heroDate}`}>
            {formattedDate}
          </div>

          {/* Arched Photo Frame */}
          <div className={`${styles.svRevealScale} ${styles.heroArchFrame}`}>
            <Image
              src={profilePath || coverPath}
              alt={coupleNames}
              fill
              priority
              className={styles.heroArchImg}
            />
          </div>

          <Image
            src="/media/sunda-vibes/decor/frame.webp"
            alt="Decorative Frame"
            width={440}
            height={55}
            className={`${styles.svReveal} ${styles.frameDivider}`}
          />
        </section>

        {/* SECTION 2: AYAT SUCI / QUOTE */}
        <section className={styles.quoteSection}>
          <div className={`${styles.svReveal} ${styles.quoteCard}`}>
            <Image
              src="/media/sunda-vibes/decor/siger.webp"
              alt="Siger Sunda"
              width={50}
              height={47}
              className={styles.quoteSiger}
            />

            <div className={styles.bismillahText}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            <p className={styles.quoteContent}>
              &ldquo;{invitation.quote_text ||
                "Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir."}&rdquo;
            </p>

            <div className={styles.quoteSurah}>
              {invitation.quote_source || "QS. Ar-Rum : 21"}
            </div>
          </div>
        </section>

        {/* SECTION 3: THE COUPLE (MEMPELAI) */}
        <section id="mempelai" className={styles.coupleSection}>
          <h2 className={`${styles.svReveal} ${styles.sectionTitleScript}`}>
            The Couple
          </h2>
          <div className={`${styles.svReveal} ${styles.sectionSubtitle}`}>
            Calon Panganten
          </div>

          {/* Bride Card */}
          <div className={`${styles.svRevealLeft} ${styles.coupleCard}`}>
            <div className={styles.couplePhotoFrame}>
              <Image
                src={bridePhotoPath}
                alt={invitation.bride_name}
                fill
                className={styles.couplePhotoImg}
              />
            </div>
            <div className={styles.coupleRole}>Pengantin Wanita (Neng)</div>
            <h3 className={styles.coupleFullName}>{invitation.bride_name}</h3>
            <p className={styles.coupleParents}>
              {invitation.bride_parents || "Putri Pertama dari Bapak Bambang Wijaya & Ibu Siti Aminah"}
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.coupleIgPill}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>@{invitation.bride_short_name.toLowerCase()}maharani</span>
            </a>
          </div>

          {/* Ampersand Divider */}
          <div className={`${styles.svRevealScale} ${styles.coupleAmpersand}`}>&amp;</div>

          {/* Groom Card */}
          <div className={`${styles.svRevealRight} ${styles.coupleCard}`}>
            <div className={styles.couplePhotoFrame}>
              <Image
                src={groomPhotoPath}
                alt={invitation.groom_name}
                fill
                className={styles.couplePhotoImg}
              />
            </div>
            <div className={styles.coupleRole}>Pengantin Pria (A)</div>
            <h3 className={styles.coupleFullName}>{invitation.groom_name}</h3>
            <p className={styles.coupleParents}>
              {invitation.groom_parents || "Putra Kedua dari Bapak Hendra Kusuma & Ibu Dewi Lestari"}
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.coupleIgPill}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>@{invitation.groom_short_name.toLowerCase()}satria</span>
            </a>
          </div>
        </section>

        {/* SECTION 4: ACARA PERNIKAHAN */}
        <section id="acara" className={styles.eventsSection}>
          <h2 className={`${styles.svReveal} ${styles.sectionTitleScript}`}>
            Waktu &amp; Tempat
          </h2>
          <div className={`${styles.svReveal} ${styles.sectionSubtitle}`}>
            Runtuyan Acara
          </div>

          <p className={`${styles.svReveal} ${styles.introSalam}`}>
            {invitation.opening_text ||
              "Kalayan nyuhunkeun widi sareng ridho ti Gusti Allah SWT, simkuring saparakanca seja ngahaturanan uninga kana syukuran pernikahan putra-putri kami:"}
          </p>

          {/* Akad Nikah Card */}
          <div className={`${styles.svReveal} ${styles.eventCard}`}>
            <div className={styles.eventIconHeader}>💍</div>
            <h3 className={styles.eventTitle}>Akad Nikah</h3>
            <div className={styles.eventDateBadge}>{formattedDate}</div>
            <div className={styles.eventTimeText}>
              Pukul: {invitation.ceremony_time || "08.00 WIB - Selesai"}
            </div>

            <div className={styles.eventVenueDivider}></div>

            <div className={styles.eventVenueLabel}>Lokasi Acara</div>
            <div className={styles.eventVenueName}>{invitation.venue_name}</div>
            <div className={styles.eventVenueAddress}>{invitation.venue_address}</div>

            {invitation.maps_url && (
              <a
                href={invitation.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnMap}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Petunjuk Lokasi (Google Maps)</span>
              </a>
            )}
          </div>

          {/* Resepsi Card */}
          <div className={`${styles.svReveal} ${styles.eventCard}`}>
            <div className={styles.eventIconHeader}>🎉</div>
            <h3 className={styles.eventTitle}>Resepsi Pernikahan</h3>
            <div className={styles.eventDateBadge}>{formattedDate}</div>
            <div className={styles.eventTimeText}>
              Pukul: {invitation.reception_time || "11.00 WIB - Selesai"}
            </div>

            <div className={styles.eventVenueDivider}></div>

            <div className={styles.eventVenueLabel}>Lokasi Acara</div>
            <div className={styles.eventVenueName}>{invitation.venue_name}</div>
            <div className={styles.eventVenueAddress}>{invitation.venue_address}</div>

            {invitation.maps_url && (
              <a
                href={invitation.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnMap}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Petunjuk Lokasi (Google Maps)</span>
              </a>
            )}
          </div>

          {/* Dress Code & Catatan */}
          <div className={`${styles.svReveal} ${styles.dressCodeCard}`}>
            <div className={styles.dressCodeTitle}>Dress Code Acara</div>
            <p className={styles.dressCodeDesc}>
              Kalayan hormat, simkuring saparakanca nganjurkeun para tamu uleman ngagem acuk kalayan warna-warna bumi (Earth Tone):
            </p>
            <div className={styles.dressCodePalette}>
              <div className={styles.colorSwatch} style={{ backgroundColor: "#A87B57" }} title="Warm Bronze"></div>
              <div className={styles.colorSwatch} style={{ backgroundColor: "#C19C8E" }} title="Rosewood"></div>
              <div className={styles.colorSwatch} style={{ backgroundColor: "#E3CEBE" }} title="Champagne Cream"></div>
              <div className={styles.colorSwatch} style={{ backgroundColor: "#85937D" }} title="Sage Olive"></div>
            </div>
            <p className={styles.dressCodeDesc} style={{ marginTop: "0.8rem", fontSize: "0.72rem" }}>
              *Punten sateuacanna supados tetep ngiringan protokol kasehatan sareng katertiban salami acara lumangsung.
            </p>
          </div>
        </section>

        {/* SECTION 5: COUNTDOWN & GOOGLE CALENDAR */}
        <section className={styles.countdownSection}>
          <h2 className={`${styles.svReveal} ${styles.sectionTitleScript}`}>
            Counting The Days
          </h2>
          <div className={`${styles.svReveal} ${styles.sectionSubtitle}`}>
            Ngetang Dinten
          </div>

          <div className={`${styles.svReveal} ${styles.countdownGrid}`}>
            <div className={styles.countdownBox}>
              <div className={styles.countdownNumber}>{timeLeft.days}</div>
              <div className={styles.countdownLabel}>Dinten</div>
            </div>
            <div className={styles.countdownBox}>
              <div className={styles.countdownNumber}>{timeLeft.hours}</div>
              <div className={styles.countdownLabel}>Tabuh</div>
            </div>
            <div className={styles.countdownBox}>
              <div className={styles.countdownNumber}>{timeLeft.minutes}</div>
              <div className={styles.countdownLabel}>Menit</div>
            </div>
            <div className={styles.countdownBox}>
              <div className={styles.countdownNumber}>{timeLeft.seconds}</div>
              <div className={styles.countdownLabel}>Detik</div>
            </div>
          </div>

          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.svReveal} ${styles.btnCalendar}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Simpen kana Google Calendar</span>
          </a>

          {/* Live Streaming card */}
          <div className={`${styles.svReveal} ${styles.streamingCard}`}>
            <div className={styles.streamingTitle}>Live Streaming</div>
            <p className={styles.streamingDesc}>
              Kagem wargi atanapi rerencangan anu teu tiasa sumping langsung, tiasa nyakseni momen kabagjaan ieu sacara daring ngalangkungan siaran langsung di handap ieu:
            </p>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnLive}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
              <span>Nongton Live Streaming</span>
            </a>
          </div>
        </section>

        {/* SECTION 6: KISAH CINTA (LOVE STORY) */}
        <section id="kisah" className={styles.storySection}>
          <div style={{ textAlign: "center" }}>
            <h2 className={`${styles.svReveal} ${styles.sectionTitleScript}`}>
              Love Stories
            </h2>
            <div className={`${styles.svReveal} ${styles.sectionSubtitle}`}>
              Lalampahan Asih
            </div>
          </div>

          <div className={styles.storyTimeline}>
            {invitation.story && invitation.story.length > 0 ? (
              invitation.story.map((st, i) => (
                <div key={i} className={`${styles.svReveal} ${styles.storyCard}`}>
                  <div className={styles.storyNodeDot}></div>
                  <div className={styles.storyYearBadge}>{st.year}</div>
                  <h3 className={styles.storyTitle}>{st.title}</h3>
                  <p className={styles.storyText}>{st.text}</p>
                </div>
              ))
            ) : (
              <>
                <div className={`${styles.svReveal} ${styles.storyCard}`}>
                  <div className={styles.storyNodeDot}></div>
                  <div className={styles.storyYearBadge}>2021</div>
                  <h3 className={styles.storyTitle}>Pertemuan Pertama</h3>
                  <p className={styles.storyText}>
                    Patepang dina hiji kasempetan anu saderhana, ngawitan silih kenal sareng silih ngabagi carita dugi ka tuwuh rasa asih anu tulus.
                  </p>
                </div>
                <div className={`${styles.svReveal} ${styles.storyCard}`}>
                  <div className={styles.storyNodeDot}></div>
                  <div className={styles.storyYearBadge}>2023</div>
                  <h3 className={styles.storyTitle}>Perjalanan Asih</h3>
                  <p className={styles.storyText}>
                    Ngaliwatan sagala dinamika sareng kabagjaan sasarengan, nguatkeun komitmen kanggo silih damping dina kaayaan naon wae.
                  </p>
                </div>
                <div className={`${styles.svReveal} ${styles.storyCard}`}>
                  <div className={styles.storyNodeDot}></div>
                  <div className={styles.storyYearBadge}>2025</div>
                  <h3 className={styles.storyTitle}>Momen Lamaran</h3>
                  <p className={styles.storyText}>
                    Kalayan restu ti sepuh kadua pihak, kami ngalengkahkeun tekad kanggo ngabeungkeut jangji dina acara lamaran anu khidmat.
                  </p>
                </div>
                <div className={`${styles.svReveal} ${styles.storyCard}`}>
                  <div className={styles.storyNodeDot}></div>
                  <div className={styles.storyYearBadge}>2026</div>
                  <h3 className={styles.storyTitle}>Menuju Halal</h3>
                  <p className={styles.storyText}>
                    Kini dinten anu dinanti parantos cunduk, nyampurnakeun satengahing ageman dina ikatan suci pernikahan anu abadi.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* SECTION 7: GALERI FOTO & LIGHTBOX */}
        <section id="galeri" className={styles.gallerySection}>
          <h2 className={`${styles.svReveal} ${styles.sectionTitleScript}`}>
            Our Gallery
          </h2>
          <div className={`${styles.svReveal} ${styles.sectionSubtitle}`}>
            Momen Bahagia
          </div>

          <div className={`${styles.svReveal} ${styles.galleryQuote}`}>
            &ldquo;Constantly, consistently, continually, You.&rdquo;
          </div>

          <div className={`${styles.svReveal} ${styles.galleryGrid}`}>
            {galleryPaths.map((path, idx) => (
              <div
                key={idx}
                className={styles.galleryItem}
                onClick={() => setLightboxIndex(idx)}
              >
                <Image
                  src={path}
                  alt={`Galeri ${idx + 1}`}
                  fill
                  className={styles.galleryItemImg}
                />
              </div>
            ))}
          </div>
        </section>

        {/* LIGHTBOX MODAL */}
        {lightboxIndex !== null && (
          <div
            className={styles.lightboxModal}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className={styles.lightboxCloseBtn}
              onClick={() => setLightboxIndex(null)}
              aria-label="Tutup Galeri"
            >
              ✕
            </button>

            {galleryPaths.length > 1 && (
              <>
                <button
                  className={`${styles.lightboxNavBtn} ${styles.prev}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev !== null ? (prev - 1 + galleryPaths.length) % galleryPaths.length : 0
                    );
                  }}
                  aria-label="Sebelumnya"
                >
                  ‹
                </button>
                <button
                  className={`${styles.lightboxNavBtn} ${styles.next}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev !== null ? (prev + 1) % galleryPaths.length : 0
                    );
                  }}
                  aria-label="Selanjutnya"
                >
                  ›
                </button>
              </>
            )}

            <div
              className={styles.lightboxImgWrap}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryPaths[lightboxIndex]}
                alt={`Tampilan Galeri ${lightboxIndex + 1}`}
                className={styles.lightboxImg}
              />
            </div>
          </div>
        )}

        {/* SECTION 8: WEDDING GIFT (TANDA KASIH & AMPLOP DIGITAL) */}
        <section id="hadiah" className={styles.giftSection}>
          <h2 className={`${styles.svReveal} ${styles.sectionTitleScript}`}>
            Wedding Gift
          </h2>
          <div className={`${styles.svReveal} ${styles.sectionSubtitle}`}>
            Tanda Asih
          </div>

          <p className={`${styles.svReveal} ${styles.giftIntro}`}>
            Tanpa ngirangan rasa hormat, kagem Bapak/Ibu/Wargi sadayana anu hoyong masihan tanda asih kagem kadua mempelai, tiasa ngalangkungan rekening di handap ieu:
          </p>

          {/* ATM Card 1: BCA */}
          <div className={`${styles.svReveal} ${styles.bankAtmCard}`}>
            <div className={styles.bankHeaderRow}>
              <Image
                src="/media/sunda-vibes/decor/bca.webp"
                alt="BCA"
                width={70}
                height={26}
                className={styles.bankLogoImg}
              />
              <Image
                src="/media/sunda-vibes/decor/chip-sim.webp"
                alt="Chip SIM"
                width={36}
                height={28}
                className={styles.bankChipImg}
              />
            </div>

            <div className={styles.bankNumberLabel}>Nomor Rekening BCA</div>
            <div className={styles.bankAccountNumber}>
              {invitation.gift_info?.account_number || "7125091428"}
            </div>
            <div className={styles.bankAccountHolder}>
              a.n. {invitation.gift_info?.account_name || "Fajar Sidik"}
            </div>

            <div>
              <button
                type="button"
                className={styles.btnCopyAccount}
                onClick={() =>
                  copyToClipboard(
                    invitation.gift_info?.account_number || "7125091428",
                    "bca-1"
                  )
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Salin Nomor Rekening</span>
              </button>
              {copiedKey === "bca-1" && (
                <span className={styles.copyToast}>Kasalik!</span>
              )}
            </div>
          </div>

          {/* ATM Card 2: Rekening Pasangan (Mandiri / Alternatif) */}
          <div className={`${styles.svReveal} ${styles.bankAtmCard}`} style={{ background: "linear-gradient(135deg, #7A5436 0%, #4D3320 100%)" }}>
            <div className={styles.bankHeaderRow}>
              <div style={{ fontFamily: "var(--font-sv-sans)", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.08em" }}>
                BANK MANDIRI
              </div>
              <Image
                src="/media/sunda-vibes/decor/chip-sim.webp"
                alt="Chip SIM"
                width={36}
                height={28}
                className={styles.bankChipImg}
              />
            </div>

            <div className={styles.bankNumberLabel}>Nomor Rekening Mandiri</div>
            <div className={styles.bankAccountNumber}>1320024981120</div>
            <div className={styles.bankAccountHolder}>
              a.n. Dita Maharani Putri
            </div>

            <div>
              <button
                type="button"
                className={styles.btnCopyAccount}
                onClick={() => copyToClipboard("1320024981120", "mandiri-2")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Salin Nomor Rekening</span>
              </button>
              {copiedKey === "mandiri-2" && (
                <span className={styles.copyToast}>Kasalik!</span>
              )}
            </div>
          </div>

          {/* Physical Gift / Kirim Kado */}
          <div className={`${styles.svReveal} ${styles.dressCodeCard}`} style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
              <Image
                src="/media/sunda-vibes/decor/gift-icon.webp"
                alt="Kado Fisik"
                width={24}
                height={24}
              />
              <div className={styles.dressCodeTitle} style={{ margin: 0 }}>
                Kirim Kado Fisik
              </div>
            </div>
            <p className={styles.dressCodeDesc} style={{ marginBottom: "0.8rem" }}>
              Alamat Pangiriman: Kediaman Mempelai Wanita, Jl. Cisurupan No. 28, RT 02 / RW 05, Cisurupan, Garut / Bandung. Penerima: Dita Maharani Putri (0812-3456-7890).
            </p>
            <button
              type="button"
              className={styles.btnCopyAccount}
              style={{ background: "var(--sv-bronze)", color: "#FFFFFF" }}
              onClick={() =>
                copyToClipboard(
                  "Kediaman Mempelai Wanita, Jl. Cisurupan No. 28, RT 02 / RW 05, Cisurupan, Garut / Bandung (Penerima: Dita Maharani Putri)",
                  "alamat-kado"
                )
              }
            >
              <span>Salin Alamat Kado</span>
            </button>
            {copiedKey === "alamat-kado" && (
              <span className={styles.copyToast}>Alamat Kasalik!</span>
            )}
          </div>
        </section>

        {/* SECTION 9: RSVP & DOA UCAPAN */}
        <section id="ucapan" className={styles.wishesSection}>
          <h2 className={`${styles.svReveal} ${styles.sectionTitleScript}`}>
            Doa &amp; Ucapan
          </h2>
          <div className={`${styles.svReveal} ${styles.sectionSubtitle}`}>
            Pangesto &amp; Konfirmasi
          </div>

          <div className={`${styles.svReveal} ${styles.wishesCard}`}>
            <form onSubmit={handleSubmitRsvp}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nama Lengkap</label>
                <input
                  type="text"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Ketik nami anjeun di dieu..."
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Konfirmasi Kehadiran</label>
                <select
                  value={rsvpAttendance}
                  onChange={(e) =>
                    setRsvpAttendance(e.target.value as "attending" | "not_attending")
                  }
                  className={styles.formSelect}
                >
                  <option value="attending">Insya Allah Hadir</option>
                  <option value="not_attending">Hapunten, Teu Tiasa Hadir</option>
                </select>
              </div>

              {rsvpAttendance === "attending" && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Jumlah Tamu</label>
                  <select
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
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Doa &amp; Ucapan kagem Mempelai</label>
                <textarea
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  placeholder="Tuliskeun doa sareng harepan sae kagem kadua mempelai..."
                  className={styles.formTextarea}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={styles.btnSubmitWishes}
                id="btn-submit-rsvp"
              >
                <span>{submitting ? "Ngirimkeun..." : "Kirim Doa &amp; Konfirmasi"}</span>
              </button>

              {statusMessage && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "14px",
                    fontSize: "0.8rem",
                    backgroundColor: statusMessage.type === "success" ? "#dcfce7" : "#fee2e2",
                    color: statusMessage.type === "success" ? "#166534" : "#991b1b",
                    textAlign: "center",
                  }}
                >
                  {statusMessage.text}
                </div>
              )}
            </form>

            {/* List of Wishes */}
            <div className={styles.wishesFeed}>
              {greetings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--sv-muted)", fontSize: "0.82rem" }}>
                  Tacan aya ucapan. Janten anu munggaran ngintun doa restu!
                </div>
              ) : (
                greetings.map((item, idx) => (
                  <div key={item.id || idx} className={styles.wishItem}>
                    <div className={styles.wishHeader}>
                      <span className={styles.wishGuestName}>{item.guest_name}</span>
                      <span
                        className={`${styles.wishAttendanceBadge} ${
                          item.attendance === "attending"
                            ? styles.badgeAttending
                            : styles.badgeNotAttending
                        }`}
                      >
                        {item.attendance === "attending" ? "Hadir" : "Teu Hadir"}
                      </span>
                    </div>
                    <p className={styles.wishMessage}>{item.message}</p>
                    {item.created_at && (
                      <div className={styles.wishTime}>
                        {formatRelativeTime(item.created_at)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* SECTION 10: PENUTUP (HATUR NUHUN) */}
        <section className={styles.closingSection}>
          <Image
            src="/media/sunda-vibes/decor/siger.webp"
            alt="Siger Sunda"
            width={80}
            height={75}
            className={`${styles.svRevealScale} ${styles.closingSiger}`}
          />

          <h2 className={`${styles.svReveal} ${styles.closingTitle}`}>
            Hatur Nuhun
          </h2>

          <p className={`${styles.svReveal} ${styles.closingText}`}>
            {invitation.closing_text ||
              "Mangrupikeun hiji kahormatan sareng kabagjaan kanggo simkuring saparakanca saupami Bapak/Ibu/Saudara/i kersa sumping ngaluuhan sarta maparin doa restu ka kadua calon panganten. Hatur nuhun kana sagala perhatosan sareng kasaeanana."}
          </p>

          <div className={`${styles.svReveal} ${styles.closingCoupleSign}`}>
            {invitation.bride_short_name} &amp; {invitation.groom_short_name}
          </div>

          <div className={`${styles.svReveal} ${styles.closingFamilies}`}>
            Keluarga Besar Bpk. Bambang Wijaya &amp; Bpk. Hendra Kusuma
          </div>

          <div className={styles.watermarkBrand}>
            Made with ❤️ by {BRAND.name}
          </div>
        </section>
      </div>

      {/* ====================================================
          FLOATING CONTROLS (MUSIC & BOTTOM NAVIGATION)
          ==================================================== */}
      {opened && (
        <>
          {/* Floating Audio Play/Pause Button */}
          <button
            type="button"
            onClick={toggleMusic}
            className={`${styles.floatingAudioBtn} ${playing ? styles.spinning : ""}`}
            title={playing ? "Jeda Musik" : "Puter Musik"}
            aria-label="Puter atanapi Jeda Musik"
          >
            {playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73l4.27 4.27 1.27-1.27L4.27 3zM14 7h4V3h-6v5.18l2 2V7z" />
              </svg>
            )}
          </button>

          {/* Floating Bottom Navigation Bar */}
          <nav className={styles.floatingBottomNav} aria-label="Navigasi Undangan">
            <button
              type="button"
              onClick={() => scrollToSection("pembuka")}
              className={`${styles.navBtn} ${activeSection === "pembuka" ? styles.active : ""}`}
              title="Sampul"
            >
              🏠
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("mempelai")}
              className={`${styles.navBtn} ${activeSection === "mempelai" ? styles.active : ""}`}
              title="Mempelai"
            >
              💑
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("acara")}
              className={`${styles.navBtn} ${activeSection === "acara" ? styles.active : ""}`}
              title="Acara"
            >
              📅
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("kisah")}
              className={`${styles.navBtn} ${activeSection === "kisah" ? styles.active : ""}`}
              title="Kisah"
            >
              📖
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("galeri")}
              className={`${styles.navBtn} ${activeSection === "galeri" ? styles.active : ""}`}
              title="Galeri"
            >
              🖼️
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("hadiah")}
              className={`${styles.navBtn} ${activeSection === "hadiah" ? styles.active : ""}`}
              title="Tanda Asih"
            >
              🎁
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("ucapan")}
              className={`${styles.navBtn} ${activeSection === "ucapan" ? styles.active : ""}`}
              title="Doa & Ucapan"
            >
              💬
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
