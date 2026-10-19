"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { resolveMediaUrl } from "@/lib/media";
import type { GuestRSVP, Invitation } from "@/lib/types";
import styles from "./client-dashboard.module.css";

type ClientDashboardProps = {
  invitation: Invitation;
  initialRSVPs: GuestRSVP[];
};

type TabType = "dashboard" | "bagikan" | "ucapan" | "acara" | "bantuan";

export function ClientDashboard({ invitation, initialRSVPs }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("all");
  const [guestShareName, setGuestShareName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [rsvps, setRsvps] = useState<GuestRSVP[]>(initialRSVPs);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync with localStorage if any new wishes were submitted on this device
  useEffect(() => {
    try {
      const localKey = `java_vibes_wishes_${invitation.id}`;
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          id?: string;
          guest_name: string;
          message?: string;
          attendance?: any;
          created_at?: string;
        }[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRsvps((prev) => {
            const map = new Map<string, GuestRSVP>();
            prev.forEach((item) => map.set(item.guest_name.toLowerCase().trim(), item));
            parsed.forEach((item) => {
              const key = item.guest_name?.toLowerCase().trim();
              if (key && !map.has(key)) {
                map.set(key, {
                  id: item.id || "local-" + Date.now(),
                  guest_name: item.guest_name,
                  attendance: item.attendance || "attending",
                  guest_count: item.attendance === "not_attending" ? 0 : 1,
                  message: item.message || "",
                  created_at: item.created_at || new Date().toISOString(),
                });
              }
            });
            return Array.from(map.values());
          });
        }
      }
    } catch {}
  }, [invitation.id]);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const coupleNames = `${invitation.bride_short_name} & ${invitation.groom_short_name}`;

  // Countdown Calculation
  useEffect(() => {
    const calculateTime = () => {
      const targetDate = new Date(`${invitation.event_date}T08:00:00+07:00`).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [invitation.event_date]);

  // Toast auto-hide
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Metrics
  const attendingList = useMemo(
    () => rsvps.filter((r) => r.attendance === "attending"),
    [rsvps]
  );
  const notAttendingList = useMemo(
    () => rsvps.filter((r) => r.attendance === "not_attending"),
    [rsvps]
  );
  const unsureList = useMemo(
    () => rsvps.filter((r) => r.attendance === "unsure"),
    [rsvps]
  );

  const totalPax = useMemo(() => {
    return attendingList.reduce((acc, curr) => acc + (curr.guest_count || 1), 0);
  }, [attendingList]);

  // Filtered RSVP list for tab "ucapan"
  const filteredRSVPs = useMemo(() => {
    return rsvps.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        attendanceFilter === "all" ||
        (attendanceFilter === "attending" && item.attendance === "attending") ||
        (attendanceFilter === "not_attending" && item.attendance === "not_attending") ||
        (attendanceFilter === "unsure" && item.attendance === "unsure");

      return matchesSearch && matchesStatus;
    });
  }, [rsvps, searchQuery, attendanceFilter]);

  // Export to Excel / CSV with UTF-8 BOM
  const handleExportExcel = () => {
    try {
      const BOM = "\uFEFF";
      const headers = [
        "No",
        "Nama Tamu",
        "Status Kehadiran",
        "Jumlah Tamu (Pax)",
        "Doa & Pesan Ucapan",
        "Tanggal & Waktu",
      ];

      const rows = rsvps.map((item, index) => {
        const status =
          item.attendance === "attending"
            ? "Hadir"
            : item.attendance === "not_attending"
            ? "Tidak Hadir"
            : "Belum Memilih";
        const pax = item.attendance === "attending" ? item.guest_count || 1 : 0;
        const msg = (item.message || "-").replace(/"/g, '""');
        const formattedDate = new Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(item.created_at));

        return [
          index + 1,
          `"${item.guest_name.replace(/"/g, '""')}"`,
          `"${status}"`,
          pax,
          `"${msg}"`,
          `"${formattedDate}"`,
        ].join(",");
      });

      const csvContent = BOM + [headers.join(","), ...rows].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanSlug = invitation.slug || "wedding";
      link.setAttribute("href", url);
      link.setAttribute("download", `Data_RSVP_${cleanSlug}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Data RSVP berhasil diunduh ke Excel / CSV!");
    } catch {
      showToast("Gagal mengunduh data. Silakan coba kembali.");
    }
  };

  // Personalized Share Link Generation
  const productionBaseUrl = BRAND.websiteUrl || "https://indifdigital.my.id";
  const baseUrl =
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1")
      ? window.location.origin
      : productionBaseUrl;
  const invitationUrl = `${baseUrl}/${invitation.slug}`;
  const personalizedUrl = guestShareName.trim()
    ? `${invitationUrl}?to=${encodeURIComponent(guestShareName.trim())}`
    : invitationUrl;


  const shareTextTemplate = `Kepada Yth.
*${guestShareName.trim() || "[Nama Tamu]"}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari bahagia pernikahan kami:

*${invitation.bride_name} & ${invitation.groom_name}*
📅 ${new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(invitation.event_date))}
📍 ${invitation.venue_name}

Informasi lengkap serta reservasi kehadiran dapat diakses melalui link undangan berikut:
${personalizedUrl}

Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Terima kasih.

Salam hangat,
*${coupleNames}*`;

  // Bulletproof copy to clipboard with async Clipboard API + textarea execCommand fallback
  const copyToClipboard = async (text: string, successLabel: string, key?: string) => {
    let success = false;

    // 1. Try modern async Clipboard API if available
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn("navigator.clipboard.writeText failed, using fallback:", err);
      }
    }

    // 2. Fallback to execCommand('copy') - works in mobile webviews, HTTP, and local networks
    if (!success && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        textarea.style.opacity = "0";
        textarea.setAttribute("readonly", "");
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (fallbackErr) {
        console.error("ExecCommand copy failed:", fallbackErr);
      }
    }

    if (success) {
      showToast(successLabel);
      if (key) {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
      }
    } else {
      showToast("Gagal menyalin otomatis. Silakan salin manual.");
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      {toastMessage && (
        <aside className={styles.toastNotification} role="status">
          <span>✨</span>
          <span>{toastMessage}</span>
        </aside>
      )}

      <div className={styles.phoneContainer}>
        {/* Top Header */}
        <header className={styles.topBar}>
          <Link href={`/${invitation.slug}`} className={styles.brandLink}>
            <Image
              src={BRAND.logoPath}
              alt={BRAND.name}
              width={120}
              height={28}
              className={styles.brandLogo}
              priority
            />
          </Link>
          <div className={styles.brandBadge}>
            <span className={styles.pulseDot} />
            <span>Undangan Online</span>
          </div>
        </header>

        {/* Hero Card with Countdown & Couple Details (Shown on Dashboard tab) */}
        {activeTab === "dashboard" && (
          <section className={styles.heroCard} aria-label="Ringkasan Mempelai">
            <div className={styles.heroBackdrop}>
              <Image
                src={resolveMediaUrl(invitation.cover_path || "/media/java-vibes/1.jpg")}
                alt={`Foto ${coupleNames}`}
                fill
                priority
                className={styles.heroBackdropImage}
              />
              <div className={styles.heroOverlay} />
            </div>

            <div className={styles.heroBody}>
              {/* Live Countdown */}
              <div className={styles.countdownBox} aria-label="Hitung Mundur Acara">
                <div className={styles.countdownItem}>
                  <span className={styles.countdownNum}>{timeLeft.days}</span>
                  <span className={styles.countdownLabel}>Hari</span>
                </div>
                <div className={styles.countdownItem}>
                  <span className={styles.countdownNum}>{timeLeft.hours}</span>
                  <span className={styles.countdownLabel}>Jam</span>
                </div>
                <div className={styles.countdownItem}>
                  <span className={styles.countdownNum}>{timeLeft.minutes}</span>
                  <span className={styles.countdownLabel}>Menit</span>
                </div>
                <div className={styles.countdownItem}>
                  <span className={styles.countdownNum}>{timeLeft.seconds}</span>
                  <span className={styles.countdownLabel}>Detik</span>
                </div>
              </div>

              <h1 className={styles.heroCoupleTitle}>{coupleNames}</h1>
              <p className={styles.heroDateVenue}>
                <span>📅</span>
                {new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(
                  new Date(invitation.event_date)
                )}
              </p>

              <div className={styles.heroButtons}>
                <Link
                  href={`/${invitation.slug}?preview=1`}
                  target="_blank"
                  className={styles.btnPrimary}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Lihat Undangan</span>
                </Link>

                <button
                  type="button"
                  className={styles.btnSuccess}
                  onClick={() => setActiveTab("bagikan")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  <span>Kirim Undangan</span>
                </button>
              </div>
            </div>
          </section>
        )}


        {/* Tab 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className={styles.contentArea}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Statistik Kehadiran</h2>
                <p className={styles.sectionSubtitle}>Ringkasan data tamu undangan Anda secara real-time</p>
              </div>
            </div>

            <div className={styles.statList}>
              {/* Tamu Terdaftar */}
              <div className={styles.statCard} onClick={() => setActiveTab("bagikan")}>
                <div className={styles.statCardLeft}>
                  <span className={styles.statCardTitle}>Tamu Terdaftar</span>
                  <span className={styles.statCardValue}>98</span>
                </div>
                <div className={styles.statCardRight}>
                  <div className={`${styles.statIconBadge} ${styles.badgeAmber}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* Undangan Dibuka */}
              <div className={styles.statCard} onClick={() => setActiveTab("ucapan")}>
                <div className={styles.statCardLeft}>
                  <span className={styles.statCardTitle}>Undangan Dibuka</span>
                  <span className={styles.statCardValue}>85</span>
                </div>
                <div className={styles.statCardRight}>
                  <div className={`${styles.statIconBadge} ${styles.badgeTeal}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* Total Ucapan */}
              <div className={styles.statCard} onClick={() => setActiveTab("ucapan")}>
                <div className={styles.statCardLeft}>
                  <span className={styles.statCardTitle}>Total Ucapan</span>
                  <span className={styles.statCardValue}>{initialRSVPs.length}</span>
                </div>
                <div className={styles.statCardRight}>
                  <div className={`${styles.statIconBadge} ${styles.badgeBlue}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                  </div>
                  <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* Bersedia Hadir */}
              <div className={styles.statCard} onClick={() => { setActiveTab("ucapan"); setAttendanceFilter("attending"); }}>
                <div className={styles.statCardLeft}>
                  <span className={styles.statCardTitle}>Bersedia Hadir</span>
                  <span className={styles.statCardValue}>{attendingList.length}</span>
                </div>
                <div className={styles.statCardRight}>
                  <div className={`${styles.statIconBadge} ${styles.badgeEmerald}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* Belum Bisa Hadir */}
              <div className={styles.statCard} onClick={() => { setActiveTab("ucapan"); setAttendanceFilter("not_attending"); }}>
                <div className={styles.statCardLeft}>
                  <span className={styles.statCardTitle}>Belum Bisa Hadir</span>
                  <span className={styles.statCardValue}>{notAttendingList.length}</span>
                </div>
                <div className={styles.statCardRight}>
                  <div className={`${styles.statIconBadge} ${styles.badgeRose}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* Estimasi Porsi Katering */}
              <div className={styles.statCard} onClick={() => setActiveTab("ucapan")}>
                <div className={styles.statCardLeft}>
                  <span className={styles.statCardTitle}>Estimasi Porsi Katering</span>
                  <span className={styles.statCardValue}>{totalPax} Porsi</span>
                </div>
                <div className={styles.statCardRight}>
                  <div className={`${styles.statIconBadge} ${styles.badgePurple}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                  </div>
                  <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>

            <p className={styles.infoFootnote}>
              Informasi ini mengikuti data tamu dan ucapan terbaru milik undangan Anda.
            </p>
          </div>
        )}

        {/* Tab 2: BAGIKAN (SHARE / GENERATE LINK) */}
        {activeTab === "bagikan" && (
          <div className={styles.contentArea}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Generator Link Tamu</h2>
                <p className={styles.sectionSubtitle}>
                  Kustomisasi nama tamu dan bagikan pesan undangan via WhatsApp
                </p>
              </div>
            </div>

            <div className={styles.shareCard}>
              <div className={styles.formGroup}>
                <label htmlFor="guestInput" className={styles.formLabel}>
                  Nama Tamu / Keluarga:
                </label>
                <input
                  id="guestInput"
                  type="text"
                  placeholder="Contoh: Bapak Bambang & Keluarga"
                  value={guestShareName}
                  onChange={(e) => setGuestShareName(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.previewLinkBox}>
                <div className={styles.previewLinkHeader}>
                  <span className={styles.previewLinkLabel}>Link Undangan Personal:</span>
                  <button
                    type="button"
                    className={`${styles.btnCopyMini} ${copiedKey === "link" ? styles.btnCopiedActive : ""}`}
                    onClick={() => copyToClipboard(personalizedUrl, "Link personal berhasil disalin!", "link")}
                    title="Salin link undangan personal"
                  >
                    {copiedKey === "link" ? (
                      <>
                        <span>✓</span>
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
                <span className={styles.previewLinkText}>{personalizedUrl}</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Pratinjau Pesan WhatsApp:</label>
                <div
                  className={styles.previewMessageBox}
                  onClick={() => copyToClipboard(shareTextTemplate, "Teks undangan dan link berhasil disalin!", "text")}
                  title="Klik untuk menyalin seluruh teks"
                  style={{ cursor: "pointer" }}
                >
                  {shareTextTemplate}
                </div>
              </div>

              <div className={styles.shareBtnGroup}>
                <button
                  type="button"
                  className={`${styles.btnPrimary} ${copiedKey === "text" ? styles.btnCopiedActive : ""}`}
                  onClick={() => copyToClipboard(shareTextTemplate, "Teks undangan dan link berhasil disalin!", "text")}
                >
                  {copiedKey === "text" ? (
                    <>
                      <span>✓</span>
                      <span>Teks Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      <span>Salin Teks</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareTextTemplate)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnSuccess}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.204 8.204 0 0 1-1.26-4.42c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.22 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
                  </svg>
                  <span>Buka WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: UCAPAN & RSVP (Identical to User Screenshot 2 + Elevated) */}
        {activeTab === "ucapan" && (
          <div className={styles.contentArea}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Ucapan & RSVP</h2>
                <p className={styles.sectionSubtitle}>Daftar ucapan doa dan konfirmasi kehadiran para tamu</p>
              </div>
            </div>

            {/* 4 Summary Grid Tiles */}
            <div className={styles.rsvpSummaryGrid}>
              <div className={`${styles.summaryTile} ${styles.tileBlue}`}>
                <span className={styles.summaryTileVal}>{initialRSVPs.length}</span>
                <span className={styles.summaryTileLabel}>Total Ucapan</span>
                <span className={styles.summaryTileBgIcon}>💬</span>
              </div>

              <div className={`${styles.summaryTile} ${styles.tilePurple}`}>
                <span className={styles.summaryTileVal}>{unsureList.length}</span>
                <span className={styles.summaryTileLabel}>Belum memilih</span>
                <span className={styles.summaryTileBgIcon}>⏳</span>
              </div>

              <div className={`${styles.summaryTile} ${styles.tileGreen}`}>
                <span className={styles.summaryTileVal}>{attendingList.length}</span>
                <span className={styles.summaryTileLabel}>Hadir</span>
                <span className={styles.summaryTileBgIcon}>✓</span>
              </div>

              <div className={`${styles.summaryTile} ${styles.tileRed}`}>
                <span className={styles.summaryTileVal}>{notAttendingList.length}</span>
                <span className={styles.summaryTileLabel}>Tidak Hadir</span>
                <span className={styles.summaryTileBgIcon}>✕</span>
              </div>
            </div>

            {/* Action Bar: Search Input & "Unduh Data" (Export to Excel) */}
            <div className={styles.actionBar}>
              <div className={styles.searchAndDownloadRow}>
                <div className={styles.searchInputWrapper}>
                  <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Ketik nama tamu atau isi komentar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                {/* THE "Unduh Data" EXCEL BUTTON (Highlighted with Green Arrow in user screenshot) */}
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className={styles.btnDownloadExcel}
                  title="Unduh seluruh data RSVP ke Microsoft Excel"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Unduh Data</span>
                </button>
              </div>

              {/* Status Kehadiran Filter */}
              <div className={styles.filterRow}>
                <span className={styles.filterLabel}>Status Kehadiran</span>
                <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Semua Status</option>
                  <option value="attending">Hadir ({attendingList.length})</option>
                  <option value="not_attending">Tidak Hadir ({notAttendingList.length})</option>
                  <option value="unsure">Belum Memilih ({unsureList.length})</option>
                </select>
              </div>
            </div>

            {/* List of RSVP & Wishes */}
            <div className={styles.rsvpList}>
              {filteredRSVPs.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Tidak ada data tamu yang cocok dengan pencarian.</p>
                </div>
              ) : (
                filteredRSVPs.map((item) => {
                  const isAttending = item.attendance === "attending";
                  const isNotAttending = item.attendance === "not_attending";
                  const formattedDate = new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.created_at));

                  return (
                    <article key={item.id} className={styles.rsvpItemCard}>
                      <div className={styles.rsvpHeader}>
                        <div className={styles.guestInfoCol}>
                          <h3 className={styles.guestName}>{item.guest_name}</h3>
                          <div className={styles.rsvpMeta}>
                            <span
                              className={`${styles.attendancePill} ${
                                isAttending
                                  ? styles.pillHadir
                                  : isNotAttending
                                  ? styles.pillTidakHadir
                                  : styles.pillBelum
                              }`}
                            >
                              {isAttending ? (
                                <>
                                  <span>✓</span>
                                  <span>Hadir {item.guest_count > 1 ? `(${item.guest_count} orang)` : ""}</span>
                                </>
                              ) : isNotAttending ? (
                                <>
                                  <span>✕</span>
                                  <span>Tidak Hadir</span>
                                </>
                              ) : (
                                <span>Belum Memilih</span>
                              )}
                            </span>
                            <span className={styles.rsvpTime}>{formattedDate}</span>
                          </div>
                        </div>

                        <div className={styles.rsvpActionsRow}>
                          <button
                            type="button"
                            className={`${styles.btnReplyAction} ${copiedKey === `reply-${item.id}` ? styles.btnCopiedActive : ""}`}
                            onClick={() => {
                              copyToClipboard(
                                `Terima kasih banyak atas doa dan ucapan hangatnya untuk kami, ${item.guest_name}! Semoga rezeki dan kebaikan selalu tercurah untuk panjenengan sekeluarga 🙏✨ - ${coupleNames}`,
                                `Balasan untuk ${item.guest_name} berhasil disalin!`,
                                `reply-${item.id}`
                              );
                            }}
                            title="Salin pesan balasan ucapan"
                          >
                            <span>{copiedKey === `reply-${item.id}` ? "✓ Tersalin" : "Balas"}</span>
                          </button>
                        </div>
                      </div>

                      {item.message ? (
                        <div className={styles.guestMessageBubble}>
                          <p style={{ margin: 0 }}>{item.message}</p>
                        </div>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 4: INFO ACARA & AMPLOP */}
        {activeTab === "acara" && (
          <div className={styles.contentArea}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Rundown & Lokasi</h2>
                <p className={styles.sectionSubtitle}>Detail acara pernikahan dan rekening hadiah digital</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <div className={styles.infoCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className={styles.infoCardTitle}>Waktu Acara</h3>
              </div>
              <div className={styles.infoDetails}>
                <div><strong>Akad Nikah:</strong> {invitation.ceremony_time}</div>
                <div><strong>Resepsi:</strong> {invitation.reception_time}</div>
                <div><strong>Tanggal:</strong> {new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(invitation.event_date))}</div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <div className={styles.infoCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className={styles.infoCardTitle}>Lokasi & Venue</h3>
              </div>
              <div className={styles.infoDetails}>
                <div><strong>{invitation.venue_name}</strong></div>
                <div>{invitation.venue_address}</div>
                {invitation.maps_url && (
                  <div style={{ marginTop: "8px" }}>
                    <a
                      href={invitation.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnPrimary}
                      style={{ padding: "8px 14px", fontSize: "0.8rem", width: "fit-content" }}
                    >
                      Buka Google Maps ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            {invitation.gift_info && (
              <div className={styles.infoCard}>
                <div className={styles.infoCardHeader}>
                  <div className={styles.infoCardIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <h3 className={styles.infoCardTitle}>Rekening Hadiah / Amplop</h3>
                </div>
                <div className={styles.bankBox}>
                  <div className={styles.bankInfo}>
                    <span className={styles.bankName}>{invitation.gift_info.bank || "BCA"}</span>
                    <span className={styles.bankNumber}>{invitation.gift_info.account_number || "-"}</span>
                    <span className={styles.bankOwner}>a.n {invitation.gift_info.account_name || coupleNames}</span>
                  </div>
                  {invitation.gift_info.account_number && (
                    <button
                      type="button"
                      className={`${styles.btnReplyAction} ${copiedKey === "bank" ? styles.btnCopiedActive : ""}`}
                      onClick={() => copyToClipboard(invitation.gift_info.account_number || "", "Nomor rekening berhasil disalin!", "bank")}
                    >
                      {copiedKey === "bank" ? "✓ Tersalin!" : "Salin"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: BANTUAN */}
        {activeTab === "bantuan" && (
          <div className={styles.contentArea}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Pusat Bantuan</h2>
                <p className={styles.sectionSubtitle}>Tim InDif Digital siap membantu kelancaran undangan Anda</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <div className={`${styles.infoCardIcon} ${styles.badgeEmerald}`} style={{ color: "#FFF" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.infoCardTitle}>Customer Support WhatsApp</h3>
                  <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Respon Cepat 09.00 - 21.00 WIB</span>
                </div>
              </div>
              <p style={{ margin: "4px 0 12px", fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                Butuh bantuan mengubah foto, mengganti musik latar, revisi teks akad/resepsi, atau kendala teknis undangan digital Anda?
              </p>
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnSuccess}
              >
                Hubungi Kami via WhatsApp ↗
              </a>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>Tips Mengundang Tamu</h3>
              <ul style={{ margin: "4px 0", paddingLeft: "20px", fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
                <li>Gunakan tab <strong>Bagikan</strong> untuk menuliskan nama tamu secara khusus.</li>
                <li>Tamu yang mendapat link personal akan merasa lebih dihargai dan antusias hadir.</li>
                <li>Data konfirmasi tamu dapat Anda unduh ke format Excel kapan saja melalui tombol <strong>Unduh Data</strong> pada tab <strong>Ucapan</strong>.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar (5 Tabs) */}
        <nav className={styles.bottomNav} aria-label="Navigasi Menu Dashboard">
          <div className={styles.navContainer}>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === "dashboard" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <div className={styles.navIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </div>
              <span className={styles.navLabel}>Dashboard</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeTab === "bagikan" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("bagikan")}
            >
              <div className={styles.navIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <span className={styles.navLabel}>Bagikan</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeTab === "ucapan" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("ucapan")}
            >
              <div className={styles.navIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
                {initialRSVPs.length > 0 && (
                  <span className={styles.navBadgeCount}>{initialRSVPs.length}</span>
                )}
              </div>
              <span className={styles.navLabel}>Ucapan</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeTab === "acara" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("acara")}
            >
              <div className={styles.navIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className={styles.navLabel}>Acara</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeTab === "bantuan" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("bantuan")}
            >
              <div className={styles.navIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <span className={styles.navLabel}>Bantuan</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
