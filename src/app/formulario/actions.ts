"use server";

import { createClient } from "@supabase/supabase-js";
import { SITE } from "@/lib/site";

// Guarda una respuesta del formulario. Usa la clave pública: la base solo permite ENVIAR, no leer.
export async function submitIntake(answers: Record<string, string | string[]>, honeypot: string) {
  if (honeypot) return { ok: true }; // un bot: fingimos éxito
  const clean: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(answers).slice(0, 300)) {
    const val = Array.isArray(v) ? v.map((x) => String(x).slice(0, 300)) : String(v).slice(0, 5000);
    if (Array.isArray(val) ? val.length : val.trim()) clean[String(k).slice(0, 120)] = val;
  }
  if (Object.keys(clean).length === 0) return { ok: false, error: "Completá al menos una respuesta." };

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", SITE.slug).maybeSingle();
  if (!tenant) return { ok: false, error: "No pudimos enviar. Probá de nuevo en un rato." };
  const { error } = await supabase.from("intake_submissions").insert({ tenant_id: tenant.id, answers: clean });
  if (error) return { ok: false, error: "No pudimos enviar. Probá de nuevo en un rato." };
  return { ok: true };
}
