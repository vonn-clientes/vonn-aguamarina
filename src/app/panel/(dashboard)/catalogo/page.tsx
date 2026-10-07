import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import { CatalogRow } from "@/components/panel/CatalogRow";
import { addCatalogItem } from "./actions";
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
  const field =
    "w-full rounded-sm border border-line bg-canvas px-3 py-2 vonn-text-cuerpo outline-none focus:border-primary";

  return (
    <>
      <PageHeader
        title="Catálogo"
        description="Los productos o servicios que se muestran en tu sitio público."
      />
      <div className="p-6 sm:p-10 flex flex-col gap-8 max-w-3xl">
        {items.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="vonn-text-caption text-ink-muted border-b border-line">
                <th className="pb-2 font-medium">Nombre</th>
                <th className="pb-2 font-medium">Categoría</th>
                <th className="pb-2 font-medium">Precio</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <CatalogRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        )}

        <form action={addCatalogItem} className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 className="vonn-text-subtitulo">Agregar nuevo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="name" placeholder="Nombre" required className={field} />
            <input name="category" placeholder="Categoría (opcional)" className={field} />
            <input name="price" placeholder="Precio" inputMode="decimal" className={field} />
            <input
              name="duration_minutes"
              placeholder="Duración en minutos (solo si es un servicio)"
              inputMode="numeric"
              className={field}
            />
          </div>
          <textarea name="description" placeholder="Descripción breve (opcional)" rows={2} className={field} />
          <button type="submit" className="self-start rounded-pill bg-primary text-white px-6 py-3 vonn-text-cuerpo font-medium">
            Agregar al catálogo
          </button>
        </form>
      </div>
    </>
  );
}
