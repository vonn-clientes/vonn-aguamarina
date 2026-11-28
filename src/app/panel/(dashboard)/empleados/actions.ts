"use server";

import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { hashToken, newToken } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type InviteState = { error: string; success: string; invitePath?: string };

export async function inviteEmployee(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const membership = await requireMembership();
  if (membership.role !== "owner") {
    return { error: "Solo el dueño del comercio puede invitar empleados.", success: "" };
  }
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Ingresá un email.", success: "" };

  const token = newToken();
  try {
    // Una única sentencia: nunca queda un miembro sin su enlace si falla el insert.
    await query(
      `with member as (
         insert into tenant_members (tenant_id, invited_email, role, status)
         values ($1, $2, 'empleado', 'invitado') returning id
       ) insert into app_invites (token_hash, member_id, expires_at)
         select $3, id, now() + interval '7 days' from member`,
      [membership.tenant.id, email, hashToken(token)],
    );
  } catch (error) {
    return {
      error: (error as { code?: string }).code === "23505" ? "Ese email ya fue invitado." : "No se pudo invitar.",
      success: "",
    };
  }
  revalidatePath("/panel/empleados");
  return { error: "", success: `Invitación creada para ${email}.`, invitePath: `/panel/activar?token=${token}` };
}

export async function revokeEmployee(memberId: string) {
  const membership = await requireMembership();
  if (membership.role !== "owner") return;
  await query(
    `update tenant_members set status = 'revocado'
     where id = $1 and tenant_id = $2 and role = 'empleado'`,
    [memberId, membership.tenant.id],
  );
  revalidatePath("/panel/empleados");
}
