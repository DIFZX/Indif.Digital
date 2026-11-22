"use client";

import { useEffect, useState, type ReactNode } from "react";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 10.5 9-7.5 9 7.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 21 9 12 15 12 15 21" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="3" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="8" x2="16" y1="9" y2="9" />
      <line x1="8" x2="13" y1="13" y2="13" />
    </svg>
  );
}

type NavLink = {
  id: string;
  label: string;
  icon: ReactNode;
};

const links: NavLink[] = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "mempelai", label: "Mempelai", icon: <HeartIcon /> },
  { id: "acara", label: "Acara", icon: <CalendarIcon /> },
  { id: "galeri", label: "Galeri", icon: <GalleryIcon /> },
  { id: "ucapan", label: "Ucapan", icon: <MessageIcon /> },
];

export function FloatingNav({ hasGallery = true }: { hasGallery?: boolean }) {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = links.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-20% 0px -60%", threshold: [0.05, 0.25, 0.5] });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="bottom-nav" aria-label="Navigasi undangan">
      {links.filter((link) => hasGallery || link.id !== "galeri").map((link) => (
        <a key={link.id} href={`#${link.id}`} className={active === link.id ? "is-active" : ""}>
          {link.icon}
          <small>{link.label}</small>
        </a>
      ))}
    </nav>
  );
}
