import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Acceso de la community manager: usuario y contraseña viven en variables de
// entorno (nunca en el código, porque el repositorio es público).
export const CM_COOKIE = "ag_cm";
const DAYS = 14;

function secret() {
  return process.env.CM_SESSION_SECRET || "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

// Mayúsculas y espacios no importan al comparar.
export function normalize(v: string) {
  return v.toLowerCase().replace(/\s+/g, "").trim();
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkCredentials(user: string, pass: string) {
  const u = process.env.CM_USER;
  const p = process.env.CM_PASSWORD;
  if (!u || !p || !secret()) return false;
  return same(normalize(user), normalize(u)) && same(normalize(pass), normalize(p));
}

export function makeToken() {
  const exp = String(Date.now() + DAYS * 86400_000);
  return `${exp}.${sign(exp)}`;
}

export async function isCm() {
  if (!secret()) return false;
  const token = (await cookies()).get(CM_COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, sign(exp));
}
