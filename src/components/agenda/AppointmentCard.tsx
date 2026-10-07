import Link from "next/link";
import { PAY_METHODS, STATUS_LABEL, fmtDayShort, fmtTime, dateKey, money, reminderLink, chatLink, type Appointment } from "@/lib/agenda";
import { completeAppointment, setStatus } from "@/app/panel/(agenda)/agenda/actions";

// Tarjeta de un turno con todo lo que Ingrid necesita hacer con un toque.
export function AppointmentCard({ a, back, showDate = false, clash = [] }: { a: Appointment; back: string; showDate?: boolean; clash?: string[] }) {
  const open = a.status === "pendiente" || a.status === "confirmado";
  const end = new Date(new Date(a.starts_at).getTime() + a.duration_min * 60000).toISOString();
  const off = a.status === "cancelado" || a.status === "ausente";

  return (
    <li className={`ag-g-card${off ? " ag-g-card--off" : ""}`}>
      <div className="ag-g-time">
        <b>{fmtTime(a.starts_at)}</b>
        <span>{showDate ? fmtDayShort(dateKey(a.starts_at)) : `hasta ${fmtTime(end)}`}</span>
      </div>
      <div>
        <h3>
          <Link href={a.client_id ? `/panel/agenda/clientes/${a.client_id}` : `/panel/agenda/turnos/${a.id}`}>{a.client_name}</Link>
        </h3>
        <p className="ag-g-meta">
          <span>{a.service_name}{a.session_number ? ` · sesión ${a.session_number}` : ""}</span>
          <span className={`ag-g-chip ag-g-chip--${a.status}`}>{STATUS_LABEL[a.status]}</span>
          {a.price != null && <span>{money(a.price)}</span>}
        </p>
      </div>
      {clash.length > 0 && <p className="ag-g-clash">Se superpone con el turno de {clash.join(" y ")}.</p>}
      {a.notes && <p className="ag-g-notes">{a.notes}</p>}

      <div className="ag-g-actions">
        {a.status === "pendiente" && (
          <form action={setStatus.bind(null, a.id, "confirmado", back)}>
            <button className="ag-g-btn ag-g-btn--small">Marcar confirmado</button>
          </form>
        )}
        {open && a.client_phone && (
          <a className="ag-g-btn ag-g-btn--wa ag-g-btn--small" href={reminderLink(a)} target="_blank" rel="noopener noreferrer">
            Recordar por WhatsApp
          </a>
        )}
        {!open && a.client_phone && (
          <a className="ag-g-btn ag-g-btn--small" href={chatLink(a.client_phone)} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        )}
        <Link className="ag-g-btn ag-g-btn--small" href={`/panel/agenda/turnos/${a.id}`}>
          Editar
        </Link>
      </div>

      {open && (
        <details className="ag-g-more">
          <summary>Ya se realizó · cobrar</summary>
          <form action={completeAppointment.bind(null, a.id)}>
            <input type="hidden" name="back" value={back} />
            <div className="ag-g-row2">
              <label className="ag-g-field">
                <span>Valor del turno</span>
                <input name="price" inputMode="decimal" defaultValue={a.price ?? ""} placeholder="0" />
              </label>
              <label className="ag-g-field">
                <span>Pagó ahora</span>
                <input name="paid" inputMode="decimal" defaultValue={a.price ?? ""} placeholder="0" />
              </label>
            </div>
            <label className="ag-g-field">
              <span>Medio de pago</span>
              <select name="method" defaultValue="Efectivo">
                {PAY_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <p className="ag-g-hint">Si pagó menos del valor (o nada), la diferencia queda en su cuenta corriente.</p>
            <button className="ag-g-btn ag-g-btn--main">Guardar como realizado</button>
          </form>
        </details>
      )}

      {open && (
        <div className="ag-g-actions">
          <form action={setStatus.bind(null, a.id, "ausente", back)}>
            <button className="ag-g-btn ag-g-btn--small ag-g-btn--danger">No vino</button>
          </form>
          <form action={setStatus.bind(null, a.id, "cancelado", back)}>
            <button className="ag-g-btn ag-g-btn--small ag-g-btn--danger">Cancelar turno</button>
          </form>
        </div>
      )}
      {(a.status === "cancelado" || a.status === "ausente") && (
        <div className="ag-g-actions">
          <form action={setStatus.bind(null, a.id, "pendiente", back)}>
            <button className="ag-g-btn ag-g-btn--small">Volver a poner pendiente</button>
          </form>
        </div>
      )}
    </li>
  );
}
