"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fold } from "@/lib/agenda";

export interface ClientOpt {
  id: string;
  name: string;
  first: string;
  last: string;
  phone: string | null;
}
export interface ServiceOpt {
  id: string;
  name: string;
  duration: number | null;
}
export interface TurnoDefaults {
  client_id?: string | null;
  client_first?: string;
  client_last?: string;
  client_phone?: string | null;
  catalog_item_id?: string | null;
  service_name?: string;
  date: string;
  time: string;
  duration: number;
  session?: number | null;
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
  const [first, setFirst] = useState(defaults.client_first ?? "");
  const [last, setLast] = useState(defaults.client_last ?? "");
  const picked = clients.find((c) => c.id === clientId);

  // Sugerencias: clientes existentes que coinciden con lo que se va escribiendo (nombre o apellido, en cualquier orden).
  const suggestions = useMemo(() => {
    const terms = fold(`${first} ${last}`).split(/\s+/).filter(Boolean);
    if (clientId || terms.length === 0) return [];
    return clients.filter((c) => terms.every((t) => fold(c.name).includes(t))).slice(0, 5);
  }, [clients, first, last, clientId]);

  function pick(c: ClientOpt) {
    setClientId(c.id);
    setFirst(c.first);
    setLast(c.last);
  }
  function unpick() {
    setClientId("");
  }
  const [serviceId, setServiceId] = useState(defaults.catalog_item_id ?? (defaults.service_name ? "otro" : ""));
  const [duration, setDuration] = useState(String(defaults.duration));

  function onService(id: string) {
    setServiceId(id);
    const s = services.find((x) => x.id === id);
    if (s?.duration) setDuration(String(s.duration));
  }

  return (
    <form action={action} className="ag-g-form">
      <input type="hidden" name="client_id" value={clientId} />
      {picked ? (
        <div className="ag-g-picked">
          <div>
            <small>Cliente existente</small>
            <strong>{picked.name}</strong>
            {picked.phone && <span>{picked.phone}</span>}
          </div>
          <button type="button" className="ag-g-btn ag-g-btn--small" onClick={unpick}>
            Cambiar
          </button>
        </div>
      ) : (
        <>
          <div className="ag-g-row2">
            <label className="ag-g-field">
              <span>Nombre</span>
              <input name="client_first" value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="off" required />
            </label>
            <label className="ag-g-field">
              <span>Apellido</span>
              <input name="client_last" value={last} onChange={(e) => setLast(e.target.value)} autoComplete="off" />
            </label>
          </div>
          {suggestions.length > 0 && (
            <div className="ag-g-sugg" role="listbox" aria-label="Clientes que ya vinieron">
              <small>¿Es alguno de estos clientes?</small>
              {suggestions.map((c) => (
                <button type="button" key={c.id} role="option" aria-selected="false" onClick={() => pick(c)}>
                  <strong>{c.name}</strong>
                  <span>{c.phone || "Sin teléfono"}</span>
                </button>
              ))}
            </div>
          )}
          {first.trim() && suggestions.length === 0 && <p className="ag-g-hint">Cliente nuevo: se crea su ficha al agendar.</p>}
          <label className="ag-g-field">
            <span>WhatsApp (opcional)</span>
            <input name="client_phone" type="tel" inputMode="tel" defaultValue={defaults.client_phone ?? ""} placeholder="3442 …" />
          </label>
        </>
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
        <span>Número de sesión (opcional)</span>
        <input name="session" type="number" inputMode="numeric" min={1} max={99} defaultValue={defaults.session ?? ""} placeholder="Ej: 1, 2, 3…" />
      </label>

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
