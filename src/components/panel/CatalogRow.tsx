"use client";

import { useState, useTransition } from "react";
import { toggleCatalogItem, deleteCatalogItem, updateCatalogItem, toggleSoldOut } from "@/app/panel/(dashboard)/catalogo/actions";
import type { CatalogItem } from "@/lib/types";
import { Switch } from "./Controls";
import { ImageUpload } from "./ImageUpload";
import { GalleryUpload } from "./GalleryUpload";
import { ProductFields } from "./ProductFields";
import { TreatmentFields } from "./TreatmentFields";
import { TREATMENT_CATEGORIES } from "./AddItemForm";
import { DeleteButton, EditButton, SwitchRow } from "./Controls";

const field =
  "w-full rounded-sm border border-line bg-canvas px-3 py-2 text-base outline-none focus:border-primary";

export function CatalogRow({ item, tenantId }: { item: CatalogItem; tenantId: string }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="py-4">
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
              <button type="submit" className="ag-pbtn">Guardar</button>
              <button type="button" className="ag-pbtn ag-pbtn--ghost" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
            <textarea
              name="description"
              defaultValue={item.description ?? ""}
              placeholder="Descripción"
              rows={2}
              className={`${field} sm:col-span-5`}
            />
            <div className="sm:col-span-5">
              <p className="text-base text-ink-muted mb-1">Foto principal</p>
              <ImageUpload tenantId={tenantId} name="image_url" defaultUrl={item.image_url} label="foto" />
            </div>
            <div className="sm:col-span-5">
              <p className="text-base text-ink-muted mb-1">Más fotos (galería)</p>
              <GalleryUpload tenantId={tenantId} name="gallery_urls" defaultUrls={item.gallery_urls ?? []} />
            </div>
            {item.category === "Productos" ? <ProductFields item={item} /> : <TreatmentFields item={item} />}
          </form>
      </div>
    );
  }

  const price = item.price != null ? `$${item.price.toLocaleString("es-AR")}` : null;
  const isProduct = item.category === "Productos";
  const meta = [isProduct ? null : item.category, price, !isProduct && item.duration_minutes ? `${item.duration_minutes} min` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`ag-item ${pending ? "opacity-50" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {item.image_url ? <img src={item.image_url} alt="" className="ag-item__img" /> : <span className="ag-item__img" aria-hidden />}
      <div className="ag-item__main">
        <p className="ag-item__name">{item.name}</p>
        {meta && <p className="ag-item__meta">{meta}</p>}
      </div>
      <div className="ag-item__ctrl">
        <div className="flex items-center gap-3">
          <span className="ag-item__state">{item.active ? "Visible" : "Oculto"}</span>
          <Switch checked={item.active} label={`Mostrar ${item.name} en el sitio`} onChange={(v) => startTransition(() => toggleCatalogItem(item.id, v))} />
        </div>
        <div className="flex items-center gap-2">
          <EditButton onClick={() => setEditing(true)} label={`Editar ${item.name}`} />
          <DeleteButton onConfirm={() => startTransition(() => deleteCatalogItem(item.id))} label={`Eliminar ${item.name}`} />
        </div>
      </div>
      {isProduct && (
        <div className="ag-item__sub">
          <SwitchRow
            text="Agotado"
            checked={!!item.sold_out}
            label={`Marcar ${item.name} como agotado`}
            onChange={(v) => startTransition(() => toggleSoldOut(item.id, v))}
          />
        </div>
      )}
    </div>
  );
}
