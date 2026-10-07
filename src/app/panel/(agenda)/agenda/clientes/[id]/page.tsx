import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PAY_METHODS, balance, chatLink, dateKey, fmtDayShort, money, todayKey, type Appointment, type Client, type Movement } from "@/lib/agenda";
import { ClientForm } from "@/components/agenda/ClientForm";
import { AppointmentCard } from "@/components/agenda/AppointmentCard";
import { addMovement, archiveClient, deleteMovement, saveClient } from "../../actions";

export default async function FichaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const m = await requireMembership();
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.from("ag_clients").select("*").eq("id", id).eq("tenant_id", m.tenant.id).maybeSingle();
  if (!data) notFound();
  const c = data as Client;

  const [movRes, apRes] = await Promise.all([
    supabase.from("ag_movements").select("*").eq("tenant_id", m.tenant.id).eq("client_id", id).order("occurred_on", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("ag_appointments").select("*").eq("tenant_id", m.tenant.id).eq("client_id", id).order("starts_at", { ascending: false }).limit(30),
  ]);
  const movs = (movRes.data as Movement[]) ?? [];
  const appts = (apRes.data as Appointment[]) ?? [];
  const saldo = balance(movs);
  const here = `/panel/agenda/clientes/${id}`;
  const upcoming = appts.filter((a) => a.status === "pendiente" || a.status === "confirmado").reverse();
  const past = appts.filter((a) => a.status !== "pendiente" && a.status !== "confirmado");

  return (
    <>
      <div className="ag-g-head">
        <div>
          <h1 className="ag-g-title" style={{ textTransform: "none" }}>
            {c.full_name}
          </h1>
          <p className="ag-g-sub">{c.phone || "Sin teléfono cargado"}</p>
        </div>
        <div className="ag-g-formactions">
          <Link href={`/panel/agenda/turnos/nuevo?c=${id}`} className="ag-g-btn ag-g-btn--main">
            Nuevo turno
          </Link>
          {c.phone && (
            <a href={chatLink(c.phone)} target="_blank" rel="noopener noreferrer" className="ag-g-btn ag-g-btn--wa">
              WhatsApp
            </a>
          )}
        </div>
      </div>

      {sp.ok && <p className="ag-g-ok">Guardado.</p>}
      {sp.error && <p className="ag-g-err">{sp.error === "monto" ? "Escribí un monto válido." : "Escribí el nombre del cliente."}</p>}

      <div className="ag-g-saldo">
        <div>
          <span>Cuenta corriente</span>
          <br />
          <b className={saldo > 0 ? "ag-g-amt--debt" : saldo < 0 ? "ag-g-amt--in" : undefined}>
            {saldo > 0 ? `Debe ${money(saldo)}` : saldo < 0 ? `A favor ${money(-saldo)}` : "Al día"}
          </b>
        </div>
      </div>

      <details className="ag-g-more" style={{ marginTop: "0.7rem" }}>
        <summary>Registrar un pago o un cargo</summary>
        <form action={addMovement}>
          <input type="hidden" name="client_id" value={id} />
          <input type="hidden" name="back" value={here} />
          <div className="ag-g-row2">
            <label className="ag-g-field">
              <span>Qué es</span>
              <select name="kind" defaultValue="pago">
                <option value="pago">Pago del cliente</option>
                <option value="cargo">Cargo (algo que se le cobra)</option>
              </select>
            </label>
            <label className="ag-g-field">
              <span>Monto</span>
              <input name="amount" inputMode="decimal" required placeholder="0" />
            </label>
          </div>
          <div className="ag-g-row2">
            <label className="ag-g-field">
              <span>Medio de pago</span>
              <select name="method" defaultValue="Efectivo">
                {PAY_METHODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="ag-g-field">
              <span>Fecha</span>
              <input name="occurred_on" type="date" defaultValue={todayKey()} />
            </label>
          </div>
          <label className="ag-g-field">
            <span>Concepto (opcional)</span>
            <input name="concept" placeholder="Seña, pack, producto…" />
          </label>
          <button className="ag-g-btn ag-g-btn--main">Guardar</button>
        </form>
      </details>

      {upcoming.length > 0 && (
        <>
          <h2 className="ag-g-h2">Próximos turnos</h2>
          <ul className="ag-g-list">
            {upcoming.map((a) => (
              <AppointmentCard key={a.id} a={a} back={here} showDate />
            ))}
          </ul>
        </>
      )}

      <h2 className="ag-g-h2">Movimientos</h2>
      {movs.length === 0 ? (
        <div className="ag-g-empty">Todavía no hay movimientos.</div>
      ) : (
        <div className="ag-g-rows">
          {movs.map((mv) => (
            <div key={mv.id} className="ag-g-line">
              <div>
                <strong>{mv.concept || (mv.kind === "pago" ? "Pago" : "Cargo")}</strong>
                <small>
                  {fmtDayShort(mv.occurred_on)} · {mv.kind === "pago" ? `Pago${mv.method ? ` (${mv.method})` : ""}` : "Cargo"}
                </small>
              </div>
              <span className={`ag-g-amt ${mv.kind === "pago" ? "ag-g-amt--in" : "ag-g-amt--debt"}`}>
                {mv.kind === "pago" ? "−" : "+"}
                {money(mv.amount)}
              </span>
              <form action={deleteMovement.bind(null, mv.id, here)}>
                <button className="ag-g-del" aria-label="Borrar movimiento" title="Borrar">
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="ag-g-h2">Historial de turnos</h2>
          <div className="ag-g-rows">
            {past.map((a) => (
              <Link key={a.id} href={`/panel/agenda/turnos/${a.id}`} className="ag-g-line">
                <div>
                  <strong>{a.service_name}</strong>
                  <small>
                    {fmtDayShort(dateKey(a.starts_at))} · {a.status === "realizado" ? "Realizado" : a.status === "ausente" ? "No vino" : "Cancelado"}
                  </small>
                </div>
                {a.price != null && <span className="ag-g-amt">{money(a.price)}</span>}
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="ag-g-h2">Ficha</h2>
      <ClientForm action={saveClient.bind(null, id)} client={c} cancelHref="/panel/agenda/clientes" />
      <form action={archiveClient.bind(null, id, true)} style={{ marginTop: "1.25rem" }}>
        <button className="ag-g-btn ag-g-btn--danger">Archivar cliente</button>
      </form>
    </>
  );
}
