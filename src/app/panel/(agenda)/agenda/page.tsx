import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { addDays, dayStartISO, fmtDayLong, isDateKey, money, overlaps, todayKey, type Appointment } from "@/lib/agenda";
import { AppointmentCard } from "@/components/agenda/AppointmentCard";

export default async function HoyPage({ searchParams }: { searchParams: Promise<{ d?: string; aviso?: string }> }) {
  const m = await requireMembership();
  const sp = await searchParams;
  const today = todayKey();
  const day = isDateKey(sp.d) ? sp.d : today;

  const [list, soon, pays] = await Promise.all([
    query<Appointment>(
      "select * from ag_appointments where tenant_id = $1 and starts_at >= $2 and starts_at < $3 order by starts_at",
      [m.tenant.id, dayStartISO(day), dayStartISO(addDays(day, 1))],
    ),
    day === today
      ? query<Appointment>(
          "select * from ag_appointments where tenant_id = $1 and status = 'pendiente' and starts_at >= $2 and starts_at < $3 order by starts_at",
          [m.tenant.id, dayStartISO(addDays(day, 1)), dayStartISO(addDays(day, 4))],
        )
      : Promise.resolve([] as Appointment[]),
    query<{ amount: number }>(
      "select amount from ag_movements where tenant_id = $1 and kind = 'pago' and occurred_on = $2",
      [m.tenant.id, day],
    ),
  ]);

  const cobrado = pays.reduce((s, r) => s + Number(r.amount), 0);
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
