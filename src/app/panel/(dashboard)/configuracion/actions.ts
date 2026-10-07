"use server";

import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { HorarioAtencion } from "@/lib/types";

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"] as const;

export async function updateConfiguracion(formData: FormData) {
  const membership = await requireMembership();
  const supabase = await createClient();

  const horario_atencion = {} as HorarioAtencion;
  for (const dia of DIAS) {
    horario_atencion[dia] = {
      abierto: formData.get(`${dia}_abierto`) === "on",
      desde: String(formData.get(`${dia}_desde`) || "09:00"),
      hasta: String(formData.get(`${dia}_hasta`) || "18:00"),
    };
  }

  const cupoRaw = String(formData.get("cupo_simultaneo") || "1");
  const cupo_simultaneo = Math.max(1, Number(cupoRaw) || 1);

  await supabase
    .from("tenants")
    .update({ horario_atencion, cupo_simultaneo })
    .eq("id", membership.tenant.id);

  revalidatePath("/panel/configuracion");
  revalidatePath("/");
}
