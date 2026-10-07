// Sofi dentro del panel de Ingrid: herramientas que la IA puede usar.
// - Las de LECTURA se ejecutan al instante.
// - Las de ESCRITURA nunca se ejecutan solas: quedan como "propuesta" y Ingrid las confirma con un botón.
import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, dateKey, dayStartISO, fmtDateTimeLong, fmtDayLong, fold, isDateKey, money, STATUS_LABEL, toInstant, todayKey, type Status } from "@/lib/agenda";

export type PendingAction = { kind: string; args: Record<string, unknown>; label: string };
type Ctx = { sb: SupabaseClient; tenantId: string };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const hhmm = (v: unknown) => {
  const m = str(v).match(/^(\d{1,2})[:.h]?(\d{2})?$/);
  if (!m) return null;
  const h = Number(m[1]), mi = Number(m[2] ?? 0);
  return h < 24 && mi < 60 ? `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}` : null;
};

// ---------- Definición de herramientas (formato OpenAI) ----------
const fn = (name: string, description: string, properties: Record<string, unknown>, required: string[] = []) => ({
  type: "function" as const,
  function: { name, description, parameters: { type: "object", properties, required } },
});
const S = (d: string) => ({ type: "string", description: d });
const N = (d: string) => ({ type: "number", description: d });

export const TOOLS = [
  fn("ver_turnos", "Lista los turnos entre dos fechas (inclusive). Úsala para saber qué hay en la agenda.", { desde: S("AAAA-MM-DD"), hasta: S("AAAA-MM-DD") }, ["desde", "hasta"]),
  fn("buscar_clientes", "Busca clientas por nombre o teléfono y devuelve su saldo.", { texto: S("nombre o parte del nombre") }, ["texto"]),
  fn("ver_catalogo", "Lista los tratamientos con precio y duración.", {}),
  fn("ver_caja", "Resumen de cobros, gastos y total de un rango de fechas.", { desde: S("AAAA-MM-DD"), hasta: S("AAAA-MM-DD") }, ["desde", "hasta"]),
  fn("proponer_turno", "Prepara un turno nuevo para que Ingrid lo confirme. No lo crea todavía.", {
    cliente: S("nombre de la clienta"), servicio: S("tratamiento (idealmente uno del catálogo)"), fecha: S("AAAA-MM-DD"), hora: S("HH:MM en 24 hs"),
    duracion_min: N("duración en minutos, opcional"), precio: N("precio, opcional"), telefono: S("opcional, solo si es clienta nueva"), notas: S("opcional"),
  }, ["cliente", "servicio", "fecha", "hora"]),
  fn("proponer_cambio_estado", "Prepara confirmar, cancelar o marcar ausente un turno existente.", { turno_id: S("id del turno (de ver_turnos)"), estado: { type: "string", enum: ["confirmado", "cancelado", "ausente", "pendiente"] } }, ["turno_id", "estado"]),
  fn("proponer_reprogramar", "Prepara mover un turno a otro día/hora.", { turno_id: S("id del turno"), fecha: S("AAAA-MM-DD"), hora: S("HH:MM") }, ["turno_id", "fecha", "hora"]),
  fn("proponer_cobro", "Prepara marcar un turno como realizado y registrar el cobro.", { turno_id: S("id del turno"), precio: N("valor del servicio, opcional"), pagado: N("lo que pagó ahora (0 si queda en cuenta)"), medio: { type: "string", enum: ["Efectivo", "Transferencia", "Tarjeta", "Mercado Pago", "Otro"] } }, ["turno_id", "pagado"]),
  fn("proponer_gasto", "Prepara anotar un gasto del gabinete.", { monto: N("importe"), categoria: { type: "string", enum: ["Insumos", "Productos para vender", "Alquiler", "Servicios", "Equipos", "Sueldos", "Publicidad", "Impuestos", "Otro"] }, detalle: S("opcional"), fecha: S("AAAA-MM-DD, opcional (por defecto hoy)") }, ["monto", "categoria"]),
  fn("proponer_pago_cliente", "Prepara anotar un pago a cuenta de una clienta.", { cliente: S("nombre"), monto: N("importe"), medio: { type: "string", enum: ["Efectivo", "Transferencia", "Tarjeta", "Mercado Pago", "Otro"] } }, ["cliente", "monto"]),
  fn("proponer_clienta", "Prepara dar de alta una clienta nueva.", { nombre: S("nombre y apellido"), telefono: S("opcional"), notas: S("opcional") }, ["nombre"]),
];

