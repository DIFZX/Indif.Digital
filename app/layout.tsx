import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kisah Kita — Undangan Digital",
  description: "Undangan digital yang hangat, personal, dan mudah dibagikan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

