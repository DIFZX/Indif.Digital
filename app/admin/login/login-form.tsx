"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Script from "next/script";
import { loginAdmin } from "./actions";
import styles from "../admin.module.css";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

function SubmitButton({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={!ready || pending}>{pending ? "Memeriksa..." : "Masuk ke CMS"}<span aria-hidden="true">→</span></button>;
}

export function LoginForm({ siteKey, error, configured }: { siteKey?: string; error?: string; configured: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  async function submit(formData: FormData) {
    try {
      await loginAdmin(formData);
    } finally {
      // CAPTCHA tokens are single-use, including failed password attempts.
      setToken("");
      if (widget.current !== null) window.turnstile?.reset(widget.current);
    }
  }

  function renderWidget() {
    if (!siteKey || !container.current || !window.turnstile || widget.current !== null) return;
    widget.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      action: "admin_login",
      theme: "light",
      size: "flexible",
      language: "id",
      "response-field": false,
      callback: (value: string) => { setToken(value); setCaptchaError(false); },
      "expired-callback": () => setToken(""),
      "error-callback": () => { setToken(""); setCaptchaError(true); },
    });
  }

  useEffect(() => () => {
    if (widget.current !== null) window.turnstile?.remove(widget.current);
    widget.current = null;
  }, []);

  return (
    <form action={submit} className={styles.loginForm}>
      <p className={styles.eyebrow}>Admin penjualan</p>
      <h2>Selamat datang</h2>
      <p className={styles.loginIntro}>Masuk untuk mengelola katalog template InDif Digital.</p>
      <label htmlFor="username">Username</label>
      <input id="username" name="username" autoComplete="username" minLength={3} maxLength={40} required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" maxLength={256} required />
      <input name="captchaToken" value={token} type="hidden" />
      {configured && siteKey && <>
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={renderWidget} onError={() => setCaptchaError(true)} />
        <div className={styles.captcha} ref={container} aria-label="Verifikasi keamanan" />
      </>}
      {captchaError && <p className={styles.loginError} role="alert">Verifikasi keamanan gagal dimuat. <button type="button" className={styles.retryCaptcha} onClick={() => { if (widget.current !== null) window.turnstile?.reset(widget.current); else window.location.reload(); }}>Coba lagi</button></p>}
      {!configured && <p className={styles.loginError} role="alert">Login belum diaktifkan. Hubungi pengelola website.</p>}
      {error && <p className={styles.loginError} role="alert">{error}</p>}
      <SubmitButton ready={configured && Boolean(token)} />
      <small>Area khusus admin penjualan. Sesi berakhir setelah 8 jam.</small>
    </form>
  );
}
