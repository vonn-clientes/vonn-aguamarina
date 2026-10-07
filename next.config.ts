import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las fotos que sube Ingrid viven en Supabase Storage: Next las entrega
    // en WebP y del tamaño justo para cada pantalla (más rápido en el celular).
    remotePatterns: [{ protocol: "https", hostname: "dkwgqqvhpijmcruehsib.supabase.co", pathname: "/storage/v1/object/public/**" }],
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
