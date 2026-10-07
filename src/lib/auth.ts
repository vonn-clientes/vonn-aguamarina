import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { TenantMember, Tenant } from "@/lib/types";

export type Membership = {
  userId: string;
  email: string;
  tenant: Tenant;
  role: TenantMember["role"];
};

// Se usa al principio de cada página del panel: si no hay sesión, manda a
// /panel/login. Si hay sesión pero el usuario no pertenece a ningún tenant
// activo, manda a /panel/sin-acceso. Si todo está bien, devuelve con qué
// tenant y con qué rol está entrando.
export async function requireMembership(): Promise<Membership> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/panel/login");

  const { data: membership } = await supabase
    .from("tenant_members")
    .select("role, tenant:tenants(*)")
    .eq("user_id", user!.id)
    .eq("status", "activo")
    .limit(1)
    .maybeSingle();

  if (!membership || !membership.tenant) redirect("/panel/sin-acceso");

  return {
    userId: user!.id,
    email: user!.email ?? "",
    tenant: membership.tenant as unknown as Tenant,
    role: membership.role as TenantMember["role"],
  };
}
