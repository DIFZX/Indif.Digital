import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { getAdmin } from "@/lib/admin-auth";
import { getAdminLoginConfiguration } from "@/lib/admin-security";
import { LoginForm } from "./login-form";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: `Admin Login | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "Login gagal. Periksa data masuk dan ulangi verifikasi keamanan.",
  "rate-limited": "Terlalu banyak percobaan login. Coba lagi setelah 15 menit.",
  unavailable: "Layanan login sedang tidak tersedia.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const configured = Boolean(getAdminLoginConfiguration());

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginBrandPanel}>
        <Image src={BRAND.logoPath} alt={BRAND.name} width={400} height={150} priority />
        <div>
          <p className={styles.eyebrow}>Private workspace</p>
          <h1>Katalog rapi. Penjualan siap.</h1>
          <p>Atur ketersediaan dan koleksi template dari satu tempat.</p>
        </div>
        <span>InDif Digital. / Admin</span>
      </section>

      <section className={styles.loginFormPanel}>
        <LoginForm configured={configured} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} error={error ? errorMessages[error] ?? errorMessages.invalid : undefined} />
      </section>
    </main>
  );
}
