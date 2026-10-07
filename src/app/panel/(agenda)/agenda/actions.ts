"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { dateKey, isDateKey, parseAmount, toInstant, type Status } from "@/lib/agenda";

const BASE = "/panel/agenda";

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const opt = (fd: FormData, k: string) => text(fd, k) || null;

// Solo se vuelve a pantallas de la agenda (nunca a una dirección externa).
function safeBack(raw: string, fallback: string): string {
  return raw.startsWith(BASE) && !raw.startsWith("//") ? raw : fallback;
}

function refresh() {
  revalidatePath(BASE, "layout");
}

// ---------- Clientas ----------

function clientFields(fd: FormData) {
  return {
    full_name: text(fd, "full_name"),
    phone: opt(fd, "phone"),
    email: opt(fd, "email"),
    birth_date: opt(fd, "birth_date"),
    address: opt(fd, "address"),
    skin_type: opt(fd, "skin_type"),
    allergies: opt(fd, "allergies"),
    notes: opt(fd, "notes"),
  };
}

export async function saveClient(id: string | null, fd: FormData) {
  const m = await requireMembership();
  const supabase = await createClient();
  const fields = clientFields(fd);
  if (!fields.full_name) redirect(id ? `${BASE}/clientas/${id}?error=nombre` : `${BASE}/clientas/nueva?error=nombre`);

  if (id) {
    await supabase.from("ag_clients").update(fields).eq("id", id).eq("tenant_id", m.tenant.id);
    refresh();
    redirect(`${BASE}/clientas/${id}?ok=1`);
  }
  const { data } = await supabase.from("ag_clients").insert({ tenant_id: m.tenant.id, ...fields }).select("id").single();
  refresh();
  redirect(data ? `${BASE}/clientas/${data.id}?ok=1` : `${BASE}/clientas`);
}

export async function archiveClient(id: string, archived: boolean) {
  const m = await requireMembership();
  const supabase = await createClient();
  await supabase.from("ag_clients").update({ archived }).eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
  redirect(archived ? `${BASE}/clientas` : `${BASE}/clientas/${id}`);
}

// ---------- Turnos ----------

async function appointmentFields(fd: FormData, tenantId: string) {
  const supabase = await createClient();

  // Clienta: una existente o una nueva con nombre y teléfono.
  let clientId = opt(fd, "client_id");
  let clientName = text(fd, "client_name");
  let clientPhone = opt(fd, "client_phone");
  if (clientId) {
    const { data } = await supabase.from("ag_clients").select("full_name, phone").eq("id", clientId).eq("tenant_id", tenantId).maybeSingle();
    if (data) {
      clientName = data.full_name;
      clientPhone = data.phone;
    } else clientId = null;
  }
  if (!clientId && clientName) {
    const { data } = await supabase
      .from("ag_clients")
      .insert({ tenant_id: tenantId, full_name: clientName, phone: clientPhone })
      .select("id")
      .single();
    clientId = data?.id ?? null;
  }

  // Servicio: del catálogo o escrito a mano.
  let catalogId = opt(fd, "catalog_item_id");
  if (catalogId === "otro") catalogId = null;
  let serviceName = text(fd, "service_name");
  if (catalogId) {
    const { data } = await supabase.from("catalog_items").select("name").eq("id", catalogId).eq("tenant_id", tenantId).maybeSingle();
    if (data) serviceName = data.name;
    else catalogId = null;
  }

  const date = text(fd, "date");
  const time = text(fd, "time");
  const duration = Math.max(5, Math.min(600, Number(text(fd, "duration")) || 60));

  return {
    ok: !!clientName && !!serviceName && isDateKey(date) && /^\d{2}:\d{2}$/.test(time),
    date,
    fields: {
      client_id: clientId,
      client_name: clientName,
      client_phone: clientPhone,
      catalog_item_id: catalogId,
      service_name: serviceName,
      starts_at: isDateKey(date) && /^\d{2}:\d{2}$/.test(time) ? toInstant(date, time) : null,
      duration_min: duration,
      price: parseAmount(fd.get("price")),
      notes: opt(fd, "notes"),
    },
  };
}

