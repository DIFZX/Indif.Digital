"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { getTemplateThumbnail } from "@/lib/catalog-settings";
import styles from "./coverflow-showcase.module.css";

export type ShowcaseTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_path: string | null;
  preview_path: string | null;
  category: string;
  price?: number;
  promo_price?: number | null;
};

interface CoverflowShowcaseProps {
  templates: ShowcaseTemplate[];
  initialSlug?: string;
}

export function CoverflowShowcase({ templates, initialSlug = "sunda-vibes" }: CoverflowShowcaseProps) {
  const validTemplates = useMemo(() => {
    return templates.filter((t) => Boolean(t.preview_path));
  }, [templates]);

  const initialIndex = useMemo(() => {
    const foundIdx = validTemplates.findIndex((t) => t.slug === initialSlug);
    return foundIdx !== -1 ? foundIdx : 0;
  }, [validTemplates, initialSlug]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = validTemplates.length;

  const goToNext = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Pointer drag events for desktop & touch swipe on mobile
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary button
    if (e.button !== 0 && e.pointerType === "mouse") return;
    startXRef.current = e.clientX;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setDragOffset(0);
    if (containerRef.current) {
      try {
        containerRef.current.setPointerCapture(e.pointerId);
      } catch {
        // ignore capture errors
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || startXRef.current === null) return;
    const diff = e.clientX - startXRef.current;
    // Bound drag offset so it doesn't wildly fling
    const clampedDiff = Math.max(-140, Math.min(140, diff));
    setDragOffset(clampedDiff);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    const diff = dragOffset;
    setDragOffset(0);
    startXRef.current = null;

    const threshold = 40;
    if (diff > threshold) {
      goToPrev();
    } else if (diff < -threshold) {
      goToNext();
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragOffset(0);
    startXRef.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      goToPrev();
    } else if (e.key === "ArrowRight") {
      goToNext();
    }
  };

  const activeTemplate = validTemplates[activeIndex] || validTemplates[0];

  if (!validTemplates || validTemplates.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.showcaseWrapper}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="3D Galeri Pilihan Desain Undangan InDif Digital"
    >
      {/* 3D Stage with Perspective */}
      <div
        ref={containerRef}
        className={`${styles.stageContainer} ${isDragging ? styles.isDragging : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className={styles.stagePerspective}>
          {validTemplates.map((template, idx) => {
            // Circular offset relative to activeIndex
            let offset = idx - activeIndex;
            if (offset > Math.floor(total / 2)) {
              offset -= total;
            } else if (offset < -Math.floor(total / 2)) {
              offset += total;
            }

            // Only render cards within visibility window (-2 to +2)
            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            const isCenter = offset === 0;
            const isLeft = offset < 0;
            const isRight = offset > 0;

            const thumbnailSrc = getTemplateThumbnail(template.slug, template.thumbnail_path);

            // Compute dynamic transform with drag offset
            const dragInfluence = isDragging ? dragOffset * 0.4 : 0;

            let cardStyle: React.CSSProperties = {};
            let posClass = styles.cardCenter;

            if (isCenter) {
              posClass = styles.cardCenter;
              cardStyle = {
                transform: `translateX(${dragInfluence}px) translateZ(0px) scale(1.05)`,
                zIndex: 10,
                opacity: 1,
              };
            } else if (offset === -1) {
              posClass = styles.cardLeft;
              cardStyle = {
                transform: `translateX(calc(-62% + ${dragInfluence}px)) translateZ(-80px) rotateY(24deg) rotateZ(-3deg) scale(0.86)`,
                zIndex: 7,
                opacity: 0.68,
              };
            } else if (offset === 1) {
              posClass = styles.cardRight;
              cardStyle = {
                transform: `translateX(calc(62% + ${dragInfluence}px)) translateZ(-80px) rotateY(-24deg) rotateZ(3deg) scale(0.86)`,
                zIndex: 7,
                opacity: 0.68,
              };
            } else if (offset === -2) {
              posClass = styles.cardFarLeft;
              cardStyle = {
                transform: `translateX(calc(-108% + ${dragInfluence}px)) translateZ(-160px) rotateY(32deg) scale(0.72)`,
                zIndex: 4,
                opacity: 0.25,
              };
            } else if (offset === 2) {
              posClass = styles.cardFarRight;
              cardStyle = {
                transform: `translateX(calc(108% + ${dragInfluence}px)) translateZ(-160px) rotateY(-32deg) scale(0.72)`,
                zIndex: 4,
                opacity: 0.25,
              };
            }

            const handleCardClick = (e: React.MouseEvent) => {
              if (Math.abs(dragOffset) > 6) return;
              if (isCenter) {
                if (template.preview_path) {
                  window.open(template.preview_path, "_blank", "noopener,noreferrer");
                }
              } else if (isLeft) {
                goToPrev();
              } else if (isRight) {
                goToNext();
              }
            };

            return (
              <div
                key={template.id}
                className={`${styles.mockupCard} ${posClass}`}
                style={cardStyle}
                onClick={handleCardClick}
                role="button"
                tabIndex={isCenter ? 0 : -1}
                aria-label={`Pilih mockup template ${template.name}`}
              >
                {/* Clean Mockup Frame ("Mockup Biasa") */}
                <div className={styles.mockupFrame}>
                  <Image
                    src={thumbnailSrc}
                    alt={`Mockup template ${template.name}`}
                    fill
                    sizes="(max-width: 640px) 290px, (max-width: 1024px) 360px, 420px"
                    className={styles.mockupImage}
                    priority={idx === initialIndex}
                    draggable={false}
                  />
                </div>

                {/* Peeking Template Label */}
                {!isCenter && (
                  <span className={styles.peekingLabel}>{template.name}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots ("Bola Putih") */}
      <div className={styles.controlsRow}>
        <div className={styles.dotsContainer} role="tablist" aria-label="Daftar template showcase">
          {validTemplates.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Lihat ${t.name}`}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ""}`}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* Caption matching the user's reference screenshot */}
      <div className={styles.captionSection}>
        <span className={styles.templateTag}>{activeTemplate.name}</span>
        <h3 className={styles.captionHeading}>Detail yang bercerita.</h3>
        {activeTemplate.preview_path ? (
          <a
            href={activeTemplate.preview_path}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.previewAction}
          >
            <span>Sentuh desain untuk melihat undangannya</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ) : (
          <p className={styles.captionSub}>Sentuh desain untuk melihat undangannya.</p>
        )}
      </div>
    </div>
  );
}
