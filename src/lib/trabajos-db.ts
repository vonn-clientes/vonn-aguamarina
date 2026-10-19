import { createClient } from "@/lib/supabase/server";
import { WORK_ALBUMS, type WorkAlbum, type WorkPhoto } from "@/lib/trabajos";

export type DbAlbum = {
  id: string;
  title: string;
  caption: string | null;
  photos: WorkPhoto[];
  active: boolean;
  sort_order: number;
};

// Carpetas que se ven en la home. Si todavía no se cargó ninguna desde el panel (o la tabla
// no responde), se muestran las que vienen en el código (lib/trabajos.ts).
export async function getPublicWorkAlbums(tenantId: string): Promise<WorkAlbum[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("work_albums")
      .select("id,title,caption,photos,active,sort_order")
      .eq("tenant_id", tenantId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return WORK_ALBUMS;
    return (data as DbAlbum[])
      .filter((a) => a.active && Array.isArray(a.photos) && a.photos.length > 0)
      .map((a) => ({ slug: a.id, title: a.title, caption: a.caption ?? "", photos: a.photos }));
  } catch {
    return WORK_ALBUMS;
  }
}
