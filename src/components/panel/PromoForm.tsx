import type { Promo } from "@/lib/types";
import { ShortTextArea } from "./ShortTextArea";

const field = "w-full rounded-sm border border-line bg-canvas px-3 py-2 vonn-text-cuerpo outline-none focus:border-primary";

// Campos de una promo; se usa para crear y para editar.
export function PromoFields({ promo }: { promo?: Promo }) {
  return (
    <div className="flex flex-col gap-3">
      <input name="title" defaultValue={promo?.title} placeholder="Nombre (ej: Combo reafirmante)" required className={field} />
      <label className="vonn-text-caption text-ink-muted flex flex-col gap-1">
        Descripción corta: qué hace este combo
        <ShortTextArea name="description" defaultValue={promo?.description} placeholder="Ej: Reduce grasa localizada y mejora la firmeza de la zona." />
      </label>
      <label className="vonn-text-caption text-ink-muted flex flex-col gap-1">
        Qué incluye (una línea por cada ítem)
        <textarea
          name="items"
          defaultValue={promo?.items.join("\n")}
          rows={4}
          placeholder={"4 sesiones de Bodyup\n2 sesiones de Radiofrecuencia"}
          className={field}
        />
      </label>
      <input name="note" defaultValue={promo?.note ?? ""} placeholder="Aclaración (opcional, ej: válido hasta agotar turnos)" className={field} />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="vonn-text-caption text-ink-muted flex flex-col gap-1">
          Precio (opcional)
          <input name="price" defaultValue={promo?.price ?? ""} inputMode="decimal" className={field} />
        </label>
        <label className="vonn-text-caption text-ink-muted flex flex-col gap-1">
          Desde (opcional)
          <input type="date" name="starts_on" defaultValue={promo?.starts_on ?? ""} className={field} />
        </label>
        <label className="vonn-text-caption text-ink-muted flex flex-col gap-1">
          Hasta (opcional)
          <input type="date" name="ends_on" defaultValue={promo?.ends_on ?? ""} className={field} />
        </label>
      </div>
    </div>
  );
}
