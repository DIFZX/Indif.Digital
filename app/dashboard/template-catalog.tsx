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
  { id: "all", label: "Semua" },
  { id: "animasi", label: "Animasi" },
  { id: "spesial", label: "Spesial" },
  { id: "minimalis", label: "Minimalis" },
];

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

  return (
    <section className={styles.templates} id="templates">
      <div id="animasi" className={styles.scrollAnchor} />
      <div id="spesial" className={styles.scrollAnchor} />
      <div id="minimalis" className={styles.scrollAnchor} />

      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Our collection</p>
          <h2>Pilihan template</h2>
        </div>
        <span>{String(filteredTemplates.length).padStart(2, "0")} Template</span>
      </div>

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
              <span className={styles.categoryCount}>
                {String(count).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.templateGrid}>
        {filteredTemplates.map((template, index) => (
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
              {template.slug === "netflix" && (
                <span className={styles.netflixBadge}>Cinematic</span>
              )}
            </div>

            <div className={styles.templateInfo}>
              <p className={styles.templateType}>
                {getCategoryLabel(template.category)}
              </p>
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
                  href={orderUrl(template.name)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pesan sekarang <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>
        ))}

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
