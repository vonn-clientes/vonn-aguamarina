import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { addDays, dayStartISO, fmtDayLong, isDateKey, money, overlaps, todayKey, type Appointment } from "@/lib/agenda";
import { AppointmentCard } from "@/components/agenda/AppointmentCard";

export default async function HoyPage({ searchParams }: { searchParams: Promise<{ d?: string; aviso?: string }> }) {
  const m = await requireMembership();
  const sp = await searchParams;
  const today = todayKey();
  const day = isDateKey(sp.d) ? sp.d : today;
  const supabase = await createClient();

  const [dayRes, soonRes, payRes] = await Promise.all([
    supabase
      .from("ag_appointments")
      .select("*")
      .eq("tenant_id", m.tenant.id)
      .gte("starts_at", dayStartISO(day))
      .lt("starts_at", dayStartISO(addDays(day, 1)))
      .order("starts_at"),
    day === today
      ? supabase
          .from("ag_appointments")
          .select("*")
          .eq("tenant_id", m.tenant.id)
          .eq("status", "pendiente")
          .gte("starts_at", dayStartISO(addDays(day, 1)))
          .lt("starts_at", dayStartISO(addDays(day, 4)))
          .order("starts_at")
      : Promise.resolve({ data: [] as Appointment[] }),
    supabase.from("ag_movements").select("amount").eq("tenant_id", m.tenant.id).eq("kind", "pago").eq("occurred_on", day),
  ]);

  const list = (dayRes.data as Appointment[]) ?? [];
  const soon = (soonRes.data as Appointment[]) ?? [];
  const cobrado = (payRes.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const active = list.filter((a) => a.status !== "cancelado" && a.status !== "ausente");
  const unconfirmed = list.filter((a) => a.status === "pendiente").length;
  const back = `/panel/agenda?d=${day}`;
  const clashes = overlaps(list);

  return (
    <>
      <div className="ag-g-head">
        <div>
          <h1 className="ag-g-title">{day === today ? "Hoy" : fmtDayLong(day)}</h1>
          <p className="ag-g-sub">{day === today ? fmtDayLong(day) : "Turnos del día"}</p>
        </div>
      </div>

      {sp.aviso === "superpuesto" && (
        <p className="ag-g-clash ag-g-clash--top">Guardado. Ojo: ese turno se superpone con otro. Si atendés en simultáneo, no pasa nada.</p>
      )}

      <div className="ag-g-daynav">
        <Link href={`/panel/agenda?d=${addDays(day, -1)}`} aria-label="Día anterior">
          ‹
        </Link>
        <Link href="/panel/agenda" className="grow">
          {day === today ? "Hoy" : "Volver a hoy"}
        </Link>
        <Link href={`/panel/agenda?d=${addDays(day, 1)}`} aria-label="Día siguiente">
          ›
        </Link>
      </div>

      <div className="ag-g-stats">
        <div className="ag-g-stat">
          <b>{active.length}</b>
          <span>{active.length === 1 ? "turno" : "turnos"}</span>
        </div>
        <div className={`ag-g-stat${unconfirmed ? " ag-g-stat--warn" : ""}`}>
          <b>{unconfirmed}</b>
          <span>sin confirmar</span>
        </div>
        <div className="ag-g-stat ag-g-stat--ok" style={{ gridColumn: "1 / -1" }}>
          <b>{money(cobrado)}</b>
          <span>cobrado en el día</span>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="ag-g-empty">
          <b>No hay turnos este día</b>
          Tocá “Nuevo turno” para agendar uno.
        </div>
      ) : (
        <ul className="ag-g-list">
          {list.map((a) => (
            <AppointmentCard key={a.id} a={a} back={back} clash={clashes.get(a.id)} />
          ))}
        </ul>
      )}

      {soon.length > 0 && (
        <>
          <h2 className="ag-g-h2">Próximos días sin confirmar</h2>
          <ul className="ag-g-list">
            {soon.map((a) => (
              <AppointmentCard key={a.id} a={a} back={back} showDate />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
