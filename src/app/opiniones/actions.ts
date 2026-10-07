"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Guarda una opinión. Freno anti-spam: máximo 8 por hora en cada tratamiento o producto.
export async function submitReview(input: { itemId: string; author: string; rating: number; comment: string; website: string; path: string }) {
  if (input.website) return { ok: true }; // un bot: fingimos éxito
  const author = input.author.trim().slice(0, 60);
  const comment = input.comment.trim().slice(0, 600);
  const rating = Math.round(Number(input.rating));
  if (!author || !comment || rating < 1 || rating > 5) return { ok: false, error: "Completá tu nombre, las estrellas y tu opinión." };

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data: item } = await supabase.from("catalog_items").select("id, tenant_id").eq("id", input.itemId).eq("active", true).maybeSingle();
  if (!item) return { ok: false, error: "No encontramos este tratamiento." };

  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("item_id", item.id).gte("created_at", since);
  if ((count ?? 0) >= 8) return { ok: false, error: "Hay muchas opiniones en poco tiempo. Probá de nuevo en un rato." };

  const { error } = await supabase.from("reviews").insert({ tenant_id: item.tenant_id, item_id: item.id, author, rating, comment });
  if (error) return { ok: false, error: "No pudimos guardar tu opinión. Probá de nuevo." };
  revalidatePath(input.path.startsWith("/") ? input.path : "/");
  return { ok: true };
}
