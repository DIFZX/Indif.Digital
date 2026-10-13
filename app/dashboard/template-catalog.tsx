"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/media";
import styles from "./dashboard.module.css";

export type TemplateCategory = "animasi" | "spesial" | "minimalis";

export type CatalogTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_path: string | null;
  preview_path: string | null;
  category: TemplateCategory;
};

export type CategoryFilter = "all" | TemplateCategory;

const whatsappUrl = "https://wa.me/6281776396965";

function orderUrl(templateName: string) {
  const message = `Halo InDif Digital, saya tertarik memesan template ${templateName}.`;
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
}

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Semua Template" },
  { id: "spesial", label: "Tema Spesial" },
  { id: "animasi", label: "Tema Animasi" },
  { id: "minimalis", label: "Tema Minimalis" },
];

type PriceInfo = {
  originalPrice: string;
  promoPrice: string;
  discountBadge: string;
};

function getTemplatePriceInfo(slug: string, category: TemplateCategory): PriceInfo {
  if (category === "spesial" || slug === "java-vibes" || slug === "sunda-vibes" || slug === "netflix") {
    return {
      originalPrice: "Rp. 120.000",
      promoPrice: "Rp. 60.000",
      discountBadge: "DISC. 50%",
    };
  }
  if (category === "animasi" || slug === "pink-vibes" || slug === "blue-garden") {
    return {
      originalPrice: "Rp. 100.000",
      promoPrice: "Rp. 50.000",
      discountBadge: "DISC. 50%",
    };
  }
  return {
    originalPrice: "Rp. 70.000",
    promoPrice: "Rp. 35.000",
    discountBadge: "DISC. 50%",
  };
}

function getMockupThumbnail(slug: string, fallbackPath: string | null): string {
  const map: Record<string, string> = {
    "java-vibes": "/media/mockups/mockup-java-vibes.webp",
    "sunda-vibes": "/media/mockups/mockup-sunda-vibes.webp",
    "netflix": "/media/mockups/mockup-netflix.webp",
    "blue-garden": "/media/mockups/mockup-blue-garden.webp",
    "pink-vibes": "/media/mockups/mockup-pink-vibes.webp",
    "mustard-black": "/media/mockups/mockup-mustard-black.webp",
    "greeny-flowers": "/media/mockups/mockup-greeny-flowers.webp",
  };
  return map[slug] || resolveMediaUrl(fallbackPath) || `/media/mockups/mockup-${slug}.webp`;
}

