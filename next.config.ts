import type { NextConfig } from "next";

const configuredMediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
const mediaBaseUrl = configuredMediaBaseUrl ? new URL(configuredMediaBaseUrl) : null;
const mediaPathPrefix = mediaBaseUrl?.pathname.replace(/\/+$/, "") ?? "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: mediaBaseUrl
      ? [
          {
            protocol: mediaBaseUrl.protocol === "http:" ? "http" : "https",
            hostname: mediaBaseUrl.hostname,
            port: mediaBaseUrl.port,
            pathname: `${mediaPathPrefix}/media/**`,
          },
        ]
      : [],
    // Saat R2 aktif, gambar dikirim langsung dari domain media agar tidak
    // melewati layanan optimasi dan bandwidth hosting frontend.
    unoptimized: Boolean(mediaBaseUrl),
  },
};

export default nextConfig;
