"use client";

import { useState } from "react";

// Botón que copia un link al portapapeles para pegarlo en una historia de Instagram.
export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiá este link:", url);
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-sm bg-primary px-4 py-2 vonn-text-caption text-white whitespace-nowrap"
    >
      {copied ? "¡Copiado!" : "Copiar link"}
    </button>
  );
}
