import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";

// Refresca la sesión de Supabase en cada pedido (necesario en Next.js App
// Router: si no se hace acá, la sesión puede "expirar" de forma silenciosa
// en Server Components). Basado en el patrón oficial de @supabase/ssr.
export async function updateSession(request: NextRequest, response: NextResponse) {
  // Antes de tener un proyecto de Supabase real conectado (.env.local),
  // no hay nada que refrescar: el sitio igual tiene que funcionar con
  // el contenido de demostración.
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Esto dispara el refresh del token si hace falta.
  await supabase.auth.getUser();

  return response;
}
