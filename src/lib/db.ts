import "server-only";
import { neon, types as pgTypes } from "@neondatabase/serverless";

// Supabase (PostgREST) devolvía numeric/bigint como números y fechas como
// texto ISO. Neon devuelve numeric como texto y las fechas como objetos Date.
// Para no tocar todo el código que hace cuentas y formatea fechas se parsean
// acá igual que antes: numeric (1700) e int8 (20) → number, date (1082) →
// "AAAA-MM-DD", timestamptz (1184) → texto ISO.
const customTypes = {
  getTypeParser: (oid: number, format?: unknown) => {
    if (oid === 1700 || oid === 20) return (v: string) => Number(v);
    if (oid === 1082) return (v: string) => v;
    if (oid === 1184) return (v: string) => new Date(v).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (pgTypes as any).getTypeParser(oid, format);
  },
};

// Inicialización diferida: importar este módulo no requiere DATABASE_URL.
// El texto SQL es estático; todos los valores van en params ($1, $2, ...).
export function sql(text: string, params: unknown[] = []) {
  return neon(process.env.DATABASE_URL!).query(text, params, { types: customTypes });
}

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await sql(text, params)) as T[];
}

export async function queryOne<T>(text: string, params: unknown[] = []): Promise<T | null> {
  return (await query<T>(text, params))[0] ?? null;
}

// ---- Ayudas para insertar / actualizar sin armar SQL a mano ----
// Los nombres de tabla y columna salen siempre del código (nunca del navegador);
// igual se validan. Los valores van por parámetros. `json` lista las columnas
// jsonb (un array JS común se manda como array de Postgres, no como JSON).
const IDENT = /^[a-z_][a-z0-9_]*$/;
const ident = (n: string) => {
  if (!IDENT.test(n)) throw new Error(`identificador inválido: ${n}`);
  return n;
};
type Opts = { json?: string[] };
const val = (k: string, v: unknown, o?: Opts) =>
  o?.json?.includes(k) && v !== null && v !== undefined ? JSON.stringify(v) : v;

export async function insertRow<T = { id: string }>(
  table: string,
  values: Record<string, unknown>,
  opts: Opts & { returning?: string } = {},
): Promise<T | null> {
  const cols = Object.keys(values).filter((k) => values[k] !== undefined);
  const params = cols.map((k) => val(k, values[k], opts));
  const ph = cols.map((k, i) => (opts.json?.includes(k) ? `$${i + 1}::jsonb` : `$${i + 1}`));
  return queryOne<T>(
    `insert into ${ident(table)} (${cols.map(ident).join(", ")}) values (${ph.join(", ")}) returning ${opts.returning ?? "id"}`,
    params,
  );
}

// UPDATE siempre acotado por tenant_id (y opcionalmente por más condiciones).
export async function updateRows(
  table: string,
  patch: Record<string, unknown>,
  where: { tenant_id: string } & Record<string, unknown>,
  opts: Opts = {},
): Promise<number> {
  const pc = Object.keys(patch).filter((k) => patch[k] !== undefined);
  if (!pc.length) return 0;
  const params: unknown[] = pc.map((k) => val(k, patch[k], opts));
  const sets = pc.map((k, i) => (opts.json?.includes(k) ? `${ident(k)} = $${i + 1}::jsonb` : `${ident(k)} = $${i + 1}`));
  const wc = Object.keys(where);
  const conds = wc.map((k, i) => {
    params.push(where[k]);
    return `${ident(k)} = $${pc.length + i + 1}`;
  });
  const rows = await query<{ id: string }>(
    `update ${ident(table)} set ${sets.join(", ")} where ${conds.join(" and ")} returning 1 as id`,
    params,
  );
  return rows.length;
}

export async function deleteRows(table: string, where: { tenant_id: string } & Record<string, unknown>): Promise<number> {
  const wc = Object.keys(where);
  const params = wc.map((k) => where[k]);
  const rows = await query<{ id: string }>(
    `delete from ${ident(table)} where ${wc.map((k, i) => `${ident(k)} = $${i + 1}`).join(" and ")} returning 1 as id`,
    params,
  );
  return rows.length;
}
