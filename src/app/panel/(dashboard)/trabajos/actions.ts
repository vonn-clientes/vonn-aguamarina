"use server";

import { requireMembership } from "@/lib/auth";
import { deleteRows, insertRow, query, queryOne, updateRows } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { WORK_ALBUMS, type WorkPhoto } from "@/lib/trabajos";

function refresh() {
  revalidatePath("/panel/trabajos");
  revalidatePath("/");
}

function cleanPhotos(raw: FormDataEntryValue | null): WorkPhoto[] {
  try {
    const list = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(list)) return [];
    return list
      .filter((p) => p && typeof p.src === "string" && (p.src.startsWith("/") || p.src.startsWith("https://")))
      .map((p) => ({
        src: String(p.src),
        width: Math.max(1, Math.round(Number(p.width) || 1200)),
        height: Math.max(1, Math.round(Number(p.height) || 1600)),
        alt: String(p.alt ?? "").slice(0, 300),
      }));
  } catch {
    return [];
  }
}

// La primera vez, las carpetas que venían en el código pasan a ser de Ingrid (editables).
async function importStatic(tenantId: string) {
  const cnt = await queryOne<{ n: number }>("select count(*)::int as n from work_albums where tenant_id = $1", [tenantId]);
  if ((cnt?.n ?? 0) > 0) return;
  for (const [i, a] of WORK_ALBUMS.entries()) {
    await insertRow("work_albums", { tenant_id: tenantId, title: a.title, caption: a.caption, photos: a.photos, sort_order: i }, { json: ["photos"] });
  }
}

export async function importStaticAlbums() {
  const membership = await requireMembership();
  await importStatic(membership.tenant.id);
  refresh();
}

export async function addAlbum(formData: FormData) {
  const membership = await requireMembership();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await importStatic(membership.tenant.id);
  const last = await queryOne<{ sort_order: number }>(
    "select sort_order from work_albums where tenant_id = $1 order by sort_order desc limit 1",
    [membership.tenant.id],
  );
  await insertRow(
    "work_albums",
    {
      tenant_id: membership.tenant.id,
      title,
      caption: String(formData.get("caption") || "").trim() || null,
      photos: cleanPhotos(formData.get("photos")),
      sort_order: (last?.sort_order ?? -1) + 1,
    },
    { json: ["photos"] },
  );
  refresh();
}

export async function updateAlbum(albumId: string, formData: FormData) {
  const membership = await requireMembership();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await updateRows(
    "work_albums",
    {
      title,
      caption: String(formData.get("caption") || "").trim() || null,
      photos: cleanPhotos(formData.get("photos")),
    },
    { id: albumId, tenant_id: membership.tenant.id },
    { json: ["photos"] },
  );
  refresh();
}

export async function toggleAlbum(albumId: string, active: boolean) {
  const membership = await requireMembership();
  await updateRows("work_albums", { active }, { id: albumId, tenant_id: membership.tenant.id });
  refresh();
}

export async function deleteAlbum(albumId: string) {
  const membership = await requireMembership();
  await deleteRows("work_albums", { id: albumId, tenant_id: membership.tenant.id });
  refresh();
}

// Sube o baja una carpeta en el orden de la home.
export async function moveAlbum(albumId: string, dir: -1 | 1) {
  const membership = await requireMembership();
  const data = await query<{ id: string }>(
    "select id from work_albums where tenant_id = $1 order by sort_order asc, created_at asc",
    [membership.tenant.id],
  );
  const ids = data.map((r) => r.id);
  const i = ids.indexOf(albumId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((id, k) => updateRows("work_albums", { sort_order: k }, { id, tenant_id: membership.tenant.id }))
  );
  refresh();
}
