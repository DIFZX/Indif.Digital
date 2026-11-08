"use client";

/* eslint-disable @next/next/no-img-element -- Small original pixel icons are served locally with fixed dimensions. */
import { useCallback, useEffect, useRef, useState } from "react";
import { LOCATIONS, type Section } from "./world";
import styles from "./pixel.module.css";

export function PixelNavigation({ visited, current, onSelect }: { visited: Section[]; current: Section | null; onSelect: (section: Section) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ before: false, after: true });
  const updateEdges = useCallback(() => {
    const element = track.current;
    if (!element) return;
    const vertical = element.scrollHeight > element.clientHeight + 2 && element.scrollWidth <= element.clientWidth + 2;
    const offset = vertical ? element.scrollTop : element.scrollLeft;
    const remaining = vertical ? element.scrollHeight - element.clientHeight : element.scrollWidth - element.clientWidth;
    setEdges({ before: offset > 3, after: offset < remaining - 3 });
  }, []);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updateEdges]);
  function scroll(direction: number) {
    const element = track.current;
    if (!element) return;
    const vertical = element.scrollHeight > element.clientHeight + 2 && element.scrollWidth <= element.clientWidth + 2;
    const distance = (vertical ? element.clientHeight : element.clientWidth) * .8 * direction;
    element.scrollBy({ [vertical ? "top" : "left"]: distance, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <nav className={styles.quickNav} aria-label="Menu undangan">
    <button type="button" className={styles.navArrow} aria-label="Menu sebelumnya" disabled={!edges.before} onClick={() => scroll(-1)}><span aria-hidden="true">‹</span></button>
    <div ref={track} className={styles.navItems} onScroll={updateEdges}>
      {LOCATIONS.map(item => <button type="button" key={item.id} onClick={() => onSelect(item.id)} aria-label={`Buka ${item.label}`} data-current={current === item.id} data-visited={visited.includes(item.id)}>
        <img src={`/media/adventure-wedding-pixel/nav-${item.id}.webp`} alt="" width={80} height={80} draggable={false} />
        <span>{item.id === "rsvp" ? <>Ucapan &<br />RSVP</> : item.label}</span>
        {visited.includes(item.id) && <i aria-label="Sudah dikunjungi">✓</i>}
      </button>)}
    </div>
    <button type="button" className={styles.navArrow} aria-label="Menu berikutnya" disabled={!edges.after} onClick={() => scroll(1)}><span aria-hidden="true">›</span></button>
  </nav>;
}
