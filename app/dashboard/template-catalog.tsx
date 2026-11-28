"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCatalogPriceInfo, getTemplateThumbnail, isTemplateCategory, TEMPLATE_CATEGORY_IDS, TEMPLATE_CATEGORY_LABELS, type TemplateCategory } from "@/lib/catalog-settings";
import { type TemplateStatus, TEMPLATE_STATUS_LABELS } from "@/lib/template-status";
import styles from "./dashboard.module.css";

export type { TemplateCategory } from "@/lib/catalog-settings";

export type CatalogTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_path: string | null;
  preview_path: string | null;
  category: TemplateCategory;
  price: number;
  promo_price: number | null;
  catalog_status?: TemplateStatus;
  sort_order?: number | null;
  created_at?: string | null;
};

export type CategoryFilter = "all" | TemplateCategory;

export type CatalogSortOption =
  | "default"
  | "newest"
  | "cheapest"
  | "most_expensive"
  | "biggest_discount"
  | "name_asc";

export type CatalogAvailabilityFilter = "all" | "available" | "promo";

const whatsappUrl = "https://wa.me/6281776396965";

function orderUrl(templateName: string) {
  const message = `Halo InDif Digital, saya tertarik memesan template ${templateName}.`;
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
}

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Semua Template" },
  ...TEMPLATE_CATEGORY_IDS.map(id => ({ id, label: TEMPLATE_CATEGORY_LABELS[id] })),
];

const SORT_OPTIONS: { id: CatalogSortOption; label: string }[] = [
  { id: "default", label: "Rekomendasi" },
  { id: "newest", label: "Terbaru" },
  { id: "cheapest", label: "Termurah" },
  { id: "most_expensive", label: "Termahal" },
  { id: "biggest_discount", label: "Diskon Terbesar" },
  { id: "name_asc", label: "Nama A - Z" },
];

const AVAILABILITY_OPTIONS: { id: CatalogAvailabilityFilter; label: string }[] = [
  { id: "all", label: "Semua Status" },
  { id: "available", label: "Siap Dipesan" },
  { id: "promo", label: "Sedang Promo" },
];

function getEffectivePrice(template: CatalogTemplate) {
  return template.promo_price !== null && template.promo_price < template.price
    ? template.promo_price
    : template.price;
}

function getDiscountRatio(template: CatalogTemplate) {
  if (template.promo_price === null || template.promo_price >= template.price || template.price <= 0) {
    return 0;
  }
  return (template.price - template.promo_price) / template.price;
}

function parseTimestamp(value?: string | null) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isAvailableStatus(template: CatalogTemplate) {
  return (template.catalog_status ?? "available") === "available";
}

