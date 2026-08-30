import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { resolveMediaUrl } from "@/lib/media";
import { getSupabase } from "@/lib/supabase";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: `${BRAND.name} | Undangan Digital`,
  description: "Temukan undangan digital yang elegan, personal, dan mudah dibagikan dari InDif Digital.",
};

export const dynamic = "force-dynamic";

type CatalogTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_path: string | null;
  preview_path: string | null;
};

const fallbackTemplates: CatalogTemplate[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "greeny-flowers",
    name: "Greeny Flowers",
    description: "Nuansa hijau yang lembut, detail bunga yang hangat, dan susunan elegan untuk kisah yang terasa dekat dan personal.",
    thumbnail_path: "/media/elegant/gallery-couple-v2.png",
    preview_path: "/intan-dan-difa?to=Tamu%20Undangan",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "pink-vibes",
    name: "Pink Vibes",
    description: "Nuansa dusty pink yang romantis, bunga-bunga lembut, dan komposisi modern untuk perayaan yang hangat dan manis.",
    thumbnail_path: "/media/elegant/profile-main-v1.jpeg",
    preview_path: "/pink-vibes?to=Tamu%20Undangan",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "blue-garden",
    name: "Blue Garden",
    description: "Nuansa biru vintage, detail bunga berlapis, serta aksen emas yang anggun untuk perayaan yang klasik dan berkelas.",
    thumbnail_path: "/media/blue-garden/backgrounds/blue-garden-paper-v1.png",
    preview_path: "/blue-garden?to=Tamu%20Undangan",
  },
];

const whatsappUrl = "https://wa.me/6281776396965";

function orderUrl(templateName: string) {
  const message = `Halo InDif Digital, saya tertarik memesan template ${templateName}.`;
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
}

async function getCatalogTemplates(): Promise<CatalogTemplate[]> {
  const supabase = getSupabase();
  if (!supabase) return fallbackTemplates;

  const { data, error } = await supabase
    .from("templates")
    .select("id, slug, name, description, thumbnail_path, preview_path")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return fallbackTemplates;
  return data;
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

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroNumber}>01</div>
            <div className={styles.phoneFrame}>
              <Image
                src={resolveMediaUrl("/media/elegant/profile-main-v1.jpeg")}
                alt=""
                fill
                priority
                sizes="(max-width: 760px) 68vw, 320px"
              />
              <div className={styles.phoneShade} />
              <div className={styles.phoneCopy}>
                <small>The Wedding of</small>
                <strong>Intan &amp; Difa</strong>
                <span>12 · 12 · 2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.features} aria-label="Keunggulan layanan">
          <span>Personal</span>
          <span>Elegan</span>
          <span>Mudah dibagikan</span>
        </div>
      </section>

      <section className={styles.templates} id="templates">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Our collection</p>
            <h2>Pilihan template</h2>
          </div>
          <span>{String(templates.length).padStart(2, "0")} Template</span>
        </div>

        <div className={styles.templateGrid}>
          {templates.map((template, index) => (
            <article className={styles.templateCard} key={template.id}>
              <div className={`${styles.templateImage} ${template.slug === "pink-vibes" ? styles.pinkTemplateImage : ""}`}>
                <Image
                  src={resolveMediaUrl(template.thumbnail_path ?? "/media/elegant/gallery-couple-v2.png")}
                  alt={`Preview template ${template.name}`}
                  fill
                  sizes="(max-width: 900px) 100vw, 46vw"
                />
                <span className={styles.templateIndex}>{String(index + 1).padStart(2, "0")}</span>
              </div>

              <div className={styles.templateInfo}>
                <p className={styles.templateType}>Wedding invitation</p>
                <h3>{template.name}</h3>
                <p className={styles.description}>{template.description || "Undangan digital elegan dari InDif Digital."}</p>
                <div className={styles.cardActions}>
                  {template.preview_path && (
                    <Link className={styles.previewAction} href={template.preview_path} target="_blank">
                      Preview <span aria-hidden="true">↗</span>
                    </Link>
                  )}
                  <a className={styles.orderAction} href={orderUrl(template.name)} target="_blank" rel="noreferrer">
                    Pesan sekarang <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
          {templates.length === 0 && (
            <div className={styles.emptyTemplates}>
              <p>Koleksi terbaru sedang kami siapkan.</p>
            </div>
          )}
        </div>
      </section>

      <footer className={styles.footer}>
        <Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} />
        <p>Undangan digital untuk setiap cerita yang istimewa.</p>
        <span>© 2026 {BRAND.name}</span>
      </footer>
    </main>
  );
}
