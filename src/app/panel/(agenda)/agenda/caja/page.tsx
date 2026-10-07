import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EXPENSE_CATEGORIES, PAY_METHODS, addMonths, balance, dateKey, fmtDayShort, fmtMonth, isMonthKey, money, monthRange, todayKey, type Movement } from "@/lib/agenda";
import { addMovement, deleteMovement } from "../actions";

export default async function CajaPage({ searchParams }: { searchParams: Promise<{ m?: string; error?: string }> }) {
  const tenant = await requireMembership();
  const sp = await searchParams;
  const now = todayKey().slice(0, 7);
  const ym = isMonthKey(sp.m) ? sp.m : now;
  const { from, to } = monthRange(ym);
  const supabase = await createClient();

  const [monthRes, allRes] = await Promise.all([
    supabase.from("ag_movements").select("*, client:ag_clients(full_name)").eq("tenant_id", tenant.tenant.id).gte("occurred_on", from).lt("occurred_on", to).in("kind", ["pago", "gasto"]).order("occurred_on", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("ag_movements").select("client_id, kind, amount").eq("tenant_id", tenant.tenant.id).not("client_id", "is", null).in("kind", ["cargo", "pago"]),
  ]);

  type Row = Movement & { client: { full_name: string } | null };
  const rows = (monthRes.data as unknown as Row[]) ?? [];
  const cobrado = rows.filter((r) => r.kind === "pago").reduce((s, r) => s + Number(r.amount), 0);
  const gastos = rows.filter((r) => r.kind === "gasto").reduce((s, r) => s + Number(r.amount), 0);
  const resultado = cobrado - gastos;

  const porMetodo = new Map<string, number>();
  for (const r of rows) if (r.kind === "pago") porMetodo.set(r.method || "Sin indicar", (porMetodo.get(r.method || "Sin indicar") ?? 0) + Number(r.amount));

  const perClient = new Map<string, { kind: "cargo" | "pago"; amount: number }[]>();
  for (const r of allRes.data ?? []) perClient.set(r.client_id, [...(perClient.get(r.client_id) ?? []), r as { kind: "cargo" | "pago"; amount: number }]);
  let porCobrar = 0;
  for (const list of perClient.values()) {
    const b = balance(list);
    if (b > 0) porCobrar += b;
  }

  const here = `/panel/agenda/caja?m=${ym}`;
  const defDate = ym === now ? todayKey() : `${ym}-01`;

  return (
    <>
      <div className="ag-g-head">
        <div>
          <h1 className="ag-g-title">Caja</h1>
          <p className="ag-g-sub">Lo que entra y lo que sale, mes a mes.</p>
        </div>
      </div>

      <div className="ag-g-daynav">
        <Link href={`/panel/agenda/caja?m=${addMonths(ym, -1)}`} aria-label="Mes anterior">
          ‹
        </Link>
        <Link href="/panel/agenda/caja" className="grow" style={{ textTransform: "capitalize" }}>
          {fmtMonth(ym)}
        </Link>
        <Link href={`/panel/agenda/caja?m=${addMonths(ym, 1)}`} aria-label="Mes siguiente">
          ›
        </Link>
      </div>

      {sp.error && <p className="ag-g-err">Escribí un monto válido.</p>}

      <div className="ag-g-stats ag-g-stats--4">
        <div className="ag-g-stat ag-g-stat--ok">
          <b>{money(cobrado)}</b>
          <span>cobrado</span>
        </div>
        <div className="ag-g-stat">
          <b>{money(gastos)}</b>
          <span>gastos</span>
        </div>
        <div className="ag-g-stat">
          <b>{money(resultado)}</b>
          <span>resultado del mes</span>
        </div>
        <div className={`ag-g-stat${porCobrar > 0 ? " ag-g-stat--warn" : ""}`}>
          <b>{money(porCobrar)}</b>
          <span>por cobrar (todas las cuentas)</span>
        </div>
      </div>

      {porCobrar > 0 && (
        <Link href="/panel/agenda/clientes/deudas" className="ag-g-btn ag-g-debtbtn">
          Ver quién debe y desde cuándo
        </Link>
      )}

      {porMetodo.size > 0 && (
        <p className="ag-g-hint" style={{ marginBottom: "1rem" }}>
          Cobrado por medio: {[...porMetodo.entries()].map(([k, v]) => `${k} ${money(v)}`).join(" · ")}
        </p>
      )}

      <details className="ag-g-more" style={{ marginBottom: "0.6rem" }}>
        <summary>Anotar un gasto</summary>
        <form action={addMovement}>
          <input type="hidden" name="kind" value="gasto" />
          <input type="hidden" name="back" value={here} />
          <div className="ag-g-row2">
            <label className="ag-g-field">
              <span>Monto</span>
              <input name="amount" inputMode="decimal" required placeholder="0" />
            </label>
            <label className="ag-g-field">
              <span>Rubro</span>
              <select name="category" defaultValue="Insumos">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="ag-g-row2">
            <label className="ag-g-field">
              <span>Pagado con</span>
              <select name="method" defaultValue="Efectivo">
                {PAY_METHODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="ag-g-field">
              <span>Fecha</span>
              <input name="occurred_on" type="date" defaultValue={defDate} />
            </label>
          </div>
          <label className="ag-g-field">
            <span>Detalle (opcional)</span>
            <input name="concept" placeholder="Qué se compró o pagó" />
          </label>
          <button className="ag-g-btn ag-g-btn--main">Guardar gasto</button>
        </form>
      </details>

      <details className="ag-g-more">
        <summary>Anotar un ingreso sin cuenta (venta en el momento)</summary>
        <form action={addMovement}>
          <input type="hidden" name="kind" value="pago" />
          <input type="hidden" name="back" value={here} />
          <div className="ag-g-row2">
            <label className="ag-g-field">
              <span>Monto</span>
              <input name="amount" inputMode="decimal" required placeholder="0" />
            </label>
            <label className="ag-g-field">
              <span>Medio de pago</span>
              <select name="method" defaultValue="Efectivo">
                {PAY_METHODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="ag-g-row2">
            <label className="ag-g-field">
              <span>Detalle</span>
              <input name="concept" placeholder="Producto vendido…" />
            </label>
            <label className="ag-g-field">
              <span>Fecha</span>
              <input name="occurred_on" type="date" defaultValue={defDate} />
            </label>
          </div>
          <button className="ag-g-btn ag-g-btn--main">Guardar ingreso</button>
        </form>
      </details>

      <h2 className="ag-g-h2">Movimientos del mes</h2>
      {rows.length === 0 ? (
        <div className="ag-g-empty">
          <b>Sin movimientos este mes</b>
          Los cobros de turnos y los gastos que anotes aparecen acá.
        </div>
      ) : (
        <div className="ag-g-rows">
          {rows.map((r) => (
            <div key={r.id} className="ag-g-line">
              <div>
                <strong>{r.client?.full_name || r.concept || (r.kind === "gasto" ? "Gasto" : "Ingreso")}</strong>
                <small>
                  {fmtDayShort(r.occurred_on)} · {r.kind === "gasto" ? "Gasto" : "Cobro"}
                  {r.method ? ` · ${r.method}` : ""}
                  {r.client?.full_name && r.concept ? ` · ${r.concept}` : ""}
                </small>
              </div>
              <span className={`ag-g-amt ${r.kind === "gasto" ? "ag-g-amt--out" : "ag-g-amt--in"}`}>
                {r.kind === "gasto" ? "−" : "+"}
                {money(r.amount)}
              </span>
              <form action={deleteMovement.bind(null, r.id, here)}>
                <button className="ag-g-del" aria-label="Borrar movimiento" title="Borrar">
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
