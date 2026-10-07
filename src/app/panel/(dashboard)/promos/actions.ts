"use server";

import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function parse(formData: FormData) {
  const priceRaw = String(formData.get("price") || "").replace(",", ".");
  return {
    title: String(formData.get("title") || "").trim(),
    // un ítem por línea
    items: String(formData.get("items") || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    description: String(formData.get("description") || "").trim() || null,
    note: String(formData.get("note") || "").trim() || null,
    price: priceRaw ? Number(priceRaw) : null,
    starts_on: String(formData.get("starts_on") || "") || null,
    ends_on: String(formData.get("ends_on") || "") || null,
  };
}

function refresh() {
  revalidatePath("/panel/promos");
  revalidatePath("/");
}

export async function addPromo(formData: FormData) {
  const m = await requireMembership();
  const supabase = await createClient();
  await supabase.from("promos").insert({ tenant_id: m.tenant.id, ...parse(formData), sort_order: Date.now() % 1000000 });
  refresh();
}

export async function updatePromo(id: string, formData: FormData) {
  const m = await requireMembership();
  const supabase = await createClient();
  await supabase.from("promos").update(parse(formData)).eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
}

export async function togglePromo(id: string, active: boolean) {
  const m = await requireMembership();
  const supabase = await createClient();
  await supabase.from("promos").update({ active }).eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
}

export async function deletePromo(id: string) {
  const m = await requireMembership();
  const supabase = await createClient();
  await supabase.from("promos").delete().eq("id", id).eq("tenant_id", m.tenant.id);
  refresh();
}
