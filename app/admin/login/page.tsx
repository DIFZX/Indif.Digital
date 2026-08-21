import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { getAdmin } from "@/lib/admin-auth";
import { loginAdmin } from "./actions";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: `Admin Login | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  required: "Username dan password wajib diisi.",
  invalid: "Username atau password tidak sesuai.",
  unauthorized: "Akun ini tidak memiliki akses admin.",
  unavailable: "Layanan login sedang tidak tersedia.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginBrandPanel}>
        <Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} priority />
        <div>
          <p className={styles.eyebrow}>Private workspace</p>
          <h1>Kelola setiap cerita dalam satu tempat.</h1>
          <p>Pantau undangan, RSVP, dan ucapan pelanggan dengan tampilan yang ringkas.</p>
        </div>
        <span>InDif Digital. / Admin</span>
      </section>

      <section className={styles.loginFormPanel}>
        <form action={loginAdmin} className={styles.loginForm}>
          <p className={styles.eyebrow}>Administrator</p>
          <h2>Selamat datang</h2>
          <p className={styles.loginIntro}>Masuk menggunakan akun admin InDif Digital.</p>

          <label htmlFor="username">Username</label>
          <input id="username" name="username" autoComplete="username" required />

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />

          {error && <p className={styles.loginError} role="alert">{errorMessages[error] ?? errorMessages.invalid}</p>}

          <button type="submit">Masuk ke dashboard <span aria-hidden="true">→</span></button>
          <small>Area ini hanya dapat diakses oleh administrator.</small>
        </form>
      </section>
    </main>
  );
}
