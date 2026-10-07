"use client";

import { useEffect, useRef, useState } from "react";
import { waLink } from "@/lib/seo";

type Msg = { role: "user" | "assistant"; content: string };
const KEY = "sofi-v1";
const CHIPS = ["Quiero cuidar mi piel", "Busco algo para el cuerpo", "¿Qué promos hay?", "¿Qué productos venden?"];

export function SofiChat({ whatsapp }: { whatsapp: string | null | undefined }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [interest, setInterest] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Link directo desde Instagram: /?sofi=1 abre el chat.
    try { if (new URLSearchParams(window.location.search).get("sofi")) setOpen(true); } catch {}
  }, []);
  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (s) { setName(s.name ?? ""); setMsgs(s.msgs ?? []); setInterest(s.interest ?? []); }
    } catch {}
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify({ name, msgs, interest })); } catch {}
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [name, msgs, interest, busy, open]);

  async function send(content: string) {
    const t = content.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const [r] = await Promise.all([
        fetch("/api/sofi", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next, name }) }),
        new Promise((res) => setTimeout(res, 1100)), // pausa natural: se ve "escribiendo…"
      ]);
      const j = await r.json();
      setMsgs([...next, { role: "assistant", content: j.reply || "Uy, se me cruzaron los cables. ¿Me lo repetís? 💙" }]);
      if (Array.isArray(j.mentioned) && j.mentioned.length) setInterest((cur) => [...new Set([...cur, ...j.mentioned])]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Uy, se me cortó la conexión. Probá de nuevo o escribile a Ingrid por WhatsApp 💙" }]);
    }
    setBusy(false);
  }

  const who = name ? `Soy ${name}. ` : "";
  const wa = waLink(
    whatsapp,
    interest.length
      ? `Hola Ingrid! ${who}Estuve charlando con Sofi y me gustaría sacar un turno para: ${interest.join(", ")}. ¿Qué días tenés disponibles?`
      : `Hola Ingrid! ${who}Estuve charlando con Sofi en la web y me gustaría sacar un turno o recibir asesoramiento.`,
  );

  return (
    <>
      {!open && (
        <button className="ag-sofi-fab" onClick={() => setOpen(true)} aria-label="Hablar con Sofi, asesora virtual">
          <span className="ag-sofi-fab__dot" aria-hidden>✦</span>
          <span><b>Sofi</b><small><i className="ag-sofi__on" aria-hidden />En línea · asesora virtual</small></span>
        </button>
      )}
      {open && (
        <section className="ag-sofi" role="dialog" aria-label="Chat con Sofi, asesora virtual de Aguamarina">
          <header>
            <span className="ag-sofi__avatar" aria-hidden>S<i className="ag-sofi__on" /></span>
            <div><b>Sofi</b><small>{busy ? "escribiendo…" : "En línea · asesora virtual"}</small></div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat">×</button>
          </header>
          <div className="ag-sofi__body" aria-live="polite">
            <div className="ag-sofi__bot">¡Hola! Soy Sofi, la asesora virtual de Aguamarina 🌊 Te ayudo a elegir tratamientos, productos y packs. {name ? `¿En qué te ayudo, ${name}?` : "¿Cómo te llamás?"}</div>
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ag-sofi__me" : "ag-sofi__bot"}>{m.content}</div>
            ))}
            {busy && <div className="ag-sofi__bot ag-sofi__typing" aria-label="Sofi está escribiendo"><i /><i /><i /></div>}
            {name && msgs.length === 0 && (
              <div className="ag-sofi__chips">{CHIPS.map((c) => (<button key={c} onClick={() => send(c)}>{c}</button>))}</div>
            )}
            <div ref={end} />
          </div>
          <div className="ag-sofi__foot">
          {msgs.length > 0 && (
            <a className="ag-sofi__wa" href={wa} target="_blank" rel="noopener noreferrer">
              Pedir turno por WhatsApp{interest.length ? ` · ${interest.length === 1 ? interest[0] : `${interest.length} elegidos`}` : ""}
            </a>
          )}
          {!name ? (
            <form className="ag-sofi__form" onSubmit={(e) => { e.preventDefault(); const n = nameDraft.trim().slice(0, 30); if (n) setName(n); }}>
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Tu nombre" aria-label="Tu nombre" autoComplete="given-name" />
              <button type="submit">Empezar</button>
            </form>
          ) : (
            <form className="ag-sofi__form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribile a Sofi…" aria-label="Mensaje" maxLength={500} />
              <button type="submit" disabled={busy || !text.trim()}>Enviar</button>
            </form>
          )}
          <div className="ag-sofi__note">Sofi es un asistente virtual · Los turnos los confirma Ingrid</div>
          </div>
        </section>
      )}
    </>
  );
}
