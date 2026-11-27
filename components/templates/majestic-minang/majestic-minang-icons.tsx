import type { ReactNode } from "react";
import styles from "./majestic-minang.module.css";

export type MinangIconName =
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
  | "chip";

export function MinangIcon({ name, size = 18 }: { name: MinangIconName; size?: number }) {
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
  }
}

/**
 * Bespoke Minangkabau Gonjong / Suntiang Gold Filigree Crown Crest
 * Echoes the ruby-diamond crown & golden curls of warnabingkai.png
 */
export function MinangCrest({ light = false }: { light?: boolean }) {
  const stroke = light ? "#F2D794" : "#B88A38";
  const accent = light ? "#D8AE5C" : "#9E7024";
  const ruby = "#8B1F30";

  return (
    <div className={styles.crestWrap} aria-hidden="true">
      <svg width="156" height="36" viewBox="0 0 156 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 22 H52" stroke={accent} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <path d="M104 22 H150" stroke={accent} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <path
          d="M36 22 C44 12, 54 10, 62 18 C67 12, 72 8, 78 3 C84 8, 89 12, 94 18 C102 10, 112 12, 120 22"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M52 24 C60 28, 70 28, 78 24 C86 28, 96 28, 104 24"
          stroke={accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path d="M78 9 L83 17 L78 25 L73 17 Z" fill={ruby} stroke={stroke} strokeWidth="1.3" />
        <circle cx="78" cy="3" r="1.8" fill={stroke} />
        <circle cx="56" cy="22" r="2" fill={stroke} />
        <circle cx="100" cy="22" r="2" fill={stroke} />
      </svg>
    </div>
  );
}

/**
 * Reusable Royal Minangkabau Crimson-Maroon & Gold Ornate Frame Card
 * Matching warnabingkai.png: velvet maroon interior + double antique gold border + 4 filigree corners + top ruby jewel
 */
export function MinangGoldCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.goldCard} ${className}`}>
      <span className={styles.goldCardInnerLine} aria-hidden="true" />
      <span className={styles.goldCardTopJewel} aria-hidden="true">
        <svg width="64" height="20" viewBox="0 0 64 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 11 C14 11, 22 7, 32 2 C42 7, 50 11, 60 11" stroke="#E2BF70" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M32 4 L37 11 L32 18 L27 11 Z" fill="#8C1E30" stroke="#F0D48D" strokeWidth="1.4" />
        </svg>
      </span>
      <svg className={`${styles.cornerFiligree} ${styles.cornerTL}`} width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <path d="M2 28 V10 C2 5, 5 2, 10 2 H28" stroke="#E4C172" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M7 22 C7 12, 12 7, 22 7" stroke="#C89B46" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="9" cy="9" r="2.2" fill="#F2D794" />
      </svg>
      <svg className={`${styles.cornerFiligree} ${styles.cornerTR}`} width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <path d="M28 28 V10 C28 5, 25 2, 20 2 H2" stroke="#E4C172" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M23 22 C23 12, 18 7, 8 7" stroke="#C89B46" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="21" cy="9" r="2.2" fill="#F2D794" />
      </svg>
      <svg className={`${styles.cornerFiligree} ${styles.cornerBL}`} width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <path d="M2 2 V20 C2 25, 5 28, 10 28 H28" stroke="#E4C172" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M7 8 C7 18, 12 23, 22 23" stroke="#C89B46" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="9" cy="21" r="2.2" fill="#F2D794" />
      </svg>
      <svg className={`${styles.cornerFiligree} ${styles.cornerBR}`} width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <path d="M28 2 V20 C28 25, 25 28, 20 28 H2" stroke="#E4C172" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M23 8 C23 18, 18 23, 8 23" stroke="#C89B46" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="21" cy="21" r="2.2" fill="#F2D794" />
      </svg>
      <div className={styles.goldCardBody}>{children}</div>
    </div>
  );
}
