export const dynamic = "force-static";

// Imagen al compartir el link. Redirige al logo estático (next/og se sacó por el límite de tamaño en Cloudflare).
export function GET(request: Request) {
  return Response.redirect(new URL("/logo-aguamarina-oficial.png", request.url), 308);
}
