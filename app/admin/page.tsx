import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { requireAdmin } from "@/lib/admin-auth";
import { resolveMediaUrl } from "@/lib/media";
import { logoutAdmin, setTemplateVisibility } from "./actions";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: `Admin Dashboard | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ error?: string; status?: string }>;
};

const notices: Record<string, string> = {
  "template-removed": "Template berhasil dihapus dari dashboard publik.",
  "template-restored": "Template berhasil ditampilkan kembali di dashboard publik.",
};

const errors: Record<string, string> = {
  "template-invalid": "Template tidak valid.",
  "template-update": "Status template gagal diubah. Silakan coba kembali.",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { supabase, profile } = await requireAdmin();
  const query = await searchParams;
  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, slug, name, description, thumbnail_path, preview_path, is_active, created_at, sort_order")
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const catalog = templates ?? [];
  const activeCount = catalog.filter((template) => template.is_active).length;
  const hiddenCount = catalog.length - activeCount;

  return (
    <main className={styles.adminPage}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.adminBrand}>
          <Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} priority />
        </Link>
        <nav aria-label="Navigasi admin">
          <Link href="/admin" className={styles.activeNav}><span>01</span> Kelola template</Link>
          <Link href="/" target="_blank"><span>02</span> Website publik</Link>
        </nav>
        <form action={logoutAdmin}>
          <button type="submit">Keluar <span aria-hidden="true">↗</span></button>
        </form>
      </aside>

      <section className={styles.adminContent}>
        <header className={styles.adminHeader}>
          <div>
            <p className={styles.eyebrow}>Admin dashboard</p>
            <h1>Kelola template.</h1>
          </div>
          <time dateTime={new Date().toISOString()}>
            {new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date())}
          </time>
        </header>

        <section className={styles.metrics} aria-label="Ringkasan katalog">
          <article><span>Semua template</span><strong>{catalog.length}</strong><small>Total koleksi tersimpan</small></article>
          <article><span>Ditampilkan</span><strong>{activeCount}</strong><small>Terlihat di website publik</small></article>
          <article className={styles.darkMetric}><span>Disembunyikan</span><strong>{hiddenCount}</strong><small>Dapat dipulihkan kapan saja</small></article>
        </section>

        <section className={styles.responseSection} id="templates">
          <div className={styles.sectionTitle}>
            <div><p className={styles.eyebrow}>Katalog website</p><h2>Daftar template</h2></div>
            <span>Masuk sebagai {profile.username}</span>
          </div>

          {query.status && notices[query.status] && <p className={styles.successNotice}>{notices[query.status]}</p>}
          {query.error && errors[query.error] && <p className={styles.errorNotice}>{errors[query.error]}</p>}
          {error && <p className={styles.errorNotice}>Daftar template gagal dimuat.</p>}

          <div className={styles.adminTemplateGrid}>
            {catalog.map((template, index) => (
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
                    <span className={`${styles.catalogStatus} ${template.is_active ? styles.catalogActive : styles.catalogHidden}`}>
                      {template.is_active ? "Tampil" : "Disembunyikan"}
                    </span>
                    <small>/{template.slug}</small>
                  </div>
                  <h3>{template.name}</h3>
                  <p>{template.description || "Belum ada deskripsi template."}</p>
                  <div className={styles.templateActions}>
                    {template.preview_path && (
                      <Link href={template.preview_path} target="_blank">Preview <span aria-hidden="true">↗</span></Link>
                    )}
                    <form action={setTemplateVisibility}>
                      <input type="hidden" name="templateId" value={template.id} />
                      <input type="hidden" name="nextState" value={template.is_active ? "hidden" : "active"} />
                      <button className={template.is_active ? styles.removeButton : styles.restoreButton} type="submit">
                        {template.is_active ? "Hapus dari dashboard" : "Pulihkan template"}
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
            {!error && catalog.length === 0 && <p className={styles.catalogEmpty}>Belum ada template di katalog.</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
