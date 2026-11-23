import styles from "./feature-highlights.module.css";

interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}

const FEATURES: FeatureItem[] = [
  {
    id: "rsvp",
    badge: "Real-time Update",
    title: "Dashboard RSVP Interaktif",
    description:
      "Kelola daftar kehadiran dan ucapan doa para tamu secara real-time melalui dashboard privat Anda. Tidak perlu repot mencatat satu per satu.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "request",
    badge: "Bebas Request",
    title: "Bebas Request & Kustomisasi",
    description:
      "Tentukan alunan lagu latar favorit, susunan galeri foto prewedding, cerita cinta kalian, hingga rute maps dan rekening amplop digital.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    id: "price",
    badge: "Mulai Rp 35.000",
    title: "Harga Terbaik & Transparan",
    description:
      "Kualitas visual elegan dan fitur lengkap dengan harga mulai Rp 35.000. Sekali bayar, aktif hingga hari H tanpa batasan kuota tamu undangan.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12" />
        <path d="M15 9.5a2.5 2.5 0 0 0-5 0c0 3 5 2 5 5a2.5 2.5 0 0 1-5 0" />
      </svg>
    ),
  },
  {
    id: "sharing",
    badge: "Tanpa Batas Tamu",
    title: "Siap Sebar via WhatsApp",
    description:
      "Tautan undangan otomatis dilengkapi salam personal untuk tiap tamu. Ringan, cepat dimuat, dan tampil proporsional di seluruh smartphone.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
];

export function FeatureHighlights() {
  return (
    <section className={styles.featuresSection} id="kelebihan" aria-labelledby="features-heading">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionKicker}>Kualitas & Layanan</span>
        <h2 id="features-heading" className={styles.sectionTitle}>
          Kelebihan Undangan InDif Digital
        </h2>
        <p className={styles.sectionSubtitle}>
          Semua kemudahan dan estetika yang Anda butuhkan untuk berbagi kabar bahagia dengan hangat dan berkesan.
        </p>
      </div>

      <div className={styles.grid}>
        {FEATURES.map((feat) => {
          const Icon = feat.icon;
          return (
            <div className={styles.card} key={feat.id}>
              <div className={styles.cardTop}>
                <div className={styles.iconCircle}>
                  <Icon className={styles.icon} />
                </div>
                <span className={styles.badge}>{feat.badge}</span>
              </div>
              <h3 className={styles.cardTitle}>{feat.title}</h3>
              <p className={styles.cardDescription}>{feat.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
