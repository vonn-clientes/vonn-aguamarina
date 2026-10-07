import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { balance, chatLink, fmtDayShort, money, todayKey, type Movement } from "@/lib/agenda";

type Debtor = { id: string; name: string; phone: string | null; debt: number; since: string; days: number; lastPay: string | null };

const daysBetween = (a: string, b: string) => Math.round((new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()) / 86400000);

export default async function DeudasPage() {
  const m = await requireMembership();
  const supabase = await createClient();
  const today = todayKey();

  const [clientsRes, movRes] = await Promise.all([
    supabase.from("ag_clients").select("id, full_name, phone").eq("tenant_id", m.tenant.id).eq("archived", false),
    supabase.from("ag_movements").select("client_id, kind, amount, occurred_on").eq("tenant_id", m.tenant.id).not("client_id", "is", null).in("kind", ["cargo", "pago"]).order("occurred_on").order("created_at"),
  ]);

  const byClient = new Map<string, Pick<Movement, "kind" | "amount" | "occurred_on">[]>();
  for (const r of movRes.data ?? []) byClient.set(r.client_id, [...(byClient.get(r.client_id) ?? []), r as Pick<Movement, "kind" | "amount" | "occurred_on">]);

  const debtors: Debtor[] = [];
  for (const c of clientsRes.data ?? []) {
    const movs = byClient.get(c.id) ?? [];
    const debt = balance(movs);
    if (debt <= 0) continue;
    // La deuda más vieja: los pagos se aplican primero a los cargos más antiguos.
    let paid = movs.filter((x) => x.kind === "pago").reduce((s, x) => s + Number(x.amount), 0);
    let since = today;
    for (const x of movs.filter((y) => y.kind === "cargo")) {
      const amt = Number(x.amount);
      if (paid >= amt) paid -= amt;
      else {
        since = x.occurred_on;
        break;
      }
    }
    const pays = movs.filter((x) => x.kind === "pago");
    debtors.push({ id: c.id, name: c.full_name, phone: c.phone, debt, since, days: Math.max(0, daysBetween(since, today)), lastPay: pays.length ? pays[pays.length - 1].occurred_on : null });
  }
  debtors.sort((a, b) => b.days - a.days);
  const total = debtors.reduce((s, d) => s + d.debt, 0);

  return (
    <>
      <div className="ag-g-head">
        <div>
          <h1 className="ag-g-title">Clientes con deuda</h1>
          <p className="ag-g-sub">{debtors.length === 0 ? "Nadie debe nada" : `${debtors.length} ${debtors.length === 1 ? "cliente" : "clientes"} · ${money(total)} por cobrar`}</p>
        </div>
        <Link href="/panel/agenda/clientes" className="ag-g-btn">
          Todos los clientes
        </Link>
      </div>

      {debtors.length === 0 ? (
        <div className="ag-g-empty">
          <b>Todo al día</b>
          Cuando un turno se cobre de menos, el cliente aparece acá.
        </div>
      ) : (
        <div className="ag-g-rows">
          {debtors.map((d) => (
            <div key={d.id} className="ag-g-line ag-g-debtor">
              <Link href={`/panel/agenda/clientes/${d.id}`} className="ag-g-debtor__main">
                <strong>{d.name}</strong>
                <small>
                  Debe desde el {fmtDayShort(d.since)} · {d.days === 0 ? "hoy" : d.days === 1 ? "hace 1 día" : `hace ${d.days} días`}
                  {d.lastPay ? ` · último pago ${fmtDayShort(d.lastPay)}` : " · todavía no pagó nada"}
                </small>
              </Link>
              <div className="ag-g-debtor__side">
                <span className="ag-g-amt ag-g-amt--debt">{money(d.debt)}</span>
                {d.phone && (
                  <a className="ag-g-btn ag-g-btn--wa ag-g-btn--small" href={chatLink(d.phone, `Hola ${d.name.split(" ")[0]}! Te escribo de Aguamarina: te quedó un saldo de ${money(d.debt)}. Cuando puedas me avisás. ¡Gracias!`)} target="_blank" rel="noopener noreferrer">
                    Avisar
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
