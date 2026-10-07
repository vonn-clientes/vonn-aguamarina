"use client";

import { useEffect, useRef, useState } from "react";
import { useKeyboardFit } from "@/lib/use-keyboard-fit";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Pending = { kind: string; args: Record<string, unknown>; label: string; state?: "idle" | "busy" | "done" | "skipped" };
type Item = { id: string; name: string; hasPhoto: boolean };
type Msg = { role: "user" | "assistant"; content: string; pending?: Pending[]; photo?: { url: string; items: Item[] } };

const CHIPS = [
  "¿Qué turnos tengo hoy?",
  "¿Qué turnos tengo mañana?",
  "Resumime la semana",
  "Reservá un turno",
  "Escribime un copy para Instagram",
  "Armá un mensaje de recordatorio",
  "¿Qué le falta a la web?",
];

export function PanelSofi() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  useKeyboardFit(open);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy, open]);
  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 250);
  }, [open]);

  async function send(content: string) {
    const t = content.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const r = await fetch("/api/sofi/panel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (r.status === 401) throw new Error("auth");
      const j = await r.json();
      setMsgs([...next, { role: "assistant", content: j.reply || "Uy, no te entendí 💙", pending: (j.pending ?? []).map((p: Pending) => ({ ...p, state: "idle" })) }]);
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: e instanceof Error && e.message === "auth" ? "Se venció tu sesión: volvé a entrar al panel 🔐" : "Uy, se cortó la conexión. Probá de nuevo 💙" }]);
    }
    setBusy(false);
  }

  function patch(mi: number, pi: number, state: Pending["state"]) {
    setMsgs((cur) => cur.map((m, i) => (i === mi ? { ...m, pending: m.pending?.map((p, j) => (j === pi ? { ...p, state } : p)) } : m)));
  }

  async function confirm(mi: number, pi: number) {
    const p = msgs[mi].pending?.[pi];
    if (!p || p.state !== "idle") return;
    patch(mi, pi, "busy");
    try {
      const r = await fetch("/api/sofi/panel/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: p.kind, args: p.args }) });
      const j = await r.json();
      patch(mi, pi, j.ok ? "done" : "idle");
      setMsgs((cur) => [...cur, { role: "assistant", content: j.message }]);
      if (j.ok) router.refresh();
    } catch {
      patch(mi, pi, "idle");
      setMsgs((cur) => [...cur, { role: "assistant", content: "No pude hacerlo, probá de nuevo 💙" }]);
    }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || busy) return;
    setBusy(true);
    try {
      const bmp = await createImageBitmap(file);
      const sc = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(bmp.width * sc);
      cv.height = Math.round(bmp.height * sc);
      cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height);
      const blob: Blob = await new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej()), "image/webp", 0.8));
      const meta = await (await fetch("/api/sofi/panel/items")).json();
      const path = `${meta.tenantId}/sofi-${Date.now()}.webp`;
      const sb = createClient();
      const { error } = await sb.storage.from("aguamarina-media").upload(path, blob, { contentType: "image/webp" });
      if (error) throw error;
      const url = sb.storage.from("aguamarina-media").getPublicUrl(path).data.publicUrl;
      setMsgs((cur) => [...cur, { role: "user", content: "📷 Te mandé una foto" }, { role: "assistant", content: "¡Linda! ¿A qué tratamiento o producto se la pongo? (los que no tienen foto van primero)", photo: { url, items: meta.items } }]);
    } catch {
      setMsgs((cur) => [...cur, { role: "assistant", content: "No pude subir la foto, probá con otra 💙" }]);
    }
    setBusy(false);
  }

  async function assign(mi: number, it: Item) {
    const url = msgs[mi].photo?.url;
    if (!url) return;
    setMsgs((cur) => cur.map((m, i) => (i === mi ? { ...m, photo: undefined } : m)));
    try {
      const r = await fetch("/api/sofi/panel/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "asignar_foto", args: { id: it.id, url } }) });
      const j = await r.json();
      setMsgs((cur) => [...cur, { role: "assistant", content: j.ok ? `Listo, puse la foto en "${it.name}" ✅` : j.message }]);
      if (j.ok) router.refresh();
    } catch {
      setMsgs((cur) => [...cur, { role: "assistant", content: "No pude guardarla, probá de nuevo 💙" }]);
    }
  }

  async function copy(i: number, t: string) {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(i);
      setTimeout(() => setCopied(null), 1600);
    } catch {}
  }

  // Los textos largos (copies, mensajes) llevan botón "Copiar".
  const copyable = (m: Msg) => m.role === "assistant" && !m.pending?.length && m.content.length > 140;

  return (
    <>
      {!open && (
        <button className="ag-ps-fab" onClick={() => setOpen(true)} aria-label="Hablar con Sofi">
          <span className="ag-ps-fab__dot">S</span>
          <span>
            <b>Sofi</b>
            <small>Pedime lo que quieras</small>
          </span>
        </button>
      )}
      {open && (
        <section className="ag-ps" role="dialog" aria-label="Sofi, tu asistente">
          <header>
            <span className="ag-ps__av">S</span>
            <div>
              <b>Sofi</b>
              <small>{busy ? "escribiendo…" : "En línea · tu asistente"}</small>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
          </header>
          <div className="ag-ps__body">
            {!msgs.length && (
              <>
                <p className="ag-ps__bot">
                  ¡Hola Ingrid! 💙 Decime qué necesitás y lo hago yo: agendar o mover turnos, cobrar, anotar gastos, buscar una clienta, o escribirte un texto para redes o WhatsApp.
                </p>
                <div className="ag-ps__chips">
                  {CHIPS.map((c) => (
                    <button key={c} onClick={() => (c === "Reservá un turno" ? setText("Reservá un turno para ") : send(c))}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
            {msgs.map((m, mi) => (
              <div key={mi} className={m.role === "user" ? "ag-ps__row ag-ps__row--me" : "ag-ps__row"}>
                <p className={m.role === "user" ? "ag-ps__me" : "ag-ps__bot"}>{m.content}</p>
                {copyable(m) && (
                  <button className="ag-ps__copy" onClick={() => copy(mi, m.content)}>
                    {copied === mi ? "Copiado ✓" : "Copiar texto"}
                  </button>
                )}
                {m.photo && (
                  <div className="ag-ps__chips">
                    <img src={m.photo.url} alt="" className="ag-ps__thumb" />
                    {m.photo.items.map((it) => (
                      <button key={it.id} onClick={() => assign(mi, it)}>{it.name}{it.hasPhoto ? "" : " · sin foto"}</button>
                    ))}
                  </div>
                )}
                {m.pending?.map((p, pi) => (
                  <div key={pi} className={`ag-ps__act ag-ps__act--${p.state}`}>
                    <span>{p.label}</span>
                    {p.state === "done" ? (
                      <em>Hecho ✓</em>
                    ) : p.state === "skipped" ? (
                      <em>Descartado</em>
                    ) : (
                      <div>
                        <button className="ag-ps__ok" disabled={p.state === "busy"} onClick={() => confirm(mi, pi)}>
                          {p.state === "busy" ? "Guardando…" : "Confirmar"}
                        </button>
                        <button className="ag-ps__no" disabled={p.state === "busy"} onClick={() => patch(mi, pi, "skipped")}>
                          Descartar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {busy && (
              <p className="ag-ps__bot ag-ps__typing" aria-label="Sofi está escribiendo">
                <i /><i /><i />
              </p>
            )}
            <div ref={end} />
          </div>
          <form
            className="ag-ps__form"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <label className="ag-ps__cam" aria-label="Enviar una foto">
              📷
              <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} disabled={busy} />
            </label>
            <textarea
              ref={input}
              value={text}
              rows={1}
              placeholder="Escribile a Sofi…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(text);
                }
              }}
            />
            <button type="submit" disabled={busy || !text.trim()} aria-label="Enviar">➤</button>
          </form>
        </section>
      )}
    </>
  );
}
