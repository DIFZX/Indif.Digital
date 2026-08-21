"use client";

import { useState } from "react";
import type { GiftInfo } from "@/lib/types";

export function GiftCard({ gift }: { gift: GiftInfo }) {
  const [copied, setCopied] = useState(false);
  if (!gift.account_number) return null;

  async function copyAccount() {
    await navigator.clipboard.writeText(gift.account_number ?? "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <section className="section gift-section">
      <p className="eyebrow">Wedding gift</p>
      <h2>Tanda kasih</h2>
      <p>Doa Anda adalah hadiah terindah. Jika berkenan, tanda kasih dapat disampaikan melalui:</p>
      <article className="gift-card">
        <span>{gift.bank ?? "Bank"}</span>
        <strong>{gift.account_number}</strong>
        {gift.account_name && <small>a.n. {gift.account_name}</small>}
        <button className="button outline-dark" type="button" onClick={copyAccount}>
          {copied ? "Nomor tersalin" : "Salin nomor rekening"}
        </button>
      </article>
    </section>
  );
}

