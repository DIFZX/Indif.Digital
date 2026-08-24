"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInvitationOpened } from "@/components/invitation-experience";
import styles from "./pink-vibes.module.css";

const CONTENT_REVEAL_TIME_SECONDS = 6;

type PinkOpeningHeroProps = {
  videoPath: string;
  posterPath: string;
  brideName: string;
  groomName: string;
  eventDateLabel: string;
  guestName: string | null;
};

export function PinkOpeningHero({
  videoPath,
  posterPath,
  brideName,
  groomName,
  eventDateLabel,
  guestName,
}: PinkOpeningHeroProps) {
  const opened = useInvitationOpened();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [contentVisible, setContentVisible] = useState(false);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;

    if (!opened || !video || video.ended) {
      return null;
    }

    try {
      await video.play();
      return true;
    } catch {
      return false;
    }
  }, [opened]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (!opened) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    let videoFrameRequestId: number | null = null;

    const schedulePlaybackWatch = () => {
      if ("requestVideoFrameCallback" in video) {
        videoFrameRequestId = video.requestVideoFrameCallback(watchPlaybackTime);
      }
    };

    const watchPlaybackTime = () => {
      if (video.currentTime >= CONTENT_REVEAL_TIME_SECONDS) {
        setContentVisible(true);
        return;
      }

      schedulePlaybackWatch();
    };

    schedulePlaybackWatch();
    void playVideo().then((started) => {
      if (started === false) {
        // Jangan biarkan identitas undangan tersembunyi jika browser menolak playback.
        setContentVisible(true);
      }
    });

    return () => {
      if (videoFrameRequestId !== null) {
        video.cancelVideoFrameCallback(videoFrameRequestId);
      }
    };
  }, [opened, playVideo]);

  function syncContentWithVideo() {
    const video = videoRef.current;

    if (video && video.currentTime >= CONTENT_REVEAL_TIME_SECONDS) {
      setContentVisible(true);
    }
  }

  const visibleClassName = contentVisible ? styles.heroContentVisible : "";

  return (
    <section className={styles.hero} id="home">
      <video
        ref={videoRef}
        className={styles.heroVideo}
        muted
        playsInline
        preload="auto"
        poster={posterPath}
        tabIndex={-1}
        aria-hidden="true"
        onCanPlay={() => {
          void playVideo().then((started) => {
            if (started === false) {
              setContentVisible(true);
            }
          });
        }}
        onTimeUpdate={syncContentWithVideo}
        onEnded={() => setContentVisible(true)}
        onError={() => setContentVisible(true)}
        onAbort={() => setContentVisible(true)}
      >
        <source src={videoPath} type="video/mp4" />
      </video>

      <div
        className={[styles.heroContent, visibleClassName].filter(Boolean).join(" ")}
        aria-hidden={!contentVisible}
        inert={!contentVisible}
      >
        <p className={styles.kicker}>The Wedding of</p>
        <div className={styles.heroMonogram} aria-hidden="true">
          {brideName.charAt(0)}
          <span>&</span>
          {groomName.charAt(0)}
        </div>
        <h1>
          {brideName}
          <span>&</span>
          {groomName}
        </h1>
        <p className={styles.heroDate}>{eventDateLabel}</p>
        {guestName && (
          <div className={styles.heroGuest}>
            <small>Kepada Yth.</small>
            <strong>{guestName}</strong>
          </div>
        )}
        <a className={styles.scrollCue} href="#mempelai" aria-label="Lihat isi undangan">
          <i />
          <span>Scroll</span>
        </a>
      </div>
    </section>
  );
}
