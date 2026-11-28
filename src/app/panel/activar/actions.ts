"use server";

import { queryOne } from "@/lib/db";
import { getInvite } from "@/lib/invites";
import { createSession, hashPassword, hashToken, verifyPassword } from "@/lib/session";
import { redirect } from "next/navigation";

export type ActivationState = { error: string };

export async function activateAccount(
  token: string, _prev: ActivationState, formData: FormData,
): Promise<ActivationState> {
  const password = String(formData.get("password") || "");
  const failure = { error: "No se pudo activar el acceso. Revisá el enlace y la contraseña." };
  try {
    const invite = await getInvite(token);
    if (!invite) return failure;
    if (invite.password_hash) {
      if (!(await verifyPassword(password, invite.password_hash))) return failure;
    } else if (password.length < 8) {
      return { error: "Elegí una contraseña de al menos 8 caracteres." };
    }
    const result = await queryOne<{ user_id: string }>(
      "select activate_app_invite($1, $2, $3) as user_id",
      [hashToken(token), invite.password_hash ? null : await hashPassword(password), invite.password_hash],
    );
    if (!result?.user_id) return failure;
    await createSession(result.user_id);
  } catch {
    return failure;
  }
  redirect("/panel");
}
