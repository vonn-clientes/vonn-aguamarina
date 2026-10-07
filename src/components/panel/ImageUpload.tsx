"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Subida de fotos desde el panel. La foto se achica en el navegador (máx. 1400 px)
// antes de subirla, así las fotos del celular pesan poco y la web carga rápido.
// Guarda la dirección final en un campo oculto del formulario.
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la foto"))), "image/jpeg", 0.85)
  );
}

export function ImageUpload({
  tenantId,
  name,
  defaultUrl,
  label = "Foto",
}: {
  tenantId: string;
  name: string;
  defaultUrl?: string | null;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState("uploading");
    try {
      const blob = await shrink(file);
      const supabase = createClient();
      const path = `${tenantId}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("aguamarina-media").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      setUrl(supabase.storage.from("aguamarina-media").getPublicUrl(path).data.publicUrl);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <input type="hidden" name={name} value={url} />
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-line bg-canvas-muted flex items-center justify-center vonn-text-caption text-ink-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : "Sin foto"}
      </div>
      <div className="flex flex-col gap-1">
        <label className="vonn-text-caption text-primary cursor-pointer font-medium">
          {state === "uploading" ? "Subiendo…" : url ? `Cambiar ${label.toLowerCase()}` : `Subir ${label.toLowerCase()}`}
          <input type="file" accept="image/*" className="sr-only" onChange={onPick} disabled={state === "uploading"} />
        </label>
        {url && (
          <button type="button" className="vonn-text-caption text-ink-muted text-left" onClick={() => setUrl("")}>
            Quitar
          </button>
        )}
        {state === "error" && <span className="vonn-text-caption text-accent">No se pudo subir. Probá con otra foto.</span>}
      </div>
    </div>
  );
}
