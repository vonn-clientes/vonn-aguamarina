import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { PageHeader } from "@/components/panel/PageHeader";
import { CopyLink } from "@/components/panel/CopyLink";
import { SITE } from "@/lib/site";
import { slugify } from "@/lib/seo";
import type { CatalogItem } from "@/lib/types";

export default async function LinksPage() {
  const membership = await requireMembership();
  const items = await query<CatalogItem>(
    "select * from catalog_items where tenant_id = $1 and active = true and category <> 'Productos' order by category, name",
    [membership.tenant.id],
  );

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
