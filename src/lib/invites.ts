import "server-only";
import { queryOne } from "@/lib/db";
import { isDbConfigured } from "@/lib/config";
import { hashToken, isValidToken } from "@/lib/session";

// Bootstrap público de auth: la capacidad es el token aleatorio de un solo
// uso; el tenant sale del miembro asociado, nunca de un campo del formulario.
export async function getInvite(token: string) {
  if (!isDbConfigured() || !isValidToken(token)) return null;
  return queryOne<{ password_hash: string | null }>(
    `select u.password_hash from app_invites i
     join tenant_members m on m.id = i.member_id
     join tenants t on t.id = m.tenant_id
     left join app_users u on u.email = m.invited_email::citext
     where i.token_hash = $1 and i.expires_at > now()
       and m.status = 'invitado' and t.status = 'activo'`,
    [hashToken(token)],
  );
}
