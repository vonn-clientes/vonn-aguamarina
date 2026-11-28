// Sube una foto (ya achicada) al servidor, que la guarda en R2 dentro de la
// carpeta del tenant de la sesión. Devuelve la dirección pública.
export async function uploadMedia(blob: Blob, fileName: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", new File([blob], fileName, { type: blob.type || "image/webp" }));
  fd.append("name", fileName);
  const res = await fetch("/api/media/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("upload");
  return (await res.json()).url as string;
}
