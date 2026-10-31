import type { ReactNode } from "react";

type SundaIconName =
  | "pembuka"
  | "mempelai"
  | "acara"
  | "kisah"
  | "galeri"
  | "hadiah"
  | "ucapan"
  | "music"
  | "music-off";

// A consistent fine-line set, with an arched doorway echoing the opening frame.
const artwork: Record<SundaIconName, ReactNode> = {
  pembuka: (
    <>
      <path d="M5 21V10a7 7 0 0 1 14 0v11M3 21h18" />
      <path d="M9 21v-8a3 3 0 0 1 6 0v8M12 4v2M6.5 7l1.4 1.4M17.5 7l-1.4 1.4" />
    </>
  ),
  mempelai: (
    <>
      <circle cx="8.5" cy="14.5" r="5.5" />
      <circle cx="15.5" cy="14.5" r="5.5" />
      <path d="m5.5 5 3-2 3 2-3 4-3-4ZM13 5h5M15.5 2.5v5" />
    </>
  ),
  acara: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16M8 14h2M14 14h2M8 17h2M14 17h2" />
    </>
  ),
  kisah: (
    <>
      <path d="M12 6C9 3.5 5 3.5 2.5 5v15C5 18.5 9 18.5 12 21c3-2.5 7-2.5 9.5-1V5C19 3.5 15 3.5 12 6ZM12 6v15M6 9l2.5.5M6 12.5l2.5.5M15.5 9.5 18 9M15.5 13l2.5-.5" />
    </>
  ),
  galeri: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <circle cx="15.5" cy="8.5" r="1.5" />
      <path d="m4 17 5-6 5 6 3-3 3 3M7 1.5h10M1.5 7v10" />
    </>
  ),
  hadiah: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v9h14v-9M12 8v13" />
      <path d="M12 8C5 8 5 2 8.5 3 10.5 3.5 12 8 12 8Zm0 0c7 0 7-6 3.5-5C13.5 3.5 12 8 12 8Z" />
    </>
  ),
  ucapan: (
    <>
      <path d="M7 19 3 22V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H7Z" />
      <path d="M12 8c-2-2-5 1-3 3l3 3 3-3c2-2-1-5-3-3Z" />
    </>
  ),
  music: (
    <>
      <path d="M9 17V5l11-2v12M9 8l11-2" />
      <ellipse cx="6" cy="17.5" rx="3" ry="2.5" />
      <ellipse cx="17" cy="15.5" rx="3" ry="2.5" />
    </>
  ),
  "music-off": (
    <>
      <path d="M9 17v-4M9 6V5l11-2v12M12 7.5 20 6M3 3l18 18" />
      <ellipse cx="6" cy="17.5" rx="3" ry="2.5" />
      <path d="M19.7 16.6C19.2 17.4 18.2 18 17 18c-1.7 0-3-1.1-3-2.5 0-.5.2-1 .5-1.4" />
    </>
  ),
};

export function SundaIcon({ name }: { name: SundaIconName }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {artwork[name]}
    </svg>
  );
}
