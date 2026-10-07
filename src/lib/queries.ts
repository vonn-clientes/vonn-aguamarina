import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { demoTenant, demoSiteContent, demoCatalog } from "@/lib/demo-data";
import type { Tenant, SiteContent, CatalogItem } from "@/lib/types";

// Estas funciones son la única puerta de entrada a los datos del sitio
// público. Si Supabase todavía no está conectado, devuelven los datos de
// ejemplo de demo-data.ts en vez de romper la página.

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (!isSupabaseConfigured()) {
    return slug === demoTenant.slug ? demoTenant : demoTenant; // siempre hay demo en dev
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("status", "activo")
    .maybeSingle();

  return data as Tenant | null;
}

export async function getSiteContent(tenantId: string): Promise<SiteContent | null> {
  if (!isSupabaseConfigured()) return demoSiteContent;

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  return data as SiteContent | null;
}

export async function getCatalog(tenantId: string): Promise<CatalogItem[]> {
  if (!isSupabaseConfigured()) return demoCatalog;

  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  return (data as CatalogItem[]) ?? [];
}
