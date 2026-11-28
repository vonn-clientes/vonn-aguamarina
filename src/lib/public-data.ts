import { query, queryOne } from "@/lib/db";
import type { Tenant, SiteContent, CatalogItem, Promo } from "@/lib/types";
import { SITE } from "@/lib/site";

// Lectura del contenido público. A propósito NO usa las cookies de sesión
// (la sesión vive en lib/session.ts): así las páginas públicas pueden
// generarse estáticas y revalidarse cada tanto, que es lo mejor para la
// velocidad de carga y para el SEO.

export interface PublicSite {
  tenant: Tenant;
  content: SiteContent | null;
  services: CatalogItem[]; // todo lo que no es producto
  products: CatalogItem[];
  promos: Promo[]; // activas y dentro de fecha
}

export const PRODUCT_CATEGORY = "Productos";

export async function getPublicSite(): Promise<PublicSite | null> {
  const tenant = await queryOne<Tenant>(
    "select * from tenants where slug = $1 and status = 'activo'",
    [SITE.slug],
  );
  if (!tenant) return null;

  const [content, catalog, promoRows] = await Promise.all([
    queryOne<SiteContent>("select * from site_content where tenant_id = $1", [tenant.id]),
    query<CatalogItem>(
      "select * from catalog_items where tenant_id = $1 and active = true order by sort_order asc",
      [tenant.id],
    ),
    query<Promo>(
      "select * from promos where tenant_id = $1 and active = true order by sort_order asc",
      [tenant.id],
    ),
  ]);
  // Hora de Argentina: la promo vale hasta el final de su último día.
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
  const promos = promoRows.filter(
    (x) => (!x.starts_on || x.starts_on <= today) && (!x.ends_on || x.ends_on >= today),
  );

  const items = catalog;
  return {
    tenant,
    content,
    services: items.filter((i) => i.category !== PRODUCT_CATEGORY),
    products: items.filter((i) => i.category === PRODUCT_CATEGORY),
    promos,
  };
}
