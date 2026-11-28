import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Las fotos viven en R2 (binding "MEDIA"), con la clave "<tenant_id>/<archivo>".
// Se sirven públicamente desde /media/<clave>. Reemplaza a Supabase Storage.
type Bucket = {
  put(key: string, value: ArrayBuffer | ReadableStream, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpEtag: string; httpMetadata?: { contentType?: string } } | null>;
};

function bucket(): Bucket | null {
  try {
    const env = getCloudflareContext().env as unknown as { MEDIA?: Bucket };
    return env.MEDIA ?? null;
  } catch {
    return null;
  }
}

export const hasStorage = () => bucket() !== null;

export async function putMedia(key: string, body: ArrayBuffer, contentType: string) {
  const b = bucket();
  if (!b) throw new Error("storage no configurado");
  await b.put(key, body, { httpMetadata: { contentType } });
}

export async function getMedia(key: string) {
  const b = bucket();
  if (!b) return null;
  return b.get(key);
}

export const mediaUrl = (key: string) => `/media/${key}`;
