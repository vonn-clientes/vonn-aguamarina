import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import { PedidoCard, type PedidoConItems } from "./PedidoCard";

export default async function PedidosPage() {
  const membership = await requireMembership();
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("tenant_id", membership.tenant.id)
    .order("created_at", { ascending: false });

  const orders = (data as PedidoConItems[]) ?? [];

  return (
    <>
      <PageHeader
        title="Pedidos de la tienda"
        description="Cada compra queda acá cuando la persona toca “Terminar la compra por WhatsApp”. Conversá con ella por WhatsApp (disponibilidad, pago, retiro) y cambiá el estado."
      />
      <div className="px-5 sm:px-10 pb-10 flex flex-col gap-4 max-w-3xl">
        {orders.length === 0 && <p className="vonn-text-cuerpo text-ink-muted">Todavía no hay pedidos.</p>}
        {orders.map((o) => (
          <PedidoCard key={o.id} order={o} />
        ))}
      </div>
    </>
  );
}
