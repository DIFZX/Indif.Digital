import type { ReactNode } from "react";

type IconName = "home" | "couple" | "calendar" | "gallery" | "wishes" | "music" | "muted" | "arrow" | "pin" | "gift" | "copy" | "chip";
const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7" /></>,
  couple: <><circle cx="8" cy="15" r="5" /><circle cx="16" cy="15" r="5" /><path d="m5 5 3-3 3 3-3 4-3-4ZM14 5h4M16 3v5" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4M16 3v4M4 10h16M8 14h2M14 14h2M8 17h2" /></>,
  gallery: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="16" cy="8" r="1.5" /><path d="m4 17 5-6 5 6 3-3 3 3" /></>,
  wishes: <><path d="M7 19 3 22V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H7Z" /><path d="M12 8c-2-2-5 1-3 3l3 3 3-3c2-2-1-5-3-3Z" /></>,
  music: <><path d="M9 17V5l11-2v12M9 8l11-2" /><ellipse cx="6" cy="17.5" rx="3" ry="2.5" /><ellipse cx="17" cy="15.5" rx="3" ry="2.5" /></>,
  muted: <><path d="M9 17v-4M9 6V5l11-2v12M12 7.5 20 6M3 3l18 18" /><ellipse cx="6" cy="17.5" rx="3" ry="2.5" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  gift: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M3 7h18v4H3zM12 7v14" /><path d="M12 7C4 8 5 1 8 3l4 4Zm0 0c8 1 7-6 4-4l-4 4Z" /></>,
  copy: <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V3H3v13h5" /></>,
  chip: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M9 5v14M15 5v14M3 12h6M15 12h6M9 9h6M9 15h6" /></>,
};
export function BlushRoseIcon({ name }: { name: IconName }) {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
