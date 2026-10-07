import Image from "next/image";
import Link from "next/link";
import { slugify, trimDescription } from "@/lib/seo";
import { seoAlt } from "@/lib/seo-image";
import type { CatalogItem } from "@/lib/types";

// Tarjeta de tratamiento: foto grande, nombre, una línea y botón "Ver tratamiento".
// Toda la tarjeta es un botón: al pasar el mouse sube y el botón se rellena.
export function TreatmentCard({ item }: { item: CatalogItem }) {
  return (
    <Link className="ag-tcard ag-rise" href={`/tratamientos/${slugify(item.name)}`}>
      <span className="ag-tcard__img">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={seoAlt(item.name)} width={640} height={800} loading="lazy" />
        ) : (
          <Image src="/logo-aguamarina-oficial.png" alt="" width={300} height={105} className="ag-tcard__ph" />
        )}
      </span>
      <span className="ag-tcard__body">
        <span className="ag-tcard__name">{item.name}</span>
        {item.description && <span className="ag-tcard__desc">{trimDescription(item.description, 85)}</span>}
      </span>
      <span className="ag-tcard__btn">Ver tratamiento</span>
    </Link>
  );
}
