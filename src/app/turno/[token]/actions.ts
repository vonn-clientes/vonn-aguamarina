"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// La clienta confirma o cancela su turno con el link secreto (sin iniciar sesión).
export async function respondAppointment(token: string, action: "confirmar" | "cancelar") {
  const supabase = await createClient();
  await supabase.rpc("ag_respond_appointment", { p_token: token, p_action: action });
  redirect(`/turno/${token}`);
}
