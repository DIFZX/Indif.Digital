import type { NextConfig } from "next";

const configuredMediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
const mediaBaseUrl = configuredMediaBaseUrl ? new URL(configuredMediaBaseUrl) : null;
const mediaPathPrefix = mediaBaseUrl?.pathname.replace(/\/+$/, "") ?? "";
const mediaOrigin = mediaBaseUrl?.origin;

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${mediaOrigin ? ` ${mediaOrigin}` : ""}`,
  `media-src 'self' blob:${mediaOrigin ? ` ${mediaOrigin}` : ""}`,
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
