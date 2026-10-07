"use server";

import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function refresh() {
  revalidatePath("/panel/opiniones");
  revalidatePath("/tratamientos", "layout");
  revalidatePath("/tienda", "layout");
}

export async function setReviewVisible(id: string, visible: boolean) {
  const m = await requireMembership();
  const supabase = await createClient();
  await supabase.from("reviews").update({ visible }).eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
}

export async function deleteReview(id: string) {
  const m = await requireMembership();
  const supabase = await createClient();
  await supabase.from("reviews").delete().eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
}
