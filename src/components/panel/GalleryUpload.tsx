"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Galería de fotos de un tratamiento o producto: se pueden subir varias a la vez.
// Cada foto se achica en el navegador (máx. 1600 px) antes de subirse.
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("foto"))), "image/jpeg", 0.85)
  );
}

export function GalleryUpload({
  tenantId,
  name,
  defaultUrls = [],
}: {
  tenantId: string;
  name: string;
  defaultUrls?: string[];
}) {
  const [urls, setUrls] = useState<string[]>(defaultUrls);
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 12);
    if (files.length === 0) return;
    setState("uploading");
    try {
      const supabase = createClient();
      const added: string[] = [];
      for (const file of files) {
        const blob = await shrink(file);
        const path = `${tenantId}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from("aguamarina-media").upload(path, blob, { contentType: "image/jpeg" });
        if (error) throw error;
        added.push(supabase.storage.from("aguamarina-media").getPublicUrl(path).data.publicUrl);
      }
      setUrls((prev) => [...prev, ...added]);
      setState("idle");
    } catch {
      setState("error");
    }
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      {urls.map((u) => (
        <input key={u} type="hidden" name={name} value={u} />
      ))}
      <div className="flex flex-wrap gap-2">
        {urls.map((u) => (
          <div key={u} className="relative h-20 w-20 overflow-hidden rounded-sm border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Quitar foto"
              className="absolute right-0 top-0 bg-ink/70 px-1.5 text-white vonn-text-caption"
              onClick={() => setUrls((prev) => prev.filter((x) => x !== u))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <label className="vonn-text-caption text-primary cursor-pointer font-medium">
        {state === "uploading" ? "Subiendo fotos…" : "Agregar fotos a la galería (podés elegir varias)"}
        <input type="file" accept="image/*" multiple className="sr-only" onChange={onPick} disabled={state === "uploading"} />
      </label>
      {state === "error" && <span className="vonn-text-caption text-accent">No se pudo subir alguna foto. Probá de nuevo.</span>}
    </div>
  );
}
