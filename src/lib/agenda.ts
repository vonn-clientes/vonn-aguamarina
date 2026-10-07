// Ayudantes de la agenda de Aguamarina: fechas en hora de Argentina (UTC-3, sin horario de verano),
// dinero, estados de turno y el mensaje de WhatsApp para recordar un turno.
import { SITE } from "@/lib/site";
import { waLink } from "@/lib/seo";

export const TZ = "America/Argentina/Buenos_Aires";
const OFFSET = "-03:00";

export type Status = "pendiente" | "confirmado" | "realizado" | "cancelado" | "ausente";

export const STATUS_LABEL: Record<Status, string> = {
  pendiente: "Sin confirmar",
  confirmado: "Confirmado",
  realizado: "Realizado",
  cancelado: "Cancelado",
  ausente: "No vino",
};

export const PAY_METHODS = ["Efectivo", "Transferencia", "Tarjeta", "Mercado Pago", "Otro"] as const;

export const EXPENSE_CATEGORIES = ["Insumos", "Productos para vender", "Alquiler", "Servicios", "Equipos", "Sueldos", "Publicidad", "Impuestos", "Otro"] as const;

export interface Appointment {
  id: string;
  tenant_id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string | null;
  catalog_item_id: string | null;
  service_name: string;
  starts_at: string;
  duration_min: number;
  status: Status;
  price: number | null;
  notes: string | null;
  confirm_token: string;
  confirmed_at: string | null;
  charged: boolean;
  session_number: number | null;
}

export interface Client {
  id: string;
  tenant_id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  address: string | null;
  skin_type: string | null;
  allergies: string | null;
  notes: string | null;
  archived: boolean;
}

export interface Movement {
  id: string;
  tenant_id: string;
  client_id: string | null;
  appointment_id: string | null;
  kind: "cargo" | "pago" | "gasto";
  amount: number;
  method: string | null;
  concept: string | null;
  occurred_on: string;
  created_at: string;
}

// ---- Fechas (todo en hora argentina) ----

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-10-07" para un instante, visto desde Argentina. */
export function dateKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return parts; // en-CA da YYYY-MM-DD
}

export const todayKey = () => dateKey(new Date());

export function isDateKey(v: string | undefined | null): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(`${v}T12:00:00Z`).getTime());
}

export function addDays(key: string, days: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Lunes de la semana de esa fecha. */
export function weekStart(key: string): string {
  const d = new Date(`${key}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // lunes = 0
  return addDays(key, -dow);
}

export const dayStartISO = (key: string) => new Date(`${key}T00:00:00${OFFSET}`).toISOString();

/** Convierte lo que escribe Ingrid (fecha + hora) en un instante. */
export function toInstant(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr.length === 5 ? timeStr : "09:00"}:00${OFFSET}`).toISOString();
}

export function timeInput(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

export const fmtTime = timeInput;

export function fmtDayLong(key: string): string {
  return new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(new Date(`${key}T12:00:00Z`));
}

export function fmtDayShort(key: string): string {
  return new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", weekday: "short", day: "numeric" }).format(new Date(`${key}T12:00:00Z`));
}

export function fmtDateTimeLong(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

export function fmtMonth(ym: string): string {
  return new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(`${ym}-15T12:00:00Z`));
}

export function monthRange(ym: string): { from: string; to: string } {
  const [y, m] = ym.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
  return { from: `${ym}-01`, to: `${next}-01` };
}

export function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const idx = y * 12 + (m - 1) + delta;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}

export const isMonthKey = (v: string | undefined | null): v is string => !!v && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

// ---- Dinero ----

export function money(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
}

export function parseAmount(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "").trim().replace(/\./g, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Saldo de una cliente: lo que se le cargó menos lo que pagó (positivo = debe). */
export function balance(movs: Pick<Movement, "kind" | "amount">[]): number {
  let b = 0;
  for (const m of movs) {
    if (m.kind === "cargo") b += Number(m.amount);
    else if (m.kind === "pago") b -= Number(m.amount);
  }
  return Math.round(b * 100) / 100;
}

// ---- WhatsApp ----

export function reminderLink(a: Pick<Appointment, "client_name" | "client_phone" | "service_name" | "starts_at" | "confirm_token">): string {
  const text =
    `Hola ${a.client_name.split(" ")[0]}! Te recuerdo tu turno de ${a.service_name} el ${fmtDateTimeLong(a.starts_at)} hs en Aguamarina (${SITE.street}). ` +
    `¿Me confirmás tocando este link? ${SITE.url}/turno/${a.confirm_token}`;
  return waLink(a.client_phone, text);
}

export function chatLink(phone: string | null | undefined, text?: string): string {
  return waLink(phone, text);
}

/** Quita tildes y mayúsculas para comparar nombres al buscar. */
export const fold = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Turnos de la lista que se pisan con otro (misma franja horaria). */
export function overlaps<T extends Pick<Appointment, "id" | "starts_at" | "duration_min" | "status" | "client_name">>(list: T[]): Map<string, string[]> {
  const live = list.filter((a) => a.status !== "cancelado" && a.status !== "ausente");
  const out = new Map<string, string[]>();
  for (const a of live) {
    const s = new Date(a.starts_at).getTime();
    const e = s + a.duration_min * 60000;
    for (const b of live) {
      if (a.id === b.id) continue;
      const bs = new Date(b.starts_at).getTime();
      const be = bs + b.duration_min * 60000;
      if (s < be && bs < e) out.set(a.id, [...(out.get(a.id) ?? []), b.client_name]);
    }
  }
  return out;
}
