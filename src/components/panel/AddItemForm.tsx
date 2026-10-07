"use client";

import { useState } from "react";
import { addCatalogItem } from "@/app/panel/(dashboard)/catalogo/actions";
import { ImageUpload } from "./ImageUpload";
import { GalleryUpload } from "./GalleryUpload";
import { ProductFields } from "./ProductFields";
import { TreatmentFields } from "./TreatmentFields";

export const TREATMENT_CATEGORIES = ["Faciales", "Corporales", "Estilo"];

const field = "w-full rounded-sm border border-line bg-canvas px-3 py-2 vonn-text-cuerpo outline-none focus:border-primary";
const lab = "flex flex-col gap-1 vonn-text-caption text-ink-muted";

// Un solo formulario para sumar algo nuevo: primero se elige si es un tratamiento o un producto, y se muestran solo los campos que corresponden.
export function AddItemForm({ tenantId }: { tenantId: string }) {
  const [kind, setKind] = useState<"tratamiento" | "producto">("tratamiento");
  return (
    <form action={addCatalogItem} className="ag-pcard">
      <h2>Agregar algo nuevo</h2>
      <div role="group" aria-label="¿Qué querés agregar?" className="flex gap-2">
        {(["tratamiento", "producto"] as const).map((k) => (
          <button
            type="button"
            key={k}
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`rounded-pill px-5 min-h-[44px] font-medium ${kind === k ? "bg-primary text-white" : "bg-canvas-muted text-ink"}`}
          >
            {k === "tratamiento" ? "Un tratamiento" : "Un producto"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={lab}>
          Nombre
          <input name="name" required className={field} />
        </label>
        {kind === "producto" ? (
          <input type="hidden" name="category" value="Productos" />
        ) : (
          <label className={lab}>
            Categoría
            <select name="category" className={field} defaultValue="Faciales">
              {TREATMENT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        )}
        <label className={lab}>
          Precio {kind === "tratamiento" && "(opcional)"}
          <input name="price" inputMode="decimal" className={field} placeholder={kind === "producto" ? "Si no lo cargás, se consulta por WhatsApp" : ""} />
        </label>
        {kind === "tratamiento" && (
          <label className={lab}>
            Duración en minutos
            <input name="duration_minutes" inputMode="numeric" className={field} />
          </label>
        )}
      </div>
      <label className={lab}>
        Descripción breve (opcional)
        <textarea name="description" rows={2} className={field} />
      </label>
      <div className={lab}>
        Foto principal
        <ImageUpload tenantId={tenantId} name="image_url" label="foto" />
      </div>
      <div className={lab}>
        Más fotos (opcional)
        <GalleryUpload tenantId={tenantId} name="gallery_urls" />
      </div>
      {kind === "producto" ? <ProductFields /> : <TreatmentFields />}
      <button type="submit" className="ag-pbtn self-start">
        {kind === "producto" ? "Agregar producto" : "Agregar tratamiento"}
      </button>
    </form>
  );
}
