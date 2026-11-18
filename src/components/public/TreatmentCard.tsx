import Image from "next/image";
import Link from "next/link";
import { slugify, trimDescription } from "@/lib/seo";
import { seoAlt } from "@/lib/seo-image";
import type { CatalogItem } from "@/lib/types";

// Tarjeta de tratamiento: foto grande, nombre, una línea y botón "Ver tratamiento".
// Toda la tarjeta es un botón: al pasar el mouse sube y el botón se rellena.
export function TreatmentCard({ item }: { item: CatalogItem }) {
  // Sin foto cargada: fila limpia con nombre, una línea y flecha (sin repetir el logo).
  // Apenas Ingrid sube una foto desde el panel, la tarjeta pasa sola al formato con imagen.
  if (!item.image_url) {
    return (
      <Link className="ag-trow" href={`/tratamientos/${slugify(item.name)}`}>
        <span className="ag-trow__body">
          <span className="ag-trow__name">{item.name}</span>
          {item.description && <span className="ag-trow__desc">{trimDescription(item.description, 90)}</span>}
        </span>
        <span className="ag-trow__go" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </span>
      </Link>
    );
  }
  return (
    <Link className="ag-tcard ag-rise" href={`/tratamientos/${slugify(item.name)}`}>
      <span className="ag-tcard__img">
        <Image src={item.image_url} alt={seoAlt(item.name)} width={640} height={800} sizes="(max-width: 760px) 46vw, (max-width: 1100px) 30vw, 380px" quality={70} />
      </span>
      <span className="ag-tcard__body">
        <span className="ag-tcard__name">{item.name}</span>
        {item.description && <span className="ag-tcard__desc">{trimDescription(item.description, 85)}</span>}
      </span>
      <span className="ag-tcard__btn">Ver tratamiento</span>
    </Link>
  );
}
