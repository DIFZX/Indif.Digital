import { resolveMediaUrl } from "@/lib/media";

export const BRAND = {
  name: "InDif Digital.",
  logoPath: resolveMediaUrl("/media/brand/indif-digital-logo-v1.png"),
  whatsappUrl: "https://wa.me/6281776396965",
  instagramUrl: "https://instagram.com/indif.digital",
  tiktokUrl: "https://tiktok.com/@indif.digital",
} as const;
