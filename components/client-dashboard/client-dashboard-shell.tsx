"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { DEFAULT_SHARE_MESSAGE } from "@/lib/invitation-share-message";
import type { GuestRSVP, Invitation } from "@/lib/types";
import styles from "./client-dashboard.module.css";

type DashboardData = {
  invitation: Invitation;
  initialRSVPs: GuestRSVP[];
  viewCount: number;
  shareMessageTemplate: string | null;
};

type DashboardContextValue = DashboardData & {
  guestShareName: string;
  setGuestShareName: (name: string) => void;
  messageDraft: string;
  setMessageDraft: (message: string) => void;
  savedMessage: string;
  setSavedMessage: (message: string) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useClientDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("Dashboard page must be inside its protected layout");
  return context;
}

const menuItems = [
  { section: "dashboard", label: "Dashboard", icon: <><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></> },
  { section: "bagikan", label: "Bagikan", icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6m3-3h-6" /></> },
  { section: "ucapan", label: "Ucapan", icon: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /> },
  { section: "acara", label: "Acara", icon: <><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> },
  { section: "bantuan", label: "Bantuan", icon: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" /></> },
] as const;

export function ClientDashboardShell({ children, ...data }: DashboardData & { children: ReactNode }) {
  const pathname = usePathname();
  const base = `/${data.invitation.slug}/dashboard`;
  const section = pathname.slice(base.length).split("/").filter(Boolean)[0] || "dashboard";
  const [guestShareName, setGuestShareName] = useState("");
  const [messageDraft, setMessageDraft] = useState(data.shareMessageTemplate ?? DEFAULT_SHARE_MESSAGE);
  const [savedMessage, setSavedMessage] = useState(data.shareMessageTemplate ?? DEFAULT_SHARE_MESSAGE);
  const totalMessages = data.initialRSVPs.filter(item => Boolean(item.message?.trim())).length;

  return (
    <DashboardContext.Provider value={{ ...data, guestShareName, setGuestShareName, messageDraft, setMessageDraft, savedMessage, setSavedMessage }}>
      <div className={styles.dashboardWrapper}>
        <div className={styles.phoneContainer}>
          <header className={styles.topBar}>
            {section !== "dashboard" ? (
              <Link href={base} className={styles.backButton} aria-label="Kembali ke dashboard">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
                <span>Kembali</span>
              </Link>
            ) : <span />}
            <Link href={base} className={styles.brandLink} aria-label="Ringkasan dashboard InDif Digital">
              <Image src={BRAND.logoPath} alt={BRAND.name} width={120} height={28} className={styles.brandLogo} priority />
            </Link>
            <span className={styles.brandBadge}>Dashboard RSVP</span>
          </header>

          <main id="dashboard-content" className={styles.pageContent}>{children}</main>

          <nav className={styles.bottomNav} aria-label="Navigasi Menu Dashboard">
            <div className={styles.navContainer}>
              {menuItems.map(item => (
                <Link
                  key={item.section}
                  href={item.section === "dashboard" ? base : `${base}/${item.section}`}
                  prefetch
                  className={`${styles.navItem} ${section === item.section ? styles.navItemActive : ""}`}
                  aria-current={section === item.section ? "page" : undefined}
                >
                  <div className={styles.navIconWrapper}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{item.icon}</svg>
                    {item.section === "ucapan" && totalMessages > 0 && <span className={styles.navBadgeCount}>{totalMessages}</span>}
                  </div>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
