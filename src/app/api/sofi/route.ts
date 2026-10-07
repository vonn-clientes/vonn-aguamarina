import { NextResponse } from "next/server";
import { createClient as sbClient } from "@supabase/supabase-js";
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

function asksAboutVonn(t: string): boolean {
  const q = fold(t);
  return /\bvonn\b|quien (hizo|creo|armo|desarrollo|diseno|programo|hace) (esta|la|el|este)|quien (esta )?(detras|hizo)|(hacer|armar|crear|tener|necesito|quiero|quisiera|diseñar|disenar|desarrollar)[^.?!]{0,25}(pagina|sitio|web|tienda online|sistema de turnos|app)\b|desarrollador|programador|agencia web|diseno web|pagina web para mi/.test(q);
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

  const lastText = messages[messages.length - 1].content;
  if (asksAboutVonn(lastText)) {
    return NextResponse.json({
      reply: "Esta página la hizo VONN, un estudio de software de Concepción del Uruguay que crea webs, sistemas de turnos y asistentes como yo para comercios y profesionales 💙 Si querés una página o un sistema para tu negocio, acá te dejo su ficha.",
      mentioned: [],
      card: "vonn",
      via: "rule",
    });
  }

  const site = await getPublicSite();
  if (!site) return NextResponse.json({ reply: "Ahora no puedo consultar el catálogo. Escribile a Ingrid por WhatsApp 💙", mentioned: [] });

  const system = systemPrompt(site, name);
  let text: string | null = null;
  for (const p of providers()) { text = await ask(p, system, messages); if (text) break; }

  // Opinión dejada por chat: se guarda OCULTA para que Ingrid la apruebe desde el panel.
  let savedReview = false;
  if (text) {
    const rm = text.match(/\[\[\s*resena\s*:\s*([^|\]]*)\|\s*([1-5])\s*\|\s*([^|\]]+)(?:\|\s*([^\]]*))?\]\]/i);
    if (rm) {
      // Si no hay tratamiento claro ("general"), la opinión se guarda en el primer tratamiento y se muestra como opinión del gabinete.
      const picked = [...site.services, ...site.products].find((i) => fold(i.name) === fold(rm[1].trim())) ?? null;
      const comment = rm[3].trim().slice(0, 600);
      const author = (rm[4] ?? "").replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 40) || name || "Clienta";
      if (comment.length >= 5) {
        const sb = sbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
        const base = { tenant_id: site.tenant.id, author, rating: Number(rm[2]), comment, visible: false };
        let { error } = await sb.from("reviews").insert({ ...base, item_id: picked?.id ?? null });
        const fallback = site.services[0] ?? site.products[0];
        // Si la base todavía exige un tratamiento, usa el primero del catálogo.
        if (error && !picked && fallback) ({ error } = await sb.from("reviews").insert({ ...base, item_id: fallback.id }));
        savedReview = !error;
      }
    }
  }

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
  return NextResponse.json({ reply, mentioned, via: text ? "ai" : "fallback", ...(savedReview ? { review: true } : {}) });
}

