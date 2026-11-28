"use server";

import { requireMembership } from "@/lib/auth";
import { updateRows } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Booking, Order } from "@/lib/types";

export async function updateBookingStatus(bookingId: string, status: Booking["status"]) {
  const membership = await requireMembership();
  await updateRows("bookings", { status }, { id: bookingId, tenant_id: membership.tenant.id });
  revalidatePath("/panel/actividad");
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const membership = await requireMembership();
  await updateRows("orders", { status }, { id: orderId, tenant_id: membership.tenant.id });
  revalidatePath("/panel/actividad");
  revalidatePath("/panel/pedidos");
}
