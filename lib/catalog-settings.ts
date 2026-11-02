import { resolveMediaUrl } from "@/lib/media";
import type { TemplateStatus } from "@/lib/template-status";

export const TEMPLATE_CATEGORY_IDS = ["spesial", "animasi", "minimalis"] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORY_IDS)[number];
export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  spesial: "Tema Spesial", animasi: "Tema Animasi", minimalis: "Tema Minimalis",
};
export const MAX_TEMPLATE_PRICE = 1_000_000_000;
const numberFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export type ManagedCatalogTemplate = {
  id: string;
  slug: string;
  name: string;
  thumbnail_path: string | null;
  preview_path: string | null;
  is_active: boolean;
  catalog_status: TemplateStatus;
  category: TemplateCategory;
  price: number;
  promo_price: number | null;
  updated_at: string;
};

export function isTemplateCategory(value: unknown): value is TemplateCategory {
  return TEMPLATE_CATEGORY_IDS.some((category) => category === value);
}

export function formatRupiah(value: number) {
  return `Rp ${numberFormatter.format(value)}`;
}

export function formatPriceInput(value: string) {
  return value === "" ? "" : numberFormatter.format(Number(value));
}

export function getCatalogPriceInfo(price: number, promoPrice: number | null) {
  const discounted = promoPrice !== null && promoPrice < price;
  return {
    currentPrice: formatRupiah(discounted ? promoPrice : price),
    originalPrice: discounted ? formatRupiah(price) : null,
    discountBadge: discounted && price > 0 ? `DISC. ${percentFormatter.format((price - promoPrice) / price * 100)}%` : null,
  };
}

export function getTemplateThumbnail(slug: string, fallbackPath: string | null) {
  const mockups: Record<string, string> = {
    "java-vibes": "/media/mockups/mockup-java-vibes.webp",
    "royal-maroon": "/media/mockups/mockup-royal-maroon-v2.webp",
    "blush-rose": "/media/mockups/mockup-blush-rose.webp",
    "sunda-vibes": "/media/mockups/mockup-sunda-vibes-v4-1.webp",
    netflix: "/media/mockups/mockup-netflix.webp",
    "blue-garden": "/media/mockups/mockup-blue-garden.webp",
    "pink-vibes": "/media/mockups/mockup-pink-vibes.webp",
    "mustard-black": "/media/mockups/mockup-mustard-black.webp",
    "greeny-flowers": "/media/mockups/mockup-greeny-flowers.webp",
  };
  return mockups[slug] || resolveMediaUrl(fallbackPath) || "/media/elegant/gallery-couple-v2.png";
}
