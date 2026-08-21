"use client";

import { useEffect, useState } from "react";

const links = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "mempelai", label: "Mempelai", icon: "♡" },
  { id: "acara", label: "Acara", icon: "◷" },
  { id: "galeri", label: "Galeri", icon: "▦" },
  { id: "ucapan", label: "Ucapan", icon: "◌" },
];

export function FloatingNav() {
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
      {links.map((link) => (
        <a key={link.id} href={`#${link.id}`} className={active === link.id ? "is-active" : ""}>
          <span aria-hidden="true">{link.icon}</span>
          <small>{link.label}</small>
        </a>
      ))}
    </nav>
  );
}

