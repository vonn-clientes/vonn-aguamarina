import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import type { SupportTicket } from "@/lib/types";

const statusLabel: Record<SupportTicket["status"], string> = {
  abierto: "Abierto",
  en_progreso: "En progreso",
  resuelto: "Resuelto",
};

export default async function SoportePage() {
  const membership = await requireMembership();
  const supabase = await createClient();

  const { data } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("tenant_id", membership.tenant.id)
    .order("created_at", { ascending: false });

  const tickets = (data as SupportTicket[]) ?? [];

  return (
    <>
      <PageHeader
        title="Soporte"
        description="Tus reportes a VONN. Usá el botón (?) de la esquina para crear uno nuevo."
      />
      <div className="p-6 sm:p-10 flex flex-col gap-4 max-w-2xl">
        {tickets.length === 0 && (
          <p className="vonn-text-cuerpo text-ink-muted">Todavía no reportaste nada. ¡Buena señal!</p>
        )}
        {tickets.map((ticket) => (
          <div key={ticket.id} className="rounded-md border border-line bg-surface p-5 flex flex-col gap-1">
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