export function TemplateCatalog({ templates }: { templates: CatalogTemplate[] }) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "animasi" || hash === "spesial" || hash === "minimalis") {
        setActiveCategory(hash);
      } else if (hash === "templates" || hash === "semua" || hash === "all") {
        setActiveCategory("all");
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const counts = useMemo(() => {
    return {
      all: templates.length,
      animasi: templates.filter((t) => t.category === "animasi").length,
      spesial: templates.filter((t) => t.category === "spesial").length,
      minimalis: templates.filter((t) => t.category === "minimalis").length,
    };
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === "all") return templates;
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  const selectCategory = (catId: CategoryFilter) => {
    setActiveCategory(catId);
    if (catId === "all") {
      window.history.replaceState(null, "", "#templates");
    } else {
      window.history.replaceState(null, "", `#${catId}`);
    }
  };

  const activeCategoryTitle = useMemo(() => {
    switch (activeCategory) {
      case "spesial":
        return "Koleksi Template Spesial (Adat & Sinematik)";
      case "animasi":
        return "Koleksi Template Animasi Modern";
      case "minimalis":
        return "Koleksi Template Minimalis Elegan";
      default:
        return "Koleksi Pilihan Template Undangan Digital";
    }
  }, [activeCategory]);

  return (
    <section className={styles.templates} id="templates">
      <div id="animasi" className={styles.scrollAnchor} />
      <div id="spesial" className={styles.scrollAnchor} />
      <div id="minimalis" className={styles.scrollAnchor} />

      {/* Modern Section Heading */}
      <div className={styles.sectionHeading}>
        <span className={styles.sectionKicker}>Koleksi Eksklusif</span>
        <h2>{activeCategoryTitle}</h2>
      </div>

      {/* Category Pills Filter Tabs */}
      <div className={styles.categoryMenuWrapper}>
        <div className={styles.categoryMenu} role="tablist" aria-label="Kategori template">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = counts[cat.id];
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                className={`${styles.categoryButton} ${isActive ? styles.categoryButtonActive : ""}`}
                onClick={() => selectCategory(cat.id)}
              >
                <span>{cat.label}</span>
                <span className={styles.categoryCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Templates Grid (4 columns desktop, 2 columns mobile) */}
      <div className={styles.templateGrid}>
        {filteredTemplates.map((template) => {
          const priceInfo = getTemplatePriceInfo(template.slug, template.category);
          const mockupSrc = getMockupThumbnail(template.slug, template.thumbnail_path);

          return (
            <article className={styles.templateCard} key={template.id}>
              {/* Mockup Frame with Red Diagonal Discount Ribbon */}
              <div className={styles.cardImageWrapper}>
                <Image
                  src={mockupSrc}
                  alt={`Mockup template ${template.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={styles.cardMockupImg}
                  priority={template.slug === "java-vibes" || template.slug === "sunda-vibes"}
                />

                {/* Diagonal Ribbon Badge */}
                <div className={styles.discountRibbon}>
                  <span>{priceInfo.discountBadge}</span>
                </div>
              </div>

              {/* Card Body matching reference screenshot */}
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{template.name}</h3>

                <div className={styles.cardPriceBox}>
                  <span className={styles.originalPrice}>{priceInfo.originalPrice}</span>
                  <span className={styles.promoPrice}>{priceInfo.promoPrice}</span>
                </div>

                <div className={styles.cardButtonRow}>
                  {template.preview_path && (
                    <Link
                      className={styles.btnLihatContoh}
                      href={template.preview_path}
                      target="_blank"
                    >
                      Lihat Contoh
                    </Link>
                  )}
                  <a
                    className={styles.btnPesanIcon}
                    href={orderUrl(template.name)}
                    target="_blank"
                    rel="noreferrer"
                    title={`Pesan template ${template.name} via WhatsApp`}
                    aria-label={`Pesan template ${template.name}`}
                  >
                    <span>Pesan</span>
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className={styles.emptyTemplates}>
            <p>Tidak ada template yang ditemukan pada kategori ini.</p>
            <button
              className={styles.primaryAction}
              onClick={() => selectCategory("all")}
              style={{ marginTop: "1rem" }}
            >
              Lihat semua template
            </button>
          </div>
        )}
      </div>

      {/* Floating WhatsApp Quick Contact Button matching punakawandigital.in */}
      <a
        href={orderUrl("undangan digital")}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.floatingWhatsappBtn}
        aria-label="Hubungi WhatsApp InDif Digital"
        title="Konsultasi & Pesan via WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.074-1.89-.447-1.488-.616-2.434-2.122-2.508-2.222-.074-.099-.607-.808-.607-1.542 0-.734.385-1.096.522-1.245.137-.149.301-.186.402-.186.101 0 .202.001.29.006.094.004.22-.036.344.263.129.313.441 1.077.48 1.157.039.08.065.174.013.279-.052.105-.078.17-.156.26-.078.09-.163.201-.233.27-.078.077-.16.16-.068.318.092.158.408.673.876 1.09.602.536 1.11.702 1.268.78.158.078.25.069.344-.039.094-.108.402-.468.51-.628.108-.16.216-.134.364-.079.148.056.938.442 1.1.523.162.081.27.121.31.189.04.068.04.394-.104.799z" />
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.308A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.637 0-3.155-.494-4.423-1.341l-.317-.213-3.076.807.821-3-.232-.369A8.204 8.204 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" clipRule="evenodd" />
        </svg>
      </a>
    </section>
  );
}
