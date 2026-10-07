import { notFound } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { dateKey, timeInput, type Appointment } from "@/lib/agenda";
import { TurnoForm } from "@/components/agenda/TurnoForm";
import { deleteAppointment, updateAppointment } from "../../actions";

export default async function EditarTurnoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const m = await requireMembership();
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.from("ag_appointments").select("*").eq("id", id).eq("tenant_id", m.tenant.id).maybeSingle();
  if (!data) notFound();
  const a = data as Appointment;

  const [clientsRes, servicesRes] = await Promise.all([
    supabase.from("ag_clients").select("id, full_name, phone").eq("tenant_id", m.tenant.id).eq("archived", false).order("full_name"),
    supabase.from("catalog_items").select("id, name, duration_minutes, active").eq("tenant_id", m.tenant.id).neq("category", "Productos").order("active", { ascending: false }).order("sort_order"),
  ]);
  const clients = (clientsRes.data ?? []).map((c) => ({ id: c.id as string, name: c.full_name as string, phone: c.phone as string | null }));
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
          client_name: a.client_name,
          client_phone: a.client_phone,
          catalog_item_id: a.catalog_item_id,
          service_name: a.service_name,
          date: day,
          time: timeInput(a.starts_at),
          duration: a.duration_min,
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
