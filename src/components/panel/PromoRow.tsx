"use client";

import { useState, useTransition } from "react";
import { deletePromo, togglePromo, updatePromo } from "@/app/panel/(dashboard)/promos/actions";
import type { Promo } from "@/lib/types";
import { PromoFields } from "./PromoForm";

export function PromoRow({ promo }: { promo: Promo }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={(fd) => start(async () => { await updatePromo(promo.id, fd); setEditing(false); })}
        className="rounded-sm border border-line bg-surface p-4 flex flex-col gap-3"
      >
        <PromoFields promo={promo} />
        <div className="flex gap-4">
          <button type="submit" className="vonn-text-cuerpo text-primary font-medium">Guardar</button>
          <button type="button" className="vonn-text-cuerpo text-ink-muted" onClick={() => setEditing(false)}>Cancelar</button>
        </div>
      </form>
    );
  }

  const when = [promo.starts_on && `desde ${promo.starts_on}`, promo.ends_on && `hasta ${promo.ends_on}`].filter(Boolean).join(" · ");

  return (
    <div className={`rounded-sm border border-line bg-surface p-4 flex flex-col gap-2 ${pending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="vonn-text-cuerpo font-bold">{promo.title}</p>
          {promo.description && <p className="vonn-text-caption">{promo.description}</p>}
          <ul className="vonn-text-caption text-ink-muted list-disc pl-5">
            {promo.items.map((i) => <li key={i}>{i}</li>)}
          </ul>
          {(promo.price != null || when) && (
            <p className="vonn-text-caption text-ink-muted mt-1">
              {promo.price != null && `$${promo.price.toLocaleString("es-AR")}`} {when}
            </p>
          )}
        </div>
        <span className={`vonn-text-caption rounded-pill px-3 py-1 ${promo.active ? "bg-primary text-white" : "bg-line text-ink-muted"}`}>
          {promo.active ? "Visible" : "Oculta"}
        </span>
      </div>
      <div className="flex gap-4">
        <button className="vonn-text-caption text-primary" onClick={() => start(() => togglePromo(promo.id, !promo.active))}>
          {promo.active ? "Ocultar" : "Mostrar"}
        </button>
        <button className="vonn-text-caption text-primary" onClick={() => setEditing(true)}>Editar</button>
        <button className="vonn-text-caption text-accent" onClick={() => start(() => deletePromo(promo.id))}>Eliminar</button>
      </div>
    </div>
  );
}
