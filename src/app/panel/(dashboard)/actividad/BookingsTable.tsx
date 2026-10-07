"use client";

import { StatusSelect } from "@/components/panel/StatusSelect";
import { updateBookingStatus } from "./actions";
import type { Booking } from "@/lib/types";

const options: { value: Booking["status"]; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "completado", label: "Completado" },
  { value: "cancelado", label: "Cancelado" },
];

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return <p className="vonn-text-cuerpo text-ink-muted">Todavía no hay turnos.</p>;
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="vonn-text-caption text-ink-muted border-b border-line">
          <th className="pb-2 font-medium">Cliente</th>
          <th className="pb-2 font-medium">Teléfono</th>
          <th className="pb-2 font-medium">Fecha y hora</th>
          <th className="pb-2 font-medium">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {bookings.map((booking) => (
          <tr key={booking.id}>
            <td className="py-3 pr-4 vonn-text-cuerpo">{booking.customer_name}</td>
            <td className="py-3 pr-4 vonn-text-cuerpo text-ink-muted">{booking.customer_phone}</td>
            <td className="py-3 pr-4 vonn-text-cuerpo">
              {new Date(booking.scheduled_at).toLocaleString("es-AR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </td>
            <td className="py-3">
              <StatusSelect
                value={booking.status}
                options={options}
                onChange={(status) => updateBookingStatus(booking.id, status)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
