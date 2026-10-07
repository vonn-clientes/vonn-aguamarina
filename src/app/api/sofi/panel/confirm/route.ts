import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { execute } from "@/lib/sofi-panel";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const m = await getMembership();
  if (!m) return NextResponse.json({ ok: false, message: "Tu sesión venció, volvé a entrar." }, { status: 401 });
  let body: { kind?: string; args?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, message: "Pedido inválido" }, { status: 400 }); }
  if (!body.kind || typeof body.args !== "object" || !body.args) return NextResponse.json({ ok: false, message: "Pedido inválido" }, { status: 400 });
  try {
    const message = await execute(body.kind, body.args, { sb: await createClient(), tenantId: m.tenant.id });
    revalidatePath("/panel/agenda", "layout");
    return NextResponse.json({ ok: true, message });
  } catch (e) {
    return NextResponse.json({ ok: false, message: `No pude hacerlo: ${e instanceof Error ? e.message : "error"}` });
  }
}
