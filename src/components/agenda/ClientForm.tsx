import Link from "next/link";
import type { Client } from "@/lib/agenda";

const SKIN = ["", "Normal", "Seca", "Mixta", "Grasa", "Sensible", "Madura"];

// Ficha de clienta: solo el nombre es obligatorio, el resto se completa cuando se sepa.
export function ClientForm({ action, client, cancelHref }: { action: (fd: FormData) => void | Promise<void>; client?: Client; cancelHref: string }) {
  return (
    <form action={action} className="ag-g-form">
      <label className="ag-g-field">
        <span>Nombre y apellido</span>
        <input name="full_name" defaultValue={client?.full_name ?? ""} required autoComplete="off" />
      </label>
      <div className="ag-g-row2">
        <label className="ag-g-field">
          <span>WhatsApp</span>
          <input name="phone" type="tel" inputMode="tel" defaultValue={client?.phone ?? ""} placeholder="3442 …" />
        </label>
        <label className="ag-g-field">
          <span>Email</span>
          <input name="email" type="email" defaultValue={client?.email ?? ""} />
        </label>
      </div>
      <div className="ag-g-row2">
        <label className="ag-g-field">
          <span>Cumpleaños</span>
          <input name="birth_date" type="date" defaultValue={client?.birth_date ?? ""} />
        </label>
        <label className="ag-g-field">
          <span>Tipo de piel</span>
          <select name="skin_type" defaultValue={client?.skin_type ?? ""}>
            {SKIN.map((s) => (
              <option key={s} value={s}>
                {s || "Sin definir"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="ag-g-field">
        <span>Dirección</span>
        <input name="address" defaultValue={client?.address ?? ""} />
      </label>
      <label className="ag-g-field">
        <span>Alergias o cuidados a tener en cuenta</span>
        <textarea name="allergies" defaultValue={client?.allergies ?? ""} />
      </label>
      <label className="ag-g-field">
        <span>Notas</span>
        <textarea name="notes" defaultValue={client?.notes ?? ""} placeholder="Lo que quieras recordar de ella" />
      </label>
      <div className="ag-g-formactions">
        <button className="ag-g-btn ag-g-btn--main">Guardar ficha</button>
        <Link href={cancelHref} className="ag-g-btn">
          Volver
        </Link>
      </div>
    </form>
  );
}
