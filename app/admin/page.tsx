import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { requireAdmin } from "@/lib/admin-auth";
import { resolveMediaUrl } from "@/lib/media";
import { logoutAdmin } from "./actions";
import { TemplateControls } from "./template-controls";
import { isTemplateStatus, TEMPLATE_STATUS_LABELS } from "@/lib/template-status";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: `CMS Penjualan | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { supabase, profile } = await requireAdmin();
  const query = await searchParams;
  const archived = query.view === "archived";
  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, slug, name, description, thumbnail_path, preview_path, is_active, catalog_status, created_at, sort_order")
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const catalog = templates ?? [];
  const visible = catalog.filter((template) => template.is_active);
  const activeCount = visible.filter((template) => template.catalog_status === "available").length;
  const hiddenCount = catalog.length - visible.length;
  const displayed = catalog.filter((template) => Boolean(template.is_active) !== archived);

  return (
    <main className={styles.adminPage}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.adminBrand}>
          <Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} priority />
        </Link>
        <nav aria-label="Navigasi admin">
          <Link href="/admin" className={styles.activeNav}><span>01</span> Katalog penjualan</Link>
          <Link href="/" target="_blank" rel="noopener noreferrer"><span>02</span> Website publik</Link>
        </nav>
        <form action={logoutAdmin}>
          <button type="submit" aria-label="Keluar dari CMS">Keluar <span aria-hidden="true">↗</span></button>
        </form>
      </aside>

      <section className={styles.adminContent}>
        <header className={styles.adminHeader}>
          <div>
            <p className={styles.eyebrow}>CMS Penjualan</p>
            <h1>Kelola katalog.</h1>
          </div>
          <time dateTime={new Date().toISOString()}>
            {new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" }).format(new Date())}
          </time>
        </header>

        <p className={styles.scopeNote}>Atur template yang ditawarkan di website. Perubahan katalog tidak mengubah undangan dan RSVP pelanggan.</p>
        <section className={styles.metrics} aria-label="Ringkasan katalog">
          <article><span>Siap dipesan</span><strong>{activeCount}</strong><small>Template aktif</small></article>
          <article><span>Belum tersedia</span><strong>{visible.length - activeCount}</strong><small>Maintenance / dalam proses</small></article>
          <article className={styles.darkMetric}><span>Diarsipkan</span><strong>{hiddenCount}</strong><small>Dihapus dari katalog penjualan</small></article>
        </section>

        <section className={styles.responseSection} id="templates">
          <div className={styles.sectionTitle}>
            <div><p className={styles.eyebrow}>Katalog website</p><h2>Daftar template</h2></div>
            <span>Masuk sebagai {profile.username}</span>
          </div>

          <nav className={styles.catalogTabs} aria-label="Filter template">
            <Link href="/admin" aria-current={!archived ? "page" : undefined}>Katalog ({visible.length})</Link>
            <Link href="/admin?view=archived" aria-current={archived ? "page" : undefined}>Diarsipkan ({hiddenCount})</Link>
          </nav>
          {error && <p className={styles.errorNotice} role="alert">Daftar template gagal dimuat. Periksa koneksi dan pastikan migrasi CMS sudah diterapkan.</p>}

          <div className={styles.adminTemplateGrid}>
            {displayed.map((template, index) => (
              <article className={`${styles.adminTemplateCard} ${!template.is_active ? styles.inactiveTemplate : ""}`} key={template.id}>
                <div className={styles.adminTemplateImage}>
                  <Image
                    src={resolveMediaUrl(template.thumbnail_path ?? "/media/elegant/gallery-couple-v2.png")}
                    alt={`Thumbnail ${template.name}`}
                    fill
                    sizes="(max-width: 760px) 100vw, 34vw"
                  />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className={styles.adminTemplateInfo}>
                  <div className={styles.templateMeta}>
                    <span className={`${styles.catalogStatus} ${template.is_active && template.catalog_status === "available" ? styles.catalogActive : styles.catalogHidden}`}>
                      {template.is_active ? TEMPLATE_STATUS_LABELS[isTemplateStatus(template.catalog_status) ? template.catalog_status : "maintenance"] : "Diarsipkan"}
                    </span>
                    <small>/{template.slug}</small>
                  </div>
                  <h3>{template.name}</h3>
                  <p>{template.description || "Belum ada deskripsi template."}</p>
                  <div className={styles.templateActions}>
                    {template.preview_path && (
                      <Link href={template.preview_path} target="_blank" rel="noopener noreferrer">Lihat contoh <span aria-hidden="true">↗</span></Link>
                    )}
                  </div>
                  <TemplateControls id={template.id} name={template.name} active={template.is_active}
                    status={isTemplateStatus(template.catalog_status) ? template.catalog_status : "maintenance"} />
                </div>
              </article>
            ))}
            {!error && displayed.length === 0 && <p className={styles.catalogEmpty}>{archived ? "Belum ada template yang diarsipkan." : "Belum ada template di katalog."}</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
