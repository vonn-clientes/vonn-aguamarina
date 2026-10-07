import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicSite } from "@/lib/public-data";
import { SITE } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/seo";
import { Advice, JsonLd, SiteFooter, SiteHeader } from "@/components/public/ag";
import { ProductCard } from "@/components/tienda/ProductCard";

export const revalidate = 60;

const TITLE = `Tienda de cuidado de la piel en ${SITE.city}`;
const DESCRIPTION = `Productos de cuidado facial y corporal de Aguamarina Estética y Bienestar, en ${SITE.city}. Comprás online, pagás por transferencia y retirás en el gabinete.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tienda" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE.name,
    title: `${TITLE} | Aguamarina`,
    description: DESCRIPTION,
    url: "/tienda",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: { card: "summary_large_image", title: `${TITLE} | Aguamarina`, description: DESCRIPTION, images: ["/opengraph-image"] },
};

export default async function TiendaPage() {
  const site = await getPublicSite();
  if (!site) notFound();
  const { content, products } = site;
  const wa = content?.whatsapp_number ?? null;

  return (
    <div className="ag">
      <a className="ag-skip" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader whatsapp={wa} showProducts={products.length > 0} />
      <main id="contenido">
        <section className="ag-svc-hero">
          <div className="ag-wrap">
            <h1 className="ag-h1">Tienda</h1>
            <p className="ag-lead">Productos para cuidar tu piel en casa. Pagás por transferencia y retirás en el gabinete.</p>
          </div>
        </section>

        <section className="ag-section ag-section--alt" aria-label="Productos">
          <div className="ag-wrap">
            {products.length === 0 ? (
              <p className="ag-lead" style={{ textAlign: "center" }}>
                Estamos preparando la tienda. Mientras tanto, escribinos y te asesoramos.
              </p>
            ) : (
              <div className="ag-shop">
                {products.map((p) => (
                  <ProductCard key={p.id} item={p} whatsapp={wa} />
                ))}
              </div>
            )}
          </div>
        </section>

        <Advice whatsapp={wa} topic="productos para mi piel" />
      </main>
      <SiteFooter content={content} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Tienda", path: "/tienda" },
        ])}
      />
    </div>
  );
}
