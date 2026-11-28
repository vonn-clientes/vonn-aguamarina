"use server";

import { insertRow, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SITE } from "@/lib/site";

// Guarda una opinión. Freno anti-spam: máximo 8 por hora en cada tratamiento o producto.
export async function submitReview(input: { itemId: string | null; author: string; rating: number; comment: string; website: string; path: string }) {
  if (input.website) return { ok: true }; // un bot: fingimos éxito
  const author = input.author.trim().slice(0, 60);
  const comment = input.comment.trim().slice(0, 600);
  const rating = Math.round(Number(input.rating));
  if (!author || !comment || rating < 1 || rating > 5) return { ok: false, error: "Completá tu nombre, las estrellas y tu opinión." };

  try {
    // Sin itemId = opinión general del lugar.
    let item: { id: string | null; tenant_id: string } | null = null;
    if (input.itemId) {
      item = /^[0-9a-f-]{36}$/i.test(input.itemId)
        ? await queryOne<{ id: string; tenant_id: string }>("select id, tenant_id from catalog_items where id = $1 and active = true", [input.itemId])
        : null;
    } else {
      const t = await queryOne<{ id: string }>("select id from tenants where slug = $1 and status = 'activo'", [SITE.slug]);
      item = t ? { id: null, tenant_id: t.id } : null;
    }
    if (!item) return { ok: false, error: "No encontramos este tratamiento." };

    const since = new Date(Date.now() - 3600_000).toISOString();
    const cnt = await queryOne<{ n: number }>(
      "select count(*)::int as n from reviews where tenant_id = $1 and created_at >= $2 and item_id is not distinct from $3::uuid",
      [item.tenant_id, since, item.id],
    );
    if ((cnt?.n ?? 0) >= 8) return { ok: false, error: "Hay muchas opiniones en poco tiempo. Probá de nuevo en un rato." };

    try {
      await insertRow("reviews", { tenant_id: item.tenant_id, item_id: item.id, author, rating, comment });
    } catch (e) {
      if (item.id) throw e;
      // Si la base todavía exige un tratamiento, se guarda en el primero del catálogo.
      const first = await queryOne<{ id: string }>("select id from catalog_items where tenant_id = $1 and active = true order by sort_order limit 1", [item.tenant_id]);
      if (!first) throw e;
      await insertRow("reviews", { tenant_id: item.tenant_id, item_id: first.id, author, rating, comment });
    }
  } catch {
    return { ok: false, error: "No pudimos guardar tu opinión. Probá de nuevo." };
  }
  revalidatePath(input.path.startsWith("/") ? input.path : "/");
  return { ok: true };
}
