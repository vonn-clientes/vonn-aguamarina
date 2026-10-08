import type { Metadata } from "next";
import Link from "next/link";
import { getPublicSite } from "@/lib/public-data";
import { FULL_ADDRESS, SITE } from "@/lib/site";
import { breadcrumbJsonLd, faqJsonLd, slugify, waLink } from "@/lib/seo";
import { Advice, JsonLd, SiteFooter, SiteHeader, TurnoButton } from "@/components/public/ag";

export const revalidate = 3600;

const TITLE = "Centro de estética en Concepción del Uruguay";
const DESCRIPTION = `Aguamarina Estética y Bienestar: tratamientos faciales y corporales, depilación definitiva, maquillaje y peinados en ${SITE.city}, ${SITE.region}. Atención con turno previo.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/estetica-concepcion-del-uruguay" },
  openGraph: { type: "website", locale: "es_AR", siteName: SITE.name, title: `${TITLE} | Aguamarina`, description: DESCRIPTION, url: "/estetica-concepcion-del-uruguay", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
};

const FAQ = [
  { q: "¿Dónde queda Aguamarina Estética y Bienestar?", a: `Estamos en ${FULL_ADDRESS}. La atención es solo con turno previo.` },
  { q: "¿Cómo saco un turno?", a: "Por WhatsApp: elegís el tratamiento y coordinamos día y horario." },
  { q: "¿Qué tratamientos hay en Concepción del Uruguay?", a: "Tratamientos faciales (Hifu 7D, Dermapen), corporales (criolipólisis, lipoláser, crioradiofrecuencia, ondas de choque, depilación definitiva) y servicios de maquillaje, peinados, cejas y pestañas." },
  { q: "¿Hay productos de cuidado de la piel?", a: "Sí, tenemos una tienda con productos de dermocosmética Natceuticals. Elegís online y terminás la compra por WhatsApp." },
];

export default async function LocalPage() {
  const site = await getPublicSite();
  const wa = site?.content?.whatsapp_number ?? null;
  const services = site?.services ?? [];
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/estetica-concepcion-del-uruguay`,
    about: { "@id": `${SITE.url}/#negocio` },
    inLanguage: "es-AR",
  };
  return (
    <div className="ag">
      <a className="ag-skip" href="#contenido">Saltar al contenido</a>
      <SiteHeader whatsapp={wa} showProducts={(site?.products.length ?? 0) > 0} />
      <main id="contenido">
        <section className="ag-svc-hero">
          <div className="ag-wrap">
            <h1 className="ag-h1">Estética en Concepción del Uruguay</h1>
            <p className="ag-lead">Tratamientos faciales y corporales, aparatología, maquillaje y peinados, con atención personalizada y turno previo.</p>
            <div className="ag-actions"><TurnoButton whatsapp={wa} text="Hola! Quiero sacar un turno" /></div>
          </div>
        </section>
        <section className="ag-section ag-section--alt">
          <div className="ag-narrow ag-post">
            <h2>Qué hacemos</h2>
            <p>Aguamarina Estética y Bienestar es el gabinete de {SITE.owner}, cosmetóloga y cosmiatra matriculada, en {SITE.city}. Cada tratamiento empieza con una evaluación de tu piel y de lo que querés lograr.</p>
            <ul>
              {services.map((s) => (
                <li key={s.id}><Link href={`/tratamientos/${slugify(s.name)}`}>{s.name}</Link></li>
              ))}
            </ul>
            <h2>Cuidá tu piel en casa</h2>
            <p>En la <Link href="/tienda">tienda</Link> encontrás sérums, brumas y limpiadores de dermocosmética, y en las <Link href="/guias">guías</Link> te explicamos cómo usarlos.</p>
            <h2>Cómo llegar</h2>
            <p>{FULL_ADDRESS}. Atención solo con turno previo: escribinos por <a href={waLink(wa, "Hola! Quiero sacar un turno")} target="_blank" rel="noopener noreferrer">WhatsApp</a>.</p>
            <h2>Preguntas frecuentes</h2>
            {FAQ.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        </section>
        <Advice whatsapp={wa} />
      </main>
      <SiteFooter content={site?.content ?? null} />
      <JsonLd data={page} />
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Estética en Concepción del Uruguay", path: "/estetica-concepcion-del-uruguay" }])} />
    </div>
  );
}
