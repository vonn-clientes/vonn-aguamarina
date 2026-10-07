import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDateKey, todayKey } from "@/lib/agenda";
import { TurnoForm } from "@/components/agenda/TurnoForm";
import { createAppointment } from "../../actions";

export default async function NuevoTurnoPage({ searchParams }: { searchParams: Promise<{ d?: string; c?: string; error?: string }> }) {
  const m = await requireMembership();
  const sp = await searchParams;
  const supabase = await createClient();

  const [clientsRes, servicesRes] = await Promise.all([
    supabase.from("ag_clients").select("id, full_name, first_name, last_name, phone").eq("tenant_id", m.tenant.id).eq("archived", false).order("full_name"),
    supabase
      .from("catalog_items")
      .select("id, name, duration_minutes, active")
      .eq("tenant_id", m.tenant.id)
      .neq("category", "Productos")
      .order("active", { ascending: false })
      .order("sort_order"),
  ]);

  const day = isDateKey(sp.d) ? sp.d : todayKey();
  const clients = (clientsRes.data ?? []).map((c) => ({ id: c.id as string, name: c.full_name as string, first: (c.first_name ?? c.full_name) as string, last: (c.last_name ?? "") as string, phone: c.phone as string | null }));
  const services = (servicesRes.data ?? []).map((s) => ({ id: s.id as string, name: (s.active ? "" : "(oculto) ") + s.name, duration: s.duration_minutes as number | null }));
  const preClient = clients.find((c) => c.id === sp.c);

  return (
    <>
      <div className="ag-g-head">
        <div>
          <h1 className="ag-g-title">Nuevo turno</h1>
          <p className="ag-g-sub">Escribí el nombre: si ya vino antes, te lo sugiero.</p>
        </div>
      </div>
      {sp.error && <p className="ag-g-err">Faltan datos: revisá el nombre, el tratamiento, el día y la hora.</p>}
      <TurnoForm
        action={createAppointment}
        clients={clients}
        services={services}
        defaults={{ client_id: preClient?.id ?? "", client_first: preClient?.first, client_last: preClient?.last, date: day, time: "10:00", duration: 60 }}
        submitLabel="Agendar turno"
        cancelHref={`/panel/agenda?d=${day}`}
      />
      <p className="ag-g-hint" style={{ marginTop: "1rem" }}>
        Si es la primera vez, escribí nombre y apellido y se crea su ficha sola. Si ya vino, tocá la sugerencia que aparece.{" "}
        <Link href="/panel/agenda/clientes/nuevo" style={{ color: "var(--accent)" }}>
          Cargar una ficha completa
        </Link>
      </p>
    </>
  );
}
