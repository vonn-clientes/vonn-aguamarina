"use server";

import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markMessageRead(messageId: string) {
  const membership = await requireMembership();
  const supabase = await createClient();
  await supabase
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", messageId)
    .eq("tenant_id", membership.tenant.id);
  revalidatePath("/panel/mensajes");
}
