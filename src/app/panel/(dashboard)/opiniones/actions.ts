"use server";

import { requireMembership } from "@/lib/auth";
import { deleteRows, updateRows } from "@/lib/db";
import { revalidatePath } from "next/cache";

function refresh() {
  revalidatePath("/panel/opiniones");
  revalidatePath("/tratamientos", "layout");
  revalidatePath("/tienda", "layout");
}

export async function setReviewVisible(id: string, visible: boolean) {
  const m = await requireMembership();
  await updateRows("reviews", { visible }, { id, tenant_id: m.tenant.id });
  refresh();
}

export async function deleteReview(id: string) {
  const m = await requireMembership();
  await deleteRows("reviews", { id, tenant_id: m.tenant.id });
  refresh();
}
