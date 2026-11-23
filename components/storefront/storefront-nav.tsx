"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { ThemeSwitch } from "./theme-switch";
import styles from "./storefront-nav.module.css";

export function StorefrontNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.navHeader} ${isScrolled ? styles.scrolled : ""}`}>
      <nav className={styles.navInner} aria-label="Navigasi utama">
        {/* Brand Logo */}
        <Link className={styles.brand} href="/" aria-label={`${BRAND.name} beranda`}>
          <Image
            src={BRAND.logoPath}
            alt={BRAND.name}
            width={380}
            height={140}
            priority
            className={styles.brandImg}
          />
        </Link>

        {/* Navigation Items & Actions */}
        <div className={styles.navRight}>
          <div className={styles.navLinks}>
            <a className={styles.navLink} href="#templates">
              Template
            </a>
            <a className={styles.navLink} href="#kelebihan">
              Kelebihan
            </a>
          </div>

          <div className={styles.socialButtonsGroup}>
            <a
              className={styles.socialIconBtn}
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram InDif Digital"
              aria-label="Instagram InDif Digital"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              className={styles.socialIconBtn}
              href={BRAND.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok InDif Digital"
              aria-label="TikTok InDif Digital"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.33 6.33 0 0 0 6.34-6.32V8.75a8.28 8.28 0 0 0 4.81 1.52V6.8a4.84 4.84 0 0 1-.9-.11z"/>
              </svg>
            </a>
            <a
              className={styles.socialIconBtnWa}
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp InDif Digital"
              aria-label="WhatsApp InDif Digital"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.074-1.89-.447-1.488-.616-2.434-2.122-2.508-2.222-.074-.099-.607-.808-.607-1.542 0-.734.385-1.096.522-1.245.137-.149.301-.186.402-.186.101 0 .202.001.29.006.094.004.22-.036.344.263.129.313.441 1.077.48 1.157.039.08.065.174.013.279-.052.105-.078.17-.156.26-.078.09-.163.201-.233.27-.078.077-.16.16-.068.318.092.158.408.673.876 1.09.602.536 1.11.702 1.268.78.158.078.25.069.344-.039.094-.108.402-.468.51-.628.108-.16.216-.134.364-.079.148.056.938.442 1.1.523.162.081.27.121.31.189.04.068.04.394-.104.799z"/>
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.308A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.637 0-3.155-.494-4.423-1.341l-.317-.213-3.076.807.821-3-.232-.369A8.204 8.204 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" clipRule="evenodd"/>
              </svg>
            </a>
          </div>

          {/* Theme Switcher Button */}
          <ThemeSwitch />
        </div>
      </nav>
    </header>
  );
}
