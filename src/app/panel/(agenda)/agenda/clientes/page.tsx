import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { balance, money, type Client, type Movement } from "@/lib/agenda";

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const m = await requireMembership();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const like = `%${q.replace(/[%_\\,()]/g, " ")}%`;
  const [clientsRes, movRes] = await Promise.all([
    (q
      ? query<Client>(
          "select * from ag_clients where tenant_id = $1 and archived = false and (full_name ilike $2 or phone ilike $2) order by full_name",
          [m.tenant.id, like],
        )
      : query<Client>("select * from ag_clients where tenant_id = $1 and archived = false order by full_name", [m.tenant.id])
    ).then((data) => ({ data })),
    query<{ client_id: string; kind: string; amount: number }>(
      "select client_id, kind, amount from ag_movements where tenant_id = $1 and client_id is not null and kind in ('cargo','pago')",
      [m.tenant.id],
    ).then((data) => ({ data })),
  ]);

  const clients = (clientsRes.data as Client[]) ?? [];
  const byClient = new Map<string, Pick<Movement, "kind" | "amount">[]>();
  for (const r of movRes.data ?? []) byClient.set(r.client_id, [...(byClient.get(r.client_id) ?? []), r as Pick<Movement, "kind" | "amount">]);

  return (
    <>
      <div className="ag-g-head">
        <div>
          <h1 className="ag-g-title">Clientes</h1>
          <p className="ag-g-sub">
            {clients.length} {clients.length === 1 ? "ficha" : "fichas"}
          </p>
        </div>
        <Link href="/panel/agenda/clientes/nuevo" className="ag-g-btn ag-g-btn--main">
          + Nuevo cliente
        </Link>
      </div>

      <Link href="/panel/agenda/clientes/deudas" className="ag-g-btn ag-g-debtbtn">
        Ver clientes con deuda
      </Link>

      <form className="ag-g-search" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre o teléfono" aria-label="Buscar cliente" />
        <button className="ag-g-btn">Buscar</button>
      </form>

      {clients.length === 0 ? (
        <div className="ag-g-empty">
          <b>{q ? "No encontré a nadie con ese dato" : "Todavía no hay clientes"}</b>
          Las fichas se crean solas al agendar el primer turno, o desde “Nuevo cliente”.
        </div>
      ) : (
        <div className="ag-g-rows">
          {clients.map((c) => {
            const saldo = balance(byClient.get(c.id) ?? []);
            return (
              <Link key={c.id} href={`/panel/agenda/clientes/${c.id}`} className="ag-g-line">
                <div>
                  <strong>{c.full_name}</strong>
                  <small>{c.phone || "Sin teléfono"}</small>
                </div>
                {saldo > 0 && <span className="ag-g-amt ag-g-amt--debt">Debe {money(saldo)}</span>}
                {saldo < 0 && <span className="ag-g-amt ag-g-amt--in">A favor {money(-saldo)}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
