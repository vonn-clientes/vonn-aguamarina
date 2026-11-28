"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";

// La cliente confirma o cancela su turno con el link secreto (sin iniciar sesión).
export async function respondAppointment(token: string, action: "confirmar" | "cancelar") {
  // Solo cuenta el token secreto: la función SQL busca el turno por confirm_token.
  if (typeof token === "string" && token.length >= 8 && token.length <= 128) {
    await query("select ag_respond_appointment($1::text, $2::text)", [token, action]);
  }
  redirect(`/turno/${token}`);
}
