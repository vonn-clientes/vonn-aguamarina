import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { PageHeader } from "@/components/panel/PageHeader";
import { PedidoCard, type PedidoConItems } from "./PedidoCard";

export default async function PedidosPage() {
  const membership = await requireMembership();

  const orders = await query<PedidoConItems>(
    `select o.*, coalesce((select json_agg(i order by i.created_at) from order_items i where i.order_id = o.id), '[]'::json) as order_items
     from orders o where o.tenant_id = $1 order by o.created_at desc`,
    [membership.tenant.id],
  );

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
