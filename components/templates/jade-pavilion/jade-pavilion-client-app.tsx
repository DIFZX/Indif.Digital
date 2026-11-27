"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import type { Greeting, Invitation } from "@/lib/types";
import { Reveal } from "@/components/reveal";
import { JadePavilionIcon, type JadeIconName } from "./jade-pavilion-icons";
import styles from "./jade-pavilion.module.css";

const HERO_CONTENT_REVEAL_SECONDS = 9;
const OPENING_VIDEO_PATH = "/media/jade-pavilion/opening-web-720p.mp4";

const NAV_ITEMS: { id: string; label: string; icon: JadeIconName }[] = [
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
  profilePath: string;
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

export function JadePavilionClientApp({
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
  const stageRef = useRef<HTMLDivElement>(null);

  const ready = opened && heroRevealed;
  const longDate = formatLongDate(invitation.event_date);
  const numericDate = formatNumericDate(invitation.event_date);

  // Lock page scroll until the cover is opened and the opening video reaches second 9
  useEffect(() => {
    if (ready) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!opened) openBtnRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [opened, ready]);

  // Ensure iOS Safari recognizes inline muted attributes directly on the DOM node
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

  // Watch video playback time strictly so buffering never reveals names before second 9.
  // When the video ends, pause cleanly on the final frame so it freezes into a photo.
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
      // Keep the video parked cleanly on its final frame as a still photo
      video.pause();
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
    watchFrame();

    if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      fallbackTimer = window.setTimeout(reveal, 0);
    } else if (video.paused && !video.ended) {
      video.play().catch(reveal);
    }

    return () => {
      window.clearTimeout(fallbackTimer);
      video.removeEventListener("timeupdate", checkTime);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", reveal);
      if (frameId !== undefined && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(frameId);
      }
    };
  }, [opened, initiallyOpened]);

  // Live countdown timer
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

  // Active section highlight for floating dock
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

  // Escape key closes lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex]);

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
          // ignore seek error before buffer ready on iOS
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

  return (
    <div className={`${styles.root} ${themeClassName}`} style={themeStyle}>
      {/* ─── OPENING COVER DIALOG ─── */}
      <div
        className={`${styles.cover} ${opened ? styles.coverHidden : ""}`}
        role="dialog"
        aria-modal={!opened}
        aria-label={`Undangan Pernikahan ${coupleNames}`}
        aria-hidden={opened}
        inert={opened}
      >
        <Image
          src="/media/jade-pavilion/floral-left.webp"
          alt=""
          width={571}
          height={1024}
          className={styles.coverGarlandLeft}
          priority
          aria-hidden="true"
        />
        <Image
          src="/media/jade-pavilion/floral-right.webp"
          alt=""
          width={571}
          height={1024}
          className={styles.coverGarlandRight}
          priority
          aria-hidden="true"
        />
        <Image
          src="/media/jade-pavilion/floral-bottom.webp"
          alt=""
          width={1024}
          height={571}
          className={styles.coverBottomFloral}
          priority
          aria-hidden="true"
        />

        <div className={styles.coverCard}>
          <Image
            src="/media/jade-pavilion/gazebo.webp"
            alt=""
            width={764}
            height={1024}
            className={styles.coverGazebo}
            priority
            aria-hidden="true"
          />
          <p className={styles.coverKicker}>The Wedding Of</p>
          <h1 className={styles.coverNames}>
            {invitation.bride_short_name}
            <span className={styles.coverAmp}>&amp;</span>
            {invitation.groom_short_name}
          </h1>
          <p className={styles.coverDate}>{longDate}</p>

          <div className={styles.guestBox}>
            <span className={styles.guestLabel}>Kepada Yth. Bapak/Ibu/Saudara/i</span>
            <strong className={styles.guestName}>{guestName || "Tamu Undangan"}</strong>
          </div>

          <button
            ref={openBtnRef}
            type="button"
            className={styles.openButton}
            onClick={handleOpenInvitation}
          >
            <span>Buka Undangan</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* ─── BACKGROUND AUDIO ─── */}
      {musicPath && (
        <audio
          ref={audioRef}
          src={musicPath}
          loop
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setPlaying(false)}
        />
      )}

      {/* ─── MAIN INVITATION STAGE ─── */}
      <div
        ref={stageRef}
        className={styles.stage}
        tabIndex={-1}
        aria-hidden={!opened}
      >
        <div className={styles.layout}>
          {/* Desktop Sticky Photo Showcase */}
          <aside className={styles.desktopShowcase} aria-label={`Foto ${coupleNames}`}>
            <Image
              src={coverPath}
              alt={`Pernikahan ${coupleNames}`}
              fill
              priority
              sizes="(min-width: 901px) 62vw, 1px"
              className={styles.showcasePhoto}
            />
            <div className={styles.showcaseShade} />
            <div className={styles.showcaseContent}>
              <p className={styles.showcaseKicker}>The Wedding Of</p>
              <h2 className={styles.showcaseTitle}>{coupleNames}</h2>
              <p className={styles.showcaseDate}>{longDate}</p>
            </div>
            <small className={styles.showcaseBrand}>{BRAND.name} · Jade Pavilion</small>
          </aside>

          {/* Mobile / Right Invitation Column */}
          <main className={styles.panel}>
            {/* 1. OPENING VIDEO HERO (Names reveal at second 9, freezes on final frame) */}
            <section className={styles.hero} id="pembuka">
              <video
                ref={videoRef}
                className={styles.heroVideo}
                src={OPENING_VIDEO_PATH}
                poster="/media/jade-pavilion/bg-willow.webp"
                muted
                playsInline
                preload="auto"
                tabIndex={-1}
                aria-hidden="true"
              />
              <div
                className={`${styles.heroScrim} ${heroRevealed ? styles.heroScrimVisible : ""}`}
                aria-hidden="true"
              />
              <div
                className={`${styles.heroOverlay} ${heroRevealed ? styles.heroOverlayVisible : ""}`}
                aria-hidden={!heroRevealed}
              >
                <p className={styles.heroKicker}>The Wedding Of</p>
                <h2 className={styles.heroTitle}>
                  <span>{invitation.bride_short_name}</span>
                  <span className={styles.heroAmp}>&amp;</span>
                  <span>{invitation.groom_short_name}</span>
                </h2>
                <div className={styles.heroDivider} aria-hidden="true" />
                <p className={styles.heroDate}>{numericDate}</p>
                <a className={styles.scrollCue} href="#kutipan">
                  <span>Gulir ke bawah</span>
                  <JadePavilionIcon name="arrowDown" size={16} />
                </a>
              </div>
            </section>

            {/* 2. QUOTE & WATERCOLOR PEACOCK SIGNATURE */}
            {invitation.quote_text && (
              <section className={`${styles.section} ${styles.quoteSection}`} id="kutipan">
                <Reveal>
                  <div className={styles.quoteCard}>
                    <Image
                      src="/media/jade-pavilion/floral-corner.webp"
                      alt=""
                      width={370}
                      height={285}
                      className={styles.quoteFloralAccent}
                      aria-hidden="true"
                    />
                    <p className={styles.eyebrow}>With Love</p>
                    <blockquote style={{ margin: 0 }}>
                      <p className={styles.quoteText}>“{invitation.quote_text}”</p>
                      {invitation.quote_source && (
                        <cite className={styles.quoteSource}>{invitation.quote_source}</cite>
                      )}
                    </blockquote>
                  </div>

                  <div className={styles.peacockShowcase}>
                    <Image
                      src="/media/jade-pavilion/peacock.webp"
                      alt=""
                      width={764}
                      height={1024}
                      className={styles.peacockImage}
                      aria-hidden="true"
                    />
                  </div>
                </Reveal>
              </section>
            )}

            {/* 3. BRIDE & GROOM (ARCH PORTRAITS WITH CLEAN CORNER FLORAL) */}
            <section className={`${styles.section} ${styles.sectionWash}`} id="mempelai">
              <Reveal>
                <div className={styles.sectionOrnament} aria-hidden="true">
                  <span className={styles.sectionOrnamentLine} />
                  <span className={styles.sectionOrnamentDot} />
                  <span className={styles.sectionOrnamentLine} />
                </div>
                <p className={styles.eyebrow}>Assalamualaikum Wr. Wb.</p>
                <h2 className={styles.heading}>Mempelai</h2>
                <p className={styles.lead}>{invitation.opening_text}</p>
              </Reveal>

              <div className={styles.coupleList}>
                <Reveal direction="right">
                  <article className={styles.personCard}>
                    <div className={styles.archFrameWrap}>
                      <div className={styles.archFrame}>
                        <Image
                          src={bridePhotoPath}
                          alt={invitation.bride_name}
                          fill
                          sizes="224px"
                          className={styles.archPhoto}
                        />
                      </div>
                      <Image
                        src="/media/jade-pavilion/floral-corner.webp"
                        alt=""
                        width={64}
                        height={82}
                        className={styles.archFloral}
                        aria-hidden="true"
                      />
                    </div>
                    <p className={styles.personRole}>The Bride</p>
                    <h3 className={styles.personName}>{invitation.bride_name}</h3>
                    <p className={styles.personParents}>{invitation.bride_parents}</p>
                  </article>
                </Reveal>

                <span className={styles.coupleAmpDivider} aria-hidden="true">
                  &amp;
                </span>

                <Reveal direction="left">
                  <article className={styles.personCard}>
                    <div className={styles.archFrameWrap}>
                      <div className={styles.archFrame}>
                        <Image
                          src={groomPhotoPath}
                          alt={invitation.groom_name}
                          fill
                          sizes="224px"
                          className={styles.archPhoto}
                        />
                      </div>
                      <Image
                        src="/media/jade-pavilion/floral-corner.webp"
                        alt=""
                        width={64}
                        height={82}
                        className={styles.archFloral}
                        aria-hidden="true"
                      />
                    </div>
                    <p className={styles.personRole}>The Groom</p>
                    <h3 className={styles.personName}>{invitation.groom_name}</h3>
                    <p className={styles.personParents}>{invitation.groom_parents}</p>
                  </article>
                </Reveal>
              </div>
            </section>

            {/* 4. WEDDING EVENT (GAZEBO HEADER + CLEAN EVENT CARDS WITHOUT FLOWERS) */}
            <section className={styles.section} id="acara">
              <Reveal>
                <div className={styles.gazeboHeaderWrap}>
                  <Image
                    src="/media/jade-pavilion/gazebo.webp"
                    alt=""
                    width={764}
                    height={1024}
                    className={styles.gazeboHeaderImg}
                    aria-hidden="true"
                  />
                </div>
                <p className={styles.eyebrow}>Save The Date</p>
                <h2 className={styles.heading}>Rangkaian Acara</h2>
                <p className={styles.lead}>{longDate}</p>

                <div className={styles.countdownGrid} aria-label="Hitung mundur hari pernikahan">
                  {["Hari", "Jam", "Menit", "Detik"].map((label, index) => (
                    <div key={label} className={styles.countdownBox}>
                      <strong className={styles.countdownValue}>
                        {String(countdown[index]).padStart(2, "0")}
                      </strong>
                      <span className={styles.countdownLabel}>{label}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionButtonOutline}
                >
                  <JadePavilionIcon name="calendar" size={16} />
                  <span>Simpan ke Google Calendar</span>
                </a>
              </Reveal>

              <div className={styles.eventGrid}>
                {events.map((evt) => (
                  <Reveal key={evt.label}>
                    <article className={styles.eventCard}>
                      <h3 className={styles.eventTitle}>{evt.label}</h3>
                      <span className={styles.eventDateBadge}>{longDate}</span>
                      <p className={styles.eventTime}>Pukul {evt.time}</p>
                      <div className={styles.eventDivider} aria-hidden="true" />
                      <p className={styles.venueName}>{invitation.venue_name}</p>
                      <p className={styles.venueAddress}>{invitation.venue_address}</p>
                      {invitation.maps_url && (
                        <a
                          href={invitation.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.actionButton}
                        >
                          <JadePavilionIcon name="map" size={16} />
                          <span>Buka Google Maps</span>
                        </a>
                      )}
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* 5. LOVE STORY TIMELINE */}
            {invitation.story.length > 0 && (
              <section className={`${styles.section} ${styles.sectionWash}`} id="kisah">
                <Reveal>
                  <div className={styles.sectionOrnament} aria-hidden="true">
                    <span className={styles.sectionOrnamentLine} />
                    <span className={styles.sectionOrnamentDot} />
                    <span className={styles.sectionOrnamentLine} />
                  </div>
                  <p className={styles.eyebrow}>Love Story</p>
                  <h2 className={styles.heading}>Kisah Perjalanan Kami</h2>
                </Reveal>

                {storyImagePath && (
                  <Reveal direction="scale">
                    <div className={styles.storyPhotoFrame}>
                      <Image
                        src={storyImagePath}
                        alt={`Kisah cinta ${coupleNames}`}
                        fill
                        sizes="(max-width: 900px) 92vw, 370px"
                        className={styles.galleryImg}
                      />
                    </div>
                  </Reveal>
                )}

                <div className={styles.timeline}>
                  {invitation.story.map((item) => (
                    <Reveal key={`${item.year}-${item.title}`}>
                      <article className={styles.timelineItem}>
                        <span className={styles.timelineYear}>{item.year}</span>
                        <h3 className={styles.timelineTitle}>{item.title}</h3>
                        <p className={styles.timelineText}>{item.text}</p>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {/* 6. PHOTO GALLERY */}
            {galleryPaths.length > 0 && (
              <section className={styles.section} id="galeri">
                <Reveal>
                  <div className={styles.sectionOrnament} aria-hidden="true">
                    <span className={styles.sectionOrnamentLine} />
                    <span className={styles.sectionOrnamentDot} />
                    <span className={styles.sectionOrnamentLine} />
                  </div>
                  <p className={styles.eyebrow}>Our Moments</p>
                  <h2 className={styles.heading}>Galeri Foto</h2>
                  <p className={styles.lead}>
                    Kumpulan momen hangat yang menjadi bagian dari perjalanan menuju hari bahagia kami.
                  </p>
                </Reveal>

                <div className={styles.galleryGrid}>
                  {galleryPaths.map((src, idx) => (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      className={`${styles.galleryBtn} ${idx === 0 ? styles.galleryBtnFeatured : ""}`}
                      onClick={() => setLightboxIndex(idx)}
                      aria-label={`Lihat foto galeri ${idx + 1}`}
                    >
                      <Image
                        src={src}
                        alt={`Momen ${coupleNames} ${idx + 1}`}
                        fill
                        sizes={idx === 0 ? "(max-width: 900px) 92vw, 430px" : "(max-width: 900px) 45vw, 210px"}
                        className={styles.galleryImg}
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 7. WEDDING GIFT (CLEAN CARD — ZERO FLOWERS) */}
            {invitation.gift_info?.account_number && (
              <section className={`${styles.section} ${styles.sectionWash}`} id="hadiah">
                <Reveal>
                  <div className={styles.sectionOrnament} aria-hidden="true">
                    <span className={styles.sectionOrnamentLine} />
                    <span className={styles.sectionOrnamentDot} />
                    <span className={styles.sectionOrnamentLine} />
                  </div>
                  <p className={styles.eyebrow}>Wedding Gift</p>
                  <h2 className={styles.heading}>Amplop Digital</h2>
                  <p className={styles.lead}>
                    Doa restu Bapak/Ibu/Saudara/i merupakan karunia terindah bagi kami. Apabila berkenan memberikan tanda kasih, dapat disampaikan melalui rekening berikut:
                  </p>

                  <div className={styles.giftCard}>
                    <div className={styles.giftHeader}>
                      <span className={styles.giftBank}>{invitation.gift_info.bank || "Bank"}</span>
                      <span className={styles.giftBadge}>Transfer Bank</span>
                    </div>
                    <strong className={styles.giftAccountNumber}>
                      {invitation.gift_info.account_number}
                    </strong>
                    {invitation.gift_info.account_name && (
                      <p className={styles.giftAccountName}>
                        a.n. {invitation.gift_info.account_name}
                      </p>
                    )}
                    <button
                      type="button"
                      className={styles.giftCopyButton}
                      onClick={handleCopyAccount}
                    >
                      <JadePavilionIcon name={copiedAccount ? "check" : "copy"} size={16} />
                      <span>{copiedAccount ? "Nomor Rekening Tersalin" : "Salin Nomor Rekening"}</span>
                    </button>
                  </div>
                </Reveal>
              </section>
            )}

            {/* 8. RSVP & GUESTBOOK (CLEAN FORM — ZERO FLOWERS, WIRED TO /api/guest-response) */}
            <section className={styles.section} id="ucapan">
              <Reveal>
                <div className={styles.sectionOrnament} aria-hidden="true">
                  <span className={styles.sectionOrnamentLine} />
                  <span className={styles.sectionOrnamentDot} />
                  <span className={styles.sectionOrnamentLine} />
                </div>
                <p className={styles.eyebrow}>Wishes &amp; RSVP</p>
                <h2 className={styles.heading}>Konfirmasi Kehadiran &amp; Doa</h2>
                <p className={styles.lead}>
                  Konfirmasikan kehadiran serta kirimkan doa terbaik untuk perjalanan baru kami.
                </p>
              </Reveal>

              <form onSubmit={handleRsvpSubmit} className={styles.rsvpForm}>
                <label className={styles.fieldLabel} htmlFor="jade-guest-name">
                  Nama Lengkap
                  <input
                    id="jade-guest-name"
                    name="guestName"
                    type="text"
                    className={styles.input}
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                    placeholder="Masukkan nama Anda"
                  />
                </label>

                <label className={styles.fieldLabel} htmlFor="jade-attendance">
                  Konfirmasi Kehadiran
                  <select
                    id="jade-attendance"
                    name="attendance"
                    className={styles.select}
                    value={rsvpAttendance}
                    onChange={(e) =>
                      setRsvpAttendance(e.target.value as "attending" | "not_attending")
                    }
                    required
                  >
                    <option value="attending">InsyaAllah Hadir</option>
                    <option value="not_attending">Maaf, Belum Bisa Hadir</option>
                  </select>
                </label>

                <label className={styles.fieldLabel} htmlFor="jade-guest-count">
                  Jumlah Tamu
                  <input
                    id="jade-guest-count"
                    name="guestCount"
                    type="number"
                    className={styles.input}
                    min={1}
                    max={10}
                    value={rsvpGuestCount}
                    onChange={(e) => setRsvpGuestCount(Number(e.target.value) || 1)}
                    disabled={rsvpAttendance === "not_attending"}
                    required
                  />
                </label>

                <label className={styles.fieldLabel} htmlFor="jade-message">
                  Ucapan &amp; Doa Restu
                  <textarea
                    id="jade-message"
                    name="message"
                    className={styles.textarea}
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    maxLength={500}
                    placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..."
                  />
                </label>

                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? "Mengirim..." : "Kirim Ucapan & RSVP"}
                </button>

                {statusMessage && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`${styles.formStatus} ${
                      statusMessage.type === "error"
                        ? styles.formStatusError
                        : styles.formStatusSuccess
                    }`}
                  >
                    {statusMessage.text}
                  </p>
                )}
              </form>

              <div className={styles.greetingsList} aria-label="Daftar ucapan tamu">
                <p className={styles.greetingsCount}>{greetings.length} Ucapan &amp; Doa</p>
                {greetings.length === 0 && (
                  <p className={styles.lead} style={{ margin: 0 }}>
                    Jadilah yang pertama memberikan ucapan dan doa restu.
                  </p>
                )}
                {greetings.map((item) => (
                  <article key={item.id} className={styles.greetingCard}>
                    <div className={styles.greetingTop}>
                      <strong className={styles.greetingAuthor}>{item.guest_name}</strong>
                      {item.attendance && (
                        <span
                          className={`${styles.attendanceBadge} ${
                            item.attendance !== "attending" ? styles.attendanceBadgeAbsent : ""
                          }`}
                        >
                          {item.attendance === "attending" ? "Hadir" : "Berhalangan"}
                        </span>
                      )}
                    </div>
                    <p className={styles.greetingMessage}>{item.message}</p>
                    <time className={styles.greetingDate} dateTime={item.created_at}>
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "Asia/Jakarta",
                      }).format(new Date(item.created_at))}
                    </time>
                  </article>
                ))}
              </div>
            </section>

            {/* 9. CLOSING FOOTER WITH WATERCOLOR BOTTOM FLORAL */}
            <footer className={styles.footer} id="penutup">
              <div className={styles.footerInner}>
                <Reveal>
                  <p className={styles.footerClosingText}>{invitation.closing_text}</p>
                  {invitation.closing_greeting && (
                    <p className={styles.footerGreeting}>{invitation.closing_greeting}</p>
                  )}
                  <div className={styles.footerMonogram} aria-hidden="true">
                    {invitation.bride_short_name.charAt(0)} &amp; {invitation.groom_short_name.charAt(0)}
                  </div>
                  <h2 className={styles.footerCouple}>{coupleNames}</h2>
                  <div className={styles.footerBrand}>
                    <span>Digital Invitation by</span>
                    <Image
                      src={BRAND.logoPath}
                      alt={BRAND.name}
                      width={220}
                      height={80}
                      className={styles.footerBrandImg}
                    />
                  </div>
                </Reveal>
              </div>

              <Image
                src="/media/jade-pavilion/floral-bottom.webp"
                alt=""
                width={1024}
                height={571}
                className={styles.footerBottomFloral}
                aria-hidden="true"
              />
            </footer>
          </main>
        </div>
      </div>

      {/* ─── FLOATING MUSIC & BOTTOM NAVIGATION DOCK ─── */}
      {ready && (
        <>
          {musicPath && (
            <button
              type="button"
              className={styles.musicToggle}
              onClick={toggleMusic}
              aria-label={playing ? "Matikan musik" : "Putar musik"}
              aria-pressed={playing}
            >
              <JadePavilionIcon name={playing ? "music" : "muted"} size={15} />
              <span>Musik {playing ? "On" : "Off"}</span>
            </button>
          )}

          <nav className={styles.bottomNav} aria-label="Navigasi undangan">
            {NAV_ITEMS.map(({ id, label, icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`${styles.navItem} ${activeSection === id ? styles.navItemActive : ""}`}
                aria-current={activeSection === id ? "location" : undefined}
              >
                <JadePavilionIcon name={icon} size={17} />
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </>
      )}

      {/* ─── GALLERY LIGHTBOX ─── */}
      {lightboxIndex !== null && galleryPaths[lightboxIndex] && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto galeri"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            aria-label="Tutup pratinjau foto"
          >
            <JadePavilionIcon name="close" size={20} />
          </button>
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <Image
              src={galleryPaths[lightboxIndex]}
              alt={`Momen ${coupleNames} ${lightboxIndex + 1}`}
              fill
              sizes="94vw"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
