import type { CatalogItem } from "@/lib/types";

const area = "w-full rounded-sm border border-line bg-canvas px-2 py-1 vonn-text-caption outline-none focus:border-primary";

// Solo para tratamientos (no productos): beneficios y datos útiles, una línea por ítem.
export function TreatmentFields({ item }: { item?: CatalogItem }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="vonn-text-caption text-ink-muted flex flex-col gap-1">
        Beneficios (uno por línea)
        <textarea name="benefits" rows={4} defaultValue={item?.benefits?.join("\n")} className={area} placeholder={"Tensa y tonifica\nReduce la flacidez"} />
      </label>
      <label className="vonn-text-caption text-ink-muted flex flex-col gap-1">
        Es bueno saber (uno por línea): frecuencia, combinaciones, cuidados
        <textarea name="good_to_know" rows={4} defaultValue={item?.good_to_know?.join("\n")} className={area} placeholder={"Se puede repetir cada 4 a 6 meses"} />
      </label>
    </div>
  );
}
