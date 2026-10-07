import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicSite } from "@/lib/public-data";
import { SiteFooter, SiteHeader } from "@/components/public/ag";
import { Checkout, type CheckoutProduct } from "@/components/tienda/Checkout";

// El carrito no tiene nada para buscadores: no se indexa.
export const metadata: Metadata = {
  title: "Tu carrito",
  robots: { index: false, follow: false },
};
export const revalidate = 60;

export default async function CarritoPage() {
  const site = await getPublicSite();
  if (!site) notFound();
  const { content, products } = site;
  const buyable: CheckoutProduct[] = products
    .filter((p) => p.price != null && !p.sold_out)
    .map((p) => ({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }));

  return (
    <div className="ag">
      <a className="ag-skip" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader whatsapp={content?.whatsapp_number ?? null} showProducts />
      <main id="contenido" className="ag-section">
        <div className="ag-wrap">
          <h1 className="ag-h2" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            Tu carrito
          </h1>
          <Checkout products={buyable} />
        </div>
      </main>
      <SiteFooter content={content} />
    </div>
  );
}
