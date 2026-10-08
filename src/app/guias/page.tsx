import type { Metadata } from "next";
import Link from "next/link";
import { getPublicSite } from "@/lib/public-data";
import { SITE } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/seo";
import { GUIAS } from "@/lib/guias";
import { JsonLd, SiteFooter, SiteHeader } from "@/components/public/ag";

export const revalidate = 3600;

const TITLE = "Guías de cuidado de la piel y estética";
const DESCRIPTION = `Guías simples de Aguamarina, ${SITE.city}: rutinas de skincare, retinol, vitamina C, limpieza facial, HIFU y depilación definitiva.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guias" },
  openGraph: { type: "website", locale: "es_AR", siteName: SITE.name, title: `${TITLE} | Aguamarina`, description: DESCRIPTION, url: "/guias", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
};

export default async function GuiasPage() {
  const site = await getPublicSite();
  const wa = site?.content?.whatsapp_number ?? null;
  return (
    <div className="ag">
      <a className="ag-skip" href="#contenido">Saltar al contenido</a>
      <SiteHeader whatsapp={wa} showProducts={(site?.products.length ?? 0) > 0} />
      <main id="contenido">
        <section className="ag-svc-hero">
          <div className="ag-wrap">
            <h1 className="ag-h1">Guías</h1>
            <p className="ag-lead">Respuestas claras para cuidar tu piel, de parte de una cosmiatra.</p>
          </div>
        </section>
        <section className="ag-section ag-section--alt">
          <div className="ag-wrap ag-guias">
            {GUIAS.map((g) => (
              <article key={g.slug} className="ag-guia-card">
                <h2><Link href={`/guias/${g.slug}`}>{g.titulo}</Link></h2>
                <p>{g.desc}</p>
                <span>{g.tiempo} de lectura</span>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter content={site?.content ?? null} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Guías", path: "/guias" }])} />
    </div>
  );
}
