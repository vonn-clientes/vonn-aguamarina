import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { PageHeader } from "@/components/panel/PageHeader";
import { InviteForm } from "@/components/panel/InviteForm";
import { RevokeButton } from "@/components/panel/RevokeButton";
import type { TenantMember } from "@/lib/types";

const statusLabel: Record<TenantMember["status"], string> = {
  activo: "Activo",
  invitado: "Invitación pendiente",
  revocado: "Acceso revocado",
};

export default async function EmpleadosPage() {
  const membership = await requireMembership();

  const members = await query<TenantMember>(
    "select * from tenant_members where tenant_id = $1 order by created_at asc",
    [membership.tenant.id],
  );

  return (
    <>
      <PageHeader
        title="Empleados"
        description="Invitá a las personas que van a tener acceso a este panel."
      />
      <div className="p-6 sm:p-10 flex flex-col gap-8 max-w-2xl">
        {membership.role === "owner" ? (
          <InviteForm />
        ) : (
          <p className="vonn-text-caption text-ink-muted">
            Solo el dueño del comercio puede invitar o quitar accesos.
          </p>
        )}

        <ul className="flex flex-col divide-y divide-line border-t border-line">
          {members.map((member) => (
            <li key={member.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="vonn-text-cuerpo">{member.invited_email}</p>
                <p className="vonn-text-caption text-ink-muted">
                  {member.role === "owner" ? "Dueño" : "Empleado"} · {statusLabel[member.status]}
                </p>
              </div>
              {membership.role === "owner" && member.status !== "revocado" && member.role !== "owner" && (
                <RevokeButton memberId={member.id} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
