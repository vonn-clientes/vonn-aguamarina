import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import { PromoRow } from "@/components/panel/PromoRow";
import { PromoFields } from "@/components/panel/PromoForm";
import { addPromo } from "./actions";
import type { Promo } from "@/lib/types";

export default async function PromosPage() {
  const m = await requireMembership();
  const supabase = await createClient();
  const { data } = await supabase.from("promos").select("*").eq("tenant_id", m.tenant.id).order("sort_order");
  const promos = (data as Promo[]) ?? [];

  return (
    <>
      <PageHeader
        title="Promociones"
        description="Los combos y promos que se ven en la web. Podés crear, editar, ocultar o eliminar las que quieras, y ponerles fechas."
      />
      <div className="p-6 sm:p-10 flex flex-col gap-4 max-w-2xl">
        {promos.map((p) => (
          <PromoRow key={p.id} promo={p} />
        ))}
        <form action={addPromo} className="flex flex-col gap-4 border-t border-line pt-6 mt-4">
          <h2 className="vonn-text-subtitulo">Nueva promo</h2>
          <PromoFields />
          <button type="submit" className="self-start rounded-pill bg-primary text-white px-6 py-3 vonn-text-cuerpo font-medium">
            Crear promo
          </button>
        </form>
      </div>
    </>
  );
}
