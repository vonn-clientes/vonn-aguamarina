import { NextResponse } from "next/server";
import { getMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isWrite, panelPrompt, runTool, TOOLS, type PendingAction } from "@/lib/sofi-panel";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Provider = { base: string; key: string; model: string };
function providers(): Provider[] {
  const out: Provider[] = [];
  for (const s of ["", "_2", "_3"]) {
    const key = process.env[`SOFI_API_KEY${s}`], base = process.env[`SOFI_BASE_URL${s}`], model = process.env[`SOFI_MODEL${s}`];
    if (key && base && model) out.push({ base: base.replace(/\/$/, ""), key, model });
  }
  return out;
}

type Msg = { role: string; content?: string | null; tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[]; tool_call_id?: string };

async function call(p: Provider, messages: Msg[], tools: boolean): Promise<Msg | null> {
  try {
    const res = await fetch(`${p.base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${p.key}` },
      body: JSON.stringify({ model: p.model, temperature: 0.4, max_tokens: 1200, ...(p.model.includes("gpt-oss") ? { reasoning_effort: "low" } : {}), messages, ...(tools ? { tools: TOOLS, tool_choice: "auto" } : {}) }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j?.choices?.[0]?.message ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const m = await getMembership();
  if (!m) return NextResponse.json({ error: "auth" }, { status: 401 });

  let body: { messages?: { role: string; content: string }[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad" }, { status: 400 }); }
  const history = (body.messages ?? [])
    .filter((x) => (x.role === "user" || x.role === "assistant") && typeof x.content === "string")
    .slice(-16)
    .map((x) => ({ role: x.role, content: x.content.slice(0, 2500) }));
  if (!history.length || history[history.length - 1].role !== "user") return NextResponse.json({ error: "bad" }, { status: 400 });

  const sb = await createClient();
  const { data: cat } = await sb.from("catalog_items").select("name, price, duration_minutes").eq("tenant_id", m.tenant.id).eq("active", true).order("sort_order").limit(80);
  const catalog = (cat ?? []).map((x) => `- ${x.name}${x.price ? ` · $${x.price}` : ""}${x.duration_minutes ? ` · ${x.duration_minutes} min` : ""}`).join("\n") || "(sin cargar)";
  const msgs: Msg[] = [{ role: "system", content: panelPrompt(m.tenant.business_name || "Aguamarina", catalog) }, ...history];

  const ctx = { sb, tenantId: m.tenant.id };
  const pending: PendingAction[] = [];
  const provs = providers();
  if (!provs.length) return NextResponse.json({ reply: "Todavía no tengo mi cerebro conectado 😅", pending: [] });

  for (let step = 0; step < 5; step++) {
    let out: Msg | null = null;
    for (const p of provs) { out = await call(p, msgs, true); if (out) break; }
    if (!out) return NextResponse.json({ reply: "Uy, no pude pensar ahora mismo. Probá de nuevo en un ratito 💙", pending });
    const calls = out.tool_calls ?? [];
    if (!calls.length) {
      const reply = (out.content ?? "").replace(/[*#`]+/g, "").trim();
      return NextResponse.json({ reply: reply || (pending.length ? "Lo dejé preparado, revisalo abajo y confirmalo 👇" : "Listo 💙"), pending });
    }
    msgs.push({ role: "assistant", content: out.content ?? "", tool_calls: calls });
    for (const tc of calls) {
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(tc.function.arguments || "{}"); } catch {}
      let result: unknown;
      try {
        const r = await runTool(tc.function.name, args, ctx);
        result = r.result;
        if (r.pending && isWrite(tc.function.name)) pending.push(r.pending);
      } catch (e) {
        result = { error: e instanceof Error ? e.message : "error" };
      }
      msgs.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result).slice(0, 6000) });
    }
  }
  return NextResponse.json({ reply: pending.length ? "Lo dejé preparado, revisalo abajo y confirmalo 👇" : "Me enredé un poco, ¿me lo pedís de otra forma?", pending });
}
