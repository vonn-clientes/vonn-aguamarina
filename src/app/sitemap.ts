import type { MetadataRoute } from "next";
import { getPublicSite } from "@/lib/public-data";
import { SITE } from "@/lib/site";
import { slugify } from "@/lib/seo";
import { GUIAS } from "@/lib/guias";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
  ];

  entries.push({ url: `${SITE.url}/estetica-concepcion-del-uruguay`, lastModified: now, changeFrequency: "monthly", priority: 0.9 });
  entries.push({ url: `${SITE.url}/guias`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
  for (const g of GUIAS) {
    entries.push({ url: `${SITE.url}/guias/${g.slug}`, lastModified: new Date(g.fecha), changeFrequency: "monthly", priority: 0.6 });
  }

  try {
    const site = await getPublicSite();
    if (site && site.products.length > 0) {
      entries.push({ url: `${SITE.url}/tienda`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const p of site?.products ?? []) {
      entries.push({ url: `${SITE.url}/tienda/${slugify(p.name)}`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
    }
    for (const s of site?.services ?? []) {
      entries.push({
        url: `${SITE.url}/tratamientos/${slugify(s.name)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // Si la base no responde, al menos la portada queda en el sitemap.
  }

  return entries;
}
