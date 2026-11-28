"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import type { Greeting, Invitation } from "@/lib/types";
import { Reveal } from "@/components/reveal";
import {
  BlueGardenCrest,
  BlueGardenIcon,
  BlueGardenOrnateFrame,
  BlueGardenPortraitArch,
  type BlueGardenIconName,
} from "./blue-garden-v2-icons";
import styles from "./blue-garden-v2.module.css";

const HERO_CONTENT_REVEAL_SECONDS = 8.2;
const OPENING_VIDEO_PATH = "/media/blue-garden-v2/opening-web-720p.mp4";
const ASSET = "/media/blue-garden-v2/web";

const NAV_ITEMS: { id: string; label: string; icon: BlueGardenIconName }[] = [
  { id: "pembuka", label: "Sampul", icon: "home" },
  { id: "mempelai", label: "Mempelai", icon: "couple" },
  { id: "acara", label: "Acara", icon: "calendar" },
  { id: "galeri", label: "Galeri", icon: "gallery" },
  { id: "hadiah", label: "Hadiah", icon: "gift" },
  { id: "ucapan", label: "RSVP", icon: "wishes" },
];

type Props = {
  invitation: Invitation;
  greetings: Greeting[];
  guestName: string | null;
  initiallyOpened?: boolean;
  coupleNames: string;
  coverPath: string;
  bridePhotoPath: string;
  groomPhotoPath: string;
  galleryPaths: string[];
  storyImagePath: string;
  musicPath: string | null;
  calendarUrl: string;
  themeClassName: string;
  themeStyle: CSSProperties;
};

function formatLongDate(value: string) {
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
    return "Sabtu, 12 Desember 2026";
  }
}

function formatNumericDate(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    })
      .format(new Date(`${value}T12:00:00+07:00`))
      .replaceAll("/", " · ");
  } catch {
    return "12 · 12 · 2026";
  }
}