export async function createAppointment(fd: FormData) {
  const m = await requireMembership();
  const supabase = await createClient();
  const r = await appointmentFields(fd, m.tenant.id);
  if (!r.ok) redirect(`${BASE}/turnos/nuevo?error=1${isDateKey(r.date) ? `&d=${r.date}` : ""}`);
  await supabase.from("ag_appointments").insert({ tenant_id: m.tenant.id, ...r.fields });
  refresh();
  redirect(`${BASE}?d=${r.date}`);
}

export async function updateAppointment(id: string, fd: FormData) {
  const m = await requireMembership();
  const supabase = await createClient();
  const r = await appointmentFields(fd, m.tenant.id);
  if (!r.ok) redirect(`${BASE}/turnos/${id}?error=1`);
  await supabase.from("ag_appointments").update(r.fields).eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
  redirect(`${BASE}?d=${r.date}`);
}

export async function setStatus(id: string, status: Status, back: string) {
  const m = await requireMembership();
  const supabase = await createClient();
  const patch: Record<string, unknown> = { status };
  if (status === "confirmado") patch.confirmed_at = new Date().toISOString();
  await supabase.from("ag_appointments").update(patch).eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
  redirect(safeBack(back, BASE));
}

// Marca el turno como realizado: carga el valor en la cuenta de la clienta y, si pagó, registra el cobro.
export async function completeAppointment(id: string, fd: FormData) {
  const m = await requireMembership();
  const supabase = await createClient();
  const back = safeBack(text(fd, "back"), BASE);

  const { data: a } = await supabase.from("ag_appointments").select("*").eq("id", id).eq("tenant_id", m.tenant.id).maybeSingle();
  if (!a) redirect(back);

  const price = parseAmount(fd.get("price")) ?? a.price ?? 0;
  const paid = parseAmount(fd.get("paid")) ?? 0;
  const method = opt(fd, "method");
  const day = dateKey(a.starts_at);

  await supabase.from("ag_appointments").update({ status: "realizado", price: price || a.price, charged: true }).eq("id", id);

  if (!a.charged && price > 0) {
    await supabase.from("ag_movements").insert({
      tenant_id: m.tenant.id,
      client_id: a.client_id,
      appointment_id: id,
      kind: "cargo",
      amount: price,
      concept: a.service_name,
      occurred_on: day,
    });
  }
  if (paid > 0) {
    await supabase.from("ag_movements").insert({
      tenant_id: m.tenant.id,
      client_id: a.client_id,
      appointment_id: id,
      kind: "pago",
      amount: paid,
      method,
      concept: a.service_name,
      occurred_on: day,
    });
  }
  refresh();
  redirect(back);
}

export async function deleteAppointment(id: string) {
  const m = await requireMembership();
  const supabase = await createClient();
  await supabase.from("ag_movements").delete().eq("appointment_id", id).eq("tenant_id", m.tenant.id).eq("kind", "cargo");
  await supabase.from("ag_appointments").delete().eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
  redirect(BASE);
}

// ---------- Caja y cuenta corriente ----------

export async function addMovement(fd: FormData) {
  const m = await requireMembership();
  const supabase = await createClient();
  const back = safeBack(text(fd, "back"), `${BASE}/caja`);
  const kind = text(fd, "kind");
  const amount = parseAmount(fd.get("amount"));
  if (!["pago", "cargo", "gasto"].includes(kind) || !amount) redirect(`${back}${back.includes("?") ? "&" : "?"}error=monto`);

  const day = text(fd, "occurred_on");
  const clientId = opt(fd, "client_id");
  let concept = opt(fd, "concept");
  const category = opt(fd, "category");
  if (kind === "gasto" && category) concept = concept ? `${category}: ${concept}` : category;

  await supabase.from("ag_movements").insert({
    tenant_id: m.tenant.id,
    client_id: kind === "gasto" ? null : clientId,
    kind,
    amount,
    method: opt(fd, "method"),
    concept,
    occurred_on: isDateKey(day) ? day : dateKey(new Date()),
  });
  refresh();
  redirect(back);
}

export async function deleteMovement(id: string, back: string) {
  const m = await requireMembership();
  const supabase = await createClient();
  await supabase.from("ag_movements").delete().eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
  redirect(safeBack(back, `${BASE}/caja`));
}