const WRITE = new Set(TOOLS.map((t) => t.function.name).filter((n) => n.startsWith("proponer_")));
export const isWrite = (n: string) => WRITE.has(n);

// ---------- Ejecución de herramientas de lectura / armado de propuestas ----------
async function findClients(c: Ctx, q: string) {
  const { data } = await c.sb.from("ag_clients").select("id, full_name, phone").eq("tenant_id", c.tenantId).eq("archived", false).limit(500);
  const f = fold(q);
  const words = f.split(/\s+/).filter(Boolean);
  const all = (data ?? []).filter((x) => words.every((w) => fold(x.full_name).includes(w) || (x.phone ?? "").includes(w)));
  const exact = all.filter((x) => fold(x.full_name) === f);
  return exact.length === 1 ? exact : all;
}

async function loadAppt(c: Ctx, id: string) {
  const { data } = await c.sb.from("ag_appointments").select("*").eq("id", id).eq("tenant_id", c.tenantId).maybeSingle();
  return data;
}

export async function runTool(name: string, a: Record<string, unknown>, c: Ctx): Promise<{ result: unknown; pending?: PendingAction }> {
  switch (name) {
    case "ver_turnos": {
      const d = str(a.desde), h = str(a.hasta);
      if (!isDateKey(d) || !isDateKey(h)) return { result: { error: "fechas inválidas, usá AAAA-MM-DD" } };
      const { data } = await c.sb.from("ag_appointments").select("id, client_name, service_name, starts_at, duration_min, status, price").eq("tenant_id", c.tenantId)
        .gte("starts_at", dayStartISO(d)).lt("starts_at", dayStartISO(addDays(h, 1))).order("starts_at").limit(60);
      return { result: (data ?? []).map((t) => ({ turno_id: t.id, clienta: t.client_name, tratamiento: t.service_name, cuando: fmtDateTimeLong(t.starts_at), minutos: t.duration_min, estado: STATUS_LABEL[t.status as Status], precio: t.price })) };
    }
    case "buscar_clientes": {
      const list = (await findClients(c, str(a.texto))).slice(0, 8);
      if (!list.length) return { result: { clientas: [] } };
      const { data: mv } = await c.sb.from("ag_movements").select("client_id, kind, amount").eq("tenant_id", c.tenantId).in("client_id", list.map((x) => x.id));
      return { result: { clientas: list.map((x) => ({ nombre: x.full_name, telefono: x.phone, saldo_que_debe: (mv ?? []).filter((m) => m.client_id === x.id).reduce((s, m) => s + (m.kind === "cargo" ? Number(m.amount) : m.kind === "pago" ? -Number(m.amount) : 0), 0) })) } };
    }
    case "ver_catalogo": {
      const { data } = await c.sb.from("catalog_items").select("name, price, duration_minutes, category").eq("tenant_id", c.tenantId).eq("active", true).order("sort_order").limit(80);
      return { result: (data ?? []).map((x) => ({ nombre: x.name, precio: x.price, minutos: x.duration_minutes, categoria: x.category })) };
    }
    case "ver_caja": {
      const d = str(a.desde), h = str(a.hasta);
      if (!isDateKey(d) || !isDateKey(h)) return { result: { error: "fechas inválidas" } };
      const { data } = await c.sb.from("ag_movements").select("kind, amount").eq("tenant_id", c.tenantId).gte("occurred_on", d).lte("occurred_on", h);
      const sum = (k: string) => (data ?? []).filter((m) => m.kind === k).reduce((s, m) => s + Number(m.amount), 0);
      return { result: { cobrado: money(sum("pago")), gastos: money(sum("gasto")), cargado_en_cuentas: money(sum("cargo")), ganancia_neta: money(sum("pago") - sum("gasto")) } };
    }

    case "proponer_turno": {
      const date = str(a.fecha), time = hhmm(a.hora), service = str(a.servicio), who = str(a.cliente);
      if (!who || !service || !isDateKey(date) || !time) return { result: { error: "faltan datos: necesito clienta, tratamiento, fecha (AAAA-MM-DD) y hora" } };
      const matches = await findClients(c, who);
      if (matches.length > 1) return { result: { error: `Hay varias clientas que coinciden: ${matches.slice(0, 5).map((m) => m.full_name).join(", ")}. Preguntale a Ingrid cuál es.` } };
      const { data: cat } = await c.sb.from("catalog_items").select("id, name, price, duration_minutes").eq("tenant_id", c.tenantId).eq("active", true);
      const item = (cat ?? []).find((x) => fold(x.name) === fold(service)) ?? (cat ?? []).find((x) => fold(x.name).includes(fold(service)) || fold(service).includes(fold(x.name)));
      const client = matches[0];
      const args = {
        client_id: client?.id ?? null, client_name: client?.full_name ?? who, client_phone: client?.phone ?? (str(a.telefono) || null),
        catalog_item_id: item?.id ?? null, service_name: item?.name ?? service, date, time,
        duration_min: Math.max(5, Math.min(600, num(a.duracion_min) ?? item?.duration_minutes ?? 60)),
        price: num(a.precio) ?? item?.price ?? null, notes: str(a.notas) || null,
      };
      const label = `Turno: ${args.client_name}${client ? "" : " (clienta nueva)"} · ${args.service_name} · ${fmtDayLong(date)} ${time} hs · ${args.duration_min} min${args.price ? ` · ${money(args.price as number)}` : ""}`;
      return { result: { ok: true, propuesta: label, aviso: "Quedó pendiente de confirmación de Ingrid." }, pending: { kind: "crear_turno", args, label } };
    }
    case "proponer_cambio_estado": {
      const t = await loadAppt(c, str(a.turno_id));
      const st = str(a.estado) as Status;
      if (!t || !(st in STATUS_LABEL)) return { result: { error: "no encontré ese turno; usá ver_turnos para obtener el turno_id" } };
      const label = `${STATUS_LABEL[st]}: ${t.client_name} · ${t.service_name} · ${fmtDateTimeLong(t.starts_at)} hs`;
      return { result: { ok: true, propuesta: label }, pending: { kind: "estado_turno", args: { id: t.id, status: st }, label } };
    }
    case "proponer_reprogramar": {
      const t = await loadAppt(c, str(a.turno_id));
      const date = str(a.fecha), time = hhmm(a.hora);
      if (!t || !isDateKey(date) || !time) return { result: { error: "turno o fecha/hora inválidos" } };
      const label = `Mover turno de ${t.client_name} (${t.service_name}) al ${fmtDayLong(date)} ${time} hs`;
      return { result: { ok: true, propuesta: label }, pending: { kind: "mover_turno", args: { id: t.id, date, time }, label } };
    }
    case "proponer_cobro": {
      const t = await loadAppt(c, str(a.turno_id));
      if (!t) return { result: { error: "no encontré ese turno" } };
      const price = num(a.precio) ?? t.price ?? 0, paid = num(a.pagado) ?? 0, method = str(a.medio) || null;
      const label = `Cobrar: ${t.client_name} · ${t.service_name} · valor ${money(price)} · paga ${money(paid)}${method ? ` (${method})` : ""}${paid < price ? ` · queda debiendo ${money(price - paid)}` : ""}`;
      return { result: { ok: true, propuesta: label }, pending: { kind: "cobrar_turno", args: { id: t.id, price, paid, method }, label } };
    }
    case "proponer_gasto": {
      const amount = num(a.monto);
      if (!amount) return { result: { error: "falta el monto" } };
      const date = isDateKey(str(a.fecha)) ? str(a.fecha) : todayKey();
      const cat = str(a.categoria) || "Otro", det = str(a.detalle);
      const label = `Gasto: ${money(amount)} · ${cat}${det ? ` (${det})` : ""} · ${date}`;
      return { result: { ok: true, propuesta: label }, pending: { kind: "gasto", args: { amount, category: cat, concept: det || null, date }, label } };
    }
    case "proponer_pago_cliente": {
      const amount = num(a.monto);
      const matches = await findClients(c, str(a.cliente));
      if (!amount) return { result: { error: "falta el monto" } };
      if (matches.length !== 1) return { result: { error: matches.length ? `Hay varias: ${matches.slice(0, 5).map((m) => m.full_name).join(", ")}` : "No encontré a esa clienta" } };
      const method = str(a.medio) || null;
      const label = `Pago a cuenta: ${matches[0].full_name} · ${money(amount)}${method ? ` (${method})` : ""}`;
      return { result: { ok: true, propuesta: label }, pending: { kind: "pago_cliente", args: { client_id: matches[0].id, amount, method }, label } };
    }
    case "proponer_clienta": {
      const nombre = str(a.nombre);
      if (!nombre) return { result: { error: "falta el nombre" } };
      const label = `Clienta nueva: ${nombre}${str(a.telefono) ? ` · ${str(a.telefono)}` : ""}`;
      return { result: { ok: true, propuesta: label }, pending: { kind: "crear_clienta", args: { name: nombre, phone: str(a.telefono) || null, notes: str(a.notas) || null }, label } };
    }
  }
  return { result: { error: "herramienta desconocida" } };
}

