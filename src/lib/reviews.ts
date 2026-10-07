import { createClient } from "@supabase/supabase-js";
import type { Review } from "@/lib/types";

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getReviews(itemId: string): Promise<Review[]> {
  const { data } = await client()
    .from("reviews")
    .select("*")
    .eq("item_id", itemId)
    .eq("visible", true)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as Review[]) ?? [];
}

export function summarize(reviews: Review[]) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, avg: Math.round(avg * 10) / 10 };
}

export type ShowcaseReview = { id: string; author: string; rating: number; comment: string; source: "google" | "web"; detail?: string };

/** Opiniones visibles de todo el sitio (para el carrusel de la portada). */
export async function getSiteReviews(tenantId: string): Promise<ShowcaseReview[]> {
  const sb = client();
  const [{ data: rv }, { data: items }] = await Promise.all([
    sb.from("reviews").select("id, author, rating, comment, item_id").eq("tenant_id", tenantId).eq("visible", true).gte("rating", 4).order("created_at", { ascending: false }).limit(30),
    sb.from("catalog_items").select("id, name").eq("tenant_id", tenantId),
  ]);
  const names = new Map((items ?? []).map((i) => [i.id as string, i.name as string]));
  return (rv ?? []).map((r) => ({ id: r.id, author: r.author, rating: r.rating, comment: r.comment, source: "web" as const, detail: r.item_id ? names.get(r.item_id) : "Opinión del lugar" }));
}
