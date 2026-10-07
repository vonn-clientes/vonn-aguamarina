import type { MetadataRoute } from "next";
import { getPublicSite } from "@/lib/public-data";
import { SITE } from "@/lib/site";
import { slugify } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
  ];

  try {
    const site = await getPublicSite();
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
