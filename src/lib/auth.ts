import "server-only";
import { queryOne } from "@/lib/db";
import { readSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { TenantMember, Tenant } from "@/lib/types";

export type Membership = {
  userId: string;
  email: string;
  tenant: Tenant;
  role: TenantMember["role"];
};

async function findMembership(): Promise<Membership | null> {
  const user = await readSession();
  if (!user) return null;
  // El tenant se descubre por el usuario de la sesión, nunca por un id que
  // mande el navegador: esta consulta es la base del aislamiento entre clientes.
  const m = await queryOne<{ role: TenantMember["role"]; tenant: Tenant }>(
    `select m.role, row_to_json(t) as tenant
     from tenant_members m join tenants t on t.id = m.tenant_id
     where m.user_id = $1 and m.status = 'activo' and t.status = 'activo'
     order by m.created_at, m.id limit 1`,
    [user.id],
  );
  if (!m) return null;
  return { userId: user.id, email: user.email, tenant: m.tenant, role: m.role };
}

// Se usa al principio de cada página del panel: sin sesión manda a
// /panel/login; con sesión pero sin tenant activo, a /panel/sin-acceso.
export async function requireMembership(): Promise<Membership> {
  const user = await readSession();
  if (!user) redirect("/panel/login");
  const m = await findMembership();
  if (!m) redirect("/panel/sin-acceso");
  return m;
}

// Igual pero sin redirigir: para rutas de API (devuelve null si no hay acceso).
export async function getMembership(): Promise<Membership | null> {
  return findMembership();
}
