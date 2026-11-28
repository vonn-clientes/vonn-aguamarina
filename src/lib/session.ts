import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";
import { isDbConfigured } from "@/lib/config";

const COST = 16384;
const SESSION_SECONDS = 30 * 24 * 60 * 60;
const COOKIE = "vonn_session";
const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

function derive(password: string, salt: string, N: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await derive(password, salt, COST);
  return `scrypt$${COST}$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  // Contraseñas migradas desde Supabase Auth (bcrypt): se aceptan y quedan para
  // re-hashear a scrypt en el primer login correcto (ver upgradeLegacyHash).
  if (/^\$2[aby]\$/.test(encoded)) return bcrypt.compare(password, encoded);
  const [scheme, cost, salt, hash, extra] = encoded.split("$");
  const N = Number(cost);
  if (scheme !== "scrypt" || extra !== undefined || ![16384, 32768].includes(N) ||
      !/^[a-f0-9]{32}$/.test(salt ?? "") || !/^[a-f0-9]{128}$/.test(hash ?? "")) return false;
  const actual = await derive(password, salt, N);
  return timingSafeEqual(actual, Buffer.from(hash, "hex"));
}

export function isLegacyHash(encoded: string): boolean {
  return /^\$2[aby]\$/.test(encoded);
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isValidToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}

export async function createSession(userId: string): Promise<void> {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000);
  await query(
    "insert into app_sessions (id, user_id, expires_at) values ($1, $2, $3)",
    [hashToken(token), userId, expires.toISOString()],
  );
  (await cookies()).set(COOKIE, token, { ...cookieOptions, expires, maxAge: SESSION_SECONDS });
}

export async function readSession(): Promise<{ id: string; email: string } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!isDbConfigured() || !token || !isValidToken(token)) return null;
  return queryOne(
    `select u.id, u.email from app_sessions s join app_users u on u.id = s.user_id
     where s.id = $1 and s.expires_at > now()`,
    [hashToken(token)],
  );
}

export async function closeSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (isDbConfigured() && token && isValidToken(token)) {
    await query("delete from app_sessions where id = $1", [hashToken(token)]);
  }
  jar.set(COOKIE, "", { ...cookieOptions, expires: new Date(0), maxAge: 0 });
}
