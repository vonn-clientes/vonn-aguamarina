import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { extractSlugFromHost } from "@/lib/tenant/resolve";

export async function proxy(request: NextRequest) {
  // Ojo acá: para que server components puedan leer este header con
  // headers().get("x-tenant-slug"), tiene que ir en los headers del
  // REQUEST (no alcanza con ponerlo en la respuesta al navegador).
  const requestHeaders = new Headers(request.headers);
  const slug = extractSlugFromHost(request.headers.get("host"));
  if (slug) {
    requestHeaders.set("x-tenant-slug", slug);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  return updateSession(request, response);
}

// Solo el panel privado necesita refrescar la sesión de login. El sitio
// público queda fuera a propósito: así se sirve estático y rápido (mejor
// velocidad de carga = mejor posicionamiento en Google).
export const config = {
  matcher: ["/panel/:path*"],
};
