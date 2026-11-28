import { notFound } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { dateKey, timeInput, type Appointment } from "@/lib/agenda";
import { TurnoForm } from "@/components/agenda/TurnoForm";
import { deleteAppointment, updateAppointment } from "../../actions";

export default async function EditarTurnoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const m = await requireMembership();
  const { id } = await params;
  const sp = await searchParams;

  const a = /^[0-9a-f-]{36}$/i.test(id)
    ? await queryOne<Appointment>("select * from ag_appointments where id = $1 and tenant_id = $2", [id, m.tenant.id])
    : null;
  if (!a) notFound();

  const [clientsRes, servicesRes] = await Promise.all([
    query<{ id: string; full_name: string; first_name: string | null; last_name: string | null; phone: string | null }>(
      "select id, full_name, first_name, last_name, phone from ag_clients where tenant_id = $1 and archived = false order by full_name", [m.tenant.id]).then((data) => ({ data })),
    query<{ id: string; name: string; duration_minutes: number | null; active: boolean }>(
      "select id, name, duration_minutes, active from catalog_items where tenant_id = $1 and category <> 'Productos' order by active desc, sort_order", [m.tenant.id]).then((data) => ({ data })),
  ]);
  const clients = (clientsRes.data ?? []).map((c) => ({ id: c.id as string, name: c.full_name as string, first: (c.first_name ?? c.full_name) as string, last: (c.last_name ?? "") as string, phone: c.phone as string | null }));
  const services = (servicesRes.data ?? []).map((s) => ({ id: s.id as string, name: (s.active ? "" : "(oculto) ") + s.name, duration: s.duration_minutes as number | null }));
  const day = dateKey(a.starts_at);

  return (
    <>
      <div className="ag-g-head">
        <div>
          <h1 className="ag-g-title">Editar turno</h1>
          <p className="ag-g-sub">{a.client_name}</p>
        </div>
      </div>
      {sp.error && <p className="ag-g-err">Faltan datos: revisá el nombre, el tratamiento, el día y la hora.</p>}
      <TurnoForm
        action={updateAppointment.bind(null, a.id)}
        clients={clients}
        services={services}
        defaults={{
          client_id: a.client_id,
          client_first: a.client_name.split(" ")[0],
          client_last: a.client_name.split(" ").slice(1).join(" "),
          client_phone: a.client_phone,
          catalog_item_id: a.catalog_item_id,
          service_name: a.service_name,
          date: day,
          time: timeInput(a.starts_at),
          duration: a.duration_min,
          session: a.session_number,
          price: a.price,
          notes: a.notes,
        }}
        submitLabel="Guardar cambios"
        cancelHref={`/panel/agenda?d=${day}`}
      />
      <form action={deleteAppointment.bind(null, a.id)} style={{ marginTop: "1.25rem" }}>
        <button className="ag-g-btn ag-g-btn--danger">Eliminar este turno</button>
      </form>
    </>
  );
}
