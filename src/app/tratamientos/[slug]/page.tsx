import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSite } from "@/lib/public-data";
import { SITE } from "@/lib/site";
import { breadcrumbJsonLd, serviceJsonLd, slugify, trimDescription } from "@/lib/seo";
import { JsonLd, SiteFooter, SiteHeader, TurnoButton } from "@/components/public/ag";

export const revalidate = 60;

async function findService(slug: string) {
  const site = await getPublicSite();
  if (!site) return null;
  const item = site.services.find((s) => slugify(s.name) === slug);
  return item ? { site, item } : null;
}

export async function generateStaticParams() {
  try {
    const site = await getPublicSite();
    return (site?.services ?? []).map((s) => ({ slug: slugify(s.name) }));
  } catch {
    return [];
  }
}

export async function generateMetadata(props: PageProps<"/tratamientos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const found = await findService(slug);
  if (!found) return { title: "Tratamiento no encontrado", robots: { index: false } };

  const { item } = found;
  const title = `${item.name} en ${SITE.city}`;
  const description = trimDescription(
    item.description
      ? `${item.name} en ${SITE.city}. ${item.description}`
      : `${item.name} en Aguamarina Estética y Bienestar, ${SITE.city}. Consultá por WhatsApp.`
  );
  return {
    title,
    description,
    alternates: { canonical: `/tratamientos/${slug}` },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: SITE.name,
      title: `${title} | Aguamarina`,
      description,
      url: `/tratamientos/${slug}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Aguamarina`,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ServicePage(props: PageProps<"/tratamientos/[slug]">) {
  const { slug } = await props.params;
  const found = await findService(slug);
  if (!found) notFound();

  const { site, item } = found;
  const { content, services, products } = site;
  const wa = content?.whatsapp_number ?? null;
  const related = services.filter((s) => s.category === item.category && s.id !== item.id);
  const path = `/tratamientos/${slug}`;

  return (
    <div className="ag">
      <a className="ag-skip" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader whatsapp={wa} showProducts={products.length > 0} />

      <main id="contenido">
        <div className="ag-wrap">
          <nav className="ag-crumbs" aria-label="Ruta de navegación">
            <ol>
              <li>
                <Link href="/">Inicio</Link>
              </li>
              <li>
                <Link href="/#tratamientos">Tratamientos</Link>
              </li>
              <li aria-current="page">{item.name}</li>
            </ol>
          </nav>
        </div>

        <section className="ag-svc-hero">
          <div className="ag-wrap">
            {item.category && <p className="ag-kicker">{item.category}</p>}
            <h1 className="ag-h1">
              {item.name} en {SITE.city}
            </h1>
            {item.description && <p className="ag-lead">{item.description}</p>}
            <div className="ag-actions">
              <TurnoButton whatsapp={wa} text={`Hola! Quiero sacar un turno para ${item.name}`} />
              <Link className="ag-more" href="/#tratamientos">
                Ver todos los tratamientos
              </Link>
            </div>
          </div>
        </section>

        <section className="ag-section ag-section--alt" aria-labelledby="t-consulta">
          <div className="ag-wrap">
            <div className="ag-head ag-rise">
              <h2 className="ag-h2" id="t-consulta">
                Antes de empezar
              </h2>
              <p className="ag-lead">Lo que tenés que saber para consultar por {item.name}.</p>
            </div>
            <div className="ag-trio">
              <div className="ag-rise">
                <h3>Solo con turno</h3>
                <p>Reservá tu lugar por WhatsApp y coordinamos día y horario.</p>
              </div>
              <div className="ag-rise">
                <h3>Te orientamos</h3>
                <p>Te contamos cómo es la sesión y cuántas necesitás en tu caso.</p>
              </div>
              <div className="ag-rise">
                <h3>Valor al día</h3>
                <p>Te pasamos el precio actualizado cuando nos escribís.</p>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="ag-section" aria-labelledby="t-relacionados">
            <div className="ag-wrap">
              <div className="ag-head ag-rise">
                <h2 className="ag-h2" id="t-relacionados">
                  Más de {item.category?.toLowerCase()}
                </h2>
              </div>
              <ul className="ag-chips ag-rise" style={{ margin: "0 auto" }}>
                {related.map((r) => (
                  <li key={r.id}>
                    <Link className="ag-chip" href={`/tratamientos/${slugify(r.name)}`}>
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="ag-section ag-section--deep">
          <div className="ag-wrap ag-about ag-rise">
            <h2 className="ag-h2">¿Lista para tu turno?</h2>
            <p className="ag-lead">Escribinos y lo coordinamos.</p>
            <div className="ag-center" style={{ marginTop: "2rem" }}>
              <TurnoButton whatsapp={wa} tone="light" text={`Hola! Quiero sacar un turno para ${item.name}`} />
            </div>
          </div>
        </section>
      </main>

      <div className="ag-stickybar">
        <TurnoButton whatsapp={wa} text={`Hola! Quiero sacar un turno para ${item.name}`}>
          Pedir turno por WhatsApp
        </TurnoButton>
      </div>

      <SiteFooter content={content} />

      <JsonLd data={serviceJsonLd(item)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: item.name, path },
        ])}
      />
    </div>
  );
}
