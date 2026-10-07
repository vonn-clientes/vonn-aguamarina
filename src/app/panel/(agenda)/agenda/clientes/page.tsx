import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { balance, money, type Client, type Movement } from "@/lib/agenda";

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const m = await requireMembership();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const supabase = await createClient();

  let query = supabase.from("ag_clients").select("*").eq("tenant_id", m.tenant.id).eq("archived", false).order("full_name");
  if (q) query = query.or(`full_name.ilike.%${q.replace(/[%,()]/g, " ")}%,phone.ilike.%${q.replace(/[%,()]/g, " ")}%`);
  const [clientsRes, movRes] = await Promise.all([
    query,
    supabase.from("ag_movements").select("client_id, kind, amount").eq("tenant_id", m.tenant.id).not("client_id", "is", null).in("kind", ["cargo", "pago"]),
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
