import Image from "next/image";
import Link from "next/link";
import { slugify, waLink } from "@/lib/seo";
import { seoAlt } from "@/lib/seo-image";
import type { CatalogItem } from "@/lib/types";
import { AddToCart } from "./AddToCart";

// Tarjeta de producto: foto, nombre, descripción y precio (solo si Ingrid le cargó uno).
// Con precio se puede comprar online; sin precio, el botón consulta por WhatsApp.
export function ProductCard({ item, whatsapp }: { item: CatalogItem; whatsapp: string | null | undefined }) {
  const hasPrice = item.price != null;
  const soldOut = !!item.sold_out;
  return (
    <article className="ag-product ag-rise" id={slugify(item.name)}>
      <div className="ag-product__img">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={seoAlt(item.name, "producto")} width={640} height={640} loading="lazy" />
        ) : (
          <Image src="/logo-aguamarina-oficial.png" alt="" width={300} height={105} className="ag-product__ph" />
        )}
        {soldOut && <span className="ag-product__tag">Agotado</span>}
      </div>
      <div className="ag-product__body">
        <h3 className="ag-product__name"><Link href={`/tienda/${slugify(item.name)}`}>{item.name}</Link></h3>
        {item.description && <p className="ag-product__desc">{item.description}</p>}
        {(item.skin_types?.length ?? 0) > 0 && (
          <p className="ag-product__skins">{item.skin_types!.join(" · ")}</p>
        )}
        {hasPrice && <p className="ag-product__price">${Number(item.price).toLocaleString("es-AR")}</p>}
      </div>
      <div className="ag-product__cta">
        {soldOut ? (
          <a className="ag-btn ag-btn--ghost" href={waLink(whatsapp, `Hola! Quiero saber cuándo vuelve ${item.name}`)} target="_blank" rel="noopener noreferrer">
            Avisame cuando vuelva
          </a>
        ) : hasPrice ? (
          <AddToCart id={item.id} name={item.name} />
        ) : (
          <a className="ag-btn" href={waLink(whatsapp, `Hola! Quiero consultar el precio de ${item.name}`)} target="_blank" rel="noopener noreferrer">
            Consultar precio
          </a>
        )}
      </div>
    </article>
  );
}
