"use client";

import { useState } from "react";
import Link from "next/link";

export interface ClientOpt {
  id: string;
  name: string;
  phone: string | null;
}
export interface ServiceOpt {
  id: string;
  name: string;
  duration: number | null;
}
export interface TurnoDefaults {
  client_id?: string | null;
  client_name?: string;
  client_phone?: string | null;
  catalog_item_id?: string | null;
  service_name?: string;
  date: string;
  time: string;
  duration: number;
  price?: number | null;
  notes?: string | null;
}

// Formulario único para agendar y editar un turno.
export function TurnoForm({
  action,
  clients,
  services,
  defaults,
  submitLabel,
  cancelHref,
}: {
  action: (fd: FormData) => void | Promise<void>;
  clients: ClientOpt[];
  services: ServiceOpt[];
  defaults: TurnoDefaults;
  submitLabel: string;
  cancelHref: string;
}) {
  const [clientId, setClientId] = useState(defaults.client_id ?? "");
  const [serviceId, setServiceId] = useState(defaults.catalog_item_id ?? (defaults.service_name ? "otro" : ""));
  const [duration, setDuration] = useState(String(defaults.duration));

  function onService(id: string) {
    setServiceId(id);
    const s = services.find((x) => x.id === id);
    if (s?.duration) setDuration(String(s.duration));
  }

  return (
    <form action={action} className="ag-g-form">
      <label className="ag-g-field">
        <span>Clienta</span>
        <select name="client_id" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Clienta nueva…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {!clientId && (
        <div className="ag-g-row2">
          <label className="ag-g-field">
            <span>Nombre y apellido</span>
            <input name="client_name" defaultValue={defaults.client_name ?? ""} autoComplete="off" required />
          </label>
          <label className="ag-g-field">
            <span>WhatsApp (opcional)</span>
            <input name="client_phone" type="tel" inputMode="tel" defaultValue={defaults.client_phone ?? ""} placeholder="3442 …" />
          </label>
        </div>
      )}

      <label className="ag-g-field">
        <span>Tratamiento</span>
        <select name="catalog_item_id" value={serviceId} onChange={(e) => onService(e.target.value)} required>
          <option value="" disabled>
            Elegí un tratamiento…
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          <option value="otro">Otro (escribirlo)</option>
        </select>
      </label>

      {serviceId === "otro" && (
        <label className="ag-g-field">
          <span>¿Qué se hace?</span>
          <input name="service_name" defaultValue={defaults.service_name ?? ""} required />
        </label>
      )}

      <div className="ag-g-row2">
        <label className="ag-g-field">
          <span>Día</span>
          <input name="date" type="date" defaultValue={defaults.date} required />
        </label>
        <label className="ag-g-field">
          <span>Hora</span>
          <input name="time" type="time" step={300} defaultValue={defaults.time} required />
        </label>
      </div>

      <div className="ag-g-row2">
        <label className="ag-g-field">
          <span>Duración (minutos)</span>
          <input name="duration" type="number" min={5} max={600} step={5} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </label>
        <label className="ag-g-field">
          <span>Valor (opcional)</span>
          <input name="price" inputMode="decimal" defaultValue={defaults.price ?? ""} placeholder="0" />
        </label>
      </div>

      <label className="ag-g-field">
        <span>Notas (opcional)</span>
        <textarea name="notes" defaultValue={defaults.notes ?? ""} placeholder="Algo para recordar de este turno" />
      </label>

      <div className="ag-g-formactions">
        <button className="ag-g-btn ag-g-btn--main">{submitLabel}</button>
        <Link href={cancelHref} className="ag-g-btn">
          Volver
        </Link>
      </div>
    </form>
  );
}
