import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import { CopyLink } from "@/components/panel/CopyLink";
import { SITE } from "@/lib/site";
import { slugify } from "@/lib/seo";
import type { CatalogItem } from "@/lib/types";

export default async function LinksPage() {
  const membership = await requireMembership();
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("tenant_id", membership.tenant.id)
    .eq("active", true)
    .neq("category", "Productos")
    .order("category")
    .order("name");
  const items = (data as CatalogItem[]) ?? [];

  const rows = [
    { name: "Página principal", url: `${SITE.url}/?utm_source=instagram&utm_medium=bio` },
    ...items.map((i) => ({
      name: i.name,
      url: `${SITE.url}/tratamientos/${slugify(i.name)}?utm_source=instagram&utm_medium=story`,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Links para Instagram"
        description="Copiá el link de un tratamiento y pegalo en tu historia: quien lo toque llega directo a esa página, con el botón para pedir turno por WhatsApp."
      />
      <div className="p-6 sm:p-10 flex flex-col gap-3 max-w-2xl">
        {rows.map((r) => (
          <div key={r.url} className="flex items-center justify-between gap-4 rounded-sm border border-line bg-surface p-4">
            <div className="min-w-0">
              <p className="vonn-text-cuerpo font-bold">{r.name}</p>
              <p className="vonn-text-caption text-ink-muted truncate">{r.url}</p>
            </div>
            <CopyLink url={r.url} />
          </div>
        ))}
      </div>
    </>
  );
}
