"use server";

import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { HorarioAtencion } from "@/lib/types";

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"] as const;

export async function updateConfiguracion(formData: FormData) {
  const membership = await requireMembership();

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

  await query("update tenants set horario_atencion = $1::jsonb, cupo_simultaneo = $2 where id = $3", [
    JSON.stringify(horario_atencion), cupo_simultaneo, membership.tenant.id,
  ]);

  revalidatePath("/panel/configuracion");
  revalidatePath("/");
}
