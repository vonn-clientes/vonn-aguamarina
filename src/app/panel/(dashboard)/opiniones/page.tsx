import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import { ReviewRow } from "@/components/panel/ReviewRow";
import type { Review } from "@/lib/types";

export default async function OpinionesPage() {
  const m = await requireMembership();
  const supabase = await createClient();
  const [{ data: rv }, { data: items }] = await Promise.all([
    supabase.from("reviews").select("*").eq("tenant_id", m.tenant.id).order("created_at", { ascending: false }),
    supabase.from("catalog_items").select("id,name").eq("tenant_id", m.tenant.id),
  ]);
  const names = new Map((items ?? []).map((i: { id: string; name: string }) => [i.id, i.name]));
  const reviews = (rv as Review[]) ?? [];
  return (
    <>
      <PageHeader
        title="Opiniones"
        description="Lo que cuentan tus clientes en cada tratamiento y producto. Podés ocultar o eliminar las que no quieras mostrar."
      />
      <div className="p-6 sm:p-10 flex flex-col gap-3 max-w-2xl">
        {reviews.length === 0 && <p className="vonn-text-cuerpo text-ink-muted">Todavía no hay opiniones.</p>}
        {reviews.map((r) => (
          <ReviewRow key={r.id} review={r} itemName={names.get(r.item_id) ?? "—"} />
        ))}
      </div>
    </>
  );
}
