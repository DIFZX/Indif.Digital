import Image from "next/image";
import type { CSSProperties } from "react";

type FlowerProps = {
  flowerPath: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Centered Botanical Floral Header for section titles
 * Replaces primitive SVG stick crests with real high-resolution botanical bouquets
 */
export function SectionFloralHeader({
  flowerPath,
  className = "",
  style,
}: FlowerProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        margin: "0 auto 10px",
        pointerEvents: "none",
        ...style,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          width: "40px",
          height: "1px",
          background: "linear-gradient(to right, transparent, var(--pw-border-bright))",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "70px",
          height: "70px",
          filter: "drop-shadow(0 6px 14px rgba(0, 0, 0, 0.12))",
        }}
      >
        <Image
          src={flowerPath}
          alt=""
          fill
          sizes="70px"
          style={{ objectFit: "contain", pointerEvents: "none" }}
        />
      </div>
      <span
        style={{
          width: "40px",
          height: "1px",
          background: "linear-gradient(to left, transparent, var(--pw-border-bright))",
        }}
      />
    </div>
  );
}

/**
 * Botanical Floral Corner Accent for Cards (Quote, Event, Gift, RSVP)
 * Replaces ugly stick / pineneedle SVGs with real watercolor botanical bouquets
 */
export function CardFloralAccent({
  flowerPath,
  position = "top-right",
  size = 76,
  className = "",
  style,
}: FlowerProps & {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  size?: number;
}) {
  const isLeft = position.includes("left");
  const isBottom = position.includes("bottom");

  const positionStyle: CSSProperties = {
    position: "absolute",
    top: isBottom ? undefined : "-18px",
    bottom: isBottom ? "-18px" : undefined,
    left: isLeft ? "-18px" : undefined,
    right: isLeft ? undefined : "-18px",
    width: `${size}px`,
    height: `${Math.round(size * 1.15)}px`,
    zIndex: 2,
    pointerEvents: "none",
    transform: `${isLeft ? "scaleX(-1) " : ""}${isBottom ? "scaleY(-1) " : ""}`,
    filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.12))",
    opacity: 0.92,
    ...style,
  };

  return (
    <div className={className} style={positionStyle} aria-hidden="true">
      <Image
        src={flowerPath}
        alt=""
        fill
        sizes={`${size}px`}
        style={{ objectFit: "contain", pointerEvents: "none" }}
      />
    </div>
  );
}

/**
 * Luxury Botanical Seal / Medallion
 * Replaces cartoon green stick wax seal with an authentic botanical medallion
 */
export function BotanicalSeal({
  flowerPath,
  size = 60,
  className = "",
  style,
}: FlowerProps & {
  size?: number;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle, var(--pw-bg-card) 40%, var(--pw-bg-card-subtle) 100%)",
        border: "1.5px solid var(--pw-primary)",
        boxShadow: "0 6px 18px var(--pw-primary-glow), inset 0 0 0 3px rgba(255, 255, 255, 0.6)",
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "relative",
          width: `${Math.round(size * 0.75)}px`,
          height: `${Math.round(size * 0.75)}px`,
          filter: "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))",
        }}
      >
        <Image
          src={flowerPath}
          alt=""
          fill
          sizes={`${size}px`}
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}

/**
 * Refined Minimalist Luxury Section Divider
 */
export function ThemedSectionDivider({
  icon,
  className = "",
  style,
}: {
  icon: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`themedSectionDivider ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        margin: "10px auto 16px",
        maxWidth: "220px",
        ...style,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          flex: 1,
          height: "1px",
          background: "linear-gradient(to right, transparent, var(--pw-border-bright))",
        }}
      />
      <span
        style={{
          color: "var(--pw-primary)",
          fontSize: "0.85rem",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "var(--pw-badge-bg)",
          border: "1px solid var(--pw-border)",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          flex: 1,
          height: "1px",
          background: "linear-gradient(to left, transparent, var(--pw-border-bright))",
        }}
      />
    </div>
  );
}

/**
 * Watermark Monogram / Theme Crest (Subtle background ambient)
 */
export function WatermarkCrest({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={180}
      height={180}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 0.05,
        pointerEvents: "none",
        zIndex: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="90" stroke="var(--pw-primary, #b89358)" strokeWidth="1.5" strokeDasharray="6 4" />
      <circle cx="100" cy="100" r="80" stroke="var(--pw-primary, #b89358)" strokeWidth="1" />
      <path
        d="M100 30 C120 70 170 100 170 100 C170 100 120 130 100 170 C80 130 30 100 30 100 C30 100 80 70 100 30 Z"
        stroke="var(--pw-primary, #b89358)"
        strokeWidth="1.2"
      />
      <circle cx="100" cy="100" r="14" fill="var(--pw-primary, #b89358)" fillOpacity="0.4" />
    </svg>
  );
}
