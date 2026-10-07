"use server";

import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TicketState = { error: string; success: string };

// El "bot filtro" del documento maestro: antes de mandar el reporte, se le
// pide al cliente que elija una categoría rápida para que quede
// pre-clasificado (esto es lo que en Fase 4 va a leer Claude para ubicar
// el error más rápido en el repositorio del cliente).
export async function createTicket(_prev: TicketState, formData: FormData): Promise<TicketState> {
  const membership = await requireMembership();
  const supabase = await createClient();

  const category = String(formData.get("category") || "");
  const description = String(formData.get("description") || "").trim();

  if (!description) return { error: "Contanos qué está pasando.", success: "" };

  const { error } = await supabase.from("support_tickets").insert({
    tenant_id: membership.tenant.id,
    created_by: membership.userId,
    category,
    description,
  });

  if (error) return { error: "No se pudo enviar el reporte. Probá de nuevo.", success: "" };

  revalidatePath("/panel/soporte");
  return { error: "", success: "Listo, le llegó el aviso a VONN." };
}
