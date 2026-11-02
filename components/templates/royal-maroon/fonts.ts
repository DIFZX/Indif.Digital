import localFont from "next/font/local";

export const royalWeddingFont = localFont({
  src: "./fonts/water-brush-latin.woff2",
  variable: "--font-royal-wedding",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  fallback: ["Brush Script MT", "Segoe Script", "cursive"],
});
