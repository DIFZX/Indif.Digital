import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getSupabase } from "@/lib/supabase";
import {
  TemplateCatalog,
  type CatalogTemplate,
  type TemplateCategory,
} from "./template-catalog";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: `${BRAND.name} | Undangan Digital`,
  description: "Temukan undangan digital yang elegan, personal, dan mudah dibagikan dari InDif Digital.",
};

export const dynamic = "force-dynamic";

function getCategoryForSlug(slug: string): TemplateCategory {
  const clean = slug.toLowerCase().trim();
  if (clean === "pink-vibes" || clean === "blue-garden" || clean.includes("pink") || clean.includes("blue")) {
    return "animasi";
  }
  if (clean === "netflix" || clean.includes("netflix")) {
    return "spesial";
  }
  if (clean === "greeny-flowers" || clean === "mustard-black" || clean.includes("green") || clean.includes("mustard")) {
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
    thumbnail_path: "/media/elegant/gallery-couple-v2.png",
    preview_path: "/intan-dan-difa?to=Tamu%20Undangan",
    category: "minimalis",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "pink-vibes",
    name: "Pink Vibes",
    description: "Nuansa dusty pink yang romantis, bunga-bunga lembut, dan komposisi modern untuk perayaan yang hangat dan manis.",
    thumbnail_path: "/media/elegant/profile-main-v1.jpeg",
    preview_path: "/pink-vibes?to=Tamu%20Undangan",
    category: "animasi",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "blue-garden",
    name: "Blue Garden",
    description: "Nuansa biru vintage, detail bunga berlapis, serta aksen emas yang anggun untuk perayaan yang klasik dan berkelas.",
    thumbnail_path: "/media/blue-garden/backgrounds/blue-garden-paper-v1.png",
    preview_path: "/blue-garden?to=Tamu%20Undangan",
    category: "animasi",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    slug: "netflix",
    name: "Netflix",
    description: "Template cinematic bertema serial Netflix dengan pemutar lagu melayang, format trailer & cerita per-episode, dan desain mobile portrait modern.",
    thumbnail_path: "/media/netflix/1.jpg",
    preview_path: "/netflix?to=Tamu%20Undangan",
    category: "spesial",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    slug: "mustard-black",
    name: "Mustard Black",
    description: "Template mewah bernuansa matte black & mustard gold dengan bingkai arch lengkung botanis, animasi scroll anggun, dan fitur digital lengkap.",
    thumbnail_path: "/media/mustard-black/1.jpg",
    preview_path: "/mustard-black?to=Tamu%20Undangan",
    category: "minimalis",
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

export default async function DashboardPage() {
  const templates = await getCatalogTemplates();

  return (
    <main className={styles.dashboard}>
      <section className={styles.hero}>
        <nav className={styles.nav} aria-label="Navigasi utama">
          <Link className={styles.brand} href="/dashboard" aria-label={`${BRAND.name} beranda`}>
            <Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} priority />
          </Link>
          <a className={styles.navLink} href="#templates">Template</a>
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

      <TemplateCatalog templates={templates} />

      <footer className={styles.footer}>
        <Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} />
        <p>Undangan digital untuk setiap cerita yang istimewa.</p>
        <span>© 2026 {BRAND.name}</span>
      </footer>
    </main>
  );
}
