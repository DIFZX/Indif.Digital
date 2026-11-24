"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import styles from "./faq-section.module.css";

interface FaqItem {
  id: string;
  question: string;
  answerParagraphs: string[];
  steps?: { title: string; desc: string }[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "processing-time",
    question: "Berapa hari proses pengerjaan undangan digital?",
    answerParagraphs: [
      "Proses pengerjaan normal hanya membutuhkan waktu 1–2 hari kerja setelah data pernikahan dan foto lengkap dikirimkan.",
      "Jika tanggal pernikahan sudah sangat dekat atau mendesak, kami juga menyediakan opsi pengerjaan kilat/prioritas (hitungan beberapa jam selesai) sehingga undangan dapat segera dibagikan ke keluarga dan kerabat.",
    ],
  },
  {
    id: "payment-safety",
    question: "Apakah pembayarannya aman dan kapan waktu pembayarannya?",
    answerParagraphs: [
      "Sangat aman! Di InDif Digital, pembayaran dilakukan setelah seluruh undangan selesai dibuat, direview oleh kamu dan pasangan, serta sudah siap dipublikasikan.",
      "Kamu bisa mengecek, mencoba semua fitur (seperti navigasi maps, amplop digital, dan form RSVP) terlebih dahulu. Setelah semuanya sesuai dengan keinginanmu, baru kamu menyelesaikan pembayaran.",
    ],
  },
  {
    id: "revisions",
    question: "Apakah bisa revisi jika ada kesalahan data atau pergantian foto?",
    answerParagraphs: [
      "Tentu saja bisa! Kami memberikan layanan bebas revisi untuk perubahan penulisan nama, gelar, alamat lokasi, susunan acara, hingga pergantian foto dan lagu latar sampai hari H.",
      "Kenyamanan dan kepuasan hari bahagiamu adalah prioritas utama kami.",
    ],
  },
  {
    id: "order-steps",
    question: "Bagaimana langkah-langkah memesan undangan digital di InDif Digital?",
    answerParagraphs: [
      "Proses pemesanan sangat praktis dan cepat dengan 5 langkah mudah:",
    ],
    steps: [
      {
        title: "Pilih Template",
        desc: "Pilih desain favoritmu dari katalog template di atas.",
      },
      {
        title: "Hubungi WhatsApp",
        desc: "Klik tombol pesan atau konsultasi langsung dengan admin via WhatsApp.",
      },
      {
        title: "Kirim Data Acara",
        desc: "Isi data mempelai, waktu, tempat acara, dan foto melalui form singkat.",
      },
      {
        title: "Proses Pengerjaan",
        desc: "Tim desainer kami mengerjakan undanganmu dalam waktu 1–2 hari.",
      },
      {
        title: "Review & Bayar",
        desc: "Periksa link undangan, selesaikan pembayaran setelah puas, dan undangan siap disebar!",
      },
    ],
  },
  {
    id: "custom-and-music",
    question: "Apakah bisa request lagu favorit sendiri atau request desain custom?",
    answerParagraphs: [
      "Bisa banget! Kamu bebas me-request lagu romantis favorit apa saja untuk dijadikan musik latar undangan tanpa biaya tambahan.",
      "Jika kamu punya konsep pernikahan impian tersendiri yang belum ada di katalog, kami juga menyediakan layanan Jasa Custom Undangan Khusus hanya 160 rb dengan desain unik sesuai konsepmu.",
    ],
  },
  {
    id: "guest-limits",
    question: "Apakah ada batasan jumlah tamu yang bisa dibagikan?",
    answerParagraphs: [
      "Tidak ada batasan (Unlimited Tamu)! Kamu bisa membagikan link undangan ke ratusan hingga ribuan tamu undangan.",
      "Sistem kami juga mendukung penulisan nama tamu secara otomatis dan personal (misalnya: Kepada Yth. Bapak/Ibu/Saudara/i [Nama Tamu]) sehingga undangan terasa lebih eksklusif dan dekat di hati.",
    ],
  },
  {
    id: "features-included",
    question: "Fitur apa saja yang sudah termasuk di dalam setiap undangan?",
    answerParagraphs: [
      "Setiap paket undangan digital InDif Digital sudah dilengkapi fitur interaktif lengkap tanpa biaya tersembunyi:",
      "Cover buka undangan interaktif, pemutar musik latar otomatis, countdown hitung mundur hari H, navigasi peta Google Maps terintegrasi, galeri foto & love story, amplop digital (rekening bank & QRIS), ucapan & doa online, serta dashboard monitoring RSVP kehadiran tamu secara real-time.",
    ],
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className={styles.faqSection} id="pusat-bantuan" aria-labelledby="faq-title">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionKicker}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Pusat Bantuan &amp; FAQ</span>
        </div>

        <h2 id="faq-title" className={styles.sectionTitle}>
          Pertanyaan yang Sering Diajukan
        </h2>

        <p className={styles.sectionSubtitle}>
          Semua hal yang perlu kamu ketahui tentang proses pengerjaan, keamanan pembayaran, dan fitur undangan digital InDif Digital.
        </p>
      </div>

      <div className={styles.faqList}>
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          const questionId = `faq-q-${item.id}`;
          const answerId = `faq-a-${item.id}`;

          return (
            <div
              key={item.id}
              className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
            >
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className={styles.faqQuestionButton}
                onClick={() => toggleItem(index)}
              >
                <span className={styles.questionText}>{item.question}</span>
                <span
                  className={`${styles.iconWrapper} ${isOpen ? styles.iconWrapperRotated : ""}`}
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  className={styles.faqAnswer}
                >
                  {item.answerParagraphs.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}

                  {item.steps && item.steps.length > 0 && (
                    <ol className={styles.faqStepsList}>
                      {item.steps.map((step, sIdx) => (
                        <li key={sIdx}>
                          <strong>{step.title}:</strong> {step.desc}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Assistance CTA Card */}
      <div className={styles.helpCtaCard}>
        <div className={styles.helpCtaText}>
          <h3 className={styles.helpCtaTitle}>Masih punya pertanyaan lain seputar undanganmu?</h3>
          <p className={styles.helpCtaDesc}>
            Konsultasikan langsung bersama tim InDif Digital. Kami siap membantu mewujudkan undangan pernikahan yang kamu banget!
          </p>
        </div>

        <a
          href={BRAND.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappButton}
          aria-label="Konsultasi langsung via WhatsApp"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.074-1.89-.447-1.488-.616-2.434-2.122-2.508-2.222-.074-.099-.607-.808-.607-1.542 0-.734.385-1.096.522-1.245.137-.149.301-.186.402-.186.101 0 .202.001.29.006.094.004.22-.036.344.263.129.313.441 1.077.48 1.157.039.08.065.174.013.279-.052.105-.078.17-.156.26-.078.09-.163.201-.233.27-.078.077-.16.16-.068.318.092.158.408.673.876 1.09.602.536 1.11.702 1.268.78.158.078.25.069.344-.039.094-.108.402-.468.51-.628.108-.16.216-.134.364-.079.148.056.938.442 1.1.523.162.081.27.121.31.189.04.068.04.394-.104.799z" />
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.308A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.637 0-3.155-.494-4.423-1.341l-.317-.213-3.076.807.821-3-.232-.369A8.204 8.204 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z"
              clipRule="evenodd"
            />
          </svg>
          <span>Tanya Lewat WhatsApp</span>
        </a>
      </div>
    </section>
  );
}
