import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { addDays, dateKey, dayStartISO, fmtDayShort, fmtTime, isDateKey, todayKey, weekStart, type Appointment } from "@/lib/agenda";

export default async function SemanaPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const m = await requireMembership();
  const sp = await searchParams;
  const today = todayKey();
  const start = weekStart(isDateKey(sp.d) ? sp.d : today);
  const end = addDays(start, 7);
  const supabase = await createClient();

  const { data } = await supabase
    .from("ag_appointments")
    .select("*")
    .eq("tenant_id", m.tenant.id)
    .gte("starts_at", dayStartISO(start))
    .lt("starts_at", dayStartISO(end))
    .order("starts_at");
  const list = (data as Appointment[]) ?? [];

  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const byDay = new Map<string, Appointment[]>();
  for (const a of list) {
    const k = dateKey(a.starts_at);
    byDay.set(k, [...(byDay.get(k) ?? []), a]);
  }
  const total = list.filter((a) => a.status !== "cancelado" && a.status !== "ausente").length;
  const range = `${fmtDayShort(start)} al ${fmtDayShort(addDays(start, 6))}`;

  return (
    <>
      <div className="ag-g-head">
        <div>
          <h1 className="ag-g-title">La semana</h1>
          <p className="ag-g-sub">
            {range} · {total} {total === 1 ? "turno" : "turnos"}
          </p>
        </div>
      </div>

      <div className="ag-g-daynav">
        <Link href={`/panel/agenda/semana?d=${addDays(start, -7)}`} aria-label="Semana anterior">
          ‹
        </Link>
        <Link href="/panel/agenda/semana" className="grow">
          Esta semana
        </Link>
        <Link href={`/panel/agenda/semana?d=${addDays(start, 7)}`} aria-label="Semana siguiente">
          ›
        </Link>
      </div>

      <div className="ag-g-week">
        {days.map((k) => {
          const items = byDay.get(k) ?? [];
          const [wd, num] = fmtDayShort(k).split(" ");
          return (
            <Link key={k} href={`/panel/agenda?d=${k}`} className={`ag-g-wday${k === today ? " ag-g-wday--today" : ""}`}>
              <div className="ag-g-wday__d">
                <b>{num ?? wd}</b>
                <span>{num ? wd.replace(".", "") : ""}</span>
              </div>
              {items.length === 0 ? (
                <p className="none">Sin turnos</p>
              ) : (
                <ul>
                  {items.map((a) => (
                    <li key={a.id} className={a.status === "cancelado" || a.status === "ausente" ? "off" : ""}>
                      <b>{fmtTime(a.starts_at)}</b>
                      <span>
                        {a.client_name} · {a.service_name}
                        {a.status === "pendiente" ? " ·  sin confirmar" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