function compareTemplatesBySort(
  a: CatalogTemplate,
  b: CatalogTemplate,
  aIdx: number,
  bIdx: number,
  sortBy: CatalogSortOption,
) {
  if (sortBy === "default") return aIdx - bIdx;

  if (sortBy === "newest") {
    const timeA = parseTimestamp(a.created_at);
    const timeB = parseTimestamp(b.created_at);
    if (timeA !== null && timeB !== null && timeB !== timeA) {
      return timeB - timeA;
    }
    const orderDiff = (b.sort_order ?? 0) - (a.sort_order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return bIdx - aIdx;
  }

  if (sortBy === "name_asc") {
    const nameDiff = a.name.localeCompare(b.name, "id");
    return nameDiff !== 0 ? nameDiff : aIdx - bIdx;
  }

  // Price & discount sorts keep purchasable items ahead of unavailable items that hide pricing
  const availDiff = Number(isAvailableStatus(b)) - Number(isAvailableStatus(a));
  if (availDiff !== 0) return availDiff;

  if (sortBy === "cheapest") {
    const priceDiff = getEffectivePrice(a) - getEffectivePrice(b);
    return priceDiff !== 0 ? priceDiff : aIdx - bIdx;
  }

  if (sortBy === "most_expensive") {
    const priceDiff = getEffectivePrice(b) - getEffectivePrice(a);
    return priceDiff !== 0 ? priceDiff : aIdx - bIdx;
  }

  // biggest_discount
  const ratioDiff = getDiscountRatio(b) - getDiscountRatio(a);
  if (ratioDiff !== 0) return ratioDiff;
  const nominalSavingB = b.price - getEffectivePrice(b);
  const nominalSavingA = a.price - getEffectivePrice(a);
  if (nominalSavingB !== nominalSavingA) return nominalSavingB - nominalSavingA;
  return aIdx - bIdx;
}

export function TemplateCatalog({ templates }: { templates: CatalogTemplate[] }) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<CatalogSortOption>("default");
  const [availabilityFilter, setAvailabilityFilter] = useState<CatalogAvailabilityFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterWrapperRef = useRef<HTMLDivElement>(null);
  const filterMenuId = useId();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (isTemplateCategory(hash)) {
        setActiveCategory(hash);
      } else if (hash === "templates" || hash === "semua" || hash === "all") {
        setActiveCategory("all");
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (filterWrapperRef.current && !filterWrapperRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFilterOpen]);

  const availabilityFilteredTemplates = useMemo(() => {
    if (availabilityFilter === "all") return templates;
    if (availabilityFilter === "available") {
      return templates.filter((t) => isAvailableStatus(t));
    }
    return templates.filter((t) => isAvailableStatus(t) && getDiscountRatio(t) > 0);
  }, [templates, availabilityFilter]);

  const counts = useMemo(() => {
    return {
      all: availabilityFilteredTemplates.length,
      animasi: availabilityFilteredTemplates.filter((t) => t.category === "animasi").length,
      spesial: availabilityFilteredTemplates.filter((t) => t.category === "spesial").length,
      minimalis: availabilityFilteredTemplates.filter((t) => t.category === "minimalis").length,
      interactive: availabilityFilteredTemplates.filter((t) => t.category === "interactive").length,
    };
  }, [availabilityFilteredTemplates]);

  const filteredTemplates = useMemo(() => {
    const categoryFiltered =
      activeCategory === "all"
        ? availabilityFilteredTemplates
        : availabilityFilteredTemplates.filter((t) => t.category === activeCategory);

    if (sortBy === "default") return categoryFiltered;

    return categoryFiltered
      .map((item, idx) => ({ item, idx }))
      .sort((left, right) => compareTemplatesBySort(left.item, right.item, left.idx, right.idx, sortBy))
      .map((entry) => entry.item);
  }, [availabilityFilteredTemplates, activeCategory, sortBy]);

  const selectCategory = (catId: CategoryFilter) => {
    setActiveCategory(catId);
    if (catId === "all") {
      window.history.replaceState(null, "", "#templates");
    } else {
      window.history.replaceState(null, "", `#${catId}`);
    }
  };

  const resetSortAndAvailability = () => {
    setSortBy("default");
    setAvailabilityFilter("all");
    setIsFilterOpen(false);
  };

  const hasActiveFilter = sortBy !== "default" || availabilityFilter !== "all";
  const activeSortLabel = SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label;
  const activeAvailLabel = AVAILABILITY_OPTIONS.find((opt) => opt.id === availabilityFilter)?.label;
  const activeFilterBadgeLabel = !hasActiveFilter
    ? null
    : sortBy !== "default" && availabilityFilter !== "all"
      ? `${activeSortLabel} +1`
      : sortBy !== "default"
        ? activeSortLabel
        : activeAvailLabel;

  const filterButtonAriaLabel = hasActiveFilter
    ? `Filter dan urutkan katalog (${activeFilterBadgeLabel})`
    : "Filter dan urutkan katalog";

  const activeCategoryTitle = useMemo(() => {
    switch (activeCategory) {
      case "spesial":
        return "Koleksi Template Spesial (Adat & Sinematik)";
      case "animasi":
        return "Koleksi Template Animasi Modern";
      case "minimalis":
        return "Koleksi Template Minimalis Elegan";
      case "interactive":
        return "Koleksi Undangan Interactive";
      default:
        return "Koleksi Pilihan Template Undangan Digital";
    }
  }, [activeCategory]);

  return (
    <section className={styles.templates} id="templates">
      <div id="animasi" className={styles.scrollAnchor} />
      <div id="spesial" className={styles.scrollAnchor} />
      <div id="minimalis" className={styles.scrollAnchor} />
      <div id="interactive" className={styles.scrollAnchor} />

      {/* Modern Section Heading */}
      <div className={styles.sectionHeading}>
        <span className={styles.sectionKicker}>Koleksi Eksklusif</span>
        <h2>{activeCategoryTitle}</h2>
      </div>

      {/* Filter Trigger (left of Semua Template) + Category Pills Tabs */}
      <div className={styles.catalogControlsBar}>
        <div className={styles.filterControlWrapper} ref={filterWrapperRef}>
          <button
            type="button"
            className={`${styles.filterTriggerButton} ${hasActiveFilter ? styles.filterTriggerButtonActive : ""}`}
            onClick={() => setIsFilterOpen((prev) => !prev)}
            aria-expanded={isFilterOpen}
            aria-haspopup="dialog"
            aria-controls={filterMenuId}
            aria-label={filterButtonAriaLabel}
            title="Filter & urutkan katalog"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="9" cy="6" r="2.1" fill="currentColor" />
              <circle cx="15" cy="12" r="2.1" fill="currentColor" />
              <circle cx="10" cy="18" r="2.1" fill="currentColor" />
            </svg>
            {activeFilterBadgeLabel && (
              <span className={styles.filterActiveLabel}>{activeFilterBadgeLabel}</span>
            )}
          </button>

          {isFilterOpen && (
            <div
              id={filterMenuId}
              className={styles.filterPopover}
              role="dialog"
              aria-label="Filter dan urutkan katalog"
            >
              <div className={styles.filterPopoverHeader}>
                <span>Filter &amp; Urutkan</span>
                {hasActiveFilter && (
                  <button
                    type="button"
                    className={styles.filterResetLink}
                    onClick={resetSortAndAvailability}
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupTitle}>Urutkan Katalog</span>
                <div className={styles.filterOptionsList}>
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`${styles.filterOptionBtn} ${isSelected ? styles.filterOptionBtnActive : ""}`}
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsFilterOpen(false);
                        }}
                        aria-pressed={isSelected}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.filterGroupDivider} />

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupTitle}>Status Katalog</span>
                <div className={styles.filterChipRow}>
                  {AVAILABILITY_OPTIONS.map((opt) => {
                    const isSelected = availabilityFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`${styles.filterChipBtn} ${isSelected ? styles.filterChipBtnActive : ""}`}
                        onClick={() => {
                          setAvailabilityFilter(opt.id);
                          setIsFilterOpen(false);
                        }}
                        aria-pressed={isSelected}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

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
      </div>

      {/* Compact Templates Grid (4 columns desktop, 2 columns mobile) */}
      <div className={styles.templateGrid}>
        {filteredTemplates.map((template) => {
          const status = template.catalog_status ?? "available";
          const isUnavailable = status !== "available";
          const priceInfo = getCatalogPriceInfo(template.price, template.promo_price);
          const mockupSrc = getTemplateThumbnail(template.slug, template.thumbnail_path);

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

                {isUnavailable ? (
                  <span className={styles.inProgressBadge}>{TEMPLATE_STATUS_LABELS[status]}</span>
                ) : priceInfo.discountBadge ? (
                  <div className={styles.discountRibbon}>
                    <span>{priceInfo.discountBadge}</span>
                  </div>
                ) : null}
              </div>

              {/* Card Body matching reference screenshot */}
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{template.name}</h3>

                {isUnavailable ? (
                  <p className={styles.inProgressNote} id={`template-status-${template.id}`}>
                    {status === "maintenance" ? "Sedang dalam perawatan. Pemesanan sementara ditutup." : "Sedang disiapkan. Belum bisa dipesan."}
                  </p>
                ) : (
                  <div className={styles.cardPriceBox}>
                    {priceInfo.originalPrice && <span className={styles.originalPrice}>{priceInfo.originalPrice}</span>}
                    <span className={styles.promoPrice}>{priceInfo.currentPrice}</span>
                  </div>
                )}

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
                  {isUnavailable ? (
                    <button
                      className={styles.btnPesanIcon}
                      type="button"
                      disabled
                      aria-describedby={`template-status-${template.id}`}
                    >
                      Pesan
                    </button>
                  ) : (
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
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className={styles.emptyTemplates}>
            <p>Tidak ada template yang sesuai dengan filter atau kategori ini.</p>
            <button
              type="button"
              className={styles.emptyResetBtn}
              onClick={() => {
                selectCategory("all");
                resetSortAndAvailability();
              }}
            >
              Reset Filter &amp; Tampilkan Semua
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
