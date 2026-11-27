"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import type { Greeting, Invitation } from "@/lib/types";
import { Reveal } from "@/components/reveal";
import { MinangCrest, MinangGoldCard, MinangIcon, type MinangIconName } from "./majestic-minang-icons";
import styles from "./majestic-minang.module.css";

const HERO_CONTENT_REVEAL_SECONDS = 9.5;
const OPENING_VIDEO_PATH = "/media/majestic-minang/opening-web-720p.mp4";
const ASSET = "/media/majestic-minang/web";

const NAV_ITEMS: { id: string; label: string; icon: MinangIconName }[] = [
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

export function MajesticMinangClientApp({
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
  const stageRef = useRef<HTMLDivElement>(null);

  const ready = opened && heroRevealed;
  const longDate = formatLongDate(invitation.event_date);
  const numericDate = formatNumericDate(invitation.event_date);

  // Lock page scroll while cover is closed or opening video plays before frame settles
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

  // Sync couple name reveal to video timeline (9.5s) and freeze cleanly on final frame when ended
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

    // Safety fallback so a slow network never traps the guest permanently
    fallbackTimer = window.setTimeout(reveal, 13000);

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

  // Escape closes lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex]);

  // Smooth downward auto-scroll (stops automatically on manual scroll, touch, or bottom of page)
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
      {/* ─── ROYAL MINANGKABAU COVER DIORAMA ─── */}
      <div
        className={`${styles.cover} ${opened ? styles.coverHidden : ""}`}
        role="dialog"
        aria-modal={!opened}
        aria-label={`Undangan Pernikahan ${coupleNames}`}
        aria-hidden={opened}
        inert={opened}
      >
        <Image src={`${ASSET}/02-opening-curtain.webp`} alt="" width={768} height={1376} className={styles.coverCurtain} priority aria-hidden="true" />
        <Image src={`${ASSET}/03-woodland-left.webp`} alt="" width={896} height={1200} className={styles.coverWoodlandLeft} priority aria-hidden="true" />
        <Image src={`${ASSET}/04-woodland-right.webp`} alt="" width={896} height={1200} className={styles.coverWoodlandRight} priority aria-hidden="true" />
        <Image src={`${ASSET}/10-payung-left.webp`} alt="" width={710} height={941} className={styles.coverPayungLeft} priority aria-hidden="true" />
        <Image src={`${ASSET}/11-payung-right.webp`} alt="" width={735} height={952} className={styles.coverPayungRight} priority aria-hidden="true" />
        <Image src={`${ASSET}/06-rumah-gadang.webp`} alt="" width={1137} height={643} className={styles.coverRumahGadang} priority aria-hidden="true" />
        <Image src={`${ASSET}/12-floral-bottom-hero.webp`} alt="" width={1376} height={644} className={styles.coverFloralBottom} priority aria-hidden="true" />

        {/* Authentic Ornate Maroon & Gold Frame (warnabingkai.webp) */}
        <div className={styles.coverFrameWrap}>
          <Image
            src={`${ASSET}/warnabingkai.webp`}
            alt=""
            width={1020}
            height={1400}
            className={styles.coverFrameBg}
            priority
            aria-hidden="true"
          />
          <div className={styles.coverFrameInner}>
            <MinangCrest light />
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

      {/* ─── MAIN STAGE ─── */}
      <div ref={stageRef} className={styles.stage} tabIndex={-1} aria-hidden={!opened}>
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
            <small className={styles.showcaseBrand}>{BRAND.name} · Majestic Minang</small>
          </aside>

          {/* Mobile / Right Invitation Panel */}
          <main className={styles.panel}>
            {/* 1. OPENING VIDEO HERO (Names emerge inside video gold frame at 9.5s & freeze at end) */}
            <section className={styles.hero} id="pembuka">
              <video
                ref={videoRef}
                className={styles.heroVideo}
                src={OPENING_VIDEO_PATH}
                poster={`${ASSET}/01-sky-backdrop.webp`}
                muted
                playsInline
                preload="auto"
                tabIndex={-1}
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
                  <MinangIcon name="arrowDown" size={16} />
                </a>
              </div>
            </section>

            {/* 2. QUOTE & RUMAH GADANG COURTYARD (MAROON SONGKET TAPESTRY) */}
            {invitation.quote_text && (
              <section className={`${styles.section} ${styles.sectionMaroon}`} id="kutipan">
                <Image src={`${ASSET}/02-opening-curtain.webp`} alt="" width={768} height={1376} className={styles.bgCurtainTop} aria-hidden="true" />
                <Image src={`${ASSET}/14-floral-side-left.webp`} alt="" width={582} height={1342} className={styles.bgSideLeft} aria-hidden="true" />
                <Image src={`${ASSET}/15-floral-side-right.webp`} alt="" width={582} height={1342} className={styles.bgSideRight} aria-hidden="true" />
                <Image src={`${ASSET}/07-garden-lawn.webp`} alt="" width={1376} height={768} className={styles.bgLawnBottom} aria-hidden="true" />

                <div className={styles.sectionContent}>
                  <Reveal>
                    <MinangGoldCard>
                      <MinangCrest light />
                      <p className={styles.eyebrowLight}>With Love &amp; Blessings</p>
                      <blockquote style={{ margin: 0 }}>
                        <p className={styles.quoteText}>“{invitation.quote_text}”</p>
                        {invitation.quote_source && (
                          <cite className={styles.quoteSource}>{invitation.quote_source}</cite>
                        )}
                      </blockquote>
                    </MinangGoldCard>

                    <div className={styles.courtyardScene} aria-hidden="true">
                      <Image src={`${ASSET}/10-payung-left.webp`} alt="" width={710} height={941} className={styles.courtyardPayungLeft} />
                      <Image src={`${ASSET}/11-payung-right.webp`} alt="" width={735} height={952} className={styles.courtyardPayungRight} />
                      <Image src={`${ASSET}/06-rumah-gadang.webp`} alt="" width={1137} height={643} className={styles.courtyardRumah} />
                    </div>
                  </Reveal>
                </div>
              </section>
            )}

            {/* 3. MEMPELAI WITH CARVED ORNATE GOLD PORTRAIT FRAMES (CREAM SONGKET + WOODLAND + PALMS) */}
            <section className={`${styles.section} ${styles.sectionCream}`} id="mempelai">
              <Image src={`${ASSET}/03-woodland-left.webp`} alt="" width={896} height={1200} className={styles.bgWoodlandLeft} aria-hidden="true" />
              <Image src={`${ASSET}/04-woodland-right.webp`} alt="" width={896} height={1200} className={styles.bgWoodlandRight} aria-hidden="true" />
              <Image src={`${ASSET}/05-golden-tree.webp`} alt="" width={888} height={935} className={styles.bgGoldenTree} aria-hidden="true" />
              <Image src={`${ASSET}/08-palm-left.webp`} alt="" width={739} height={1079} className={styles.bgPalmLeft} aria-hidden="true" />
              <Image src={`${ASSET}/09-palm-right.webp`} alt="" width={761} height={1130} className={styles.bgPalmRight} aria-hidden="true" />

              <div className={styles.sectionContent}>
                <Reveal>
                  <MinangGoldCard className={styles.coupleIntroCard}>
                    <MinangCrest light />
                    <p className={styles.eyebrowLight}>Assalamualaikum Wr. Wb.</p>
                    <h2 className={styles.headingLight}>Mempelai</h2>
                    <p className={styles.leadLight} style={{ marginBottom: 0 }}>
                      {invitation.opening_text}
                    </p>
                  </MinangGoldCard>
                </Reveal>

                <div className={styles.coupleList}>
                  {/* Bride */}
                  <Reveal direction="right">
                    <article className={styles.personBlock}>
                      <div className={styles.goldPortraitBox}>
                        <div className={styles.goldPortraitPhotoClip}>
                          <Image
                            src={bridePhotoPath}
                            alt={invitation.bride_name}
                            fill
                            sizes="240px"
                            className={styles.goldPortraitPhoto}
                          />
                        </div>
                        <Image
                          src={`${ASSET}/portrait-gold-frame.webp`}
                          alt=""
                          width={1020}
                          height={1400}
                          className={styles.goldPortraitOverlay}
                          aria-hidden="true"
                        />
                      </div>
                      <MinangGoldCard className={styles.personPlaque}>
                        <p className={styles.personRole}>The Bride</p>
                        <h3 className={styles.personName}>{invitation.bride_name}</h3>
                        <p className={styles.personParents}>{invitation.bride_parents}</p>
                      </MinangGoldCard>
                    </article>
                  </Reveal>

                  <span className={styles.coupleAmpDivider} aria-hidden="true">
                    &amp;
                  </span>

                  {/* Groom */}
                  <Reveal direction="left">
                    <article className={styles.personBlock}>
                      <div className={styles.goldPortraitBox}>
                        <div className={styles.goldPortraitPhotoClip}>
                          <Image
                            src={groomPhotoPath}
                            alt={invitation.groom_name}
                            fill
                            sizes="240px"
                            className={styles.goldPortraitPhoto}
                          />
                        </div>
                        <Image
                          src={`${ASSET}/portrait-gold-frame.webp`}
                          alt=""
                          width={1020}
                          height={1400}
                          className={styles.goldPortraitOverlay}
                          aria-hidden="true"
                        />
                      </div>
                      <MinangGoldCard className={styles.personPlaque}>
                        <p className={styles.personRole}>The Groom</p>
                        <h3 className={styles.personName}>{invitation.groom_name}</h3>
                        <p className={styles.personParents}>{invitation.groom_parents}</p>
                      </MinangGoldCard>
                    </article>
                  </Reveal>
                </div>
              </div>
            </section>

            {/* 4. RANGKAIAN ACARA (ROYAL MAROON SONGKET + CLEAN MAROON-GOLD EVENT CARDS) */}
            <section className={`${styles.section} ${styles.sectionMaroon}`} id="acara">
              <Image src={`${ASSET}/05-golden-tree.webp`} alt="" width={888} height={935} className={styles.bgGoldenTree} aria-hidden="true" />
              <Image src={`${ASSET}/14-floral-side-left.webp`} alt="" width={582} height={1342} className={styles.bgSideLeft} aria-hidden="true" />
              <Image src={`${ASSET}/15-floral-side-right.webp`} alt="" width={582} height={1342} className={styles.bgSideRight} aria-hidden="true" />

              <div className={styles.sectionContent}>
                <Reveal>
                  <div className={styles.eventHeroBanner}>
                    <Image
                      src={`${ASSET}/06-rumah-gadang.webp`}
                      alt=""
                      width={1137}
                      height={643}
                      className={styles.eventRumahImg}
                      aria-hidden="true"
                    />
                  </div>
                  <MinangCrest light />
                  <p className={styles.eyebrowLight}>Save The Date</p>
                  <h2 className={styles.headingLight}>Rangkaian Acara</h2>
                  <p className={styles.leadLight}>{longDate}</p>

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
                    className={styles.goldButtonOutline}
                  >
                    <MinangIcon name="calendar" size={16} />
                    <span>Simpan ke Google Calendar</span>
                  </a>
                </Reveal>

                <div className={styles.eventGrid}>
                  {events.map((evt) => (
                    <Reveal key={evt.label}>
                      <MinangGoldCard>
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
                            className={styles.goldButton}
                          >
                            <MinangIcon name="map" size={16} />
                            <span>Buka Google Maps</span>
                          </a>
                        )}
                      </MinangGoldCard>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. KISAH PERJALANAN KAMI (CREAM SONGKET + 4:5 GOLD-FRAMED PORTRAIT + MAROON-GOLD TIMELINE) */}
            {invitation.story.length > 0 && (
              <section className={`${styles.section} ${styles.sectionCream}`} id="kisah">
                <Image src={`${ASSET}/03-woodland-left.webp`} alt="" width={896} height={1200} className={styles.bgWoodlandLeft} aria-hidden="true" />
                <Image src={`${ASSET}/04-woodland-right.webp`} alt="" width={896} height={1200} className={styles.bgWoodlandRight} aria-hidden="true" />
                <Image src={`${ASSET}/07-garden-lawn.webp`} alt="" width={1376} height={768} className={styles.bgLawnBottom} aria-hidden="true" />

                <div className={styles.sectionContent}>
                  <Reveal>
                    <MinangCrest />
                    <p className={styles.eyebrowDark}>Love Story</p>
                    <h2 className={styles.headingDark}>Kisah Perjalanan Kami</h2>
                  </Reveal>

                  {storyImagePath && (
                    <Reveal direction="scale">
                      <div className={styles.storyPhotoFrame}>
                        <Image
                          src={storyImagePath}
                          alt={`Kisah cinta ${coupleNames}`}
                          fill
                          sizes="(max-width: 900px) 84vw, 310px"
                          className={styles.galleryImg}
                        />
                      </div>
                    </Reveal>
                  )}

                  <div className={styles.timeline}>
                    {invitation.story.map((item) => (
                      <Reveal key={`${item.year}-${item.title}`}>
                        <MinangGoldCard className={styles.timelineCard}>
                          <span className={styles.timelineYear}>{item.year}</span>
                          <h3 className={styles.timelineTitle}>{item.title}</h3>
                          <p className={styles.timelineText}>{item.text}</p>
                        </MinangGoldCard>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 6. GALERI FOTO (MAROON SONGKET + 4:5 GOLD-FRAMED PHOTOS) */}
            {galleryPaths.length > 0 && (
              <section className={`${styles.section} ${styles.sectionMaroon}`} id="galeri">
                <Image src={`${ASSET}/02-opening-curtain.webp`} alt="" width={768} height={1376} className={styles.bgCurtainTop} aria-hidden="true" />
                <Image src={`${ASSET}/14-floral-side-left.webp`} alt="" width={582} height={1342} className={styles.bgSideLeft} aria-hidden="true" />
                <Image src={`${ASSET}/15-floral-side-right.webp`} alt="" width={582} height={1342} className={styles.bgSideRight} aria-hidden="true" />

                <div className={styles.sectionContent}>
                  <Reveal>
                    <MinangCrest light />
                    <p className={styles.eyebrowLight}>Our Precious Moments</p>
                    <h2 className={styles.headingLight}>Galeri Foto</h2>
                    <p className={styles.leadLight}>
                      Kumpulan kenangan hangat yang menjadi saksi perjalanan cinta menuju hari bahagia kami.
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
                </div>
              </section>
            )}

            {/* 7. AMPLOP DIGITAL (CREAM SONGKET + GOLDEN TREE + CLEAN MAROON-GOLD GIFT CARD) */}
            {invitation.gift_info?.account_number && (
              <section className={`${styles.section} ${styles.sectionCream}`} id="hadiah">
                <Image src={`${ASSET}/05-golden-tree.webp`} alt="" width={888} height={935} className={styles.bgGoldenTree} aria-hidden="true" />
                <Image src={`${ASSET}/08-palm-left.webp`} alt="" width={739} height={1079} className={styles.bgPalmLeft} aria-hidden="true" />
                <Image src={`${ASSET}/09-palm-right.webp`} alt="" width={761} height={1130} className={styles.bgPalmRight} aria-hidden="true" />

                <div className={styles.sectionContent}>
                  <Reveal>
                    <MinangCrest />
                    <p className={styles.eyebrowDark}>Wedding Gift</p>
                    <h2 className={styles.headingDark}>Amplop Digital</h2>
                    <p className={styles.leadDark}>
                      Doa restu Bapak/Ibu/Saudara/i merupakan karunia terindah bagi kami. Jika berkenan memberikan tanda kasih, dapat disampaikan melalui:
                    </p>

                    <MinangGoldCard className={styles.giftCardInner}>
                      <div className={styles.giftHeader}>
                        <span className={styles.giftBank}>{invitation.gift_info.bank || "Bank"}</span>
                        <span className={styles.giftChipWrap}>
                          <MinangIcon name="chip" size={14} />
                          <span>Transfer Bank</span>
                        </span>
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
                        <MinangIcon name={copiedAccount ? "check" : "copy"} size={16} />
                        <span>{copiedAccount ? "Nomor Rekening Tersalin" : "Salin Nomor Rekening"}</span>
                      </button>
                    </MinangGoldCard>
                  </Reveal>
                </div>
              </section>
            )}

            {/* 8. RSVP & BUKU TAMU (MAROON SONGKET + CLEAN MAROON-GOLD FORM, WIRED TO /api/guest-response) */}
            <section className={`${styles.section} ${styles.sectionMaroon}`} id="ucapan">
              <Image src={`${ASSET}/03-woodland-left.webp`} alt="" width={896} height={1200} className={styles.bgWoodlandLeft} aria-hidden="true" />
              <Image src={`${ASSET}/04-woodland-right.webp`} alt="" width={896} height={1200} className={styles.bgWoodlandRight} aria-hidden="true" />

              <div className={styles.sectionContent}>
                <Reveal>
                  <MinangCrest light />
                  <p className={styles.eyebrowLight}>Wishes &amp; RSVP</p>
                  <h2 className={styles.headingLight}>Konfirmasi Kehadiran &amp; Doa</h2>
                  <p className={styles.leadLight}>
                    Konfirmasikan kehadiran serta kirimkan ucapan dan doa restu terbaik untuk kedua mempelai.
                  </p>
                </Reveal>

                <MinangGoldCard>
                  <form onSubmit={handleRsvpSubmit} className={styles.rsvpForm}>
                    <label className={styles.fieldLabel} htmlFor="minang-guest-name">
                      Nama Lengkap
                      <input
                        id="minang-guest-name"
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

                    <label className={styles.fieldLabel} htmlFor="minang-attendance">
                      Konfirmasi Kehadiran
                      <select
                        id="minang-attendance"
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

                    <label className={styles.fieldLabel} htmlFor="minang-guest-count">
                      Jumlah Tamu
                      <input
                        id="minang-guest-count"
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

                    <label className={styles.fieldLabel} htmlFor="minang-message">
                      Ucapan &amp; Doa Restu
                      <textarea
                        id="minang-message"
                        name="message"
                        className={styles.textarea}
                        value={rsvpMessage}
                        onChange={(e) => setRsvpMessage(e.target.value)}
                        maxLength={500}
                        placeholder="Tuliskan doa terbaik untuk kedua mempelai..."
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
                </MinangGoldCard>

                <div className={styles.greetingsList} aria-label="Daftar ucapan tamu">
                  <p className={styles.greetingsCount}>{greetings.length} Ucapan &amp; Doa</p>
                  {greetings.length === 0 && (
                    <p className={styles.leadLight} style={{ margin: 0 }}>
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
              </div>
            </section>

            {/* 9. CLOSING FOOTER (MAROON-GOLD PLAQUE + CLEAN INDIF LOGO WELL ABOVE FLORAL CUSHION) */}
            <footer className={styles.footer} id="penutup">
              <Image src={`${ASSET}/03-woodland-left.webp`} alt="" width={896} height={1200} className={styles.bgWoodlandLeft} aria-hidden="true" />
              <Image src={`${ASSET}/04-woodland-right.webp`} alt="" width={896} height={1200} className={styles.bgWoodlandRight} aria-hidden="true" />

              <div className={styles.footerInner}>
                <Reveal>
                  <MinangGoldCard>
                    <MinangCrest light />
                    <p className={styles.footerClosingText}>{invitation.closing_text}</p>
                    {invitation.closing_greeting && (
                      <p className={styles.footerGreeting}>{invitation.closing_greeting}</p>
                    )}
                    <div className={styles.footerMonogram} aria-hidden="true">
                      {invitation.bride_short_name.charAt(0)} &amp; {invitation.groom_short_name.charAt(0)}
                    </div>
                    <h2 className={styles.footerCouple}>{coupleNames}</h2>
                  </MinangGoldCard>

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
                src={`${ASSET}/13-floral-bottom-cushion.webp`}
                alt=""
                width={1376}
                height={605}
                className={styles.footerBottomFloral}
                aria-hidden="true"
              />
            </footer>
          </main>
        </div>
      </div>

      {/* ─── FLOATING AUTO SCROLL, MUSIC & BOTTOM NAVIGATION DOCK ─── */}
      {ready && (
        <>
          <div className={styles.floatingControls}>
            <button
              type="button"
              className={`${styles.floatingActionBtn} ${autoScrolling ? styles.floatingActionBtnActive : ""}`}
              onClick={() => setAutoScrolling((prev) => !prev)}
              aria-label={autoScrolling ? "Hentikan auto scroll" : "Aktifkan auto scroll"}
              aria-pressed={autoScrolling}
            >
              <MinangIcon name={autoScrolling ? "pause" : "arrowDown"} size={15} />
              <span>{autoScrolling ? "Stop Scroll" : "Auto Scroll"}</span>
            </button>

            {musicPath && (
              <button
                type="button"
                className={styles.floatingActionBtn}
                onClick={toggleMusic}
                aria-label={playing ? "Matikan musik" : "Putar musik"}
                aria-pressed={playing}
              >
                <MinangIcon name={playing ? "music" : "muted"} size={15} />
                <span>Musik {playing ? "On" : "Off"}</span>
              </button>
            )}
          </div>

          <nav className={styles.bottomNav} aria-label="Navigasi undangan">
            {NAV_ITEMS.map(({ id, label, icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`${styles.navItem} ${activeSection === id ? styles.navItemActive : ""}`}
                aria-current={activeSection === id ? "location" : undefined}
              >
                <MinangIcon name={icon} size={17} />
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
            <MinangIcon name="close" size={20} />
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
