import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { requireAdmin } from "@/lib/admin-auth";
import { isTemplateStatus } from "@/lib/template-status";
import { isTemplateCategory, type ManagedCatalogTemplate } from "@/lib/catalog-settings";
import { logoutAdmin } from "./actions";
import { AdminIcon } from "./admin-icons";
import { TemplateManager } from "./template-manager";
import styles from "./catalog.module.css";

export const metadata: Metadata = {
  title: "CMS Penjualan | " + BRAND.name,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ view?: string; category?: string }> }) {
  const { supabase, profile } = await requireAdmin();
  const query = await searchParams;
  const archived = query.view === "archived";
  const category = isTemplateCategory(query.category) ? query.category : "all";
  const { data, error } = await supabase.from("templates")
    .select("id, slug, name, thumbnail_path, preview_path, is_active, catalog_status, category, price, promo_price, updated_at")
    .order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  const templates: ManagedCatalogTemplate[] = (data ?? []).map((template) => ({
    ...template,
    catalog_status: isTemplateStatus(template.catalog_status) ? template.catalog_status : "maintenance",
    category: isTemplateCategory(template.category) ? template.category : "minimalis",
  }));
  const visible = templates.filter((template) => template.is_active);
  const available = visible.filter((template) => template.catalog_status === "available").length;
  const metrics = [
    { label: "Di katalog", count: visible.length, icon: "layers" as const },
    { label: "Siap dipesan", count: available, icon: "check" as const },
    { label: "Belum tersedia", count: visible.length - available, icon: "clock" as const },
    { label: "Diarsipkan", count: templates.length - visible.length, icon: "archive" as const },
  ];

  return (
    <main className={styles.adminPage}>
      <aside className={styles.sidebar}>
        <div><Link href="/admin" className={styles.brand}><Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} priority /></Link><p className={styles.sidebarLabel}>Admin penjualan</p></div>
        <nav className={styles.sideNav} aria-label="Navigasi admin">
          <Link href="/admin" aria-current={category === "all" ? "page" : undefined}><AdminIcon name="grid" /> Katalog template</Link>
          <Link href="/admin?category=interactive" aria-current={category === "interactive" ? "page" : undefined}><AdminIcon name="gamepad" /> Interactive</Link>
          <Link href="/" target="_blank" rel="noopener noreferrer"><AdminIcon name="external" /> Website penjualan</Link>
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.userMini}><span className={styles.avatar}>{profile.username.slice(0, 1).toUpperCase()}</span><div><strong>{profile.username}</strong><small>Admin penjualan</small></div></div>
          <form action={logoutAdmin}><button type="submit" className={styles.logoutButton} aria-label="Keluar dari CMS"><AdminIcon name="logout" /><span>Keluar akun</span></button></form>
        </div>
      </aside>
      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <div><p className={styles.kicker}>Workspace / Penjualan</p><h1>Dashboard penjualan</h1><p>Kelola ketersediaan, harga, dan kategori tema.</p></div>
          <div className={styles.headerMeta}><span>Katalog terhubung</span><time dateTime={new Date().toISOString()}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date())}</time></div>
        </header>
        <section className={styles.metrics} aria-label="Ringkasan katalog">{metrics.map((metric) => <article key={metric.label}><span className={styles.metricIcon}><AdminIcon name={metric.icon} /></span><div><small>{metric.label}</small><strong>{metric.count}</strong></div></article>)}</section>
        {error ? <p className={styles.errorNotice} role="alert">Katalog gagal dimuat. Periksa koneksi dan pastikan migrasi harga serta kategori sudah diterapkan.</p>
          : <TemplateManager key={`${archived ? "archived" : "catalog"}-${category}`} templates={templates} archived={archived} initialCategory={category} />}
      </div>
    </main>
  );
}
