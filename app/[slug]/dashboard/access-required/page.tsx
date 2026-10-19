import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import styles from "@/components/client-dashboard/client-dashboard.module.css";

export const metadata: Metadata = {
  title: "Akses Dashboard Diperlukan",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardAccessRequiredPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { error } = await searchParams;

  return (
    <main className={styles.dashboardWrapper}>
      <section className={styles.phoneContainer}>
        <div className={styles.contentArea}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardHeader}>
              <div className={styles.infoCardIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 className={styles.infoCardTitle}>Gunakan link dashboard pribadi</h1>
            </div>

            <p>
              {error === "invalid"
                ? "Link dashboard tidak valid atau sudah berubah."
                : "Dashboard ini tidak memakai username dan password. Buka link pribadi yang diberikan oleh InDif Digital."}
            </p>

            <div className={styles.heroButtons}>
              <Link href={`/${slug}`} className={styles.btnPrimary}>
                Kembali ke undangan
              </Link>
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnSuccess}
              >
                Minta link dashboard
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
