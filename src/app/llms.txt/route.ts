import { getPublicSite } from "@/lib/public-data";
import { FULL_ADDRESS, SITE } from "@/lib/site";
import { slugify } from "@/lib/seo";
import { GUIAS } from "@/lib/guias";

export const revalidate = 3600;

// Resumen del sitio en texto simple para buscadores con IA.
export async function GET() {
  const site = await getPublicSite().catch(() => null);
  const lines = [
    `# ${SITE.name}`,
    `> Gabinete de estética en ${SITE.city}, ${SITE.region}, Argentina. Dirección: ${FULL_ADDRESS}. Atención solo con turno previo, por WhatsApp.`,
    "",
    "## Páginas",
    `- [Inicio](${SITE.url}/)`,
    `- [Estética en ${SITE.city}](${SITE.url}/estetica-concepcion-del-uruguay)`,
    `- [Tienda](${SITE.url}/tienda)`,
    `- [Guías](${SITE.url}/guias)`,
    "",
    "## Tratamientos",
    ...(site?.services ?? []).map((s) => `- [${s.name}](${SITE.url}/tratamientos/${slugify(s.name)})`),
    "",
    "## Productos",
    ...(site?.products ?? []).map((p) => `- [${p.name}](${SITE.url}/tienda/${slugify(p.name)})`),
    "",
    "## Guías",
    ...GUIAS.map((g) => `- [${g.titulo}](${SITE.url}/guias/${g.slug})`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
