import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSite } from "@/lib/public-data";
import { SITE } from "@/lib/site";
import { breadcrumbJsonLd, slugify, trimDescription, waLink } from "@/lib/seo";
import { seoAlt } from "@/lib/seo-image";
import { Advice, JsonLd, SiteFooter, SiteHeader } from "@/components/public/ag";
import { AddToCart } from "@/components/tienda/AddToCart";
import { Reviews, Stars } from "@/components/public/Reviews";
import { getReviews, summarize } from "@/lib/reviews";

export const revalidate = 60;

async function findProduct(slug: string) {
  const site = await getPublicSite();
  if (!site) return null;
  const item = site.products.find((p) => slugify(p.name) === slug);
  return item ? { site, item } : null;
}

export async function generateStaticParams() {
  try {
    const site = await getPublicSite();
    return (site?.products ?? []).map((p) => ({ slug: slugify(p.name) }));
  } catch {
    return [];
  }
}

export async function generateMetadata(props: PageProps<"/tienda/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const found = await findProduct(slug);
  if (!found) return { title: "Producto no encontrado", robots: { index: false } };
  const { item } = found;
  const title = `${item.name} | Tienda`;
  const description = trimDescription(item.description ? `${item.name}. ${item.description}` : `${item.name} en la tienda de Aguamarina Estética y Bienestar, ${SITE.city}.`);
  return {
    title,
    description,
    alternates: { canonical: `/tienda/${slug}` },
    openGraph: { type: "website", locale: "es_AR", siteName: SITE.name, title, description, url: `/tienda/${slug}`, images: item.image_url ? [{ url: item.image_url }] : [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  };
}

export default async function ProductPage(props: PageProps<"/tienda/[slug]">) {
  const { slug } = await props.params;
  const found = await findProduct(slug);
  if (!found) notFound();
  const { site, item } = found;
  const { content, products } = site;
  const wa = content?.whatsapp_number ?? null;
  const path = `/tienda/${slug}`;
  const reviews = await getReviews(item.id);
  const rating = summarize(reviews);
  const hasPrice = item.price != null;
  const soldOut = !!item.sold_out;
  const photos = [item.image_url, ...(item.gallery_urls ?? [])].filter((u, i, a): u is string => !!u && a.indexOf(u) === i);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: item.description ?? undefined,
    image: photos.length ? photos : undefined,
    brand: { "@type": "Brand", name: SITE.name },
    offers: hasPrice
      ? { "@type": "Offer", priceCurrency: "ARS", price: item.price, availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", url: `${SITE.url}${path}` }
      : undefined,
    aggregateRating: rating.count > 0 ? { "@type": "AggregateRating", ratingValue: rating.avg, reviewCount: rating.count, bestRating: 5 } : undefined,
  };

  return (
    <div className="ag">
      <a className="ag-skip" href="#contenido">Saltar al contenido</a>
      <SiteHeader whatsapp={wa} showProducts={products.length > 0} />
      <main id="contenido">
        <div className="ag-wrap">
          <nav className="ag-crumbs" aria-label="Ruta de navegación">
            <ol>
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/tienda">Tienda</Link></li>
              <li aria-current="page">{item.name}</li>
            </ol>
          </nav>
        </div>

        <section className="ag-wrap ag-pdp">
          <div className="ag-pdp__img">
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0]} alt={seoAlt(item.name, "producto")} width={900} height={900} />
            ) : (
              <Image src="/logo-aguamarina-oficial.png" alt="" width={300} height={105} className="ag-product__ph" />
            )}
          </div>
          <div className="ag-pdp__info">
            <h1 className="ag-h1">{item.name}</h1>
            {rating.count > 0 && (
              <a className="ag-rv-badge" href="#opiniones"><Stars value={rating.avg} /> {rating.avg.toFixed(1)} · {rating.count} {rating.count === 1 ? "opinión" : "opiniones"}</a>
            )}
            {(item.skin_types?.length ?? 0) > 0 && <p className="ag-product__skins">Para piel: {item.skin_types!.join(" · ")}</p>}
            {item.description && <p className="ag-lead">{item.description}</p>}
            {hasPrice && <p className="ag-product__price">${Number(item.price).toLocaleString("es-AR")}</p>}
            <div className="ag-pdp__cta">
              {soldOut ? (
                <a className="ag-btn ag-btn--ghost" href={waLink(wa, `Hola! Quiero saber cuándo vuelve ${item.name}`)} target="_blank" rel="noopener noreferrer">Avisame cuando vuelva</a>
              ) : hasPrice ? (
                <AddToCart id={item.id} name={item.name} />
              ) : (
                <a className="ag-btn" href={waLink(wa, `Hola! Quiero consultar el precio de ${item.name}`)} target="_blank" rel="noopener noreferrer">Consultar precio</a>
              )}
            </div>
            {photos.length > 1 && (
              <div className="ag-pdp__thumbs">
                {photos.slice(1).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt={seoAlt(item.name, "producto", i + 2)} width={300} height={300} loading="lazy" />
                ))}
              </div>
            )}
          </div>
        </section>

        <Reviews itemId={item.id} itemName={item.name} reviews={reviews} path={path} />
        <Advice whatsapp={wa} topic={item.name} />
      </main>
      <SiteFooter content={content} />
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Tienda", path: "/tienda" }, { name: item.name, path }])} />
    </div>
  );
}
