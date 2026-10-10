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

function orderUrl(templateName: string, categoryLabel?: string) {
  const categoryNote = categoryLabel ? ` (Kategori ${categoryLabel})` : "";
  const message = `Halo InDif Digital, saya tertarik memesan template ${templateName}${categoryNote}.`;
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
}

const CATEGORY_DEFINITIONS: {
  id: CategoryFilter;
  label: string;
  title: string;
  description: string;
  badgeLabel: string;
  templateList: string;
}[] = [
  {
    id: "all",
    label: "Semua",
    title: "Pilihan Koleksi Template",
    description: "Seluruh pilihan template undangan digital eksklusif InDif Digital dari berbagai konsep desain.",
    badgeLabel: "Koleksi Lengkap",
    templateList: "Animasi, Spesial & Minimalis",
  },
  {
    id: "animasi",
    label: "Animasi",
    title: "Koleksi Template Animasi",
    description: "Template interaktif dengan transisi romantis, gerak visual dinamis, dan pengalaman membaca yang hidup.",
    badgeLabel: "Kategori Animasi",
    templateList: "Pink Vibes, Blue Garden",
  },
  {
    id: "spesial",
    label: "Spesial",
    title: "Koleksi Template Spesial",
    description: "Konsep tematik eksklusif berformat sinematik, trailer serial & storytelling visual modern.",
    badgeLabel: "Kategori Spesial",
    templateList: "Netflix",
  },
  {
    id: "minimalis",
    label: "Minimalis",
    title: "Koleksi Template Minimalis",
    description: "Estetika bersih, modern, dan berkelas dengan tipografi anggun serta sentuhan floral abadi.",
    badgeLabel: "Kategori Minimalis",
    templateList: "Greeny Flowers, Mustard Black",
  },
];

function getCategoryLabel(category: TemplateCategory): string {
  switch (category) {
    case "animasi":
      return "Animasi";
    case "spesial":
      return "Spesial";
    case "minimalis":
      return "Minimalis";
  }
}

function getImageClass(slug: string): string {
  switch (slug) {
    case "pink-vibes":
      return styles.pinkTemplateImage;
    case "blue-garden":
      return styles.blueGardenTemplateImage;
    case "netflix":
      return styles.netflixTemplateImage;
    case "mustard-black":
      return styles.mustardBlackTemplateImage;
    case "greeny-flowers":
      return styles.greenyFlowersTemplateImage;
    default:
      return "";
  }
}

function getCategoryBadge(category: TemplateCategory, slug: string) {
  switch (category) {
    case "animasi":
      return {
        label: "Animasi",
        className: styles.badgeAnimasi,
        tagClass: styles.categoryTagAnimasi,
      };
    case "spesial":
      return {
        label: slug === "netflix" ? "Spesial • Cinematic" : "Spesial",
        className: styles.badgeSpesial,
        tagClass: styles.categoryTagSpesial,
      };
    case "minimalis":
      return {
        label: "Minimalis",
        className: styles.badgeMinimalis,
        tagClass: styles.categoryTagMinimalis,
      };
  }
}

function getFallbackThumbnail(slug: string): string {
  switch (slug) {
    case "netflix":
      return "/media/netflix/1.jpg";
    case "mustard-black":
      return "/media/mustard-black/1.jpg";
    case "blue-garden":
      return "/media/blue-garden/backgrounds/blue-garden-paper-v1.png";
    case "pink-vibes":
      return "/media/elegant/profile-main-v1.jpeg";
    case "greeny-flowers":
    default:
      return "/media/elegant/gallery-couple-v2.png";
  }
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

  const currentCategoryInfo = useMemo(() => {
    return (
      CATEGORY_DEFINITIONS.find((cat) => cat.id === activeCategory) ??
      CATEGORY_DEFINITIONS[0]
    );
  }, [activeCategory]);

  const selectCategory = (catId: CategoryFilter) => {
    setActiveCategory(catId);
    if (catId === "all") {
      window.history.replaceState(null, "", "#templates");
    } else {
      window.history.replaceState(null, "", `#${catId}`);
    }
  };

  return (
    <section className={styles.templates} id="templates">
      {/* Anchor targets so deep links jump nicely */}
      <div id="animasi" className={styles.scrollAnchor} />
      <div id="spesial" className={styles.scrollAnchor} />
      <div id="minimalis" className={styles.scrollAnchor} />

      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Our collection</p>
          <h2>{currentCategoryInfo.title}</h2>
        </div>
        <span>
          {String(filteredTemplates.length).padStart(2, "0")} Template
          {activeCategory !== "all" ? ` ${currentCategoryInfo.label}` : ""}
        </span>
      </div>

      <div className={styles.categoryBar}>
        <div className={styles.categoryMenu} role="tablist" aria-label="Menu Kategori Template">
          {CATEGORY_DEFINITIONS.map((cat) => {
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
                <span className={styles.categoryCount}>
                  {String(count).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.categoryNotice}>
          <div className={styles.categoryNoticeInfo}>
            <h4>{currentCategoryInfo.title}</h4>
            <p>{currentCategoryInfo.description}</p>
          </div>
          <div className={styles.categoryNoticeTag}>
            <span>Isi template:</span>
            <strong>{currentCategoryInfo.templateList}</strong>
          </div>
        </div>
      </div>

      <div className={styles.templateGrid}>
        {filteredTemplates.map((template, index) => {
          const badge = getCategoryBadge(template.category, template.slug);
          const categoryName = getCategoryLabel(template.category);

          return (
            <article className={styles.templateCard} key={template.id}>
              <div className={`${styles.templateImage} ${getImageClass(template.slug)}`}>
                <Image
                  src={resolveMediaUrl(
                    template.thumbnail_path ?? getFallbackThumbnail(template.slug)
                  )}
                  alt={`Preview template ${template.name}`}
                  fill
                  sizes="(max-width: 900px) 100vw, 46vw"
                />
                <span className={styles.templateIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={`${styles.cardBadge} ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              <div className={styles.templateInfo}>
                <div className={styles.templateMetaRow}>
                  <span className={`${styles.categoryTag} ${badge.tagClass}`}>
                    {categoryName}
                  </span>
                  <p className={styles.templateType}>
                    {template.slug === "netflix"
                      ? "Cinematic wedding invitation"
                      : "Wedding invitation"}
                  </p>
                </div>

                <h3>{template.name}</h3>
                <p className={styles.description}>
                  {template.description || "Undangan digital elegan dari InDif Digital."}
                </p>

                <div className={styles.cardActions}>
                  {template.preview_path && (
                    <Link
                      className={styles.previewAction}
                      href={template.preview_path}
                      target="_blank"
                    >
                      Preview <span aria-hidden="true">↗</span>
                    </Link>
                  )}
                  <a
                    className={styles.orderAction}
                    href={orderUrl(template.name, categoryName)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pesan sekarang <span aria-hidden="true">↗</span>
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
    </section>
  );
}
