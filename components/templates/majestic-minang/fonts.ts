import localFont from "next/font/local";

export const minangDisplayFont = localFont({
  src: [
    { path: "../sunda-vibes/fonts/cormorant-garamond-latin.woff2", weight: "400 700", style: "normal" },
    { path: "../sunda-vibes/fonts/cormorant-garamond-italic-latin.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-minang-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman"],
  adjustFontFallback: "Times New Roman",
});

export const minangBodyFont = localFont({
  src: "../sunda-vibes/fonts/manrope-latin.woff2",
  weight: "400 700",
  variable: "--font-minang-body",
  display: "swap",
  fallback: ["Arial"],
});
