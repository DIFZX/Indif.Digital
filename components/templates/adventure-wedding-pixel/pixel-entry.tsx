"use client";

/* eslint-disable @next/next/no-img-element -- Original local pixel art has fixed dimensions and needs no image optimizer. */
import { PixelIcon } from "./pixel-panels";
import styles from "./pixel.module.css";

export function PixelEntryLoading() {
  return <div className={styles.loadingScreen} role="status" aria-live="polite">
    <div className={styles.loadingBackdrop} aria-hidden="true" />
    <div className={styles.loadingScene}>
      <img src="/media/adventure-wedding-pixel/nav-couple.webp" width={96} height={96} alt="" />
      <strong>Memuat peta…</strong>
      <div className={styles.loadingProgress} role="progressbar" aria-label="Memuat peta"><span /></div>
    </div>
  </div>;
}

export function PixelWelcome({ onClose }: { onClose: () => void }) {
  return <aside className={styles.welcome} role="status" aria-label="Selamat datang">
    <button className={styles.welcomeClose} type="button" aria-label="Tutup petunjuk singkat" onClick={onClose}>×</button>
    <div className={styles.welcomeMain}>
      <img src="/media/adventure-wedding-pixel/nav-couple.webp" width={80} height={80} alt="" />
      <div><span>Selamat datang</span><h2>Jelajahi undangan<br />pernikahan kami.</h2></div>
    </div>
    <p><PixelIcon name="map" />Datangi ikon untuk membuka info</p>
  </aside>;
}
