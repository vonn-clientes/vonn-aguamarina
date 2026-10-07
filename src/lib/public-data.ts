import { createClient } from "@supabase/supabase-js";
import type { Tenant, SiteContent, CatalogItem, Promo } from "@/lib/types";
import { SITE } from "@/lib/site";

// Lectura del contenido público. A propósito NO usa las cookies de sesión
// (a diferencia de lib/supabase/server.ts): así las páginas públicas pueden
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

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getPublicSite(): Promise<PublicSite | null> {
  const supabase = client();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", SITE.slug)
    .eq("status", "activo")
    .maybeSingle();
  if (!tenant) return null;

  const [{ data: content }, { data: catalog }, { data: promoRows }] = await Promise.all([
    supabase.from("site_content").select("*").eq("tenant_id", tenant.id).maybeSingle(),
    supabase
      .from("catalog_items")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("promos")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("active", true)
      .order("sort_order", { ascending: true }),
  ]);
  // Hora de Argentina: la promo vale hasta el final de su último día.
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
  const promos = ((promoRows as Promo[]) ?? []).filter(
    (x) => (!x.starts_on || x.starts_on <= today) && (!x.ends_on || x.ends_on >= today),
  );

  const items = (catalog as CatalogItem[]) ?? [];
  return {
    tenant: tenant as Tenant,
    content: (content as SiteContent) ?? null,
    services: items.filter((i) => i.category !== PRODUCT_CATEGORY),
    products: items.filter((i) => i.category === PRODUCT_CATEGORY),
    promos,
  };
}
