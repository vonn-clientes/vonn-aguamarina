"use server";

import { insertRow, queryOne } from "@/lib/db";
import { SITE } from "@/lib/site";

// Guarda una respuesta del formulario. Solo inserta; nunca devuelve datos.
export async function submitIntake(answers: Record<string, string | string[]>, honeypot: string) {
  if (honeypot) return { ok: true }; // un bot: fingimos éxito
  const clean: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(answers).slice(0, 300)) {
    const val = Array.isArray(v) ? v.map((x) => String(x).slice(0, 300)) : String(v).slice(0, 5000);
    if (Array.isArray(val) ? val.length : val.trim()) clean[String(k).slice(0, 120)] = val;
  }
  if (Object.keys(clean).length === 0) return { ok: false, error: "Completá al menos una respuesta." };

  try {
    const tenant = await queryOne<{ id: string }>("select id from tenants where slug = $1", [SITE.slug]);
    if (!tenant) return { ok: false, error: "No pudimos enviar. Probá de nuevo en un rato." };
    await insertRow("intake_submissions", { tenant_id: tenant.id, answers: clean }, { json: ["answers"] });
    return { ok: true };
  } catch {
    return { ok: false, error: "No pudimos enviar. Probá de nuevo en un rato." };
  }
}
