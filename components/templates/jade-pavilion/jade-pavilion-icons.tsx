export type JadeIconName =
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
  | "arrowDown";

export function JadePavilionIcon({ name, size = 18 }: { name: JadeIconName; size?: number }) {
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
  }
}
