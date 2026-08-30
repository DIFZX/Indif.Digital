"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInvitationOpened } from "@/components/invitation-experience";
import styles from "./blue-garden.module.css";

const CONTENT_REVEAL_TIME_SECONDS = 4;

type BlueOpeningHeroProps = {
  videoPath: string;
  brideName: string;
  groomName: string;
  eventDateLabel: string;
  guestName: string | null;
};

export function BlueOpeningHero({
  videoPath,
  brideName,
  groomName,
  eventDateLabel,
  guestName,
}: BlueOpeningHeroProps) {
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

    const watchPlaybackTime = () => {
      if (video.currentTime >= CONTENT_REVEAL_TIME_SECONDS) {
        setContentVisible(true);
        return;
      }

      if ("requestVideoFrameCallback" in video) {
        videoFrameRequestId = video.requestVideoFrameCallback(watchPlaybackTime);
      }
    };

    if ("requestVideoFrameCallback" in video) {
      videoFrameRequestId = video.requestVideoFrameCallback(watchPlaybackTime);
    }

    void playVideo().then((started) => {
      if (started === false) {
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
        Browser Anda tidak mendukung video.
      </video>

      <div
        className={[styles.heroContent, visibleClassName].filter(Boolean).join(" ")}
        aria-hidden={!contentVisible}
        inert={!contentVisible}
      >
        <span className={styles.heroKicker}>The Wedding of</span>
        <div className={styles.heroMonogram} aria-hidden="true">
          <span>{brideName.charAt(0)}</span>
          <i>&</i>
          <span>{groomName.charAt(0)}</span>
        </div>
        <h1>
          <span>{brideName}</span>
          <i>&</i>
          <span>{groomName}</span>
        </h1>
        <p className={styles.heroDate}>{eventDateLabel}</p>
        {guestName && (
          <div className={styles.heroGuest}>
            <small>Kepada Yth.</small>
            <strong>{guestName}</strong>
          </div>
        )}
        <a className={styles.scrollCue} href="#quote" aria-label="Lihat isi undangan">
          <i />
          <span>Scroll</span>
        </a>
      </div>
    </section>
  );
}
