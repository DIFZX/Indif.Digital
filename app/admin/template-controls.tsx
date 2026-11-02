"use client";

import { useActionState } from "react";
import { type TemplateStatus } from "@/lib/template-status";
import { setTemplateStatus, setTemplateVisibility, type CatalogActionState } from "./actions";
import styles from "./admin.module.css";

const initialState: CatalogActionState = {};

export function TemplateControls({ id, name, status, active }: { id: string; name: string; status: TemplateStatus; active: boolean }) {
  const [statusState, statusAction, statusPending] = useActionState(setTemplateStatus, initialState);
  const [visibilityState, visibilityAction, visibilityPending] = useActionState(setTemplateVisibility, initialState);
  const pending = statusPending || visibilityPending;
  return (
    <div className={styles.controls}>
      {active && <form action={statusAction} className={styles.statusControls}>
        <input type="hidden" name="templateId" value={id} />
        {(["maintenance", "in_progress"] as const).map((option) => (
          <div className={styles.switchRow} key={option}>
            <span id={`${id}-${option}`}>{option === "maintenance" ? "Maintenance" : "Dalam Proses"}</span>
            <button type="submit" name="status" value={status === option ? "available" : option} role="switch"
              aria-checked={status === option} aria-labelledby={`${id}-${option}`} disabled={pending}
              className={styles.statusSwitch}><span /></button>
          </div>
        ))}
        <small>Matikan kedua switch untuk mengaktifkan pemesanan.</small>
      </form>}
      <form action={visibilityAction} onSubmit={(event) => {
        if (active && !window.confirm(`Hapus ${name} dari katalog penjualan? Undangan pelanggan tetap berjalan. Template dapat dipulihkan dari arsip.`)) event.preventDefault();
      }}>
        <input type="hidden" name="templateId" value={id} />
        <input type="hidden" name="nextState" value={active ? "hidden" : "active"} />
        <button className={active ? styles.removeButton : styles.restoreButton} type="submit" disabled={pending}>
          {visibilityPending ? "Menyimpan..." : active ? "Hapus dari katalog" : "Pulihkan template"}
        </button>
      </form>
      {pending && <p className={styles.controlHint} role="status">Menyimpan perubahan...</p>}
      {(statusState.error || visibilityState.error) && <p className={styles.controlError} role="alert">{statusState.error || visibilityState.error}</p>}
      {!pending && (statusState.message || visibilityState.message) && <p className={styles.controlHint} role="status">{statusState.message || visibilityState.message}</p>}
    </div>
  );
}
