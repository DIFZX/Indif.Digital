import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing">
      <p className="eyebrow">Kisah Kita</p>
      <h1>Undangan yang terasa seperti kalian.</h1>
      <p className="landing-copy">
        Fondasi platform undangan digital dengan konten dari Supabase dan aset media yang tetap ringan di frontend.
      </p>
      <Link className="button" href="/intan-dan-difa?to=Tamu%20Undangan">Lihat undangan contoh</Link>
    </main>
  );
}
