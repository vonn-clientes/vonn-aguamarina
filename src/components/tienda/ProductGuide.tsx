import type { CatalogItem } from "@/lib/types";

// Guía completa del producto: qué es, activos, cómo se usa, para quién, resultados y preguntas.
// Los textos viven en catalog_items.guide (jsonb) y los beneficios en catalog_items.benefits.
export function ProductGuide({ item }: { item: CatalogItem }) {
  const g = item.guide;
  if (!g) return null;
  const benefits = item.benefits ?? [];
  const nav = [
    g.que_es && { id: "g-que-es", label: "Qué es" },
    benefits.length > 0 && { id: "g-beneficios", label: "Beneficios" },
    (g.ingredientes?.length ?? 0) > 0 && { id: "g-activos", label: "Activos clave" },
    (g.como_usar?.length ?? 0) > 0 && { id: "g-uso", label: "Cómo se usa" },
    (g.para_quien?.length ?? 0) > 0 && { id: "g-para-quien", label: "Para quién" },
    (g.faq?.length ?? 0) > 0 && { id: "g-faq", label: "Preguntas" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <section className="ag-guide" aria-label={`Guía de ${item.name}`}>
      <div className="ag-wrap">
        <p className="ag-guide__brand">{g.marca}{g.linea ? ` · ${g.linea}` : ""}</p>
        <h2 className="ag-h2 ag-guide__title">Guía completa</h2>
        {g.tagline && <p className="ag-lead">{g.tagline}</p>}
        <nav className="ag-guide__nav" aria-label="Secciones de la guía">
          {nav.map((n) => <a key={n.id} href={`#${n.id}`}>{n.label}</a>)}
        </nav>

        {g.que_es && (
          <div className="ag-guide__block" id="g-que-es">
            <h3>Qué es</h3>
            <p>{g.que_es}</p>
          </div>
        )}

        {benefits.length > 0 && (
          <div className="ag-guide__block" id="g-beneficios">
            <h3>Qué hace por tu piel</h3>
            <ul className="ag-guide__ticks">{benefits.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        )}

        {(g.ingredientes?.length ?? 0) > 0 && (
          <div className="ag-guide__block" id="g-activos">
            <h3>Activos clave</h3>
            <dl className="ag-guide__actives">
              {g.ingredientes!.map((a) => (
                <div key={a.nombre}>
                  <dt>{a.nombre}</dt>
                  <dd>{a.funcion}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {((g.como_usar?.length ?? 0) > 0 || (g.cuando?.length ?? 0) > 0) && (
          <div className="ag-guide__block ag-guide__cols" id="g-uso">
            {(g.como_usar?.length ?? 0) > 0 && (
              <div>
                <h3>Cómo se usa</h3>
                <ol>{g.como_usar!.map((s) => <li key={s}>{s}</li>)}</ol>
              </div>
            )}
            {(g.cuando?.length ?? 0) > 0 && (
              <div>
                <h3>Cuándo usarlo</h3>
                <ul>{g.cuando!.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
          </div>
        )}

        {((g.para_quien?.length ?? 0) > 0 || (g.resultados?.length ?? 0) > 0) && (
          <div className="ag-guide__block ag-guide__cols" id="g-para-quien">
            {(g.para_quien?.length ?? 0) > 0 && (
              <div>
                <h3>Para quién es</h3>
                <ul>{g.para_quien!.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
            {(g.resultados?.length ?? 0) > 0 && (
              <div>
                <h3>Cuándo se notan los resultados</h3>
                <ul>{g.resultados!.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
          </div>
        )}

        {(g.precauciones?.length ?? 0) > 0 && (
          <div className="ag-guide__block ag-guide__care">
            <h3>Precauciones</h3>
            <ul>{g.precauciones!.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        )}

        {(g.faq?.length ?? 0) > 0 && (
          <div className="ag-guide__block" id="g-faq">
            <h3>Preguntas frecuentes</h3>
            <div className="ag-guide__faq">
              {g.faq!.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
