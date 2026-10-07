import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import Link from "next/link";

export default async function DashboardHome() {
  const membership = await requireMembership();
  const supabase = await createClient();

  const [{ count: unreadMessages }, { count: openTickets }] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", membership.tenant.id)
      .eq("is_read", false),
    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", membership.tenant.id)
      .eq("status", "abierto"),
  ]);

  const cards = [
    { label: "Mensajes sin leer", value: unreadMessages ?? 0, href: "/panel/mensajes" },
    { label: "Tickets de soporte abiertos", value: openTickets ?? 0, href: "/panel/soporte" },
  ];

  return (
    <>
      <PageHeader
        title={`Hola, ${membership.tenant.business_name}`}
        description="Este es el resumen de tu panel."
      />
      <div className="p-6 sm:p-10 grid gap-4 sm:grid-cols-2 max-w-2xl">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-md border border-line bg-surface p-6 flex flex-col gap-1 shadow-sm hover:border-primary transition-colors"
          >
            <span className="vonn-text-display" style={{ fontSize: 40, lineHeight: "48px" }}>
              {card.value}
            </span>
            <span className="vonn-text-cuerpo text-ink-muted">{card.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
