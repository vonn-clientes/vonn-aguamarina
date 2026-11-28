import { query, queryOne } from "@/lib/db";
import { isDbConfigured } from "@/lib/config";
import { demoTenant, demoSiteContent, demoCatalog } from "@/lib/demo-data";
import type { Tenant, SiteContent, CatalogItem } from "@/lib/types";

// Estas funciones son la única puerta de entrada a los datos del sitio
// público. Si la base todavía no está conectada, devuelven los datos de
// ejemplo de demo-data.ts en vez de romper la página.

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (!isDbConfigured()) return demoTenant;
  return queryOne<Tenant>("select * from tenants where slug = $1 and status = 'activo'", [slug]);
}

export async function getSiteContent(tenantId: string): Promise<SiteContent | null> {
  if (!isDbConfigured()) return demoSiteContent;
  return queryOne<SiteContent>("select * from site_content where tenant_id = $1", [tenantId]);
}

export async function getCatalog(tenantId: string): Promise<CatalogItem[]> {
  if (!isDbConfigured()) return demoCatalog;
  return query<CatalogItem>(
    "select * from catalog_items where tenant_id = $1 and active = true order by sort_order asc",
    [tenantId],
  );
}
