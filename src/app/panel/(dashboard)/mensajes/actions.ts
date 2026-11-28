"use server";

import { requireMembership } from "@/lib/auth";
import { updateRows } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markMessageRead(messageId: string) {
  const membership = await requireMembership();
  await updateRows("contact_messages", { is_read: true }, { id: messageId, tenant_id: membership.tenant.id });
  revalidatePath("/panel/mensajes");
}