function formatGreetingTime(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function BlueGardenV2ClientApp({
  invitation,
  greetings: initialGreetings,
  guestName,
  initiallyOpened = false,
  coupleNames,
  coverPath,
  bridePhotoPath,
  groomPhotoPath,
  galleryPaths,
  storyImagePath,
  musicPath,
  calendarUrl,
  themeClassName,
  themeStyle,
}: Props) {
  const [opened, setOpened] = useState(initiallyOpened);
  const [heroRevealed, setHeroRevealed] = useState(initiallyOpened);
  const [playing, setPlaying] = useState(false);
  const [autoScrolling, setAutoScrolling] = useState(false);
  const [activeSection, setActiveSection] = useState("pembuka");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [countdown, setCountdown] = useState([0, 0, 0, 0]);

  // RSVP & Guestbook state
  const [greetings, setGreetings] = useState<Greeting[]>(initialGreetings);
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpAttendance, setRsvpAttendance] = useState<"attending" | "not_attending">("attending");
  const [rsvpGuestCount, setRsvpGuestCount] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);

  const ready = opened && heroRevealed;
  const longDate = formatLongDate(invitation.event_date);
  const numericDate = formatNumericDate(invitation.event_date);

  // Lock page scroll while cover is closed or opening video settles
  useEffect(() => {
    if (ready) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!opened) openBtnRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [opened, ready]);

  // Ensure iOS Safari recognizes inline muted video attributes on the DOM node
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
  }, []);

  // Sync couple name reveal to video timeline (~8.2s) and freeze cleanly on final frame
  useEffect(() => {
    const video = videoRef.current;
    if (!opened || !video) return;

    if (initiallyOpened) {
      const seekToFinalFrame = () => {
        if (Number.isFinite(video.duration) && video.duration > 0.1) {
          video.currentTime = Math.max(0, video.duration - 0.05);
        }
        video.pause();
        setHeroRevealed(true);
      };
      if (video.readyState >= 1) {
        seekToFinalFrame();
      } else {
        video.addEventListener("loadedmetadata", seekToFinalFrame, { once: true });
      }
      return () => {
        video.removeEventListener("loadedmetadata", seekToFinalFrame);
      };
    }

    let frameId: number | undefined;
    let fallbackTimer: number | undefined;

    const reveal = () => setHeroRevealed(true);
    const checkTime = () => {
      if (video.currentTime >= HERO_CONTENT_REVEAL_SECONDS) {
        reveal();
      }
    };
    const handleEnded = () => {
      reveal();
      video.pause();
    };
    const handleCanPlay = () => {
      if (video.paused && !video.ended) {
        video.muted = true;
        video.play().catch(() => {});
      }
    };
    const watchFrame = () => {
      checkTime();
      if (video.currentTime < HERO_CONTENT_REVEAL_SECONDS && video.requestVideoFrameCallback) {
        frameId = video.requestVideoFrameCallback(watchFrame);
      }
    };

    video.addEventListener("timeupdate", checkTime);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", reveal);
    video.addEventListener("canplay", handleCanPlay);
    watchFrame();

    // Safety fallback so slow connections never lock a guest permanently
    fallbackTimer = window.setTimeout(reveal, 11500);

    if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(reveal, 0);
    } else if (video.paused && !video.ended) {
      video.muted = true;
      video.play().catch(() => {});
    }

    return () => {
      window.clearTimeout(fallbackTimer);
      video.removeEventListener("timeupdate", checkTime);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", reveal);
      video.removeEventListener("canplay", handleCanPlay);
      if (frameId !== undefined && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(frameId);
      }
    };
  }, [opened, initiallyOpened]);

  // Countdown timer
  useEffect(() => {
    const timeMatch = (invitation.ceremony_time || "08.00").match(/(\d{1,2})[.:](\d{2})/);
    const hour = timeMatch && Number(timeMatch[1]) < 24 ? timeMatch[1].padStart(2, "0") : "08";
    const minute = timeMatch && Number(timeMatch[2]) < 60 ? timeMatch[2] : "00";
    const target = new Date(`${invitation.event_date || "2026-12-12"}T${hour}:${minute}:00+07:00`).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setCountdown([
        Math.floor(diff / 86400000),
        Math.floor(diff / 3600000) % 24,
        Math.floor(diff / 60000) % 60,
        Math.floor(diff / 1000) % 60,
      ]);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [invitation.event_date, invitation.ceremony_time]);

  // Active nav highlight
  useEffect(() => {
    if (!ready) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
    );

    NAV_ITEMS.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [ready]);

  // Escape & arrow navigation in lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      else if (event.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + galleryPaths.length) % galleryPaths.length));
      } else if (event.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % galleryPaths.length));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, galleryPaths.length]);

  // Smooth downward auto-scroll (pauses automatically on user wheel/touch or bottom of page)
  useEffect(() => {
    if (!autoScrolling || !ready) return;

    let rafId = 0;
    let lastTime = performance.now();
    let carry = 0;
    const speedPxPerSec = 44;

    const stopAutoScroll = () => setAutoScrolling(false);

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      carry += speedPxPerSec * dt;
      const wholePx = Math.floor(carry);
      if (wholePx >= 1) {
        carry -= wholePx;
        window.scrollBy(0, wholePx);
      }

      const reachedBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (reachedBottom) {
        setAutoScrolling(false);
        return;
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    window.addEventListener("wheel", stopAutoScroll, { passive: true });
    window.addEventListener("touchstart", stopAutoScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", stopAutoScroll);
      window.removeEventListener("touchstart", stopAutoScroll);
    };
  }, [autoScrolling, ready]);

  async function handleOpenInvitation() {
    if (opened) return;
    setOpened(true);
    window.scrollTo({ top: 0, behavior: "instant" });

    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      if (video.readyState >= 1) {
        try {
          video.currentTime = 0;
        } catch {
          // ignore early seek error on iOS
        }
      }
      video.play().catch(() => {
        video.addEventListener(
          "canplay",
          () => {
            video.muted = true;
            video.play().catch(() => setHeroRevealed(true));
          },
          { once: true },
        );
      });
    }

    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch {
        setPlaying(false);
      }
    }
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  }

  async function handleCopyAccount() {
    if (!invitation.gift_info?.account_number) return;
    try {
      await navigator.clipboard.writeText(invitation.gift_info.account_number);
      setCopiedAccount(true);
      window.setTimeout(() => setCopiedAccount(false), 2400);
    } catch {
      setCopiedAccount(false);
    }
  }

  async function handleRsvpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/guest-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitation.id,
          guestName: rsvpName.trim(),
          attendance: rsvpAttendance,
          guestCount: rsvpAttendance === "not_attending" ? 1 : rsvpGuestCount,
          message: rsvpMessage.trim(),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!data || typeof data.message !== "string") {
        throw new Error("Respons server belum dapat dibaca. Silakan coba lagi.");
      }
      if (!response.ok) {
        throw new Error(data.message || "Ucapan belum berhasil dikirim. Silakan coba lagi.");
      }
      if (data.greeting) {
        setGreetings((current) => [data.greeting, ...current]);
      }
      setStatusMessage({ type: "success", text: data.message });
      if (response.status !== 207) {
        setRsvpMessage("");
      }
    } catch (error) {
      setStatusMessage({
        type: "error",
        text:
          error instanceof TypeError
            ? "Koneksi terputus. Silakan coba lagi."
            : error instanceof Error
              ? error.message
              : "Ucapan belum berhasil dikirim. Silakan coba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const events = [
    { label: "Akad Nikah", time: invitation.ceremony_time },
    { label: "Resepsi Pernikahan", time: invitation.reception_time },
  ];

  const storyItems =
    invitation.story && invitation.story.length > 0
      ? invitation.story
      : [
          {
            year: "Awal Cerita",
            title: "Pertemuan Pertama",
            text: "Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita.",
          },
        ];

  return (
    <div className={`${styles.root} ${themeClassName}`} style={themeStyle}>
      {/* ─── ENCHANTED BLUE GARDEN V2 COVER DIORAMA ─── */}
      <div
        className={`${styles.cover} ${opened ? styles.coverHidden : ""}`}
        role="dialog"
        aria-modal={!opened}
        aria-label={`Undangan Pernikahan ${coupleNames}`}
        aria-hidden={opened}
        inert={opened}
      >
        <div className={styles.coverStage}>
          <Image
            src={`${ASSET}/01-sky-backdrop.webp`}
            alt=""
            fill
            sizes="460px"
            className={styles.coverSky}
            priority
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/03-hanging-wisteria-top.webp`}
            alt=""
            width={1080}
            height={610}
            className={styles.coverWisteria}
            priority
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/04-woodland-left.webp`}
            alt=""
            width={820}
            height={1100}
            className={styles.coverWoodlandLeft}
            priority
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/05-woodland-right.webp`}
            alt=""
            width={820}
            height={1100}
            className={styles.coverWoodlandRight}
            priority
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/06-garden-pavilion.webp`}
            alt=""
            width={794}
            height={1120}
            className={styles.coverPavilion}
            priority
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/10-floral-bottom-hero.webp`}
            alt=""
            width={1080}
            height={520}
            className={styles.coverFloralBottom}
            priority
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/08-bluebird-left.webp`}
            alt=""
            width={300}
            height={300}
            className={styles.coverBirdLeft}
            priority
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/09-bluebird-right.webp`}
            alt=""
            width={300}
            height={300}
            className={styles.coverBirdRight}
            priority
            aria-hidden="true"
          />

          {/* HD Baroque Scalloped Gold-Ivory Arch Frame */}
          <div className={styles.coverFrameWrap}>
            <Image
              src={`${ASSET}/14-blue-garden-arch-frame.webp`}
              alt=""
              width={900}
              height={1267}
              className={styles.coverFrameBg}
              priority
              aria-hidden="true"
            />
            <div className={styles.coverFrameInner}>
              <BlueGardenCrest compact />

              <div className={styles.coverCameoFrame}>
                <Image
                  src={coverPath}
                  alt={`Foto prewedding ${coupleNames}`}
                  fill
                  sizes="120px"
                  className={styles.coverCameoImg}
                  priority
                />
              </div>

              <p className={styles.coverKicker}>The Wedding Of</p>
              <h1 className={styles.coverNames}>
                {invitation.bride_short_name}
                <span className={styles.coverAmp}>&amp;</span>
                {invitation.groom_short_name}
              </h1>
              <p className={styles.coverDate}>{longDate}</p>

              <div className={styles.coverGuestCard}>
                <span className={styles.coverGuestLabel}>Kepada Yth. Bapak/Ibu/Saudara/i</span>
                <strong className={styles.coverGuestName}>{guestName || "Tamu Undangan"}</strong>
              </div>

              <button
                ref={openBtnRef}
                type="button"
                className={styles.openBtn}
                onClick={handleOpenInvitation}
              >
                <span>Buka Undangan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN INVITATION STAGE (430px Portrait Luxury Shell) ─── */}
      <div className={styles.stage}>
        {/* 1. CINEMATIC VIDEO OPENING HERO */}
        <section id="pembuka" className={styles.heroSection} aria-label="Pembuka Undangan">
          <div className={styles.heroBackdrop}>
            <Image
              src={`${ASSET}/15-blue-garden-frame-akhir.webp`}
              alt=""
              fill
              sizes="(max-width: 480px) 100vw, 430px"
              className={styles.heroPosterImg}
              priority
              aria-hidden="true"
            />
            <video
              ref={videoRef}
              className={styles.heroVideo}
              src={OPENING_VIDEO_PATH}
              poster={`${ASSET}/15-blue-garden-frame-akhir.webp`}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload noplaybackrate"
              aria-hidden="true"
            />
          </div>

          <div className={`${styles.heroOverlayContent} ${heroRevealed ? styles.heroOverlayVisible : ""}`}>
            <BlueGardenCrest compact />
            <p className={styles.heroKicker}>The Wedding Of</p>
            <h2 className={styles.heroCoupleNames}>
              <span>{invitation.bride_short_name}</span>
              <span className={styles.heroAmp}>&amp;</span>
              <span>{invitation.groom_short_name}</span>
            </h2>
            <span className={styles.heroGoldLine} aria-hidden="true" />
            <p className={styles.heroDateNumeric}>{numericDate}</p>
            <a href="#kutipan" className={styles.heroScrollCue}>
              <span>Gulir ke Bawah</span>
              <BlueGardenIcon name="arrowDown" size={14} />
            </a>
          </div>
        </section>

        {/* 2. QUOTE & COUNTDOWN SECTION */}
        <section id="kutipan" className={`${styles.section} ${styles.quoteSection}`}>
          <Image
            src={`${ASSET}/03-hanging-wisteria-top.webp`}
            alt=""
            width={900}
            height={500}
            className={styles.sectionTopWisteria}
            aria-hidden="true"
          />

          <Reveal>
            <div className={styles.quoteFrameAnchor}>
              <Image
                src={`${ASSET}/13-floral-side-right.webp`}
                alt=""
                width={140}
                height={200}
                className={styles.quoteCornerFloral}
                aria-hidden="true"
              />
              <BlueGardenOrnateFrame>
                <BlueGardenCrest compact />
                <p className={styles.quoteText}>&ldquo;{invitation.quote_text}&rdquo;</p>
                <p className={styles.quoteSource}>{invitation.quote_source}</p>
              </BlueGardenOrnateFrame>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className={styles.countdownBlock}>
              <span className={styles.sectionEyebrow}>Menuju Hari Bahagia</span>
              <div className={styles.countdownGrid}>
                {[
                  { label: "Hari", value: countdown[0] },
                  { label: "Jam", value: countdown[1] },
                  { label: "Menit", value: countdown[2] },
                  { label: "Detik", value: countdown[3] },
                ].map((unit) => (
                  <div key={unit.label} className={styles.countdownTile}>
                    <span className={styles.countdownNumber}>{String(unit.value).padStart(2, "0")}</span>
                    <span className={styles.countdownLabel}>{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* 3. BRIDE & GROOM SECTION (HD SCALLOPED BAROQUE PORTRAIT FRAMES) */}
        <section id="mempelai" className={`${styles.section} ${styles.coupleSection}`}>
          <Image
            src={`${ASSET}/04-woodland-left.webp`}
            alt=""
            width={520}
            height={700}
            className={styles.coupleBgLeft}
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/05-woodland-right.webp`}
            alt=""
            width={520}
            height={700}
            className={styles.coupleBgRight}
            aria-hidden="true"
          />

          <Reveal>
            <header className={styles.sectionHeader}>
              <BlueGardenCrest />
              <span className={styles.sectionEyebrow}>Assalamu&apos;alaikum Wr. Wb.</span>
              <h2 className={styles.sectionTitle}>Mempelai Berbahagia</h2>
              <p className={styles.sectionLead}>{invitation.opening_text}</p>
            </header>
          </Reveal>

          <div className={styles.coupleStack}>
            <Reveal>
              <article className={styles.personCard}>
                <BlueGardenPortraitArch
                  src={bridePhotoPath}
                  alt={invitation.bride_name}
                  floralSide="left"
                />
                <span className={styles.personRole}>Mempelai Wanita</span>
                <h3 className={styles.personName}>{invitation.bride_name}</h3>
                <p className={styles.personParents}>{invitation.bride_parents}</p>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <div className={styles.coupleDivider} aria-hidden="true">
                <span className={styles.coupleDividerLine} />
                <span className={styles.coupleDividerMedallion}>&amp;</span>
                <span className={styles.coupleDividerLine} />
              </div>
            </Reveal>

            <Reveal delay={120}>
              <article className={styles.personCard}>
                <BlueGardenPortraitArch
                  src={groomPhotoPath}
                  alt={invitation.groom_name}
                  floralSide="right"
                />
                <span className={styles.personRole}>Mempelai Pria</span>
                <h3 className={styles.personName}>{invitation.groom_name}</h3>
                <p className={styles.personParents}>{invitation.groom_parents}</p>
              </article>
            </Reveal>
          </div>
        </section>

        {/* 4. WEDDING EVENTS SECTION (STRICTLY ZERO FLOWERS ON EVENT CARDS) */}
        <section id="acara" className={`${styles.section} ${styles.eventSection}`}>
          <Image
            src={`${ASSET}/06-garden-pavilion.webp`}
            alt=""
            width={700}
            height={980}
            className={styles.eventPavilionWatermark}
            aria-hidden="true"
          />

          <Reveal>
            <header className={styles.sectionHeader}>
              <BlueGardenCrest />
              <span className={styles.sectionEyebrow}>Rangkaian Acara</span>
              <h2 className={styles.sectionTitle}>Waktu &amp; Lokasi</h2>
              <p className={styles.sectionLead}>
                Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir pada hari bahagia kami.
              </p>
            </header>
          </Reveal>

          <div className={styles.eventList}>
            {events.map((ev, idx) => (
              <Reveal key={ev.label} delay={idx * 100}>
                <BlueGardenOrnateFrame className={styles.eventCard}>
                  <span className={styles.eventBadge}>{ev.label}</span>
                  <h3 className={styles.eventDateText}>{longDate}</h3>
                  <p className={styles.eventTimeText}>{ev.time}</p>
                  <span className={styles.eventDividerRule} aria-hidden="true" />
                  <p className={styles.eventVenueName}>{invitation.venue_name}</p>
                  <p className={styles.eventVenueAddress}>{invitation.venue_address}</p>
                </BlueGardenOrnateFrame>
              </Reveal>
            ))}
          </div>

          <Reveal delay={180}>
            <div className={styles.eventActionRow}>
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryActionBtn}
              >
                <BlueGardenIcon name="calendar" size={16} />
                <span>Simpan Tanggal</span>
              </a>
              {invitation.maps_url && (
                <a
                  href={invitation.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryActionBtn}
                >
                  <BlueGardenIcon name="map" size={16} />
                  <span>Petunjuk Lokasi</span>
                </a>
              )}
            </div>
          </Reveal>
        </section>

        {/* 5. LOVE STORY SECTION */}
        <section id="kisah" className={`${styles.section} ${styles.storySection}`}>
          <Reveal>
            <header className={styles.sectionHeader}>
              <BlueGardenCrest />
              <span className={styles.sectionEyebrow}>Kisah Cinta</span>
              <h2 className={styles.sectionTitle}>Perjalanan Kami</h2>
            </header>
          </Reveal>

          <Reveal delay={80}>
            <div className={styles.storyPhotoFrame}>
              <div className={styles.storyPhotoInner}>
                <Image
                  src={storyImagePath}
                  alt={`Kisah cinta ${coupleNames}`}
                  fill
                  sizes="(max-width: 480px) 92vw, 390px"
                  className={styles.storyPhotoImg}
                />
              </div>
              <span className={styles.storyPhotoGoldRim} aria-hidden="true" />
            </div>
          </Reveal>

          <div className={styles.timelineList}>
            {storyItems.map((item, idx) => (
              <Reveal key={`${item.year}-${idx}`} delay={idx * 90}>
                <article className={styles.timelineItem}>
                  <span className={styles.timelineNode} aria-hidden="true" />
                  <div className={styles.timelineCard}>
                    <span className={styles.timelineYear}>{item.year}</span>
                    <h3 className={styles.timelineTitle}>{item.title}</h3>
                    <p className={styles.timelineText}>{item.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6. GALLERY SECTION (ORNATE GILDED PORCELAIN FRAMES + LIGHTBOX) */}
        <section id="galeri" className={`${styles.section} ${styles.gallerySection}`}>
          <Reveal>
            <header className={styles.sectionHeader}>
              <BlueGardenCrest />
              <span className={styles.sectionEyebrow}>Galeri Foto</span>
              <h2 className={styles.sectionTitle}>Momen Bahagia</h2>
            </header>
          </Reveal>

          <div className={styles.galleryGrid}>
            {galleryPaths.map((photo, index) => (
              <Reveal
                key={`${photo}-${index}`}
                delay={(index % 3) * 70}
                className={index === 0 ? styles.galleryItemWide : styles.galleryItemCell}
              >
                <button
                  type="button"
                  className={`${styles.galleryFrameBtn} ${index === 0 ? styles.galleryFrameFeatured : ""}`}
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Lihat foto galeri ${index + 1}`}
                >
                  <span className={styles.galleryImageBox}>
                    <Image
                      src={photo}
                      alt={`Momen bahagia ${coupleNames} ${index + 1}`}
                      fill
                      sizes={index === 0 ? "(max-width: 480px) 92vw, 390px" : "(max-width: 480px) 45vw, 190px"}
                      className={styles.galleryImg}
                    />
                  </span>
                  <span className={styles.galleryGoldOverlay} aria-hidden="true" />
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 7. WEDDING GIFT SECTION (STRICTLY ZERO FLOWERS ON GIFT CARD) */}
        {invitation.gift_info && (
          <section id="hadiah" className={`${styles.section} ${styles.giftSection}`}>
            <Reveal>
              <header className={styles.sectionHeader}>
                <BlueGardenCrest />
                <span className={styles.sectionEyebrow}>Tanda Kasih</span>
                <h2 className={styles.sectionTitle}>Wedding Gift</h2>
                <p className={styles.sectionLead}>
                  Doa restu Bapak/Ibu/Saudara/i merupakan karunia yang sangat berarti bagi kami. Jika berkenan
                  memberikan tanda kasih, dapat disalurkan melalui rekening berikut.
                </p>
              </header>
            </Reveal>

            <Reveal delay={100}>
              <BlueGardenOrnateFrame variant="porcelain-blue" className={styles.giftCard}>
                <div className={styles.giftTopRow}>
                  <span className={styles.giftChipIcon}>
                    <BlueGardenIcon name="chip" size={24} />
                  </span>
                  <span className={styles.giftBankName}>{invitation.gift_info.bank}</span>
                </div>
                <p className={styles.giftAccountNumber}>{invitation.gift_info.account_number}</p>
                <p className={styles.giftAccountOwner}>a.n. {invitation.gift_info.account_name}</p>
                <button
                  type="button"
                  className={styles.giftCopyBtn}
                  onClick={handleCopyAccount}
                >
                  <BlueGardenIcon name={copiedAccount ? "check" : "copy"} size={15} />
                  <span>{copiedAccount ? "Nomor Rekening Disalin" : "Salin Nomor Rekening"}</span>
                </button>
              </BlueGardenOrnateFrame>
            </Reveal>
          </section>
        )}

        {/* 8. RSVP & GUESTBOOK SECTION (STRICTLY ZERO FLOWERS ON FORM) */}
        <section id="ucapan" className={`${styles.section} ${styles.rsvpSection}`}>
          <Reveal>
            <header className={styles.sectionHeader}>
              <BlueGardenCrest />
              <span className={styles.sectionEyebrow}>Konfirmasi &amp; Doa</span>
              <h2 className={styles.sectionTitle}>RSVP &amp; Ucapan</h2>
              <p className={styles.sectionLead}>
                Konfirmasi kehadiran serta kirimkan doa dan harapan terbaik untuk kedua mempelai.
              </p>
            </header>
          </Reveal>

          <Reveal delay={90}>
            <BlueGardenOrnateFrame className={styles.rsvpCard}>
              <form className={styles.rsvpForm} onSubmit={handleRsvpSubmit}>
                <div className={styles.formField}>
                  <label htmlFor="bgv2-rsvp-name" className={styles.formLabel}>
                    Nama Tamu
                  </label>
                  <input
                    id="bgv2-rsvp-name"
                    type="text"
                    required
                    maxLength={80}
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formField}>
                  <span className={styles.formLabel}>Konfirmasi Kehadiran</span>
                  <div className={styles.attendanceGroup}>
                    <button
                      type="button"
                      className={`${styles.attendanceBtn} ${rsvpAttendance === "attending" ? styles.attendanceBtnActive : ""}`}
                      onClick={() => setRsvpAttendance("attending")}
                      aria-pressed={rsvpAttendance === "attending"}
                    >
                      Hadir
                    </button>
                    <button
                      type="button"
                      className={`${styles.attendanceBtn} ${rsvpAttendance === "not_attending" ? styles.attendanceBtnActive : ""}`}
                      onClick={() => setRsvpAttendance("not_attending")}
                      aria-pressed={rsvpAttendance === "not_attending"}
                    >
                      Berhalangan
                    </button>
                  </div>
                </div>

                {rsvpAttendance === "attending" && (
                  <div className={styles.formField}>
                    <label htmlFor="bgv2-rsvp-count" className={styles.formLabel}>
                      Jumlah Tamu
                    </label>
                    <select
                      id="bgv2-rsvp-count"
                      value={rsvpGuestCount}
                      onChange={(e) => setRsvpGuestCount(Number(e.target.value))}
                      className={styles.formSelect}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} Orang
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.formField}>
                  <label htmlFor="bgv2-rsvp-msg" className={styles.formLabel}>
                    Ucapan &amp; Doa Restu
                  </label>
                  <textarea
                    id="bgv2-rsvp-msg"
                    rows={3}
                    required
                    maxLength={500}
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..."
                    className={styles.formTextarea}
                  />
                </div>

                {statusMessage && (
                  <p
                    role="status"
                    className={
                      statusMessage.type === "success" ? styles.formSuccess : styles.formError
                    }
                  >
                    {statusMessage.text}
                  </p>
                )}

                <button type="submit" disabled={submitting} className={styles.rsvpSubmitBtn}>
                  {submitting ? "Mengirim..." : "Kirim Konfirmasi & Ucapan"}
                </button>
              </form>
            </BlueGardenOrnateFrame>
          </Reveal>

          {greetings.length > 0 && (
            <Reveal delay={140}>
              <div className={styles.wishesContainer}>
                <p className={styles.wishesCountLabel}>{greetings.length} Ucapan &amp; Doa</p>
                <div className={styles.wishesList}>
                  {greetings.map((item) => (
                    <article key={item.id} className={styles.wishItem}>
                      <div className={styles.wishHeader}>
                        <strong className={styles.wishName}>{item.guest_name}</strong>
                        <span
                          className={`${styles.wishBadge} ${
                            item.attendance === "attending" ? styles.wishBadgeYes : styles.wishBadgeNo
                          }`}
                        >
                          {item.attendance === "attending" ? "Hadir" : "Berhalangan"}
                        </span>
                      </div>
                      <p className={styles.wishBody}>{item.message}</p>
                      {item.created_at && (
                        <span className={styles.wishDate}>{formatGreetingTime(item.created_at)}</span>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </section>

        {/* 9. CLOSING & WATERCOLOR LOTUS KOI POND FOOTER */}
        <footer id="penutup" className={styles.closingSection}>
          <Image
            src={`${ASSET}/08-bluebird-left.webp`}
            alt=""
            width={220}
            height={220}
            className={styles.closingBirdLeft}
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/09-bluebird-right.webp`}
            alt=""
            width={220}
            height={220}
            className={styles.closingBirdRight}
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/07-lotus-koi-pond.webp`}
            alt=""
            width={1080}
            height={610}
            className={styles.closingKoiPond}
            aria-hidden="true"
          />
          <Image
            src={`${ASSET}/11-floral-bottom-cushion.webp`}
            alt=""
            width={1080}
            height={520}
            className={styles.closingFloralBottom}
            aria-hidden="true"
          />

          <Reveal>
            <BlueGardenOrnateFrame className={styles.closingCard}>
              <BlueGardenCrest compact />
              <p className={styles.closingText}>{invitation.closing_text}</p>
              <p className={styles.closingGreeting}>{invitation.closing_greeting}</p>
              <h2 className={styles.closingCoupleNames}>{coupleNames}</h2>
            </BlueGardenOrnateFrame>
          </Reveal>

          {/* Clean unobstructed brand signature well above the bottom floral cushion */}
          <div className={styles.brandFooter}>
            <span className={styles.brandFooterLabel}>Dibuat dengan hangat oleh</span>
            <Image
              src={BRAND.logoPath}
              alt={BRAND.name}
              width={110}
              height={40}
              className={styles.brandFooterLogo}
            />
          </div>
        </footer>
      </div>

      {/* ─── FLOATING AUTO SCROLL & MUSIC CONTROLS ─── */}
      {ready && (
        <div className={styles.floatingControlStack}>
          <button
            type="button"
            className={`${styles.floatingPillBtn} ${autoScrolling ? styles.floatingPillActive : ""}`}
            onClick={() => setAutoScrolling((prev) => !prev)}
            aria-pressed={autoScrolling}
            aria-label={autoScrolling ? "Hentikan auto scroll" : "Aktifkan auto scroll"}
          >
            <BlueGardenIcon name={autoScrolling ? "pause" : "arrowDown"} size={14} />
            <span>{autoScrolling ? "Berhenti" : "Auto Scroll"}</span>
          </button>

          {musicPath && (
            <button
              type="button"
              className={`${styles.floatingPillBtn} ${playing ? styles.floatingPillActive : ""}`}
              onClick={toggleMusic}
              aria-pressed={playing}
              aria-label={playing ? "Matikan musik latar" : "Putar musik latar"}
            >
              <BlueGardenIcon name={playing ? "music" : "muted"} size={14} />
              <span>{playing ? "Musik On" : "Musik Off"}</span>
            </button>
          )}
        </div>
      )}

      {/* ─── FLOATING BOTTOM NAVIGATION DOCK ─── */}
      {ready && (
        <nav className={styles.bottomDock} aria-label="Navigasi bagian undangan">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`${styles.dockItem} ${isActive ? styles.dockItemActive : ""}`}
                onClick={() => setAutoScrolling(false)}
              >
                <BlueGardenIcon name={item.icon} size={16} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      )}

      {/* ─── LIGHTBOX MODAL ─── */}
      {lightboxIndex !== null && galleryPaths[lightboxIndex] && (
        <div
          className={styles.lightboxBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Foto Galeri"
          onClick={() => setLightboxIndex(null)}
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setLightboxIndex(null)}
              aria-label="Tutup galeri"
            >
              <BlueGardenIcon name="close" size={20} />
            </button>
            <div className={styles.lightboxImageWrap}>
              <Image
                src={galleryPaths[lightboxIndex]}
                alt={`Foto ${lightboxIndex + 1} ${coupleNames}`}
                fill
                sizes="95vw"
                className={styles.lightboxImg}
              />
            </div>
            {galleryPaths.length > 1 && (
              <div className={styles.lightboxNavRow}>
                <button
                  type="button"
                  className={styles.lightboxNavBtn}
                  onClick={() =>
                    setLightboxIndex((lightboxIndex - 1 + galleryPaths.length) % galleryPaths.length)
                  }
                  aria-label="Foto sebelumnya"
                >
                  <BlueGardenIcon name="chevronLeft" size={18} />
                </button>
                <span className={styles.lightboxCounter}>
                  {lightboxIndex + 1} / {galleryPaths.length}
                </span>
                <button
                  type="button"
                  className={styles.lightboxNavBtn}
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % galleryPaths.length)}
                  aria-label="Foto berikutnya"
                >
                  <BlueGardenIcon name="chevronRight" size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── BACKGROUND AUDIO ─── */}
      {musicPath && (
        <audio
          ref={audioRef}
          src={musicPath}
          loop
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}
    </div>
  );
}
