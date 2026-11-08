"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCatalogPriceInfo, getTemplateThumbnail, TEMPLATE_CATEGORY_IDS, TEMPLATE_CATEGORY_LABELS, type TemplateCategory, type ManagedCatalogTemplate } from "@/lib/catalog-settings";
import { TEMPLATE_STATUS_LABELS } from "@/lib/template-status";
import { AdminIcon } from "./admin-icons";
import { TemplateEditor } from "./template-editor";
import styles from "./catalog.module.css";

export function TemplateManager({ templates, archived, initialCategory = "all" }: { templates: ManagedCatalogTemplate[]; archived: boolean; initialCategory?: "all" | TemplateCategory }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | TemplateCategory>(initialCategory);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const activeCount = templates.filter((template) => template.is_active).length;
  const selected = templates.find((template) => template.id === selectedId);
  const displayed = templates.filter((template) => template.is_active !== archived && (category === "all" || template.category === category) && template.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <section className={styles.catalogSection} aria-labelledby="catalog-title">
      <div className={styles.sectionTop}><div><h2 id="catalog-title">Koleksi template</h2><p>Pilih template untuk mengatur penjualannya.</p></div>
        <nav className={styles.catalogTabs} aria-label="Filter template">
          <Link href="/admin" aria-current={!archived ? "page" : undefined}>Katalog <span>{activeCount}</span></Link>
          <Link href="/admin?view=archived" aria-current={archived ? "page" : undefined}>Diarsipkan <span>{templates.length - activeCount}</span></Link>
        </nav>
      </div>
      <div className={styles.toolbar}>
        <label className={styles.searchBox}><AdminIcon name="search" /><input type="search" aria-label="Cari template" placeholder="Cari nama template..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <select aria-label="Filter kategori tema" className={styles.categoryFilter} value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
          <option value="all">Semua kategori tema</option>{TEMPLATE_CATEGORY_IDS.map((value) => <option key={value} value={value}>{TEMPLATE_CATEGORY_LABELS[value]}</option>)}
        </select>
        <span className={styles.resultCount}>{displayed.length} template</span>
      </div>
      {notice && <div className={styles.successNotice} role="status"><AdminIcon name="check" /><span>{notice}</span><button type="button" aria-label="Tutup notifikasi" onClick={() => setNotice("")}><AdminIcon name="close" /></button></div>}
      <div className={styles.templateGrid}>
        {displayed.map((template) => {
          const pricing = getCatalogPriceInfo(template.price, template.promo_price);
          return <article className={styles.templateCard} key={template.id} data-archived={!template.is_active}>
            <div className={styles.cardImage}><Image src={getTemplateThumbnail(template.slug, template.thumbnail_path)} alt={`Mockup ${template.name}`} fill sizes="(max-width: 600px) 50vw, (max-width: 1100px) 30vw, 22vw" />
              <span className={styles.statusBadge} data-status={template.is_active ? template.catalog_status : "archived"}>{template.is_active ? TEMPLATE_STATUS_LABELS[template.catalog_status] : "Diarsipkan"}</span>
            </div>
            <div className={styles.cardBody}><h3>{template.name}</h3><p className={styles.cardPrice}><strong>{pricing.currentPrice}</strong>{pricing.originalPrice && <s>{pricing.originalPrice}</s>}</p>
              <div className={styles.cardFooter}><span className={styles.categoryBadge} title={TEMPLATE_CATEGORY_LABELS[template.category]}>{TEMPLATE_CATEGORY_LABELS[template.category].replace("Tema ", "")}</span>
                <button type="button" className={styles.manageButton} aria-label={`Kelola ${template.name}`} onClick={() => { setSelectedId(template.id); setNotice(""); }}><AdminIcon name="settings" /> Kelola</button>
              </div>
            </div>
          </article>;
        })}
      </div>
      {displayed.length === 0 && <div className={styles.emptyState}><AdminIcon name={archived ? "archive" : "search"} /><h3>{search || category !== "all" ? "Template tidak ditemukan" : archived ? "Arsip masih kosong" : "Katalog masih kosong"}</h3><p>{search || category !== "all" ? "Coba nama atau kategori tema lainnya." : archived ? "Template yang dihapus dari katalog akan tampil di sini." : "Template yang tersedia akan tampil di sini."}</p></div>}
      {selected && <TemplateEditor key={selected.id} template={selected} onClose={() => setSelectedId(null)} onSaved={(message) => { setSelectedId(null); setNotice(message); }} />}
    </section>
  );
}
