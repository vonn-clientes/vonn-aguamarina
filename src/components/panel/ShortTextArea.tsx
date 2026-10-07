"use client";

import { useState } from "react";

const SUGGESTED = 140;

// Campo de texto corto con contador: no bloquea, pero avisa si se escribe de más.
export function ShortTextArea({ name, defaultValue, placeholder }: { name: string; defaultValue?: string | null; placeholder?: string }) {
  const [n, setN] = useState((defaultValue ?? "").length);
  const long = n > SUGGESTED;
  return (
    <div className="flex flex-col gap-1">
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={3}
        placeholder={placeholder}
        onChange={(e) => setN(e.target.value.length)}
        className="w-full rounded-sm border border-line bg-canvas px-3 py-2 vonn-text-cuerpo outline-none focus:border-primary"
      />
      <p className={`vonn-text-caption ${long ? "text-accent font-medium" : "text-ink-muted"}`} aria-live="polite">
        {long
          ? `${n} caracteres: es largo. Te sugerimos dejarlo en ${SUGGESTED} o menos, porque los textos cortos se leen mejor en la web.`
          : `${n} de ${SUGGESTED} caracteres sugeridos. Mejor corto y fácil de leer.`}
      </p>
    </div>
  );
}
