import { getMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Entrega pública de las fotos guardadas en R2.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const k = key.join("/");
  if (key.length !== 2 || !/^[0-9a-f-]{36}$/i.test(key[0]) || !/^[a-z0-9._-]+$/.test(key[1])) return new Response("Not found", { status: 404 });
  const obj = await getMedia(k);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType ?? "image/webp",
      "cache-control": "public, max-age=31536000, immutable",
      etag: obj.httpEtag,
    },
  });
}
