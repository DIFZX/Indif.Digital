import localFont from "next/font/local";

export const sundaDisplayFont = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/cormorant-garamond-italic-latin.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-sunda-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman"],
  adjustFontFallback: "Times New Roman",
});

export const sundaBodyFont = localFont({
  src: "./fonts/manrope-latin.woff2",
  weight: "400 700",
  variable: "--font-sunda-body",
  display: "swap",
  fallback: ["Arial"],
});
