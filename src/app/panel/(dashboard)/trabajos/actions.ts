"use server";

import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const { count } = await supabase.from("work_albums").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId);
  if ((count ?? 0) > 0) return;
  await supabase.from("work_albums").insert(
    WORK_ALBUMS.map((a, i) => ({ tenant_id: tenantId, title: a.title, caption: a.caption, photos: a.photos, sort_order: i }))
  );
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
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("work_albums")
    .select("sort_order")
    .eq("tenant_id", membership.tenant.id)
    .order("sort_order", { ascending: false })
    .limit(1);
  await supabase.from("work_albums").insert({
    tenant_id: membership.tenant.id,
    title,
    caption: String(formData.get("caption") || "").trim() || null,
    photos: cleanPhotos(formData.get("photos")),
    sort_order: (last?.[0]?.sort_order ?? -1) + 1,
  });
  refresh();
}

export async function updateAlbum(albumId: string, formData: FormData) {
  const membership = await requireMembership();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const supabase = await createClient();
  await supabase
    .from("work_albums")
    .update({
      title,
      caption: String(formData.get("caption") || "").trim() || null,
      photos: cleanPhotos(formData.get("photos")),
    })
    .eq("id", albumId)
    .eq("tenant_id", membership.tenant.id);
  refresh();
}

export async function toggleAlbum(albumId: string, active: boolean) {
  const membership = await requireMembership();
  const supabase = await createClient();
  await supabase.from("work_albums").update({ active }).eq("id", albumId).eq("tenant_id", membership.tenant.id);
  refresh();
}

export async function deleteAlbum(albumId: string) {
  const membership = await requireMembership();
  const supabase = await createClient();
  await supabase.from("work_albums").delete().eq("id", albumId).eq("tenant_id", membership.tenant.id);
  refresh();
}

// Sube o baja una carpeta en el orden de la home.
export async function moveAlbum(albumId: string, dir: -1 | 1) {
  const membership = await requireMembership();
  const supabase = await createClient();
  const { data } = await supabase
    .from("work_albums")
    .select("id")
    .eq("tenant_id", membership.tenant.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(albumId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((id, k) => supabase.from("work_albums").update({ sort_order: k }).eq("id", id).eq("tenant_id", membership.tenant.id))
  );
  refresh();
}
