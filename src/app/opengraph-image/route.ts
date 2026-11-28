export const dynamic = "force-static";

// Imagen al compartir el link: redirige (ruta relativa) al logo estatico.
export function GET() {
  return new Response(null, { status: 308, headers: { Location: "/logo-aguamarina-oficial.png" } });
}
