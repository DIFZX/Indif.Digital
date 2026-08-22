"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

export function Gallery({ paths, lightboxClassName = "" }: { paths: string[]; lightboxClassName?: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeLightbox = useCallback(() => {
    setSelected(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [closeLightbox, selected]);

  return (
    <>
      <div className="gallery-grid">
        {paths.map((path, index) => (
          <button
            key={path}
            type="button"
            className={index === 0 ? "gallery-featured" : ""}
            style={{ "--gallery-delay": `${160 + index * 110}ms` } as CSSProperties}
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setSelected(path);
            }}
            aria-label={`Perbesar foto ${index + 1}`}
          >
            <Image src={path} alt={`Momen pernikahan ${index + 1}`} fill sizes={index === 0 ? "(max-width: 900px) 100vw, 32vw" : "(max-width: 900px) 50vw, 18vw"} />
            <span>Lihat foto</span>
          </button>
        ))}
      </div>

      {selected && typeof document !== "undefined" && createPortal(
        <div className={`lightbox ${lightboxClassName}`} role="dialog" aria-modal="true" aria-label="Foto galeri" onClick={closeLightbox}>
          <button ref={closeButtonRef} type="button" onClick={closeLightbox} aria-label="Tutup foto">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <div className="lightbox-image" onClick={(event) => event.stopPropagation()}>
            <Image src={selected} alt="Foto galeri diperbesar" fill sizes="100vw" />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
