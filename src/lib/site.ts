// Datos fijos del negocio que no cambian seguido y que el SEO necesita tal
// cual (nombre, dirección, país). Lo que la dueña edita desde el panel
// (textos, WhatsApp, tratamientos) sale de Supabase — ver public-data.ts.

export const SITE = {
  // Slug del cliente en la tabla `tenants` (compartida entre clientes de VONN).
  slug: process.env.NEXT_PUBLIC_DEMO_TENANT_SLUG || "aguamarina",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://aguamarina.vonn.com.ar").replace(/\/$/, ""),
  name: "Aguamarina Estética y Bienestar",
  shortName: "Aguamarina",
  tagline: "Estética y bienestar",
  owner: "Ingrid Schultheis",
  street: "Lorenzo Sartorio 784",
  city: "Concepción del Uruguay",
  region: "Entre Ríos",
  country: "AR",
  // Mientras la web es una muestra para la dueña, NO se indexa. Al lanzar,
  // se pone SITE_INDEXABLE=true en Vercel y se redeploya.
  indexable: process.env.SITE_INDEXABLE === "true",
} as const;

export const FULL_ADDRESS = `${SITE.street}, ${SITE.city}, ${SITE.region}`;

export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  `${SITE.street}, ${SITE.city}, ${SITE.region}, Argentina`
)}&output=embed`;

export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${SITE.name}, ${SITE.street}, ${SITE.city}`
)}`;
