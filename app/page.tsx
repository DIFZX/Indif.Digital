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
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Link className={styles.brand} href="/" aria-label={`${BRAND.name} beranda`}>
            <Image src={BRAND.logoPath} alt={BRAND.name} width={240} height={90} priority />
          </Link>
          <div className={styles.headerActions}>
            <a
              className={styles.headerWaBtn}
              href={orderUrl("undangan digital")}
              target="_blank"
              rel="noreferrer"
            >
              <span>Hubungi Kami</span>
            </a>
          </div>
        </div>
      </header>

      <TemplateCatalog templates={templates} />

      <footer className={styles.footer}>
        <Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} />
        <p>Undangan digital untuk setiap cerita yang istimewa.</p>
        <span>© 2026 {BRAND.name}</span>
      </footer>
    </main>
  );
}
