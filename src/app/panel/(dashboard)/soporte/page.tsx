import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { PageHeader } from "@/components/panel/PageHeader";
import { SupportForm } from "@/components/panel/SupportButton";
import type { SupportTicket } from "@/lib/types";

const statusLabel: Record<SupportTicket["status"], string> = {
  abierto: "Abierto",
  en_progreso: "En progreso",
  resuelto: "Resuelto",
};

export default async function SoportePage() {
  const membership = await requireMembership();

  const tickets = await query<SupportTicket>(
    "select * from support_tickets where tenant_id = $1 order by created_at desc",
    [membership.tenant.id],
  );

  return (
    <>
      <PageHeader
        title="Ayuda"
        description="¿Algo no funciona o no sabés cómo hacerlo? Avisale al equipo de VONN desde acá."
      />
      <div className="px-5 sm:px-10 pb-10 flex flex-col gap-4 max-w-2xl">
        <SupportForm />
        <h2 className="ag-item__name" style={{ marginTop: ".5rem" }}>Tus reportes</h2>
        {tickets.length === 0 && (
          <p className="vonn-text-cuerpo text-ink-muted">Todavía no reportaste nada. ¡Buena señal!</p>
        )}
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ag-pcard !gap-1">
            <div className="flex items-center justify-between gap-4">
              <p className="vonn-text-cuerpo font-medium">{ticket.category || "Sin categoría"}</p>
              <span className="vonn-text-caption text-ink-muted">{statusLabel[ticket.status]}</span>
            </div>
            <p className="vonn-text-cuerpo text-ink-muted">{ticket.description}</p>
            <span className="vonn-text-caption text-ink-muted">
              {new Date(ticket.created_at).toLocaleDateString("es-AR")}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
