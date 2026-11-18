import type { NextConfig } from "next";

// Encabezados de seguridad. La política de contenido (CSP) va solo en las páginas públicas:
// el panel usa Supabase desde el navegador y se cubre con el resto de encabezados.
const comunes = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://dkwgqqvhpijmcruehsib.supabase.co https://acdn-us.mitiendanube.com https://*.google-analytics.com https://*.googletagmanager.com https://*.googleusercontent.com https://*.gstatic.com",
  "font-src 'self' data:",
  "connect-src 'self' https://dkwgqqvhpijmcruehsib.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: comunes },
      { source: "/((?!panel|cm|api).*)", headers: [{ key: "Content-Security-Policy", value: csp }] },
    ];
  },
  images: {
    // Las fotos que sube Ingrid viven en Supabase Storage: Next las entrega
    // en WebP y del tamaño justo para cada pantalla (más rápido en el celular).
    remotePatterns: [
      { protocol: "https", hostname: "dkwgqqvhpijmcruehsib.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Fotos oficiales de los productos Natceuticals.
      { protocol: "https", hostname: "acdn-us.mitiendanube.com", pathname: "/stores/004/969/192/**" },
    ],
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
