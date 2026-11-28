import { NextResponse } from "next/server";
import { getMembership } from "@/lib/auth";
import { mediaUrl, putMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX = 6 * 1024 * 1024; // las fotos ya llegan achicadas (≈200 KB); esto es solo un tope

// Sube una foto a R2 dentro de la carpeta del propio tenant (sale de la sesión,
// nunca del navegador). Devuelve la dirección pública /media/<tenant>/<archivo>.
export async function POST(req: Request) {
  const m = await getMembership();
  if (!m) return NextResponse.json({ error: "auth" }, { status: 401 });

  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: "bad" }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX) return NextResponse.json({ error: "bad" }, { status: 400 });
  if (file.type !== "image/webp" && file.type !== "image/jpeg" && file.type !== "image/png") return NextResponse.json({ error: "tipo" }, { status: 400 });

  const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
  const raw = String(form.get("name") || "foto").toLowerCase().replace(/\.[a-z0-9]+$/, "");
  const base = raw.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "foto";
  const key = `${m.tenant.id}/${base}-${Date.now().toString(36)}.${ext}`;

  try {
    await putMedia(key, await file.arrayBuffer(), file.type);
  } catch {
    return NextResponse.json({ error: "storage" }, { status: 503 });
  }
  return NextResponse.json({ url: mediaUrl(key) });
}
