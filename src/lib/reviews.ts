import { query } from "@/lib/db";
import type { Review } from "@/lib/types";

export async function getReviews(itemId: string): Promise<Review[]> {
  return query<Review>(
    "select * from reviews where item_id = $1 and visible = true order by created_at desc limit 50",
    [itemId],
  );
}

export function summarize(reviews: Review[]) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, avg: Math.round(avg * 10) / 10 };
}

export type ShowcaseReview = { id: string; author: string; rating: number; comment: string; source: "google" | "web"; detail?: string };

/** Opiniones visibles de todo el sitio (para el carrusel de la portada). */
export async function getSiteReviews(tenantId: string): Promise<ShowcaseReview[]> {
  const [rv, items] = await Promise.all([
    query<{ id: string; author: string; rating: number; comment: string; item_id: string | null }>(
      "select id, author, rating, comment, item_id from reviews where tenant_id = $1 and visible = true and rating >= 4 order by created_at desc limit 30",
      [tenantId],
    ),
    query<{ id: string; name: string }>("select id, name from catalog_items where tenant_id = $1", [tenantId]),
  ]);
  const names = new Map(items.map((i) => [i.id, i.name]));
  return rv.map((r) => ({ id: r.id, author: r.author, rating: r.rating, comment: r.comment, source: "web" as const, detail: r.item_id ? names.get(r.item_id) : "Opinión del lugar" }));
}
