import { NextResponse } from "next/server";
import { fallbackReply, fold, getPublicSite, systemPrompt, type ChatMsg } from "@/lib/sofi";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Límite sencillo por IP (en memoria): alcanza para frenar abusos básicos.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 2000) hits.clear();
  return arr.length > 30;
}

let lastErr = "";
type Provider = { base: string; key: string; model: string };
// Hasta tres proveedores/modelos de IA gratuitos compatibles con el formato OpenAI (Groq, Google Gemini, OpenRouter, etc.).
function providers(): Provider[] {
  const out: Provider[] = [];
  for (const s of ["", "_2", "_3"]) {
    const key = process.env[`SOFI_API_KEY${s}`];
    const base = process.env[`SOFI_BASE_URL${s}`];
    const model = process.env[`SOFI_MODEL${s}`];
    if (key && base && model) out.push({ base: base.replace(/\/$/, ""), key, model });
  }
  return out;
}

async function ask(p: Provider, system: string, messages: ChatMsg[]): Promise<string | null> {
  try {
    const res = await fetch(`${p.base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${p.key}` },
      body: JSON.stringify({ model: p.model, temperature: 0.5, max_tokens: 900, ...(p.model.includes("gpt-oss") ? { reasoning_effort: "low" } : {}), messages: [{ role: "system", content: system }, ...messages] }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) { lastErr = `${p.model}:${res.status}`; return null; }
    const j = await res.json();
    const t = j?.choices?.[0]?.message?.content;
    if (!(typeof t === "string" && t.trim())) lastErr = `${p.model}:vacio`;
    return typeof t === "string" && t.trim() ? t.trim() : null;
  } catch (e) {
    lastErr = `${p.model}:${e instanceof Error ? e.name : "err"}`;
    return null;
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (limited(ip)) return NextResponse.json({ reply: "Uf, me escribiste muchísimo 😅 Probá en unos minutos o escribile directo a Ingrid por WhatsApp.", mentioned: [] });

  let body: { messages?: ChatMsg[]; name?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad" }, { status: 400 }); }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "bad" }, { status: 400 });
  const name = (body.name ?? "").replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 30) || null;

  const site = await getPublicSite();
  if (!site) return NextResponse.json({ reply: "Ahora no puedo consultar el catálogo. Escribile a Ingrid por WhatsApp 💙", mentioned: [] });

  const system = systemPrompt(site, name);
  let text: string | null = null;
  for (const p of providers()) { text = await ask(p, system, messages); if (text) break; }

  const names = [...site.services, ...site.products].map((i) => i.name).concat(site.promos.map((p) => p.title));
  let reply: string, mentioned: string[];
  if (text) {
    const m = text.match(/\[\[\s*interes\s*:\s*([^\]]*)\]\]/i);
    reply = text.replace(/\[\[[^\]]*\]\]/g, "").replace(/[*_#`]+/g, "").trim();
    const tagged = m ? m[1].split(";").map((s) => s.trim()).filter(Boolean) : [];
    mentioned = names.filter((n) => tagged.some((t) => fold(t) === fold(n)));
  } else {
    ({ reply, mentioned } = fallbackReply(site, messages[messages.length - 1].content, name));
  }
  return NextResponse.json({ reply, mentioned, via: text ? "ai" : `fallback ${lastErr}` });
}

// Diagnóstico: lista los modelos disponibles para la clave configurada (no expone la clave).
export async function GET() {
  const p = providers()[0];
  if (!p) return NextResponse.json({ error: "sin configurar" });
  try {
    const r = await fetch(`${p.base}/models`, { headers: { authorization: `Bearer ${p.key}` }, signal: AbortSignal.timeout(8000) });
    const j = await r.json();
    return NextResponse.json({ status: r.status, models: (j?.data ?? []).map((m: { id: string }) => m.id), configured: providers().map((x) => x.model) });
  } catch { return NextResponse.json({ error: "fallo" }); }
}
