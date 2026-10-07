"use client";

import { StatusSelect } from "@/components/panel/StatusSelect";
import { updateOrderStatus } from "../actividad/actions";
import type { Order } from "@/lib/types";

export type PedidoConItems = Order & {
  order_items: { id: string; item_name: string; quantity: number; subtotal: number }[];
};

const options: { value: Order["status"]; label: string }[] = [
  { value: "pendiente", label: "Falta verificar el pago" },
  { value: "preparando", label: "Pago verificado, preparando" },
  { value: "listo", label: "Listo para retirar" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

export function PedidoCard({ order }: { order: PedidoConItems }) {
  const date = new Date(order.created_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
  return (
    <div className="ag-pcard">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ag-item__name">{order.customer_name}</p>
          <p className="ag-item__meta">
            DNI {order.customer_dni ?? "—"} · WhatsApp {order.customer_phone} · {date}
          </p>
        </div>
        <StatusSelect value={order.status} options={options} onChange={(status) => updateOrderStatus(order.id, status)} />
      </div>
      <ul style={{ fontSize: "1rem" }}>
        {order.order_items.map((i) => (
          <li key={i.id} className="flex justify-between gap-4">
            <span>
              {i.quantity} × {i.item_name}
            </span>
            <span>${Number(i.subtotal).toLocaleString("es-AR")}</span>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: "1.0625rem" }} className="font-bold flex justify-between border-t border-line pt-2">
        <span>Total</span>
        <span>${Number(order.total).toLocaleString("es-AR")}</span>
      </p>
    </div>
  );
}
