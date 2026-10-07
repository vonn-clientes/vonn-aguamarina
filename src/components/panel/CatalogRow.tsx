"use client";

import { useState, useTransition } from "react";
import { toggleCatalogItem, deleteCatalogItem, updateCatalogItem, toggleSoldOut } from "@/app/panel/(dashboard)/catalogo/actions";
import type { CatalogItem } from "@/lib/types";
import { ImageUpload } from "./ImageUpload";
import { GalleryUpload } from "./GalleryUpload";
import { ProductFields } from "./ProductFields";
import { TreatmentFields } from "./TreatmentFields";
import { TREATMENT_CATEGORIES } from "./AddItemForm";

const field =
  "w-full rounded-sm border border-line bg-canvas px-2 py-1 vonn-text-caption outline-none focus:border-primary";

export function CatalogRow({ item, tenantId }: { item: CatalogItem; tenantId: string }) {
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
            {item.category === "Productos" ? (
              <input type="hidden" name="category" value="Productos" />
            ) : (
              <select name="category" defaultValue={item.category ?? "Faciales"} className={field}>
                {[...new Set([...TREATMENT_CATEGORIES, ...(item.category ? [item.category] : [])])].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            )}
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
              rows={2}
              className={`${field} sm:col-span-5`}
            />
            <div className="sm:col-span-5">
              <p className="vonn-text-caption text-ink-muted mb-1">Foto principal</p>
              <ImageUpload tenantId={tenantId} name="image_url" defaultUrl={item.image_url} label="foto" />
            </div>
            <div className="sm:col-span-5">
              <p className="vonn-text-caption text-ink-muted mb-1">Más fotos (galería)</p>
              <GalleryUpload tenantId={tenantId} name="gallery_urls" defaultUrls={item.gallery_urls ?? []} />
            </div>
            {item.category === "Productos" ? <ProductFields item={item} /> : <TreatmentFields item={item} />}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className={pending ? "opacity-50" : ""}>
      <td className="py-3 pr-4 vonn-text-cuerpo">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.image_url && <img src={item.image_url} alt="" className="h-10 w-10 rounded-sm object-cover" />}
          <span>{item.name}</span>
        </div>
      </td>
      <td className="py-3 pr-4 vonn-text-cuerpo text-ink-muted">{item.category || "—"}</td>
      <td className="py-3 pr-4 vonn-text-cuerpo">
        {item.price != null ? `$${item.price.toLocaleString("es-AR")}` : "—"}
      </td>
      <td className="py-3 pr-4">
        <button
          className="vonn-text-caption text-primary"
          onClick={() => startTransition(() => toggleCatalogItem(item.id, !item.active))}
        >
          {item.active ? "Visible (tocá para ocultar)" : "Oculto (tocá para mostrar)"}
        </button>
        {item.category === "Productos" && (
          <button
            className="vonn-text-caption text-ink-muted block mt-1"
            onClick={() => startTransition(() => toggleSoldOut(item.id, !item.sold_out))}
          >
            {item.sold_out ? "Agotado (tocá para reponer)" : "Marcar agotado"}
          </button>
        )}
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
