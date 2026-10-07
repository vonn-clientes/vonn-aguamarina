"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 1800);
    } catch {
      window.prompt("Copiá esto:", text);
    }
  }
  return (
    <button type="button" className="ag-more ag-cm-copy" onClick={copy}>
      {ok ? "¡Copiado!" : label}
    </button>
  );
}
