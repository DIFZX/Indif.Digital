import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getSupabase } from "@/lib/supabase";
import {
  TemplateCatalog,
  type CatalogTemplate,
  type TemplateCategory,
} from "./dashboard/template-catalog";
import styles from "./dashboard/dashboard.module.css";

export const metadata: Metadata = {
  title: `${BRAND.name} | Undangan Digital`,
  description: "Temukan undangan digital yang elegan, personal, dan mudah dibagikan dari InDif Digital.",
};

export const dynamic = "force-dynamic";

function getCategoryForSlug(slug: string): TemplateCategory {
  const clean = slug.toLowerCase().trim();
  if (
    clean === "netflix" ||
    clean === "java-vibes" ||
    clean === "sunda-vibes" ||
    clean.includes("netflix") ||
    clean.includes("java") ||
    clean.includes("sunda")
  ) {
    return "spesial";
  }
  if (
    clean === "pink-vibes" ||
    clean === "blue-garden" ||
    clean.includes("pink") ||
    clean.includes("blue")
  ) {
    return "animasi";
  }
  if (
    clean === "greeny-flowers" ||
    clean === "mustard-black" ||
    clean.includes("green") ||
    clean.includes("mustard")
  ) {
    return "minimalis";
  }
  return "minimalis";
}

const fallbackTemplates: CatalogTemplate[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "greeny-flowers",
    name: "Greeny Flowers",
    description: "Nuansa hijau yang lembut, detail bunga yang hangat, dan susunan elegan untuk kisah yang terasa dekat dan personal.",
    thumbnail_path: "/media/mockups/mockup-greeny-flowers.webp",
    preview_path: "/intan-dan-difa?to=Tamu%20Undangan",
    category: "minimalis",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "pink-vibes",
    name: "Pink Vibes",
    description: "Nuansa dusty pink yang romantis, bunga-bunga lembut, dan komposisi modern untuk perayaan yang hangat dan manis.",
    thumbnail_path: "/media/mockups/mockup-pink-vibes.webp",
    preview_path: "/pink-vibes?to=Tamu%20Undangan",
    category: "animasi",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "blue-garden",
    name: "Blue Garden",
    description: "Nuansa biru vintage, detail bunga berlapis, serta aksen emas yang anggun untuk perayaan yang klasik dan berkelas.",
    thumbnail_path: "/media/mockups/mockup-blue-garden.webp",
    preview_path: "/blue-garden?to=Tamu%20Undangan",
    category: "animasi",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    slug: "netflix",
    name: "Netflix",
    description: "Template cinematic bertema serial Netflix dengan pemutar lagu melayang, format trailer & cerita per-episode, dan desain mobile portrait modern.",
    thumbnail_path: "/media/mockups/mockup-netflix.webp",
    preview_path: "/netflix?to=Tamu%20Undangan",
    category: "spesial",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    slug: "mustard-black",
    name: "Mustard Black",
    description: "Template mewah bernuansa matte black & mustard gold dengan bingkai arch lengkung botanis, animasi scroll anggun, dan fitur digital lengkap.",
    thumbnail_path: "/media/mockups/mockup-mustard-black.webp",
    preview_path: "/mustard-black?to=Tamu%20Undangan",
    category: "minimalis",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    slug: "java-vibes",
    name: "Java Vibes",
    description: "Template adat Jawa modern bernuansa Royal Maroon & Emas Keraton dengan motif gunungan 3D, ronce melati berayun, dan fitur digital lengkap.",
    thumbnail_path: "/media/mockups/mockup-java-vibes.webp",
    preview_path: "/java-vibes?to=Tamu%20Undangan",
    category: "spesial",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    slug: "sunda-vibes",
    name: "Sunda Vibes",
    description: "Template adat Sunda modern bernuansa Warm Bronze & Ivory dengan ornamen Mahkota Siger, bingkai lengkung floral, alunan kecapi suling, dan animasi scroll dinamis.",
    thumbnail_path: "/media/mockups/mockup-sunda-vibes.webp",
    preview_path: "/sunda-vibes?to=Tamu%20Undangan",
    category: "spesial",
  },
];

const whatsappUrl = "https://wa.me/6281776396965";

function orderUrl(templateName: string) {
  const message = `Halo InDif Digital, saya tertarik memesan template ${templateName}.`;
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
}

async function getCatalogTemplates(): Promise<CatalogTemplate[]> {
  const supabase = getSupabase();
  let dbTemplates: Omit<CatalogTemplate, "category">[] = [];

  if (supabase) {
    const { data, error } = await supabase
      .from("templates")
      .select("id, slug, name, description, thumbnail_path, preview_path")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      dbTemplates = data;
    }
  }

  if (dbTemplates.length === 0) return fallbackTemplates;

  const combined: CatalogTemplate[] = dbTemplates.map((dbT) => ({
    ...dbT,
    category: getCategoryForSlug(dbT.slug),
  }));

  for (const fallback of fallbackTemplates) {
    const idx = combined.findIndex((t) => t.slug === fallback.slug);
    if (idx === -1) {
      combined.push(fallback);
    } else {
      combined[idx] = {
        ...fallback,
        ...combined[idx],
        thumbnail_path: combined[idx].thumbnail_path || fallback.thumbnail_path,
        preview_path: combined[idx].preview_path || fallback.preview_path,
        category: getCategoryForSlug(combined[idx].slug),
      };
    }
  }

  return combined;
}

