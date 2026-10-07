"use client";

import { StatusSelect } from "@/components/panel/StatusSelect";
import { updateOrderStatus } from "./actions";
import type { Order } from "@/lib/types";

const options: { value: Order["status"]; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "preparando", label: "Preparando" },
  { value: "listo", label: "Listo" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="vonn-text-cuerpo text-ink-muted">Todavía no hay pedidos.</p>;
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="vonn-text-caption text-ink-muted border-b border-line">
          <th className="pb-2 font-medium">Cliente</th>
          <th className="pb-2 font-medium">Teléfono</th>
          <th className="pb-2 font-medium">Total</th>
          <th className="pb-2 font-medium">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="py-3 pr-4 vonn-text-cuerpo">{order.customer_name}</td>
            <td className="py-3 pr-4 vonn-text-cuerpo text-ink-muted">{order.customer_phone}</td>
            <td className="py-3 pr-4 vonn-text-cuerpo">${order.total.toLocaleString("es-AR")}</td>
            <td className="py-3">
              <StatusSelect
                value={order.status}
                options={options}
                onChange={(status) => updateOrderStatus(order.id, status)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
