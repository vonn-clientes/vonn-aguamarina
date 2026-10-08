"use client";

import { useMemo, useState } from "react";
import type { CatalogItem } from "@/lib/types";
import { CONCERNS, PRODUCT_TYPES, SKIN_TYPES, matchesSkin } from "@/lib/product-filters";
import { ProductCard } from "./ProductCard";

type Sel = { skin: string; concern: string; type: string };

// Grilla de la tienda con filtros por tipo de piel, preocupación y tipo de producto.
// Solo se muestran las opciones que algún producto realmente usa.
export function ShopGrid({ products, whatsapp }: { products: CatalogItem[]; whatsapp: string | null }) {
  const [sel, setSel] = useState<Sel>({ skin: "", concern: "", type: "" });

  const options = useMemo(() => {
    const skins = SKIN_TYPES.filter((s) => s !== "Todo tipo de piel" && products.some((p) => matchesSkin(p.skin_types, s)));
    const concerns = CONCERNS.filter((c) => products.some((p) => p.concerns?.includes(c)));
    const types = PRODUCT_TYPES.filter((t) => products.some((p) => p.product_type === t));
    return { skins, concerns, types };
  }, [products]);

  const shown = products.filter(
    (p) =>
      (!sel.skin || matchesSkin(p.skin_types, sel.skin)) &&
      (!sel.concern || p.concerns?.includes(sel.concern)) &&
      (!sel.type || p.product_type === sel.type),
  );

  const stars = shown.filter((p) => p.featured);
  const others = shown.filter((p) => !p.featured);

  const groups: { key: keyof Sel; label: string; list: readonly string[] }[] = [
    { key: "skin", label: "Tu tipo de piel", list: options.skins },
    { key: "concern", label: "Qué querés mejorar", list: options.concerns },
    { key: "type", label: "Tipo de producto", list: options.types },
  ];
  const active = groups.filter((g) => g.list.length > 0);

  return (
    <>
      {active.length > 0 && (
        <div className="ag-filters">
          {active.map((g) => (
            <fieldset key={g.key} className="ag-filter">
              <legend>{g.label}</legend>
              <div role="group" aria-label={g.label}>
                <button
                  type="button"
                  className="ag-chipbtn"
                  aria-pressed={!sel[g.key]}
                  onClick={() => setSel({ ...sel, [g.key]: "" })}
                >
                  Todos
                </button>
                {g.list.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className="ag-chipbtn"
                    aria-pressed={sel[g.key] === o}
                    onClick={() => setSel({ ...sel, [g.key]: sel[g.key] === o ? "" : o })}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="ag-empty">
          <p>No encontramos productos con esos filtros.</p>
          <button type="button" className="ag-btn" onClick={() => setSel({ skin: "", concern: "", type: "" })}>
            Ver todos los productos
          </button>
        </div>
      ) : (
        <>
          <p className="ag-count" aria-live="polite">
            {shown.length} {shown.length === 1 ? "producto" : "productos"}
          </p>
          {stars.length > 0 && (
            <div className="ag-stars-head">
              <h2>Productos estrella</h2>
              <p>Los más elegidos de la tienda: muy buenos y muy efectivos.</p>
            </div>
          )}
          <div className="ag-shop">
            {stars.map((p) => (
              <ProductCard key={p.id} item={p} whatsapp={whatsapp} />
            ))}
          </div>
          {others.length > 0 && (
            <>
              {stars.length > 0 && <h2 className="ag-others-head">Más productos</h2>}
              <div className="ag-shop">
                {others.map((p) => (
                  <ProductCard key={p.id} item={p} whatsapp={whatsapp} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
