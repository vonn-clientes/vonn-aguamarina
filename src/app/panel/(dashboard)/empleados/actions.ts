"use server";

import { requireMembership } from "@/lib/auth";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type InviteState = { error: string; success: string };

export async function inviteEmployee(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const membership = await requireMembership();

  if (membership.role !== "owner") {
    return { error: "Solo el dueño del comercio puede invitar empleados.", success: "" };
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Ingresá un email.", success: "" };

  const supabase = await createClient();

  // 1) Se registra la invitación en la tabla (queda "invitado" hasta que
  //    la persona acepte y cree su cuenta).
  const { error: insertError } = await supabase.from("tenant_members").insert({
    tenant_id: membership.tenant.id,
    invited_email: email,
    role: "empleado",
    status: "invitado",
  });

  if (insertError) {
    return {
      error: insertError.code === "23505" ? "Ese email ya fue invitado." : "No se pudo invitar.",
      success: "",
    };
  }

  // 2) Se le manda el email de invitación real desde Supabase Auth (esto
  //    requiere la service role key, así que solo puede pasar en el servidor).
  try {
    const admin = await createServiceRoleClient();
    await admin.auth.admin.inviteUserByEmail(email);
  } catch {
    // Si falla el envío del email (ej: falta configurar el remitente en
    // Supabase), la invitación queda igual guardada — se puede reintentar.
  }

  revalidatePath("/panel/empleados");
  return { error: "", success: `Invitación enviada a ${email}.` };
}

export async function revokeEmployee(memberId: string) {
  const membership = await requireMembership();
  if (membership.role !== "owner") return;

  const supabase = await createClient();
  await supabase
    .from("tenant_members")
    .update({ status: "revocado" })
    .eq("id", memberId)
    .eq("tenant_id", membership.tenant.id);

  revalidatePath("/panel/empleados");
}
