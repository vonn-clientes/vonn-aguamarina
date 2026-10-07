import { SITE, FULL_ADDRESS } from "@/lib/site";
import type { CatalogItem, SiteContent } from "@/lib/types";

// "Ondas de choque" -> "ondas-de-choque" (sin tildes ni símbolos): es la
// parte descriptiva de la URL de cada tratamiento.
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Los números argentinos de celular van como 54 9 + característica + número.
export function waDigits(raw: string | null | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54")) return `549${digits.slice(2)}`;
  return `549${digits}`;
}

export function waLink(raw: string | null | undefined, text?: string): string {
  const d = waDigits(raw);
  if (!d) return "#";
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function phoneDisplay(raw: string | null | undefined): string {
  const d = waDigits(raw); // 5493442629618
  if (d.length < 12) return raw ?? "";
  const local = d.slice(3); // 3442629618
  return `+54 9 ${local.slice(0, 4)} ${local.slice(4, 6)}-${local.slice(6)}`;
}

export function groupByCategory(items: CatalogItem[]): [string, CatalogItem[]][] {
  const map = new Map<string, CatalogItem[]>();
  for (const it of items) {
    const key = it.category || "Otros servicios";
    map.set(key, [...(map.get(key) ?? []), it]);
  }
  return [...map.entries()];
}

// Texto corto y único para <meta name="description"> (máx. ~160 caracteres).
export function trimDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

// --- JSON-LD (datos estructurados) ----------------------------------------

export function businessJsonLd(content: SiteContent | null, services: CatalogItem[]) {
  const sameAs = [content?.instagram_url, content?.facebook_url].filter(Boolean);
  const phone = `+${waDigits(content?.whatsapp_number)}`;
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${SITE.url}/#negocio`,
    name: SITE.name,
    url: SITE.url,
    image: `${SITE.url}/logo-aguamarina.png`,
    logo: `${SITE.url}/logo-aguamarina.png`,
    description:
      "Gabinete de estética en Concepción del Uruguay: tratamientos faciales y corporales, aparatología, manicuría y maquillaje, con atención solo con turno previo.",
    telephone: phone.length > 4 ? phone : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.street,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    areaServed: { "@type": "City", name: SITE.city },
    sameAs: sameAs.length ? sameAs : undefined,
    employee: {
      "@type": "Person",
      name: SITE.owner,
      jobTitle: "Cosmetóloga y cosmiatra matriculada",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tratamientos",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          url: `${SITE.url}/tratamientos/${slugify(s.name)}`,
        },
      })),
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#sitio`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: "es-AR",
  };
}

export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function serviceJsonLd(item: CatalogItem) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: item.name,
    description: item.description ?? undefined,
    serviceType: item.category ?? undefined,
    url: `${SITE.url}/tratamientos/${slugify(item.name)}`,
    provider: { "@id": `${SITE.url}/#negocio` },
    areaServed: { "@type": "City", name: SITE.city },
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE.url}${t.path}`,
    })),
  };
}

export const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Necesito turno para ir al gabinete?",
    a: "Sí, la atención es solo con turno previo. Escribinos por WhatsApp, coordinamos el día y el horario y te confirmamos el turno.",
  },
  {
    q: "¿Dónde queda Aguamarina?",
    a: `Estamos en ${FULL_ADDRESS}.`,
  },
  {
    q: "¿Cuánto cuesta cada tratamiento?",
    a: "El valor depende del tratamiento y de la cantidad de sesiones que necesites. Escribinos por WhatsApp y te pasamos el precio actualizado.",
  },
  {
    q: "¿Cuántas sesiones necesito?",
    a: "Depende de cada persona y de cada tratamiento. Te lo vamos a poder decir después de conocer tu caso, por eso conviene consultar primero por WhatsApp.",
  },
  {
    q: "¿Cómo sé qué tratamiento me conviene?",
    a: "Contanos qué querés mejorar o cuidar y te orientamos. En los tratamientos faciales y en los productos se tiene en cuenta tu tipo de piel.",
  },
  {
    q: "¿Qué pasa si no puedo asistir al turno?",
    a: "Avisanos con anticipación por WhatsApp para reprogramarlo. Así otra persona puede aprovechar ese horario.",
  },
];
