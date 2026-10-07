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