export default async function HomePage() {
  const templates = await getCatalogTemplates();

  return (
    <main className={styles.dashboard}>
      {/* Modern Luxury Dark Hero Section */}
      <section className={styles.hero}>
        <nav className={styles.nav} aria-label="Navigasi utama">
          <Link className={styles.brand} href="/" aria-label={`${BRAND.name} beranda`}>
            <Image src={BRAND.logoPath} alt={BRAND.name} width={380} height={140} priority />
          </Link>
          <div className={styles.navRight}>
            <a className={styles.navLink} href="#templates">Template</a>
            {/* Social Media Buttons (Instagram, TikTok, WhatsApp) */}
            <div className={styles.socialButtonsGroup}>
              <a
                className={styles.socialIconBtn}
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram InDif Digital"
                aria-label="Instagram InDif Digital"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.074-1.89-.447-1.488-.616-2.434-2.122-2.508-2.222-.074-.099-.607-.808-.607-1.542 0-.734.385-1.096.522-1.245.137-.149.301-.186.402-.186.101 0 .202.001.29.006.094.004.22-.036.344.263.129.313.441 1.077.48 1.157.039.08.065.174.013.279-.052.105-.078.17-.156.26-.078.09-.163.201-.233.27-.078.077-.16.16-.068.318.092.158.408.673.876 1.09.602.536 1.11.702 1.268.78.158.078.25.069.344-.039.094-.108.402-.468.51-.628.108-.16.216-.134.364-.079.148.056.938.442 1.1.523.162.081.27.121.31.189.04.068.04.394-.104.799z"/>
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.308A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.637 0-3.155-.494-4.423-1.341l-.317-.213-3.076.807.821-3-.232-.369A8.204 8.204 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>
        </nav>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Digital wedding invitation</p>
            <h1>
              Cerita indah,
              <span>disampaikan dengan elegan.</span>
            </h1>
            <p className={styles.lead}>
              Undangan digital yang personal, berkesan, dan siap menemani hari istimewa Anda.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#templates">Lihat template</a>
              <a className={styles.textAction} href={orderUrl("undangan digital")} target="_blank" rel="noreferrer">
                Hubungi kami <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog with Compact Cards (4-col Desktop, 2-col Mobile) */}
      <TemplateCatalog templates={templates} />

      {/* Modern Dark Luxury Footer */}
      <footer className={styles.footer}>
        <Link className={styles.footerBrand} href="/" aria-label={`${BRAND.name} beranda`}>
          <Image src={BRAND.logoPath} alt={BRAND.name} width={360} height={130} />
        </Link>
        <p className={styles.footerTagline}>Undangan digital untuk setiap cerita yang istimewa.</p>
        
        {/* Social Icons in Footer */}
        <div className={styles.footerSocials}>
          <a
            className={styles.footerSocialLink}
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram InDif Digital"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram</span>
          </a>
          <a
            className={styles.footerSocialLink}
            href={BRAND.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok InDif Digital"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.33 6.33 0 0 0 6.34-6.32V8.75a8.28 8.28 0 0 0 4.81 1.52V6.8a4.84 4.84 0 0 1-.9-.11z"/>
            </svg>
            <span>TikTok</span>
          </a>
          <a
            className={styles.footerSocialLink}
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp InDif Digital"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.074-1.89-.447-1.488-.616-2.434-2.122-2.508-2.222-.074-.099-.607-.808-.607-1.542 0-.734.385-1.096.522-1.245.137-.149.301-.186.402-.186.101 0 .202.001.29.006.094.004.22-.036.344.263.129.313.441 1.077.48 1.157.039.08.065.174.013.279-.052.105-.078.17-.156.26-.078.09-.163.201-.233.27-.078.077-.16.16-.068.318.092.158.408.673.876 1.09.602.536 1.11.702 1.268.78.158.078.25.069.344-.039.094-.108.402-.468.51-.628.108-.16.216-.134.364-.079.148.056.938.442 1.1.523.162.081.27.121.31.189.04.068.04.394-.104.799z"/>
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.308A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.637 0-3.155-.494-4.423-1.341l-.317-.213-3.076.807.821-3-.232-.369A8.204 8.204 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" clipRule="evenodd"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>

        <span className={styles.footerCopy}>© 2026 {BRAND.name} — All Rights Reserved</span>
      </footer>
    </main>
  );
}