// ---------- Ejecutar una propuesta ya confirmada por Ingrid ----------
export async function execute(kind: string, a: Record<string, unknown>, c: Ctx): Promise<string> {
  const { sb, tenantId } = c;
  switch (kind) {
    case "crear_turno": {
      const date = str(a.date), time = hhmm(a.time), name = str(a.client_name), service = str(a.service_name);
      if (!isDateKey(date) || !time || !name || !service) throw new Error("datos incompletos");
      let clientId = str(a.client_id) || null;
      if (clientId) {
        const { data } = await sb.from("ag_clients").select("id").eq("id", clientId).eq("tenant_id", tenantId).maybeSingle();
        if (!data) clientId = null;
      }
      if (!clientId) {
        const { data } = await sb.from("ag_clients").insert({ tenant_id: tenantId, full_name: name, first_name: name.split(" ")[0], last_name: name.split(" ").slice(1).join(" ") || null, phone: str(a.client_phone) || null }).select("id").single();
        clientId = data?.id ?? null;
      }
      const { error } = await sb.from("ag_appointments").insert({
        tenant_id: tenantId, client_id: clientId, client_name: name, client_phone: str(a.client_phone) || null,
        catalog_item_id: str(a.catalog_item_id) || null, service_name: service, starts_at: toInstant(date, time),
        duration_min: Math.max(5, Math.min(600, num(a.duration_min) ?? 60)), price: num(a.price), notes: str(a.notes) || null,
      });
      if (error) throw new Error(error.message);
      return `Listo, agendé a ${name} el ${fmtDayLong(date)} a las ${time} hs ✅`;
    }
    case "estado_turno": {
      const st = str(a.status);
      if (!(st in STATUS_LABEL)) throw new Error("estado inválido");
      const patch: Record<string, unknown> = { status: st };
      if (st === "confirmado") patch.confirmed_at = new Date().toISOString();
      const { error } = await sb.from("ag_appointments").update(patch).eq("id", str(a.id)).eq("tenant_id", tenantId);
      if (error) throw new Error(error.message);
      return `Listo, el turno quedó como "${STATUS_LABEL[st as Status]}" ✅`;
    }
    case "mover_turno": {
      const date = str(a.date), time = hhmm(a.time);
      if (!isDateKey(date) || !time) throw new Error("fecha inválida");
      const { error } = await sb.from("ag_appointments").update({ starts_at: toInstant(date, time) }).eq("id", str(a.id)).eq("tenant_id", tenantId);
      if (error) throw new Error(error.message);
      return `Listo, moví el turno al ${fmtDayLong(date)} a las ${time} hs ✅`;
    }
    case "cobrar_turno": {
      const t = await loadAppt(c, str(a.id));
      if (!t) throw new Error("turno no encontrado");
      const price = num(a.price) ?? t.price ?? 0, paid = num(a.paid) ?? 0, day = dateKey(t.starts_at);
      await sb.from("ag_appointments").update({ status: "realizado", price: price || t.price, charged: true }).eq("id", t.id).eq("tenant_id", tenantId);
      if (!t.charged && price > 0) await sb.from("ag_movements").insert({ tenant_id: tenantId, client_id: t.client_id, appointment_id: t.id, kind: "cargo", amount: price, concept: t.service_name, occurred_on: day });
      if (paid > 0) await sb.from("ag_movements").insert({ tenant_id: tenantId, client_id: t.client_id, appointment_id: t.id, kind: "pago", amount: paid, method: str(a.method) || null, concept: t.service_name, occurred_on: day });
      return `Listo, cobro registrado: ${money(paid)} de ${money(price)} ✅`;
    }
    case "gasto": {
      const amount = num(a.amount);
      if (!amount) throw new Error("monto inválido");
      const cat = str(a.category) || "Otro", det = str(a.concept);
      const day = isDateKey(str(a.date)) ? str(a.date) : todayKey();
      const { error } = await sb.from("ag_movements").insert({ tenant_id: tenantId, client_id: null, kind: "gasto", amount, concept: det ? `${cat}: ${det}` : cat, occurred_on: day });
      if (error) throw new Error(error.message);
      return `Listo, anoté el gasto de ${money(amount)} ✅`;
    }
    case "pago_cliente": {
      const amount = num(a.amount);
      if (!amount) throw new Error("monto inválido");
      const { data: cl } = await sb.from("ag_clients").select("id").eq("id", str(a.client_id)).eq("tenant_id", tenantId).maybeSingle();
      if (!cl) throw new Error("clienta no encontrada");
      const { error } = await sb.from("ag_movements").insert({ tenant_id: tenantId, client_id: cl.id, kind: "pago", amount, method: str(a.method) || null, concept: "Pago a cuenta", occurred_on: todayKey() });
      if (error) throw new Error(error.message);
      return `Listo, anoté el pago de ${money(amount)} ✅`;
    }
    case "crear_clienta": {
      const name = str(a.name);
      if (!name) throw new Error("falta el nombre");
      const { error } = await sb.from("ag_clients").insert({ tenant_id: tenantId, full_name: name, first_name: name.split(" ")[0], last_name: name.split(" ").slice(1).join(" ") || null, phone: str(a.phone) || null, notes: str(a.notes) || null });
      if (error) throw new Error(error.message);
      return `Listo, di de alta a ${name} ✅`;
    }
  }
  throw new Error("acción desconocida");
}

