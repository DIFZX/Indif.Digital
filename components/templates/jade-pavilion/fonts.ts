import localFont from "next/font/local";

export const jadeDisplayFont = localFont({
  src: [
    { path: "../sunda-vibes/fonts/cormorant-garamond-latin.woff2", weight: "400 700", style: "normal" },
    { path: "../sunda-vibes/fonts/cormorant-garamond-italic-latin.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-jade-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman"],
  adjustFontFallback: "Times New Roman",
});

export const jadeBodyFont = localFont({
  src: "../sunda-vibes/fonts/manrope-latin.woff2",
  weight: "400 700",
  variable: "--font-jade-body",
  display: "swap",
  fallback: ["Arial"],
});
