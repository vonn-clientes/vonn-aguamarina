"use client";

import { useState, useTransition } from "react";
import { deletePromo, togglePromo, updatePromo } from "@/app/panel/(dashboard)/promos/actions";
import type { Promo } from "@/lib/types";
import { PromoFields } from "./PromoForm";
import { DeleteButton, EditButton, Switch } from "./Controls";

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
          <button type="submit" className="ag-pbtn">Guardar</button>
          <button type="button" className="ag-pbtn ag-pbtn--ghost" onClick={() => setEditing(false)}>Cancelar</button>
        </div>
      </form>
    );
  }

  const when = [promo.starts_on && `desde ${promo.starts_on}`, promo.ends_on && `hasta ${promo.ends_on}`].filter(Boolean).join(" · ");

  return (
    <div className={`ag-item ${pending ? "opacity-50" : ""}`} style={{ alignItems: "flex-start" }}>
      <div className="ag-item__main">
        <p className="ag-item__name">{promo.title}</p>
        {promo.description && <p className="ag-item__meta">{promo.description}</p>}
        <ul className="ag-item__meta list-disc pl-5">
          {promo.items.map((i) => <li key={i}>{i}</li>)}
        </ul>
        {(promo.price != null || when) && (
          <p className="ag-item__meta">
            {promo.price != null && `$${promo.price.toLocaleString("es-AR")}`} {when}
          </p>
        )}
      </div>
      <div className="ag-item__ctrl">
        <div className="flex items-center gap-3">
          <span className="ag-item__state">{promo.active ? "Visible" : "Oculta"}</span>
          <Switch checked={promo.active} label={`Mostrar ${promo.title} en el sitio`} onChange={(v) => start(() => togglePromo(promo.id, v))} />
        </div>
        <div className="flex items-center gap-2">
          <EditButton onClick={() => setEditing(true)} label={`Editar ${promo.title}`} />
          <DeleteButton onConfirm={() => start(() => deletePromo(promo.id))} label={`Eliminar ${promo.title}`} />
        </div>
      </div>
    </div>
  );
}
