"use server";

import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCatalogItem(formData: FormData) {
  const membership = await requireMembership();
  const supabase = await createClient();

  const priceRaw = String(formData.get("price") || "").replace(",", ".");
  const durationRaw = String(formData.get("duration_minutes") || "");

  await supabase.from("catalog_items").insert({
    tenant_id: membership.tenant.id,
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || "") || null,
    price: priceRaw ? Number(priceRaw) : null,
    duration_minutes: durationRaw ? Number(durationRaw) : null,
    category: String(formData.get("category") || "") || null,
  });

  revalidatePath("/panel/catalogo");
  revalidatePath("/");
}

export async function toggleCatalogItem(itemId: string, active: boolean) {
  const membership = await requireMembership();
  const supabase = await createClient();

  await supabase
    .from("catalog_items")
    .update({ active })
    .eq("id", itemId)
    .eq("tenant_id", membership.tenant.id);

  revalidatePath("/panel/catalogo");
  revalidatePath("/");
}

export async function deleteCatalogItem(itemId: string) {
  const membership = await requireMembership();
  const supabase = await createClient();

  await supabase.from("catalog_items").delete().eq("id", itemId).eq("tenant_id", membership.tenant.id);

  revalidatePath("/panel/catalogo");
  revalidatePath("/");
}

export async function updateCatalogItem(itemId: string, formData: FormData) {
  const membership = await requireMembership();
  const supabase = await createClient();

  const priceRaw = String(formData.get("price") || "").replace(",", ".");
  const durationRaw = String(formData.get("duration_minutes") || "");

  await supabase
    .from("catalog_items")
    .update({
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || "") || null,
      price: priceRaw ? Number(priceRaw) : null,
      duration_minutes: durationRaw ? Number(durationRaw) : null,
      category: String(formData.get("category") || "") || null,
    })
    .eq("id", itemId)
    .eq("tenant_id", membership.tenant.id);

  revalidatePath("/panel/catalogo");
  revalidatePath("/");
}