// ---------- Prompt ----------
export function panelPrompt(tenantName: string, catalog: string): string {
  const today = todayKey();
  return `Sos Sofi, la asistente de ${tenantName}, y ahora estás dentro del panel privado de Ingrid (la dueña). Ella te habla de vos, informal y cálido, en español rioplatense. Sé breve y concreta; no uses markdown ni listas con asteriscos (podés usar guiones simples).
Hoy es ${fmtDayLong(today)} (${today}). Zona horaria Argentina. Resolvé "mañana", "el viernes", "la semana que viene" a fechas reales AAAA-MM-DD. Si dice una hora sin aclarar, asumí formato 24 hs (las 4 de la tarde = 16:00).

Lo que podés hacer:
1) Consultar agenda, clientas, catálogo y caja con tus herramientas (usalas, no inventes datos).
2) Preparar acciones (turnos nuevos, mover/confirmar/cancelar turnos, cobros, gastos, pagos de clientas, clientas nuevas) con las herramientas "proponer_*". Nunca se ejecutan solas: Ingrid las confirma con un botón. Después de proponer, decí en una frase corta que lo revise y confirme abajo. Si falta un dato imprescindible (clienta, tratamiento, día u hora) preguntalo en una sola frase. Si hay varias clientas con el mismo nombre, preguntá cuál.
3) Escribir textos: copies para Instagram/WhatsApp/historias, descripciones de tratamientos, mensajes de recordatorio o de seguimiento a clientas, respuestas a consultas, promociones. Usá solo información real del gabinete; entregá el texto listo para copiar, con emojis medidos, sin inventar precios ni resultados médicos ni promesas exageradas.
4) Ayudar a pensar: resumir el día o la semana, avisar turnos sin confirmar, huecos libres, ideas de promos.
Si te piden algo que no tiene que ver con el gabinete, decilo amablemente y volvé a lo tuyo.

Tratamientos y precios del catálogo:
${catalog}`;
}
