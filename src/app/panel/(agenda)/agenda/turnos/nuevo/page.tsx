import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { isDateKey, todayKey } from "@/lib/agenda";
import { TurnoForm } from "@/components/agenda/TurnoForm";
import { createAppointment } from "../../actions";

export default async function NuevoTurnoPage({ searchParams }: { searchParams: Promise<{ d?: string; c?: string; error?: string }> }) {
  const m = await requireMembership();
  const sp = await searchParams;

  const [clientsRes, servicesRes] = await Promise.all([
    query<{ id: string; full_name: string; first_name: string | null; last_name: string | null; phone: string | null }>(
      "select id, full_name, first_name, last_name, phone from ag_clients where tenant_id = $1 and archived = false order by full_name", [m.tenant.id]).then((data) => ({ data })),
    query<{ id: string; name: string; duration_minutes: number | null; active: boolean }>(
      "select id, name, duration_minutes, active from catalog_items where tenant_id = $1 and category <> 'Productos' order by active desc, sort_order", [m.tenant.id]).then((data) => ({ data })),
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
