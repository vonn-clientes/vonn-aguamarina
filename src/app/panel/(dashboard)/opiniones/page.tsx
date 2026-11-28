import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { PageHeader } from "@/components/panel/PageHeader";
import { ReviewRow } from "@/components/panel/ReviewRow";
import type { Review } from "@/lib/types";

export default async function OpinionesPage() {
  const m = await requireMembership();
  const [reviews, items] = await Promise.all([
    query<Review>("select * from reviews where tenant_id = $1 order by created_at desc", [m.tenant.id]),
    query<{ id: string; name: string }>("select id, name from catalog_items where tenant_id = $1", [m.tenant.id]),
  ]);
  const names = new Map(items.map((i) => [i.id, i.name]));
  return (
    <>
      <PageHeader
        title="Opiniones"
        description="Lo que cuentan tus clientes en cada tratamiento y producto. Podés ocultar o eliminar las que no quieras mostrar."
      />
      <div className="px-5 sm:px-10 pb-10 max-w-2xl"><div className="ag-pcard">
        {reviews.length === 0 && <p className="vonn-text-cuerpo text-ink-muted">Todavía no hay opiniones.</p>}
        {reviews.map((r) => (
          <ReviewRow key={r.id} review={r} itemName={(r.item_id && names.get(r.item_id)) || "Opinión del lugar"} />
        ))}
      </div></div>
    </>
  );
}
