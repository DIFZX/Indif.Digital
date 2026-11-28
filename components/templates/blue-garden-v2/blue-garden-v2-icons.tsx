import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./blue-garden-v2.module.css";

const ASSET = "/media/blue-garden-v2/web";

export type BlueGardenIconName =
  | "home"
  | "couple"
  | "calendar"
  | "gallery"
  | "gift"
  | "wishes"
  | "music"
  | "muted"
  | "map"
  | "copy"
  | "check"
  | "close"
  | "arrowDown"
  | "chip"
  | "pause"
  | "chevronLeft"
  | "chevronRight";

export function BlueGardenIcon({ name, size = 18 }: { name: BlueGardenIconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V20h13V9.5" />
          <path d="M9.5 20v-6h5v6" />
        </svg>
      );
    case "couple":
      return (
        <svg {...props}>
          <circle cx="9" cy="12" r="4.5" />
          <circle cx="15" cy="12" r="4.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2.5" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      );
    case "gallery":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m21 15.5-5-4.5-6.5 6-2.5-2-4 3.5" />
        </svg>
      );
    case "gift":
      return (
        <svg {...props}>
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
          <path d="M12 8H8.5a2 2 0 1 1 0-4C11 4 12 8 12 8Zm0 0h3.5a2 2 0 1 0 0-4C13 4 12 8 12 8Z" />
        </svg>
      );
    case "wishes":
      return (
        <svg {...props}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
        </svg>
      );
    case "music":
      return (
        <svg {...props}>
          <path d="M9 18V6l11-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="17.5" cy="16" r="2.5" />
        </svg>
      );
    case "muted":
      return (
        <svg {...props}>
          <path d="M9 18V6l11-2v10" />
          <circle cx="6.5" cy="18" r="2.5" />
          <path d="m3 3 18 18" />
        </svg>
      );
    case "map":
      return (
        <svg {...props}>
          <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "copy":
      return (
        <svg {...props}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "arrowDown":
      return (
        <svg {...props}>
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      );
    case "chip":
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="12" rx="2.5" />
          <path d="M9 6v12M15 6v12M3 12h6M15 12h6" />
        </svg>
      );
    case "pause":
      return (
        <svg {...props}>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      );
    case "chevronLeft":
      return (
        <svg {...props}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "chevronRight":
      return (
        <svg {...props}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
  }
}

/**
 * Bespoke Porcelain & Antique-Gold Botanical Crest Divider
 * Echoes the diamond finials and baroque curves of 14-blue-garden-arch-frame.png
 */
export function BlueGardenCrest({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  const gold = light ? "#F0D99B" : "#BE9B54";
  const goldSoft = light ? "#D8BA74" : "#D4B97A";
  const jewel = light ? "#9CC2E2" : "#4A6D91";

  return (
    <div className={`${styles.crestWrap} ${compact ? styles.crestCompact : ""}`} aria-hidden="true">
      <svg
        width={compact ? 124 : 162}
        height={compact ? 24 : 30}
        viewBox="0 0 162 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6 15 H55" stroke={goldSoft} strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <path d="M107 15 H156" stroke={goldSoft} strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <path
          d="M42 15 C50 8, 60 7, 68 13 C72 9, 76 6, 81 3 C86 6, 90 9, 94 13 C102 7, 112 8, 120 15"
          stroke={gold}
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M54 18 C62 23, 72 23, 81 18 C90 23, 100 23, 108 18"
          stroke={goldSoft}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path d="M81 8 L86 15 L81 22 L76 15 Z" fill={jewel} stroke={gold} strokeWidth="1.25" />
        <circle cx="81" cy="3" r="1.6" fill={gold} />
        <circle cx="63" cy="15" r="1.7" fill={gold} />
        <circle cx="99" cy="15" r="1.7" fill={gold} />
      </svg>
    </div>
  );
}

/**
 * Upgraded Ornate Scalloped-Filigree Gold & Porcelain Frame Card
 * Clean architectural gold double-border + Baroque corner scrollwork + top & bottom gold diamond finials
 */
export function BlueGardenOrnateFrame({
  children,
  variant = "ivory",
  className = "",
}: {
  children: ReactNode;
  variant?: "ivory" | "porcelain-blue";
  className?: string;
}) {
  const isBlue = variant === "porcelain-blue";
  const strokeMain = isBlue ? "#DFC384" : "#BE9B54";
  const strokeSub = isBlue ? "#B99958" : "#D6BE88";
  const gemFill = isBlue ? "#2A435E" : "#5D83A8";

  return (
    <div className={`${styles.ornateFrame} ${isBlue ? styles.ornateFrameBlue : ""} ${className}`}>
      <span className={styles.ornateFrameInnerBorder} aria-hidden="true" />

      {/* Top Scalloped Gold Finial */}
      <span className={styles.ornateTopMedallion} aria-hidden="true">
        <svg width="74" height="20" viewBox="0 0 74 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 11 C15 11, 24 7, 37 2 C50 7, 59 11, 70 11" stroke={strokeMain} strokeWidth="1.45" strokeLinecap="round" />
          <path d="M18 11 C25 11, 31 9, 37 6 C43 9, 49 11, 56 11" stroke={strokeSub} strokeWidth="0.95" strokeLinecap="round" />
          <path d="M37 4 L42 10.5 L37 17 L32 10.5 Z" fill={gemFill} stroke={strokeMain} strokeWidth="1.35" />
        </svg>
      </span>

      {/* Bottom Scalloped Gold Finial */}
      <span className={styles.ornateBottomMedallion} aria-hidden="true">
        <svg width="56" height="14" viewBox="0 0 56 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6 C15 6, 21 9, 28 12 C35 9, 41 6, 50 6" stroke={strokeSub} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M28 2 L32 7 L28 12 L24 7 Z" fill={strokeMain} />
        </svg>
      </span>

      {/* 4 Baroque Corner Scroll Filigrees */}
      <svg className={`${styles.ornateCorner} ${styles.cornerTL}`} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M2 30 V12 C2 6, 6 2, 12 2 H30" stroke={strokeMain} strokeWidth="1.65" strokeLinecap="round" />
        <path d="M7 24 C7 13, 13 7, 24 7" stroke={strokeSub} strokeWidth="1.15" strokeLinecap="round" />
        <path d="M7 14 C10 14, 14 10, 14 7" stroke={strokeMain} strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="8.5" cy="8.5" r="2" fill={strokeMain} />
      </svg>
      <svg className={`${styles.ornateCorner} ${styles.cornerTR}`} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M30 30 V12 C30 6, 26 2, 20 2 H2" stroke={strokeMain} strokeWidth="1.65" strokeLinecap="round" />
        <path d="M25 24 C25 13, 19 7, 8 7" stroke={strokeSub} strokeWidth="1.15" strokeLinecap="round" />
        <path d="M25 14 C22 14, 18 10, 18 7" stroke={strokeMain} strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="23.5" cy="8.5" r="2" fill={strokeMain} />
      </svg>
      <svg className={`${styles.ornateCorner} ${styles.cornerBL}`} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M2 2 V20 C2 26, 6 30, 12 30 H30" stroke={strokeMain} strokeWidth="1.65" strokeLinecap="round" />
        <path d="M7 8 C7 19, 13 25, 24 25" stroke={strokeSub} strokeWidth="1.15" strokeLinecap="round" />
        <path d="M7 18 C10 18, 14 22, 14 25" stroke={strokeMain} strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="8.5" cy="23.5" r="2" fill={strokeMain} />
      </svg>
      <svg className={`${styles.ornateCorner} ${styles.cornerBR}`} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M30 2 V20 C30 26, 26 30, 20 30 H2" stroke={strokeMain} strokeWidth="1.65" strokeLinecap="round" />
        <path d="M25 8 C25 19, 19 25, 8 25" stroke={strokeSub} strokeWidth="1.15" strokeLinecap="round" />
        <path d="M25 18 C22 18, 18 22, 18 25" stroke={strokeMain} strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="23.5" cy="23.5" r="2" fill={strokeMain} />
      </svg>

      <div className={styles.ornateFrameBody}>{children}</div>
    </div>
  );
}

/**
 * HD Scalloped Baroque Gilded Arch Portrait Frame
 * Uses the real carved arch-frame-cutout.webp + pixel-exact arch-frame-mask.webp
 */
export function BlueGardenPortraitArch({
  src,
  alt,
  floralSide,
}: {
  src: string;
  alt: string;
  floralSide: "left" | "right";
}) {
  return (
    <div className={styles.portraitArchOuter}>
      <div className={styles.portraitArchStage}>
        <div className={styles.portraitArchMask}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 480px) 260px, 280px"
            className={styles.portraitArchPhoto}
          />
        </div>
        <Image
          src={`${ASSET}/arch-frame-cutout.webp`}
          alt=""
          fill
          sizes="(max-width: 480px) 260px, 280px"
          className={styles.portraitArchOverlay}
          aria-hidden="true"
        />
      </div>
      <Image
        src={`${ASSET}/${floralSide === "left" ? "12-floral-side-left.webp" : "13-floral-side-right.webp"}`}
        alt=""
        width={150}
        height={220}
        className={`${styles.portraitCornerFloral} ${
          floralSide === "left" ? styles.portraitCornerLeft : styles.portraitCornerRight
        }`}
        aria-hidden="true"
      />
    </div>
  );
}
