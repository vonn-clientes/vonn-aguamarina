import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import { addDays, dayStartISO, todayKey } from "@/lib/agenda";

export default async function DashboardHome() {
  const membership = await requireMembership();
  const supabase = await createClient();
  const t = membership.tenant.id;
  const today = todayKey();

  const [turnos, pedidos] = await Promise.all([
    supabase.from("ag_appointments").select("id", { count: "exact", head: true }).eq("tenant_id", t).in("status", ["pendiente", "confirmado"]).gte("starts_at", dayStartISO(today)).lt("starts_at", dayStartISO(addDays(today, 1))),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("tenant_id", t).eq("status", "pendiente"),
  ]);

  const cards = [
    { n: turnos.count ?? 0, label: "turnos para hoy", href: "/panel/agenda" },
    { n: pedidos.count ?? 0, label: "pedidos de la tienda por atender", href: "/panel/pedidos" },
  ];
  const shortcuts = [
    { href: "/panel/agenda/turnos/nuevo", title: "Agendar un turno", text: "Cargá un turno nuevo en segundos." },
    { href: "/panel/contenido", title: "Cambiar textos y datos", text: "Portada, contacto y horarios." },
    { href: "/panel/catalogo", title: "Tratamientos y productos", text: "Sumá, editá u ocultá lo que se ve en la página." },
    { href: "/panel/promos", title: "Promociones", text: "Publicá una promo del mes." },
  ];

  return (
    <>
      <PageHeader title="Hola, Ingrid" description="Esto es lo que pasa hoy en Aguamarina." />
      <div className="px-5 sm:px-10 pb-10 grid gap-5 max-w-3xl">
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="ag-pcard !gap-1 hover:shadow-md transition-shadow">
              <span className="vonn-text-display" style={{ color: "#2c7384" }}>{c.n}</span>
              <span className="vonn-text-caption text-ink-muted">{c.label}</span>
            </Link>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {shortcuts.map((s) => (
            <Link key={s.href} href={s.href} className="ag-pcard !gap-1 hover:shadow-md transition-shadow">
              <strong className="text-[1.0625rem] text-[#0e3b47]">{s.title}</strong>
              <span className="vonn-text-caption text-ink-muted">{s.text}</span>
            </Link>
          ))}
        </div>
        <Link href="/" target="_blank" className="ag-pbtn ag-pbtn--ghost self-start">Ver mi página</Link>
      </div>
    </>
  );
}
