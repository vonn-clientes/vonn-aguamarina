"use client";

import { useEffect, useState, useTransition } from "react";
import { submitIntake } from "@/app/formulario/actions";
import { INTAKE_SECTIONS, PER_PRODUCT, PER_TREATMENT, type Question } from "@/lib/intake-questions";

type Answers = Record<string, string | string[]>;
const DRAFT = "ag_intake_draft";

function Field({ q, value, set }: { q: Question; value: string | string[] | undefined; set: (v: string | string[]) => void }) {
  const id = `f-${q.key}`;
  return (
    <div className="ag-fq">
      <label htmlFor={id}>{q.label}</label>
      {q.help && <p className="ag-fq__help">{q.help}</p>}
      {q.type === "text" && <input id={id} value={(value as string) ?? ""} onChange={(e) => set(e.target.value)} />}
      {q.type === "long" && <textarea id={id} rows={4} value={(value as string) ?? ""} onChange={(e) => set(e.target.value)} />}
      {q.type === "choice" && (
        <div className="ag-fq__opts" role="radiogroup" aria-label={q.label}>
          {q.options.map((o) => (
            <label key={o} className="ag-fq__opt">
              <input type="radio" name={id} checked={value === o} onChange={() => set(o)} /> {o}
            </label>
          ))}
        </div>
      )}
      {q.type === "multi" && (
        <div className="ag-fq__opts">
          {q.options.map((o) => {
            const cur = (value as string[]) ?? [];
            return (
              <label key={o} className="ag-fq__opt">
                <input
                  type="checkbox"
                  checked={cur.includes(o)}
                  onChange={() => set(cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o])}
                />{" "}
                {o}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FormularioIngrid({ treatments, products }: { treatments: string[]; products: string[] }) {
  const [a, setA] = useState<Answers>({});
  const [hp, setHp] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  // Borrador guardado en el navegador, por si cierra la pestaña a mitad de camino.
  useEffect(() => {
    try {
      const d = localStorage.getItem(DRAFT);
      if (d) setA(JSON.parse(d));
    } catch {}
  }, []);
  const set = (k: string, v: string | string[]) => {
    setA((prev) => {
      const next = { ...prev, [k]: v };
      try { localStorage.setItem(DRAFT, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  function send() {
    setErr("");
    start(async () => {
      const r = await submitIntake(a, hp);
      if (r.ok) {
        try { localStorage.removeItem(DRAFT); } catch {}
        setDone(true);
      } else setErr(r.error ?? "No pudimos enviar.");
    });
  }

  if (done)
    return (
      <div className="ag-fq-done">
        <h2>¡Gracias, Ingrid!</h2>
        <p>Recibimos tus respuestas. Con esto dejamos la web como vos querés.</p>
      </div>
    );

  return (
    <form
      className="ag-form"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      {INTAKE_SECTIONS.map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          {s.intro && <p className="ag-fq__intro">{s.intro}</p>}
          {s.questions.map((q) => (
            <Field key={q.key} q={q} value={a[q.key]} set={(v) => set(q.key, v)} />
          ))}
        </section>
      ))}

      <section>
        <h2>Tratamientos</h2>
        <p className="ag-fq__intro">Si un dato no lo querés mostrar o no lo sabés, dejalo en blanco.</p>
        {treatments.map((t) => (
          <details key={t} className="ag-fq__group">
            <summary>{t}</summary>
            {PER_TREATMENT.map((q) => (
              <Field key={q.key} q={q} value={a[`t:${t}:${q.key}`]} set={(v) => set(`t:${t}:${q.key}`, v)} />
            ))}
          </details>
        ))}
      </section>

      {products.length > 0 && (
        <section>
          <h2>Productos</h2>
          {products.map((t) => (
            <details key={t} className="ag-fq__group">
              <summary>{t}</summary>
              {PER_PRODUCT.map((q) => (
                <Field key={q.key} q={q} value={a[`p:${t}:${q.key}`]} set={(v) => set(`p:${t}:${q.key}`, v)} />
              ))}
            </details>
          ))}
        </section>
      )}

      <input className="ag-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={hp} onChange={(e) => setHp(e.target.value)} />
      {err && <p className="ag-cm-err" role="alert">{err}</p>}
      <button className="ag-btn" type="submit" disabled={pending}>{pending ? "Enviando…" : "Enviar mis respuestas"}</button>
      <p className="ag-fq__help">Tus respuestas se guardan en este dispositivo mientras completás, así podés seguir más tarde.</p>
    </form>
  );
}
