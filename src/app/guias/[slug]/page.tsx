import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSite } from "@/lib/public-data";
import { SITE } from "@/lib/site";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { GUIAS } from "@/lib/guias";
import { Advice, JsonLd, SiteFooter, SiteHeader } from "@/components/public/ag";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIAS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: PageProps<"/guias/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const g = GUIAS.find((x) => x.slug === slug);
  if (!g) return {};
  return {
    title: g.seo,
    description: g.desc,
    alternates: { canonical: `/guias/${g.slug}` },
    openGraph: { type: "article", locale: "es_AR", siteName: SITE.name, title: g.seo, description: g.desc, url: `/guias/${g.slug}`, publishedTime: g.fecha, images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  };
}

export default async function GuiaPage(props: PageProps<"/guias/[slug]">) {
  const { slug } = await props.params;
  const g = GUIAS.find((x) => x.slug === slug);
  if (!g) notFound();
  const site = await getPublicSite();
  const wa = site?.content?.whatsapp_number ?? null;
  const path = `/guias/${g.slug}`;
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: g.titulo,
    description: g.desc,
    datePublished: g.fecha,
    dateModified: g.fecha,
    inLanguage: "es-AR",
    mainEntityOfPage: `${SITE.url}${path}`,
    author: { "@type": "Person", name: SITE.owner, jobTitle: "Cosmetóloga y cosmiatra matriculada" },
    publisher: { "@id": `${SITE.url}/#negocio` },
    image: `${SITE.url}/opengraph-image`,
  };
  const otras = GUIAS.filter((x) => x.slug !== g.slug).slice(0, 3);

  return (
    <div className="ag">
      <a className="ag-skip" href="#contenido">Saltar al contenido</a>
      <SiteHeader whatsapp={wa} showProducts={(site?.products.length ?? 0) > 0} />
      <main id="contenido">
        <div className="ag-wrap">
          <nav className="ag-crumbs" aria-label="Ruta de navegación">
            <ol>
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/guias">Guías</Link></li>
              <li aria-current="page">{g.seo}</li>
            </ol>
          </nav>
        </div>
        <article className="ag-narrow ag-post">
          <h1 className="ag-h1">{g.titulo}</h1>
          <p className="ag-post__meta">Por {SITE.owner}, cosmiatra · {g.tiempo} de lectura</p>
          <p className="ag-lead">{g.desc}</p>
          {g.secciones.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((t) => <p key={t}>{t}</p>)}
              {s.ul && <ul>{s.ul.map((i) => <li key={i}>{i}</li>)}</ul>}
            </section>
          ))}
          {g.faq.length > 0 && (
            <section>
              <h2>Preguntas frecuentes</h2>
              {g.faq.map((f) => (
                <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </section>
          )}
          {g.enlaces.length > 0 && (
            <section className="ag-post__links">
              <h2>Mirá también</h2>
              <ul>{g.enlaces.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
            </section>
          )}
        </article>
        <section className="ag-section ag-section--alt">
          <div className="ag-wrap ag-guias">
            {otras.map((o) => (
              <article key={o.slug} className="ag-guia-card">
                <h2><Link href={`/guias/${o.slug}`}>{o.titulo}</Link></h2>
                <span>{o.tiempo} de lectura</span>
              </article>
            ))}
          </div>
        </section>
        <Advice whatsapp={wa} topic={g.titulo} />
      </main>
      <SiteFooter content={site?.content ?? null} />
      <JsonLd data={article} />
      {g.faq.length > 0 && <JsonLd data={faqJsonLd(g.faq)} />}
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Guías", path: "/guias" }, { name: g.seo, path }])} />
    </div>
  );
}
