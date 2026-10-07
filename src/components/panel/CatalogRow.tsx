"use client";

import { useState, useTransition } from "react";
import { toggleCatalogItem, deleteCatalogItem, updateCatalogItem } from "@/app/panel/(dashboard)/catalogo/actions";
import type { CatalogItem } from "@/lib/types";

const field =
  "w-full rounded-sm border border-line bg-canvas px-2 py-1 vonn-text-caption outline-none focus:border-primary";

export function CatalogRow({ item }: { item: CatalogItem }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="py-3">
          <form
            action={(formData) => startTransition(async () => {
              await updateCatalogItem(item.id, formData);
              setEditing(false);
            })}
            className="grid gap-2 sm:grid-cols-5 items-center"
          >
            <input name="name" defaultValue={item.name} placeholder="Nombre" required className={field} />
            <input name="category" defaultValue={item.category ?? ""} placeholder="Categoría" className={field} />
            <input name="price" defaultValue={item.price ?? ""} placeholder="Precio" inputMode="decimal" className={field} />
            <input
              name="duration_minutes"
              defaultValue={item.duration_minutes ?? ""}
              placeholder="Duración (min)"
              inputMode="numeric"
              className={field}
            />
            <div className="flex gap-3">
              <button type="submit" className="vonn-text-caption text-primary font-medium">Guardar</button>
              <button type="button" className="vonn-text-caption text-ink-muted" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
            <textarea
              name="description"
              defaultValue={item.description ?? ""}
              placeholder="Descripción"
              rows={1}
              className={`${field} sm:col-span-5`}
            />
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className={pending ? "opacity-50" : ""}>
      <td className="py-3 pr-4 vonn-text-cuerpo">{item.name}</td>
      <td className="py-3 pr-4 vonn-text-cuerpo text-ink-muted">{item.category || "—"}</td>
      <td className="py-3 pr-4 vonn-text-cuerpo">
        {item.price != null ? `$${item.price.toLocaleString("es-AR")}` : "—"}
      </td>
      <td className="py-3 pr-4">
        <button
          className="vonn-text-caption text-primary"
          onClick={() => startTransition(() => toggleCatalogItem(item.id, !item.active))}
        >
          {item.active ? "Activo" : "Oculto"}
        </button>
      </td>
      <td className="py-3">
        <div className="flex gap-3">
          <button className="vonn-text-caption text-primary" onClick={() => setEditing(true)}>
            Editar
          </button>
          <button
            className="vonn-text-caption text-accent"
            onClick={() => startTransition(() => deleteCatalogItem(item.id))}
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}
