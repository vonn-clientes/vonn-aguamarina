import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import { CatalogRow } from "@/components/panel/CatalogRow";
import { AddItemForm } from "@/components/panel/AddItemForm";
import type { CatalogItem } from "@/lib/types";

export default async function CatalogoPage() {
  const membership = await requireMembership();
  const supabase = await createClient();

  const { data } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("tenant_id", membership.tenant.id)
    .order("sort_order", { ascending: true });

  const items = (data as CatalogItem[]) ?? [];
  const treatments = items.filter((i) => i.category !== "Productos");
  const products = items.filter((i) => i.category === "Productos");

  const table = (list: CatalogItem[], empty: string) =>
    list.length === 0 ? (
      <p className="vonn-text-cuerpo text-ink-muted">{empty}</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[34rem]">
          <thead>
            <tr className="vonn-text-caption text-ink-muted border-b border-line">
              <th className="pb-2 font-medium">Nombre</th>
              <th className="pb-2 font-medium">Categoría</th>
              <th className="pb-2 font-medium">Precio</th>
              <th className="pb-2 font-medium">En el sitio</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((item) => (
              <CatalogRow key={item.id} item={item} tenantId={membership.tenant.id} />
            ))}
          </tbody>
        </table>
      </div>
    );

  return (
    <>
      <PageHeader title="Tratamientos y productos" description="Todo lo que se ve en la página: lo que ofrecés en el gabinete y lo que vendés en la tienda." />
      <div className="px-5 sm:px-10 pb-10 flex flex-col gap-5 max-w-4xl">
        <section className="ag-pcard">
          <h2>Tratamientos</h2>
          {table(treatments, "Todavía no cargaste tratamientos.")}
        </section>
        <section className="ag-pcard">
          <h2>Productos de la tienda</h2>
          {table(products, "Todavía no cargaste productos.")}
        </section>
        <AddItemForm tenantId={membership.tenant.id} />
      </div>
    </>
  );
}
