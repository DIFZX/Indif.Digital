"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatPriceInput, getCatalogPriceInfo, getTemplateThumbnail, TEMPLATE_CATEGORY_IDS, TEMPLATE_CATEGORY_LABELS, type ManagedCatalogTemplate } from "@/lib/catalog-settings";
import { type TemplateStatus, TEMPLATE_STATUS_LABELS } from "@/lib/template-status";
import { saveTemplateSettings, type CatalogActionState } from "./actions";
import { AdminIcon } from "./admin-icons";
import styles from "./catalog.module.css";

type Props = { template: ManagedCatalogTemplate; onClose: () => void; onSaved: (message: string) => void };

export function TemplateEditor({ template, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [category, setCategory] = useState(template.category);
  const [price, setPrice] = useState(String(template.price));
  const [promoPrice, setPromoPrice] = useState(template.promo_price === null ? "" : String(template.promo_price));
  const [status, setStatus] = useState<TemplateStatus>(template.catalog_status);
  const [version] = useState(template.updated_at);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [state, formAction, pending] = useActionState(async (previous: CatalogActionState, formData: FormData) => {
    const result = await saveTemplateSettings(previous, formData);
    if (result.success) onSaved(result.message ?? "Pengaturan tersimpan.");
    return result;
  }, {});
  const invalidPromo = price !== "" && promoPrice !== "" && Number(promoPrice) > Number(price);
  const priceInfo = getCatalogPriceInfo(Number(price || 0), promoPrice === "" ? null : Number(promoPrice));

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);

  return (
    <dialog ref={dialogRef} className={styles.editorDialog} aria-labelledby="template-editor-title"
      onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        if (event.target === event.currentTarget && !pending && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) onClose();
      }}>
      <header className={styles.editorHeader}>
        <div><p className={styles.kicker}>Pengaturan katalog</p><h2 id="template-editor-title">Kelola template</h2></div>
        <button type="button" className={styles.iconButton} aria-label="Tutup pengaturan" disabled={pending} onClick={onClose}><AdminIcon name="close" /></button>
      </header>
      <form action={formAction}>
        <input type="hidden" name="templateId" value={template.id} />
        <input type="hidden" name="updatedAt" value={version} />
        <input type="hidden" name="price" value={price} />
        <input type="hidden" name="promoPrice" value={promoPrice} />
        <input type="hidden" name="catalogStatus" value={status} />
        <fieldset className={styles.editorBody} disabled={pending}>
          <div className={styles.editorPreview}>
            <div className={styles.editorImage}><Image src={getTemplateThumbnail(template.slug, template.thumbnail_path)} alt={`Preview ${template.name}`} fill sizes="240px" /></div>
            <span className={styles.categoryBadge}>{TEMPLATE_CATEGORY_LABELS[category]}</span>
            <h3>{template.name}</h3><p className={styles.templateSlug}>/{template.slug}</p>
            <div className={styles.previewPrice}>{priceInfo.originalPrice && <s>{priceInfo.originalPrice}</s>}<strong>{priceInfo.currentPrice}</strong></div>
            {template.preview_path && <a className={styles.previewLink} href={template.preview_path} target="_blank" rel="noopener noreferrer">Lihat contoh <AdminIcon name="external" /></a>}
          </div>
          <div className={styles.editorFields}>
            <section className={styles.settingsSection}>
              <div className={styles.settingsHeading}><h3>Kategori tema</h3><p>Pilih menu tempat template ditampilkan.</p></div>
              <div className={styles.formField}><label htmlFor="template-category">Kategori</label>
                <select id="template-category" name="category" value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
                  {TEMPLATE_CATEGORY_IDS.map((value) => <option key={value} value={value}>{TEMPLATE_CATEGORY_LABELS[value]}</option>)}
                </select>
              </div>
            </section>
            <section className={styles.settingsSection}>
              <div className={styles.settingsHeading}><h3>Harga penjualan</h3><p>Harga ditampilkan dalam rupiah.</p></div>
              <div className={styles.priceFields}>
                <div className={styles.formField}><label htmlFor="template-price">Harga normal</label><div className={styles.moneyInput}><span aria-hidden="true">Rp</span>
                  <input id="template-price" type="text" inputMode="numeric" autoComplete="off" value={formatPriceInput(price)} maxLength={14} required onChange={(event) => setPrice(event.target.value.replace(/\D/g, "").slice(0, 10))} />
                </div></div>
                <div className={styles.formField}><label htmlFor="template-promo-price">Harga promo <small>opsional</small></label><div className={styles.moneyInput}><span aria-hidden="true">Rp</span>
                  <input id="template-promo-price" type="text" inputMode="numeric" autoComplete="off" placeholder="Tanpa promo" value={formatPriceInput(promoPrice)} maxLength={14} aria-invalid={invalidPromo} onChange={(event) => setPromoPrice(event.target.value.replace(/\D/g, "").slice(0, 10))} />
                </div></div>
              </div>
              <p className={invalidPromo ? styles.fieldError : styles.fieldHint}>{invalidPromo ? "Harga promo tidak boleh melebihi harga normal." : "Kosongkan harga promo jika tidak sedang ada diskon."}</p>
            </section>
            <section className={styles.settingsSection}>
              <div className={styles.settingsHeading}><h3>Ketersediaan</h3><span className={styles.statusBadge} data-status={status}>{TEMPLATE_STATUS_LABELS[status]}</span></div>
              {(["maintenance", "in_progress"] as const).map((option) => <div className={styles.switchRow} key={option}>
                <div><span id={`switch-${option}`}>{option === "maintenance" ? "Maintenance" : "Dalam Proses"}</span><small>{option === "maintenance" ? "Sedang dalam perawatan." : "Template masih disiapkan."}</small></div>
                <button type="button" role="switch" aria-checked={status === option} aria-labelledby={`switch-${option}`} className={styles.statusSwitch} onClick={() => setStatus(status === option ? "available" : option)}><span /></button>
              </div>)}
              <p className={styles.fieldHint}>Matikan kedua switch untuk membuka pemesanan.</p>
            </section>
            <section className={styles.archiveSection}>
              {template.is_active ? confirmArchive ? <div className={styles.archiveConfirm}>
                <strong>Hapus dari katalog penjualan?</strong><p>Template masuk ke arsip dan bisa dipulihkan. Undangan pelanggan tetap berjalan.</p>
                <div><button type="button" className={styles.secondaryButton} onClick={() => setConfirmArchive(false)}>Batalkan</button><button type="submit" name="intent" value="archive" className={styles.dangerButton} disabled={invalidPromo || price === ""}>Ya, hapus dari katalog</button></div>
              </div> : <button type="button" className={styles.archiveButton} onClick={() => setConfirmArchive(true)}><AdminIcon name="archive" /> Hapus dari katalog</button>
              : <div className={styles.restorePanel}><p>Template ini sedang diarsipkan.</p><button type="submit" name="intent" value="restore" className={styles.secondaryButton} disabled={invalidPromo || price === ""}><AdminIcon name="archive" /> Pulihkan ke katalog</button></div>}
            </section>
          </div>
        </fieldset>
        {state.error && <p className={styles.formError} role="alert">{state.error}</p>}
        <footer className={styles.editorFooter}><span>Perubahan berlaku setelah disimpan.</span><div>
          <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={pending}>Batal</button>
          <button type="submit" name="intent" value="save" className={styles.primaryButton} disabled={pending || invalidPromo || price === ""}>{pending ? "Menyimpan..." : "Simpan perubahan"}</button>
        </div></footer>
      </form>
    </dialog>
  );
}
