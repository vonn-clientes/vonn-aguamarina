"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { seoAlt, seoImageFileName } from "@/lib/seo-image";
import type { WorkPhoto } from "@/lib/trabajos";
import { addAlbum, deleteAlbum, moveAlbum, toggleAlbum, updateAlbum } from "@/app/panel/(dashboard)/trabajos/actions";
import { DeleteButton, EditButton, Switch } from "./Controls";

const field = "w-full rounded-sm border border-line bg-canvas px-3 py-2 text-base outline-none focus:border-primary";

// Cada foto se achica en el navegador (máx. 1600 px, WebP) y se guarda con su tamaño real,
// así la home la muestra entera, vertical u horizontal.
async function shrink(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("foto"))), "image/webp", 0.82)
  );
  return { blob, width: canvas.width, height: canvas.height };
}

function PhotoEditor({ tenantId, title, photos, setPhotos }: { tenantId: string; title: string; photos: WorkPhoto[]; setPhotos: (p: WorkPhoto[]) => void }) {
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []).slice(0, 30);
    if (files.length === 0) return;
    setState("uploading");
    try {
      const supabase = createClient();
      const added: WorkPhoto[] = [];
      for (const file of files) {
        const { blob, width, height } = await shrink(file);
        const path = `${tenantId}/${seoImageFileName(`trabajo ${title}`)}`;
        const { error } = await supabase.storage.from("aguamarina-media").upload(path, blob, { contentType: "image/webp" });
        if (error) throw error;
        added.push({
          src: supabase.storage.from("aguamarina-media").getPublicUrl(path).data.publicUrl,
          width,
          height,
          alt: seoAlt(title || "Trabajo realizado", "tratamiento", photos.length + added.length + 1),
        });
      }
      setPhotos([...photos, ...added]);
      setState("idle");
    } catch {
      setState("error");
    }
    input.value = "";
  }

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    setPhotos(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {photos.map((p, i) => (
          <div key={p.src} className="flex flex-col gap-1">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" className="h-full w-full object-cover" />
              <button type="button" aria-label="Quitar foto" className="absolute right-0 top-0 bg-ink/70 px-2 py-0.5 text-white" onClick={() => setPhotos(photos.filter((_, k) => k !== i))}>×</button>
            </div>
            <div className="flex gap-1">
              <button type="button" className="ag-pbtn ag-pbtn--ghost" aria-label="Mover antes" onClick={() => move(i, -1)} disabled={i === 0}>◀</button>
              <button type="button" className="ag-pbtn ag-pbtn--ghost" aria-label="Mover después" onClick={() => move(i, 1)} disabled={i === photos.length - 1}>▶</button>
            </div>
            <input
              className={field}
              value={p.alt}
              placeholder="Descripción de la foto"
              aria-label="Descripción de la foto"
              onChange={(e) => setPhotos(photos.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))}
            />
          </div>
        ))}
      </div>
      <label className="vonn-text-caption text-primary cursor-pointer font-medium">
        {state === "uploading" ? "Subiendo fotos…" : "＋ Agregar fotos (podés elegir varias)"}
        <input type="file" accept="image/*" multiple className="sr-only" onChange={onPick} disabled={state === "uploading"} />
      </label>
      {state === "error" && <span className="vonn-text-caption text-accent">No se pudo subir alguna foto. Probá de nuevo.</span>}
    </div>
  );
}

export type AlbumRowData = { id: string; title: string; caption: string | null; photos: WorkPhoto[]; active: boolean };

export function AlbumCard({ album, tenantId, first, last }: { album: AlbumRowData; tenantId: string; first: boolean; last: boolean }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(album.title);
  const [photos, setPhotos] = useState<WorkPhoto[]>(album.photos);

  return (
    <div className="py-4 border-b border-line last:border-b-0">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[12rem]">
          <strong>{album.title}</strong>
          <div className="vonn-text-caption text-ink-muted">
            {album.caption ? `${album.caption} · ` : ""}{album.photos.length} {album.photos.length === 1 ? "foto" : "fotos"}
            {!album.active && " · oculta en la página"}
          </div>
        </div>
        <button type="button" className="ag-pbtn ag-pbtn--ghost" aria-label="Subir carpeta" disabled={first || pending} onClick={() => startTransition(() => moveAlbum(album.id, -1))}>▲</button>
        <button type="button" className="ag-pbtn ag-pbtn--ghost" aria-label="Bajar carpeta" disabled={last || pending} onClick={() => startTransition(() => moveAlbum(album.id, 1))}>▼</button>
        <Switch checked={album.active} label={album.active ? "Ocultar carpeta" : "Mostrar carpeta"} onChange={(n) => startTransition(() => toggleAlbum(album.id, n))} disabled={pending} />
        <EditButton onClick={() => setEditing((v) => !v)} />
        <DeleteButton onConfirm={() => startTransition(() => deleteAlbum(album.id))} />
      </div>
      {editing && (
        <form
          action={(formData) => startTransition(async () => { await updateAlbum(album.id, formData); setEditing(false); })}
          className="mt-4 flex flex-col gap-3"
        >
          <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre de la carpeta" required className={field} />
          <input name="caption" defaultValue={album.caption ?? ""} placeholder="Detalle (ej: Peinado de novia · octubre 2026)" className={field} />
          <input type="hidden" name="photos" value={JSON.stringify(photos)} />
          <PhotoEditor tenantId={tenantId} title={title} photos={photos} setPhotos={setPhotos} />
          <div className="flex gap-3">
            <button type="submit" className="ag-pbtn" disabled={pending}>{pending ? "Guardando…" : "Guardar cambios"}</button>
            <button type="button" className="ag-pbtn ag-pbtn--ghost" onClick={() => { setEditing(false); setTitle(album.title); setPhotos(album.photos); }}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AddAlbumForm({ tenantId }: { tenantId: string }) {
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState<WorkPhoto[]>([]);

  return (
    <form
      action={(formData) => startTransition(async () => { await addAlbum(formData); setTitle(""); setPhotos([]); })}
      className="flex flex-col gap-3"
    >
      <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre de la carpeta nueva (ej: Casamiento de Lucía)" required className={field} />
      <input name="caption" placeholder="Detalle (opcional, ej: Maquillaje de novia · noviembre 2026)" className={field} />
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />
      <PhotoEditor tenantId={tenantId} title={title} photos={photos} setPhotos={setPhotos} />
      <div>
        <button type="submit" className="ag-pbtn" disabled={pending || !title.trim()}>{pending ? "Creando…" : "Crear carpeta"}</button>
      </div>
    </form>
  );
}
