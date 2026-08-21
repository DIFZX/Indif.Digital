"use client";

import { useState, type FormEvent } from "react";
import type { Greeting } from "@/lib/types";

type Status = { type: "idle" | "success" | "error"; message?: string };

export function Guestbook({ invitationId, initialGreetings }: { invitationId: string; initialGreetings: Greeting[] }) {
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [greetings, setGreetings] = useState<Greeting[]>(initialGreetings);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle" });
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("/api/guest-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, invitationId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Tidak dapat mengirim respons.");
      if (body.greeting) {
        setGreetings((current) => [body.greeting, ...current]);
      }
      form.reset();
      setStatus({ type: "success", message: body.message });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Terjadi kesalahan." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section guest-section" id="ucapan">
      <div>
        <p className="eyebrow">Konfirmasi kehadiran</p>
        <h2>Jadilah bagian dari hari kami</h2>
        <form onSubmit={submit}>
          <label>Nama<input name="guestName" minLength={2} maxLength={80} required /></label>
          <label>Kehadiran<select name="attendance" defaultValue="attending" required><option value="attending">Hadir</option><option value="not_attending">Belum dapat hadir</option></select></label>
          <label>Jumlah tamu<input name="guestCount" type="number" min="1" max="10" defaultValue="1" required /></label>
          <label>Ucapan<textarea name="message" rows={4} maxLength={500} placeholder="Tuliskan doa terbaik Anda" /></label>
          <button className="button" disabled={submitting}>{submitting ? "Mengirim…" : "Kirim respons"}</button>
          {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
        </form>
      </div>
      <div className="greetings">
        <p className="eyebrow">Ucapan hangat</p>
        {greetings.length === 0 && <p>Belum ada ucapan yang ditampilkan.</p>}
        {greetings.map((greeting) => (
          <blockquote key={greeting.id}>
            <p>“{greeting.message}”</p>
            <div className="greeting-author">
              <cite>- {greeting.guest_name}</cite>
              {greeting.attendance === "attending" && (
                <span className="attendance-mark is-attending" aria-label="Hadir" title="Hadir">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="m3.5 8.2 2.8 2.8 6.2-6.2" />
                  </svg>
                </span>
              )}
              {greeting.attendance === "not_attending" && (
                <span className="attendance-mark is-not-attending" aria-label="Belum dapat hadir" title="Belum dapat hadir">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="m4.5 4.5 7 7M11.5 4.5l-7 7" />
                  </svg>
                </span>
              )}
            </div>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
