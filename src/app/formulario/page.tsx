import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicSite } from "@/lib/public-data";
import { FormularioIngrid } from "@/components/FormularioIngrid";

export const metadata: Metadata = { title: "Formulario", robots: { index: false, follow: false } };
export const revalidate = 60;

export default async function FormularioPage() {
  const site = await getPublicSite();
  if (!site) notFound();
  return (
    <div className="ag ag-formpage">
      <main className="ag-narrow">
        <Image src="/logo-aguamarina-oficial.png" alt="Aguamarina" width={240} height={84} className="ag-cm-logo" priority />
        <h1>Armemos tu web juntos</h1>
        <p className="ag-lead">
          Respondé lo que quieras, a tu ritmo. No hay respuestas correctas ni incorrectas, y podés dejar en blanco lo que no quieras contestar.
        </p>
        <FormularioIngrid treatments={site.services.map((s) => s.name)} products={site.products.map((p) => p.name)} />
      </main>
    </div>
  );
}
