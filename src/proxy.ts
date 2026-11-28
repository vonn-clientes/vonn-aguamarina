import { NextResponse, type NextRequest } from "next/server";
import { extractSlugFromHost } from "@/lib/tenant/resolve";

export async function proxy(request: NextRequest) {
  // Para que los server components puedan leer x-tenant-slug con
  // headers().get(...), tiene que ir en los headers del REQUEST. El valor que
  // pudiera mandar el navegador se descarta: solo vale el que sale del host.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-tenant-slug");
  const slug = extractSlugFromHost(request.headers.get("host"));
  if (slug) requestHeaders.set("x-tenant-slug", slug);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Solo el panel privado pasa por acá; el sitio público queda estático y rápido.
export const config = {
  matcher: ["/panel/:path*"],
};
