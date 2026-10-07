"use client";

// Cliente de Supabase para usar en el navegador (Client Components).
// Usa la clave "anon" pública — todo lo que puede hacer está limitado
// por las políticas de RLS definidas en supabase/schema.sql.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
