"use server";

import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Booking, Order } from "@/lib/types";

export async function updateBookingStatus(bookingId: string, status: Booking["status"]) {
  const membership = await requireMembership();
  const supabase = await createClient();
  await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .eq("tenant_id", membership.tenant.id);
  revalidatePath("/panel/actividad");
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const membership = await requireMembership();
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("tenant_id", membership.tenant.id);
  revalidatePath("/panel/actividad");
}
