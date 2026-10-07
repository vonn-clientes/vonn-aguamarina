import { CONCERNS, PRODUCT_TYPES, SKIN_TYPES } from "@/lib/product-filters";
import type { CatalogItem } from "@/lib/types";

// Campos para que Ingrid clasifique un producto (solo se usan si es "Productos").
export function ProductFields({ item }: { item?: CatalogItem }) {
  const box = "flex flex-wrap gap-x-4 gap-y-1";
  const lab = "flex items-center gap-1.5 vonn-text-caption";
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-line p-3">
      <p className="vonn-text-caption text-ink-muted">
        Solo para productos: así los clientes pueden filtrar la tienda. «Todo tipo de piel» hace que aparezca con cualquier filtro de piel.
      </p>
      <fieldset>
        <legend className="vonn-text-caption font-medium mb-1">Tipo de piel</legend>
        <div className={box}>
          {SKIN_TYPES.map((s) => (
            <label key={s} className={lab}>
              <input type="checkbox" name="skin_types" value={s} defaultChecked={item?.skin_types?.includes(s)} /> {s}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="vonn-text-caption font-medium mb-1">Qué mejora</legend>
        <div className={box}>
          {CONCERNS.map((s) => (
            <label key={s} className={lab}>
              <input type="checkbox" name="concerns" value={s} defaultChecked={item?.concerns?.includes(s)} /> {s}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="vonn-text-caption font-medium flex flex-col gap-1 max-w-xs">
        Tipo de producto
        <select name="product_type" defaultValue={item?.product_type ?? ""} className="rounded-sm border border-line bg-canvas px-2 py-1 font-normal">
          <option value="">—</option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
